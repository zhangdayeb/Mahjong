import {createGameClip} from './game-audio.js';
import {computeTableLayout} from './table-layout.js';
import {meldEdge} from './meld-study/placements.js';
import {sampleResultTrack,actionSpriteRect} from './action-result-effects.js';
import {kongDetailAngle,drawKongDetails} from './tile-kong-details.js';

const BASE=new URL('.',import.meta.url);
// These durations include cc.AnimationClip.speed. Gang's gameplay pause is
// separate: these native ambient clips do not introduce an additional lock.
export const NATIVE_KONG_TIMINGS=Object.freeze({smoke:47/60*1000,rain:65/60/.5*1000,wind:35/60/.5*1000});
const localToDirection=[0,3,2,1],smokeOffsets=[[-180,20],[30,120],[180,-20],[-30,-120]];

export function nativeKongEffectAllowed(kind,gameType){
 return ['smoke','rain','wind'].includes(kind)&&(kind==='smoke'||Number(gameType)!==850);
}

// _edgePos is in CPG-local y-up coordinates. The right-hand CPG parent has
// negative scaleX; preserve that signed parent transform for smoke as well.
export function nativeCPGSmokePlacement(table,seat,edge){
 const cpg=table.seats[seat]?.meld,offset=smokeOffsets[localToDirection[seat]];
 if(!cpg||!offset||!Array.isArray(edge))throw Error('Native CPG smoke requires a seat and CPG edge');
 return {point:[cpg.origin[0]+(edge[0]+offset[0])*cpg.scale[0],cpg.origin[1]-(edge[1]+offset[1])*cpg.scale[1]],parentScale:cpg.scale.slice(),edge:edge.slice(),offset:offset.slice()};
}

export function nativeKongLayerState(definition,elapsedMs){
 const time=Math.max(0,Math.min(definition.clipDuration,elapsedMs/1000*definition.speed));
 return definition.layers.map(layer=>{
  const branch=definition.tracks.paths?.[layer.path]||{},props=branch.props||{};
  const scale=sampleResultTrack(props.scale,time,layer.scale);
  return {...layer,position:sampleResultTrack(props.position,time,layer.position),scale:[sampleResultTrack(props.scaleX,time,scale[0]),sampleResultTrack(props.scaleY,time,scale[1])],angle:sampleResultTrack(props.angle,time,layer.angle),opacity:sampleResultTrack(props.opacity,time,layer.opacity),active:sampleResultTrack(props.active,time,layer.active,{discrete:true}),sprite:sampleResultTrack(branch.comps?.['cc.Sprite']?.spriteFrame,time,layer.sprite,{discrete:true})};
 });
}

export function nativeKongPlacement(kind,table,{seat=0,point,parentScale,edge,groups,meldLayout}={}){
 if(kind==='smoke'){
  const nativeEdge=edge||(groups&&meldLayout?meldEdge(groups,seat,meldLayout):null);
  if(!point&&!nativeEdge)return null;
  const native=nativeEdge?nativeCPGSmokePlacement(table,seat,nativeEdge):null;
  return {point:point||native.point,parentScale:parentScale||native?.parentScale||table.seats[seat].meld.scale.slice()};
 }
 // playAnimation replaces the prefab root position. In particular, wind's
 // serialized [0,-20] is replaced by CPGHAnim's [0,-200].
 return {point:point||[table.width/2,table.height/2+(kind==='wind'?200*table.scale:0)],parentScale:parentScale||[table.scale,table.scale]};
}

export function createNativeKongEffects(parent,{width=1280,height=640,tableLayout=computeTableLayout(width,height),gameType,sound=true,force=false,style:defaultStyle='refined'}={}){
 if(!parent)throw Error('Native kong effects require a stage parent');
 if(!document.querySelector('link[data-native-kong-effects]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('native-kong-effects.css',BASE).href;link.dataset.nativeKongEffects='';document.head.append(link);}
 const running=new Set(),images=new Map(),frameByUUID=new Map(),voices=new Map();
 let data=null,disposed=false,raf=0,muted=!sound;
 const ready=Promise.all(['effects.json','frames.json'].map(file=>fetch(new URL('native-kong-study/'+file,BASE)).then(response=>{if(!response.ok)throw Error('Native kong '+file+' unavailable');return response.json();}))).then(async([metadata,frames])=>{
  data=metadata;
  await Promise.all(frames.map(async frame=>{frameByUUID.set(frame.uuid,frame);const image=new Image();image.src=new URL(frame.image,BASE).href;await image.decode();images.set(frame.uuid,image);}));
  if(disposed)return;
  for(const[kind,voice]of Object.entries(data.voices)){const audio=createGameClip(new URL(voice.file,BASE).href,.5);voices.set(kind,audio);}
  return data;
 });
 function enabled(){if(force)return true;try{return JSON.parse(localStorage.getItem('MAHJONG_SETTINGS')||'{}').effects!==false;}catch{return true;}}
 function finish(job,cancelled=false,error){if(!running.delete(job))return;job.canvas?.remove();job.resolve({kind:job.kind,seat:job.seat,cancelled,...(error?{error:String(error)}:{})});}
 function draw(job,elapsedMs){
  const context=job.context;context.clearRect(0,0,width,height);context.save();context.translate(...job.point);
  const root=job.definition.root;context.scale(job.parentScale[0]*root.runtimeScale,job.parentScale[1]*root.runtimeScale);context.globalAlpha=root.opacity/255;
  for(const layer of nativeKongLayerState(job.definition,elapsedMs)){
   if(!layer.active||layer.opacity<=0)continue;
   const image=images.get(layer.sprite),frame=frameByUUID.get(layer.sprite);if(!image||!frame)continue;
   const angle=layer.angle+(job.style==='original'?0:kongDetailAngle(job.kind,elapsedMs,job.definition.durationMs,layer.path));
   context.save();context.translate(layer.position[0],-layer.position[1]);context.rotate(-angle*Math.PI/180);context.scale(...layer.scale);context.globalAlpha*=Math.max(0,Math.min(1,layer.opacity/255));context.globalCompositeOperation=layer.blend===1?'lighter':'source-over';
   const{source,size}=actionSpriteRect(frame,layer);
   context.drawImage(image,...source,-layer.anchor[0]*size[0],-(1-layer.anchor[1])*size[1],...size);context.restore();
  }
  if(job.style!=='original')drawKongDetails(context,job.kind,elapsedMs,job.definition.durationMs);
  context.restore();
 }
 function update(now=performance.now()){
  for(const job of [...running]){
   if(!job.definition)continue;
   const elapsed=job.paused?job.fixedTime:Math.max(0,now-job.startTime);
   if(elapsed>=job.definition.durationMs&&!job.paused){finish(job);continue;}
   draw(job,Math.min(elapsed,job.definition.durationMs));
  }
 }
 function tick(now){raf=0;update(now);if([...running].some(job=>job.definition&&!job.paused)&&!disposed)raf=requestAnimationFrame(tick);}
 function skip(kind,seat,reason){return {durationMs:0,lockingMs:0,reason,finished:Promise.resolve({kind,seat,skipped:true,cancelled:false,reason})};}
 function play(options={}){
  const {kind,seat=0}=options;
  if(disposed)return skip(kind,seat,'disposed');
  if(!nativeKongEffectAllowed(kind,options.gameType??gameType))return skip(kind,seat,Number(options.gameType??gameType)===850&&kind!=='smoke'?'native-room-excluded':'unconfirmed-native-effect');
  const placement=nativeKongPlacement(kind,tableLayout,options);
  if(!placement)return skip(kind,seat,'smoke-requires-cpg-edge');
  let resolve;const finished=new Promise(done=>resolve=done),job={kind,seat,...placement,style:options.style??defaultStyle,resolve,paused:options.paused===true,fixedTime:options.timeMs??0};running.add(job);
  ready.then(()=>{
   if(!running.has(job)||disposed)return;
   if(!muted&&!options.silent){const voice=voices.get(kind);if(voice){voice.currentTime=0;voice.play().catch(()=>{});}}
   if(!enabled()){finish(job);return;}
   job.definition=data.definitions[kind];job.canvas=document.createElement('canvas');job.canvas.width=width;job.canvas.height=height;job.canvas.className='native-kong-effect native-kong-'+kind;job.canvas.setAttribute('aria-label',{smoke:'碰杠落牌烟雾',rain:'暗杠下雨动画',wind:'明杠补杠刮风动画'}[kind]);parent.append(job.canvas);job.context=job.canvas.getContext('2d');job.startTime=performance.now();
   draw(job,job.paused?job.fixedTime:0);if(!job.paused&&!raf)raf=requestAnimationFrame(tick);
  }).catch(error=>finish(job,true,error));
  return {durationMs:NATIVE_KONG_TIMINGS[kind],lockingMs:0,finished,cancel:()=>finish(job,true)};
 }
 function clear(){if(raf)cancelAnimationFrame(raf);raf=0;for(const job of [...running])finish(job,true);for(const voice of voices.values())voice.pause();}
 function setSound(value){muted=!value;if(muted)for(const voice of voices.values())voice.pause();}
 function dispose(){clear();disposed=true;images.clear();voices.clear();removeEventListener('pagehide',clear);}
 addEventListener('pagehide',clear);
 return {ready,play,update,clear,dispose,setSound,syncSound:setSound,get metadata(){return data;},get running(){return running.size;}};
}
