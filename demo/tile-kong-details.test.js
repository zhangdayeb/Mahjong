import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {drawHuLandingDetails,drawKongDetails} from './tile-kong-details.js';
import {createTileResultEffects} from './tile-result-effects.js';
import {createNativeKongEffects,NATIVE_KONG_TIMINGS} from './native-kong-effects.js';

function drawingContext(calls){
 const state=[];
 return {globalAlpha:1,globalCompositeOperation:'source-over',
  save(){state.push({globalAlpha:this.globalAlpha,globalCompositeOperation:this.globalCompositeOperation});},restore(){Object.assign(this,state.pop());},
  clearRect(){},translate(...args){calls.push(['translate',...args]);},rotate(...args){calls.push(['rotate',...args]);},scale(...args){calls.push(['scale',...args]);},drawImage(...args){calls.push(['drawImage',...args.slice(1)]);},
  getImageData(){return {data:new Uint8ClampedArray(64).fill(255)};},putImageData(){},
  beginPath(){calls.push(['beginPath']);},moveTo(...args){calls.push(['moveTo',...args]);},lineTo(...args){calls.push(['lineTo',...args]);},stroke(){calls.push(['stroke']);},ellipse(...args){calls.push(['ellipse',...args]);},arc(...args){calls.push(['arc',...args]);},fill(){calls.push(['fill']);}
 };
}

async function withBrowser(run){
 const keys=['document','Image','Audio','fetch','requestAnimationFrame','cancelAnimationFrame','addEventListener','removeEventListener','localStorage','setTimeout','clearTimeout'];
 const saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]])),calls=[],timers=new Map(),rafs=new Map();let serial=0;
 function node(){return {children:[],dataset:{},width:4,height:4,hidden:false,setAttribute(){},append(...children){this.children.push(...children);},remove(){this.removed=true;},getContext(){return drawingContext(calls);}};}
 globalThis.document={querySelector(){return null;},querySelectorAll(){return [];},createElement:node,head:node()};
 globalThis.Image=class{width=4;height=4;decode(){return Promise.resolve();}};
 globalThis.Audio=class{play(){return Promise.resolve();}pause(){}};
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});
 globalThis.localStorage={getItem(){return '{}';}};
 globalThis.setTimeout=fn=>{timers.set(++serial,fn);return serial;};globalThis.clearTimeout=id=>timers.delete(id);
 globalThis.requestAnimationFrame=fn=>{rafs.set(++serial,fn);return serial;};globalThis.cancelAnimationFrame=id=>rafs.delete(id);
 globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
 try{await run({node,calls,timers,rafs});}finally{for(const key of keys)if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];}
}

test('detail overlays stay local, fade within the source lifetime, and tolerate minimal canvas renderers',()=>{
 assert.equal(drawHuLandingDetails({},.4),false);assert.equal(drawKongDetails({},'wind',300,1167),false);
 for(const [draw,duration] of [[(ctx,t)=>drawHuLandingDetails(ctx,t),7/6],[(ctx,t)=>drawKongDetails(ctx,'wind',t,1167),1167],[(ctx,t)=>drawKongDetails(ctx,'rain',t,2167),2167]]){
  const calls=[],ctx=drawingContext(calls);ctx.globalAlpha=.7;
  assert.equal(draw(ctx,0),false);assert.equal(draw(ctx,duration),false);
  assert.equal(draw(ctx,duration*.4),true);assert.equal(ctx.globalAlpha,.7);assert.equal(ctx.globalCompositeOperation,'source-over');
  for(const call of calls)for(const value of call.slice(1))assert.ok(Number.isFinite(value));
  assert.ok(calls.some(call=>call[0]==='stroke'));
 }
 const calls=[],ctx=drawingContext(calls);assert.equal(drawHuLandingDetails(ctx,.4,'meldSmoke'),false);assert.equal(drawKongDetails(ctx,'smoke',300,784),false);assert.equal(calls.length,0);
});

test('original/refined HU preview retains every sprite and the history root while changing only detail layers',async()=>withBrowser(async({node,calls})=>{
 const effects=createTileResultEffects(node());await effects.ready;
 const options={x:421,y:283,scale:1.2,time:.33};
 await effects.preview({...options,style:'original'});const original=calls.splice(0);
 await effects.preview({...options,style:'refined'});const refined=calls.splice(0);
 assert.deepEqual(original.filter(c=>c[0]==='drawImage'&&c.length===9),refined.filter(c=>c[0]==='drawImage'&&c.length===9));
 assert.deepEqual(original.find(c=>c[0]==='translate'),['translate',421,283]);assert.deepEqual(refined.find(c=>c[0]==='translate'),['translate',421,283]);
 assert.equal(original.some(c=>c[0]==='stroke'),false);assert.equal(refined.some(c=>c[0]==='stroke'),true);
 assert.notDeepEqual(original.filter(c=>c[0]==='rotate'),refined.filter(c=>c[0]==='rotate'));
 assert.equal(effects.durationMs,1166.6666666666667);effects.destroy();assert.equal(effects.active,false);
}));

test('simultaneous HU jobs still cancel together and delayed jobs keep their duration metadata',async()=>withBrowser(async({node,timers,rafs,calls})=>{
 const effects=createTileResultEffects(node());const pending=effects.playHu(320,280);effects.clear();assert.deepEqual(await pending,{cancelled:true});await effects.ready;
 let finishedCallbacks=0;
 const a=effects.playHu(310,250,{onFinished:()=>finishedCallbacks++}),b=effects.playHu(720,280,{delayMs:180,onFinished:()=>finishedCallbacks++});
 assert.equal(a.durationMs,effects.durationMs);assert.equal(b.durationMs,effects.durationMs+180);
 await Promise.resolve();for(const callback of timers.values())callback();timers.clear();
 const [frameID,tick]=rafs.entries().next().value;rafs.delete(frameID);tick(performance.now()+330);
 assert.ok(calls.some(c=>c[0]==='translate'&&c[1]===310&&c[2]===250));assert.ok(calls.some(c=>c[0]==='translate'&&c[1]===720&&c[2]===280));assert.equal(effects.active,true);
 effects.cancel();assert.deepEqual(await a,{cancelled:true});assert.deepEqual(await b,{cancelled:true});assert.equal(finishedCallbacks,0);assert.equal(effects.active,false);assert.equal(rafs.size,0);effects.destroy();
}));

test('refined wind/rain keep native placement, sprite geometry, lifetime and zero extra locking',async()=>withBrowser(async({node,calls})=>{
 const effects=createNativeKongEffects(node(),{sound:false});await effects.ready;
 for(const kind of ['wind','rain']){
  const options={kind,paused:true,timeMs:300,silent:true};
  const original=effects.play({...options,style:'original'});await Promise.resolve();const first=calls.splice(0);original.cancel();
  const refined=effects.play({...options,style:'refined'});await Promise.resolve();const second=calls.splice(0);
  assert.deepEqual(first.filter(c=>c[0]==='drawImage'),second.filter(c=>c[0]==='drawImage'));assert.deepEqual(first.find(c=>c[0]==='translate'),second.find(c=>c[0]==='translate'));
  assert.equal(first.some(c=>c[0]==='stroke'),false);assert.equal(second.some(c=>c[0]==='stroke'),true);assert.equal(refined.durationMs,NATIVE_KONG_TIMINGS[kind]);assert.equal(refined.lockingMs,0);
  effects.clear();assert.deepEqual(await refined.finished,{kind,seat:0,cancelled:true});assert.equal(effects.running,0);
 }
 effects.dispose();
}));
