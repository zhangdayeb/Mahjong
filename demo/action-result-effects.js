import {createGameClip} from './game-audio.js';
import {actionFinishMotion,createActionBannerFinish} from './action-result-finish.js';
const BASE=new URL('.',import.meta.url);

export function sampleResultTrack(keys,time,fallback,{discrete=false}={}){
 if(!keys?.length)return fallback;
 if(time<=keys[0].frame)return keys[0].value;
 for(let i=1;i<keys.length;i++)if(time<keys[i].frame){
  const a=keys[i-1],b=keys[i];if(discrete||typeof a.value==='boolean'||typeof a.value==='string')return a.value;
  let t=(time-a.frame)/(b.frame-a.frame);if(a.curve==='sineOut')t=Math.sin(t*Math.PI/2);else if(a.curve==='cubicOut')t=1-(1-t)**3;
  if(Array.isArray(a.value))return a.value.map((value,j)=>value+((b.value[j]??value)-value)*t);
  return a.value+(b.value-a.value)*t;
 }
 return keys.at(-1).value;
}

export function actionResultLayout(layout,width=1280,height=640){
 const scale=Math.min(width/layout.root.size[0],height/layout.root.size[1]);
 return {width,height,scale,positions:layout.localToSourceSeat.map(seat=>[width/2+layout.positions[seat][0]*scale,height/2-layout.positions[seat][1]*scale])};
}

export function sampleResultLayers(definition,time){
 return definition.layers.map(layer=>{
  const branch=definition.tracks.paths?.[layer.path]||{},props=branch.props||{},position=sampleResultTrack(props.position,time,layer.trs.slice(0,3));
  const scale=sampleResultTrack(props.scale,time,layer.trs.slice(7,9));
  return {...layer,position,scale:[sampleResultTrack(props.scaleX,time,scale[0]),sampleResultTrack(props.scaleY,time,scale[1])],angle:sampleResultTrack(props.angle,time,2*Math.atan2(layer.trs[5],layer.trs[6])*180/Math.PI),opacity:sampleResultTrack(props.opacity,time,layer.opacity),active:sampleResultTrack(props.active,time,layer.active,{discrete:true}),sprite:sampleResultTrack(branch.comps?.['cc.Sprite']?.spriteFrame,time,layer.sprite,{discrete:true})};
 });
}

export function actionSpriteRect(frame,layer){
 const [width,height]=frame.rect.slice(2),[originalWidth,originalHeight]=frame.originalSize,[offsetX,offsetY]=frame.offset||[0,0];
 const size=layer.sizeMode===2?frame.originalSize:layer.sizeMode===1?[width,height]:layer.size;
 const source=layer.trim?[Math.round((originalWidth-width)/2+offsetX),Math.round((originalHeight-height)/2-offsetY),width,height]:[0,0,originalWidth,originalHeight];
 return {source,size};
}

export async function createActionResultEffects(parent,{force=false,sound=true,width=1280,height=640}={}){
 if(!parent)throw Error('Action result effects require their stage parent');
 if(!document.querySelector('link[data-action-result-effects]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('action-result-effects.css',BASE).href;link.dataset.actionResultEffects='';document.head.append(link);}
 const [data,frames]=await Promise.all(['effects.json','frames.json'].map(file=>fetch(new URL('action-result-study/'+file,BASE)).then(response=>{if(!response.ok)throw Error('Native action result '+file+' unavailable');return response.json();})));
 const images=new Map(),clips=new Map(),running=new Set(),frameByUUID=new Map(frames.map(frame=>[frame.uuid,frame]));
 await Promise.all(frames.map(async frame=>{const image=new Image();image.src=new URL(frame.image,BASE).href;await image.decode();images.set(frame.uuid,image);}));
 for(const voice of data.voices){const audio=createGameClip(new URL(voice.file,BASE).href,.5);clips.set(voice.action,audio);}
 // QGH has an animation but no extracted native clip. Its new voice and the
 // red-kong override are queued by the same speech channel as ordinary CPGH.
 for(const name of ['qgh','red-kong'])clips.set(name,createGameClip(new URL(`audio-v2/voice/${name}.mp3`,BASE).href,.5));
 const layout=actionResultLayout(data.layout,width,height),bannerFinish=createActionBannerFinish(()=>document.createElement('canvas'));let muted=!sound,raf=0,disposed=false;
 const labels={hu:'胡牌横幅与金币动画',peng:'碰牌横幅与金币动画',gang:'杠牌横幅与金币动画',zimo:'自摸横幅与金币动画',qgh:'抢杠胡金光动画'};
 function enabled(){if(force)return true;try{return JSON.parse(localStorage.getItem('MAHJONG_SETTINGS')||'{}').effects!==false;}catch{return true;}}
 function finish(job,cancelled=false){if(!running.delete(job))return;job.canvas.remove();job.resolve({cancelled,name:job.name,seat:job.seat});}
 function draw(job,time){
  const context=job.context;context.clearRect(0,0,width,height);context.save();context.translate(...job.point);
  const root=job.definition.root;context.scale(layout.scale*root.trs[7],layout.scale*root.trs[8]);context.globalAlpha=root.opacity/255;
  const motion=actionFinishMotion(job.name,time,job.definition.duration);
  for(const layer of sampleResultLayers(job.definition,time)){
   if(!layer.active||layer.opacity<=0)continue;
   const image=images.get(layer.sprite),frame=frameByUUID.get(layer.sprite);if(!image||!frame)continue;
   context.save();context.translate(layer.position[0],-layer.position[1]);context.rotate(-layer.angle*Math.PI/180);context.scale(...layer.scale);context.globalAlpha*=Math.max(0,Math.min(1,layer.opacity/255));context.globalCompositeOperation=layer.blend===1?'lighter':'source-over';
   // Common banners are RAW+non-trim; native QGH also contains TRIMMED layers.
   // Recover their occupied rect before drawing instead of stretching padding.
   const {source,size}=actionSpriteRect(frame,layer);
   const left=-layer.anchor[0]*size[0],top=-(1-layer.anchor[1])*size[1],title=layer.path==='zi_hu'||layer.path==='Qkh';
   const refined=job.style!=='original';
   if(refined&&!title&&(layer.path==='hupai_lizi_0000'||layer.path==='Qk_sg_01')){context.rotate(motion.particleAngle*Math.PI/180);context.scale(...motion.particleScale);}
   if(!refined||!title||!bannerFinish.draw(context,{key:layer.sprite,image,source,size,left,top,motion}))context.drawImage(image,...source,left,top,...size);
   context.restore();
  }
  context.restore();
 }
 function update(now=performance.now()){
  for(const job of [...running]){
   const time=job.paused?job.fixedTime:Math.max(0,(now-job.startTime)/1000);
   if(time>=job.definition.duration&&!job.paused){finish(job);continue;}draw(job,Math.min(time,job.definition.duration));
  }
 }
 function tick(now){raf=0;update(now);if([...running].some(job=>!job.paused)&&!disposed)raf=requestAnimationFrame(tick);}
 function skip(name,reason){return {duration:0,durationMs:0,reason,finished:Promise.resolve({name,skipped:true,cancelled:false,reason})};}
 function play(name,seat=0,options={}){
  if(disposed)return skip(name,'disposed');
  name=name==='ziMo'||name==='zimo2'?'zimo':name==='anGang'||name==='angang'||name==='dark'?'gang':name==='QGH'||name==='qiangganghu'?'qgh':name;
  const definition=data.definitions[name];if(!definition)return skip(name,'unconfirmed-native-action');
  if(!muted&&!options.silent){const voice=clips.get(options.voiceName||name);if(voice){voice.currentTime=0;voice.play().catch(()=>{});}}
  if(!enabled())return skip(name,'effects-disabled');
  seat=Math.max(0,Math.min(3,Math.floor(Number(seat)||0)));
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.className='action-result-effect';canvas.setAttribute('aria-label',labels[name]);parent.append(canvas);
  let resolve;const finished=new Promise(done=>{resolve=done;});const startTime=performance.now();
  const point=Array.isArray(options.point)?options.point:options.point&&Number.isFinite(options.point.x)&&Number.isFinite(options.point.y)?[options.point.x,options.point.y]:layout.positions[seat];
  const job={name,seat,definition,canvas,context:canvas.getContext('2d'),point,startTime,resolve,paused:options.paused===true,fixedTime:options.time??0,style:options.style==='original'?'original':'refined'};
  running.add(job);draw(job,job.paused?job.fixedTime:0);if(!job.paused&&!raf)raf=requestAnimationFrame(tick);
  return {duration:definition.duration,durationMs:definition.duration*1000,startTime,finished,cancel:()=>finish(job,true)};
 }
 function clear(){if(raf)cancelAnimationFrame(raf);raf=0;for(const job of [...running])finish(job,true);for(const voice of clips.values())voice.pause();}
 function dispose(){clear();disposed=true;removeEventListener('pagehide',clear);images.clear();clips.clear();bannerFinish.clear();}
 addEventListener('pagehide',clear);
 return {play,clear,update,dispose,syncSound(value){muted=!value;if(muted)for(const voice of clips.values())voice.pause();},definitions:data.definitions,metadata:data,layout,supported:Object.keys(data.definitions)};
}
