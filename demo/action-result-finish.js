// A restrained finish over the authored banners: the original mascot, bevels,
// text and burst sprites remain the source of every visible silhouette.
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));

export function actionFinishMotion(name,time,duration){
 if(!Number.isFinite(time)||time<=0||time>=duration)return {titleScale:1,particleAngle:0,particleScale:[1,1],shine:0,shineProgress:0};
 const qgh=name==='qgh',arrivalStart=qgh?.16:.08,arrivalEnd=qgh?.58:.34;
 const arrival=clamp((time-arrivalStart)/(arrivalEnd-arrivalStart));
 const titleScale=1+(qgh?.028:.075)*Math.sin(arrival*Math.PI)*(1-arrival);
 const shineStart=qgh?.54:.24,shineEnd=qgh?1.28:.79,shineProgress=clamp((time-shineStart)/(shineEnd-shineStart));
 const shine=time>shineStart&&time<shineEnd?Math.sin(shineProgress*Math.PI):0;
 const burst=clamp((time-(qgh?.64:.2))/(qgh?.8:.72));
 return {titleScale,particleAngle:(qgh?-5:7)*Math.sin(burst*Math.PI),particleScale:[1+.065*Math.sin(burst*Math.PI),1-.018*Math.sin(burst*Math.PI)],shine,shineProgress};
}

export function createActionBannerFinish(createCanvas){
 const banners=new Map();let available=true;
 function prepare(key,image,source,size){
  if(!available)return null;
  if(banners.has(key))return banners.get(key);
  const width=Math.max(1,Math.ceil(size[0])),height=Math.max(1,Math.ceil(size[1])),padding=7;
  const rim=createCanvas(),sweep=createCanvas();rim.width=width+padding*2;rim.height=height+padding*2;sweep.width=width;sweep.height=height;
  const rimContext=rim.getContext('2d'),sweepContext=sweep.getContext('2d');
  // Some study/test canvases are intentionally draw-only. The native renderer
  // still works there, and a missing finish capability never drops a sprite.
  if(!rimContext?.createLinearGradient||!rimContext.fillRect||!sweepContext?.createLinearGradient||!sweepContext.fillRect){available=false;return null;}
  rimContext.shadowColor='#ffe1a1';rimContext.shadowBlur=5;rimContext.shadowOffsetY=-1;
  rimContext.drawImage(image,...source,padding,padding,width,height);
  rimContext.shadowBlur=0;rimContext.shadowOffsetY=0;rimContext.globalCompositeOperation='source-in';
  const edge=rimContext.createLinearGradient(0,0,0,rim.height);
  edge.addColorStop(0,'#fff7db');edge.addColorStop(.43,'#ffe7aa');edge.addColorStop(1,'#c98a38');
  rimContext.fillStyle=edge;rimContext.fillRect(0,0,rim.width,rim.height);
  const prepared={rim,sweep,sweepContext,width,height,padding,source};banners.set(key,prepared);return prepared;
 }
 function draw(context,{key,image,source,size,left,top,motion}){
  if(!context.createLinearGradient)return false;
  const detail=prepare(key,image,source,size);if(!detail)return false;
  const {rim,sweep,sweepContext,width,height,padding}=detail;
  context.save();context.scale(motion.titleScale,motion.titleScale);
  context.globalAlpha*=.68;context.drawImage(rim,left-padding,top-padding,width+padding*2,height+padding*2);context.restore();
  context.save();context.scale(motion.titleScale,motion.titleScale);
  context.drawImage(image,...source,left,top,...size);
  if(motion.shine>0){
   sweepContext.clearRect(0,0,width,height);sweepContext.globalCompositeOperation='source-over';sweepContext.drawImage(image,...source,0,0,width,height);
   sweepContext.globalCompositeOperation='source-in';
   const center=-height+(width+height*2)*motion.shineProgress,band=Math.max(34,width*.19),glint=sweepContext.createLinearGradient(center-band,0,center+band,height*.42);
   glint.addColorStop(0,'#ffdfa000');glint.addColorStop(.37,'#ffdfa010');glint.addColorStop(.5,'#fff8dbcc');glint.addColorStop(.61,'#fff1c64d');glint.addColorStop(1,'#ffdfa000');
   sweepContext.fillStyle=glint;sweepContext.fillRect(0,0,width,height);
   context.globalCompositeOperation='screen';context.globalAlpha*=motion.shine*.8;context.drawImage(sweep,left,top,...size);
  }
  context.restore();return true;
 }
 return {draw,clear(){banners.clear();}};
}
