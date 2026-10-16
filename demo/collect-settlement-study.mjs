import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';

const dir='demo/settlement-study';
for(const name of ['assets','raw','source'])fs.mkdirSync(`${dir}/${name}`,{recursive:true});
const configs=fs.readdirSync('asset-study').filter(x=>x.endsWith('-config.json')).map(x=>[x.replace('-config.json',''),JSON.parse(fs.readFileSync('asset-study/'+x))]);
const refs=new Map(),frames=new Map(),layout=[];
for(const[b,c]of configs)c.uuids?.forEach((u,id)=>{const key=expandUUID(u);if(!refs.has(key))refs.set(key,[]);refs.get(key).push({bundle:b,id,path:c.paths?.[id]?.[0]});});
function frame(uuid){if(frames.has(uuid))return frames.get(uuid);for(const m of refs.get(uuid)||[])try{const p=lookup(m.bundle,m.id),f=p[5]?.[0];if(!f?.rect)continue;const r={...m,...f,textureUUID:expandUUID(p[1][p[10][0]]),image:`settlement-study/assets/${m.bundle}-${m.id}-${f.name}.png`};frames.set(uuid,r);return r;}catch{}return null;}
function decode(p,x){if(!Array.isArray(x))return null;const s=p[4][x[0]],t=p[3][s?.[0]];if(!Array.isArray(t))return null;const r={type:t[0]};s.slice(1,x.length).forEach((k,i)=>r[t[1][k]]=x[i+1]);return r;}
for(const id of [147,118,20,415]){const p=lookup('prefabs',id);fs.writeFileSync(`${dir}/raw/prefab-${id}.json`,JSON.stringify(p,null,2));for(const raw of p[5]){const n=decode(p,raw);if(n?.type!=='cc.Node')continue;const sprites=[],labels=[];for(const rawComp of n._components||[]){const c=decode(p,rawComp);if(c?.type==='cc.Sprite'&&Number.isInteger(c._spriteFrame)){const uuid=p[1][p[10][c._spriteFrame]];if(uuid){const f=frame(expandUUID(uuid));if(f)sprites.push({image:f.image,name:f.name,type:c._type});}}if(c?.type==='cc.Label')labels.push({text:c._string,size:c._fontSize,lineHeight:c._lineHeight});}layout.push({prefab:id,name:n._name,size:n._contentSize?.slice(1),transform:n._trs,active:n._active!==false,sprites,labels});}}
const game=configs.find(([b])=>b==='game')[1];for(const[id,p]of Object.entries(game.paths))if(p[0].startsWith('NewSkin/JieSuan/')&&game.types[p[1]]==='cc.SpriteFrame')frame(expandUUID(game.uuids[id]));
const common=configs.find(([b])=>b==='common')[1];for(const id of [554,114,796,480])frame(expandUUID(common.uuids[id]));
// Rank progress chooses native blue/brown backgrounds, while the bar itself
// uses the separate original cyan pic_26 sprite. Include runtime property refs.
for(const uuid of ['5efa2695-4ab9-4c4d-82d8-7a594e5c170f','87e15d59-a89b-4ce7-b12d-1183817beaaa','811e1177-c549-4cb7-8d54-3fe4282da1fe'])frame(uuid);
const nativeFonts={};for(const [kind,id]of [['win',47],['lose',133]]){const p=lookup('fonts',id),data=p[5][0];const spriteUUID=expandUUID(p[1][p[10][0]]);const f=frame(spriteUUID);nativeFonts[kind]={fontSize:data[2],config:data[3],frame:f};fs.writeFileSync(`${dir}/raw/font-${id}.json`,JSON.stringify(p,null,2));}
fs.writeFileSync(`${dir}/native-fonts.json`,JSON.stringify(nativeFonts,null,2));
function world(node){if(!node)return{x:0,y:0,sx:1,sy:1};const p=world(node._parent),t=node._trs??[0,0,0,0,0,0,1,1,1,1];return{x:p.x+t[0]*p.sx,y:p.y+t[1]*p.sy,sx:p.sx*t[7],sy:p.sy*t[8]};}
const nativeLayout=[];for(const id of [147,118,20]){for(const n of decodeCompiled(lookup('prefabs',id)).instances){if(n?.class!=='cc.Node')continue;const w=world(n),size=n._contentSize,anchor=n._anchorPoint;nativeLayout.push({prefab:id,name:n._name,parent:n._parent?._name,world:w,size,anchor,left:640+w.x-size[0]*anchor[0]*w.sx,top:360-w.y-size[1]*(1-anchor[1])*w.sy,components:n._components.map(c=>({type:c.class,spriteFrame:c._spriteFrame,fontSize:c._fontSize,lineHeight:c._lineHeight,text:c._string,font:c['_N$file'],color:n._color}))});}}
fs.writeFileSync(`${dir}/native-layout.json`,JSON.stringify(nativeLayout,null,2));
for(const name of ['CoinGameResultView','CoinGameResultPageView','CoinGameResultPageItemView','CoinGameResultPageMod','ComGameResultTempatePic'])fs.copyFileSync(`asset-study/readable/modules/${name}.js`,`${dir}/source/${name}.js`);
fs.copyFileSync('asset-study/readable/modules/MJMasterPathResult.js',`${dir}/source/MJMasterPathResult.js`);
fs.writeFileSync(`${dir}/frames.json`,JSON.stringify([...frames.values()],null,2));fs.writeFileSync(`${dir}/original-layout.json`,JSON.stringify(layout,null,2));
console.log({frames:frames.size,nodes:layout.length});
