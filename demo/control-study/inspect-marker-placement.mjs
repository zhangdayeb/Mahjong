import fs from 'node:fs';
import{lookup,expandUUID}from'../inspect-assets.mjs';
import{decodeCompiled}from'../meld-study/decode-compiled.mjs';
const cfg=JSON.parse(fs.readFileSync('asset-study/prefabs-config.json')),source=JSON.parse(fs.readFileSync('demo/table-layout-study/source.json'));
const rows=[];const geometry=n=>n?{name:n._name,position:n._trs?.slice(0,2)??[0,0],scale:n._trs?.slice(7,9)??[1,1],anchor:n._anchorPoint,size:n._contentSize,angle:n._eulerAngles?.[3]??0,parent:n._parent?._name}:null;
for(const key of Object.keys(source.rows)){const [bundle,id]=key.split('-'),data=decodeCompiled(lookup(bundle,Number(id))).instances,row=data.flatMap(n=>n?.class==='cc.Node'?n._components||[]:[]).find(c=>c?.class?.startsWith('5937bb')),uuid=row.tilePrefab,tileId=cfg.uuids.findIndex(u=>expandUUID(u)===uuid),tile=decodeCompiled(lookup('prefabs',tileId)).instances,node=tile.find(n=>n?.class==='cc.Node'&&(n._components||[]).some(c=>c?.oDiamond)),component=node._components.find(c=>c?.oDiamond),diamond=component.oDiamond;
 const chain=[];for(let n=diamond;n&&n!==node;n=n._parent)chain.unshift(geometry(n));
 rows.push({row:key,direction:row.direction??0,tilePrefab:tileId,tilePath:cfg.paths?.[tileId]?.[0],tile:geometry(node),diamond:geometry(diamond),chain});
}
const result={rows,notes:['FrontParam 只更换牌身图片、牌面的位置/缩放/旋转/倾斜，不改变 tile 或 oDiamond 的变换。','弃牌控制层/row 的父变换必须与 rowLocation.bodyScale 一致。','原金钻是 tile 的子节点，按完整 transform chain 取世界位置和缩放。']};
fs.writeFileSync('demo/control-study/marker-placement.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
