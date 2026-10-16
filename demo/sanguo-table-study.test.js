import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sanguoReadyTableFixture as fixture} from './sanguo-table-study/sanguo-table-fixture.js';
const metadata=JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/table.json',import.meta.url)));
const frames=JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/frames.json',import.meta.url)));
const frameByUUID=new Map(frames.map(frame=>[frame.uuid,frame]));
function pngSize(path){const data=fs.readFileSync(new URL(path,import.meta.url));assert.equal(data.subarray(1,4).toString(),'PNG');return [data.readUInt32BE(16),data.readUInt32BE(20)];}
function find(node,name){if(node.name===name)return node;for(const child of node.children||[]){const value=find(child,name);if(value)return value;}return null;}

test('Sanguo table uses original complete map and independent compass art, without a screenshot background',()=>{
 assert.equal(metadata.source.id,2910);
 const background=frameByUUID.get(metadata.runtime.background),flag=frameByUUID.get(metadata.runtime.flag);
 assert.equal(background.bundle,'game');assert.equal(background.id,1374);
 assert.equal(background.path,'Other/sanguo/sanguoditu/resource/table/pic_09');
 assert.deepEqual(background.rect,[0,0,1600,720]);assert.deepEqual(find(metadata.tree,'pic_09').size,[1600,720]);
 assert.equal(flag.id,178);assert.deepEqual(flag.originalSize,[152,112]);
 assert.deepEqual(metadata.runtime.flagPosition,[27.896,41.757]);
 assert.deepEqual(metadata.runtime.directionParent,[0,50]);
 assert.deepEqual(metadata.runtime.directions.map(value=>[value.name,value.character,value.position]),[
  ['west','xi',[0,59.022]],['north','bei',[-55,0]],['south','nan',[55,0]],['east','dong',[0,-56.779]],
 ]);
 for(const direction of metadata.runtime.directions)assert(frameByUUID.has(direction.frame));
});

test('all available SpriteFrames retain original dimensions and avatar crops stay limited to four small heads',()=>{
 for(const frame of frames){assert.deepEqual(pngSize('./'+frame.image),frame.originalSize);assert(!frame.image.includes('references'));}
 assert.deepEqual(pngSize('./'+fixture.sourceScreenshot),[986,483]);
 for(const player of fixture.players){const [width,height]=pngSize('./'+player.avatar);assert(width>=50&&width<=60);assert(height>=50&&height<=60);}
 const photoPlayers=fixture.players.filter(player=>player.position==='front'||player.position==='right');assert.equal(photoPlayers.length,2);
 assert.equal(metadata.profile.rankFrames.length,7);
 for(const [index,id]of[[0,796],[1,254],[4,178]])assert.equal(frameByUUID.get(metadata.profile.rankFrames[index]).id,id);
});

test('captured three ready seats use original source order and settled one-second clip with explicit unresolved streak',()=>{
 assert.equal(fixture.phase,'waiting-ready');assert.equal(fixture.typeID,911);assert.equal(fixture.sceneID,621);
 assert.deepEqual(fixture.readySourceSeats,[0,1,2]);assert.deepEqual(fixture.readySeats,[0,3,2]);
 assert.equal(fixture.players.find(player=>player.sourceSeatIndex===3).ready,false);
 assert.deepEqual(metadata.ready.seats.map(value=>value.position),[[0,-195],[-379,59],[2,254],[395,59]]);
 assert.equal(metadata.ready.clip._duration,1);
 const props=metadata.ready.clip.curveData.paths.zhunbei_1.props;
 assert.deepEqual(props.position.at(-1).value,[0,0]);assert.equal(props.opacity.at(-1).value,255);
 assert.equal(frameByUUID.get(metadata.ready.image).id,481);
 assert.equal(metadata.unresolved.length,1);
 assert.equal(metadata.unresolved[0].uuid,'796a9547-a8fb-48f1-8944-f09540a7556b');
 for(const path of ['path_16_2','path_16_2_0'])assert.equal(metadata.ready.clip.curveData.paths[path].props.opacity.at(-1).value,0);
 assert.equal(fixture.displayOnly,true);assert(Object.isFrozen(fixture));assert(Object.isFrozen(fixture.players));
 assert(!Object.hasOwn(fixture,'hands'));assert(!Object.hasOwn(fixture,'rewards'));assert(!Object.hasOwn(fixture,'deal'));
});

test('original header keeps the ready-phase counter empty and does not invent network state',()=>{
 assert.equal(metadata.header.source.id,974);
 const menu=metadata.header.menu.tree;
 assert.equal(menu.sprite.frame,'8763a73e-9d14-4987-9f53-e6cd4d9cf037');
 assert.deepEqual(menu.size,[60,62]);assert.equal(menu.widget._left,34);assert.equal(menu.widget._top,14);
 const battery=find(metadata.header.tree,'BatteryBg'),fill=find(metadata.header.tree,'BatteryIcon');
 assert.deepEqual(battery.size,[29,15]);assert.deepEqual(fill.size,[23,11]);
 assert.equal(frameByUUID.get(battery.sprite.frame).id,572);assert.equal(frameByUUID.get(fill.sprite.frame).id,623);
 assert.equal(metadata.header.runtime.remainText,'');assert.equal(metadata.header.runtime.showWifi,false);assert.equal(metadata.header.runtime.showNetworkLatency,false);
 assert.equal(fixture.batteryPercent,null);assert.equal(fixture.networkLatency,null);
 assert.equal(metadata.profile.runtimeWidgetOverrides[0].bottom,214);
});
