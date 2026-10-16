import { _decorator, Component, Node, Label, UIOpacity, isValid } from 'cc';
import * as UI from './UI';
import { AssetCatalog } from './AssetCatalog';
import { icon } from './Icons';
import { TableEffects, EffectHandle, PresentedAction, DealTarget } from './TableEffects';
import { suitOf } from '../rules/rules';

const { ccclass } = _decorator;
@ccclass('LianzhuoTableViewCleanup')
class TableViewCleanup extends Component { release: () => void = () => {}; onDestroy() { this.release(); } }

export interface TableCallbacks {
  tile(index: number): void;
  action(method: string, args: any[]): void;
  menu(): void; hint(): void; history(): void; chat(): void; profile(seat: number): void;
}
const names = ['你', '阿唐', '林先生', '小苏'];
const suits = ['', '万', '条', '筒'];
const QUE_COLORS = ['#59775d', '#bd6857', '#4f9d7b', '#668fb8'];

export class TableView {
  readonly root: Node;
  readonly ready: Promise<void>;
  private wall: Node; private exposed: Node; private hand: Node; private actions: Node;
  private countdown: Label; private status: Label; private title: Label; private tilesLeft: Label;
  private playerLabels: Label[] = []; private profileNodes: Node[] = []; private suitTags: Node[] = [];
  private turnMarkers: Node[] = [];
  private effects: TableEffects;
  private cleanup: TableViewCleanup;
  private lastKey = '';
  private currentHands: number[][] = [];
  private flyingDiscards = new Set<string>();
  private openingHandle: EffectHandle | null = null;
  private disposed = false;

  constructor(parent: Node, private callbacks: TableCallbacks) {
    this.root = UI.box(parent, 'Table', 0, 0, UI.W, UI.H);
    this.cleanup = this.root.addComponent(TableViewCleanup); this.cleanup.release = () => this.release();
    void UI.image(this.root, 'Tablecloth', AssetCatalog.backgrounds.table, 0, 0, UI.W, UI.H);
    void UI.image(this.root, 'WovenTablePattern', AssetCatalog.backgrounds.tableTexture, 214, 83, 850, 465).then(node => { if (isValid(node)) node.addComponent(UIOpacity).opacity = 84; });
    UI.panel(this.root, 'TitlePlate', 164, 14, 320, 45, '#173f35e8', '#aa975c', 14);
    this.title = UI.text(this.root, 'TableTitle', '血流麻将 · 金币场', 166, 17, 316, 37, 22, '#f7e6b4');
    const menu = UI.button(this.root, 'TableMenu', '菜单', 27, 18, 107, 44, () => callbacks.menu(), { fill: '#fffbed', fontSize: 19 });
    menu.getComponentInChildren(Label)!.node.setPosition(16, 0, 0); icon(menu, 'menu', 10, 8, 26, 26);
    this.tilesLeft = UI.text(this.root, 'TilesLeft', '余牌 55', 505, 20, 135, 32, 20, '#f4dfaa');
    UI.text(this.root, 'PracticeConnection', '联桌麻将 · 人机练习', 647, 23, 257, 28, 17, '#f0e2b2');
    const cards = UI.box(this.root, 'Profiles', 0, 0, UI.W, UI.H);
    const positions = [[29, 389], [1144, 195], [916, 10], [29, 185]];
    positions.forEach(([x, y], seat) => {
      const plate = UI.button(cards, 'Profile-' + seat, seat === 0 ? '个人资料' : names[seat] + '资料', x, y, 99, 124, () => callbacks.profile(seat), { fill: '#163f36ee', border: '#bea46c' });
      plate.getComponentInChildren(Label)!.string = '';
      void UI.image(plate, 'Avatar', AssetCatalog.avatars[seat], 12, 9, 75, 72);
      this.playerLabels[seat] = UI.text(plate, 'PlayerName', names[seat] + '\n30000', 1, 81, 97, 39, 15, '#fff0c3');
      const tag = UI.panel(plate, 'MissingSuit', seat === 1 ? -29 : 99, 78, 29, 29, QUE_COLORS[1], '#ffe7ae', 14);
      UI.text(tag, 'SuitName', '万', 0, 0, 29, 29, 19, '#fffbd6'); tag.active = false;
      this.suitTags[seat] = tag; this.profileNodes[seat] = plate;
    });
    this.wall = UI.box(this.root, 'OpponentsHands', 0, 0, UI.W, UI.H);
    this.exposed = UI.box(this.root, 'PublicTiles', 0, 0, UI.W, UI.H);
    this.hand = UI.box(this.root, 'MyHand', 0, 0, UI.W, UI.H);
    this.actions = UI.box(this.root, 'Actions', 0, 0, UI.W, UI.H);
    UI.panel(this.root, 'Compass', 578, 234, 126, 100, '#15362de8', '#cbb377', 21);
    UI.text(this.root, 'West', '西', 614, 237, 51, 23, 16, '#e5d8b2');
    UI.text(this.root, 'North', '北', 677, 269, 24, 30, 16, '#e5d8b2');
    UI.text(this.root, 'South', '南', 582, 269, 24, 30, 16, '#e5d8b2');
    UI.text(this.root, 'East', '东', 614, 308, 51, 23, 16, '#f7d778');
    this.countdown = UI.text(this.root, 'Countdown', '15', 611, 260, 59, 46, 34, '#ffdf8c'); this.countdown.isBold = true;
    [[595, 330, 90, 4], [699, 249, 4, 66], [595, 233, 90, 4], [575, 249, 4, 66]].forEach(([x, y, w, h], seat) => {
      const glow = UI.panel(this.root, 'TurnGlow-' + seat, x, y, w, h, '#ffe483', '', 2); this.turnMarkers.push(glow);
    });
    this.status = UI.text(this.root, 'TableStatus', '正在准备牌局', 276, 382, 728, 40, 22, '#fff0c6');
    this.status.enableOutline = true; this.status.outlineColor = UI.color('#174233'); this.status.outlineWidth = 1.5;
    [['Chat', '聊天', 'chat', 359, callbacks.chat], ['History', '流水', 'history', 422, callbacks.history], ['Hint', '听牌', 'hint', 485, callbacks.hint]].forEach(([name, label, key, y, callback]) => {
      const button = UI.button(this.root, String(name), String(label), 1149, Number(y), 82, 51, callback as () => void, { fontSize: 16, fill: '#fffbed', border: '#c7ad6a' });
      const text = button.getComponentInChildren(Label)!; text.node.setPosition(0, -12, 0); text.fontSize = 14;
      icon(button, String(key), 29, 3, 25, 25);
    });
    const effectLayer = UI.box(this.root, 'Effects', 0, 0, UI.W, UI.H);
    this.effects = new TableEffects(effectLayer); this.ready = this.effects.ready;
  }

  get effectLockRemainingMs() { return this.effects.remainingLockMs; }
  updateCountdown(seconds: number) { this.countdown.string = String(seconds); this.countdown.color = UI.color(seconds <= 3 ? '#ff9a60' : '#ffdf8c'); }
  showSyncError(message: string) { this.status.string = '牌局同步暂停 · ' + message; UI.announce(this.status.string + '，请在菜单重试同步。'); }

  render(round: any, account: any, selected: Set<number>, manual: boolean, auto: boolean) {
    if (this.disposed) return;
    this.currentHands = round.hands.map((hand: number[]) => hand.slice());
    this.title.string = round.config.name + ' · 金币场'; this.tilesLeft.string = '余牌 ' + round.wall.length;
    const phase = round.phase;
    this.status.string = phase === 'choose' ? '定缺：请选择本局缺门' : phase === 'exchange' ? '选择三张' + (round.config.exchangeAnySuit ? '手牌' : '同花色牌') + '，再确认换牌' : phase === 'end' ? '本局已结束 · 正在结算' : (auto ? '托管中 · ' : '') + (round.turn === 0 ? '轮到你：点选手牌，再出牌' : '等待电脑行动') + ' · 底分 ' + round.base;
    if (phase === 'claim' || phase === 'rob') this.status.string = round.claim?.options[0] && !(0 in round.claim.responses) ? (phase === 'rob' ? '抢杠胡' : '响应 ' + round.name(round.claim.value)) + '：请选择操作' : '等待电脑响应';
    this.playerLabels.forEach((label, seat) => { const amount = seat === 0 ? account?.tableBalance ?? Math.max(0, round.startBalances[seat] + round.scores[seat]) : Math.max(0, round.startBalances[seat] + round.scores[seat]); label.string = (seat === 0 ? account?.name || '你' : names[seat]) + '\n金币 ' + amount; });
    this.turnMarkers.forEach((marker, seat) => { marker.active = phase !== 'end' && round.turn === seat; });
    this.suitTags.forEach((tag, seat) => { tag.active = !!round.missing[seat]; const label = tag.getComponentInChildren(Label)!; label.string = suits[round.missing[seat]] || ''; });
    const key = JSON.stringify([phase, round.turn, round.hands, round.discards, round.melds, round.missing, round.revealed, round.huEvents?.map((event: any) => [event.seat, event.tile]), round.redKongs, Array.from(selected), manual, auto, round.claim?.options, round.claim?.responses, Array.from(this.flyingDiscards)]);
    if (key === this.lastKey) return; this.lastKey = key;
    UI.clearChildren(this.wall); UI.clearChildren(this.exposed); UI.clearChildren(this.hand); UI.clearChildren(this.actions);
    for (let seat = 1; seat < 4; seat++) for (let i = 0; i < round.hands[seat].length; i++) {
      const p = this.opponentPlacement(seat, i);
      if (round.revealed[seat]) this.smallTile(this.wall, round.hands[seat][i], p.x, p.y, p.w, p.h, 'Revealed-' + seat + '-' + i, seat === 2 ? 180 : seat === 1 ? 90 : -90);
      else void UI.image(this.wall, 'Back-' + seat + '-' + i, AssetCatalog.tileBacks[seat], p.x, p.y, p.w, p.h);
    }
    round.discards.forEach((values: number[], seat: number) => values.forEach((value, index) => {
      if (this.flyingDiscards.has(seat + ':' + index)) return;
      const [x, y] = this.discardPlacement(seat, index); this.smallTile(this.exposed, value, x, y, 24, 35, 'Discard-' + seat + '-' + index, seat === 2 ? 180 : 0);
    }));
    round.melds.forEach((groups: any[], seat: number) => groups.forEach((group, i) => {
      const [x, y] = seat === 0 ? [180 + i * 101, 477] : seat === 2 ? [443 + i * 98, 112] : seat === 1 ? [986, 218 + i * 78] : [234, 218 + i * 78];
      const count = group.type === 'peng' ? 3 : 4;
      for (let n = 0; n < count; n++) this.smallTile(this.exposed, group.type === 'dark' && seat !== 0 ? 57 : group.value, x + n % 3 * 25, y - Math.floor(n / 3) * 12, 24, 35, 'Meld-' + seat + '-' + i + '-' + n, seat === 2 ? 180 : 0);
    }));
    const wins = (round.huEvents || []).concat((round.redKongs || []).flatMap((tiles: number[], seat: number) => tiles.map(tile => ({ seat, tile }))));
    const counts = [0, 0, 0, 0];
    for (const event of wins) {
      const i = counts[event.seat]++, origins = [[798, 474], [949, 383], [748, 112], [234, 384]], [x, y] = origins[event.seat];
      this.smallTile(this.exposed, event.tile, x + i % 5 * 25, y + Math.floor(i / 5) * 33, 24, 35, 'HuTile-' + event.seat + '-' + i);
    }
    const cards = round.hands[0], size = this.handPlacement(cards.length);
    cards.forEach((value: number, index: number) => {
      const chosen = selected.has(index), node = UI.button(this.hand, 'Hand-' + index, '手牌 ' + round.name(value), size.left + index * (size.width + 3), 529 - (chosen ? 16 : 0), size.width, size.height, () => this.callbacks.tile(index), { fill: '#143d3600', border: chosen ? '#ffe081' : '', enabled: manual && (phase === 'exchange' || phase === 'play' && round.turn === 0), fontSize: 16 });
      node.getComponentInChildren(Label)!.string = ''; UI.setButtonPressed(node, chosen);
      void UI.image(node, 'TileBody', AssetCatalog.tileBody, 1, 1, size.width - 2, size.height - 2);
      void UI.image(node, 'TileFace', AssetCatalog.tile(value), size.width * .10, size.height * .12, size.width * .80, size.height * .77);
      if (round.missing[0] && suitOf(value) === round.missing[0]) { const tag = UI.panel(node, 'MissingTag', size.width - 23, 0, 23, 22, '#b75535', '#ffd579', 3); UI.text(tag, 'Missing', '缺', 0, 0, 23, 22, 15, '#fff4bc'); }
    });
    const options: { label: string; method: string; args: any[]; enabled?: boolean }[] = [];
    if (phase === 'choose') for (let suit = 1; suit <= 3; suit++) options.push({ label: '缺' + suits[suit], method: 'choose', args: [suit] });
    if (phase === 'exchange') options.push({ label: '确认换三张', method: 'exchange', args: [Array.from(selected)], enabled: selected.size === 3 });
    if (phase === 'play' && round.turn === 0) {
      for (const option of round.options(0)) {
        if (option === 'hu') options.push({ label: '自摸', method: 'hu', args: [0] });
        else if (option === 'redKong') options.push({ label: '红中杠', method: 'redKong', args: [0] });
        else if (option === 'reveal') options.push({ label: '明牌 ×6', method: 'reveal', args: [0] });
        else { const [kind, v] = option.split(':'); options.push({ label: (kind === 'add' ? '补杠 ' : '暗杠 ') + round.name(Number(v)), method: 'gang', args: [0, Number(v), kind === 'add'] }); }
      }
      options.push({ label: '出牌', method: 'discard', args: [0, Array.from(selected)[0]], enabled: selected.size === 1 });
    }
    if ((phase === 'claim' || phase === 'rob') && round.claim?.options[0] && !(0 in round.claim.responses)) for (const op of round.claim.options[0].concat(['pass'])) options.push({ label: ({ hu: '胡牌', peng: '碰', gang: '杠', pass: '过' } as any)[op], method: phase === 'rob' ? 'rob' : 'respond', args: [0, op] });
    const total = options.length * 114, start = 640 - total / 2;
    options.forEach((op, i) => UI.button(this.actions, 'Action-' + op.method + i, op.label, start + i * 114, 433, 106, 43, () => this.callbacks.action(op.method, op.args), { fill: op.label === '过' ? '#e7edde' : '#f1d782', border: '#c6a95f', fontSize: 19, enabled: manual && op.enabled !== false }));
    UI.announce(round.config.name + '，' + this.status.string + '，金币 ' + (account?.balance ?? 0));
  }

  opening(hands: number[][] = this.currentHands): EffectHandle {
    this.openingHandle?.cancel();
    const targets: DealTarget[] = [], own = this.handPlacement(hands[0]?.length || 14);
    hands.forEach((values, seat) => values.forEach((value, index) => { const p = seat === 0 ? { x: own.left + index * (own.width + 3), y: 529, w: own.width, h: own.height } : this.opponentPlacement(seat, index); targets.push({ seat, value: seat === 0 ? value : 57, x: p.x, y: p.y, width: p.w, height: p.h, index }); }));
    this.layerOpacity(this.hand, 0); this.layerOpacity(this.wall, 0);
    const handle = this.effects.opening(targets); this.openingHandle = handle;
    void handle.finished.then(() => { if (!this.disposed && this.openingHandle === handle) { this.layerOpacity(this.hand, 255); this.layerOpacity(this.wall, 255); this.openingHandle = null; } });
    return handle;
  }
  exchange(packs: number[][] = [], direction: 'clockwise' | 'counterclockwise' | 'opposite' = 'clockwise') { return this.effects.exchange(packs, direction); }
  dingque(missing: number[] = []) { return this.effects.dingque(missing); }
  presentAction(event: PresentedAction, deltas: number[] = []) { return this.effects.action(event, deltas); }
  payout(deltas: number[], delayMs = 0) { return this.effects.payout(deltas, delayMs); }
  flyDiscard(value: number, seat: number, index: number): EffectHandle {
    const key = seat + ':' + index, at = this.discardPlacement(seat, index); this.flyingDiscards.add(key);
    const handle = this.effects.discard(value, seat, at);
    void handle.finished.then(() => { this.flyingDiscards.delete(key); this.lastKey = ''; if (!this.disposed && !this.exposed.getChildByName('Discard-' + seat + '-' + index)) this.smallTile(this.exposed, value, at[0], at[1], 24, 35, 'Discard-' + seat + '-' + index, seat === 2 ? 180 : 0); });
    return handle;
  }
  burst(word: string, fan = ''): EffectHandle {
    const action = ({ 碰: 'peng', 杠: 'gang', 胡: 'hu', 胡牌: 'hu', 自摸: 'zimo', 抢杠胡: 'qgh', 明牌: 'reveal' } as any)[word] || word;
    return this.presentAction({ action, seat: 0, fan: fan ? { name: fan.split(' · ')[0], multiple: Number(fan.match(/(\d+)倍/)?.[1]) || 1 } : undefined });
  }
  pauseEffects() { this.effects.pause(); }
  resumeEffects() { this.effects.resume(); }
  clearEffects() { this.effects.clear(); this.flyingDiscards.clear(); this.lastKey = ''; if (!this.disposed) { this.layerOpacity(this.hand, 255); this.layerOpacity(this.wall, 255); } }
  dispose() { if (this.disposed) return; this.release(); if (isValid(this.root)) { this.root.removeFromParent(); this.root.destroy(); } }

  private release() { if (this.disposed) return; this.disposed = true; this.cleanup.release = () => {}; this.effects.dispose(); this.flyingDiscards.clear(); this.currentHands = []; }
  private layerOpacity(node: Node, amount: number) { if (isValid(node)) (node.getComponent(UIOpacity) || node.addComponent(UIOpacity)).opacity = amount; }
  private handPlacement(length: number) { const width = Math.min(65, 1020 / Math.max(length, 14) - 3); return { width, height: 88, left: 144 + (1020 - length * (width + 3)) / 2 }; }
  private opponentPlacement(seat: number, index: number) { return seat === 2 ? { x: 424 + index * 27, y: 66, w: 28, h: 44 } : seat === 1 ? { x: 1042 + index * 1.45, y: 144 + index * 21, w: 39, h: 57 } : { x: 201 - index * 1.4, y: 142 + index * 21, w: 44, h: 61 }; }
  private discardPlacement(seat: number, index: number) { const origins = [[422, 345], [789, 210], [422, 150], [316, 209]], [x, y] = origins[seat] || origins[0]; return [x + index % 10 * 25, y + Math.floor(index / 10) * 34]; }
  private smallTile(parent: Node, value: number, x: number, y: number, w: number, h: number, name: string, rotation = 0) {
    const tile = UI.box(parent, name, x, y, w, h); tile.angle = rotation;
    void UI.image(tile, 'Body', value === 57 ? AssetCatalog.tileBack : AssetCatalog.tileBody, 0, 0, w, h);
    if (value !== 57) void UI.image(tile, 'Face', AssetCatalog.tile(value), w * .10, h * .12, w * .8, h * .77);
    return tile;
  }
}
