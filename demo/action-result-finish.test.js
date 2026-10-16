import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {actionFinishMotion} from './action-result-finish.js';
import {createActionResultEffects} from './action-result-effects.js';

test('the detail pass never leaks before arrival or after an authored action ends',()=>{
 for(const [name,duration] of [['hu',1.1],['peng',1.1],['gang',1.1],['zimo',1.1],['qgh',52/30]]){
  for(const time of [-1,0,duration,duration+1])assert.deepEqual(actionFinishMotion(name,time,duration),{titleScale:1,particleAngle:0,particleScale:[1,1],shine:0,shineProgress:0});
  let lit=false;
  for(let time=.01;time<duration;time+=.01){const value=actionFinishMotion(name,time,duration);assert.ok(value.titleScale>=1&&value.titleScale<1.08);assert.ok(value.shine>=0&&value.shine<=1);assert.ok(value.particleScale.every(scale=>scale>.98&&scale<1.07));lit||=value.shine>.5;}
  assert.equal(lit,true,'every supported banner gets a readable metallic sweep');
 }
});

test('paused refined previews keep native timing and resolve cleanly on cancel, clear and dispose',async()=>{
 const names=['fetch','document','Image','Audio','requestAnimationFrame','cancelAnimationFrame','addEventListener','removeEventListener','localStorage'];
 const saved=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)])),mounted=[],scheduled=new Map();let nextFrame=0,nextCanvas=0;
 function canvas(){const element={id:++nextCanvas,commands:[],remove(){const index=mounted.indexOf(this);if(index>=0)mounted.splice(index,1);},setAttribute(){}};
  const context={globalAlpha:1,save(){element.commands.push(['save']);},restore(){element.commands.push(['restore']);},translate(...args){element.commands.push(['translate',...args]);},scale(...args){element.commands.push(['scale',...args]);},rotate(...args){element.commands.push(['rotate',...args]);},clearRect(...args){element.commands.push(['clear',...args]);},drawImage(image,...args){element.commands.push(['draw',image.src||image.id,...args]);},fillRect(){},createLinearGradient(){return {addColorStop(){}};}};
  element.getContext=()=>context;return element;
 }
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});
  globalThis.document={head:{append(){}},querySelector(){return null;},createElement:tag=>tag==='canvas'?canvas():{dataset:{}}};
  globalThis.Image=class{async decode(){}};globalThis.Audio=class{pause(){}async play(){}};
  globalThis.requestAnimationFrame=callback=>{scheduled.set(++nextFrame,callback);return nextFrame;};globalThis.cancelAnimationFrame=id=>scheduled.delete(id);
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.localStorage={getItem:()=>'{"effects":true}'};
  const effects=await createActionResultEffects({append:element=>mounted.push(element)},{sound:false});
  const original=effects.play('hu',1,{paused:true,time:.48,style:'original'}),originalDraws=mounted[0].commands.filter(command=>command[0]==='draw').length;
  const refined=effects.play('hu',1,{paused:true,time:.48}),preview=mounted[1];assert.equal(refined.durationMs,original.durationMs);assert.equal(refined.durationMs,1100);
  assert.ok(preview.commands.filter(command=>command[0]==='draw').length>originalDraws,'finish layers overlay rather than replace the native silhouettes');
  assert.equal(scheduled.size,0,'a paused preview must not queue animation frames');
  const initialCommands=preview.commands.slice();preview.commands.length=0;effects.update(refined.startTime+10000);assert.deepEqual(preview.commands,initialCommands,'future clocks must not advance a paused preview');
  refined.cancel();assert.equal((await refined.finished).cancelled,true);const lastDraw=preview.commands.length;effects.update(refined.startTime+20000);assert.equal(preview.commands.length,lastDraw,'cancelled refinements never redraw');
  const animated=effects.play('qgh',2);assert.equal(animated.durationMs,52/30*1000);effects.clear();assert.equal((await original.finished).cancelled,true);assert.equal((await animated.finished).cancelled,true);assert.equal(mounted.length,0);assert.equal(scheduled.size,0);
  effects.dispose();assert.equal((await effects.play('zimo').finished).reason,'disposed');
 }finally{for(const[name,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
});
