import fs from 'node:fs';import {lookup,expandUUID} from './inspect-assets.mjs';
const raw=lookup('main',7);const map=new Map();for(const file of fs.readdirSync('asset-study').filter(f=>f.endsWith('-config.json'))){const bundle=file.replace('-config.json',''),c=JSON.parse(fs.readFileSync(`asset-study/${file}`));c.uuids?.forEach((uuid,id)=>{uuid=expandUUID(uuid);if(!map.has(uuid))map.set(uuid,[]);map.get(uuid).push({bundle,id});});}
const ids=new Set(raw[1].map(expandUUID));const output=[];for(const uuid of ids)for(const e of map.get(uuid)||[])try{const a=lookup(e.bundle,e.id),f=a[5]?.[0];if(f?.rect){output.push({...e,uuid,...f,textureUUID:expandUUID(a[1][a[10][0]])});break;}}catch{}
fs.writeFileSync('demo/entry-frames.json',JSON.stringify(output,null,2));console.log(output);
