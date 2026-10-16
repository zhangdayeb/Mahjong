// Export authoritative 2D scene metadata and SpriteFrames; never execute game code.
import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
const dir='demo/table-layout-study';fs.mkdirSync(dir+'/assets',{recursive:true});
const refs=new Map(),frames=new Map(),cache=new Map();
for(const file of fs.readdirSync('asset-study').filter(f=>f.endsWith('-config.json'))){const bundle=file.replace('-config.json',''),c=JSON.parse(fs.readFileSync('asset-study/'+file));c.uuids?.forEach((u,id)=>{const key=expandUUID(u);if(!refs.has(key))refs.set(key,[]);refs.get(key).push({bundle,id,path:c.paths?.[id]?.[0]});});}
const native=JSON.parse(fs.readFileSync('asset-study/collected-manifest.json'));
const read=(bundle,id)=>{const key=bundle+':'+id;if(!cache.has(key))cache.set(key,lookup(bundle,id));return cache.get(key);};
function entry(uuid){for(const r of refs.get(uuid)||[])try{const raw=read(r.bundle,r.id);return {...r,raw};}catch{}throw Error('Missing local asset '+uuid);}
function frame(uuid){if(frames.has(uuid))return 'table/'+uuid;for(const r of refs.get(uuid)||[])try{const raw=read(r.bundle,r.id),f=raw[5]?.[0];if(!f?.rect)continue;const textureUUID=expandUUID(raw[1][raw[10][0]]),texture=native.find(x=>x.bundle===r.bundle&&x.uuid===textureUUID)||native.find(x=>x.uuid===textureUUID);if(!texture)continue;frames.set(uuid,{...r,...f,uuid,textureUUID,texture:texture.file,image:`table-layout-study/assets/${r.bundle}-${r.id}.png`,key:'table/'+uuid});return 'table/'+uuid;}catch{}throw Error('Missing local SpriteFrame '+uuid);}
function scene(bundle,id){return decodeCompiled(structuredClone(read(bundle,id))).instances;}
const main=scene('main',3),user=scene('prefabs',904),card=scene('prefabs',2595),trustee=scene('prefabs',3907),que=scene('prefabs',2532),desk=scene('prefabs',3362);
const nodes=a=>a.filter(n=>n?.class==='cc.Node'&&!n._is3DNode);
const find=(a,name)=>nodes(a).find(n=>n._name===name);
const controller=(n,prefix)=>n._components.find(c=>c.class.startsWith(prefix));
const geometry=n=>({name:n._name,position:n._trs.slice(0,2),scale:n._trs.slice(7,9),size:n._contentSize,anchor:n._anchorPoint,widget:n._components.find(c=>c.class==='cc.Widget')?Object.fromEntries(Object.entries(n._components.find(c=>c.class==='cc.Widget')).filter(([k])=>!['node','_target'].includes(k))):null});
const tileSprites=new Map();
function tileSprite(prefabUUID){
 if(tileSprites.has(prefabUUID))return tileSprites.get(prefabUUID);
 const e=entry(prefabUUID),a=scene(e.bundle,e.id),c=a.flatMap(n=>n?.class==='cc.Node'?n._components||[]:[]).find(n=>n?.class?.startsWith('4c2e6b'));
 const sprite=sp=>({...geometry(sp.node),frame:frame(sp._spriteFrame),sizeMode:sp._sizeMode??1,trim:sp._isTrimmedMode??true,angle:2*Math.atan2(sp.node._trs[5],sp.node._trs[6])*180/Math.PI,skew:[sp.node._skewX??0,sp.node._skewY??0]});
 const result={uuid:prefabUUID,bundle:e.bundle,id:e.id,root:geometry(c.node),body:sprite(c.oTileBody),face:sprite(c.oTileColor)};
 tileSprites.set(prefabUUID,result);return result;
}
function atlasFaces(prefabUUID,direction){const e=entry(prefabUUID),a=scene(e.bundle,e.id),c=a.flatMap(n=>n?.class==='cc.Node'?n._components||[]:[]).find(n=>n?.class?.startsWith('4c2e6b'));const ae=entry(c.colorAtlas),map=ae.raw[5][0][2],result={};for(let i=1;i<map.length;i+=3){const m=map[i].match(direction===3?/^r_img_tile_([1235])_([1-9])$/:/^img_tile_([1235])_([1-9])$/);if(m){const uuid=expandUUID(ae.raw[1][ae.raw[10][map[i+2]]]);result[10*Number(m[1])+Number(m[2])]=frame(uuid);}}return result;}
const output={design:[1280,720],scene:{bundle:'main',id:3},sources:{layout:'ZMJTileInterface.js:1604-1655',resolution:'SceneLoader.js:201-211',compass:'DeskLayoutUpdate.js:13-21',profiles:'UserInfoLayer.js:1098-1105',emptyMeld:'ZMJCPGTileCtrl.js:56-69',handShift:'ZMJHandTileCtrl.js:740-757'},seats:[],rows:{}};
output.drawOrder=find(main,'pannel_tiles')._children.map(n=>({seat:[0,3,2,1].indexOf(['mine','left','front','right'].indexOf(n._name)),name:n._name,kinds:n._children.map(child=>child._name.split('_')[0])}));
for(const direction of [0,3,2,1]){const name=['mine','left','front','right'][direction],hn=find(main,'hand_'+name),hc=controller(hn,'504ba'),cn=find(main,'cpg_'+name),on=find(main,'open_'+name),oc=controller(on,'08e92'),dn=find(main,'out_'+name),dc=controller(dn,'b97ea'),un=find(main,'hu_'+name),uc=controller(un,'a5ced');
 const hand={...geometry(hn),tilePrefab:hc.tilePrefab,sprite:tileSprite(hc.tilePrefab),tileScale:hc.tileScale??1,start:hc.tileStartPos??[0,0],step:hc.titleStep,frames:hc.tileFront.map(p=>frame(p.tileTexture)),faceOffset:hc.colorPos??[0,0],faceScale:hc.colorScale??[1,1],colorRotation:hc.colorRotation??0,faces:atlasFaces(hc.tilePrefab,direction)};
 const open={...geometry(on),tilePrefab:oc.tilePrefab,sprite:tileSprite(oc.tilePrefab),tileScale:oc.tileScale??1,gap:oc.gap,front:oc.tileFront.map(p=>({step:p.titleStep,body:frame(p.tileTexture),colorRotation:p.colorRotation??0}))};
 const hu={...geometry(un),tilePrefab:uc.tilePrefab,sprite:tileSprite(uc.tilePrefab),tileScale:uc.tileScale??1,step:uc.tileStep,rowStep:uc.rowStep,rowCount:uc.nRowTileCount,body:frame(uc.tileTexture),faces:atlasFaces(uc.tilePrefab,direction),colorPos:uc.colorPos??[0,0],colorScale:uc.colorScale??[1,1],colorSkew:uc.colorSkew??[0,0],colorRotation:uc.colorRotation??0,rowZorderStart:uc.rowZorderStart??0,rowZorderStep:uc.rowZorderStep??0,tileZorderStep:uc.tileZorderStep??0};
 const discard={...geometry(dn),rowPos:dc.rowPos,floorStep:dc.floorStep,rowScaleStep:dc.rowScaleStep??1,rowZOrderStart:dc.rowZOrderStart??1,rowPrefabs:[]};
 for(const uuid of dc.rowPrefab){const e=entry(uuid),p=scene(e.bundle,e.id),c=p.flatMap(n=>n?.class==='cc.Node'?n._components||[]:[]).find(n=>n?.class?.startsWith('5937bb')),key=e.bundle+'-'+e.id;discard.rowPrefabs.push(key);output.rows[key]={direction:c.direction??0,tilePrefab:c.tilePrefab,sprite:tileSprite(c.tilePrefab),faces:atlasFaces(c.tilePrefab,direction),params:c.FrontParam.map(t=>({body:frame(t.tileTextures),tileStep:t.tileStep??[0,0],colorPos:t.colorPos??[0,0],colorScale:t.colorScale??[1,1],colorSkew:t.colorSkew??[0,0],colorRotation:t.colorRotation??0}))};}
 tileSprite(controller(cn,'d2a717').tilePrefab);
 output.seats.push({name,direction,hand,meld:geometry(cn),open,discard,hu});
}
const userCtrl=controller(find(user,'UserLayer'),'542e9');output.profiles=[0,3,2,1].map(direction=>({...geometry(userCtrl.nodeUserView[direction]),direction}));
output.profileParts=Object.fromEntries(['img_head_bg','HeadParent','rankIcon','rankNum','img_userinfo_bg','label_Nickname','img_ZCoin','label_ZCoin','img_zhuang_tag','UserTagLayout','head_trustee'].map(name=>[name,geometry(find(card,name))]));
const qt=controller(find(que,'pannel_DingQue'),'64925');output.que={buttons:[qt.wanBtn,qt.tiaoBtn,qt.tongBtn].map(geometry),complete:[0,3,2,1].map(direction=>({node:geometry(qt.DingQueCompTip[direction]),parent:geometry(qt.DingQueCompTip[direction]._parent)})),notice:geometry(find(que,'game_notice_bg'))};
const cancelNode=find(trustee,'btn_cancelTrustee'),cancelLabel=cancelNode._children.find(n=>n._components.some(c=>c.class==='cc.Label')),labelComponent=cancelLabel._components.find(c=>c.class==='cc.Label');
output.trustee={background:geometry(find(trustee,'trustee_bg')),cancel:{...geometry(cancelNode),label:{...geometry(cancelLabel),text:labelComponent._string,fontSize:labelComponent._fontSize,lineHeight:labelComponent._lineHeight,spacingX:labelComponent._spacingX??0,horizontalAlign:labelComponent['_N$horizontalAlign']??0,verticalAlign:labelComponent['_N$verticalAlign']??0,color:Array.isArray(cancelLabel._color)?cancelLabel._color[0]:cancelLabel._color}}};
output.compass={node:geometry(find(main,'pannel_count_down')),body:geometry(find(main,'img_panBg'))};
const info=controller(find(main,'desk_baseinfo'),'7d47a');output.tableInfo={title:geometry(info.labGameType.node),subtitle:geometry(info.labDiZhu.node)};
const deskSprite=n=>frame(n._components.find(c=>c.class==='cc.Sprite')._spriteFrame);
output.desk={node:{...geometry(find(desk,'ClassicDesk')),body:deskSprite(find(desk,'ClassicDesk'))},texture:{...geometry(find(desk,'texture')),body:deskSprite(find(desk,'texture'))},logo:{...geometry(find(desk,'logo')),body:deskSprite(find(desk,'logo'))}};
for(const list of [card,trustee,que,desk])for(const n of nodes(list))for(const c of n._components||[])if(c.class==='cc.Sprite'&&c._spriteFrame)try{frame(c._spriteFrame);}catch{}
output.tileSprites=Object.fromEntries(tileSprites);
Object.assign(output.sources,{drawOrder:'main scene 3: pannel_tiles 2D children; ZMJHandTileCtrl.js:140-189; ZMJOutTileCtrl.js:95-121; ZMJOutTileRow.js:149-176',sprite:'ZMJTile.js:254-276; local cocos2d-js-min.js byte560655/563390/884210 (TRIMMED default, auto size, trim quad)'});
fs.writeFileSync(dir+'/source.json',JSON.stringify(output,null,2));
fs.writeFileSync('demo/table-layout-source.js','// Generated from local original scene/prefabs by collect-table-layout.mjs.\nexport const TABLE_SOURCE = '+JSON.stringify(output,null,2)+';\n');
fs.writeFileSync(dir+'/frames.json',JSON.stringify([...frames.values()],null,2));
console.log(JSON.stringify({seats:output.seats.map(s=>s.name),frames:frames.size}));
