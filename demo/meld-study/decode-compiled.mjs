// Read-only decoder of the local Cocos Creator compiled JSON format.
// Mirrors platform/deserialize-compiled (engine module 253), without game execution.
import {expandUUID} from '../inspect-assets.mjs';
export function decodeCompiled(raw){
 const classes=raw[3],masks=raw[4],refs=raw[7]?.slice()||[],instances=[],direct=[],deps=raw[8]?.slice()||[];
 function ref(owner,key,index){owner[key]=null;if(index>=0)direct.push([owner,key,index]);else refs[3*~index]=owner;}
 function type(code,owner,key,value){
  switch(code){
   case 0: owner[key]=value;break;
   case 1: ref(owner,key,value);break;
   case 2: owner[key]=value.slice();owner[key].forEach((n,i)=>ref(owner[key],i,n));break;
   case 3: owner[key]=value.slice();owner[key].forEach((n,i)=>type(6,owner[key],i,n));break;
   case 4: owner[key]=object(value);break;
   case 5: case 8: owner[key]=value.slice(1);break;
   case 6: owner[key]=null;deps[value]=owner;break;
   case 7: owner[key]=value.slice();break;
   case 9: owner[key]=value.map(object);break;
   case 10: owner[key]={class:classes[value[0]],data:value[1]};break;
   case 11: owner[key]=value[0];for(let i=1;i<value.length;i+=3)type(value[i+1],owner[key],value[i],value[i+2]);break;
   case 12: owner[key]=value[0];owner[key].forEach((v,i)=>{if(value[i+1]!==0)type(value[i+1],owner[key],i,v);});break;
   default: throw Error('Unknown Cocos compiled field '+code);
  }
 }
 function object(value){
  const mask=masks[value[0]],cls=classes[mask[0]],properties=cls[1],offset=cls[2],plain=mask.at(-1);
  const out={class:cls[0]};
  if(out.class==='cc.Node'){out._trs=[0,0,0,0,0,0,1,1,1,1];out._contentSize=[0,0];out._anchorPoint=[.5,.5];out._components=[];out._children=[];}
  for(let i=1;i<value.length;i++){const p=mask[i],key=properties[p];if(i<plain)out[key]=value[i];else type(cls[p+offset],out,key,value[i]);}
  return out;
 }
 const values=raw[5],special=raw[6]===0?0:raw[6].length,rootMarker=values.at(-1),marker=typeof rootMarker==='number';
 const count=values.length-special-(marker?1:0);
 for(let i=0;i<count;i++)instances[i]=object(values[i]);
 for(let i=0;i<special;i++){const code=raw[6][i],index=count+i;if(code>=0)instances[index]={class:classes[code],data:values[index]};else type(~code,instances,index,values[index]);}
 for(const [owner,key,index]of direct)owner[key]=instances[index];
 if(refs.length){const simpleEnd=3*refs.at(-1);for(let i=0;i<refs.length-1;i+=3){const owner=i<simpleEnd?refs[i]:instances[refs[i]],key=refs[i+1]>=0?raw[2][refs[i+1]]:~refs[i+1];owner[key]=instances[refs[i+2]];}}
 for(let i=0;i<deps.length;i++){const owner=typeof deps[i]==='number'?instances[deps[i]]:deps[i],prop=raw[9][i],key=typeof prop==='number'?(prop>=0?raw[2][prop]:~prop):prop;if(owner)owner[key]=expandUUID(raw[1][raw[10][i]]);}
 return {instances,root:instances[marker?(rootMarker<0?~rootMarker:rootMarker):0]};
}
