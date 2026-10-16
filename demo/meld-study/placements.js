// Reproduce ZMJCPGTileCtrl.layoutCPG's geometry. Positions remain Cocos y-up.
// The caller chooses an artboard anchor and converts y-up to screen y-down.
export function meldPlacements(groups,seat,layout){
 const cfg=layout.seats[seat],result=[];let cursor=[0,0];
 if(!cfg)return result;
 for(let g=0;g<groups.length;g++){
  const meld=groups[g],stack=cfg.stacks[g];if(!stack)continue;
  const gang=meld.type!=='peng',dark=meld.type==='dark',count=gang?4:3,base=[];
  for(let j=0;j<count;j++){
   let pos=cursor.slice(),z=(j+1)*stack.tileZOderStart;
   if(gang&&cfg.GangLayoutType===-1&&j===3){pos=[base[1][0]+stack.GangSkewPos[0],base[1][1]+stack.GangSkewPos[1]];z=4;}
   if(dark&&j<3)pos=[pos[0]+cfg.backTileOffset[0],pos[1]+cfg.backTileOffset[1]];
   base.push(pos.slice());
   result.push({group:g,index:j,pos,z,body:dark&&j<3?stack.back[j]:stack.front[dark&&j===3?1:j],face:dark&&j<3?null:cfg.faces[meld.value],value:meld.value,tileScale:cfg.tileScale,nodeScale:cfg.nodeScale,colorPos:stack.colorPos,colorScale:stack.colorScale,colorSkew:stack.colorSkew,colorRotation:stack.colorRotation});
   if(!(gang&&cfg.GangLayoutType===-1&&j===3))cursor=[cursor[0]+stack.tileInterval[0],cursor[1]+stack.tileInterval[1]];
  }
  cursor=[cursor[0]+cfg.gap[0],cursor[1]+cfg.gap[1]];
 }
 return result.sort((a,b)=>a.z-b.z||a.group-b.group||a.index-b.index);
}

// Edge passed by CPG_UPDATE to the open-hand and concealed-hand controllers.
// Native local position must be multiplied by nodeScale, not tileScale.
export function meldEdge(groups,seat,layout){
 const cfg=layout.seats[seat];if(!cfg)return [0,0];let cursor=[0,0];
 for(let g=0;g<groups.length;g++){
  const stack=cfg.stacks[g];if(!stack)break;
  const gang=groups[g].type!=='peng',count=gang&&cfg.GangLayoutType!==-1?4:3;
  cursor=[cursor[0]+stack.tileInterval[0]*count+cfg.gap[0],cursor[1]+stack.tileInterval[1]*count+cfg.gap[1]];
 }
 return [cursor[0]+cfg.gap[0],cursor[1]+cfg.gap[1]];
}
