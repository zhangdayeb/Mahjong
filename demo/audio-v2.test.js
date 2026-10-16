import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from './game-audio.js';
import {normalizeAudioPreferences,mergeAudioPreferences,readAudioPreferences,AUDIO_DEFAULTS} from './audio-preferences.js';
import {audioDescriptor} from './audio-catalog.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(preferences,fetcher){
 const started=[],stopped=[],fetched=[],gains=[],observed=[];let ctx;
 class Context{constructor(){ctx=this;this.state='suspended';this.destination={};this.currentTime=0;}createGain(){const gain={gain:{value:1},connect(target){this.target=target;},disconnect(){}};gains.push(gain);return gain;}createBufferSource(){const source={connect(target){this.target=target;},disconnect(){},start(...args){this.args=args;started.push(this);},stop(){stopped.push(this);},end(){this.onended?.();}};return source;}async resume(){this.state='running';this.onstatechange?.();}async suspend(){this.state='suspended';}async close(){this.state='closed';}async decodeAudioData(bytes){return{file:new TextDecoder().decode(bytes),duration:2};}}
 const engine=createGameAudio({Context,preferences,observe:value=>observed.push(value),fetcher:async url=>{fetched.push(url);if(fetcher)return fetcher(url);return{ok:true,arrayBuffer:async()=>new TextEncoder().encode(url).buffer};}});
 return{engine,started,stopped,fetched,gains,observed,get context(){return ctx;}};
}
test('legacy muted settings keep speech silent on migration, independent new changes preserve animation preferences',()=>{
 assert.equal(normalizeAudioPreferences({sound:false}).voice,false);
 const merged=mergeAudioPreferences({sound:false,effects:false},{sound:true});assert.equal(merged.voice,false);assert.equal(merged.effects,false);
 assert.deepEqual(readAudioPreferences({getItem:()=>'{bad'}),AUDIO_DEFAULTS);
 assert.equal(normalizeAudioPreferences({musicVolume:4}).musicVolume,1);assert.equal(normalizeAudioPreferences({voiceVolume:-2}).voiceVolume,0);assert.equal(normalizeAudioPreferences({effectsVolume:'1'}).effectsVolume,.5);
});
test('old source file paths resolve to Mandarin speech and the new short effects',()=>{
 assert.deepEqual(audioDescriptor('action-result-study/audio/hu.mp3'),{file:'assets/audio-v2/voice/hu.mp3',channel:'voice'});
 assert.equal(audioDescriptor('assets/sounds/3-9.mp3').channel,'voice');assert.equal(audioDescriptor('win').file,'assets/audio-v2/hu-cue.mp3');assert.equal(audioDescriptor('voice/red-kong.mp3').file,'assets/audio-v2/voice/redKong.mp3');
});
test('sound is gated before trusted unlock; repeated unlock has one loop and shared decoded buffers',async()=>{
 const s=setup();assert.equal(await s.engine.play('ui'),false);await s.engine.unlock();await s.engine.unlock();await s.engine.play('ui');await s.engine.play('select');
 assert.equal(s.started.filter(source=>source.loop).length,1);assert.equal(s.fetched.filter(file=>file.endsWith('/ui.mp3')).length,1);assert.equal(s.stopped.length,1);
});
test('speech is serial in request order and music is ducked only while a voice is playing',async()=>{
 const s=setup();await s.engine.unlock();const first=await s.engine.play('1-1');const next=s.engine.play('peng');const third=s.engine.play('hu');assert.equal(first,true);await tick();
 assert.equal(s.started.length,2);assert.equal(s.engine.voiceQueueLength,3);assert.ok(Math.abs(s.gains[0].gain.value-.15*.28)<1e-9);
 s.started[1].end();assert.equal(await next,true);assert.ok(s.started[2].buffer.file.endsWith('/peng.mp3'));s.started[2].end();assert.equal(await third,true);s.started[3].end();await tick();assert.equal(s.gains[0].gain.value,.15);assert.equal(s.engine.voiceQueueLength,0);
});
test('disabling SFX keeps enabled speech and music, muting all cancels the remaining queue',async()=>{
 const s=setup();await s.engine.unlock();s.engine.setPreferences({sound:false});assert.equal(await s.engine.play('discard'),false);assert.equal(await s.engine.play('red'),true);
 const waiting=s.engine.play('zimo');s.engine.setPreferences({muteAll:true});assert.equal(await waiting,false);assert.equal(s.engine.musicPlaying,false);assert.equal(s.engine.voiceQueueLength,0);s.engine.setPreferences({muteAll:false});await s.engine.unlock();assert.equal(s.engine.musicPlaying,true);assert.equal(s.engine.preferences.sound,false);assert.equal(s.engine.preferences.voice,true);
});
test('preview stop cancels a still-loading clip; it cannot sound later when decoded',async()=>{
 let release;const s=setup({music:false},async url=>({ok:true,arrayBuffer:()=>new Promise(resolve=>release=()=>resolve(new TextEncoder().encode(url).buffer))}));await s.engine.unlock();
 const playing=s.engine.play('coin',{preview:true,waitForEnd:true});await tick();s.engine.stopPreview();assert.equal(await playing,false);release();await tick();assert.equal(s.started.length,0);
});
test('rapid repeated effects while decoding replace the pending first request',async()=>{
 let release;const s=setup({music:false},async url=>({ok:true,arrayBuffer:()=>new Promise(resolve=>release=()=>resolve(new TextEncoder().encode(url).buffer))}));await s.engine.unlock();
 const old=s.engine.play('ui');const latest=s.engine.play('select');assert.equal(await old,false);await tick();release();assert.equal(await latest,true);assert.equal(s.started.length,1);
});
test('backgrounding drops queued voices and stale effect loads, then resumes the existing music loop',async()=>{
 const s=setup();await s.engine.unlock();await s.engine.play('red');const queued=s.engine.play('gang');s.engine.pause();assert.equal(await queued,false);assert.equal(s.engine.voiceQueueLength,0);assert.equal(s.context.state,'suspended');await s.engine.unlock();assert.equal(s.started.filter(source=>source.loop).length,1);s.engine.dispose();assert.equal(await s.engine.play('ui'),false);
});
test('table music uses its own loop and quieter gain; independent volume values reach all buses',async()=>{
 const s=setup({musicVolume:.2,effectsVolume:.4,voiceVolume:.7});await s.engine.unlock();s.engine.setScene('table');await tick();
 assert.ok(s.started.at(-1).buffer.file.endsWith('/table-music.mp3'));assert.ok(Math.abs(s.gains[0].gain.value-.13)<1e-9);assert.equal(s.gains[1].gain.value,.4);assert.equal(s.gains[2].gain.value,.7);
});
test('a music audition does not overlap the normal loop and resumes it after cancellation',async()=>{
 const s=setup();await s.engine.unlock();const preview=s.engine.previewMusic();await tick();assert.equal(s.stopped.length,1);await s.engine.unlock();assert.equal(s.started.filter(source=>source.loop).length,1);s.engine.stopPreview();assert.equal(await preview,false);assert.equal(s.started.filter(source=>source.loop).length,2);
});
test('canceling a loading voice releases the pump immediately; later speech need not await the canceled fetch',async()=>{
 let release;const s=setup({music:false},async url=>({ok:true,arrayBuffer:()=>url.endsWith('/red.mp3')?new Promise(resolve=>release=()=>resolve(new TextEncoder().encode(url).buffer)):Promise.resolve(new TextEncoder().encode(url).buffer)}));
 await s.engine.unlock();const old=s.engine.play('red',{preview:true});await tick();s.engine.stopPreview();assert.equal(await old,false);const next=s.engine.play('hu');await tick();assert.equal(s.started.length,1);assert.equal(await next,true);assert.ok(s.started[0].buffer.file.endsWith('/hu.mp3'));release();await tick();assert.equal(s.started.length,1);
});
test('a new round cancels queued table sounds without stopping or duplicating background music',async()=>{
 const s=setup();await s.engine.unlock();await s.engine.play('1-1');const queued=s.engine.play('red');s.engine.cancelTransient();assert.equal(await queued,false);assert.equal(s.engine.voiceQueueLength,0);assert.equal(s.engine.musicPlaying,true);await s.engine.play('shuffle');assert.equal(s.started.filter(source=>source.loop).length,1);assert.ok(s.started.at(-1).buffer.file.endsWith('/shuffle.mp3'));
});
