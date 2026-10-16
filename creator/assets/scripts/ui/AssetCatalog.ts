/**
 * Paths relative to assets/resources, without filename extensions.
 * Image SpriteFrames load with resources.load(path + '/spriteFrame', SpriteFrame).
 * Image .meta files select the sprite-frame importer before Creator imports them.
 */
export const AssetCatalog = Object.freeze({
  backgrounds: Object.freeze({ loading: 'backgrounds/loading', hall: 'backgrounds/hall', table: 'backgrounds/table', tableTexture: 'backgrounds/table-texture' }),
  avatar: 'ui/avatar',
  avatars: Object.freeze(['ui/avatar', 'ui/avatar-1', 'ui/avatar-2', 'ui/avatar-3']),
  coin: 'ui/coin',
  tileBody: 'tiles/body',
  tileBack: 'tiles/back',
  tileBacks: Object.freeze(['tiles/back', 'tiles/back-right', 'tiles/back', 'tiles/back-left']),
  effects: Object.freeze({
    actions: Object.freeze({ peng: 'effects/actions/peng', gang: 'effects/actions/gang', hu: 'effects/actions/hu', zimo: 'effects/actions/zimo', qgh: 'effects/actions/qgh' }),
    fontDefinitions: 'effects/fonts/definitions',
    fonts: Object.freeze({ fan: 'effects/fonts/fan', win: 'effects/fonts/win', loss: 'effects/fonts/loss' }),
    glow: 'effects/glow', sweep: 'effects/sweep', huRing: 'effects/hu-ring', huElectric: 'effects/hu-electric', coin: 'effects/coin',
  }),
  games: Object.freeze({ classic: 'games/classic', red: 'games/red', exchange: 'games/exchange', six: 'games/six', sixFixed: 'games/sixFixed', crazy: 'games/crazy', eightFixed: 'games/eightFixed' }),
  tile(value: number): string {
    if (value === 57) return 'tiles/back';
    const suit = Math.floor(value / 10), rank = value % 10;
    if ((suit >= 1 && suit <= 3 && rank >= 1 && rank <= 9) || (suit === 5 && rank >= 1 && rank <= 3)) return `tiles/${value}`;
    throw new Error(`Unsupported tile face: ${value}`);
  },
});

export type AudioChannel = 'music' | 'effects' | 'voice';
export interface AudioDescriptor { path: string; channel: AudioChannel }
export const AudioMusic = Object.freeze({ hall: 'audio/lobby-music', table: 'audio/table-music' });
const effects: Record<string, string> = {
  select: 'ui', ui: 'ui', draw: 'draw', outtile: 'discard', discard: 'discard', saizi: 'shuffle', shuffle: 'shuffle',
  dingque: 'dingque', win: 'hu-cue', 'hu-cue': 'hu-cue', coin: 'coin', countdown: 'countdown', wind: 'wind', rain: 'rain',
  'settlement-win': 'settlement-win', 'settlement-end': 'settlement-neutral', 'settlement-neutral': 'settlement-neutral',
};
const voices: Record<string, string> = { red: 'red', peng: 'peng', gang: 'gang', hu: 'hu', zimo: 'zimo', qgh: 'qgh', redKong: 'redKong', 'red-kong': 'redKong', reveal: 'reveal' };
export function audioDescriptor(input: string): AudioDescriptor {
  const stem = input.split(/[?#]/)[0].split('/').pop()!.replace(/\.mp3$/i, '');
  if (/^[123]-[1-9]$/.test(stem)) return { path: `audio/voice/${stem}`, channel: 'voice' };
  if (Object.prototype.hasOwnProperty.call(voices, stem)) return { path: `audio/voice/${voices[stem]}`, channel: 'voice' };
  if (Object.prototype.hasOwnProperty.call(effects, stem)) return { path: `audio/${effects[stem]}`, channel: 'effects' };
  if (stem === 'music' || stem === 'lobby-music') return { path: AudioMusic.hall, channel: 'music' };
  if (stem === 'table-music') return { path: AudioMusic.table, channel: 'music' };
  if (stem === 'preview-30s') return { path: 'audio/preview-30s', channel: 'effects' };
  throw new Error(`Unsupported audio cue: ${input}`);
}
