import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
import {actionResultLayout,sampleResultLayers,sampleResultTrack,createActionResultEffects,actionSpriteRect} from './action-result-effects.js';
const read=name=>JSON.parse(fs.readFileSync(new URL('action-result-study/'+name,import.meta.url)));
const data=read('effects.json'),frames=read('frames.json');
function decoded(name){const raw=read(name);if(!Array.isArray(raw[7]))raw[7]=[];if(!Array.isArray(raw[8]))raw[8]=[];return decodeCompiled(raw).instances;}

test('result banners use actual common_cpgh prefabs and exact native clip, not teaching circles',()=>{
 const clip=decoded('raw/resources-2697.json')[0];
 assert.equal(clip._name,'cpgh_anima');assert.equal(clip._duration,1.1);assert.equal(clip.sample,20);
 for(const [name,id]of[['hu',1402],['peng',1315],['gang',806],['zimo',2907]]){
  const def=data.definitions[name],nodes=decoded(`raw/resources-${id}.json`).filter(node=>node?.class==='cc.Node');
  assert.equal(def.source.prefabId,id);assert.deepEqual(def.tracks,clip.curveData);assert.equal(def.duration,1.1);
  assert.equal(def.layers.length,2);assert.deepEqual(def.root.trs,nodes[0]._trs);
  for(const layer of def.layers){const node=nodes.find(n=>n._name===layer.name),sprite=node._components.find(c=>c.class==='cc.Sprite');assert.equal(layer.sprite,sprite._spriteFrame);assert.equal(layer.sizeMode,2);assert.equal(layer.trim,false);assert.deepEqual(layer.size,node._contentSize);}
 }
});

test('four banner anchors and 8/9 scale come from GameAnimLayer, with source seat remapping',()=>{
 const nodes=decoded('raw/prefabs-1855.json').filter(n=>n?.class==='cc.Node'),node=nodes.find(n=>n._name==='anim_CPGH'),cpg=node._components.find(c=>c.animPos);
 assert.deepEqual(data.layout.positions,cpg.animPos);
 assert.deepEqual(data.layout.content.trs,node._trs);
 const layout=actionResultLayout(data.layout);
 assert.equal(layout.scale,8/9);
 const expected=[[640,320+140*8/9],[640+360*8/9,320-74*8/9],[640,320-250*8/9],[640-384*8/9,320-74*8/9]];
 layout.positions.forEach((point,i)=>point.forEach((value,j)=>assert.ok(Math.abs(value-expected[i][j])<1e-10)));
});

test('baked coin sequence follows original discrete 20fps keys and exact banner movement/fade',()=>{
 const def=data.definitions.hu,keys=def.tracks.paths.hupai_lizi_0000.comps['cc.Sprite'].spriteFrame;
 assert.equal(keys.length,18);assert.equal(new Set(keys.map(key=>key.value)).size,17);
 for(let i=0;i<keys.length;i++){
  const state=sampleResultLayers(def,keys[i].frame+.00001),coin=state.find(l=>l.name==='hupai_lizi_0000');
  assert.equal(coin.sprite,keys[i].value);assert.ok(frames.some(frame=>frame.uuid===coin.sprite));
 }
 const at=time=>sampleResultLayers(def,time).find(l=>l.name==='zi_hu');
 assert.deepEqual(at(0).position,[-140,-15.8,0]);assert.equal(at(0).opacity,0);
 assert.ok(Math.abs(at(.15).position[0]+20.5)<1e-10);assert.deepEqual(at(.15).position.slice(1),[-15.8,0]);assert.equal(at(.15).opacity,255);
 assert.deepEqual(at(.4).position,[18,-15.8,0]);assert.equal(at(.95).opacity,0);
 assert.ok(Math.abs(sampleResultLayers(def,.175).find(l=>l.name==='hupai_lizi_0000').opacity-127.5)<1e-10);
});

test('every extracted sprite retains its native originalSize canvas and occupied rect offset',()=>{
 for(const frame of frames){const png=fs.readFileSync(new URL(frame.image,import.meta.url));assert.equal(png.readUInt32BE(16),frame.originalSize[0]);assert.equal(png.readUInt32BE(20),frame.originalSize[1]);}
 assert.equal(sampleResultTrack([{frame:0,value:false},{frame:.3,value:true}],.29,true,{discrete:true}),false);
 assert.equal(sampleResultTrack([{frame:0,value:false},{frame:.3,value:true}],.3,false,{discrete:true}),true);
});

test('QGH uses its own native seven-layer 30fps clip and vector-scale tracks',()=>{
 const def=data.definitions.qgh,clip=decoded('raw/resources-2954.json')[0],nodes=decoded('raw/resources-2569.json').filter(n=>n?.class==='cc.Node');
 assert.equal(def.source.prefabId,2569);assert.equal(def.source.clipId,2954);assert.equal(def.duration,52/30);assert.equal(def.sample,30);assert.equal(def.layers.length,7);
 assert.deepEqual(def.tracks,clip.curveData);assert.deepEqual(def.root.trs,nodes[0]._trs);assert.equal(def.root.trs[7],.7);
 const state=sampleResultLayers(def,14/30),title=state.find(layer=>layer.name==='Qkh');assert.deepEqual(title.scale,[.85,.85]);
 const keys=def.tracks.paths.Qk_sg_01.comps['cc.Sprite'].spriteFrame;assert.equal(keys.length,21);assert.equal(new Set(keys.map(key=>key.value)).size,20);
 for(const layer of def.layers){const frame=frames.find(frame=>frame.uuid===layer.sprite),rect=actionSpriteRect(frame,layer);
  if(layer.trim){assert.deepEqual(rect.size,frame.rect.slice(2));assert.deepEqual(rect.source.slice(2),frame.rect.slice(2));}
  else{assert.deepEqual(rect.size,frame.originalSize);assert.deepEqual(rect.source,[0,0,...frame.originalSize]);}
 }
});

test('result playback resolves after native duration; cancellation and disabled effects leave no canvas',async()=>{
 const names=['fetch','document','Image','Audio','requestAnimationFrame','cancelAnimationFrame','addEventListener','removeEventListener','localStorage'],saved=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
 const canvases=[],scheduled=new Map();let nextFrame=0,disabled=false;
 const context=()=>({globalAlpha:1,save(){},restore(){},translate(){},scale(){},rotate(){},clearRect(){},drawImage(){}});
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});
  globalThis.document={head:{append(){}},querySelector(){return null;},createElement(tag){return tag==='canvas'?{remove(){const i=canvases.indexOf(this);if(i>=0)canvases.splice(i,1);},setAttribute(){},getContext:context}:{dataset:{}};}};
  globalThis.Image=class{async decode(){}};globalThis.Audio=class{pause(){}async play(){}};
  globalThis.requestAnimationFrame=callback=>{scheduled.set(++nextFrame,callback);return nextFrame;};globalThis.cancelAnimationFrame=id=>scheduled.delete(id);
  globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};globalThis.localStorage={getItem:()=>JSON.stringify({effects:!disabled})};
  const effect=await createActionResultEffects({append(canvas){canvases.push(canvas);}},{sound:false});
  const ordinary=effect.play('hu',3);assert.equal(ordinary.durationMs,1100);assert.equal(canvases.length,1);
  effect.update(ordinary.startTime+1101);assert.equal(canvases.length,0);assert.deepEqual(await ordinary.finished,{cancelled:false,name:'hu',seat:3});
  const qgh=effect.play('qgh',2);assert.equal(qgh.durationMs,52/30*1000);effect.update(qgh.startTime+1734);assert.equal((await qgh.finished).cancelled,false);
  const one=effect.play('gang',1),two=effect.play('zimo',0);assert.equal(canvases.length,2);effect.clear();assert.equal(canvases.length,0);assert.equal(scheduled.size,0);
  assert.equal((await one.finished).cancelled,true);assert.equal((await two.finished).cancelled,true);
  disabled=true;const skipped=effect.play('peng',2);assert.equal(skipped.durationMs,0);assert.equal((await skipped.finished).reason,'effects-disabled');assert.equal(canvases.length,0);effect.dispose();
 }finally{for(const[name,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
});
