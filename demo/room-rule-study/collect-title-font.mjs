import fs from 'node:fs';
import {lookup,expandUUID} from '../inspect-assets.mjs';
const out='demo/room-rule-study',font=lookup('fonts',235),data=font[5][0],uuid=expandUUID(font[1][font[10][0]]),refs=[];
for(const file of fs.readdirSync('asset-study').filter(x=>x.endsWith('-config.json'))){const c=JSON.parse(fs.readFileSync('asset-study/'+file));c.uuids?.forEach((u,id)=>{if(expandUUID(u)===uuid)refs.push({bundle:file.replace('-config.json',''),id,path:c.paths?.[id]?.[0]});});}
let frame;for(const r of refs)try{const p=lookup(r.bundle,r.id),f=p[5]?.[0];if(f?.rect){frame={...r,...f,uuid,textureUUID:expandUUID(p[1][p[10][0]]),image:'room-rule-study/assets/native-title-font.png'};break;}}catch{}
if(!frame)throw Error('Missing original rule title font SpriteFrame');
const glyphs=Object.fromEntries([...'玩法规则'].map(ch=>[ch,data[3].fontDefDictionary[ch.codePointAt(0)]]));
const result={source:{prefab:746,node:'lab_title',fontUUID:'d3224ad4-b37f-4730-90f0-c91c90307c2a',bundle:'fonts',id:235,path:'NewSkin/title/fnt_biaotiz-export',isSystemFontUsed:false},text:'玩法规则',fontSize:32,lineHeight:32,fontAssetSize:data[2],commonHeight:data[3].commonHeight,nodeSize:[171,32],horizontalAlign:1,verticalAlign:1,frame,glyphs};
fs.writeFileSync(out+'/native-title-font.json',JSON.stringify(result,null,2));fs.writeFileSync(out+'/raw-title-font-235.json',JSON.stringify(font,null,2));console.log(result);
