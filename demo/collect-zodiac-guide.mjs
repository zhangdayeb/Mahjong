import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';

const out='demo/zodiac-guide-study';
for(const folder of ['assets','source','raw'])fs.mkdirSync(`${out}/${folder}`,{recursive:true});
const refs=new Map(),frames=new Map();
for(const filename of fs.readdirSync('asset-study').filter(name=>name.endsWith('-config.json'))){
 const bundle=filename.replace('-config.json',''),config=JSON.parse(fs.readFileSync(`asset-study/${filename}`));
 config.uuids?.forEach((value,id)=>{const uuid=expandUUID(value);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:config.paths?.[id]?.[0]});});
}
function frame(uuid){
 if(frames.has(uuid))return frames.get(uuid);
 for(const ref of refs.get(uuid)||[])try{
  const raw=lookup(ref.bundle,ref.id),sprite=raw[5]?.[0];if(!sprite?.rect)continue;
  const value={...ref,...sprite,uuid,textureUUID:expandUUID(raw[1][raw[10][0]]),image:`zodiac-guide-study/assets/${ref.bundle}-${ref.id}-${sprite.name}.png`};frames.set(uuid,value);return value;
 }catch{}
 throw Error('Missing original zodiac guide SpriteFrame '+uuid);
}
function read(bundle,id){const raw=structuredClone(lookup(bundle,id));for(const key of [7,8])if(!Array.isArray(raw[key]))raw[key]=[];return decodeCompiled(raw);}
function primitive(component){return Object.fromEntries(Object.entries(component).filter(([key,value])=>key!=='node'&&(value===null||typeof value!=='object'||Array.isArray(value)&&value.every(item=>typeof item!=='object'))));}
function tree(node){
 const components=node._components||[],sprite=components.find(component=>component.class==='cc.Sprite'),label=components.find(component=>component.class==='cc.Label'),button=components.find(component=>component.class==='cc.Button'),builtin=sprite?._spriteFrame==='a23235d1-15db-4b95-8439-a2e005bfff91';
 return {name:node._name,trs:node._trs||[0,0,0,0,0,0,1,1,1,1],size:node._contentSize||[0,0],anchor:node._anchorPoint||[.5,.5],opacity:node._opacity??255,color:node._color?.[0]??0xffffffff,active:node._active!==false,
  sprite:sprite?{...primitive(sprite),frame:builtin?null:frame(sprite._spriteFrame).uuid,builtinSolid:builtin}:null,label:label?primitive(label):null,
  mask:components.some(component=>component.class==='cc.Mask'),widget:components.find(component=>component.class==='cc.Widget')?primitive(components.find(component=>component.class==='cc.Widget')):null,
  button:button?{...primitive(button),events:(button.clickEvents||[]).map(event=>({component:event._componentId,handler:event.handler,data:event.customEventData}))}:null,children:(node._children||[]).map(tree)};
}
const decoded=read('prefabs',1034),root=decoded.instances.find(node=>node?.class==='cc.Node'&&!node._parent),view=root._components.find(component=>component.pageTitle&&component.pageImg),source=fs.readFileSync('asset-study/readable/modules/SESXGuideView.js','utf8'),descriptions=[...source.matchAll(/pageInfo:\s*("(?:\\.|[^"])*")/g)].map(match=>JSON.parse(match[1]));
if(descriptions.length!==4)throw Error('Original zodiac guide descriptions must contain four pages');
const pages=view.pageTitle.map((title,index)=>{const titleFrame=frame(title),picture=frame(view.pageImg[index]);return {title:titleFrame.uuid,image:picture.uuid,titleSize:titleFrame.rect.slice(2),imageSize:picture.rect.slice(2),info:descriptions[index]};});
const fingerClip=read('resources',2092).instances.find(instance=>instance?.class==='cc.AnimationClip');
if(fingerClip?._name!=='shouzhi')throw Error('Original zodiac guide finger clip mismatch');
const entryIcon=frame('6fa1af32-140e-4df8-8e84-489534c647a5@6c48a').uuid;
const metadata={design:[1280,720],source:{bundle:'prefabs',id:1034,path:'hall/modules/SESXGuide/SESXGuide'},tree:tree(root),pages,entryIcon,
 openingAnimation:{expandDurationMs:200,settleDurationMs:100,initialScale:.1,expandedScale:1.1,finalScale:1},
 closeAnimation:{expandDurationMs:150,returnDurationMs:200,expandBy:.15,finalScale:.05,expandEasing:'cubicOut',returnEasing:'cubicOut'},
 fingerAnimation:{source:{bundle:'resources',id:2092,uuid:'ae456425-c1ab-43fb-85af-d8adbfa238d9'},delayMs:300,durationMs:fingerClip._duration*1000,clip:fingerClip},
 notes:['The four title and page sprites, explanatory sentences and native node transforms are copied from original local assets.','SESXGuideView hides the left arrow on page zero and the right arrow on page three. The serialized close button is visible on every page.','The source finger clip starts on load, becomes visible after 300 ms, and stays hidden after the final page has been reached, including when navigating back.','Opening and closing only affect this local preview; no online guide flags, rewards or game state are written.']};
fs.writeFileSync(`${out}/guide.json`,JSON.stringify(metadata,null,2));fs.writeFileSync(`${out}/frames.json`,JSON.stringify([...frames.values()],null,2));
fs.writeFileSync(`${out}/raw/prefabs-1034.json`,JSON.stringify(lookup('prefabs',1034),null,2));fs.writeFileSync(`${out}/raw/resources-2092.json`,JSON.stringify(lookup('resources',2092),null,2));
for(const name of ['SESXGuideView','SESXGuideCtrl','SESXGuideDefine','hallTableSelView','DlgAnimation'])fs.copyFileSync(`asset-study/readable/modules/${name}.js`,`${out}/source/${name}.js`);
console.log(JSON.stringify({source:metadata.source,pages:pages.length,frames:frames.size,fingerClip:fingerClip._name}));
