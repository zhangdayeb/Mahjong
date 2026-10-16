// Read original serialized assets only; do not execute game modules or request an online table.
import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
import {sanguoReadyTableFixture} from './sanguo-table-study/sanguo-table-fixture.js';
const out='demo/sanguo-table-study';
for(const directory of ['assets','source','raw','references'])fs.mkdirSync(`${out}/${directory}`,{recursive:true});
const refs=new Map(),frames=new Map(),fonts=new Map(),unresolved=new Map();
const manifest=JSON.parse(fs.readFileSync('asset-study/collected-manifest.json'));
for(const file of fs.readdirSync('asset-study').filter(file=>file.endsWith('-config.json'))){
 const bundle=file.replace('-config.json',''),config=JSON.parse(fs.readFileSync(`asset-study/${file}`));
 config.uuids.forEach((value,id)=>{const uuid=expandUUID(value);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:config.paths?.[id]?.[0]});});
}
function decoded(bundle,id){
 const raw=structuredClone(lookup(bundle,id));fs.writeFileSync(`${out}/raw/${bundle}-${id}.json`,JSON.stringify(raw,null,2));
 for(const key of [7,8])if(!Array.isArray(raw[key]))raw[key]=[];
 return decodeCompiled(raw).instances;
}
function frame(uuid){
 if(!uuid)return null;if(frames.has(uuid))return frames.get(uuid);
 for(const ref of refs.get(uuid)||[])try{
  const raw=lookup(ref.bundle,ref.id),sprite=raw[5]?.[0];if(!sprite?.rect)continue;
  const textureUUID=expandUUID(raw[1][raw[10][0]]),texture=manifest.find(item=>item.bundle===ref.bundle&&item.uuid===textureUUID)||manifest.find(item=>item.uuid===textureUUID);
  if(!texture||!fs.existsSync(texture.file))continue;
  const value={...ref,...sprite,uuid,textureUUID,texture:texture.file,image:`sanguo-table-study/assets/${ref.bundle}-${ref.id}.png`};frames.set(uuid,value);return value;
 }catch{}
 if(uuid==='796a9547-a8fb-48f1-8944-f09540a7556b'){
  const value={uuid,missing:true,references:refs.get(uuid),note:'Ready additive motion streak import/native not present locally; source clip retained. Its opacity is zero after .333333s, so the captured settled-ready state does not use it.'};unresolved.set(uuid,value);return value;
 }
 throw Error(`Missing original SpriteFrame ${uuid}`);
}
function bitmapFont(uuid){
 if(!uuid||fonts.has(uuid))return;
 for(const ref of refs.get(uuid)||[])try{
  const raw=structuredClone(lookup(ref.bundle,ref.id));for(const key of [7,8])if(!Array.isArray(raw[key]))raw[key]=[];
  const font=decodeCompiled(raw).instances.find(item=>item?.class==='cc.BitmapFont');if(!font)continue;
  fonts.set(uuid,{...ref,uuid,size:font.fontSize,config:font._fntConfig,frame:frame(font.spriteFrame).uuid});return;
 }catch{}
}
function primitive(component){return Object.fromEntries(Object.entries(component).filter(([key,value])=>key!=='node'&&(value===null||typeof value!=='object'||Array.isArray(value)&&value.every(value=>typeof value!=='object'))));}
function tree(node){
 const components=node._components||[],sprite=components.find(component=>component.class==='cc.Sprite'),label=components.find(component=>component.class==='cc.Label'),button=components.find(component=>component.class==='cc.Button'),animation=components.find(component=>component.class==='cc.Animation'),outline=components.find(component=>component.class==='cc.LabelOutline'),builtin=sprite?._spriteFrame==='a23235d1-15db-4b95-8439-a2e005bfff91';
 if(label&&label._isSystemFontUsed===false)bitmapFont(label['_N$file']);
 return {name:node._name,trs:node._trs||[0,0,0,0,0,0,1,1,1,1],size:node._contentSize||[0,0],anchor:node._anchorPoint||[.5,.5],opacity:node._opacity??255,color:node._color?.[0]??0xffffffff,active:node._active!==false,zIndex:node._zIndex??0,
  sprite:sprite?{...primitive(sprite),frame:builtin?null:frame(sprite._spriteFrame)?.uuid,builtinSolid:builtin}:null,label:label?primitive(label):null,outline:outline?primitive(outline):null,
  mask:components.some(component=>component.class==='cc.Mask'),widget:components.find(component=>component.class==='cc.Widget')?primitive(components.find(component=>component.class==='cc.Widget')):null,
  animation:animation?primitive(animation):null,button:button?{...primitive(button),events:(button.clickEvents||[]).map(event=>({component:event._componentId,handler:event.handler,data:event.customEventData}))}:null,
  children:(node._children||[]).map(tree)};
}
function find(all,name){return all.find(node=>node?.class==='cc.Node'&&node._name===name);}
function geometry(node){return {name:node._name,trs:node._trs,size:node._contentSize,anchor:node._anchorPoint,widget:node._components.find(component=>component.class==='cc.Widget')?primitive(node._components.find(component=>component.class==='cc.Widget')):null};}
const table=decoded('prefabs',2910),ready=decoded('prefabs',653),readyTemplate=decoded('resources',827),readyClip=decoded('resources',447).find(item=>item?.class==='cc.AnimationClip'),profileLayer=decoded('prefabs',904),profile=decoded('prefabs',2595),header=decoded('prefabs',974),main=decoded('main',3);
const tableRoot=table.find(node=>node?.class==='cc.Node'&&!node._parent),readyRoot=ready.find(node=>node?.class==='cc.Node'&&!node._parent),profileRoot=profile.find(node=>node?.class==='cc.Node'&&!node._parent),profileComponent=find(profileLayer,'UserLayer')._components.find(component=>component.nodeUserView);
const rootTree=tree(tableRoot),readyTree=tree(readyRoot),profileTree=tree(profileRoot);
const headerTree=tree(header.find(node=>node?.class==='cc.Node'&&!node._parent)),menuTree=tree(find(main,'btn_menu'));
const commonConfig=JSON.parse(fs.readFileSync('asset-study/common-config.json'));
const rankFrames=[796,254,364,118,178,428,179].map(id=>frame(expandUUID(commonConfig.uuids[id])).uuid);
const tableNode=name=>table.find(node=>node?.class==='cc.Node'&&node._name===name),tableFrame=name=>tableNode(name)._components.find(component=>component.class==='cc.Sprite')._spriteFrame;
const mainNodes={};
for(const name of ['Canvas','desk','sgmj_table_parent','pannel_count_down','desk_baseinfo'])if(find(main,name))mainNodes[name]=geometry(find(main,name));
const baseInfo=find(main,'desk_baseinfo')._components.find(component=>component.labGameType&&component.labDiZhu);
const textNodes={title:tree(baseInfo.labGameType.node),subtitle:tree(baseInfo.labDiZhu.node)};
const metadata={design:[1280,720],source:{bundle:'prefabs',id:2910,path:'game/Table2DUI_SanGuo/Table2DUI_SanGuo'},assets:[...new Set(sanguoReadyTableFixture.players.map(player=>player.avatar))],tree:rootTree,ready:{source:{bundle:'prefabs',id:653},tree:readyTree,template:tree(readyTemplate.find(node=>node?.class==='cc.Node'&&!node._parent)),clip:readyClip,seats:[
 {seat:0,sourceSeatIndex:0,name:'mine',position:[0,-195],serializedPosition:[0,-125]},
 {seat:3,sourceSeatIndex:1,name:'left',position:[-379,59]},
 {seat:2,sourceSeatIndex:2,name:'front',position:[2,254]},
 {seat:1,sourceSeatIndex:3,name:'right',position:[395,59]},
 ],image:readyTree.children.find(node=>node.name==='userReadyNode_Ani').children[0].children.find(node=>node.name==='zhunbei_1').sprite.frame},
 profile:{layerSource:{bundle:'prefabs',id:904},source:{bundle:'prefabs',id:2595},tree:profileTree,rankFrames,slots:profileComponent.nodeUserView.map((node,index)=>({sourceSeatIndex:index,seat:[0,3,2,1][index],...geometry(node)})),runtimeWidgetOverrides:[{sourceSeatIndex:0,bottom:214},{sourceSeatIndex:1,top:300},{sourceSeatIndex:2,top:113},{sourceSeatIndex:3,top:300}]},
 header:{source:{bundle:'prefabs',id:974,path:'game/BaseInfo/prefab/BaseInfoLayer'},tree:headerTree,menu:{source:{bundle:'main',id:3,path:'Canvas/menu/btn_menu'},tree:menuTree},runtime:{remainText:'',showWifi:false,showNetworkLatency:false,timeFormat:'MM-DD HH:mm',blinkColon:true},notes:['BaseInfoView.INIT_BASE_INFO leaves the green tile counter visible but clears its label before dealing.','BaseInfoView.Awake hides WiFi and network milliseconds until a real update; the captured target has neither.','The clock is a screenshot display fixture and is not the current system or online match clock.']},
 textNodes,mainNodes,
 runtime:{background:tableFrame('pic_09'),flag:tableFrame('pic_10'),flagPosition:tableNode('pic_10')._trs.slice(0,2),directionParent:tableNode('direction')._trs.slice(0,2),directions:[{name:'west',character:'xi'},{name:'north',character:'bei'},{name:'south',character:'nan'},{name:'east',character:'dong'}].map(item=>({...item,position:tableNode(item.name)._trs.slice(0,2),frame:tableNode(item.name)._children.find(node=>node._name===item.character)._components.find(component=>component.class==='cc.Sprite')._spriteFrame})),baseInfoColor:'#4A3E35',readyAnimationDurationMs:1000},
 notes:['The original pic_09 already contains the complete map, table borders and river. MWSG prop texture is a different optional desk and is not substituted.','Coordinates are original centered y-up Cocos coordinates before viewport Widget adaptation. Main desk anchor and Canvas hierarchy are retained separately.','DirectionCtrl chooses one child direction per slot; the captured west/north/south/east default compass is explicit runtime data.','Non-DIY UserStateCtrl adjusts mine readiness y from serialized -125 to -195. Captured ready states are separate screenshot fixture data.','Profile nicknames, avatar URLs and balances are runtime account data, not original bundled values. The serialized profile template alone must not invent them.'],fonts:Object.fromEntries(fonts),unresolved:[...unresolved.values()]};
for(const name of ['GameDeskCtrl','GameDeskDefine','GameDeskView','SanGuoTableUICtrl','SanGuoTableUIDefine','SanGuoTableUIView','DirectionCtrl','UserStateCtrl','UserInfoLayer','DeskBaseInfo','BaseInfoView','SceneLoader','SGMJPlugin'])fs.copyFileSync(`asset-study/readable/modules/${name}.js`,`${out}/source/${name}.js`);
fs.writeFileSync(`${out}/table.json`,JSON.stringify(metadata,null,2));fs.writeFileSync(`${out}/frames.json`,JSON.stringify([...frames.values()],null,2));
console.log(JSON.stringify({source:metadata.source,frames:frames.size,fonts:fonts.size,readyDurationMs:metadata.runtime.readyAnimationDurationMs}));
