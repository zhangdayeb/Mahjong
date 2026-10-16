import {TABLE_SOURCE} from './table-layout-source.js';
import {meldEdge} from './meld-study/placements.js';

export {TABLE_SOURCE};
// Existing extracted PNGs restore the atlas's originalSize and offset. Native
// tile cc.Sprite defaults instead to TRIMMED size and trim=true, centering the
// rect's pixels on the node. Return drawImage source/destination rectangles.
const roundEven=value=>{const lower=Math.floor(value),fraction=value-lower;return fraction===.5?lower+(lower%2!==0?1:0):Math.round(value);};
export function nativeSpriteDrawArgs(frame,style={}){
 if(!frame?.rect)throw Error('Native sprite requires SpriteFrame rect metadata');
 const [, ,w,h]=frame.rect,[ow,oh]=frame.originalSize??[w,h],[ox,oy]=frame.offset??[0,0];
 const source=[roundEven((ow-w)/2+ox),roundEven((oh-h)/2-oy),w,h];
 const mode=style.sizeMode??1,[nw,nh]=mode===0?(style.size??[w,h]):mode===2?[ow,oh]:[w,h],anchor=style.anchor??[.5,.5];
 if(style.trim!==false)return [...source,-anchor[0]*nw,-(1-anchor[1])*nh,nw,nh];
 return [...source,((ow-w)/2+ox)*nw/ow-anchor[0]*nw,((oh-h)/2-oy)*nh/oh-(1-anchor[1])*nh,w*nw/ow,h*nh/oh];
}
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
const times=(a,n)=>[a[0]*n,a[1]*n];
const legacy=a=>[0,...a];
function rectAt(center,size){return {x:center[0]-size[0]/2,y:center[1]-size[1]/2,width:size[0],height:size[1],center};}
function nativeTileZ(direction,index,capacity){return direction===0||direction===2?(index<=capacity/2?index:-index):direction===1?index:-index;}

// Placement arrays retain logical indices for selection and flight bookkeeping.
// This separate ascending-z copy is the actual Cocos sibling painter order.
export function tilePainterOrder(placements){return placements.slice().sort((a,b)=>(a.rowZ??0)-(b.rowZ??0)||(a.row??0)-(b.row??0)||(a.z??0)-(b.z??0)||(a.group??0)-(b.group??0)||(a.index??0)-(b.index??0));}
const roleAliases={meld:'cpg',discard:'out',concealed:'hand'};
// Preserve nested parent ordering as well: z of a tile cannot outrank its parent.
export function tablePainterOrder(records){
 const lookup=new Map(TABLE_SOURCE.drawOrder.flatMap((parent,seatOrder)=>parent.kinds.map((kind,kindOrder)=>[`${parent.seat}:${kind}`,{seatOrder,kindOrder}])));
 const rank=record=>lookup.get(`${record.seat}:${roleAliases[record.kind]||record.kind}`)||{seatOrder:record.seat??0,kindOrder:0};
 return records.slice().sort((a,b)=>{const ar=rank(a),br=rank(b);return ar.seatOrder-br.seatOrder||ar.kindOrder-br.kindOrder||(a.rowZ??0)-(b.rowZ??0)||(a.row??0)-(b.row??0)||(a.z??0)-(b.z??0)||(a.group??0)-(b.group??0)||(a.index??0)-(b.index??0);});
}

// Original Canvas chooses fixed width below 16:9, otherwise fixed height.
// All returned coordinates are stage pixels, with y increasing downwards.
export function computeTableLayout(width=1280,height=640,options={}){
 if(typeof width==='object'){options=width;width=options.width??1280;height=options.height??640;}
 if(!(width>0&&height>0))throw Error('Table stage dimensions must be positive');
 const live=options.live===true,scale=Math.min(width/1280,height/720),logical=[width/scale,height/scale];
 const deskOffset=[(logical[0]-1280)/2,(logical[1]-720)/2];
 const point=([x,y])=>[x*scale,(logical[1]-y)*scale];
 const deskPoint=position=>point(add(position,deskOffset));
 const seats=TABLE_SOURCE.seats.map((source,p)=>{
  const sideY=live?0:p===1?-40:p===3?-42:0;
  const convert=position=>deskPoint([position[0],position[1]+sideY]);
  const handNode=source.hand.position.slice(),meldNode=source.meld.position.slice(),openNode=source.open.position.slice(),huNode=source.hu.position.slice(),outNode=source.discard.position.slice();
  if(p===0){handNode[1]=live?68:0;meldNode[1]=live?110:50;openNode[1]=live?110:52;huNode[1]=live?230:160;outNode[1]=live?350:300;}
  if(p===2){handNode[1]=logical[1]-(live?35:50)-deskOffset[1];meldNode[1]=logical[1]-(live?35:45)-deskOffset[1];openNode[1]=logical[1]-(live?35:45)-deskOffset[1];huNode[1]=logical[1]-(live?80:100)-deskOffset[1];outNode[0]=775;outNode[1]=live?560:525;}
  const handOrigin=convert(add(handNode,[source.hand.start[0]*source.hand.scale[0],source.hand.start[1]*source.hand.scale[1]]));
  const handScale=source.hand.scale.map(n=>n*source.hand.tileScale*scale),handStep=[source.hand.step[0]*source.hand.scale[0]*scale,-source.hand.step[1]*source.hand.scale[1]*scale];
  return {name:source.name,direction:source.direction,hand:{origin:handOrigin,step:handStep,scale:handScale,frames:source.hand.frames,faces:source.hand.faces,faceOffset:source.hand.faceOffset,faceScale:source.hand.faceScale,sprite:source.hand.sprite,source:source.hand},meld:{origin:convert(meldNode),scale:source.meld.scale.map(n=>n*scale)},open:{origin:convert(openNode),scale:source.open.scale.map(n=>n*scale)},discard:{origin:convert(outNode),scale:source.discard.scale.map(n=>n*scale),source:source.discard},hu:{origin:convert(huNode),scale:source.hu.scale.map(n=>n*source.hu.tileScale*scale),source:source.hu}};
 });
 const profiles=TABLE_SOURCE.profiles.map((source,p)=>{
  const top=p===0?null:p===2?source.widget._top:(live?250:300);
  const root=point([logical[0]/2+source.position[0],p===0?(live?270:214):logical[1]-top]);
  const part=(name,sizeOverride)=>{const n=TABLE_SOURCE.profileParts[name],position=[root[0]+n.position[0]*scale,root[1]-n.position[1]*scale],size=(sizeOverride||n.size).map((v,i)=>v*n.scale[i]*scale);return rectAt(position,size);};
  return {root,portrait:part('img_head_bg'),rank:part('rankIcon'),info:{x:root[0]-42.5*scale,y:root[1]+15*scale,width:85*scale,height:47*scale},tagOrigin:[root[0]+(p===1?-44:41)*scale,root[1]-24.133*scale],bankerOrigin:[root[0]+(p===1?-43.621:41.379)*scale,root[1]-45.164*scale],scale};
 });
 const compassCenter=deskPoint([639,live?438:400]),compassSize=TABLE_SOURCE.compass.body.size.map((n,i)=>n*TABLE_SOURCE.compass.body.scale[i]*TABLE_SOURCE.compass.node.scale[i]*scale);
 const centerOffset=position=>[width/2+position[0]*scale,height/2-position[1]*scale];
 const choices=TABLE_SOURCE.que.buttons.map(n=>rectAt(centerOffset(n.position),times(n.size,scale)));
 const complete=TABLE_SOURCE.que.complete.map(n=>rectAt(centerOffset(add(n.parent.position,n.node.position)),times(n.node.size,scale)));
 const notice=rectAt(centerOffset(TABLE_SOURCE.que.notice.position),times(TABLE_SOURCE.que.notice.size,scale));
 const trusteeBgHeight=TABLE_SOURCE.trustee.background.size[1]*scale,cancelCenter=[width/2,height-(TABLE_SOURCE.trustee.background.size[1]/2+TABLE_SOURCE.trustee.cancel.position[1])*scale];
 const infoOffset=live?0:-45;
 const textureHeight=live?460:522,texturePosition=live?[0,55]:[0,20];
 const deskTexture={...rectAt(centerOffset(texturePosition),[880*scale,textureHeight*scale]),body:TABLE_SOURCE.desk.texture.body};
 return {width,height,scale,logical,deskOffset,seats,profiles,rows:TABLE_SOURCE.rows,compass:rectAt(compassCenter,compassSize),ownHand:{bodySize:[91*scale,134*scale],faceSize:[71*scale,102*scale],faceOffset:[0,6*scale],step:89*scale,origin:seats[0].hand.origin},background:{x:(width-1600*scale)/2,y:0,width:1600*scale,height,body:TABLE_SOURCE.desk.node.body},deskTexture,tableInfo:{title:deskPoint([640,TABLE_SOURCE.tableInfo.title.position[1]+infoOffset]),subtitle:deskPoint([640,TABLE_SOURCE.tableInfo.subtitle.position[1]+infoOffset])},que:{choices,complete,notice},trustee:{background:{x:0,y:height-trusteeBgHeight,width,height:trusteeBgHeight},cancel:rectAt(cancelCenter,times(TABLE_SOURCE.trustee.cancel.size,scale))}};
}

// Empty CPG reset does not dispatch CPG_UPDATE. Its gap must not move a fresh hand.
export function concealedHandPlacements(count,seat,table,groups=[],meldLayout,options={}){
 const cfg=table.seats[seat],origin=cfg.hand.origin.slice(),step=cfg.hand.step;
 if(groups.length&&meldLayout){const edge=meldEdge(groups,seat,meldLayout);origin[0]=cfg.meld.origin[0]+edge[0]*cfg.meld.scale[0];if(seat===0)origin[0]+=28*table.scale;else origin[1]=cfg.meld.origin[1]-edge[1]*cfg.meld.scale[1];}
 const gapIndex=options.drawnCount>0?count-options.drawnCount:(count%3===2?count-1:-1),placements=[];
 for(let i=0;i<count;i++){const gap=i>=gapIndex&&gapIndex>=0?.25:0;placements.push({index:i,z:nativeTileZ(cfg.direction,i,cfg.hand.frames.length),x:origin[0]+(i+gap)*step[0],y:origin[1]+(i+gap)*step[1],scale:cfg.hand.scale,body:cfg.hand.frames[Math.min(i,cfg.hand.frames.length-1)],faceOffset:cfg.hand.faceOffset,faceScale:cfg.hand.faceScale,sprite:cfg.hand.sprite});}
 if(seat===0&&placements.length){const last=placements.at(-1),right=last.x+table.ownHand.bodySize[0]/2,overflow=Math.max(0,right-table.width);if(overflow){const delta=overflow+91*table.scale/5;placements.forEach(p=>p.x-=delta);}}
 return placements;
}

function tileStyle(param){return {...param,colorPos:legacy(param.colorPos),colorScale:legacy(param.colorScale),colorSkew:legacy(param.colorSkew)};}
export function discardTilePlacements(values,seat,table){
 const cfg=table.seats[seat].discard,source=cfg.source,result=[],direction=table.seats[seat].direction;let row=0,index=0,cursor=[0,0],floor=1,rowZOrderTemp=source.rowZOrderStart;
 while(index<values.length){const parity=row%2,preset=table.rows[source.rowPrefabs[parity]];cursor=add(cursor,source.rowPos[parity]);if(parity===0&&row>0){cursor=times(source.floorStep,floor);floor++;}
  if(parity===0&&row>0&&direction!==0)rowZOrderTemp/=2;
  const rowZ=direction===0?(row+1)*rowZOrderTemp:direction===2?-(row+1)+rowZOrderTemp:-(row+1)+10*floor;
  const rowScale=Math.pow(source.rowScaleStep,floor),bodyScale=cfg.scale.map(n=>n*rowScale);let pos=[0,0];
  for(let col=0;col<preset.params.length&&index<values.length;col++,index++){const param=preset.params[col];result.push({index,rowZ,z:nativeTileZ(direction,col,preset.params.length),value:values[index],x:cfg.origin[0]+cursor[0]*cfg.scale[0]+pos[0]*bodyScale[0],y:cfg.origin[1]-cursor[1]*cfg.scale[1]-pos[1]*bodyScale[1],scale:Math.abs(bodyScale[0]),bodyScale,mirror:bodyScale[0]<0,param:tileStyle(param),body:param.body,face:preset.faces[values[index]],sprite:preset.sprite,row,col,floor});pos=add(pos,param.tileStep);}
  row++;
 }
 return result;
}
export function huTilePlacements(values,seat,table){
 const cfg=table.seats[seat].hu,source=cfg.source;
 return values.map((value,i)=>{const row=Math.floor(i/source.rowCount),col=i%source.rowCount,pos=add(times(source.rowStep,row),times(source.step,col));return {index:i,value,x:cfg.origin[0]+pos[0]*cfg.scale[0]/source.tileScale,y:cfg.origin[1]-pos[1]*cfg.scale[1]/source.tileScale,bodyScale:cfg.scale,scale:Math.abs(cfg.scale[0]),mirror:cfg.scale[0]<0,body:source.body,face:source.faces[value],sprite:source.sprite,param:tileStyle({body:source.body,colorPos:source.colorPos,colorScale:source.colorScale,colorSkew:source.colorSkew,colorRotation:source.colorRotation}),z:source.rowZorderStart+i*source.tileZorderStep+row*source.rowZorderStep};});
}
