import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {computeTableLayout} from './table-layout.js';
import {NATIVE_KONG_TIMINGS,nativeKongEffectAllowed,nativeCPGSmokePlacement,nativeKongPlacement,nativeKongLayerState,createNativeKongEffects} from './native-kong-effects.js';
const metadata=JSON.parse(fs.readFileSync(new URL('native-kong-study/effects.json',import.meta.url)));
const frames=JSON.parse(fs.readFileSync(new URL('native-kong-study/frames.json',import.meta.url)));
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('all native sprite keys have extracted frames; rain and wind retain their half-speed lifetime',()=>{
 const byUUID=new Map(frames.map(frame=>[frame.uuid,frame]));assert.equal(byUUID.size,40);
 for(const[kind,definition]of Object.entries(metadata.definitions)){
  close(definition.durationMs,NATIVE_KONG_TIMINGS[kind]);
  close(definition.durationMs,definition.clipDuration/definition.speed*1000);
  for(const layer of definition.layers){assert.equal(layer.sizeMode,2);assert.equal(layer.trim,false);}
  for(const branch of Object.values(definition.tracks.paths))for(const key of branch.comps?.['cc.Sprite']?.spriteFrame||[]){const frame=byUUID.get(key.value);assert.ok(frame,'frame '+key.value);assert.ok(fs.existsSync(new URL(frame.image,import.meta.url)),frame.image);}
 }
 assert.equal(metadata.definitions.rain.speed,.5);assert.equal(metadata.definitions.wind.speed,.5);
 assert.equal(metadata.locking.ambientAdditionalMs,0);assert.equal(metadata.locking.gangMs,1030);
});

test('rain waits one source frame, and wind clip scale overrides the serialized prefab scale',()=>{
 const rain=metadata.definitions.rain;
 assert.ok(nativeKongLayerState(rain,0).every(layer=>!layer.active));
 assert.ok(nativeKongLayerState(rain,34).every(layer=>layer.active));
 const ordinary=nativeKongLayerState(rain,200)[0],additive=nativeKongLayerState(rain,200)[1];
 assert.equal(ordinary.sprite,'7ed0201c-9f80-429a-8d48-ad985f8e8bcf');
 assert.equal(additive.sprite,'256951b4-02c7-4eaf-982f-677687fec566');assert.equal(additive.blend,1);
 assert.ok(nativeKongLayerState(rain,2200).every(layer=>!layer.active));
 const wind=metadata.definitions.wind;assert.deepEqual(wind.layers[0].scale,[1.5,1.5,1]);
 assert.deepEqual(nativeKongLayerState(wind,100)[0].scale,[3,3]);assert.equal(wind.root.runtimeScale,3);
 close(nativeKongLayerState(wind,100)[0].scale[0]*wind.root.runtimeScale,9);
});

test('ambient roots use overwritten centered coordinates and preserve native room exclusions',()=>{
 const table=computeTableLayout();
 assert.deepEqual(nativeKongPlacement('rain',table).point,[640,320]);close(nativeKongPlacement('wind',table).point[1],497.77777777777777);
 assert.deepEqual(metadata.definitions.wind.root.position,[0,-20,0]);assert.deepEqual(metadata.definitions.wind.position,[0,-200]);
 assert.equal(nativeKongEffectAllowed('rain',850),false);assert.equal(nativeKongEffectAllowed('wind','850'),false);
 assert.equal(nativeKongEffectAllowed('smoke',850),true);assert.equal(nativeKongEffectAllowed('rain',863),true);
 assert.equal(nativeKongEffectAllowed('wind',866),true);assert.equal(nativeKongEffectAllowed('invented-effect',863),false);
});

test('CPG smoke uses native direction offsets and signed CPG parent scale rather than a seat center',()=>{
 const table=computeTableLayout(),edge=[120,-80];
 for(let seat=0;seat<4;seat++){
  const placement=nativeCPGSmokePlacement(table,seat,edge),cpg=table.seats[seat].meld,offset=metadata.smoke.directionOffsets[metadata.smoke.localToDirection[seat]];
  close(placement.point[0],cpg.origin[0]+(edge[0]+offset[0])*cpg.scale[0]);close(placement.point[1],cpg.origin[1]-(edge[1]+offset[1])*cpg.scale[1]);
  assert.deepEqual(placement.parentScale,cpg.scale);
 }
 assert.ok(nativeCPGSmokePlacement(table,1,edge).parentScale[0]<0);
 assert.equal(nativeKongPlacement('smoke',table),null);
});

test('clearing a pending or playing native clip resolves cancellation; wind draws original raw frame and scale',async()=>{
 const keys=['document','Image','Audio','fetch','requestAnimationFrame','cancelAnimationFrame','addEventListener','removeEventListener','localStorage'],saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
 const calls=[],rafs=new Map();let serial=0;
 function node(){return {children:[],dataset:{},setAttribute(){},append(...children){this.children.push(...children);},remove(){this.removed=true;},getContext(){return {save(){},restore(){},clearRect(){},translate(...args){calls.push(['translate',...args]);},rotate(){},scale(...args){calls.push(['scale',...args]);},drawImage(...args){calls.push(['drawImage',...args.slice(1)]);},globalAlpha:1};}};}
 globalThis.document={querySelector(){return null;},createElement:node,head:node()};globalThis.Image=class{decode(){return Promise.resolve();}};globalThis.Audio=class{play(){return Promise.resolve();}pause(){}};
 globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});globalThis.localStorage={getItem(){return '{}';}};
 globalThis.requestAnimationFrame=fn=>{rafs.set(++serial,fn);return serial;};globalThis.cancelAnimationFrame=id=>rafs.delete(id);globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
 try{
  const parent=node(),effects=createNativeKongEffects(parent);const pending=effects.play({kind:'rain'});effects.clear();assert.deepEqual(await pending.finished,{kind:'rain',seat:0,cancelled:true});await effects.ready;assert.equal(effects.running,0);
  const wind=effects.play({kind:'wind',paused:true,timeMs:100});await Promise.resolve();assert.equal(effects.running,1);close(wind.durationMs,1166.6666666666667);assert.equal(wind.lockingMs,0);
  assert.ok(calls.some(call=>call[0]==='translate'&&call[1]===640&&Math.abs(call[2]-497.77777777777777)<1e-7));
  assert.ok(calls.some(call=>call[0]==='scale'&&Math.abs(call[1]-8/3)<1e-7));assert.ok(calls.some(call=>call[0]==='scale'&&call[1]===3&&call[2]===3));
  const draw=calls.find(call=>call[0]==='drawImage');assert.deepEqual(draw.slice(1,5),[0,0,99,119]);close(draw[6],-83.3);
  effects.clear();assert.deepEqual(await wind.finished,{kind:'wind',seat:0,cancelled:true});assert.ok(parent.children[0].removed);
  const rain=effects.play({kind:'rain'});await Promise.resolve();effects.update(performance.now()+3000);assert.deepEqual(await rain.finished,{kind:'rain',seat:0,cancelled:false});
  const excluded=effects.play({kind:'wind',gameType:850});assert.equal(excluded.reason,'native-room-excluded');assert.equal(excluded.durationMs,0);
  effects.dispose();assert.equal(effects.running,0);
 }finally{for(const key of keys)if(saved[key]===undefined)delete globalThis[key];else globalThis[key]=saved[key];}
});
