import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
const native=JSON.parse(fs.readFileSync('asset-study/collected-manifest.json'));
const manifest=JSON.parse(fs.readFileSync('asset-study/manifest.json'));
const frames=[];
for(const entry of manifest.filter(x=>['lobby','common'].includes(x.bundle)&&x.type==='cc.SpriteFrame')) {
 try { const raw=lookup(entry.bundle,entry.id),data=raw[5][0];if(!data.rect)continue;
 const uuid=expandUUID(raw[1][raw[10][0]]),texture=native.find(x=>x.uuid===uuid&&x.downloaded);
 if(texture)frames.push({...entry,...data,texture:texture.file});
 }catch{}
}
fs.mkdirSync('demo/assets/lobby',{recursive:true});
fs.writeFileSync('demo/assets/lobby/frames.json',JSON.stringify(frames));
console.log(frames.length);
