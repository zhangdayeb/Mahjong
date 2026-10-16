// Read original local prefabs and atlases without executing their scripts.
import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
const dir='demo/seat-tag-study';fs.mkdirSync(dir+'/assets',{recursive:true});
const refs=new Map(),frames=new Map(),textures=JSON.parse(fs.readFileSync('asset-study/collected-manifest.json'));
for(const file of fs.readdirSync('asset-study').filter(f=>f.endsWith('-config.json'))){const bundle=file.replace('-config.json',''),c=JSON.parse(fs.readFileSync('asset-study/'+file));c.uuids?.forEach((u,id)=>{const uuid=expandUUID(u);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:c.paths?.[id]?.[0]});});}
function entry(uuid){for(const r of refs.get(uuid)||[])try{return {...r,raw:lookup(r.bundle,r.id)};}catch{}throw Error('Missing local asset '+uuid);}
function frame(uuid){if(frames.has(uuid))return frames.get(uuid);for(const r of refs.get(uuid)||[])try{const raw=lookup(r.bundle,r.id),f=raw[5]?.[0];if(!f?.rect)continue;const textureUUID=expandUUID(raw[1][raw[10][0]]),texture=textures.find(x=>x.bundle===r.bundle&&x.uuid===textureUUID)||textures.find(x=>x.uuid===textureUUID);if(!texture)continue;const result={...r,...f,uuid,texture:texture.file,image:`seat-tag-study/assets/${r.bundle}-${r.id}.png`,trimmedImage:`seat-tag-study/assets/${r.bundle}-${r.id}-trimmed.png`};frames.set(uuid,result);return result;}catch{}throw Error('Missing local SpriteFrame '+uuid);}
const decode=(bundle,id)=>decodeCompiled(lookup(bundle,id)).instances;
const nodes=a=>a.filter(n=>n?.class==='cc.Node');
const geometry=n=>({name:n._name,position:n._trs.slice(0,2),scale:n._trs.slice(7,9),size:n._contentSize,anchor:n._anchorPoint,widget:n._components.find(c=>c.class==='cc.Widget')?Object.fromEntries(Object.entries(n._components.find(c=>c.class==='cc.Widget')).filter(([k])=>!['node','_target'].includes(k))):null});
const sprite=n=>{const sp=n._components.find(c=>c.class==='cc.Sprite');return {...geometry(n),sizeMode:sp._sizeMode??1,trim:sp._isTrimmedMode??true,frame:sp._spriteFrame?frame(sp._spriteFrame):null};};
const user=decode('prefabs',904),uc=nodes(user).flatMap(n=>n._components).find(c=>c.spriteDisplayBigTag),card=decode('prefabs',2595);
const atlas=entry(uc.UserInfoAtlas),map=atlas.raw[5][0][2],big={},small={};
for(let i=1;i<map.length;i+=3){const match=map[i].match(/^img_(Display|UserTag)_([123])$/);if(match)(match[1]==='Display'?big:small)[match[2]]=frame(expandUUID(atlas.raw[1][atlas.raw[10][map[i+2]]]));}
const group=decode('prefabs',35),item=decode('prefabs',238),tileTags=[];
for(const id of [236,135,141,295]){const a=decode('main',id),c=nodes(a).flatMap(n=>n._components).find(c=>c.colorAtlas),e=entry(c.colorAtlas),m=e.raw[5][0][2],name=id===135?'r_img_Tag_8':'img_Tag_8';let f;
 for(let i=1;i<m.length;i+=3)if(m[i]===name)f=frame(expandUUID(e.raw[1][e.raw[10][m[i+2]]]));
 tileTags.push({prefab:id,sprite:sprite(c.oTileTag.node),queFrame:f});
}
const exit=decode('prefabs',2084),exitNodes=nodes(exit);
const dingque=textures.find(x=>x.type==='cc.AudioClip'&&x.path?.endsWith('/EffectSound/dingque'));let audio;
if(dingque){fs.mkdirSync(dir+'/audio',{recursive:true});audio='seat-tag-study/audio/dingque.mp3';fs.copyFileSync(dingque.file,'demo/'+audio);}
const output={design:[1280,720],localToSourceSeat:[0,3,2,1],bigParent:geometry(uc.nodeBigTagBg),bigNodes:uc.spriteDisplayBigTag.map(s=>sprite(s.node)),big,small,group:geometry(nodes(group)[0]),tag:sprite(nodes(item)[0]),userTagLayout:geometry(nodes(card).find(n=>n._name==='UserTagLayout')),tileTags,audio,animation:{duration:1.4,steps:[{duration:.2,scale:1.2},{duration:.2,scale:1},{duration:.5},{duration:.5,scale:.3,moveToTag:true}],easing:'sineInOut'},exit:{prefab:2084,nodes:exitNodes.map(n=>{const sp=n._components.find(c=>c.class==='cc.Sprite'),label=n._components.find(c=>c.class==='cc.Label');return {...geometry(n),parent:n._parent?._name,sprite:sp?sprite(n):null,label:label?{text:label._string,fontSize:label._fontSize??40,lineHeight:label._lineHeight??40}:null};})},sources:{animation:'UserInfoLayer.js:398–439',tagLayout:'UserInfoNode.js:349–358,493–534; UserTagGroup.js:22–48; UserTag.js:40–49',tileTag:'ZMJTile.js:200–210,278–291; RuleConfirmQue.js:85–106; ZMJTileDefine.js:17',exit:'KeepStay prefab2084; Menu.js:180–207; KeepStayView.js:27–64'}};
fs.writeFileSync(dir+'/source.json',JSON.stringify(output,null,2));fs.writeFileSync(dir+'/frames.json',JSON.stringify([...frames.values()],null,2));fs.writeFileSync('demo/native-seat-tag-source.js','// Generated from original local prefab 904 and UserInfoAtlas.\nexport const SEAT_TAG_SOURCE='+JSON.stringify(output,null,2)+';\n');
console.log(JSON.stringify({frames:frames.size,big:Object.keys(big),small:Object.keys(small),exit:2084}));
