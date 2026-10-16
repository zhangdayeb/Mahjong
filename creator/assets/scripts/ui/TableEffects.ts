import { _decorator, Component, Node, UITransform, UIOpacity, Sprite, SpriteFrame, JsonAsset, Graphics, Color, Label, Rect, Size, Vec2, resources, gfx, isValid } from 'cc';
import * as UI from './UI';
import { AssetCatalog } from './AssetCatalog';

const { ccclass } = _decorator;
const TAU = Math.PI * 2;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const out = (v: number) => 1 - (1 - clamp(v)) ** 3;
const smooth = (v: number) => { const p = clamp(v); return p * p * (3 - 2 * p); };
const pulse = (time: number, start: number, end: number) => time < start || time > end ? 0 : Math.sin(clamp((time - start) / (end - start)) * Math.PI);
const fade = (time: number, duration: number, enter = .08, exit = .23) => Math.min(clamp(time / enter), clamp((duration - time) / exit));
const position = (x: number, y: number): Vec2 => new Vec2(x - UI.W / 2, UI.H / 2 - y);
export const ACTION_POINTS: ReadonlyArray<ReadonlyArray<number>> = [[640, 342], [914, 286], [640, 181], [366, 286]];
export const PROFILE_POINTS: ReadonlyArray<ReadonlyArray<number>> = [[85, 437], [1191, 255], [932, 73], [85, 246]];
export const TABLE_EFFECT_TIMINGS = Object.freeze({ opening: 2300, exchange: 1250, dingque: 900, peng: 1100, gang: 1100, hu: 1100, zimo: 1120, qgh: 1734, fan: 2334, payout: 1000, wind: 1167, rain: 2167, reveal: 1050 });

export interface EffectHandle {
  durationMs: number;
  lockingMs: number;
  readonly remainingMs: number;
  readonly remainingLockMs: number;
  finished: Promise<{ cancelled: boolean }>;
  cancel(): void;
  pause(): void;
  resume(): void;
}
export interface PresentedAction {
  action: string;
  seat?: number;
  tile?: number;
  ambient?: 'wind' | 'rain' | null;
  gangType?: string;
  fan?: { name?: string; multiple?: number; [key: string]: unknown };
}
export interface DealTarget { seat: number; value: number; x: number; y: number; width: number; height: number; index: number }
interface FontGlyph { xOffset: number; yOffset: number; xAdvance: number; rect: { x: number; y: number; width: number; height: number } }
interface FontDefinition { fontDefDictionary: Record<string, FontGlyph> }
interface AnimationJob {
  node: Node; elapsed: number; durationMs: number; lockingMs: number; paused: boolean; done: boolean;
  draw: (time: number) => void; resolve: (value: { cancelled: boolean }) => void;
}

@ccclass('LianzhuoTableEffectClock')
class TableEffectClock extends Component {
  tick: (dt: number) => void = () => {};
  release: () => void = () => {};
  update(dt: number) { this.tick(Math.min(.1, Math.max(0, dt))); }
  onDestroy() { this.release(); }
}

/** Every visible effect is drawn by Cocos renderers on the actual game canvas. */
export class TableEffects {
  readonly root: Node;
  readonly ready: Promise<void>;
  private frames = new Map<string, SpriteFrame>();
  private glyphFrames = new Map<string, SpriteFrame>();
  private retained = new Set<SpriteFrame | JsonAsset>();
  private fontDefinitions: Record<string, FontDefinition> = {};
  private jobs = new Set<AnimationJob>();
  private clock: TableEffectClock;
  private disposed = false;
  private paused = false;

  constructor(parent: Node) {
    this.root = UI.box(parent, 'NativeTableEffects', 0, 0, UI.W, UI.H);
    this.clock = this.root.addComponent(TableEffectClock);
    this.clock.tick = dt => this.tick(dt);
    this.clock.release = () => this.dispose(false);
    const paths = ([] as string[]).concat(Object.values(AssetCatalog.effects.actions), Object.values(AssetCatalog.effects.fonts), [AssetCatalog.effects.glow, AssetCatalog.effects.sweep, AssetCatalog.effects.huRing, AssetCatalog.effects.huElectric, AssetCatalog.effects.coin, AssetCatalog.tileBody, AssetCatalog.tileBack]);
    for (let suit = 1; suit <= 3; suit++) for (let rank = 1; rank <= 9; rank++) paths.push(AssetCatalog.tile(suit * 10 + rank));
    for (const face of [51, 52, 53]) paths.push(AssetCatalog.tile(face));
    const pictures = Promise.all(paths.map(path => new Promise<void>((resolve, reject) => resources.load(path + '/spriteFrame', SpriteFrame, (error, frame) => {
      if (error) { reject(error); return; }
      if (!this.disposed) { frame.addRef(); this.retained.add(frame); this.frames.set(path, frame); }
      resolve();
    }))));
    const fonts = new Promise<void>((resolve, reject) => resources.load(AssetCatalog.effects.fontDefinitions, JsonAsset, (error, data) => {
      if (error) { reject(error); return; }
      if (!this.disposed) { data.addRef(); this.retained.add(data); this.fontDefinitions = data.json.fonts; }
      resolve();
    }));
    this.ready = Promise.all([pictures, fonts]).then(() => {});
    // Failures remain observable through ready; callers can show a loading
    // error instead of silently substituting browser artwork.
    void this.ready.catch(error => console.warn('牌桌特效资源加载失败', String(error)));
  }

  get remainingLockMs(): number { return Array.from(this.jobs).reduce((max, job) => Math.max(max, job.lockingMs - job.elapsed), 0); }
  get activeCount(): number { return this.jobs.size; }
  pause() { this.paused = true; }
  resume() { this.paused = false; }
  clear() { for (const job of Array.from(this.jobs)) this.finish(job, true); }
  dispose(removeRoot = true) {
    if (this.disposed) return;
    this.disposed = true; this.clear();
    this.clock.tick = () => {}; this.clock.release = () => {};
    for (const frame of Array.from(this.glyphFrames.values())) frame.destroy();
    this.glyphFrames.clear(); this.frames.clear();
    for (const asset of Array.from(this.retained)) asset.decRef();
    this.retained.clear();
    if (removeRoot && isValid(this.root)) { this.root.removeFromParent(); this.root.destroy(); }
  }

  action(event: PresentedAction, deltas: number[] = []): EffectHandle {
    const action = event.action === 'redKong' || event.action === 'red-kong' ? 'gang' : event.action;
    if (action === 'reveal') return this.reveal(event.seat || 0);
    const words: Record<string, string> = { peng: '碰', gang: '杠', hu: '胡', zimo: '自摸', qgh: '抢杠胡' };
    const word = words[action]; if (!word) return this.skip();
    const seat = Math.max(0, Math.min(3, Math.floor(event.seat || 0)));
    const actionSeconds = ((TABLE_EFFECT_TIMINGS as any)[action] || 1100) / 1000;
    const bigFan = event.fan?.name && event.fan.name !== '平胡' ? event.fan.name : '';
    const fanStart = actionSeconds * .78, fanEnd = bigFan ? fanStart + TABLE_EFFECT_TIMINGS.fan / 1000 : actionSeconds;
    const payoutStart = fanEnd, pays = deltas.some(value => Number.isFinite(value) && value !== 0);
    const lock = Math.ceil((pays ? payoutStart + 1 : fanEnd) * 1000);
    const ambientSeconds = event.ambient === 'rain' ? TABLE_EFFECT_TIMINGS.rain / 1000 : event.ambient === 'wind' ? TABLE_EFFECT_TIMINGS.wind / 1000 : 0;
    return this.job(Math.max(lock, ambientSeconds * 1000), lock, host => {
      const [x, y] = ACTION_POINTS[seat];
      const main = this.group(host, 'Action-' + action, x, y);
      const aura = this.graph(main, 'ActionLight');
      const glow = this.image(main, 'NativeBurstGlow', AssetCatalog.effects.glow, -210, -160, 420, 320, true);
      const letter = this.bitmap(main, word, 'fan', -205, -84, 410, action === 'qgh' ? 145 : 168);
      const wordOpacity = this.opacity(letter);
      const native = this.image(main, 'ActionSeatStamp', (AssetCatalog.effects.actions as any)[action], -126, 98, 252, action === 'qgh' ? 100 : 113);
      const stampOpacity = this.opacity(native); stampOpacity.opacity = 0;
      const glint = this.image(main, 'ActionGlint', AssetCatalog.effects.sweep, -190, -34, 280, 70, true);
      const lightning = this.graph(main, 'HuLightning');
      const ring = this.image(main, 'NativeHuRing', AssetCatalog.effects.huRing, -108, -102, 216, 204);
      const ringOpacity = this.opacity(ring); ringOpacity.opacity = 0;
      let fanDraw: ((t: number) => void) | null = null;
      if (bigFan) fanDraw = this.banner(host, bigFan, event.fan?.multiple || 1, seat, fanStart);
      let ambientDraw: ((t: number) => void) | null = null;
      if (event.ambient) ambientDraw = this.ambient(host, event.ambient);
      const payoutDraw = pays ? this.payoutNodes(host, deltas, payoutStart) : null;
      return time => {
        const alpha = fade(time, actionSeconds, .035, .22);
        const scale = time < .14 ? .38 + out(time / .14) * .77 : time < .27 ? 1.15 - smooth((time - .14) / .13) * .15 : 1 + Math.sin(time * 26) * .008 * (1 - clamp(time / actionSeconds));
        letter.setScale(scale, scale, 1); letter.angle = Math.sin(time * 16) * 1.25 * (1 - clamp(time / .35));
        wordOpacity.opacity = alpha * 255;
        const gleam = Math.sin(time * 12) * .025 + 1;
        glow.setScale((.62 + out(time / .28) * .74) * gleam, (.58 + out(time / .3) * .65) * gleam, 1);
        this.opacity(glow).opacity = alpha * (action === 'peng' ? 135 : 205);
        this.opacity(glint).opacity = pulse(time, .09, .46) * 210;
        glint.setPosition(-230 + clamp((time - .08) / .38) * 470, 12, 0); glint.angle = -14;
        stampOpacity.opacity = fade(time - .35, actionSeconds - .35, .1, .18) * 235;
        native.setScale(.82 + out((time - .35) / .13) * .18, .82 + out((time - .35) / .13) * .18, 1);
        this.drawBurst(aura, time, actionSeconds, action === 'hu' || action === 'zimo' || action === 'qgh' ? 72 : 38);
        lightning.clear();
        if (['hu', 'zimo', 'qgh'].includes(action)) {
          ringOpacity.opacity = alpha * 190; ring.angle = time * 53;
          ring.setScale(.46 + out(time / .3) * 1.22, .40 + out(time / .3) * .94, 1);
          this.drawLightning(lightning, time, actionSeconds);
        }
        fanDraw?.(time); ambientDraw?.(time); payoutDraw?.(time);
      };
    });
  }

  payout(deltas: number[], delayMs = 0): EffectHandle {
    if (!deltas.some(value => Number.isFinite(value) && value !== 0)) return this.skip();
    const duration = delayMs + TABLE_EFFECT_TIMINGS.payout;
    return this.job(duration, duration, host => this.payoutNodes(host, deltas, delayMs / 1000));
  }

  discard(value: number, seat: number, target: ReadonlyArray<number>, targetWidth = 24, targetHeight = 35): EffectHandle {
    const starts = [[641, 568], [1082, 286], [640, 86], [190, 285]];
    return this.job(430, 430, host => {
      const [x, y] = starts[seat] || starts[0];
      const tile = this.tile(host, value, x - 30, y - 42, 60, 84, 'FlyingDiscard', false);
      const start = new Vec2(tile.position.x, tile.position.y), end = position(target[0] + targetWidth / 2, target[1] + targetHeight / 2);
      const control = new Vec2((start.x + end.x) / 2, Math.max(start.y, end.y) + 76);
      const trail = this.graph(host, 'DiscardWarmTrail');
      return time => {
        const p = smooth(time / .4);
        const x = (1 - p) ** 2 * start.x + 2 * (1 - p) * p * control.x + p * p * end.x;
        const y = (1 - p) ** 2 * start.y + 2 * (1 - p) * p * control.y + p * p * end.y;
        tile.setPosition(x, y, 0); tile.setScale(1 + Math.sin(p * Math.PI) * .10 - p * (1 - targetWidth / 60), 1 + Math.sin(p * Math.PI) * .10 - p * (1 - targetHeight / 84), 1);
        tile.angle = Math.sin(p * Math.PI) * (seat % 2 ? 12 : -7); this.opacity(tile).opacity = time > .40 ? 0 : 255;
        trail.clear(); trail.strokeColor = new Color(255, 225, 140, Math.round(Math.sin(p * Math.PI) * 90)); trail.lineWidth = 3;
        trail.moveTo(start.x, start.y); trail.quadraticCurveTo(control.x, control.y, x, y); trail.stroke();
        if (time > .31) { const a = pulse(time, .31, .43); trail.strokeColor = new Color(255, 231, 150, Math.round(a * 200)); trail.lineWidth = 2; trail.ellipse(end.x, end.y, 14 + a * 16, 6 + a * 7); trail.stroke(); }
      };
    });
  }

  opening(targets: DealTarget[] = []): EffectHandle {
    return this.job(TABLE_EFFECT_TIMINGS.opening, TABLE_EFFECT_TIMINGS.opening, host => {
      const intro = this.group(host, 'OpeningFlare', 640, 274);
      const rays = this.graph(intro, 'OpeningGoldRays');
      const title = this.bitmap(intro, '开局', 'fan', -154, -85, 308, 164);
      const label = UI.text(intro, 'OpeningBrand', '联桌相逢 · 好牌上桌', -175 + UI.W / 2, 137 + UI.H / 2, 350, 38, 22, '#fff0ad');
      // UI.text uses parent content size; the group is stage-sized and centered
      // at the action point, so coordinates above place this caption locally.
      const titleAlpha = this.opacity(title), brandAlpha = this.opacity(label.node);
      const fan = this.image(intro, 'OpeningGlow', AssetCatalog.effects.glow, -225, -165, 450, 330, true);
      fan.setSiblingIndex(0);
      const groups = targets.filter(target => target.index % 4 === 0).map(target => {
        const tile = this.tile(host, target.value, 620, 258, target.width, target.height, 'Deal-' + target.seat + '-' + target.index, target.seat !== 0);
        const start = tile.position.clone(), end = position(target.x + target.width / 2, target.y + target.height / 2);
        return { tile, start, end, seat: target.seat, delay: .68 + Math.floor(target.index / 4) * .22 + target.seat * .035 };
      });
      return time => {
        titleAlpha.opacity = fade(time, 1.22, .05, .22) * 255; brandAlpha.opacity = fade(time, 1.2, .13, .25) * 255;
        const scale = .45 + out(time / .19) * .65 - smooth((time - .19) / .15) * .10;
        title.setScale(scale, scale, 1); this.opacity(fan).opacity = fade(time, 1.15, .045, .28) * 215;
        fan.setScale(.62 + out(time / .35) * .72, .62 + out(time / .35) * .72, 1);
        this.drawBurst(rays, time, 1.18, 58);
        for (const group of groups) {
          const p = smooth((time - group.delay) / .49), at = time - group.delay;
          this.opacity(group.tile).opacity = at < 0 || p >= 1 ? 0 : 255;
          const cx = (group.start.x + group.end.x) / 2, cy = (group.start.y + group.end.y) / 2 + 82;
          group.tile.setPosition((1 - p) ** 2 * group.start.x + 2 * (1 - p) * p * cx + p * p * group.end.x, (1 - p) ** 2 * group.start.y + 2 * (1 - p) * p * cy + p * p * group.end.y, 0);
          group.tile.angle = Math.sin(p * Math.PI) * (group.seat % 2 ? 15 : -10);
          group.tile.setScale(.65 + Math.sin(p * Math.PI) * .42, .65 + Math.sin(p * Math.PI) * .42, 1);
        }
      };
    });
  }

  exchange(packs: number[][] = [], direction: 'clockwise' | 'counterclockwise' | 'opposite' = 'clockwise'): EffectHandle {
    return this.job(TABLE_EFFECT_TIMINGS.exchange, TABLE_EFFECT_TIMINGS.exchange, host => {
      const starts = [[640, 448], [922, 270], [640, 137], [360, 270]];
      const offset = direction === 'clockwise' ? 3 : direction === 'counterclockwise' ? 1 : 2;
      const label = UI.text(host, 'ExchangeDirection', ({ clockwise: '顺时针换牌', counterclockwise: '逆时针换牌', opposite: '对家换牌' })[direction], 455, 324, 370, 47, 29, '#fff0a5');
      label.enableOutline = true; label.outlineWidth = 2; label.outlineColor = UI.color('#714a25');
      const arrows = this.graph(host, 'ExchangeGoldArrows');
      const nodes = starts.map(([x, y], seat) => {
        const pack = UI.box(host, 'ExchangePack-' + seat, x - 83, y - 46, 166, 92);
        for (let i = 0; i < 3; i++) this.tile(pack, packs[seat]?.[i] || 57, i * 51, 4, 47, 70, 'ExchangeTile-' + i, seat !== 0);
        return { pack, start: position(x, y), end: position(starts[(seat + offset) % 4][0], starts[(seat + offset) % 4][1]) };
      });
      return time => {
        const a = fade(time, 1.25, .1, .18); this.opacity(label.node).opacity = a * 255;
        arrows.clear(); arrows.strokeColor = new Color(255, 223, 109, Math.round(a * 155)); arrows.lineWidth = 4;
        for (const node of nodes) {
          const p = smooth((time - .17) / .84), bend = direction === 'opposite' ? 50 : direction === 'clockwise' ? -72 : 72;
          const cx = (node.start.x + node.end.x) * .20 + bend, cy = (node.start.y + node.end.y) * .20 + 24;
          node.pack.setPosition((1 - p) ** 2 * node.start.x + 2 * (1 - p) * p * cx + p * p * node.end.x, (1 - p) ** 2 * node.start.y + 2 * (1 - p) * p * cy + p * p * node.end.y, 0);
          node.pack.setScale(.78 + Math.sin(p * Math.PI) * .20, .78 + Math.sin(p * Math.PI) * .20, 1);
          node.pack.angle = Math.sin(p * Math.PI) * (direction === 'clockwise' ? -8 : 8);
          this.opacity(node.pack).opacity = a * 255;
          arrows.moveTo(node.start.x * .65, node.start.y * .65); arrows.bezierCurveTo(cx, cy, cx, cy, node.end.x * .65, node.end.y * .65);
        }
        arrows.stroke();
      };
    });
  }

  dingque(missing: number[] = []): EffectHandle {
    return this.job(TABLE_EFFECT_TIMINGS.dingque, TABLE_EFFECT_TIMINGS.dingque, host => {
      const plaques = PROFILE_POINTS.map(([x, y], seat) => {
        const plate = UI.panel(host, 'QueChoice-' + seat, x + (seat === 1 ? -91 : 37), y - 20, 51, 51, ['#000000', '#ba6450', '#4d9579', '#5d8eb4'][missing[seat] || 1], '#fff0ba', 25);
        const label = UI.text(plate, 'QueSuit', ['', '万', '条', '筒'][missing[seat] || 0] || '缺', 1, 1, 49, 49, 30, '#fff7c5'); label.isBold = true;
        const sparks = this.graph(plate, 'QueSpark'); return { plate, sparks };
      });
      const text = UI.text(host, 'QueDone', '定缺完成 · 开始出牌', 431, 347, 419, 44, 28, '#ffe493');
      return time => {
        this.opacity(text.node).opacity = fade(time, .9, .08, .18) * 255;
        plaques.forEach((plaque, seat) => {
          const at = time - seat * .025, scale = .38 + out(at / .18) * .76 - smooth((at - .18) / .18) * .14;
          plaque.plate.setScale(scale, scale, 1); this.opacity(plaque.plate).opacity = fade(at, .9, .04, .15) * 255;
          this.drawBurst(plaque.sparks, at, .75, 13, .26);
        });
      };
    });
  }

  reveal(seat: number): EffectHandle {
    return this.job(TABLE_EFFECT_TIMINGS.reveal, TABLE_EFFECT_TIMINGS.reveal, host => {
      const [x, y] = ACTION_POINTS[seat] || ACTION_POINTS[0], at = this.group(host, 'RevealLight', x, y);
      const text = this.bitmap(at, '明牌', 'fan', -174, -68, 348, 131), g = this.graph(at, 'RevealSpark');
      const note = UI.text(host, 'RevealMultiple', '明牌 ×6', x - 170, y + 77, 340, 43, 27, '#ffe9a6');
      return time => { const a = fade(time, 1.05); this.opacity(text).opacity = a * 255; this.opacity(note.node).opacity = a * 255; text.setScale(.5 + out(time / .2) * .5, .5 + out(time / .2) * .5, 1); this.drawBurst(g, time, 1.05, 40); };
    });
  }

  private banner(host: Node, name: string, multiple: number, seat: number, delay: number): (time: number) => void {
    const group = this.group(host, 'FanBanner', 640, 292);
    const board = UI.panel(group, 'FanCarvedPlate', 340, 224, 600, 184, '#582b1ddd', '#ffda6f', 28);
    const trim = this.graph(board, 'LianzhuoCarvedBorder');
    trim.strokeColor = new Color(255, 216, 106, 210); trim.lineWidth = 2;
    trim.roundRect(-286, -78, 572, 156, 20); trim.stroke();
    trim.strokeColor = new Color(232, 173, 58, 75); trim.lineWidth = 1;
    for (let x = -270; x < 280; x += 28) { trim.moveTo(x, -70); trim.lineTo(x + 80, 70); } trim.stroke();
    for (const side of [-1, 1]) { trim.moveTo(side * 266, -51); trim.lineTo(side * 248, -51); trim.lineTo(side * 248, -65); trim.moveTo(side * 266, 51); trim.lineTo(side * 248, 51); trim.lineTo(side * 248, 65); } trim.stroke();
    const word = this.bitmap(board, name, 'fan', 32, 24, 536, 112);
    const detail = UI.text(board, 'FanMultiplier', `${multiple}倍 · 玩家${seat + 1}`, 94, 139, 410, 32, 24, '#fff0b7'); detail.isBold = true;
    const seal = UI.panel(board, 'LianzhuoSeal', 536, 132, 39, 32, '#a4492a', '#ffce6e', 5);
    UI.text(seal, 'SealText', '联桌', 1, 1, 37, 30, 14, '#fff5c7');
    const sweep = this.image(board, 'BannerSweep', AssetCatalog.effects.sweep, -150, 13, 350, 134, true);
    const rimGlow = this.image(group, 'BannerBackGlow', AssetCatalog.effects.glow, -343, -125, 686, 250, true); rimGlow.setSiblingIndex(0);
    const stars = this.graph(group, 'FanGoldParticles');
    return time => {
      const t = time - delay, duration = TABLE_EFFECT_TIMINGS.fan / 1000, a = fade(t, duration, .12, .28);
      this.opacity(group).opacity = a * 255;
      const s = .58 + out(t / .23) * .50 - smooth((t - .23) / .20) * .08;
      board.setScale(s, s, 1); board.angle = Math.sin(Math.max(0, t) * 9) * .65 * (1 - clamp(t / .6));
      sweep.setPosition(-350 + clamp((t - .29) / .85) * 760, 6, 0); sweep.angle = -9; this.opacity(sweep).opacity = pulse(t, .28, 1.15) * 235;
      this.opacity(rimGlow).opacity = a * (80 + Math.sin(t * 7) * 30);
      this.drawBurst(stars, t, duration, 54, 1.43);
      word.angle = Math.sin(t * 5) * .18;
    };
  }

  private ambient(host: Node, kind: 'wind' | 'rain'): (time: number) => void {
    const group = this.group(host, kind === 'wind' ? 'ExposedKongWind' : 'ConcealedKongRain', 640, 308);
    const graphics = this.graph(group, 'NativeKongAtmosphere');
    const duration = kind === 'wind' ? TABLE_EFFECT_TIMINGS.wind / 1000 : TABLE_EFFECT_TIMINGS.rain / 1000;
    return time => {
      graphics.clear(); const a = fade(time, duration, .06, .3); if (!a) return;
      if (kind === 'wind') {
        for (let strand = 0; strand < 8; strand++) {
          graphics.strokeColor = new Color(190 + strand * 6, 237, 218, Math.round(a * (strand % 2 ? 110 : 195)));
          graphics.lineWidth = strand % 2 ? 7 : 3;
          for (let point = 0; point <= 64; point++) {
            const p = point / 64, angle = p * TAU * 1.12 + time * 7 + strand * .76;
            const radius = (220 - 115 * p) * (.4 + out(time / .22) * .6), x = Math.cos(angle) * radius, y = -158 + p * 310 + Math.sin(angle) * 30;
            if (!point) graphics.moveTo(x, y); else graphics.lineTo(x, y);
          }
          graphics.stroke();
        }
        graphics.strokeColor = new Color(255, 218, 120, Math.round(a * 190)); graphics.lineWidth = 2;
        for (let i = 0; i < 24; i++) { const p = (time * .83 + i / 24) % 1, r = 200 * (1 - p), angle = i * 2.399 + time * 7; graphics.moveTo(Math.cos(angle) * r, -130 + p * 290); graphics.lineTo(Math.cos(angle + .12) * r, -128 + p * 290); } graphics.stroke();
      } else {
        for (let i = 0; i < 78; i++) {
          const p = (time * 1.65 + i * .087) % 1, x = -370 + ((i * 103.71) % 750) - p * 83, y = 258 - p * 523;
          graphics.strokeColor = new Color(173 + i % 20, 221, 247, Math.round(a * (100 + i % 5 * 24))); graphics.lineWidth = 1.2 + i % 3 * .55;
          graphics.moveTo(x, y); graphics.lineTo(x - 7 - i % 3, y - 30 - i % 5 * 6); graphics.stroke();
          if (p > .8) { const r = (p - .8) * 43; graphics.strokeColor = new Color(191, 230, 245, Math.round(a * (1 - (p - .8) / .2) * 130)); graphics.ellipse(x, -218 + i % 4 * 9, r, r * .25); graphics.stroke(); }
        }
      }
    };
  }

  private payoutNodes(host: Node, deltas: number[], delay: number): (time: number) => void {
    const winners = deltas.map((value, seat) => ({ value, seat })).filter(item => item.value > 0);
    const losers = deltas.map((value, seat) => ({ value, seat })).filter(item => item.value < 0);
    const coins: { node: Node; start: Vec2; end: Vec2; control: Vec2; delay: number }[] = [];
    const numbers: { node: Node; start: Vec2 }[] = [];
    for (const item of deltas.map((value, seat) => ({ value, seat })).filter(item => Number.isFinite(item.value) && item.value !== 0)) {
      const [x, y] = ACTION_POINTS[item.seat];
      const node = this.bitmap(host, (item.value > 0 ? '+' : '-') + String(Math.abs(item.value)), item.value > 0 ? 'win' : 'loss', x - 145, y + 79, 290, 42);
      numbers.push({ node, start: new Vec2(node.position.x, node.position.y) });
    }
    winners.forEach((winner, winIndex) => {
      const end = position(PROFILE_POINTS[winner.seat][0], PROFILE_POINTS[winner.seat][1]);
      const sources = losers.length ? losers : [{ seat: winner.seat, value: 0 }];
      sources.forEach((source, sourceIndex) => {
        const start = source.value === 0 ? position(640, 285) : position(PROFILE_POINTS[source.seat][0], PROFILE_POINTS[source.seat][1]);
        for (let i = 0; i < 6; i++) {
          const node = this.image(host, 'PayoutCoin-' + winIndex + '-' + sourceIndex + '-' + i, AssetCatalog.effects.coin, 621, 280, 34, 33);
          coins.push({ node, start: new Vec2(start.x + (i % 3 - 1) * 14, start.y), end, control: new Vec2((start.x + end.x) / 2 + (i % 2 ? 38 : -38), Math.max(start.y, end.y) + 100 + i % 3 * 20), delay: .025 * i + .02 * sourceIndex });
        }
      });
    });
    const sparks = this.graph(host, 'CoinLandingSpark');
    return time => {
      const t = time - delay;
      numbers.forEach(({ node, start }) => { const alpha = fade(t, 1, .08, .2); this.opacity(node).opacity = alpha * 255; node.setPosition(start.x, start.y + out(t / .7) * 23, 0); node.setScale(.8 + out(t / .16) * .2, .8 + out(t / .16) * .2, 1); });
      coins.forEach(coin => {
        const at = t - coin.delay, p = smooth(at / .68); this.opacity(coin.node).opacity = at < 0 || p >= 1 ? 0 : 255;
        coin.node.setPosition((1 - p) ** 2 * coin.start.x + 2 * (1 - p) * p * coin.control.x + p * p * coin.end.x, (1 - p) ** 2 * coin.start.y + 2 * (1 - p) * p * coin.control.y + p * p * coin.end.y, 0);
        coin.node.angle = p * 310; coin.node.setScale((.18 + Math.abs(Math.cos(p * Math.PI * 3)) * .82) * (1 - p * .28), 1 - p * .28, 1);
      });
      sparks.clear();
      const a = pulse(t, .60, 1.01);
      for (const winner of winners) { const end = position(PROFILE_POINTS[winner.seat][0], PROFILE_POINTS[winner.seat][1]); sparks.strokeColor = new Color(255, 231, 135, Math.round(a * 225)); sparks.lineWidth = 2.5; const r = 18 + clamp((t - .60) / .4) * 44; sparks.circle(end.x, end.y, r); sparks.stroke(); }
    };
  }

  private drawBurst(g: Graphics, time: number, duration: number, count: number, stretch = 1) {
    g.clear(); const alpha = fade(time, duration, .025, .28); if (!alpha) return;
    const radius = 26 + out(time / .42) * 155 * stretch;
    for (let layer = 0; layer < 3; layer++) {
      g.strokeColor = new Color(255, 194 + layer * 20, 72 + layer * 45, Math.round(alpha * (layer === 0 ? 45 : 100)));
      g.lineWidth = 12 - layer * 4; g.ellipse(0, 0, radius + layer * 8, radius * .58 + layer * 4); g.stroke();
    }
    for (let i = 0; i < count; i++) {
      const a = i * 2.39996 + .12 * time, born = .015 * (i % 5), p = clamp((time - born) / (.64 + i % 4 * .08)), r = (55 + p * (132 + i % 7 * 14)) * stretch;
      if (time < born || p >= 1) continue;
      const x = Math.cos(a + p * .12) * r, y = Math.sin(a + p * .12) * r * .66, tail = 8 + (1 - p) * 26;
      g.strokeColor = new Color(255, 229, 145, Math.round(alpha * (1 - p) * 245)); g.lineWidth = 1.4 + i % 3;
      g.moveTo(x, y); g.lineTo(x - Math.cos(a) * tail, y - Math.sin(a) * tail * .66); g.stroke();
      if (i % 3 === 0) { g.fillColor = new Color(255, 248, 199, Math.round(alpha * (1 - p) * 240)); g.circle(x, y, 2 + i % 4 * .4); g.fill(); }
    }
  }

  private drawLightning(g: Graphics, time: number, duration: number) {
    const a = fade(time, duration, .03, .25), phase = Math.floor(time * 22);
    for (let branch = 0; branch < 8; branch++) {
      const angle = branch * Math.PI / 4 + .12, length = 135 + branch % 3 * 25;
      for (const stroke of [0, 1, 2]) {
        g.strokeColor = stroke === 0 ? new Color(102, 207, 255, Math.round(a * 82)) : stroke === 1 ? new Color(255, 223, 96, Math.round(a * 175)) : new Color(255, 251, 206, Math.round(a * 250));
        g.lineWidth = stroke === 0 ? 13 : stroke === 1 ? 6 : 2;
        for (let point = 0; point < 8; point++) {
          const r = 55 + point / 7 * length, zig = Math.sin((point + phase + branch) * 9.1) * (8 + point * 1.3), x = Math.cos(angle) * r + Math.sin(angle) * zig, y = Math.sin(angle) * r * .64 - Math.cos(angle) * zig;
          if (!point) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.stroke();
      }
    }
  }

  private group(parent: Node, name: string, x: number, y: number): Node { return UI.box(parent, name, x - UI.W / 2, y - UI.H / 2, UI.W, UI.H); }
  private graph(parent: Node, name: string): Graphics { const node = new Node(name); node.layer = parent.layer; parent.addChild(node); return node.addComponent(Graphics); }
  private opacity(node: Node): UIOpacity { return node.getComponent(UIOpacity) || node.addComponent(UIOpacity); }
  private image(parent: Node, name: string, path: string, x: number, y: number, w: number, h: number, additive = false): Node {
    // Local coordinates are relative to a stage-sized group's center, not its
    // top-left. Callers using a smaller parent pass its own top-left space.
    const size = parent.getComponent(UITransform)?.contentSize;
    const local = size?.width === UI.W && size?.height === UI.H && parent !== this.root && !parent.name.startsWith('Effect-');
    const node = UI.box(parent, name, x + (local ? UI.W / 2 : 0), y + (local ? UI.H / 2 : 0), w, h);
    const sprite = node.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM;
    const frame = this.frames.get(path);
    if (frame) sprite.spriteFrame = frame;
    else void this.ready.then(() => { if (isValid(node) && !this.disposed) { sprite.spriteFrame = this.frames.get(path) || null; if (additive) this.additive(sprite); } }, () => {});
    if (additive && frame) this.additive(sprite);
    return node;
  }
  private additive(sprite: Sprite) {
    sprite.getMaterialInstance(0)?.overridePipelineStates({ blendState: { targets: [{ blend: true, blendSrc: gfx.BlendFactor.SRC_ALPHA, blendDst: gfx.BlendFactor.ONE, blendSrcAlpha: gfx.BlendFactor.ONE, blendDstAlpha: gfx.BlendFactor.ONE_MINUS_SRC_ALPHA }] } });
  }
  private tile(parent: Node, value: number, x: number, y: number, w: number, h: number, name: string, back: boolean): Node {
    const node = UI.box(parent, name, x, y, w, h);
    back = back || value === 57;
    this.image(node, 'Body', back ? AssetCatalog.tileBack : AssetCatalog.tileBody, 0, 0, w, h);
    if (!back) this.image(node, 'Face', AssetCatalog.tile(value), w * .1, h * .12, w * .8, h * .77);
    return node;
  }
  private bitmap(parent: Node, text: string, font: string, x: number, y: number, w: number, h: number): Node {
    const size = parent.getComponent(UITransform)?.contentSize;
    const local = size?.width === UI.W && size?.height === UI.H && parent !== this.root && !parent.name.startsWith('Effect-');
    const holder = UI.box(parent, 'Bitmap-' + text, x + (local ? UI.W / 2 : 0), y + (local ? UI.H / 2 : 0), w, h);
    const build = () => {
      if (!isValid(holder) || this.disposed) return;
      const definition = this.fontDefinitions[font], atlas = this.frames.get((AssetCatalog.effects.fonts as any)[font]);
      const chars = Array.from(text), glyphs = chars.map(c => definition?.fontDefDictionary[String(c.codePointAt(0))]);
      if (!atlas || glyphs.some(glyph => !glyph)) {
        const label = UI.text(holder, 'GoldText', text, 0, 0, w, h, Math.min(h * .8, w / Math.max(1, chars.length)), '#ffe48a');
        label.isBold = true; label.enableOutline = true; label.outlineColor = UI.color('#81501c'); label.outlineWidth = 3; label.fontFamily = 'KaiTi';
        return;
      }
      let cursor = 0, minX = 0, maxX = 0, minY = Infinity, maxY = -Infinity;
      const places = glyphs.map(glyph => { const x = cursor + glyph.xOffset, y = glyph.yOffset; cursor += glyph.xAdvance; minX = Math.min(minX, x); maxX = Math.max(maxX, x + glyph.rect.width); minY = Math.min(minY, y); maxY = Math.max(maxY, y + glyph.rect.height); return [x, y]; });
      const width = Math.max(1, maxX - minX), height = Math.max(1, maxY - minY), scale = Math.min(w / width, h / height);
      const row = UI.box(holder, 'GoldGlyphRow', (w - width) / 2, (h - height) / 2, width, height); row.setScale(scale, scale, 1);
      glyphs.forEach((glyph, index) => {
        const rect = glyph.rect; if (!rect.width || !rect.height) return;
        const key = font + ':' + chars[index];
        let frame = this.glyphFrames.get(key);
        if (!frame) { frame = new SpriteFrame(); frame.reset({ texture: atlas.texture, rect: new Rect(rect.x, rect.y, rect.width, rect.height), originalSize: new Size(rect.width, rect.height), offset: new Vec2(0, 0) }); this.glyphFrames.set(key, frame); }
        const node = UI.box(row, 'Glyph-' + index, places[index][0] - minX, places[index][1] - minY, rect.width, rect.height);
        const sprite = node.addComponent(Sprite); sprite.sizeMode = Sprite.SizeMode.CUSTOM; sprite.spriteFrame = frame;
      });
    };
    if (this.fontDefinitions[font] && this.frames.has((AssetCatalog.effects.fonts as any)[font])) build(); else void this.ready.then(build, () => {});
    return holder;
  }
  private job(durationMs: number, lockingMs: number, build: (host: Node) => (time: number) => void): EffectHandle {
    if (this.disposed) return this.skip();
    const node = UI.box(this.root, 'Effect-' + this.jobs.size, 0, 0, UI.W, UI.H);
    let resolve!: AnimationJob['resolve'];
    const finished = new Promise<{ cancelled: boolean }>(done => { resolve = done; });
    const job: AnimationJob = { node, durationMs, lockingMs, elapsed: 0, paused: false, done: false, draw: build(node), resolve };
    this.jobs.add(job); job.draw(0);
    return { durationMs, lockingMs, get remainingMs() { return Math.max(0, durationMs - job.elapsed); }, get remainingLockMs() { return Math.max(0, lockingMs - job.elapsed); }, finished, cancel: () => this.finish(job, true), pause: () => { job.paused = true; }, resume: () => { job.paused = false; } };
  }
  private skip(): EffectHandle { return { durationMs: 0, lockingMs: 0, remainingMs: 0, remainingLockMs: 0, finished: Promise.resolve({ cancelled: false }), cancel() {}, pause() {}, resume() {} }; }
  private tick(dt: number) {
    if (this.disposed || this.paused) return;
    for (const job of Array.from(this.jobs)) { if (job.paused || job.done) continue; job.elapsed += dt * 1000; if (job.elapsed >= job.durationMs) this.finish(job, false); else job.draw(job.elapsed / 1000); }
  }
  private finish(job: AnimationJob, cancelled: boolean) {
    if (job.done) return; job.done = true; this.jobs.delete(job);
    if (isValid(job.node)) { job.node.removeFromParent(); job.node.destroy(); }
    job.resolve({ cancelled });
  }
}
