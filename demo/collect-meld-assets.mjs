// Decode the original scene's CPG geometry without executing original scripts.
import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
const out='demo/meld-study';fs.mkdirSync(out+'/assets',{recursive:true});
const configs=fs.readdirSync('asset-study').filter(f=>f.endsWith('-config.json')).map(f=>[f.replace('-config.json',''),JSON.parse(fs.readFileSync('asset-study/'+f))]);
const ids=new Map();for(const [bundle,c]of configs)c.uuids?.forEach((u,id)=>{const uuid=expandUUID(u);if(!ids.has(uuid))ids.set(uuid,[]);ids.get(uuid).push({bundle,id});});
const native=JSON.parse(fs.readFileSync('asset-study/collected-manifest.json'));
const cache=new Map();function load(bundle,id){const k=bundle+':'+id;if(!cache.has(k))cache.set(k,lookup(bundle,id));return cache.get(k);}
function decode(raw,x){if(!Array.isArray(x))return null;const mask=raw[4]?.[x[0]],type=mask&&raw[3]?.[mask[0]];if(!Array.isArray(type)||x.length!==mask.length-1)return null;const o={class:type[0]};mask.slice(1,-1).forEach((p,i)=>o[type[1][p]]=x[i+1]);return o;}
function refUUID(raw,n){return expandUUID(raw[1][raw[10][n]]);}
function lookupUUID(uuid){for(const entry of ids.get(uuid)||[])try{return {entry,raw:load(entry.bundle,entry.id)}}catch{}throw Error('Missing local asset '+uuid)}
const frames=new Map();function sprite(uuid){if(frames.has(uuid))return uuid;for(const entry of ids.get(uuid)||[])try{const raw=load(entry.bundle,entry.id),f=raw[5]?.[0];if(!f?.rect)continue;const textureUUID=refUUID(raw,0),texture=native.find(x=>x.bundle===entry.bundle&&x.uuid===textureUUID)||native.find(x=>x.uuid===textureUUID);if(!texture)continue;frames.set(uuid,{uuid,...entry,...f,textureUUID,texture:texture.file,image:`meld-study/assets/${entry.bundle}-${entry.id}.png`});return uuid}catch{}throw Error('Missing sprite '+uuid)}
const pair=a=>a?a.slice(1):[0,0];const raw=load('main',3),seats={};
const localSeat={0:0,1:3,2:2,3:1};
for(let idx=0;idx<raw[5].length;idx++){
 const node=decode(raw,raw[5][idx]);if(node?.class!=='cc.Node'||!/^cpg_(mine|left|front|right)$/.test(node._name))continue;
 const components=node._components.map(x=>decode(raw,x)),ctrl=components.find(c=>c?.class?.startsWith('d2a717'));if(!ctrl)continue;
 const direction=ctrl.direction??0,prefabUUID=refUUID(raw,ctrl.tilePrefab),prefab=lookupUUID(prefabUUID);
 let tile;function walk(x){if(!Array.isArray(x))return;const c=decode(prefab.raw,x);if(c?.class?.startsWith('4c2e6b'))tile=c;x.forEach(walk)}walk(prefab.raw[5]);
 const atlasUUID=refUUID(prefab.raw,tile.colorAtlas),atlas=lookupUUID(atlasUUID),map=atlas.raw[5][0][2],faces={};
 for(let i=1;i<map.length;i+=3){const name=map[i];const match=name.match(direction===3?/^r_img_tile_([1235])_([1-9])$/:/^img_tile_([1235])_([1-9])$/);if(match)faces[Number(match[1])*10+Number(match[2])]=sprite(refUUID(atlas.raw,map[i+2]));}
 const trs=node._trs||[0,0,0,0,0,0,1,1,1,1];
 const stacks=ctrl.stacks.map(x=>{const s=decode(raw,x);return {tileZOderStart:s.tileZOderStart??1,tileCount:s.tileCount??-1,front:s.tileTexture.map(n=>sprite(refUUID(raw,n))),back:s.tileBackTexture.map(n=>sprite(refUUID(raw,n))),colorPos:pair(s.colorPos),colorScale:s.colorScale?pair(s.colorScale):[1,1],colorSkew:pair(s.colorSkew),colorRotation:s.colorRotation??0,tileInterval:pair(s.tileInterval),GangSkewPos:pair(s.GangSkewPos),CardTipTagPos:pair(s.CardTipTagPos)}});
 seats[localSeat[direction]]={name:node._name,sceneNodeIndex:idx,direction,sourceOrigin:[trs[0],trs[1]],nodeScale:[trs[7],trs[8]],tileScale:ctrl.tileScale??1,gap:pair(ctrl.gap),backTileOffset:pair(ctrl.backTileOffset),GangLayoutType:ctrl.GangLayoutType??-1,CardTipTagScale_G:ctrl.CardTipTagScale_G??1,CPGTexture:ctrl.CPGTexture.map(n=>sprite(refUUID(raw,n))),tilePrefab:{uuid:prefabUUID,...prefab.entry},atlas:{uuid:atlasUUID,...atlas.entry},widget:components.find(c=>c?.class==='cc.Widget')||null,faces,stacks};
}
fs.writeFileSync(out+'/layout.json',JSON.stringify({source:'main scene 3; ZMJCPGTileCtrl',sourceStage:[1280,720],coordinateSystem:'Cocos bottom-left coordinates; local seat 0=mine,1=right,2=front,3=left',notes:['Original right node scaleX is negative and face scaleX is also negative; both signs are intentional.','Front node top widget=35; mine bottom widget=110. Side origins have no widget in this scene; current local anchors require visual adjustment.','Ming/added/dark gang use Stack=-1: fourth tile overlays second plus GangSkewPos; dark gang lower three use backs, fourth uses front[1].','ZMJTile.init applies position, scale and skew; passed colorRotation property is not consumed (only angle is checked).'],seats},null,2));
fs.writeFileSync(out+'/frames.json',JSON.stringify([...frames.values()],null,2));
console.log({seats:Object.keys(seats),frames:frames.size});
