import fs from'node:fs';import crypto from'node:crypto';import{lookup,expandUUID}from'./inspect-assets.mjs';
import{decodeCompiled}from'./meld-study/decode-compiled.mjs';
const out='demo/hand-study';for(const d of ['raw','source','assets'])fs.mkdirSync(out+'/'+d,{recursive:true});
function obj(p,x){if(!Array.isArray(x)||!Number.isInteger(x[0]))return null;const schema=p[4][x[0]],type=p[3][schema?.[0]];if(!Array.isArray(type))return null;const r={type:type[0]};schema.slice(1,x.length).forEach((n,i)=>{r[type[1][n]]=x[i+1]});return r}
const config=JSON.parse(fs.readFileSync('asset-study/fbx-config.json'));
function asset(id){const p=lookup('fbx',id);fs.writeFileSync(out+'/raw/fbx-'+id+'.json',JSON.stringify(p,null,2));return{raw:p,data:obj(p,p[5][0])}}
const nativePath=id=>out+'/native/'+id+'-'+expandUUID(config.uuids[id])+'.bin';
const mesh=asset(54),rawMesh=fs.readFileSync(nativePath(54));
function nested(x){return obj(mesh.raw,x)}
const vb=nested(mesh.data._vertexBundles[0]),formats=vb.formats.map(nested),range=nested(vb.data),primitive=nested(mesh.data._primitives[0]),indices=nested(primitive.data),attributeData={};
let stride=formats.reduce((sum,f)=>sum+f.num*(f.type===5123?2:4),0),offset=0;
for(const format of formats){const values=[],bytes=format.type===5123?2:4;for(let i=0;i<vb.verticesCount;i++)for(let j=0;j<format.num;j++){const p=(range.offset||0)+i*stride+offset+j*bytes;values.push(bytes===2?rawMesh.readUInt16LE(p):rawMesh.readFloatLE(p))}attributeData[format.name]={size:format.num,values};offset+=format.num*bytes}
const indexData=[];for(let i=0;i<indices.length/2;i++)indexData.push(rawMesh.readUInt16LE(indices.offset+i*2));
const meshOutput={source:{bundle:'fbx',id:54,uuid:expandUUID(config.uuids[54]),sha256:crypto.createHash('sha256').update(rawMesh).digest('hex')},vertexCount:vb.verticesCount,attributes:attributeData,indices:indexData};
fs.writeFileSync(out+'/mesh.json',JSON.stringify(meshOutput));
const sceneRaw=lookup('main',3);fs.writeFileSync(out+'/raw/main-3.json',JSON.stringify(sceneRaw,null,2));const scene=decodeCompiled(sceneRaw).instances;
const animNode=scene.find(n=>n?.class==='cc.Node'&&n._name==='anim'),tableParentChain=[];for(let n=animNode;n&&n._name!=='table';n=n._parent)tableParentChain.push({name:n._name,trs:n._trs});
const unit=.1,parentScale=[unit,unit,unit];let planeY=0;for(const n of tableParentChain){const s=n.trs.slice(7,10);planeY=planeY*s[1]+n.trs[1]*unit;for(let i=0;i<3;i++)parentScale[i]*=s[i];}
const cameraNode=scene.find(n=>n?.class==='cc.Node'&&n._name==='hand3D Camera');
const tableSpace={bundle:'main',id:3,sourceUnitsPerDemoUnit:10,parentChain:tableParentChain,parentScale,planeY,camera:{position:cameraNode._trs.slice(0,3),quaternion:cameraNode._trs.slice(3,7),fov:cameraNode._components.find(c=>c.class==='cc.Camera')._fov}};
const definitions={};for(const[action,modelId,skeletonId,clipId,contactFraction,prefabId]of[['discard',19,63,4,.4,3931],['cpg',87,75,73,.28,701],['exchange',46,31,98,.35,3121]]){
 const model=asset(modelId).data,skeleton=asset(skeletonId).data,clip=asset(clipId).data;
 const binary=clipId===4?fs.readFileSync('asset-study/media/binary/fbx/hand/handOK/girl_chupai.bin'):fs.readFileSync(nativePath(clipId));
 const tracks=[];let expectedBytes=0;for(const[path,props]of Object.entries(clip.description))for(const[prop,t]of Object.entries(props)){const size=prop==='quat'?4:3,times=[],values=[];let offset=t.offset*4;expectedBytes=Math.max(expectedBytes,offset+t.frameCount*(size+1)*4);for(let i=0;i<t.frameCount;i++){times.push(binary.readFloatLE(offset));offset+=4;for(let j=0;j<size;j++){values.push(binary.readFloatLE(offset));offset+=4}}tracks.push({path,property:prop==='quat'?'quaternion':prop,times,values,size})}
 if(binary.length!==expectedBytes)throw new Error('Mismatched animation binary '+clipId+': '+binary.length+' != '+expectedBytes);
 const prefab=lookup('prefabs',prefabId);fs.writeFileSync(out+'/raw/prefabs-'+prefabId+'.json',JSON.stringify(prefab,null,2));
 let pointIndex;for(let i=0;i<prefab[7].length;i+=3)if(prefab[2][prefab[7][i+1]]==='pointNode'){pointIndex=prefab[7][i+2];break;}
 const point=obj(prefab,prefab[5][pointIndex]),root=obj(prefab,prefab[5][1]),nativeRoot=prefab[5].map(x=>obj(prefab,x)).find(x=>x?.type==='cc.Node'&&x._name==='RootNode');
 const pointPath=model._nodes.find(x=>x.name===point._name)?.path;if(!pointPath)throw new Error('Missing original prefab hand attachment '+prefabId);
 definitions[action]={source:{modelId,skeletonId,clipId,prefabId,uuid:expandUUID(config.uuids[clipId]),sha256:crypto.createHash('sha256').update(binary).digest('hex')},duration:clip._duration,contactFraction,contactTime:clip._duration*contactFraction,parentScale,prefabScale:root._trs.slice(7,10),rootTRS:nativeRoot._trs||[0,0,0,0,0,0,1,1,1,1],pointPath,nodes:model._nodes,jointIndices:skeleton._jointIndices,tracks};
}
fs.copyFileSync('asset-study/media/images/fbx/_unnamed/f41ba3d4-d9be-4479-9790-891e2ef514a2.png',out+'/assets/girl-hand.png');
asset(24);fs.writeFileSync(out+'/raw/internal-9.json',JSON.stringify(lookup('internal',9),null,2));
const textureAsset=lookup('fbx',105);fs.writeFileSync(out+'/raw/fbx-105.json',JSON.stringify(textureAsset,null,2));
const textureFields=textureAsset.data.split(',');
const textureOptions={sourceId:105,flipY:false,minFilter:Number(textureFields[1]),magFilter:Number(textureFields[2]),generateMipmaps:textureFields[6]==='1'};
const data={sex:'girl',scale:200,tableSpace,texture:'hand-study/assets/girl-hand.png',textureOptions,mesh:'hand-study/mesh.json',actions:definitions,sourceSeatRotation:[90,180,270,0],openingDeal:{delay:1.2,batchSize:4,batchDelay:.5,duration:.5,offsetY:100,easing:'easeSineInOut'}};
fs.writeFileSync(out+'/animations.json',JSON.stringify(data));
for(const n of ['gameHandAnim','gameHandAnimBase','gameHandAnimChupai','gameHandAnimCPG','gameHandAnimHuansanzhang','gameHandDefine','hand3dView','ZMJTileAnim','ZMJTileDefine','chupaiDefine','cpgDefine','huansanzhangDefine'])fs.copyFileSync('asset-study/readable/modules/'+n+'.js',out+'/source/'+n+'.js');
console.log(JSON.stringify({vertices:vb.verticesCount,triangles:indexData.length/3,actions:Object.entries(definitions).map(([n,x])=>({name:n,duration:x.duration,contactTime:x.contactTime,joints:x.jointIndices.length,tracks:x.tracks.length}))}));
