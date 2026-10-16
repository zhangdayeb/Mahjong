import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SanguoRound} from './sanguo-round.js';
import {SANGUO_VALUES} from './sanguo-rules.js';
import {buildSanguoPlayModel,sanguoTileLayers} from './sanguo-play-model.js';
import {sanguoDealtTableFixture} from './sanguo-table-study/sanguo-dealt-fixture.js';
import {roomsForMode} from './rooms-config.js';
const read=name=>JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/'+name,import.meta.url))),data=read('table.json'),dealt=read('dealt.json'),play=read('play.json'),frames=new Map(read('play-frames.json').map(frame=>[frame.uuid,frame])),room=roomsForMode('sanguo')[0],profiles=sanguoDealtTableFixture.players;
const random=()=>.37;
test('every Sanguo tile has actual native hand, mirrored-right, front and left artwork and all image canvases keep original dimensions',()=>{
 for(const atlas of Object.values(play.atlasFaces)){assert.equal(Object.keys(atlas.faces).length,SANGUO_VALUES.length);for(const value of SANGUO_VALUES){const frame=frames.get(atlas.faces[value]);assert.ok(frame,value);assert.ok(!value||value<113||frame.name.startsWith('sg_'));}}
 for(const frame of frames.values()){const bytes=fs.readFileSync(new URL(frame.image,import.meta.url));assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],frame.originalSize);}
});
test('live hand controls fit desktop/mobile, lift only the selected card and hide opponent hand faces',()=>{
 const round=new SanguoRound(random,{base:room.base});for(const viewport of[{width:1115,height:538},{width:812,height:375},{width:1369,height:666}]){
  const plain=buildSanguoPlayModel(data,dealt,play,profiles,round,room,viewport),selected=buildSanguoPlayModel(data,dealt,play,profiles,round,room,{...viewport,selected:2});assert.equal(plain.phase,'play');assert.equal(plain.hand.length,14);assert.equal(plain.handButtons.length,14);
  for(const hit of plain.handButtons){assert.ok(hit.x>=0&&hit.y>=0&&hit.x+hit.width<=viewport.width&&hit.y+hit.height<=viewport.height);}
  assert.ok(Math.abs(plain.hand[2].y-selected.hand[2].y-28*plain.scale)<1e-7);assert.equal(plain.hand[1].y,selected.hand[1].y);assert.deepEqual(plain.hand.map(tile=>tile.value),round.hands[0]);
  for(const tile of plain.publicTiles.filter(tile=>tile.kind==='hand')){assert.equal(tile.value,undefined);assert.equal(sanguoTileLayers(tile,play).length,1);}
 }
});
test('real discards, public melds and HU histories render their true values rather than fixed thirteen-card screenshot data',()=>{
 const round=new SanguoRound(random,{base:room.base});round.discards=[[17,113],[],[35],[]];round.melds[1]=[{type:'dark',value:129,from:1}];round.huEvents=[{seat:2,tile:177}];const model=buildSanguoPlayModel(data,dealt,play,profiles,round,room,{width:1115,height:538});
 assert.deepEqual(model.publicTiles.filter(tile=>tile.kind==='discard').map(tile=>tile.value).sort((a,b)=>a-b),[17,35,113]);assert.equal(model.publicTiles.filter(tile=>tile.kind==='hu')[0].value,177);
 const meld=model.publicTiles.filter(tile=>tile.kind==='meld');assert.equal(meld.length,4);for(const tile of meld)assert.equal(sanguoTileLayers(tile,play).length,tile.index<3?1:2);
 assert.equal(model.ready.length,0);assert.equal(model.fixture.remaining,round.wall.length);
});
