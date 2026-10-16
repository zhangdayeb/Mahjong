// Parse the already collected public Cocos assets. The original game code is not executed.
import fs from'node:fs';import{lookup,expandUUID}from'./inspect-assets.mjs';
const out='demo/fan-study';for(const d of ['assets','raw','source'])fs.mkdirSync(out+'/'+d,{recursive:true});
const configs=fs.readdirSync('asset-study').filter(f=>f.endsWith('-config.json')).map(f=>[f.replace('-config.json',''),JSON.parse(fs.readFileSync('asset-study/'+f))]);
const ids=new Map();for(const[b,c]of configs)c.uuids?.forEach((u,id)=>{const key=expandUUID(u);if(!ids.has(key))ids.set(key,[]);ids.get(key).push({bundle:b,id})});
const frames=new Map();function frame(uuid){if(frames.has(uuid))return frames.get(uuid);for(const m of ids.get(uuid)||[]){try{const p=lookup(m.bundle,m.id),f=p[5]?.[0];if(f?.rect){const r={...m,...f,image:`fan-study/assets/${m.bundle}-${m.id}-${f.name}.png`,textureUUID:expandUUID(p[1][p[10][0]])};frames.set(uuid,r);return r}}catch{}}throw new Error('Missing original sprite '+uuid)}
function obj(p,x){if(!Array.isArray(x)||!Number.isInteger(x[0]))return null;const schema=p[4][x[0]],type=p[3][schema?.[0]];if(!Array.isArray(type))return null;const r={type:type[0]};schema.slice(1,x.length).forEach((n,i)=>{r[type[1][n]]=x[i+1]});return r;}
function packed(x){if(!Array.isArray(x))return x;if(x[0]&&typeof x[0]==='object'&&!Array.isArray(x[0])){const o={...x[0]};for(let i=1;i<x.length;i+=3)o[x[i]]=packed(x[i+2]);return o}if(Array.isArray(x[0])&&x.length>1&&x.slice(1).every(Number.isInteger))return x[0].map(packed);return x.map(packed)}
function font(bundle,id){const p=lookup(bundle,id),f=obj(p,p[5][0]),sf=frame(expandUUID(p[1][p[10][0]]));fs.writeFileSync(out+'/raw/font-'+bundle+'-'+id+'.json',JSON.stringify(p,null,2));return{bundle,id,image:sf.image,...f._fntConfig}}
const fonts={fan:font('resources',2448),loss:font('fonts',273),win:font('fonts',236)};
const p=lookup('resources',443),a=lookup('resources',2402),clip=obj(a,a[5][0]);
fs.writeFileSync(out+'/raw/big-hu-prefab.json',JSON.stringify(p,null,2));fs.writeFileSync(out+'/raw/big-hu-clip.json',JSON.stringify(a,null,2));
const nodes=p[5].map((x,index)=>({...obj(p,x),index})).filter(x=>x.type==='cc.Node');
const byIndex=new Map(nodes.map(n=>[n.index,n]));function path(n){const parent=byIndex.get(n._parent);return !parent||parent.index===2?'':path(parent)+(parent._name==='fx_qingyise'?'':parent._name+'/')}
const layers=[];for(const n of nodes){if(n.index<3)continue;const components=(n._components||[]).map(c=>obj(p,c));const sp=components.find(c=>c?.type==='cc.Sprite');let image;if(sp){const f=frame(expandUUID(p[1][p[10][sp._spriteFrame]]));image=f.image}layers.push({name:n._name,path:path(n)+n._name,parent:n._parent===2?null:byIndex.get(n._parent)?path(byIndex.get(n._parent))+byIndex.get(n._parent)._name:null,size:n._contentSize?.slice(1)||[0,0],trs:n._trs||[0,0,0,0,0,0,1,1,1,1],anchor:n._anchorPoint?.slice(1)||[.5,.5],color:n._color?.[1]??0xffffffff,opacity:n._opacity??255,blend:sp?._dstBlendFactor??771,image,label:n._name==='q'?{font:'fan',spacing:-15}:null})}
const coin=frame(expandUUID(configs.find(([b])=>b==='resources')[1].uuids[2387]));
const data={name:'ex_bigHu',prefab:443,animation:2402,duration:clip._duration,rootScale:[1.7,1.7],tracks:packed(clip.curveData),layers,fonts,coin:coin.image,supportedNames:['清一色','对对胡','七对','七小对','龙七对','清七对','清对'],scoreTween:{rise:10,duration:.1}};
fs.writeFileSync(out+'/effects.json',JSON.stringify(data,null,2));fs.writeFileSync(out+'/frames.json',JSON.stringify([...frames.values()],null,2));
for(const n of ['NewCPGHAnim','CPGHAnim','blockHuAniBase','blockHuAni_bigHu','MjHuAnimationEnum','PiaoFen','PiaoFenItem'])fs.copyFileSync('asset-study/readable/modules/'+n+'.js',out+'/source/'+n+'.js');
console.log(JSON.stringify({layers:layers.length,sprites:frames.size,duration:clip._duration,fonts:Object.keys(fonts)}));
