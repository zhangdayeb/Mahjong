// Read collected public Cocos definitions; never execute original game scripts.
import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
const out='demo/action-result-study';
for(const dir of ['raw','assets','source','audio'])fs.mkdirSync(`${out}/${dir}`,{recursive:true});
const refs=new Map(),cache=new Map(),frames=new Map();
for(const name of fs.readdirSync('asset-study').filter(x=>x.endsWith('-config.json'))){
 const bundle=name.replace('-config.json',''),config=JSON.parse(fs.readFileSync('asset-study/'+name));
 config.uuids?.forEach((uuid,id)=>{uuid=expandUUID(uuid);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:config.paths?.[id]?.[0]});});
}
const read=(bundle,id)=>{const key=`${bundle}:${id}`;if(!cache.has(key))cache.set(key,lookup(bundle,id));return cache.get(key);};
const decoded=(bundle,id)=>{const raw=structuredClone(read(bundle,id));if(!Array.isArray(raw[7]))raw[7]=[];if(!Array.isArray(raw[8]))raw[8]=[];return decodeCompiled(raw);};
function spriteFrame(uuid){
 if(frames.has(uuid))return uuid;
 for(const ref of refs.get(uuid)||[])try{
  const raw=read(ref.bundle,ref.id),frame=raw[5]?.[0];if(!frame?.rect)continue;
  frames.set(uuid,{...ref,...frame,uuid,textureUUID:expandUUID(raw[1][raw[10][0]]),image:`action-result-study/assets/${ref.bundle}-${ref.id}-${frame.name}.png`});return uuid;
 }catch{}
 throw Error(`Missing original result SpriteFrame ${uuid}`);
}
const layerPrefab=decoded('prefabs',1855),layerNodes=layerPrefab.instances.filter(n=>n?.class==='cc.Node');
const cpgNode=layerNodes.find(n=>n._name==='anim_CPGH'),cpg=cpgNode._components.find(c=>c.animPos);
fs.writeFileSync(`${out}/raw/prefabs-1855.json`,JSON.stringify(read('prefabs',1855),null,2));
const layout={source:{bundle:'prefabs',id:1855},root:{trs:cpgNode._parent._trs,size:cpgNode._parent._contentSize},content:{trs:cpgNode._trs,size:cpgNode._contentSize},positions:cpg.animPos,localToSourceSeat:[0,3,2,1]};
const definitions={};
for(const [name,id] of [['hu',1402],['peng',1315],['gang',806],['zimo',2907],['qgh',2569]]){
 const raw=read('resources',id),prefab=decoded('resources',id),nodes=prefab.instances.filter(n=>n?.class==='cc.Node');
 fs.writeFileSync(`${out}/raw/resources-${id}.json`,JSON.stringify(raw,null,2));
 const root=nodes.find(n=>!n._parent),animation=root._components.find(c=>c.class==='cc.Animation');
 const clipRef=(refs.get(animation._defaultClip)||[]).find(ref=>ref.bundle==='resources');if(!clipRef)throw Error('Original result clip missing '+name);
 const clipId=clipRef.id,clip=decoded('resources',clipId).instances[0];
 fs.writeFileSync(`${out}/raw/resources-${clipId}.json`,JSON.stringify(read('resources',clipId),null,2));
 if(name!=='qgh'&&animation._defaultClip!=='fbe2840a-cd0a-4072-aa59-f0055e73041c')throw Error('Unexpected result clip '+name);
 function path(n){return n===root?'':`${path(n._parent)}${n._parent===root?'':'/'}${n._name}`;}
 const layers=nodes.filter(n=>n!==root).map(n=>{
  const sprite=n._components.find(c=>c.class==='cc.Sprite');if(!sprite)throw Error('Unexpected non-sprite '+n._name);
  return {path:path(n),parent:n._parent===root?null:path(n._parent),name:n._name,trs:n._trs,size:n._contentSize,anchor:n._anchorPoint,opacity:n._opacity??255,color:n._color??0xffffffff,active:n._active!==false,sprite:spriteFrame(sprite._spriteFrame),sizeMode:sprite._sizeMode??1,trim:sprite._isTrimmedMode??true,blend:sprite._dstBlendFactor??771};
 });
 for(const branch of Object.values(clip.curveData.paths||{}))for(const key of branch.comps?.['cc.Sprite']?.spriteFrame||[])spriteFrame(key.value);
 const nativePath=(refs.get([...refs.keys()].find(uuid=>(refs.get(uuid)||[]).some(ref=>ref.bundle==='resources'&&ref.id===id)))||[]).find(ref=>ref.bundle==='resources')?.path;
 definitions[name]={name,source:{bundle:'resources',prefabId:id,path:nativePath,clipId,clipUUID:animation._defaultClip},root:{trs:root._trs,opacity:root._opacity??255,active:root._active!==false},duration:clip._duration,sample:clip.sample,tracks:clip.curveData,layers};
}
const voices=JSON.parse(fs.readFileSync('demo/guide-study/audio.json'));
for(const voice of voices){fs.copyFileSync('demo/'+voice.file,`${out}/audio/${voice.action}.mp3`);voice.file=`action-result-study/audio/${voice.action}.mp3`;}
const data={design:[1280,720],stage:[1280,640],layout,definitions,voices,selection:{source:'AnimationDefine.GameAnimPrefabMap / NewCPGHAnim.playHu, playPeng, playGang, playZIMO',theme:'common_cpgh',bigFanIsSeparate:true},notes:['Gold particles are native 20fps sprite sequence, not randomly recreated particles.','Raw-size non-trim sprites retain originalSize and offset.']};
fs.writeFileSync(`${out}/effects.json`,JSON.stringify(data,null,2));
fs.writeFileSync(`${out}/frames.json`,JSON.stringify([...frames.values()],null,2));
for(const name of ['AnimationDefine','NewCPGHAnim','CPGHAnim','ConfigPrefab'])fs.copyFileSync(`asset-study/readable/modules/${name}.js`,`${out}/source/${name}.js`);
console.log(JSON.stringify({actions:Object.keys(definitions),durations:Object.fromEntries(Object.entries(definitions).map(([name,def])=>[name,def.duration])),frames:frames.size}));
