export const AUDIO_DEFAULTS=Object.freeze({music:true,sound:true,voice:true,muteAll:false,musicVolume:.15,effectsVolume:.5,voiceVolume:.65});
function volume(value,fallback){return typeof value==='number'&&Number.isFinite(value)?Math.min(1,Math.max(0,value)):fallback;}
export function normalizeAudioPreferences(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))value={};
 return{music:value.music!==false,sound:value.sound!==false,voice:typeof value.voice==='boolean'?value.voice:value.sound!==false,muteAll:value.muteAll===true,musicVolume:volume(value.musicVolume,AUDIO_DEFAULTS.musicVolume),effectsVolume:volume(value.effectsVolume,AUDIO_DEFAULTS.effectsVolume),voiceVolume:volume(value.voiceVolume,AUDIO_DEFAULTS.voiceVolume)};
}
export function readAudioPreferences(storage=globalThis.localStorage){try{return normalizeAudioPreferences(JSON.parse(storage?.getItem('MAHJONG_SETTINGS')||'{}'));}catch{return{...AUDIO_DEFAULTS};}}
export function mergeAudioPreferences(previous={},changes={}){return{...previous,...readAudioPreferences({getItem:()=>JSON.stringify(previous)}),...changes};}
