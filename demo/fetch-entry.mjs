import fs from 'node:fs/promises';
const root='demo/assets/entry';await fs.mkdir(root,{recursive:true});
const sources=[['3146c5b0-83f8-4bd4-a300-e00c6de32a41','.jpg'],['834b7694-9189-4c96-9ce1-f2ce8384f68c','.png'],['16131c231','.png']];
for(const [uuid,ext] of sources){const url=`https://res.12317wan.com/gameModule/h5/zjscmj/4399H5/package/601907/assets/main/native/${uuid.slice(0,2)}/${uuid}${ext}`;const res=await fetch(url);if(!res.ok)throw Error(res.status+' '+url);await fs.writeFile(`${root}/${uuid}${ext}`,Buffer.from(await res.arrayBuffer()));console.log(uuid,res.status);}
