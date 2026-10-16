import fs from 'node:fs';import {lookup,expandUUID} from './inspect-assets.mjs';
const entries=JSON.parse(fs.readFileSync('asset-study/manifest.json')).filter(x=>x.type==='cc.SpriteFrame'&&(/head\/Head\/head_[357]$/.test(x.path)||/^MJMasterPath\/s_[1-7]$/.test(x.path)));
fs.mkdirSync('demo/player-study',{recursive:true});const frames=entries.map(e=>{const p=lookup(e.bundle,e.id),f=p[5][0];return {...f,bundle:e.bundle,id:e.id,path:e.path,textureUUID:expandUUID(p[1][p[10][0]]),image:`player-study/${f.name}.png`};});fs.writeFileSync('demo/player-study/frames.json',JSON.stringify(frames,null,2));
