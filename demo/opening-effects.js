const definitionURL=new URL('./opening-study/kaiju/definition.json',import.meta.url);
const styleURL=new URL('./opening-effects.css',import.meta.url);
const baseURL=new URL('./',import.meta.url);
function installStyle(){if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(e=>e.href===styleURL.href)){const l=document.createElement('link');l.rel='stylesheet';l.href=styleURL.href;document.head.append(l);}}
function lerp(a,b,t){if(Array.isArray(a))return a.map((v,i)=>lerp(v,b[i],t));return typeof a==='number'?a+(b-a)*t:a;}
function ease(curve,t){if(curve==='sineOut')return Math.sin(t*Math.PI/2);if(curve==='sineIn')return 1-Math.cos(t*Math.PI/2);if(Array.isArray(curve)&&curve.length===4){const [x1,y1,x2,y2]=curve,b=(a,c,s)=>3*(1-s)**2*s*a+3*(1-s)*s*s*c+s**3;let lo=0,hi=1;for(let i=0;i<15;i++){const s=(lo+hi)/2;if(b(x1,x2,s)<t)lo=s;else hi=s;}return b(y1,y2,(lo+hi)/2);}return t;}
function sample(keys,t,fallback,discrete=false){if(!keys?.length)return fallback;if(t<=keys[0].frame)return keys[0].value;for(let i=1;i<keys.length;i++)if(t<keys[i].frame){const a=keys[i-1],b=keys[i];return discrete?a.value:lerp(a.value,b.value,ease(a.curve,(t-a.frame)/(b.frame-a.frame)));}return keys.at(-1).value;}
const channels=color=>[color&255,color>>>8&255,color>>>16&255,color>>>24&255];
const combineColor=(a,b)=>channels(a).map((v,i)=>Math.round(v*channels(b)[i]/255));
function encodeColor(c){return (c[0]|c[1]<<8|c[2]<<16|c[3]<<24)>>>0;}

// Original fx_kaiju prefab 640 + clip 995: the animation completion precedes dealing.
export function createOpeningEffects(parent,{center={x:640,y:320},seed=90617,particles=true}={}){
 installStyle();const canvas=document.createElement('canvas');canvas.className='opening-effect-native';canvas.width=1280;canvas.height=640;canvas.hidden=true;canvas.setAttribute('aria-label','开局动画');parent.append(canvas);const ctx=canvas.getContext('2d');
 let definition,byParent,images=new Map(),tints=new Map(),particleList=[],job=null,destroyed=false;
 const ready=fetch(definitionURL).then(r=>{if(!r.ok)throw Error('开局动画资源加载失败');return r.json();}).then(async data=>{
  definition=data;byParent=new Map();for(const n of data.nodes){if(!byParent.has(n.parent))byParent.set(n.parent,[]);byParent.get(n.parent).push(n);}
  const urls=new Set(data.nodes.flatMap(n=>[n.sprite,n.particleSprite]).filter(Boolean));for(const track of Object.values(data.tracks.paths))for(const f of track.comps?.['cc.Sprite']?.spriteFrame||[])if(f.value?.image)urls.add(f.value.image);
  await Promise.all([...urls].map(async url=>{const im=new Image();im.src=new URL(url,baseURL).href;await im.decode();images.set(url,im);}));
  let rng=seed>>>0;const random=()=>{rng=(1664525*rng+1013904223)>>>0;return rng/4294967296;};const vary=(value,variance)=>value+(random()*2-1)*variance;
  for(const n of data.nodes.filter(n=>n.particle)){const p=n.particle,sc=channels(p._startColor[1]),scv=channels(p._startColorVar[1]),ec=channels(p._endColor[1]),ecv=channels(p._endColorVar[1]);for(let i=0;i<p.totalParticles;i++){const angle=vary(p.angle,p.angleVar)*Math.PI/180,speed=vary(p.speed,p.speedVar);particleList.push({node:n.index,birth:.2+random()*p.duration,life:Math.max(0,vary(p.life,p.lifeVar)),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,startSize:Math.max(0,vary(p.startSize,p.startSizeVar)),endSize:Math.max(0,vary(p.endSize,p.endSizeVar)),startColor:sc.map((v,k)=>Math.max(0,Math.min(255,vary(v,scv[k])))),endColor:ec.map((v,k)=>Math.max(0,Math.min(255,vary(v,ecv[k]))))});}}
  return data;
 });
 function tinted(url,color){const key=url+':'+color;if(tints.has(key))return tints.get(key);const im=images.get(url);if(!im)return null;if(color===0xffffffff)return im;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const cx=c.getContext('2d');cx.drawImage(im,0,0);const pixel=cx.getImageData(0,0,c.width,c.height),rgba=channels(color);for(let i=0;i<pixel.data.length;i+=4)for(let k=0;k<4;k++)pixel.data[i+k]*=rgba[k]/255;cx.putImageData(pixel,0,0);tints.set(key,c);return c;}
 function drawNode(n,t,parentColor=0xffffffff){const tracks=definition.tracks.paths[n.path]||{},p=tracks.props||{};if(!sample(p.active,t,n.active,true))return;const pos=sample(p.position,t,n.position),sx=sample(p.scaleX,t,n.scale[0]),sy=sample(p.scaleY,t,n.scale[1]),angle=sample(p.angle,t,n.angle),opacity=sample(p.opacity,t,n.opacity)/255,color=encodeColor(combineColor(parentColor,sample(p.color,t,n.color,true)));
  ctx.save();ctx.translate(pos[0],-pos[1]);ctx.rotate(-angle*Math.PI/180);ctx.scale(sx,sy);ctx.globalAlpha*=Math.max(0,Math.min(1,opacity));
  const sequence=sample(tracks.comps?.['cc.Sprite']?.spriteFrame,t,null,true),url=sequence?.image||n.sprite;if(url){const im=tinted(url,color);if(im){ctx.save();ctx.globalCompositeOperation=n.blend;ctx.drawImage(im,-n.size[0]*n.anchor[0],-n.size[1]*(1-n.anchor[1]),n.size[0],n.size[1]);ctx.restore();}}
  if(n.particle&&particles){const emitter=n.particle;ctx.save();ctx.globalCompositeOperation='lighter';for(const part of particleList){if(part.node!==n.index)continue;const age=t-part.birth;if(age<0||age>=part.life||part.life<=0)continue;const progress=age/part.life,size=lerp(part.startSize,part.endSize,progress),im=tinted(n.particleSprite,encodeColor(part.startColor.map(Math.round))),gx=emitter.gravity?.[1]||0,gy=emitter.gravity?.[2]||0;if(im){const x=part.vx*age+.5*gx*age*age,y=part.vy*age+.5*gy*age*age;ctx.save();ctx.globalAlpha*=1-progress;ctx.drawImage(im,x-size/2,-y-size/2,size,size);ctx.restore();}}ctx.restore();}
  for(const child of byParent.get(n.index)||[])drawNode(child,t,color);ctx.restore();
 }
 function render(t){if(!definition)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.translate(center.x,center.y);for(const root of byParent.get(null)||[])drawNode(root,t);ctx.restore();}
 function cancel(){if(job){cancelAnimationFrame(job.raf);job.resolve({cancelled:true});job=null;}canvas.hidden=true;ctx.clearRect(0,0,1280,640);}
 function play({onFinished}={}){cancel();let resolve;const finished=new Promise(r=>resolve=r),current={resolve,raf:0};job=current;finished.finished=finished;finished.durationMs=1166.6666666666667;finished.duration=finished.durationMs;finished.durationSeconds=finished.durationMs/1000;
  ready.then(()=>{if(job!==current||destroyed)return;canvas.hidden=false;const start=performance.now();function frame(now){if(job!==current)return;const t=(now-start)/1000;if(t>=definition.duration){canvas.hidden=true;ctx.clearRect(0,0,1280,640);job=null;resolve({cancelled:false,durationMs:definition.duration*1000});onFinished?.();return;}render(t);current.raf=requestAnimationFrame(frame);}render(0);current.raf=requestAnimationFrame(frame);}).catch(error=>{if(job===current){job=null;canvas.hidden=true;resolve({cancelled:true,error});}});return finished;}
 function preview(timeSeconds){cancel();return ready.then(()=>{if(destroyed)return;canvas.hidden=false;render(Math.max(0,Math.min(definition.duration,timeSeconds)));});}
 return {play,cancel,clear:cancel,preview,ready,get active(){return !canvas.hidden;},get definition(){return definition;},durationMs:1166.6666666666667,destroy(){destroyed=true;cancel();canvas.remove();tints.clear();}};
}
