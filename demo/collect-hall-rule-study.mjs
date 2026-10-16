import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
import {HALL_GAMES_SOURCE} from './native-hall-games-source.js';

const out='demo/hall-rule-study';for(const dir of ['raw','assets','source'])fs.mkdirSync(`${out}/${dir}`,{recursive:true});
const refs=new Map(),frames=new Map(),fonts=new Map(),missing=[];
for(const file of fs.readdirSync('asset-study').filter(f=>f.endsWith('-config.json'))){const bundle=file.replace('-config.json',''),c=JSON.parse(fs.readFileSync(`asset-study/${file}`));c.uuids?.forEach((uuid,id)=>{uuid=expandUUID(uuid);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:c.paths?.[id]?.[0]});});}
function read(bundle,id){const raw=structuredClone(lookup(bundle,id));for(const i of[7,8])if(!Array.isArray(raw[i]))raw[i]=[];return decodeCompiled(raw);}
function frame(uuid){if(frames.has(uuid))return frames.get(uuid);for(const ref of refs.get(uuid)||[])try{const raw=lookup(ref.bundle,ref.id),sprite=raw[5]?.[0];if(!sprite?.rect)continue;const result={...ref,...sprite,uuid,textureUUID:expandUUID(raw[1][raw[10][0]]),image:`hall-rule-study/assets/${ref.bundle}-${ref.id}-${sprite.name}.png`};frames.set(uuid,result);return result;}catch{}throw Error(`Missing original hall panel sprite ${uuid}`);}
function safeFrame(uuid,node){try{return frame(uuid).uuid;}catch(error){missing.push({uuid,node});return null;}}
function font(uuid){if(fonts.has(uuid))return;for(const ref of refs.get(uuid)||[])try{const bitmap=read(ref.bundle,ref.id).instances.find(c=>c?.class==='cc.BitmapFont');if(!bitmap)continue;fonts.set(uuid,{uuid,source:ref,size:bitmap.fontSize,image:frame(bitmap.spriteFrame).image,glyphs:bitmap._fntConfig.fontDefDictionary});return;}catch{}}
function primitive(c){return Object.fromEntries(Object.entries(c).filter(([key,value])=>key!=='node'&&(value===null||typeof value!=='object'||Array.isArray(value)&&value.every(v=>typeof v!=='object'))));}
function extract(bundle,id,{onlyNode}={}){
 const raw=lookup(bundle,id),decoded=read(bundle,id),nodes=decoded.instances.filter(n=>n?.class==='cc.Node'),indices=new Map(nodes.map((node,index)=>[node,index]));
 function ref(v){if(v?.class==='cc.Node')return {node:indices.get(v)};if(v?.node?.class==='cc.Node')return{node:indices.get(v.node),component:v.class};if(Array.isArray(v))return v.map(ref);if(typeof v==='string'&&refs.has(v)){try{frame(v);}catch{}return v;}if(v===null||typeof v!=='object')return v;return undefined;}
 const bindings={};for(const node of nodes)for(const component of node._components||[])if(component.class&&!component.class.startsWith('cc.')){bindings[component.class]={node:indices.get(node)};for(const[k,v]of Object.entries(component)){if(k==='class'||k==='node')continue;const value=ref(v);if(value!==undefined)bindings[component.class][k]=value;}}
 function tree(node){if(!indices.has(node))indices.set(node,indices.size);const cs=node._components||[],sprite=cs.find(c=>c.class==='cc.Sprite'),label=cs.find(c=>c.class==='cc.Label');if(label?._N$file)font(label._N$file);const builtin=sprite?._spriteFrame==='a23235d1-15db-4b95-8439-a2e005bfff91';return{id:indices.get(node),name:node._name,trs:node._trs||[0,0,0,0,0,0,1,1,1,1],size:node._contentSize||[0,0],anchor:node._anchorPoint||[.5,.5],opacity:node._opacity??255,color:node._color?.[0]??0xffffffff,active:node._active!==false,sprite:sprite?._spriteFrame?{...primitive(sprite),frame:builtin?null:safeFrame(sprite._spriteFrame,`${bundle}:${id}/${node._name}`),builtinSolid:builtin}:null,label:label?primitive(label):null,mask:cs.some(c=>c.class==='cc.Mask'),components:cs.filter(c=>c.class.startsWith('cc.')&&!['cc.Sprite','cc.Label'].includes(c.class)).map(c=>({...primitive(c),events:(c.clickEvents||c.checkEvents||[]).map(e=>({handler:e.handler,customEventData:e.customEventData}))})),children:(node._children||[]).map(tree)};}
 const root=onlyNode?nodes.find(n=>n._name===onlyNode):nodes.find(n=>!n._parent);fs.writeFileSync(`${out}/raw/${bundle}-${id}.json`,JSON.stringify(raw,null,2));return{source:{bundle,id},tree:tree(root),bindings};
}
const panels={rules:extract('prefabs',224)},templates={item:extract('prefabs',60),picture:extract('prefabs',1113),text:extract('prefabs',3283)};
fs.writeFileSync(out+'/source.json',JSON.stringify({design:[1280,720],panels,templates,fonts:[...fonts.values()],gameTypes:Object.values(HALL_GAMES_SOURCE.gameTypes)},null,2));
fs.writeFileSync(out+'/frames.json',JSON.stringify([...frames.values()],null,2));
for(const name of ['RuleHallView','RuleHallItemView','RuleHallTemplatePic','RuleHallTemplateText','RuleView','RuleViewCtrl'])fs.copyFileSync('asset-study/readable/modules/'+name+'.js',out+'/source/'+name+'.js');
console.log(JSON.stringify({frames:frames.size,bindings:Object.keys(panels.rules.bindings)}));
