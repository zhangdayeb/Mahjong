import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {getSanguoTableEntry,enterSanguoTable,preloadSanguoTable} from './sanguo-table-entry.js';
import {roomsForMode,variants} from './rooms-config.js';
import {hallGamesModel} from './native-hall-games.js';

test('Sanguo preparation routes preserve every known room and the reference-only supreme ID without inventing a server scene',()=>{
 const rooms=roomsForMode('sanguo');
 for(const room of rooms){
  const result=getSanguoTableEntry({typeID:911,scene:room});
  assert.ok(result);assert.equal(result.typeID,911);assert.equal(result.sceneID,room.sceneID);
  assert.equal(result.href,'sanguo-table.html?room='+encodeURIComponent(room.id));
  assert.deepEqual(result.room,room);assert.equal(getSanguoTableEntry({typeID:911,roomID:room.id}).href,result.href);
 }
 const recommended=getSanguoTableEntry({typeID:911});assert.equal(recommended.room.id,'622');assert.equal(recommended.sceneID,622);
 const supreme=getSanguoTableEntry({typeID:911,roomID:rooms.at(-1).id});assert.equal(supreme.sceneID,null);assert.equal(supreme.room.referenceOnly,true);assert.ok(!supreme.href.includes('626'));
 assert.equal(variants.sanguo.playable,true,'Sanguo has a separate playable local engine');assert.equal(variants.sanguo.localPractice,true);assert.equal(variants.zodiac.playable,false);
});

test('a preparation route rejects wrong types, unknown scenes and mismatched IDs and trusts captured room values',()=>{
 for(const payload of[{}, {typeID:898}, {typeID:144}, {typeID:911,roomID:'626'}, {typeID:911,roomID:'556'}, {typeID:911,roomID:'unknown'}, {typeID:911,scene:{id:'621',sceneID:556}}, {typeID:911,scene:{id:'invented',sceneID:621}}])assert.equal(getSanguoTableEntry(payload),null,JSON.stringify(payload));
 const room=roomsForMode('sanguo')[0],provided={...room,base:987654,people:99999,limit:'forged appearance'},result=getSanguoTableEntry({typeID:911,scene:provided});
 assert.ok(result);assert.equal(result.room.base,10);assert.equal(result.room.people,295);assert.equal(result.room.limit,'10万-4000万');
 assert.equal(provided.base,987654);assert.equal(roomsForMode('sanguo')[0].base,10);
});

test('the real table preloader measures Sanguo engine and source art downloads without entering another engine or account',async()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'fetch'),base=new URL('.',import.meta.url).href,requested=[],progress=[];
 const image='sanguo-table-study/assets/background.png',tile='sanguo-table-study/assets/tiles.png';
 try{
  globalThis.fetch=async url=>{const path=url.href.slice(base.length);requested.push(path);return{ok:true,json:async()=>path.endsWith('frames.json')?[{image},{image:tile}]:{assets:[image]},arrayBuffer:async()=>new ArrayBuffer(1)};};
  await preloadSanguoTable(value=>progress.push(value));
  assert.ok(requested.includes('sanguo-table-study/table.json'));assert.ok(requested.includes('sanguo-table-study/frames.json'));assert.ok(requested.includes('sanguo-table-study/dealt.json'));assert.ok(requested.includes('sanguo-table-study/dealt-frames.json'));assert.ok(requested.includes('sanguo-table-study/play.json'));assert.ok(requested.includes('sanguo-table-study/play-frames.json'));assert.ok(requested.includes('sanguo-round.js'));
  for(const path of['sanguo-table.html','sanguo-table.js','sanguo-table.css',image,tile])assert.ok(requested.includes(path),path);
  assert.equal(requested.filter(path=>path===image).length,1,'an atlas referenced by both metadata files is downloaded once');
  assert.ok(requested.every(path=>!/(reference\.(html|js|css)|^round\.js$|\bassets\/reference\/|https:|matching|account)/.test(path)));
  assert.equal(progress[0],0);assert.equal(progress.at(-1),100);assert.ok(progress.every((value,index)=>!index||value>progress[index-1]));
  requested.length=0;progress.length=0;globalThis.fetch=async url=>({ok:!url.href.endsWith(tile),json:async()=>url.href.endsWith('frames.json')?[{image:tile}]:{assets:[]},arrayBuffer:async()=>new ArrayBuffer(1)});
  await assert.rejects(preloadSanguoTable(value=>progress.push(value)),/tiles\.png/);assert.ok(!progress.includes(100),'a failed image cannot be reported as a completed table preload');
 }finally{if(original)Object.defineProperty(globalThis,'fetch',original);else delete globalThis.fetch;}
});

function loaderDOM(){
 const listeners=[],node=()=>({children:[],style:{setProperty(key,value){this[key]=value;}},classList:{add(){}},dataset:{},clientHeight:720,isConnected:true,
  setAttribute(){},removeAttribute(){},append(...nodes){for(const child of nodes){child.parent=this;this.children.push(child);}},remove(){this.isConnected=false;this.parent?.children.splice(this.parent.children.indexOf(this),1);},querySelectorAll(){return[];}});
 const body=node(),head=node(),parent=node();
 return{document:{body,head,createElement:node,querySelectorAll(){return head.children;}},parent,listeners,addEventListener:(...args)=>listeners.push(args),removeEventListener(){}};
}

test('Sanguo entry runs the original loader with real preload completion and navigates only to the independent table',async()=>{
 const names=['document','requestAnimationFrame','addEventListener','removeEventListener','fetch','location'],saved=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)])),dom=loaderDOM(),calls=[];
 try{
  globalThis.document=dom.document;globalThis.requestAnimationFrame=callback=>queueMicrotask(()=>callback(performance.now()));
  globalThis.addEventListener=dom.addEventListener;globalThis.removeEventListener=dom.removeEventListener;
  globalThis.location={assign(){throw Error('the injected destination must be used');}};globalThis.fetch=()=>{throw Error('injected resource completion must not request bloodflow assets');};
  const result=await enterSanguoTable({typeID:911,roomID:'623'},{parent:dom.parent,minVisibleMs:0,preload:async report=>{calls.push(['preload']);report(25);await Promise.resolve();report(100);},navigate:href=>calls.push(['navigate',href])});
  assert.equal(result,true);assert.deepEqual(calls,[['preload'],['navigate','sanguo-table.html?room=623']]);
  const pagehide=dom.listeners.find(([event])=>event==='pagehide');assert.ok(pagehide);pagehide[1]();assert.equal(dom.parent.children.length,0);
  calls.length=0;let error;
  const failure=await enterSanguoTable({typeID:911,roomID:'624'},{parent:dom.parent,minVisibleMs:0,preload:async()=>{throw Error('fixture resource unavailable');},navigate:href=>calls.push(['navigate',href]),onError:next=>{error=next;}});
  assert.equal(failure,false);assert.match(error.message,/fixture resource unavailable/);assert.deepEqual(calls,[]);assert.equal(dom.parent.children.length,0);
 }finally{for(const[name,value]of saved)if(value)Object.defineProperty(globalThis,name,value);else delete globalThis[name];}
});

// The former hall host has been replaced by the public card catalog.
// Public route exclusions and preview behavior are covered by hall-game-catalog.test.js.
