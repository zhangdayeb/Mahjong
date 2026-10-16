import {drawNativeNode} from './native-ui-canvas.js';
import {alignActivityWidgets,activityButtonRects,layoutActivityLabels} from './native-hall-activities.js';
import {sanguoGuideOpenPose,sanguoGuideClosePose} from './native-sanguo-guide.js';

const BASE=new URL('.',import.meta.url);
const make=(tag,className)=>{const node=document.createElement(tag);if(className)node.className=className;return node;};
function find(node,name){if(node.name===name)return node;for(const child of node.children||[]){const result=find(child,name);if(result)return result;}}
const mix=(a,b,t)=>Array.isArray(a)?a.map((value,index)=>value+(b[index]-value)*t):a+(b-a)*t;
function ease(curve,t){
 if(curve==='sineIn')return 1-Math.cos(t*Math.PI/2);
 if(curve==='sineOut')return Math.sin(t*Math.PI/2);
 if(!Array.isArray(curve))return t;
 const [x1,y1,x2,y2]=curve,cubic=(p,q,u)=>3*(1-u)**2*u*p+3*(1-u)*u*u*q+u**3;
 let low=0,high=1;for(let index=0;index<24;index++){const middle=(low+high)/2;if(cubic(x1,x2,middle)<t)low=middle;else high=middle;}
 return cubic(y1,y2,(low+high)/2);
}
function sample(keys,time){
 if(time<=keys[0].frame)return keys[0].value;
 for(let index=1;index<keys.length;index++)if(time<=keys[index].frame){const a=keys[index-1],b=keys[index];return mix(a.value,b.value,ease(a.curve,(time-a.frame)/(b.frame-a.frame)));}
 return keys.at(-1).value;
}
export function buildZodiacGuidePage(data,index=0,{completed=false}={}){
 const page=Math.max(0,Math.min(data.pages.length-1,Math.trunc(index)||0)),tree=structuredClone(data.tree),current=data.pages[page],title=find(tree,'Title'),picture=find(tree,'ShowPic'),description=find(tree,'Label');
 title.sprite.frame=current.title;title.size=current.titleSize.slice();picture.sprite.frame=current.image;picture.size=current.imageSize.slice();
 description.label._string=current.info;description.label._nativeAutoWidth=true;
 find(tree,'Left').active=page>0;find(tree,'Right').active=page<data.pages.length-1;
 const finger=find(tree,'shouzhi');finger.active=!completed&&page<data.pages.length-1;finger.opacity=0;
 return tree;
}
export function zodiacGuideFingerPose(data,elapsedMs,{completed=false}={}){
 const animation=data.fingerAnimation,duration=animation.durationMs,time=((Math.max(0,elapsedMs)%duration)+duration)%duration/1000,paths={};
 for(const[path,tracks]of Object.entries(animation.clip.curveData.paths)){
  paths[path]={};for(const[property,keys]of Object.entries(tracks.props||{}))paths[path][property]=sample(keys,time);
 }
 return {active:!completed,opacity:completed||elapsedMs<animation.delayMs?0:255,paths};
}
function applyFinger(tree,pose){
 const finger=find(tree,'shouzhi');finger.active=pose.active;finger.opacity=pose.opacity;
 for(const[path,properties]of Object.entries(pose.paths)){
  let node=finger;for(const name of path.split('/'))node=node?.children?.find(child=>child.name===name);if(!node)continue;
  if(properties.position){node.trs[0]=properties.position[0];node.trs[1]=properties.position[1];}
  if(properties.scale){node.trs[7]=properties.scale[0];node.trs[8]=properties.scale[1];}
  if(properties.opacity!==undefined)node.opacity=properties.opacity;
 }
}

export function createNativeZodiacGuide(parent,{onClose=()=>{},entryPoint}={}){
 if(!parent)throw Error('十二生肖介绍需要父舞台');
 if(!document.querySelector('link[data-native-zodiac-guide]')){const link=make('link');link.rel='stylesheet';link.href=new URL('native-zodiac-guide.css',BASE).href;link.dataset.nativeZodiacGuide='';document.head.append(link);}
 const layer=make('section','native-zodiac-guide');layer.hidden=true;layer.tabIndex=-1;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');
 const canvas=make('canvas','native-zodiac-guide-canvas'),hits=make('div','native-zodiac-guide-hits');canvas.setAttribute('role','img');layer.append(canvas,hits);parent.append(layer);
 let data,frames,images,tree,buttons=[],width=1280,height=720,page=0,completed=false,open=false,disposed=false,previousFocus,version=0,closing=false,opening=false,transitionId,fingerId,resolveClose,resolveOpen,startedAt=0,motion=true;
 const now=()=>typeof performance==='undefined'?Date.now():performance.now(),schedule=callback=>typeof requestAnimationFrame==='function'?requestAnimationFrame(callback):setTimeout(()=>callback(now()),33),cancel=id=>typeof cancelAnimationFrame==='function'?cancelAnimationFrame(id):clearTimeout(id);
 const ready=Promise.all(['guide.json','frames.json'].map(file=>fetch(new URL('zodiac-guide-study/'+file,BASE)).then(response=>{if(!response.ok)throw Error('原版十二生肖介绍资源加载失败');return response.json();}))).then(async([metadata,spriteFrames])=>{
  data=metadata;frames=new Map(spriteFrames.map(frame=>[frame.uuid,frame]));images=new Map(await Promise.all(spriteFrames.map(async frame=>{const image=new Image();image.src=new URL(frame.image,BASE).href;await image.decode();return [frame.uuid,image];})));
  if(!disposed)resize();return metadata;
 });
 function removeButtons(){buttons.forEach(button=>button.remove());buttons=[];}
 function paint(){
  if(!data||!frames||!images||!tree||!open||disposed)return;
  applyFinger(tree,zodiacGuideFingerPose(data,now()-startedAt,{completed}));
  const context=canvas.getContext('2d'),scale=height/720;context.clearRect(0,0,width,height);context.save();context.translate(width/2,height/2);context.scale(scale,scale);drawNativeNode(context,tree,{frames,images,ignorePosition:true});context.restore();
 }
 function redraw(){
  if(!data||!frames||!images||!open||disposed||closing||opening)return;
  tree=buildZodiacGuidePage(data,page,{completed});alignActivityWidgets(tree,width/(height/720),720);layoutActivityLabels(tree,canvas.getContext('2d'));paint();removeButtons();
  layer.setAttribute('aria-label',`十二生肖介绍，第${page+1}页`);canvas.setAttribute('aria-label',data.pages[page].info);const scale=height/720;
  for(const hit of activityButtonRects(tree)){
   const handler=hit.events[0]?.handler,button=make('button');button.type='button';button.dataset.action=handler;button.setAttribute('aria-label',handler==='onClickLeft'?'上一页':handler==='onClickRight'?'下一页':'关闭介绍');
   const[left,top,right,bottom]=hit.bounds;Object.assign(button.style,{left:width/2+left*scale+'px',top:height/2+top*scale+'px',width:(right-left)*scale+'px',height:(bottom-top)*scale+'px'});
   button.onclick=()=>handler==='onClickLeft'?previous():handler==='onClickRight'?next():close();hits.append(button);buttons.push(button);
  }
 }
 function resize(){width=parent.offsetWidth||1280;height=parent.offsetHeight||720;canvas.width=width;canvas.height=height;if((opening||closing)&&tree){alignActivityWidgets(tree,width/(height/720),720);paint();}else redraw();}
 function stopFinger(){if(fingerId!==undefined)cancel(fingerId);fingerId=undefined;}
 function startFinger(){
  stopFinger();if(!motion||completed||!open||disposed)return;
  const tick=()=>{if(!open||disposed||closing||completed)return;paint();fingerId=schedule(tick);};fingerId=schedule(tick);
 }
 function stopTransition(){if(transitionId!==undefined)cancel(transitionId);transitionId=undefined;closing=opening=false;resolveClose?.({cancelled:true});resolveClose=null;resolveOpen?.(api);resolveOpen=null;}
 function playOpening(){
  opening=true;removeButtons();const root=find(tree,'Root');root.trs[7]=root.trs[8]=data.openingAnimation.initialScale;paint();let started;
  const finished=new Promise(resolve=>resolveOpen=resolve);
  function tick(timestamp){if(disposed||!opening)return;if(started===undefined)started=timestamp;const pose=sanguoGuideOpenPose(timestamp-started,data.openingAnimation);root.trs[7]=root.trs[8]=pose.scale;paint();if(pose.finished){transitionId=undefined;opening=false;redraw();resolveOpen?.(api);resolveOpen=null;}else transitionId=schedule(tick);}
  transitionId=schedule(tick);return finished;
 }
 function show(options={}){
  if(disposed)return Promise.resolve();stopTransition();stopFinger();const ownVersion=++version;if(!open)previousFocus=document.activeElement;
  entryPoint=options.entryPoint?{x:options.entryPoint.x,y:options.entryPoint.y}:entryPoint;page=Math.max(0,Math.min(3,Math.trunc(options.page)||0));completed=page===3;motion=options.motion!==false;open=true;layer.hidden=false;layer.focus({preventScroll:true});
  return ready.then(async()=>{if(!disposed&&open&&version===ownVersion){startedAt=now();resize();if(options.animate!==false)await playOpening();if(!disposed&&open&&version===ownVersion){startFinger();buttons.find(button=>button.dataset.action==='onClickClose')?.focus({preventScroll:true});}}return api;});
 }
 function goTo(index){if(closing||opening||disposed)return page;page=Math.max(0,Math.min((data?.pages.length||4)-1,Math.trunc(index)||0));if(page===3){completed=true;stopFinger();}redraw();buttons.find(button=>button.dataset.action==='onClickClose')?.focus({preventScroll:true});return page;}
 function previous(){return goTo(page-1);}function next(){return goTo(page+1);}
 function finishClose(){open=false;closing=false;layer.hidden=true;removeButtons();if(previousFocus?.isConnected!==false)previousFocus?.focus?.({preventScroll:true});previousFocus=null;onClose();resolveClose?.({cancelled:false});resolveClose=null;}
 // Entry coordinates are local pixels in the untransformed parent stage,
 // exactly as returned by the native selector's guide action.entryPoint.
 function close({animate=true}={}){
  if(!open)return Promise.resolve({cancelled:false});if(closing)return Promise.resolve({cancelled:false});++version;stopFinger();if(opening)stopTransition();
  if(!animate||!entryPoint||!tree||!data){finishClose();return Promise.resolve({cancelled:false});}
  closing=true;removeButtons();find(tree,'Mask').opacity=0;const root=find(tree,'Root'),scale=height/720,delta={x:(entryPoint.x-width/2)/scale,y:-(entryPoint.y-height/2)/scale};root.trs[7]=root.trs[8]=1;let started;
  const finished=new Promise(resolve=>resolveClose=resolve);
  function tick(timestamp){if(disposed||!closing)return;if(started===undefined)started=timestamp;const pose=sanguoGuideClosePose(timestamp-started,delta,data.closeAnimation);root.trs[0]=pose.x;root.trs[1]=pose.y;root.trs[7]=root.trs[8]=pose.scale;root.opacity=pose.opacity;paint();if(pose.finished){transitionId=undefined;finishClose();}else transitionId=schedule(tick);}
  transitionId=schedule(tick);return finished;
 }
 layer.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}
  else if(event.key==='ArrowLeft'){event.preventDefault();previous();}else if(event.key==='ArrowRight'){event.preventDefault();next();}
  else if(event.key==='Tab'&&buttons.length){const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===layer)){event.preventDefault();last.focus();}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===layer)){event.preventDefault();first.focus();}}
 });
 addEventListener('resize',resize);
 const api={ready,show,close,goTo,next,previous,get open(){return open;},get page(){return page;},get metadata(){return data;},get model(){return {width,height,scale:height/720,page,completed,opening,closing,tree};},dispose(){++version;stopFinger();stopTransition();open=false;disposed=true;removeButtons();removeEventListener('resize',resize);layer.remove();}};
 return api;
}
