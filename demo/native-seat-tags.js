import {playGameSound} from './game-audio.js';
import {SEAT_TAG_SOURCE} from './native-seat-tag-source.js';
import {computeTableLayout} from './table-layout.js';
export {SEAT_TAG_SOURCE};
const BASE=new URL('.',import.meta.url),durationMs=SEAT_TAG_SOURCE.animation.duration*1000;
const rectAt=(center,size)=>({center,x:center[0]-size[0]/2,y:center[1]-size[1]/2,width:size[0],height:size[1]});

// The profile TagLayout anchors to its top edge. Its horizontal child layout
// centers the 46px native tag; right-hand profiles use RIGHT_TO_LEFT instead.
export function nativeSeatTagLayout(table=computeTableLayout(),missing=[1,1,1,1]){
 const {width,height,scale,logical}=table;
 return missing.map((suit,seat)=>{
  const small=SEAT_TAG_SOURCE.small[suit],big=SEAT_TAG_SOURCE.big[suit];if(!small||!big)return null;
  const [sw,sh]=small.rect.slice(2),[bw,bh]=big.rect.slice(2),origin=table.profiles[seat].tagOrigin;
  const target=[origin[0]+(seat===1?-1:1)*sw*scale/2,origin[1]+sh*scale/2];
  const source=SEAT_TAG_SOURCE.bigNodes[SEAT_TAG_SOURCE.localToSourceSeat[seat]],widget=source.widget;
  const p=source.position.slice();
  // cc.Widget edges use the assigned automatic Sprite size, rather than the
  // placeholder 151x151 serialized in prefab904.
  if(widget?._alignFlags&8)p[0]=-logical[0]/2+widget._left+bw/2;
  if(widget?._alignFlags&32)p[0]=logical[0]/2-widget._right-bw/2;
  if(widget?._alignFlags&1)p[1]=logical[1]/2-widget._top-bh/2;
  const start=[width/2+p[0]*scale,height/2-p[1]*scale];
  return {seat,suit,small:{...rectAt(target,[sw*scale,sh*scale]),image:small.image},big:{...rectAt(start,[bw*scale,bh*scale]),image:big.trimmedImage},start,target,scale};
 });
}

// Native easeSineInOut is attached to the complete cc.sequence, so ease the
// whole 1.4s timeline before resolving its four actions.
export function sampleSeatTagMotion(timeMs,start,target){
 const elapsed=Math.max(0,Math.min(1,timeMs/durationMs)),t=(1-Math.cos(Math.PI*elapsed))/2*1.4;
 let scale=1,move=0;
 if(t<.2)scale=1+t;
 else if(t<.4)scale=1.2-(t-.2);
 else if(t>.9){move=Math.min(1,(t-.9)/.5);scale=1-.7*move;}
 return {position:start.map((v,i)=>v+(target[i]-v)*move),scale,done:timeMs>=durationMs};
}

export function createNativeSeatTags(parent,{tableLayout=computeTableLayout(),sound=true}={}){
 if(!parent)throw Error('Native seat tags require a stage parent');
 if(!document.querySelector('link[data-native-seat-tags]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('native-seat-tags.css',BASE).href;link.dataset.nativeSeatTags='';document.head.append(link);}
 const stage=parent.closest?.('.game')||parent;stage.classList.add('has-native-seat-tags');
 const layer=document.createElement('div');layer.className='native-seat-tag-layer';layer.setAttribute('aria-label','四家定缺标识');parent.append(layer);
 const small=Array.from({length:4},()=>{const img=document.createElement('img');img.className='native-seat-tag-small';img.hidden=true;layer.append(img);return img;});
 const big=Array.from({length:4},()=>{const img=document.createElement('img');img.className='native-seat-tag-big';img.hidden=true;layer.append(img);return img;});
 const tag=SEAT_TAG_SOURCE.tileTags[0].sprite,tagFrame=SEAT_TAG_SOURCE.tileTags[0].queFrame,scale=tableLayout.scale;
 stage.style.setProperty('--native-que-tag-image',`url("${new URL(tagFrame.image,BASE).href}")`);
 stage.style.setProperty('--native-que-tag-left',`${(91-tag.size[0])*scale/2}px`);
 stage.style.setProperty('--native-que-tag-top',`${((134-tag.size[1])/2+6)*scale}px`);
 stage.style.setProperty('--native-que-tag-width',`${tag.size[0]*scale}px`);
 stage.style.setProperty('--native-que-tag-height',`${tag.size[1]*scale}px`);
 const urls=new Set([...Object.values(SEAT_TAG_SOURCE.small).map(f=>f.image),...Object.values(SEAT_TAG_SOURCE.big).map(f=>f.trimmedImage),tagFrame.image]);
 const ready=Promise.all([...urls].map(async path=>{const img=new Image();img.src=new URL(path,BASE).href;await img.decode();}));
 let missing=[0,0,0,0],deferred=false,job=null,disposed=false;
 function position(img,rect){img.src=new URL(rect.image,BASE).href;Object.assign(img.style,{left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`});}
 function showSmall(){const layout=nativeSeatTagLayout(tableLayout,missing);small.forEach((img,seat)=>{const p=layout[seat];img.hidden=!p||deferred||!!job;if(p){position(img,p.small);img.alt=['','万','条','筒'][p.suit]+'定缺';}});}
 function finish(cancelled){if(!job)return;const current=job;job=null;cancelAnimationFrame(current.raf);big.forEach(img=>img.hidden=true);if(!cancelled)deferred=false;showSmall();current.resolve({cancelled,durationMs});}
 function clear(){finish(true);missing=[0,0,0,0];deferred=false;small.forEach(img=>img.hidden=true);big.forEach(img=>img.hidden=true);}
 function update(round,{defer=false}={}){missing=round?.missing?.slice()||[0,0,0,0];deferred=defer;showSmall();}
 function play(values){finish(true);missing=values.slice();deferred=true;showSmall();const layout=nativeSeatTagLayout(tableLayout,missing);let resolve;const finished=new Promise(r=>resolve=r),current={resolve,raf:0};job=current;
  ready.then(()=>{if(disposed||job!==current)return;const start=performance.now();layout.forEach((p,seat)=>{if(!p)return;position(big[seat],p.big);big[seat].alt=['','万','条','筒'][p.suit]+'定缺动画';big[seat].hidden=false;});if(sound)void playGameSound('dingque',.5);
   function draw(now){if(job!==current)return;const time=now-start;if(time>=durationMs){finish(false);return;}layout.forEach((p,seat)=>{if(!p)return;const frame=sampleSeatTagMotion(time,p.start,p.target);big[seat].style.transform=`translate(${frame.position[0]-p.start[0]}px,${frame.position[1]-p.start[1]}px) scale(${frame.scale})`;});current.raf=requestAnimationFrame(draw);}draw(start);
  }).catch(error=>{if(job===current){finish(true);current.error=error;}});return {durationMs,finished};
 }
 return {ready,update,play,clear,setSound(value){sound=!!value;},get playing(){return !!job;},dispose(){disposed=true;clear();layer.remove();stage.classList.remove('has-native-seat-tags');}};
}
