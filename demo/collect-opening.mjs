import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
fs.mkdirSync('demo/opening-study',{recursive:true});
const frames=[1794,1927,2168].map(id=>{const p=lookup('game',id),f=p[5][0];return {...f,id,textureUUID:expandUUID(p[1][p[10][0]]),image:`opening-study/${f.name}.png`};});
fs.writeFileSync('demo/opening-study/frames.json',JSON.stringify(frames,null,2));
fs.writeFileSync('demo/opening-study/dingque-prefab.json',JSON.stringify(lookup('prefabs',2532)));
fs.copyFileSync('asset-study/readable/modules/ConfirmQueView.js','demo/opening-study/ConfirmQueView.js');
