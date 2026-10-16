import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSanguoDealtModel,buildSanguoRecorder} from './sanguo-dealt-model.js';
import {findSanguoNode} from './sanguo-table-model.js';
import {sanguoDealtTableFixture as fixture} from './sanguo-table-study/sanguo-dealt-fixture.js';
import {roomsForMode} from './rooms-config.js';
const data=JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/table.json',import.meta.url))),dealt=JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/dealt.json',import.meta.url))),frames=new Map(JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/dealt-frames.json',import.meta.url))).map(frame=>[frame.uuid,frame])),room=roomsForMode('sanguo')[2];
const views=[{width:999,height:508},{width:1369,height:666},{width:812,height:375}];
test('the captured dealt state uses four distinct original hero faces with the exact thirteen-card sequence, never a bloodflow replacement',()=>{
 const model=buildSanguoDealtModel(data,dealt,fixture,room,views[0]);
 assert.equal(model.phase,'dealt-preview');assert.deepEqual(model.ready,[]);assert.deepEqual(model.hand.map(tile=>tile.value),[113,113,113,114,114,114,115,115,115,115,163,163,163]);
 assert.deepEqual(Object.values(dealt.tileFaces).map(uuid=>frames.get(uuid).name),['sg_img_tile_7_1','sg_img_tile_7_2','sg_img_tile_7_3','sg_img_tile_10_3']);assert.equal(new Set(Object.values(dealt.tileFaces)).size,4);
 assert.equal(model.concealed.length,39);for(const seat of[1,2,3])assert.equal(model.concealed.filter(tile=>tile.seat===seat).length,13);
 assert.equal(findSanguoNode(model.header,'lab_remain').label._string,'82');assert.equal(findSanguoNode(model.header,'NetWorkMsLabel').label._string,'119ms');assert.equal(findSanguoNode(model.header,'WifiIcon').active,true);assert.equal(findSanguoNode(model.tree,'fnt_countDown').active,false);
 assert.equal(model.subtitle.label._string,'底注:1000 封顶:999999倍');
});
test('native hand placements, five menu hit areas and four tool entries fit matching desktop and mobile viewports',()=>{
 for(const viewport of views){const model=buildSanguoDealtModel(data,dealt,fixture,room,viewport);
  assert.deepEqual(model.menu.buttons.map(item=>item.label),['托管','设置','规则','超时','退出']);assert.deepEqual(model.toolButtons.map(item=>item.label),['记牌器','番型','聊天','流水']);
  for(const item of[...model.menu.buttons,...model.toolButtons]){const r=item.rect;assert.ok(r.x>=0&&r.y>=0&&r.x+r.width<=viewport.width&&r.y+r.height<=viewport.height,item.label);}
  for(const tile of model.hand){const frame=frames.get(tile.body),w=frame.rect[2]*tile.scale[0],h=frame.rect[3]*tile.scale[1];assert.ok(tile.x-w/2>=0&&tile.x+w/2<=viewport.width);assert.ok(tile.y-h/2>=0&&tile.y+h/2<=viewport.height);}
  for(let index=1;index<model.hand.length;index++)assert.ok(model.hand[index].x>model.hand[index-1].x);
 }
});
test('all exported dealt PNGs retain their native original dimensions and both captured avatar crops exist',()=>{
 assert.equal(dealt.sources.handAtlas.id,1397);assert.equal(dealt.sources.timeout.id,952);
 for(const frame of frames.values()){const path=new URL(frame.image,import.meta.url),bytes=fs.readFileSync(path);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],frame.originalSize);}
 for(const file of dealt.assets)assert.ok(fs.existsSync(new URL(file,import.meta.url)));
});
test('recorder preview uses only captured own-hand counts and view rebuilding leaves source data and account fixture unchanged',()=>{
 const before=JSON.stringify([data,dealt,fixture]),first=buildSanguoDealtModel(data,dealt,fixture,room,views[0]);first.hand[0].value=999;findSanguoNode(first.profiles[0].node,'label_ZCoin').label._string='changed';
 const second=buildSanguoDealtModel(data,dealt,fixture,room,views[2]);assert.equal(second.hand[0].value,113);assert.equal(findSanguoNode(second.profiles[0].node,'label_ZCoin').label._string,'9.72亿');
 assert.deepEqual(buildSanguoRecorder(dealt,fixture).counts,[{value:113,count:3},{value:114,count:3},{value:115,count:4},{value:163,count:3}]);assert.equal(JSON.stringify([data,dealt,fixture]),before);
 for(const property of['round','bots','turn','drawPile','scores'])assert.equal(Object.hasOwn(second,property),false);
});
