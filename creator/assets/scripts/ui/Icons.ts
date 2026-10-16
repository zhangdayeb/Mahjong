import { Node, Graphics } from 'cc';
import * as UI from './UI';

/** Ivory/jade line icons drawn by Creator, shared by the hall and table. */
export function icon(parent:Node,key:string,x:number,y:number,w=30,h=30,tint=UI.PALETTE.ink) {
  const node=UI.box(parent,'Icon-'+key,x,y,w,h),g=node.addComponent(Graphics);
  g.strokeColor=UI.color(tint);g.fillColor=UI.color(tint);g.lineWidth=2;node.setScale(w/32,h/32,1);
  const line=(points:number[][])=>{g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.stroke();};
  const rect=(a:number,b:number,c:number,d:number,r=2)=>{g.roundRect(a,b,c,d,r);g.stroke();};
  if(key==='mail'){rect(-13,-9,26,18);line([[-12,8],[0,-1],[12,8]]);line([[-12,-8],[-5,-1]]);line([[12,-8],[5,-1]]);}
  else if(key==='gift'){rect(-11,-12,22,18);rect(-13,5,26,5,1);line([[0,-12],[0,11]]);g.ellipse(-5,12,5,3);g.ellipse(5,12,5,3);g.stroke();}
  else if(key==='settings'){for(let i=0;i<8;i++){const a=i*Math.PI/4;line([[Math.cos(a)*10,Math.sin(a)*10],[Math.cos(a)*14,Math.sin(a)*14]]);}g.circle(0,0,10);g.circle(0,0,4);g.stroke();}
  else if(key==='rules'){rect(-11,-12,22,24);line([[-6,6],[6,6]]);line([[-6,0],[6,0]]);line([[-6,-6],[3,-6]]);}
  else if(key==='chat'||key==='feedback'){rect(-13,-6,26,18,6);line([[-7,-6],[-9,-12],[0,-6]]);for(const n of[-6,0,6]){g.circle(n,3,1.2);g.fill();}}
  else if(key==='more'){g.circle(0,9,2);g.stroke();line([[-8,0],[8,0]]);line([[-12,-9],[12,-9]]);}
  else if(key==='history'){rect(-11,-12,22,24);line([[-6,5],[6,5]]);line([[-6,-1],[6,-1]]);line([[-6,-7],[2,-7]]);}
  else if(key==='hint'){g.circle(0,5,9);g.stroke();line([[-6,-2],[-4,-9],[4,-9],[6,-2]]);line([[-4,-13],[4,-13]]);line([[0,-7],[0,5],[-3,3]]);}
  else if(key==='trustee'){rect(-12,-10,24,19,5);g.circle(-5,1,2);g.circle(5,1,2);g.stroke();line([[-5,-5],[5,-5]]);line([[0,9],[0,13]]);g.circle(0,14,1.4);g.fill();}
  else if(key==='timeout'){g.circle(0,-1,10);g.stroke();line([[0,6],[0,-1],[6,-1]]);line([[-6,12],[-11,9]]);line([[6,12],[11,9]]);}
  else if(key==='exit'){rect(-12,-11,15,22);line([[-4,0],[13,0],[8,5]]);line([[13,0],[8,-5]]);}
  else if(key==='back'){line([[8,11],[-4,0],[8,-11]]);}
  else if(key==='coin'){g.circle(0,0,12);g.circle(0,0,8);g.stroke();line([[-3,6],[4,6],[-4,-5],[3,-5]]);}
  else if(key==='play'){line([[-7,11],[11,0],[-7,-11],[-7,11]]);}
  else {g.circle(0,0,11);g.stroke();}
  return node;
}
