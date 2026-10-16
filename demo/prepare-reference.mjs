import fs from 'node:fs/promises';
import { lookup, expandUUID } from './inspect-assets.mjs';
const manifest=JSON.parse(await fs.readFile('asset-study/manifest.json'));
const native=JSON.parse(await fs.readFile('asset-study/collected-manifest.json'));
const out='demo/assets/reference';await fs.mkdir(out,{recursive:true});
const frames=[];
const bundleConfigs={};const uuidEntries=new Map();
for(const file of await fs.readdir('asset-study')){if(!file.endsWith('-config.json'))continue;const bundle=file.replace('-config.json',''),config=JSON.parse(await fs.readFile(`asset-study/${file}`));bundleConfigs[bundle]=config;config.uuids?.forEach((uuid,id)=>{const key=expandUUID(uuid);if(!uuidEntries.has(key))uuidEntries.set(key,[]);uuidEntries.get(key).push({bundle,id});});}
const seenSprites=new Set();
function addSpriteByUUID(uuid){
  const key=`original/${uuid}`;if(seenSprites.has(uuid))return key;
  const entries=uuidEntries.get(uuid);if(!entries)return null;
  for(const entry of entries)try{const raw=lookup(entry.bundle,entry.id),data=raw[5][0];if(!data.rect)continue;const textureUUID=expandUUID(raw[1][raw[10][0]]),texture=native.find(x=>x.bundle===entry.bundle&&x.uuid===textureUUID);if(!texture)continue;
    frames.push({...entry,path:key,uuid,...data,texture:texture.file,exportName:`orig-${entry.bundle}-${entry.id}.png`});seenSprites.add(uuid);return key;
  }catch{}return null;
}
function spriteRef(raw,ref){return addSpriteByUUID(expandUUID(raw[1][raw[10][ref]]));}
function compiledObject(raw,x){const mask=raw[4][x[0]],cls=mask&&raw[3][mask[0]];if(!Array.isArray(cls)||x.length!==mask.length-1)return null;const out={class:cls[0]};mask.slice(1,-1).forEach((p,i)=>out[cls[1][p]]=x[i+1]);return out;}
const rows={};
for(const id of [2455,1672,3708,4092,3500,3486,655,3257]){
  const raw=lookup('prefabs',id);function walk(x){if(!Array.isArray(x))return;const o=compiledObject(raw,x);if(o?.class?.startsWith('5937bb')){
    rows[id]={direction:o.direction||0,params:o.FrontParam.map(p=>{const fields=compiledObject(raw,p);return {...fields,body:spriteRef(raw,fields.tileTextures)};})};
  }for(const y of x)walk(y);}walk(raw[5]);
}
const main=lookup('main',3),hands={};
function scanHand(x){if(!Array.isArray(x))return;const o=compiledObject(main,x);if(o?.class?.startsWith('504ba')&&o.tileCount===32){hands[o.direction||0]={step:o.titleStep.slice(1),frames:o.tileFront.map(p=>spriteRef(main,compiledObject(main,p).tileTexture))};}for(const y of x)scanHand(y);}scanHand(main[5]);
await fs.writeFile(`${out}/layout.json`,JSON.stringify({rows,hands,source:'main scene and original ZMJ tile row prefabs'},null,2));
for(const [bundle,id] of [['common',269],['game',462]]){
  const entry=manifest.find(x=>x.bundle===bundle&&x.id===id),a=lookup(bundle,id),data=a[5][0];
  const textureUUID=expandUUID(a[1][a[10][0]]),texture=native.find(x=>x.bundle===bundle&&x.uuid===textureUUID);
  if(texture)frames.push({...entry,...data,texture:texture.file});
}
for(const entry of manifest.filter(x=>x.bundle==='game'&&x.type==='cc.SpriteFrame'&&(/Other\/Main\/countdown|NewSkin\/MenuBtn|Other\/Tiles.*normal.*card|Other\/Main\/UserCtrl\/Btn|Other\/Main.*(zhuang|que)|NewSkin\/GamePanelBtn/.test(x.path)))){
  try{const a=lookup(entry.bundle,entry.id);const data=a[5][0];const textureUUID=expandUUID(a[1][a[10][0]]);const texture=native.find(x=>x.bundle===entry.bundle&&x.uuid===textureUUID);if(texture)frames.push({...entry,...data,texture:texture.file});}catch{}
}
await fs.writeFile(`${out}/frames.json`,JSON.stringify(frames,null,2));
// Auto-atlas subframes often have no named path in the bundle manifest.
const config=JSON.parse(await fs.readFile('asset-study/game-config.json'));
for(const [pack,ids] of Object.entries(config.packs||{})){
  const a=JSON.parse(await fs.readFile(`asset-study/imports/game/${pack}.json`));if(!a[5])continue;
  for(let i=0;i<ids.length;i++){
    const d=a[5][i],frame=d[0]?.[0];
    if(!frame?.rect||!/^r?_?img_tile_[1235]_[1-9]$|^img_normal_card$|^img_Tag_8$/.test(frame.name))continue;
    const uuid=expandUUID(a[1][d[5]?.[0]]),texture=native.find(x=>x.bundle==='game'&&x.uuid===uuid);if(!texture)continue;
    const atlas=texture.file.includes('mj_left_card')?'left':texture.file.includes('mj_front_card')?'front':texture.file.includes('mj_hand_card')?'hand':null;
    if(atlas)frames.push({bundle:'game',id:ids[i],path:`${atlas}/${frame.name}`,uuid:expandUUID(config.uuids[ids[i]]),...frame,texture:texture.file});
  }
}
await fs.writeFile(`${out}/frames.json`,JSON.stringify(frames,null,2));
for(const [id,label] of [[64,'face'],[153,'body']]){
  const entry=native.find(x=>x.bundle==='prefabs'&&x.id===id);
  let bin;try{bin=await fs.readFile(`${out}/mesh-${label}.bin`);}catch{const response=await fetch(entry.url);if(!response.ok)throw Error(`Mesh ${id}: ${response.status}`);bin=Buffer.from(await response.arrayBuffer());await fs.writeFile(`${out}/mesh-${label}.bin`,bin);}
  const raw=lookup('prefabs',id)[5][0];const bundle=raw[2][0];const count=bundle[1],offset=bundle[2][2]||0;
  const positions=[],normals=[],uvs=[];
  for(let i=0;i<count;i++){const at=offset+i*32;for(let k=0;k<3;k++){normals.push(bin.readFloatLE(at+k*4));positions.push(bin.readFloatLE(at+12+k*4)*10000);}for(let k=0;k<2;k++)uvs.push(bin.readFloatLE(at+24+k*4));}
  const range=raw[3][0][2];const start=range[1],length=range[2],indices=[];for(let i=start;i<start+length;i+=2)indices.push(bin.readUInt16LE(i));
  await fs.writeFile(`${out}/mesh-${label}.json`,JSON.stringify({positions,normals,uvs,indices,source:entry.url}));
  console.log(label,{vertices:count,triangles:indices.length/3,uv:uvs.slice(0,8),positions:positions.slice(0,12)});
}
await fs.copyFile('asset-study/media/images/common/GameDesk/Classic/classicDesk.jpg',`${out}/desk.jpg`);
await fs.copyFile('asset-study/media/images/prefabs/3d/items/tile3DPrefabEx/2_100_b.png',`${out}/tile-body.png`);
console.log('UI frames',frames.length);
