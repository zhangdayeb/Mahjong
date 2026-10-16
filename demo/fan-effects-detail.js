// Decorative rendering only. The original bitmap words, seat offsets and
// animation tracks still determine the fan and score presentation.
const GOLD={light:'#fff2b0',main:'#ffd45b',deep:'#f5a12a'};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function strokePath(ctx,points){ctx.beginPath();for(let i=0;i<points.length;i++)ctx[i?'lineTo':'moveTo'](...points[i]);ctx.stroke()}
function corner(ctx,x,y,dirX,dirY){
 ctx.save();ctx.translate(x,y);ctx.scale(dirX,dirY);
 strokePath(ctx,[[22,0],[5,0],[0,5],[0,22]]);
 strokePath(ctx,[[15,6],[7,6],[6,7],[6,15]]);
 ctx.fillStyle=GOLD.light;ctx.beginPath();ctx.moveTo(3,-4);ctx.lineTo(7,0);ctx.lineTo(3,4);ctx.lineTo(-1,0);ctx.closePath();ctx.fill();ctx.restore();
}

export function drawFanDetail(ctx,width,height,time){
 const halfW=width/2+32,halfH=Math.max(64,height/2+20);
 ctx.save();
 // An open, double gold rail leaves all original burst/light layers visible.
 ctx.shadowColor=GOLD.deep;ctx.shadowBlur=8;ctx.strokeStyle=GOLD.main;ctx.lineWidth=2.2;
 strokePath(ctx,[[-halfW+24,-halfH],[-44,-halfH]]);strokePath(ctx,[[44,-halfH],[halfW-24,-halfH]]);
 strokePath(ctx,[[-halfW+24,halfH],[halfW-24,halfH]]);
 ctx.shadowBlur=0;ctx.strokeStyle=GOLD.light;ctx.lineWidth=.9;
 strokePath(ctx,[[-halfW+36,-halfH+5],[-49,-halfH+5]]);strokePath(ctx,[[49,-halfH+5],[halfW-36,-halfH+5]]);
 strokePath(ctx,[[-halfW+36,halfH-5],[halfW-36,halfH-5]]);
 for(const sx of [-1,1])for(const sy of [-1,1])corner(ctx,sx*halfW,sy*halfH,-sx,-sy);
 // Fine interlocking marks and a small wordmark make this a 联桌 frame.
 ctx.strokeStyle='rgba(179,53,29,.52)';ctx.lineWidth=1.4;
 for(const sx of [-1,1])strokePath(ctx,[[sx*(halfW-18),-16],[sx*(halfW-26),-8],[sx*(halfW-18),0],[sx*(halfW-26),8],[sx*(halfW-18),16]]);
 ctx.font='bold 17px "Microsoft YaHei", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=GOLD.light;ctx.shadowColor='#a9581d';ctx.shadowBlur=3;ctx.fillText('联桌',0,-halfH);ctx.shadowBlur=0;
 // A bright sweep along the lower rail keeps the existing energetic finish.
 const progress=clamp((time-.4)/.9,0,1),sparkX=-halfW+32+(halfW*2-64)*progress;
 if(time>=.4&&time<1.3){ctx.fillStyle=GOLD.light;ctx.shadowColor=GOLD.main;ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(sparkX-9,halfH);ctx.lineTo(sparkX,halfH-4);ctx.lineTo(sparkX+9,halfH);ctx.lineTo(sparkX,halfH+4);ctx.closePath();ctx.fill()}
 ctx.restore();
}

export function scoreSparkles(time,positive=true){
 if(!Number.isFinite(time)||time<=0||time>=.82)return [];
 const count=positive?5:3,result=[];
 for(let index=0;index<count;index++){
  const u=clamp((time-index*.055)/(.68-index*.035),0,1);
  if(u<=0||u>=1)continue;
  const eased=1-Math.pow(1-u,3),side=index%2?1:-1;
  result.push({x:side*(13+eased*(24+index*4)),y:-8-eased*(14+index*3)+Math.sin(u*Math.PI)*(-18-index*2),alpha:Math.sin(u*Math.PI)*.85,radius:1.2+(index%3)*.45});
 }
 return result;
}

export function drawScoreDetail(ctx,x,y,width,height,time,positive){
 ctx.save();ctx.translate(x,y);
 const alpha=clamp((.82-time)/.14,0,1);
 ctx.globalAlpha*=alpha;
 ctx.strokeStyle=GOLD.light;ctx.lineWidth=1;ctx.shadowColor=GOLD.main;ctx.shadowBlur=4;
 ctx.beginPath();ctx.ellipse(0,0,width*.38,height*.39,-.15,0,Math.PI*2);ctx.stroke();
 ctx.shadowBlur=0;
 for(const sparkle of scoreSparkles(time,positive)){
  ctx.save();ctx.globalAlpha*=sparkle.alpha;ctx.strokeStyle=GOLD.main;ctx.lineWidth=1;
  strokePath(ctx,[[sparkle.x*.83,sparkle.y+5],[sparkle.x,sparkle.y]]);
  ctx.fillStyle=GOLD.light;ctx.shadowColor=GOLD.deep;ctx.shadowBlur=4;ctx.beginPath();ctx.arc(sparkle.x,sparkle.y,sparkle.radius,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 ctx.restore();
}
