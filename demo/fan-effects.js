// The common big-hu sprites, bitmap fonts, transform tracks and timing come from
// the collected Cocos assets. This renderer does not implement Cocos particles or Spine.
import {RED_FAN_CATALOGS} from './fan-catalog.js';
import {SICHUAN_FANS} from './bloodflow-scoring.js';
import {drawFanDetail,drawScoreDetail} from './fan-effects-detail.js';
const implementedLargeFans=[...SICHUAN_FANS,...Object.values(RED_FAN_CATALOGS).flat()].filter(f=>!f.additional&&f.name!=='平胡').map(f=>f.name);
export function normalizeFanName(name){
 const allowed=['清一色','对对胡','七对','七小对','龙七对','清七对','清对'];
 if(Array.isArray(name))return name.map(normalizeFanName).find(Boolean)||'';
 if(typeof name!=='string')return '';
 return [...allowed,...implementedLargeFans].includes(name.trim())?name.trim():'';
}
export function scoreEntries(deltas){
 if(!Array.isArray(deltas))return [];
 return deltas.slice(0,4).map((value,seat)=>({seat,value})).filter(x=>Number.isFinite(x.value)&&x.value!==0);
}
function vector(value){return Array.isArray(value)&&value.length===3&&value[0]===0?value.slice(1):value}
function mix(a,b,t){a=vector(a);b=vector(b);return Array.isArray(a)?a.map((v,i)=>v+(b[i]-v)*t):a+(b-a)*t}
function sample(keys,time,fallback){if(!keys?.length)return fallback;if(time<=keys[0].frame)return vector(keys[0].value);for(let i=1;i<keys.length;i++)if(time<=keys[i].frame){const a=keys[i-1],b=keys[i];let t=(time-a.frame)/(b.frame-a.frame);if(a.curve==='sineOut')t=Math.sin(t*Math.PI/2);return mix(a.value,b.value,t)}return vector(keys.at(-1).value)}
export { sample as sampleFanTrack };
function rgba(color){return[color&255,color>>>8&255,color>>>16&255,color>>>24]}
function colorAt(keys,time,fallback){if(!keys?.length)return rgba(fallback);const normalized=keys.map(k=>({...k,value:rgba(Array.isArray(k.value)?k.value[1]:k.value)}));return sample(normalized,time,rgba(fallback)).map(Math.round)}
function effectEnabled(force){if(force)return true;try{return JSON.parse(localStorage.getItem('MAHJONG_SETTINGS')||'{}').effects!==false}catch{return true}}
export async function createFanEffects(parent,{force=false,sound=true,style='lianzhuo'}={}){
 const data=await fetch('fan-study/effects.json').then(r=>{if(!r.ok)throw new Error('番型素材加载失败');return r.json()});
 const images=new Map(),tinted=new Map(),running=new Set(),layerMap=new Map(data.layers.map(l=>[l.path,l]));let soundOn=sound,generation=0;
 await Promise.all([...new Set([...data.layers.map(l=>l.image).filter(Boolean),...Object.values(data.fonts).map(f=>f.image),data.coin])].map(async src=>{const im=new Image();im.src=src;await im.decode();images.set(src,im)}));
 function tint(src,color){const c=color.map(Math.round),key=src+':'+c.join(',');if(c.every(v=>v===255))return images.get(src);if(tinted.has(key))return tinted.get(key);const im=images.get(src),canvas=document.createElement('canvas');canvas.width=im.width;canvas.height=im.height;const ctx=canvas.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){pixels.data[i]*=c[0]/255;pixels.data[i+1]*=c[1]/255;pixels.data[i+2]*=c[2]/255;pixels.data[i+3]*=c[3]/255}ctx.putImageData(pixels,0,0);tinted.set(key,canvas);return canvas}
 const words=new Map();function word(text,fontName,spacing=0){const key=[text,fontName,spacing].join(':');if(words.has(key))return words.get(key);const f=data.fonts[fontName],glyphs=[...text].map(c=>f.fontDefDictionary[c.codePointAt(0)]);if(glyphs.some(g=>!g)){if(fontName!=='fan')return null;const canvas=document.createElement('canvas');canvas.width=Math.max(220,text.length*96+40);canvas.height=128;const context=canvas.getContext('2d');context.font='bold 88px "Microsoft YaHei", sans-serif';context.textAlign='center';context.textBaseline='middle';context.lineWidth=6;context.strokeStyle='#774019';context.strokeText(text,canvas.width/2,64);const gold=context.createLinearGradient(0,15,0,110);gold.addColorStop(0,'#fff7bb');gold.addColorStop(1,'#f8b638');context.fillStyle=gold;context.fillText(text,canvas.width/2,64);words.set(key,canvas);return canvas;}let cursor=0,minX=0,maxX=0,minY=Infinity,maxY=-Infinity;const positions=glyphs.map(g=>{const x=cursor+g.xOffset,y=g.yOffset;minX=Math.min(minX,x);maxX=Math.max(maxX,x+g.rect.width);minY=Math.min(minY,y);maxY=Math.max(maxY,y+g.rect.height);cursor+=g.xAdvance+spacing;return[x,y]});const canvas=document.createElement('canvas');canvas.width=Math.ceil(maxX-minX);canvas.height=Math.ceil(maxY-minY);const ctx=canvas.getContext('2d'),im=images.get(f.image);glyphs.forEach((g,i)=>{const r=g.rect;ctx.drawImage(im,r.x,r.y,r.width,r.height,positions[i][0]-minX,positions[i][1]-minY,r.width,r.height)});words.set(key,canvas);return canvas}
 function properties(l,t){const p=data.tracks.paths?.[l.path]?.props||{},trs=l.trs,pos=sample(p.position,t,trs.slice(0,2)),sc=sample(p.scale,t,trs.slice(7,9));return{pos,scale:sc,angle:sample(p.angle,t,Math.atan2(trs[5],trs[6])*360/Math.PI),alpha:Math.max(0,Math.min(255,sample(p.opacity,t,l.opacity)))/255,color:colorAt(p.color,t,l.color)}}
 function transform(ctx,l,t){const parentLayer=l.parent&&layerMap.get(l.parent);if(parentLayer)transform(ctx,parentLayer,t);const p=properties(l,t);ctx.translate(p.pos[0],-p.pos[1]);ctx.rotate(-p.angle*Math.PI/180);ctx.scale(p.scale[0],p.scale[1]);ctx.globalAlpha*=p.alpha;return p}
 // Local seats are clockwise, whereas the original PiaoFen prefab's 1/3 seats
 // are left/right. These retain the original relative offsets after remapping.
 const scorePositions=[[640,464.888889],[957.333333,254.222222],[640,128],[291.555556,254.222222]];
 function drawScores(ctx,entries,t,renderStyle){if(!entries.length||t>=.82)return;ctx.save();for(const{seat,value}of entries){const text=(value>0?'+':'-')+Math.abs(value),im=word(text,value>0?'win':'loss'),coin=images.get(data.coin),[x,endY]=scorePositions[seat],y=endY+8.888889*(1-Math.min(1,t/.1));if(!im)continue;const s=5/6,w=im.width*s,h=im.height*s,coinW=53*2/3,coinH=56*2/3,gap=5*2/3,left=x-(coinW+gap+w)/2;ctx.drawImage(coin,left,y-coinH/2,coinW,coinH);if(renderStyle!=='original')drawScoreDetail(ctx,left+coinW/2,y,coinW,coinH,t,value>0);ctx.drawImage(im,left+coinW+gap,y-h/2,w,h)}ctx.restore()}
 function play({name='',seat=0,deltas=[],preview=false,style:renderStyle=style,paused=false,time=0}={}){
  const fan=normalizeFanName(name),entries=scoreEntries(deltas),duration=fan?data.duration:1;
  if(!effectEnabled(force||preview)||(!fan&&!entries.length))return{duration:0,finished:Promise.resolve()};
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=640;canvas.className='fan-effect';canvas.dataset.seat=String(seat);canvas.dataset.style=renderStyle;canvas.setAttribute('aria-label',(fan?fan+'番型动画；':'')+entries.map(e=>`玩家${e.seat+1} ${e.value>0?'+':''}${e.value}`).join('；'));parent.append(canvas);const ctx=canvas.getContext('2d');let finish,frameId=0,done=false,currentTime=Math.max(0,Math.min(duration,Number.isFinite(time)?time:0)),start=performance.now()-currentTime*1000,isPaused=!!paused;const finished=new Promise(resolve=>finish=resolve),job={cancel:false,canvas,finish:complete};running.add(job);
  function complete(){if(done)return;done=true;if(frameId)cancelAnimationFrame(frameId);frameId=0;canvas.remove();running.delete(job);finish()}
  function render(t){ctx.clearRect(0,0,1280,640);if(fan){for(const l of data.layers){if(!l.image&&!l.label)continue;ctx.save();ctx.translate(640,320);ctx.scale(...data.rootScale);const p=transform(ctx,l,t);if(l.label){const im=word(fan,'fan',l.label.spacing);if(im){if(renderStyle!=='original')drawFanDetail(ctx,im.width,im.height,t);ctx.drawImage(im,-im.width/2,-im.height/2)}}else if(l.image){ctx.globalCompositeOperation=l.blend===1?'lighter':'source-over';const im=tint(l.image,p.color);ctx.drawImage(im,-l.size[0]*l.anchor[0],-l.size[1]*(1-l.anchor[1]),...l.size)}ctx.restore()}}drawScores(ctx,entries,t,renderStyle)}
  function frame(now){frameId=0;if(job.cancel)return complete();if(isPaused||done)return;currentTime=(now-start)/1000;if(currentTime>duration)return complete();render(currentTime);frameId=requestAnimationFrame(frame)}
  function seek(value){if(done)return;currentTime=Math.max(0,Math.min(duration,Number.isFinite(value)?value:0));start=performance.now()-currentTime*1000;render(currentTime)}
  function pause(){if(done||isPaused)return;currentTime=Math.min(duration,(performance.now()-start)/1000);isPaused=true;if(frameId)cancelAnimationFrame(frameId);frameId=0;render(currentTime)}
  function resume(){if(done||!isPaused)return;isPaused=false;start=performance.now()-currentTime*1000;frameId=requestAnimationFrame(frame)}
  if(isPaused)render(currentTime);else frameId=requestAnimationFrame(frame);
  // Fan speech needs the original server fan ID/dialect mapping. It is deliberately
  // not guessed here; the existing action-effects controller handles the hu voice.
  return{duration,finished,seek,pause,resume};
 }
 function queue(events,{deltas,delay=0}={}){const epoch=generation,enabled=effectEnabled(force),fans=events.filter(event=>normalizeFanName(event.name)),scores=deltas??[0,0,0,0].map((_,seat)=>events.reduce((sum,event)=>sum+(event.deltas?.[seat]||0),0));const duration=enabled?delay+fans.length*data.duration+(scoreEntries(scores).length?1:0):0;const finished=(async()=>{if(!enabled)return;if(delay)await new Promise(resolve=>setTimeout(resolve,delay*1000));for(const event of fans){if(epoch!==generation)return;await play({...event,deltas:[]}).finished;}if(epoch===generation)await play({deltas:scores}).finished;})();return{duration,finished};}
 function clear(){generation++;for(const job of running){job.cancel=true;job.canvas.remove();job.finish()}running.clear()}
 addEventListener('pagehide',clear);
 return{play,queue,clear,syncSound(value){soundOn=!!value},get sound(){return soundOn},definitions:data};
}
