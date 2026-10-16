import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {meldPlacements,meldEdge} from './placements.js';
const layout=JSON.parse(fs.readFileSync(new URL('./layout.json',import.meta.url)));
const frameIDs=new Set(JSON.parse(fs.readFileSync(new URL('./frames.json',import.meta.url))).map(f=>f.uuid));
test('four seats retain their native directions, mirroring and original resource references',()=>{
 const groups=[{type:'peng',value:11},{type:'dark',value:22},{type:'add',value:33}];
 for(let seat=0;seat<4;seat++){
  const tiles=meldPlacements(groups,seat,layout);assert.equal(tiles.length,11);assert.equal(tiles.filter(t=>t.face===null).length,3);
  for(const tile of tiles){assert(frameIDs.has(tile.body));if(tile.face)assert(frameIDs.has(tile.face));}
 }
 const right=meldPlacements([{type:'peng',value:11}],1,layout);
 assert(right.every(t=>t.nodeScale[0]<0&&t.colorScale[0]<0),'Right seat keeps separate parent and face mirrors');
});
test('stacked dark kong hides only its lower three faces and stacks above the actual second tile',()=>{
 for(let seat=0;seat<4;seat++){
  const tiles=meldPlacements([{type:'dark',value:11}],seat,layout),lower=tiles.find(t=>t.index===1),top=tiles.find(t=>t.index===3),stack=layout.seats[seat].stacks[0];
  assert.deepEqual(top.pos,[lower.pos[0]+stack.GangSkewPos[0],lower.pos[1]+stack.GangSkewPos[1]]);
  assert.equal(top.body,stack.front[1]);assert(top.face);assert.equal(top.z,4);assert.equal(tiles.at(-1).index,3);
 }
});
test('native CPG edge includes group gaps while an overlaid fourth kong tile consumes no row space',()=>{
 const groups=[{type:'peng',value:11},{type:'dark',value:22},{type:'add',value:33},{type:'gang',value:18}];
 for(let seat=0;seat<4;seat++){
  const cfg=layout.seats[seat];let expected=cfg.gap.slice();
  for(let g=0;g<groups.length;g++)expected=expected.map((v,i)=>v+cfg.stacks[g].tileInterval[i]*3+cfg.gap[i]);
  assert.deepEqual(meldEdge(groups,seat,layout),expected);
  assert.deepEqual(meldEdge(groups.map(g=>({...g,type:'peng'})),seat,layout),expected);
 }
 assert.deepEqual(meldEdge(groups,0,layout),[902,0]);
});
test('mine geometry keeps tile dimensions separate from placement spacing and flat kongs consume a fourth slot',()=>{
 const tiles=meldPlacements([{type:'peng',value:11}],0,layout).sort((a,b)=>a.index-b.index);
 assert.equal(tiles[1].pos[0]-tiles[0].pos[0],66);
 assert.equal(tiles[1].tileScale,1.3);assert.equal(tiles[1].nodeScale[0],.8);
 assert.equal((tiles[1].pos[0]-tiles[0].pos[0])*tiles[1].nodeScale[0],52.800000000000004);
 const flat=structuredClone(layout);flat.seats[0].GangLayoutType=0;
 assert.deepEqual(meldEdge([{type:'gang',value:11}],0,flat),[308,0]);
 const fourth=meldPlacements([{type:'gang',value:11}],0,flat).find(t=>t.index===3);assert.deepEqual(fourth.pos,[198,0]);
});
