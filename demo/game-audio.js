import {audioDescriptor,AUDIO_MUSIC,AUDIO_PREVIEW_EVENTS} from './audio-catalog.js';
import {readAudioPreferences,normalizeAudioPreferences,mergeAudioPreferences} from './audio-preferences.js';
export {readAudioPreferences} from './audio-preferences.js';
const BASE=new URL('.',import.meta.url);
const clamp=value=>Number.isFinite(value)?Math.max(0,Math.min(1,value)):1;

export function createGameAudio({Context=globalThis.AudioContext||globalThis.webkitAudioContext,fetcher=url=>fetch(url),preferences=readAudioPreferences(),observe=()=>{},scene='hall'}={}){
 let context=null,unlocked=false,disposed=false,paused=false,settings=normalizeAudioPreferences(preferences),music=null,musicLoading=null,musicPreview=null,musicEpoch=0,previewEpoch=0,playCount=0,activeVoice=null,pumping=null;
 let musicGain,effectGain,voiceGain;
 const cache=new Map(),sources=new Map(),pendingEffects=new Set(),voiceQueue=[],epochs={music:0,effects:0,voice:0};
 function allowed(channel){return !disposed&&!paused&&unlocked&&!settings.muteAll&&settings[channel==='effects'?'sound':channel]&&settings[channel+'Volume']>0&&context?.state==='running';}
 function report(error=''){observe({state:context?.state||'waiting',music:!!music,sound:settings.sound,voice:settings.voice,muteAll:settings.muteAll,musicEnabled:settings.music,scene,playCount,voiceQueue:voiceQueue.length+(activeVoice?1:0),musicVolume:settings.musicVolume,effectsVolume:settings.effectsVolume,voiceVolume:settings.voiceVolume,ducked:!!activeVoice?.source,error});}
 function ramp(node,target){if(!node)return;const now=context.currentTime||0;node.gain.cancelScheduledValues?.(now);if(node.gain.setTargetAtTime)node.gain.setTargetAtTime(target,now,.06);else node.gain.value=target;}
 function applyGains(){ramp(musicGain,settings.muteAll||!settings.music?0:settings.musicVolume*(scene==='table'?.65:1)*(activeVoice?.source ? .28 : 1));ramp(effectGain,settings.muteAll||!settings.sound?0:settings.effectsVolume);ramp(voiceGain,settings.muteAll||!settings.voice?0:settings.voiceVolume);}
 function getContext(){if(!context){if(!Context)return null;context=new Context();musicGain=context.createGain();effectGain=context.createGain();voiceGain=context.createGain();for(const gain of[musicGain,effectGain,voiceGain])gain.connect(context.destination);applyGains();context.onstatechange=()=>report();}return context;}
 function buffer(file){const url=new URL(file,BASE).href;if(!cache.has(url)){const task=fetcher(url).then(response=>{if(!response.ok)throw Error('音频资源加载失败：'+response.status);return response.arrayBuffer();}).then(bytes=>context.decodeAudioData(bytes));cache.set(url,task);task.catch(()=>cache.delete(url));}return cache.get(url);}
 function settle(job,value){if(job.settled)return;job.settled=true;job.resolve(value);}
 function finish(job,value=true){if(job.finished)return;job.finished=true;pendingEffects.delete(job);sources.delete(job.source);job.source?.disconnect();job.gain?.disconnect();if(activeVoice===job){activeVoice=null;applyGains();}settle(job,value);report();if(job.channel==='voice')queueMicrotask(()=>void pumpVoice());}
 function cancel(job){if(job.finished)return;job.cancelled=true;if(activeVoice===job&&!job.source)pumping=null;try{job.source?.stop();}catch{}finish(job,false);}
 function clearVoices(predicate=()=>true){for(let i=voiceQueue.length-1;i>=0;i--)if(predicate(voiceQueue[i])){const[job]=voiceQueue.splice(i,1);cancel(job);}if(activeVoice&&predicate(activeVoice))cancel(activeVoice);}
 function stopMusic(){musicEpoch++;musicLoading=null;if(music){try{music.stop();}catch{}music.disconnect();music=null;}report();}
 async function startMusic(){
  if(!allowed('music')||music||musicPreview)return;
  if(musicLoading)return musicLoading;
  const epoch=musicEpoch,file=AUDIO_MUSIC[scene]||AUDIO_MUSIC.hall;
  const task=(async()=>{try{const data=await buffer(file);if(epoch!==musicEpoch||!allowed('music')||music)return;music=context.createBufferSource();music.buffer=data;music.loop=true;music.connect(musicGain);music.start();report();}catch(error){if(epoch===musicEpoch)report(error.message);}})();
  musicLoading=task;try{await task;}finally{if(musicLoading===task)musicLoading=null;}
 }
 function startJob(job,data){
  if(job.finished)return;
  if(job.cancelled||job.epoch!==epochs[job.channel]||job.preview&&job.previewEpoch!==previewEpoch||!allowed(job.channel)){finish(job,false);return;}
  pendingEffects.delete(job);
  const source=context.createBufferSource(),gain=context.createGain();job.source=source;job.gain=gain;source.buffer=data;
  // Old callers use .5 as their normal clip gain. Make that the neutral clip
  // level; the three user sliders provide the actual shared mix.
  gain.gain.value=clamp(job.volume*2);source.connect(gain);gain.connect({music:musicGain,effects:effectGain,voice:voiceGain}[job.channel]);sources.set(source,job);
  source.onended=()=>finish(job,true);
  if(job.channel==='voice'){activeVoice=job;applyGains();}
  if(job.duration>0)source.start(0,0,Math.min(data.duration||job.duration,job.duration));else source.start();
  playCount++;if(!job.waitForEnd)settle(job,true);report();
 }
 async function pumpVoice(){
  if(pumping||activeVoice)return;const token={};pumping=token;
  try{while(pumping===token&&!activeVoice&&voiceQueue.length){const job=voiceQueue.shift();activeVoice=job;
   try{const data=await buffer(job.file);if(pumping!==token){finish(job,false);return;}startJob(job,data);}catch(error){finish(job,false);if(!job.cancelled)report(error.message);}
   if(activeVoice===job&&!job.source){activeVoice=null;applyGains();}
  }}finally{if(pumping===token){pumping=null;if(!activeVoice&&voiceQueue.length)void pumpVoice();}}
 }
 const api={
  async unlock(){if(disposed)return;const ctx=getContext();if(!ctx){report('浏览器不支持音频播放');return;}unlocked=true;paused=false;try{await ctx.resume();report();await startMusic();}catch(error){report(error.message);}},
  play(input,{volume=.5,replace=true,channel,waitForEnd=false,duration,preview=false}={}){
   const descriptor=audioDescriptor(input);channel??=descriptor.channel;
   if(!Object.hasOwn(epochs,channel)||!allowed(channel))return Promise.resolve(false);
   let resolve;const result=new Promise(done=>resolve=done),job={file:descriptor.file,url:new URL(descriptor.file,BASE).href,channel,volume,waitForEnd,duration,preview,previewEpoch,epoch:epochs[channel],resolve};
   if(channel==='voice'){voiceQueue.push(job);report();void pumpVoice();}
   else{if(replace)api.stop(job.file);pendingEffects.add(job);buffer(job.file).then(data=>startJob(job,data)).catch(error=>{finish(job,false);report(error.message);});}
   return result;
  },
  stop(input){const url=new URL(audioDescriptor(input).file,BASE).href;clearVoices(job=>job.url===url);for(const job of[...pendingEffects,...sources.values()])if(job.url===url)cancel(job);},
  stopPreview(){previewEpoch++;clearVoices(job=>job.preview);for(const job of[...pendingEffects,...sources.values()])if(job.preview)cancel(job);},
  cancelTransient(){epochs.effects++;epochs.voice++;clearVoices();for(const job of[...pendingEffects,...sources.values()])if(job.channel!=='music')cancel(job);},
  async previewMusic(){const token={};musicPreview=token;stopMusic();try{return await api.play(AUDIO_MUSIC[scene]||AUDIO_MUSIC.hall,{channel:'music',volume:.5,duration:5,waitForEnd:true,preview:true});}finally{if(musicPreview===token){musicPreview=null;await startMusic();}}},
  setPreferences(value){const next=normalizeAudioPreferences({...settings,...value});
   settings=next;
   for(const channel of['music','effects','voice']){const key=channel==='effects'?'sound':channel;if(next.muteAll||!next[key]||next[channel+'Volume']===0){epochs[channel]++;if(channel==='voice')clearVoices();for(const job of[...pendingEffects,...sources.values()])if(job.channel===channel)cancel(job);}}
   applyGains();if(settings.muteAll||!settings.music||settings.musicVolume===0)stopMusic();else void startMusic();report();
  },
  setScene(value){const next=value==='table'?'table':'hall';if(next===scene)return;scene=next;stopMusic();applyGains();void startMusic();},
  pause(){paused=true;for(const channel of Object.keys(epochs))epochs[channel]++;clearVoices();for(const job of[...pendingEffects,...sources.values()])cancel(job);if(context?.state==='running')void context.suspend();report();},
  dispose(){disposed=true;api.pause();stopMusic();void context?.close();},
  get state(){return context?.state||'waiting';},get musicPlaying(){return!!music;},get playCount(){return playCount;},get voiceQueueLength(){return voiceQueue.length+(activeVoice?1:0);},get preferences(){return{...settings};}
 };
 report();return api;
}

let engine=null,installed=false,preview=null,previewNumber=0;
function audio(){if(!engine){const marker=typeof document==='undefined'||!document.body?null:document.createElement('span');if(marker){marker.id='game-audio-status';marker.hidden=true;marker.setAttribute('aria-hidden','true');document.body.append(marker);}engine=createGameAudio({scene:typeof document!=='undefined'&&document.querySelector('#game')?'table':'hall',observe:value=>{if(marker)for(const[key,data]of Object.entries(value))marker.dataset[key]=String(data);}});}return engine;}
export function playGameSound(name,volume=.5){return audio().play(name,{volume});}
export function stopGameSound(file){engine?.stop(file);}
export function stopTransientAudio(){stopAudioPreview();engine?.cancelTransient();}
export function createGameClip(file,volume=.5){let level=volume;return{currentTime:0,get volume(){return level;},set volume(value){level=clamp(value);},play:()=>audio().play(file,{volume:level}),pause:()=>stopGameSound(file)};}
export function updateGameAudioPreferences(value){let previous={};try{previous=JSON.parse(localStorage.getItem('MAHJONG_SETTINGS')||'{}');}catch{}const combined=mergeAudioPreferences(previous,value);localStorage.setItem('MAHJONG_SETTINGS',JSON.stringify(combined));audio().setPreferences(readAudioPreferences());}
export function stopAudioPreview(){previewNumber++;if(preview){for(const timer of preview.timers)clearTimeout(timer);preview.resolve(false);preview=null;}engine?.stopPreview();}
export async function previewGameAudio(kind='all'){
 stopAudioPreview();const token=previewNumber,player=audio();await player.unlock();if(token!==previewNumber)return false;const prefs=player.preferences;
 if(prefs.muteAll)throw Error('请先恢复声音，再试听。');
 const channel=kind==='effects'?'sound':kind;if(kind!=='all'&&(!prefs[channel]||prefs[(kind==='effects'?'effects':kind)+'Volume']===0))throw Error('请先开启这一项并调高音量。');
 if(kind==='music')return player.previewMusic();
 if(kind==='voice')return player.play('red',{waitForEnd:true,preview:true});
 const events=kind==='effects'?[{at:0,name:'ui'},{at:.35,name:'draw'},{at:.75,name:'discard'},{at:1.1,name:'hu-cue'},{at:1.6,name:'coin'}]:AUDIO_PREVIEW_EVENTS;
 const duration=kind==='effects'?2.8:30;
 return new Promise(resolve=>{const job={timers:new Set(),resolve};preview=job;
  for(const event of events){const timer=setTimeout(()=>{job.timers.delete(timer);if(preview===job&&previewNumber===token)void player.play(event.name,{preview:true});},event.at*1000);job.timers.add(timer);}
  const timer=setTimeout(()=>{job.timers.delete(timer);if(preview===job){player.stopPreview();preview=null;resolve(true);}},duration*1000);job.timers.add(timer);
 });
}
export function installGameAudio({ui=true,scene}={}){
 if(installed)return audio();installed=true;const player=audio();if(scene)player.setScene(scene);
 const unlock=event=>{if(event.isTrusted)void player.unlock();};document.addEventListener('pointerdown',unlock,true);document.addEventListener('keydown',unlock,true);
 document.addEventListener('click',event=>{if(!event.isTrusted)return;const ready=player.unlock();if(ui&&!event.target.closest?.('#hand-layer,[data-audio-preview],.lz-audio-settings')&&event.target.closest?.('button,a,[role="button"],[role="tab"]'))void ready.then(()=>playGameSound('select',.5));},true);
 addEventListener('storage',event=>{if(event.key==='MAHJONG_SETTINGS')player.setPreferences(readAudioPreferences());});
 addEventListener('pagehide',event=>{stopAudioPreview();event.persisted?player.pause():player.dispose();});
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){stopAudioPreview();player.pause();}else if(player.state!=='waiting')void player.unlock();});
 return player;
}
