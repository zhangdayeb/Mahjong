import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
const out='demo/trustee-study';fs.mkdirSync(out+'/source',{recursive:true});fs.mkdirSync(out+'/raw',{recursive:true});
const wanted=new Set(['4f4864ce-4bc6-4695-9b91-0ec1bfb5ca58','1eb37098-137c-406a-832f-0c48b79158bf','73646625-c45e-4e40-ab59-d5cc564ef4e0','a23235d1-15db-4b95-8439-a2e005bfff91','994eff60-c956-43aa-a297-ec6309840aeb']);
const frames=[];for(const file of fs.readdirSync('asset-study').filter(f=>f.endsWith('-config.json'))){const bundle=file.replace('-config.json',''),cfg=JSON.parse(fs.readFileSync(`asset-study/${file}`));(cfg.uuids||[]).forEach((uuid,id)=>{if(!wanted.has(expandUUID(uuid)))return;try{const p=lookup(bundle,id),f=p[5]?.[0];if(f?.rect)frames.push({...f,bundle,id,textureUUID:expandUUID(p[1][p[10][0]]),image:`trustee-study/${bundle}-${id}-${f.name}.png`});}catch{}});}
fs.writeFileSync(out+'/frames.json',JSON.stringify(frames,null,2));for(const id of [2595,3907])fs.writeFileSync(`${out}/raw/prefab-${id}.json`,JSON.stringify(lookup('prefabs',id)));
for(const name of ['gameTrusteeCtrl','gameTrusteeDefine','UserInfoNode','UserInfoLayer','ZMJHuTileCtrl','gameHandAnim','gameHandAnimChupai','MJMasterPathDefine'])fs.copyFileSync(`asset-study/readable/modules/${name}.js`,`${out}/source/${name}.js`);
console.log(frames.map(f=>({id:f.id,name:f.name,size:f.originalSize})));
