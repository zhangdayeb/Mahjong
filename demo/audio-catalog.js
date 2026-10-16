const ROOT='assets/audio-v2/';
const effects={select:'ui',ui:'ui',draw:'draw',outtile:'discard',discard:'discard',saizi:'shuffle',shuffle:'shuffle',dingque:'dingque',win:'hu-cue','hu-cue':'hu-cue',coin:'coin',countdown:'countdown',wind:'wind',rain:'rain','settlement-win':'settlement-win','settlement-end':'settlement-neutral','settlement-neutral':'settlement-neutral'};
const voices={red:'red',peng:'peng',gang:'gang',hu:'hu',zimo:'zimo',qgh:'qgh',redKong:'redKong','red-kong':'redKong',reveal:'reveal'};
export const AUDIO_MUSIC=Object.freeze({hall:ROOT+'lobby-music.mp3',table:ROOT+'table-music.mp3'});
export const AUDIO_PREVIEW_EVENTS=Object.freeze([
 [1,'ui'],[3,'shuffle'],[5,'draw'],[6,'discard'],[6.08,'1-1'],[9,'discard'],[9.08,'2-3'],[12,'peng'],[15,'gang'],[18,'discard'],[18.08,'red'],[21,'hu-cue'],[21.08,'hu'],[23.3,'hu-cue'],[23.38,'zimo'],[26,'coin'],[28.2,'settlement-win']
].map(([at,name])=>Object.freeze({at,name})));
// Legacy renderers retain their source metadata; only their audio is routed to
// the new shared collection. No scoring or animation data is changed here.
export function audioDescriptor(input){
 const file=String(input),stem=file.split(/[?#]/)[0].split('/').at(-1).replace(/\.mp3$/i,'');
 if(/^[123]-[1-9]$/.test(stem))return{file:ROOT+'voice/'+stem+'.mp3',channel:'voice'};
 if(Object.hasOwn(voices,stem))return{file:ROOT+'voice/'+voices[stem]+'.mp3',channel:'voice'};
 if(Object.hasOwn(effects,stem))return{file:ROOT+effects[stem]+'.mp3',channel:'effects'};
 if(stem==='music'||stem==='lobby-music')return{file:AUDIO_MUSIC.hall,channel:'music'};
 if(stem==='table-music')return{file:AUDIO_MUSIC.table,channel:'music'};
 return{file:file.includes('/')||/\.mp3$/i.test(file)?file:ROOT+file+'.mp3',channel:'effects'};
}
