import {nativeSpriteDrawArgs} from './table-layout.js';
import {sampleResultTrack as sample} from './action-result-effects.js';
import {huDetailAngle,drawHuLandingDetails} from './tile-kong-details.js';
const baseURL=new URL('./',import.meta.url),styleURL=new URL('./tile-result-effects.css',import.meta.url);
const durations={hu:1166.6666666666667,zimoLight:1083.3333333333333,meldSmoke:783.3333333333333};
const channels=c=>[c&255,c>>>8&255,c>>>16&255,c>>>24&255];
const packed=c=>(c[0]|c[1]<<8|c[2]<<16|c[3]<<24)>>>0;
const product=(a,b)=>packed(channels(a).map((v,i)=>Math.round(v*channels(b)[i]/255)));
function sampledColor(keys,time,fallback){return keys?.length?packed(sample(keys.map(k=>({...k,value:channels(k.value)})),time,channels(fallback)).map(Math.round)):fallback;}

// Original GameAnimPrefabMap.huDian / ZiMoLight. Multiple HU_TILE events can
// coexist. Coordinates are the history tile ROOT's world origin; the effect
// never inherits that tile's side-on scale, rotation or mirror.
export function createTileResultEffects(parent,{width=1280,height=640,style:defaultStyle='refined'}={}){
 if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(e=>e.href===styleURL.href)){const l=document.createElement('link');l.rel='stylesheet';l.href=styleURL.href;document.head.append(l);}
 const canvas=document.createElement('canvas');canvas.className='tile-result-effect';canvas.width=width;canvas.height=height;canvas.hidden=true;canvas.setAttribute('aria-hidden','true');parent.append(canvas);
 const ctx=canvas.getContext('2d'),jobs=new Set(),images=new Map(),tints=new Map();let effects,frames,raf=0,destroyed=false;
 const ready=Promise.all([fetch(new URL('tile-result-study/effects.json',baseURL)).then(r=>{if(!r.ok)throw Error('胡牌落点动画定义加载失败');return r.json();}),fetch(new URL('tile-result-study/frames.json',baseURL)).then(r=>{if(!r.ok)throw Error('胡牌落点原图定义加载失败');return r.json();})]).then(async([definitions,metadata])=>{
  effects=new Map(definitions.map(d=>{const children=new Map();for(const n of d.nodes){if(!children.has(n.parent))children.set(n.parent,[]);children.get(n.parent).push(n);}return[d.name,{...d,children}];}));frames=new Map(metadata.map(f=>[f.image,f]));
  await Promise.all(metadata.map(async f=>{const im=new Image();im.src=new URL(f.image,baseURL).href;await im.decode();images.set(f.image,im);}));return definitions;
 });
 function tinted(url,color){const im=images.get(url);if(!im)return null;if(color===0xffffffff)return im;const key=url+':'+color;if(tints.has(key))return tints.get(key);const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const cx=c.getContext('2d');cx.drawImage(im,0,0);const pixel=cx.getImageData(0,0,c.width,c.height),rgba=channels(color);for(let i=0;i<pixel.data.length;i+=4)for(let k=0;k<4;k++)pixel.data[i+k]*=rgba[k]/255;cx.putImageData(pixel,0,0);if(tints.size>=96)tints.delete(tints.keys().next().value);tints.set(key,c);return c;}
 function drawNode(d,n,time,parentColor=0xffffffff,style=defaultStyle){const tracks=d.tracks.paths[n.path]||{},p=tracks.props||{};if(!sample(p.active,time,n.active,{discrete:true}))return;const position=sample(p.position,time,n.position),scale=sample(p.scale,time,n.scale),sx=sample(p.scaleX,time,scale[0]),sy=sample(p.scaleY,time,scale[1]),angle=sample(p.angle,time,n.angle)+(style==='original'?0:huDetailAngle(n.path,time,d.name)),opacity=sample(p.opacity,time,n.opacity)/255,color=product(parentColor,sampledColor(p.color,time,n.color));
  ctx.save();ctx.translate(position[0],-position[1]);ctx.rotate(-angle*Math.PI/180);ctx.scale(sx,sy);ctx.globalAlpha*=Math.max(0,Math.min(1,opacity));
  const sequence=sample(tracks.comps?.['cc.Sprite']?.spriteFrame,time,null,{discrete:true}),url=sequence?.image||n.sprite,im=url&&tinted(url,color),frame=frames.get(url);if(im&&frame){ctx.save();ctx.globalCompositeOperation=n.blend;ctx.drawImage(im,...nativeSpriteDrawArgs(frame,{sizeMode:n.spriteSizeMode,size:n.size,anchor:n.anchor,trim:n.trim}));ctx.restore();}
  for(const child of d.children.get(n.index)||[])drawNode(d,child,time,color,style);ctx.restore();
 }
 function render(){ctx.clearRect(0,0,width,height);for(const job of jobs){if(!job.started)continue;const d=effects.get(job.kind);ctx.save();ctx.translate(job.x,job.y);ctx.scale(job.scaleX??job.scale,job.scaleY??job.scale);for(const n of d.children.get(null)||[])drawNode(d,n,job.time,0xffffffff,job.style);if(job.style!=='original')drawHuLandingDetails(ctx,job.time,job.kind);ctx.restore();}canvas.hidden=!jobs.size;}
 function tick(now){raf=0;for(const job of jobs){if(!job.started)continue;job.time=Math.max(0,(now-job.start)/1000);if(job.time>=effects.get(job.kind).duration){jobs.delete(job);job.resolve({cancelled:false,durationMs:durations[job.kind]});job.onFinished?.();}}render();if([...jobs].some(j=>j.started))raf=requestAnimationFrame(tick);}
 function play({x,y,scale=1,scaleX=scale,scaleY=scale,kind='hu',delayMs=0,onFinished,style=defaultStyle}={}){if(!Number.isFinite(x)||!Number.isFinite(y)||!(scale>0)||!Number.isFinite(scaleX)||!Number.isFinite(scaleY)||!scaleX||!scaleY)throw Error('落牌效果需要有效舞台坐标与Canvas比例');if(kind!=='meldSmoke'&&(scaleX<0||scaleY<0))throw Error('胡牌电光不继承牌的镜像');if(!(kind in durations))throw Error('未知落牌动画 '+kind);let resolve;const finished=new Promise(r=>resolve=r),job={x,y,scale,scaleX,scaleY,kind,style,resolve,onFinished,time:0,started:false,timer:0};jobs.add(job);finished.finished=finished;finished.durationMs=durations[kind]+delayMs;finished.duration=finished.durationMs;finished.durationSeconds=finished.durationMs/1000;
  ready.then(()=>{if(destroyed||!jobs.has(job))return;job.timer=setTimeout(()=>{if(destroyed||!jobs.has(job))return;job.started=true;job.start=performance.now();canvas.hidden=false;render();if(!raf)raf=requestAnimationFrame(tick);},Math.max(0,delayMs));}).catch(error=>{if(jobs.delete(job))resolve({cancelled:true,error});});return finished;
 }
 function clear(){cancelAnimationFrame(raf);raf=0;for(const job of jobs){clearTimeout(job.timer);job.resolve({cancelled:true});}jobs.clear();canvas.hidden=true;ctx.clearRect(0,0,width,height);}
 function preview({x,y,scale=1,scaleX=scale,scaleY=scale,kind='hu',time=.4,style=defaultStyle}={}){clear();return ready.then(()=>{if(destroyed)return;const job={x,y,scale,scaleX,scaleY,kind,style,time,started:true,resolve:()=>{},timer:0};jobs.add(job);render();return effects.get(kind);});}
 return {play,playHu:(x,y,options={})=>play({x,y,...options,kind:'hu'}),playMeldSmoke:(x,y,options={})=>play({x,y,...options,kind:'meldSmoke'}),clear,cancel:clear,preview,ready,canvas,durationMs:durations.hu,get active(){return !canvas.hidden;},destroy(){destroyed=true;clear();tints.clear();canvas.remove();}};
}
