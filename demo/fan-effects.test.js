import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
import{normalizeFanName,scoreEntries,sampleFanTrack,createFanEffects}from'./fan-effects.js';
import{scoreSparkles}from'./fan-effects-detail.js';
const data=JSON.parse(fs.readFileSync(new URL('./fan-study/effects.json',import.meta.url)));
test('only confirmed large fan names select big-hu effects',()=>{
 assert.equal(normalizeFanName('清一色'),'清一色');assert.equal(normalizeFanName('对对胡'),'对对胡');assert.equal(normalizeFanName(['平胡','七对']),'七对');
 for(const name of ['平胡','胡','未知番型','清一色x999',null])assert.equal(normalizeFanName(name),'');
});
test('floating scores keep exact supplied signed delta and omit unchanged seats',()=>{
 const deltas=[8000,-6000,-2000,0];assert.deepEqual(scoreEntries(deltas),[{seat:0,value:8000},{seat:1,value:-6000},{seat:2,value:-2000}]);assert.deepEqual(deltas,[8000,-6000,-2000,0]);
 assert.deepEqual(scoreEntries([NaN,Infinity,-Infinity,0]),[]);assert.deepEqual(scoreEntries(null),[]);
});
test('original packed Vec2 scale keys retain both axes and exact timeline samples',()=>{
 const keys=data.tracks.paths.q.props.scale;assert.deepEqual(sampleFanTrack(keys,keys[1].frame,[1,1]),[.65,.65]);assert.deepEqual(sampleFanTrack(keys,(keys[2].frame+keys[3].frame)/2,[1,1]),[.55,.55]);
 assert.equal(data.duration,2.3333333333333335);assert.equal(data.tracks.paths.lighting.props.opacity[2].value,2555);
});
test('all original layer sprites exist and fonts cover displayed fan words/signed scores',()=>{
 for(const frame of [...new Set(data.layers.map(l=>l.image).filter(Boolean).concat(Object.values(data.fonts).map(f=>f.image),data.coin))])assert.ok(fs.existsSync(new URL('./'+frame,import.meta.url)),frame);
 for(const name of data.supportedNames)for(const ch of name)assert.ok(data.fonts.fan.fontDefDictionary[ch.codePointAt(0)],ch);
 for(const key of ['win','loss'])for(const ch of '+-0123456789')assert.ok(data.fonts[key].fontDefDictionary[ch.codePointAt(0)],key+' '+ch);
 const paths=new Set(data.layers.map(l=>l.path));for(const path of Object.keys(data.tracks.paths))assert.ok(paths.has(path),path);
});
test('score decoration stays finite and ends within the unchanged score display window',()=>{
 for(const positive of [true,false]){
  assert.deepEqual(scoreSparkles(0,positive),[]);assert.deepEqual(scoreSparkles(.82,positive),[]);assert.deepEqual(scoreSparkles(NaN,positive),[]);
  const samples=[.08,.2,.45,.65].flatMap(time=>scoreSparkles(time,positive));assert.ok(samples.length);
  for(const point of samples){for(const value of Object.values(point))assert.ok(Number.isFinite(value));assert.ok(point.alpha>0&&point.alpha<=1);assert.ok(Math.abs(point.x)<70);assert.ok(point.y<0&&point.y>-70)}
 }
});
test('detail comparison preserves source image geometry, exact scores, timing and paused cleanup',async()=>{
 const globals=['fetch','Image','document','requestAnimationFrame','cancelAnimationFrame','addEventListener'];
 const previous=Object.fromEntries(globals.map(key=>[key,globalThis[key]])),nodes=[],scheduled=new Map();let nextId=0;
 function context(){const calls=[];return new Proxy({calls,globalAlpha:1},{get(target,key){if(key in target)return target[key];if(key==='createLinearGradient')return()=>({addColorStop(){}});if(key==='getImageData')return()=>({data:new Uint8ClampedArray(0)});return(...args)=>calls.push([key,...args])}})}
 globalThis.fetch=async()=>({ok:true,json:async()=>data});globalThis.Image=class{constructor(){this.width=800;this.height=800}async decode(){}};
 globalThis.document={createElement(){const ctx=context();return{dataset:{},getContext:()=>ctx,setAttribute(key,value){this[key]=value},remove(){const index=nodes.indexOf(this);if(index>=0)nodes.splice(index,1)}}}};
 globalThis.requestAnimationFrame=callback=>{const id=++nextId;scheduled.set(id,callback);return id};globalThis.cancelAnimationFrame=id=>scheduled.delete(id);globalThis.addEventListener=()=>{};
 try{
  const controller=await createFanEffects({append:node=>nodes.push(node)},{force:true});
  const old=controller.play({name:'清一色',deltas:[8000,-6000,-2000,0],style:'original',paused:true,time:.65}),original=nodes.at(-1);
  const updated=controller.play({name:'清一色',deltas:[8000,-6000,-2000,0],paused:true,time:.65}),modified=nodes.at(-1);
  assert.equal(old.duration,data.duration);assert.equal(updated.duration,old.duration);assert.equal(scheduled.size,0);
  assert.equal(modified['aria-label'],original['aria-label']);assert.match(modified['aria-label'],/玩家1 \+8000；玩家2 -6000；玩家3 -2000/);
  const geometry=node=>node.getContext().calls.filter(call=>call[0]==='drawImage').map(call=>call.slice(2));assert.deepEqual(geometry(modified),geometry(original));
  assert.ok(modified.getContext().calls.some(call=>call[0]==='fillText'&&call[1]==='联桌'));assert.ok(!original.getContext().calls.some(call=>call[0]==='fillText'&&call[1]==='联桌'));
  updated.seek(.45);updated.resume();assert.equal(scheduled.size,1);updated.pause();assert.equal(scheduled.size,0);
  controller.clear();await Promise.all([old.finished,updated.finished]);assert.equal(nodes.length,0);assert.equal(scheduled.size,0);
  const queued=controller.queue([{name:'清一色'},{name:'七对'}],{deltas:[3000,-1000,-1000,-1000]});assert.equal(queued.duration,data.duration*2+1);
  controller.clear();await queued.finished;assert.equal(nodes.length,0);assert.equal(scheduled.size,0);
 }finally{for(const key of globals){if(previous[key]===undefined)delete globalThis[key];else globalThis[key]=previous[key]}}
});
