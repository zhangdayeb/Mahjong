import fs from 'node:fs';
import {lookup,expandUUID} from './inspect-assets.mjs';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
import {TABLE_SOURCE} from './table-layout-source.js';
import {SANGUO_VALUES} from './sanguo-rules.js';
const out='demo/sanguo-table-study',frames=new Map(),refs=new Map(),manifest=JSON.parse(fs.readFileSync('asset-study/collected-manifest.json'));
const existing=new Map([...JSON.parse(fs.readFileSync('demo/table-layout-study/frames.json')),...JSON.parse(fs.readFileSync('demo/meld-study/frames.json'))].map(frame=>[frame.uuid,frame]));
for(const file of fs.readdirSync('asset-study').filter(file=>file.endsWith('-config.json'))){const bundle=file.replace('-config.json',''),config=JSON.parse(fs.readFileSync(`asset-study/${file}`));config.uuids.forEach((value,id)=>{const uuid=expandUUID(value);if(!refs.has(uuid))refs.set(uuid,[]);refs.get(uuid).push({bundle,id,path:config.paths?.[id]?.[0]});});}
function frame(uuid){
 uuid=uuid.replace(/^(?:table|meld)\//,'');if(frames.has(uuid))return uuid;
 if(existing.has(uuid)&&fs.existsSync('demo/'+existing.get(uuid).image)){frames.set(uuid,existing.get(uuid));return uuid;}
 for(const ref of refs.get(uuid)||[])try{const raw=lookup(ref.bundle,ref.id),sprite=raw[5]?.[0];if(!sprite?.rect)continue;const textureUUID=expandUUID(raw[1][raw[10][0]]),texture=manifest.find(item=>item.bundle===ref.bundle&&item.uuid===textureUUID)||manifest.find(item=>item.uuid===textureUUID);if(!texture||!fs.existsSync(texture.file))continue;frames.set(uuid,{...ref,...sprite,uuid,textureUUID,texture:texture.file,image:`sanguo-table-study/assets/play-${ref.bundle}-${ref.id}.png`});return uuid;}catch{}
 throw Error(`Missing original live Sanguo sprite ${uuid}`);
}
const atlasFaces={};
for(const [uuid,source]of Object.entries(TABLE_SOURCE.tileSprites)){
 const raw=structuredClone(lookup(source.bundle,source.id));for(const key of[7,8])if(!Array.isArray(raw[key]))raw[key]=[];const all=decodeCompiled(raw).instances,component=all.flatMap(node=>node?._components||[]).find(value=>value?.colorAtlas&&value?.oTileBody),atlasRef=(refs.get(component.colorAtlas)||[]).find(ref=>{try{return Array.isArray(lookup(ref.bundle,ref.id)[5]?.[0]?.[2]);}catch{return false;}});
 if(!atlasRef)throw Error(`Missing tile color atlas ${uuid}`);const atlas=lookup(atlasRef.bundle,atlasRef.id),pairs=atlas[5][0][2],map={};
 for(const value of SANGUO_VALUES){const stem=`img_tile_${Math.floor(value/16)}_${value%16}`,right=uuid===TABLE_SOURCE.seats[1].hand.sprite.uuid,candidates=value>=113?[`sg_${right?'r_':''}${stem}`,`sg_${stem}`]:[`${right?'r_':''}${stem}`,stem];const name=candidates.find(name=>pairs.includes(name));if(!name)throw Error(`Missing native tile ${value} in atlas ${atlasRef.id}`);const index=pairs.indexOf(name);map[value]=frame(expandUUID(atlas[1][atlas[10][pairs[index+2]]]));}
 atlasFaces[uuid]={source:atlasRef,faces:map};
}
for(const seat of TABLE_SOURCE.seats){for(const key of seat.hand.frames)frame(key);frame(seat.hu.body);frame(seat.hand.sprite.body.frame);}
for(const row of Object.values(TABLE_SOURCE.rows))for(const param of row.params)frame(param.body);
const meldLayout=JSON.parse(fs.readFileSync('demo/meld-study/layout.json'));for(const seat of Object.values(meldLayout.seats))for(const stack of seat.stacks)for(const key of[...stack.front,...stack.back])frame(key);
const metadata={design:[1280,720],tileValues:SANGUO_VALUES,atlasFaces,meldLayout,notes:['Live tile faces use the source ZMJTile direction-specific atlas for all 34 Sanguo values, including both natural suits, twelve heroes, three seals and treasure.','Body, discard, concealed, meld and won-tile geometry reuse the recovered 2D table primitives.','A separate local SanguoRound controls the state. No server room, account, payment or bloodflow rules are instantiated.']};
fs.writeFileSync(`${out}/play.json`,JSON.stringify(metadata,null,2));fs.writeFileSync(`${out}/play-frames.json`,JSON.stringify([...frames.values()],null,2));console.log(JSON.stringify({frames:frames.size,atlases:Object.values(atlasFaces).map(entry=>entry.source.id),facesPerAtlas:SANGUO_VALUES.length}));
