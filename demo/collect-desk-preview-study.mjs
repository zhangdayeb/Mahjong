import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';

const out='demo/desk-preview-study';
for(const directory of ['assets','raw','source'])fs.mkdirSync(`${out}/${directory}`,{recursive:true});
const refs=new Map(),frames=new Map(),fonts=new Map();
for(const file of fs.readdirSync('asset-study').filter(file=>file.endsWith('-config.json'))){
 const bundle=file.replace('-config.json',''),config=JSON.parse(fs.readFileSync(`asset-study/${file}`));
 config.uuids?.forEach((uuid,id)=>{uuid=expandUUID(uuid);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:config.paths?.[id]?.[0]});});
}
function read(bundle,id){const raw=structuredClone(lookup(bundle,id));for(const key of[7,8])if(!Array.isArray(raw[key]))raw[key]=[];return decodeCompiled(raw);}
function frame(uuid){
 if(frames.has(uuid))return frames.get(uuid);
 for(const ref of refs.get(uuid)||[])try{
  const raw=lookup(ref.bundle,ref.id),sprite=raw[5]?.[0];if(!sprite?.rect)continue;
  const data={...ref,...sprite,uuid,textureUUID:expandUUID(raw[1][raw[10][0]]),image:`desk-preview-study/assets/${ref.bundle}-${ref.id}-${sprite.name}.png`};frames.set(uuid,data);return data;
 }catch{}
 throw Error(`Original desk preview SpriteFrame missing ${uuid}`);
}
function font(uuid){
 if(fonts.has(uuid))return;
 for(const ref of refs.get(uuid)||[])try{
  const bitmap=read(ref.bundle,ref.id).instances.find(component=>component?.class==='cc.BitmapFont');if(!bitmap)continue;
  fonts.set(uuid,{uuid,source:ref,size:bitmap.fontSize,image:frame(bitmap.spriteFrame).image,glyphs:bitmap._fntConfig.fontDefDictionary});return;
 }catch{}
}
function primitive(component){return Object.fromEntries(Object.entries(component).filter(([key,value])=>key!=='node'&&(value===null||typeof value!=='object'||Array.isArray(value)&&value.every(value=>typeof value!=='object'))));}
function tree(node){
 const components=node._components||[],sprite=components.find(c=>c.class==='cc.Sprite'),label=components.find(c=>c.class==='cc.Label');if(label?._N$file)font(label._N$file);
 return{name:node._name,trs:node._trs||[0,0,0,0,0,0,1,1,1,1],size:node._contentSize||[0,0],anchor:node._anchorPoint||[.5,.5],opacity:node._opacity??255,color:node._color?.[0]??0xffffffff,active:node._active!==false,sprite:sprite?._spriteFrame&&sprite._enabled!==false?{...primitive(sprite),frame:frame(sprite._spriteFrame).uuid}:null,label:label?primitive(label):null,children:(node._children||[]).map(tree)};
}
function prefab(id){const raw=lookup('prefabs',id),nodes=read('prefabs',id).instances.filter(node=>node?.class==='cc.Node');fs.writeFileSync(`${out}/raw/prefabs-${id}.json`,JSON.stringify(raw,null,2));return tree(nodes.find(node=>!node._parent));}
const goods=lookup('resources',2923)[5][0][2].filter(info=>[304,305,308].includes(info.id));
const nativeIds=[[304,925,2126],[305,2074,2861],[308,2804,3698]];
const tables=nativeIds.map(([id,prefabId,countdownId])=>({key:String(id),config:goods.find(g=>g.id===id),source:{bundle:'prefabs',id:prefabId,countdownId},tree:prefab(prefabId),countdown:prefab(countdownId),runtime:{textureHeight:522,texturePosition:[0,20],watermarkPosition:[-250,-145]}}));
const metadata={design:[1280,720],source:{bundle:'prefabs',id:2487,path:'hall/modules/TablePreview/TablePreview'},tree:prefab(2487),tables,fonts:[...fonts.values()],notes:[
 'hallShopDeskItem.onClickShowPre sends the local goods config to TablePreview.ON_INIT. This is a visual preview, separate from onClickItem purchase.',
 'TablePreviewView loads the original GameDesk prefab and its custom countdown. No example hand, players, or purchase action is added in that prefab. Both Root and BtnBack cc.Button clickEvents invoke onClickClose; DeskPreTip says 点击屏幕关闭预览.',
 'GameDeskView applies ordinary prop texture height 522 and position (0,20). Its watermark is enabled only for channel wx.h5scmj; it is hidden for this zxwyouxi preview.',
 'Vertical Widget alignment centers the 720-high desk in LoadPre at runtime; source authored root y=360 is replaced by resolved y=0.',
 'The source catalog calls id304 四季常春; the user reference shop card text 四季常青 is accepted as an alias.',
 'Only already collected original images are used. These three preview prefabs have static sprite artwork, with no missing decorative animation components.'
]};
fs.writeFileSync(`${out}/preview.json`,JSON.stringify(metadata,null,2));
fs.writeFileSync(`${out}/frames.json`,JSON.stringify([...frames.values()],null,2));
for(const name of ['TablePreviewView','TablePreviewDefine','TablePreviewCtrl','hallShopDeskItem','GameDeskView','GameDeskDefine'])fs.copyFileSync(`asset-study/readable/modules/${name}.js`,`${out}/source/${name}.js`);
console.log(JSON.stringify({tables:goods.map(g=>({id:g.id,name:g.name,PrefabName:g.PrefabName})),frames:frames.size,fonts:fonts.size}));
