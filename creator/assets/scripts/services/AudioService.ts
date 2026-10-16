import { AudioClip, AudioSource, Game, Node, game, resources, sys } from 'cc';
import { AudioChannel, AudioMusic, audioDescriptor } from '../ui/AssetCatalog';

export interface AudioPreferences {
  music: boolean;
  sound: boolean;
  voice: boolean;
  muteAll: boolean;
  musicVolume: number;
  effectsVolume: number;
  voiceVolume: number;
}
export interface AudioPlayOptions {
  /** Legacy .5 is neutral; channel preferences supply the actual mix. */
  volume?: number;
  replace?: boolean;
  waitForEnd?: boolean;
}
interface AudioJob {
  path: string;
  channel: 'effects' | 'voice';
  volume: number;
  waitForEnd: boolean;
  epoch: number;
  done: boolean;
  settled: boolean;
  resolve: (played: boolean) => void;
  source?: AudioSource;
}
const SETTINGS_KEY = 'MAHJONG_SETTINGS';
export const AUDIO_DEFAULTS: Readonly<AudioPreferences> = Object.freeze({
  music: true, sound: true, voice: true, muteAll: false,
  musicVolume: .15, effectsVolume: .5, voiceVolume: .65,
});
function volume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}
function normalize(value: Record<string, unknown>): AudioPreferences {
  return {
    music: value.music !== false, sound: value.sound !== false,
    voice: typeof value.voice === 'boolean' ? value.voice : value.sound !== false,
    muteAll: value.muteAll === true,
    musicVolume: volume(value.musicVolume, AUDIO_DEFAULTS.musicVolume),
    effectsVolume: volume(value.effectsVolume, AUDIO_DEFAULTS.effectsVolume),
    voiceVolume: volume(value.voiceVolume, AUDIO_DEFAULTS.voiceVolume),
  };
}
function storedSettings(): Record<string, unknown> {
  try {
    const value = JSON.parse(sys.localStorage.getItem(SETTINGS_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

/** Three independent channels, FIFO speech and music ducking during speech. */
export class AudioService {
  private readonly root: Node;
  private readonly music: AudioSource;
  private readonly voice: AudioSource;
  private readonly effects: AudioSource[] = [];
  private readonly clips = new Map<string, Promise<AudioClip>>();
  private readonly retainedClips = new Set<AudioClip>();
  private readonly jobs = new Map<AudioSource, AudioJob>();
  private readonly loadingEffects = new Set<AudioJob>();
  private readonly voiceQueue: AudioJob[] = [];
  private activeVoice: AudioJob | null = null;
  private settings = normalize(storedSettings());
  private scene: 'hall' | 'table' = 'hall';
  private unlocked = false;
  private paused = false;
  private disposed = false;
  private musicEpoch = 0;
  private musicStarting = false;
  private transientEpoch = 0;

  constructor(parent: Node) {
    this.root = new Node('AudioService');
    parent.addChild(this.root);
    this.music = this.source('Music');
    this.music.loop = true;
    this.voice = this.source('Voice');
    for (let index = 0; index < 8; index++) this.effects.push(this.source(`Effects-${index}`));
    game.on(Game.EVENT_HIDE, this.pause, this);
    game.on(Game.EVENT_SHOW, this.resume, this);
    this.applyVolumes();
  }

  get preferences(): AudioPreferences { return { ...this.settings }; }
  get musicPlaying(): boolean { return this.music.playing; }
  get voiceQueueLength(): number { return this.voiceQueue.length + (this.activeVoice ? 1 : 0); }

  /** Call from the first real UI gesture to satisfy Web audio policy. */
  async unlock(): Promise<void> {
    if (this.disposed) return;
    this.unlocked = true;
    this.paused = false;
    await this.startMusic();
  }

  play(input: string, options: AudioPlayOptions = {}): Promise<boolean> {
    let descriptor;
    try { descriptor = audioDescriptor(input); } catch (error) { console.warn(String(error)); return Promise.resolve(false); }
    if (descriptor.channel === 'music') { this.setScene(descriptor.path === AudioMusic.table ? 'table' : 'hall'); return this.startMusic().then(() => this.music.playing); }
    if (!this.allowed(descriptor.channel)) return Promise.resolve(false);
    const channel = descriptor.channel;
    if (channel === 'effects' && options.replace !== false) this.stop(input);
    return new Promise(resolve => {
      const job: AudioJob = {
        path: descriptor.path, channel, volume: volume((options.volume ?? .5) * 2, 1),
        waitForEnd: options.waitForEnd === true, epoch: this.transientEpoch,
        done: false, settled: false, resolve,
      };
      if (channel === 'voice') { this.voiceQueue.push(job); void this.pumpVoice(); }
      else {
        this.loadingEffects.add(job);
        void this.clip(job.path).then(clip => {
          this.loadingEffects.delete(job);
          if (!this.canStart(job)) { this.finish(job, false); return; }
          const source = this.effects.find(item => !this.jobs.has(item)) || this.effects[0];
          this.stopSource(source);
          this.startJob(job, source, clip);
        }).catch(error => { this.loadingEffects.delete(job); this.finish(job, false); if (!this.disposed) console.warn('音频资源加载失败', String(error)); });
      }
    });
  }

  setScene(scene: 'hall' | 'table'): void {
    if (scene === this.scene || this.disposed) return;
    this.scene = scene;
    this.stopMusic();
    this.applyVolumes();
    void this.startMusic();
  }

  setPreferences(patch: Partial<AudioPreferences>): void {
    this.settings = normalize({ ...this.settings, ...patch });
    // Other controls share this key. Keep timing/animation preferences intact.
    try { sys.localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...storedSettings(), ...this.settings })); } catch { /* Audio controls still work when storage is unavailable. */ }
    for (const job of this.pendingJobs()) if (!this.allowed(job.channel)) this.finish(job, false);
    if (this.activeVoice && !this.allowed('voice')) this.finish(this.activeVoice, false);
    this.applyVolumes();
    if (!this.allowed('music')) this.stopMusic(); else void this.startMusic();
  }

  stop(input: string): void {
    let path: string;
    try { path = audioDescriptor(input).path; } catch { return; }
    for (const job of this.pendingJobs()) if (job.path === path) this.finish(job, false);
    if (this.activeVoice?.path === path) this.finish(this.activeVoice, false);
  }

  cancelTransient(): void {
    this.transientEpoch++;
    for (const job of this.pendingJobs()) this.finish(job, false);
    if (this.activeVoice) this.finish(this.activeVoice, false);
    this.voiceQueue.length = 0;
    this.applyVolumes();
  }

  pause(): void {
    if (this.disposed) return;
    this.paused = true;
    this.cancelTransient();
    this.stopMusic();
  }

  resume(): void {
    if (this.disposed) return;
    this.paused = false;
    void this.startMusic();
  }

  dispose(): void {
    if (this.disposed) return;
    this.pause();
    this.disposed = true;
    game.off(Game.EVENT_HIDE, this.pause, this);
    game.off(Game.EVENT_SHOW, this.resume, this);
    this.root.destroy();
    for (const clip of Array.from(this.retainedClips)) clip.decRef();
    this.retainedClips.clear();
    this.clips.clear();
  }

  private source(name: string): AudioSource {
    const node = new Node(name);
    this.root.addChild(node);
    const source = node.addComponent(AudioSource);
    source.playOnAwake = false;
    node.on(AudioSource.EventType.STARTED, () => {
      const job = this.jobs.get(source);
      if (job && !job.waitForEnd) this.settle(job, true);
    });
    node.on(AudioSource.EventType.ENDED, () => {
      const job = this.jobs.get(source);
      if (job) this.finish(job, true);
    });
    return source;
  }

  private allowed(channel: AudioChannel): boolean {
    const key = channel === 'effects' ? 'sound' : channel;
    const level = channel === 'effects' ? this.settings.effectsVolume : channel === 'voice' ? this.settings.voiceVolume : this.settings.musicVolume;
    return this.unlocked && !this.paused && !this.disposed && !this.settings.muteAll && this.settings[key] && level > 0;
  }

  private clip(path: string): Promise<AudioClip> {
    const existing = this.clips.get(path);
    if (existing) return existing;
    const pending = new Promise<AudioClip>((resolve, reject) => {
      resources.load(path, AudioClip, (error, clip) => {
        if (error) { reject(error); return; }
        if (this.disposed) { reject(new Error('Audio service disposed')); return; }
        if (!this.retainedClips.has(clip)) { clip.addRef(); this.retainedClips.add(clip); }
        resolve(clip);
      });
    });
    this.clips.set(path, pending);
    void pending.catch(() => this.clips.delete(path));
    return pending;
  }

  private async startMusic(): Promise<void> {
    if (!this.allowed('music') || this.music.playing || this.musicStarting) return;
    const epoch = this.musicEpoch;
    this.musicStarting = true;
    try {
      const clip = await this.clip(AudioMusic[this.scene]);
      if (epoch !== this.musicEpoch || !this.allowed('music')) return;
      this.music.clip = clip;
      this.applyVolumes();
      this.music.play();
    } catch (error) { if (!this.disposed) console.warn('背景音乐加载失败', String(error)); }
    finally { if (epoch === this.musicEpoch) this.musicStarting = false; }
  }

  private stopMusic(): void {
    this.musicEpoch++;
    this.musicStarting = false;
    this.music.stop();
  }

  private canStart(job: AudioJob): boolean { return !job.done && job.epoch === this.transientEpoch && this.allowed(job.channel); }

  private pendingJobs(): AudioJob[] {
    // Creator's loose Babel spread/for-of transforms assume arrays. Convert
    // every Set and Map iterator explicitly before concatenating snapshots.
    return Array.from(this.loadingEffects).concat(this.voiceQueue, Array.from(this.jobs.values()));
  }

  private startJob(job: AudioJob, source: AudioSource, clip: AudioClip): void {
    if (!this.canStart(job)) { this.finish(job, false); return; }
    job.source = source;
    this.jobs.set(source, job);
    source.clip = clip;
    source.loop = false;
    this.applyVolumes();
    source.play();
  }

  private async pumpVoice(): Promise<void> {
    if (this.activeVoice || !this.voiceQueue.length || !this.allowed('voice')) return;
    const job = this.voiceQueue.shift()!;
    this.activeVoice = job;
    try {
      const clip = await this.clip(job.path);
      if (this.activeVoice !== job || !this.canStart(job)) { this.finish(job, false); return; }
      this.startJob(job, this.voice, clip);
    } catch (error) { this.finish(job, false); if (!this.disposed) console.warn('牌局语音加载失败', String(error)); }
  }

  private settle(job: AudioJob, played: boolean): void {
    if (job.settled) return;
    job.settled = true;
    job.resolve(played);
  }

  private finish(job: AudioJob, played: boolean): void {
    if (job.done) return;
    job.done = true;
    this.loadingEffects.delete(job);
    const queueIndex = this.voiceQueue.indexOf(job);
    if (queueIndex >= 0) this.voiceQueue.splice(queueIndex, 1);
    if (job.source && this.jobs.get(job.source) === job) { this.jobs.delete(job.source); if (!played) job.source.stop(); }
    if (this.activeVoice === job) this.activeVoice = null;
    this.settle(job, played);
    this.applyVolumes();
    // Defer so cancellation can clear the whole queue before pumping again.
    if (job.channel === 'voice') void Promise.resolve().then(() => this.pumpVoice());
  }

  private stopSource(source: AudioSource): void {
    const job = this.jobs.get(source);
    if (job) this.finish(job, false); else source.stop();
  }

  private applyVolumes(): void {
    const muted = this.settings.muteAll;
    this.music.volume = muted || !this.settings.music ? 0 : this.settings.musicVolume * (this.scene === 'table' ? .65 : 1) * (this.activeVoice?.source ? .28 : 1);
    this.voice.volume = muted || !this.settings.voice ? 0 : this.settings.voiceVolume * (this.activeVoice?.volume ?? 1);
    for (const source of this.effects) source.volume = muted || !this.settings.sound ? 0 : this.settings.effectsVolume * (this.jobs.get(source)?.volume ?? 1);
  }
}
