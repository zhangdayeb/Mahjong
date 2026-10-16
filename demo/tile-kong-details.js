// Small, deterministic changes to the existing sprite effects. All geometry
// stays in the effect root's local space; gameplay placement and timing remain
// owned by the controllers that render the original animation clips.
const TAU=Math.PI*2;
const clamp=v=>Math.max(0,Math.min(1,v));
const envelope=(p,attack=.12,release=.72)=>clamp(p/attack)*clamp((1-p)/(1-release));

export function huDetailAngle(path,time,kind='hu'){
 if(kind!=='hu')return 0;
 if(path==='zhushandian')return -5+2*Math.sin(time*19);
 if(path==='M_shandian6')return 8;
 if(path==='M_shandian6_0')return -9;
 if(path.startsWith('fx_GuanQuan'))return 12+time*34;
 if(path==='tykuosan_5'||path==='cj_quan_1')return -8-time*22;
 return 0;
}

export function kongDetailAngle(kind,timeMs,durationMs,path=''){
 const p=clamp(timeMs/durationMs);
 if(kind==='wind')return Math.sin(p*TAU)*2.2;
 if(kind==='rain')return (path==='xiayu'?2.1:-1.6)+Math.sin(p*TAU)*.7;
 return 0;
}

function supportsPaths(ctx){return ['save','restore','beginPath','moveTo','lineTo','stroke','ellipse','arc','fill'].every(k=>typeof ctx?.[k]==='function');}
function line(ctx,points,color,width,alpha){
 ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
 points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
}

// Gold arcs surround, rather than fill, the history tile. The native electric
// flash is still the main layer, with brief additional branches and sparks.
export function drawHuLandingDetails(ctx,time,kind='hu'){
 const duration=kind==='hu'?7/6:13/12;
 if(!['hu','zimoLight'].includes(kind)||time<=.08||time>=duration||!supportsPaths(ctx))return false;
 const p=clamp((time-.08)/(duration-.08)),strength=envelope(p);
 const cy=kind==='hu'?-38:60,cx=2;
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.shadowColor='#ffc34f';ctx.shadowBlur=7;
 for(let ring=0;ring<2;ring++){
  const radius=34+p*(ring?53:66),rotation=p*1.4+ring*Math.PI;
  ctx.globalAlpha=strength*(ring?.36:.64);ctx.strokeStyle=ring?'#ffbd3e':'#fff2aa';ctx.lineWidth=ring?1.3:2;
  ctx.beginPath();ctx.ellipse(cx,cy,radius,radius*.6,rotation,ring*.8,ring*.8+Math.PI*1.45);ctx.stroke();
 }
 const flash=clamp(1-Math.abs(time-.32)/.21);
 if(flash){
  for(const side of [-1,1]){
   const zig=Math.sin(time*57+side)*3;
   const points=[[cx+side*13,cy-15],[cx+side*(32+zig),cy-35],[cx+side*25,cy-44],[cx+side*56,cy-74],[cx+side*48,cy-81]];
   line(ctx,points,'#ffb735',3.5,flash*.65);line(ctx,points,'#fff8d0',1.15,flash*.9);
  }
 }
 for(let i=0;i<12;i++){
  const angle=i/12*TAU+p*(i%2?1.15:-.95),radius=23+p*(35+i%3*16);
  const x=cx+Math.cos(angle)*radius,y=cy+Math.sin(angle)*radius*.67-p*13;
  ctx.globalAlpha=strength*(.4+(i%3)*.15);ctx.fillStyle=i%3?'#ffe18b':'#fff9d0';
  ctx.beginPath();ctx.arc(x,y,1.2+(i%3)*.45,0,TAU);ctx.fill();
 }
 ctx.restore();return true;
}

// Wind and rain keep their native sprite silhouettes. A few moving contour
// lines add depth to the storm without adding a new full-stage flash or veil.
export function drawKongDetails(ctx,kind,timeMs,durationMs){
 if(!['wind','rain'].includes(kind)||timeMs<=0||timeMs>=durationMs||!supportsPaths(ctx))return false;
 const p=clamp(timeMs/durationMs),strength=envelope(p,.12,.78);
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.shadowBlur=3;
 if(kind==='wind'){
  ctx.shadowColor='#ffe694';
  for(let i=0;i<3;i++){
   const sweep=p*4.4+i*1.7,rx=51+i*9+p*5,cy=-90-i*17-p*10;
   ctx.globalAlpha=strength*(.17+i*.035);ctx.strokeStyle=i===1?'#f9f8e9':'#ffd983';ctx.lineWidth=1.1;
   ctx.beginPath();ctx.ellipse(0,cy,rx,8+i*2,-.06,sweep,sweep+Math.PI*1.5);ctx.stroke();
  }
 }else{
  ctx.shadowColor='#a5e2ff';
  for(let i=0;i<9;i++){
   const phase=(p*2.1+i*.173)%1,x=-186+i*47+Math.sin(i*2.4)*9,y=-220+phase*312;
   line(ctx,[[x,y],[x-7-i%3,y+19+i%4*5]],i%4?'#d8efff':'#ffe4a0',i%3?1.1:1.5,strength*.23);
  }
 }
 ctx.restore();return true;
}
