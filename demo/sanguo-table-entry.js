import {roomsForMode,recommendedRoomForMode} from './rooms-config.js';
import {enterRoom} from './room-entry.js';

const BASE=new URL('.',import.meta.url);

// Independent local Sanguo engine. Unknown supreme server IDs remain references.
export function getSanguoTableEntry({typeID,scene,roomID}={}){
 if(typeID!==911)return null;
 const rooms=roomsForMode('sanguo');
 let id=roomID;
 if(scene!=null){
  const sceneId=typeof scene==='object'?scene.id??(scene.sceneID!=null?String(scene.sceneID):undefined):String(scene);
  if(sceneId==null||id!=null&&String(id)!==String(sceneId))return null;
  id=sceneId;
 }
 const room=id==null?recommendedRoomForMode('sanguo',rooms):rooms.find(value=>value.id===String(id));
 if(!room||scene&&typeof scene==='object'&&scene.sceneID!==undefined&&scene.sceneID!==room.sceneID)return null;
 return{href:`sanguo-table.html?room=${encodeURIComponent(room.id)}`,typeID:911,sceneID:room.sceneID,room};
}

export async function preloadSanguoTable(report=()=>{}){
 const metadataFiles=['sanguo-table-study/table.json','sanguo-table-study/frames.json','sanguo-table-study/dealt.json','sanguo-table-study/dealt-frames.json','sanguo-table-study/play.json','sanguo-table-study/play-frames.json'];
 const metadata=await Promise.all(metadataFiles.map(async file=>{
  const response=await fetch(new URL(file,BASE));
  if(!response.ok)throw Error(`无法加载三国牌桌资料：${file}`);
  return response.json();
 }));
 const frames=[metadata[1],metadata[3],metadata[5]].flatMap(value=>Array.isArray(value)?value:[]),files=[...new Set([
  'sanguo-table.html','sanguo-table.js','sanguo-table.css','sanguo-table-model.js','sanguo-dealt-model.js','sanguo-table-entry.js','sanguo-table-study/sanguo-table-fixture.js','sanguo-table-study/sanguo-dealt-fixture.js',
  'native-ui-canvas.js','table-layout.js','table-layout-source.js',
  'sanguo-play-model.js','sanguo-rules.js','sanguo-round.js','sanguo-controller.js','meld-study/placements.js','control-effects.js','control-effects.css','control-study/effects.json',
  'control-study/btn-hu.png','control-study/btn-peng.png','control-study/btn-gang.png','control-study/btn-pass.png','control-study/btn-zimo.png',
  ...frames.map(frame=>frame.image),
  ...(metadata[0].assets||[]),...(metadata[2].assets||[]),
  'trustee-study/game-140-trustee_bg.png','trustee-study/common-245-head_trustee.png',
 ])];
 let completed=0;report(0);
 await Promise.all(files.map(async file=>{
  const response=await fetch(new URL(file,BASE));
  if(!response.ok)throw Error(`无法加载三国牌桌资源：${file}`);
  await response.arrayBuffer();report(++completed/files.length*100);
 }));
}

export function enterSanguoTable(payload,{preload=preloadSanguoTable,minVisibleMs=650,...options}={}){
 const entry=getSanguoTableEntry(payload);
 if(!entry)return Promise.resolve(false);
 return enterRoom(entry.href,{...options,preload,minVisibleMs});
}
