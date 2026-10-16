// Extract bundled client data only. Captured hands are display fixtures, not a game engine.
import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
import {TABLE_SOURCE} from './table-layout-source.js';
const out='demo/sanguo-table-study',frames=new Map(),refs=new Map();
const manifest=JSON.parse(fs.readFileSync('asset-study/collected-manifest.json'));
for(const file of fs.readdirSync('asset-study').filter(file=>file.endsWith('-config.json'))){const bundle=file.replace('-config.json',''),config=JSON.parse(fs.readFileSync(`asset-study/${file}`));config.uuids.forEach((value,id)=>{const uuid=expandUUID(value);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:config.paths?.[id]?.[0]});});}
function frame(uuid){
 if(!uuid)return null;if(frames.has(uuid))return frames.get(uuid);
 for(const ref of refs.get(uuid)||[])try{
  const raw=lookup(ref.bundle,ref.id),sprite=raw[5]?.[0];if(!sprite?.rect)continue;
  const textureUUID=expandUUID(raw[1][raw[10][0]]),texture=manifest.find(item=>item.bundle===ref.bundle&&item.uuid===textureUUID)||manifest.find(item=>item.uuid===textureUUID);
  if(!texture||!fs.existsSync(texture.file))continue;
  const value={...ref,...sprite,uuid,textureUUID,texture:texture.file,image:`sanguo-table-study/assets/dealt-${ref.bundle}-${ref.id}.png`};frames.set(uuid,value);return value;
 }catch{}
 throw Error(`Missing original dealt-table frame ${uuid}`);
}
function decoded(bundle,id){const raw=structuredClone(lookup(bundle,id));fs.writeFileSync(`${out}/raw/dealt-${bundle}-${id}.json`,JSON.stringify(raw,null,2));for(const key of [7,8])if(!Array.isArray(raw[key]))raw[key]=[];return decodeCompiled(raw).instances;}
function primitive(component){return Object.fromEntries(Object.entries(component).filter(([key,value])=>key!=='node'&&(value===null||typeof value!=='object'||Array.isArray(value)&&value.every(value=>typeof value!=='object'))));}
function tree(node){
 const components=node._components||[],sprite=components.find(c=>c.class==='cc.Sprite'),label=components.find(c=>c.class==='cc.Label'),widget=components.find(c=>c.class==='cc.Widget'),button=components.find(c=>c.class==='cc.Button'),builtin=sprite?._spriteFrame==='a23235d1-15db-4b95-8439-a2e005bfff91';
 return{name:node._name,trs:node._trs||[0,0,0,0,0,0,1,1,1,1],size:node._contentSize||[0,0],anchor:node._anchorPoint||[.5,.5],opacity:node._opacity??255,color:node._color?.[0]??0xffffffff,active:node._active!==false,sprite:sprite?{...primitive(sprite),frame:builtin?null:frame(sprite._spriteFrame)?.uuid,builtinSolid:builtin}:null,label:label?primitive(label):null,widget:widget?primitive(widget):null,button:button?primitive(button):null,children:(node._children||[]).map(tree)};
}
const find=(all,name)=>all.find(n=>n?.class==='cc.Node'&&n._name===name);
const main=decoded('main',3),gameMenu=decoded('prefabs',264),fan=decoded('prefabs',1052),timeout=decoded('prefabs',952),recorder=decoded('prefabs',3709);
const panel=find(main,'panel_menuList_bg');
// Recommendation controls are not part of the supplied expanded-menu capture.
const menuTree=tree({...panel,_children:[{...find(main,'panel_menuList'),_children:find(main,'panel_menuList')._children.filter(n=>['btn_trustee','btn_set','btn_PlayRule','btn_GameBehavior','btn_exit'].includes(n._name))}]});
const top=tree({...find(gameMenu,'leftTopNode'),_children:[find(gameMenu,'Btn_recode')]}),right=tree({...find(gameMenu,'rightDownNode'),_children:[find(gameMenu,'btn_chat'),find(gameMenu,'Btn_Hu_Details')]}),fanTree=tree(fan.find(n=>n?.class==='cc.Node'&&!n._parent)),timeoutTree=tree(timeout.find(n=>n?.class==='cc.Node'&&!n._parent));
const handAtlas=lookup('game',1397),pairs=handAtlas[5][0][2],tileNames={113:'sg_img_tile_7_1',114:'sg_img_tile_7_2',115:'sg_img_tile_7_3',163:'sg_img_tile_10_3'},tileFaces={};
for(const [code,name]of Object.entries(tileNames)){const index=pairs.indexOf(name);if(index<0)throw Error(`Missing original hero ${name}`);tileFaces[code]=frame(expandUUID(handAtlas[1][handAtlas[10][pairs[index+2]]])).uuid;}
const tileBodies=TABLE_SOURCE.seats.map(seat=>seat.hand.frames.slice(0,13).map(key=>frame(key.replace('table/','')).uuid));
const config=JSON.parse(fs.readFileSync('asset-study/game-config.json')),dealer=frame(expandUUID(config.uuids[750]));
const recorderTree=tree(recorder.find(n=>n?.class==='cc.Node'&&!n._parent));
const metadata={design:[1280,720],sources:{menu:{bundle:'main',id:3,node:'menu/panel_menuList_bg'},tools:{bundle:'prefabs',id:264},fan:{bundle:'prefabs',id:1052},timeout:{bundle:'prefabs',id:952},recorder:{bundle:'prefabs',id:3709},handAtlas:{bundle:'game',id:1397}},menu:menuTree,tools:{top,right,fan:fanTree},timeout:timeoutTree,recorder:recorderTree,tileFaces,tileBodies,dealer:dealer.uuid,assets:['sanguo-table-study/assets/dealt-avatar-front.png','sanguo-table-study/assets/dealt-avatar-right.png'],notes:['Menu.start adds 50 to panel_menuList.x; inactive Hu_Details/GameBehavior configuration is reflected by five compact 80-unit rows in the target.','SGMJ2=911 uses leftTopNode.left=260. Hidden exchange/old-fan slots collapse; the displayed recorder/fan centers are 30 and 98.5.','No actual wall values, turn, payments or opponents are synthesized. The visible 13-card hero hand and 82 remaining label are captured display data.','Recorder preview lists only the captured own hand counts. Full unseen-card counts require the complete deck and live public state and are not inferred.']};
for(const name of ['Menu','GameMenuView','GameHuBehavior','CardLibSanGuo','ZMJTile','ZMJHandTileCtrl'])fs.copyFileSync(`asset-study/readable/modules/${name}.js`,`${out}/source/${name}.js`);
fs.writeFileSync(`${out}/dealt.json`,JSON.stringify(metadata,null,2));fs.writeFileSync(`${out}/dealt-frames.json`,JSON.stringify([...frames.values()],null,2));console.log(JSON.stringify({frames:frames.size,tileFaces,menu:metadata.sources.menu}));
