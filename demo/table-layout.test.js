import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {computeTableLayout,concealedHandPlacements,discardTilePlacements,huTilePlacements,tilePainterOrder,tablePainterOrder,nativeSpriteDrawArgs,TABLE_SOURCE} from './table-layout.js';
import {meldEdge} from './meld-study/placements.js';
const melds=JSON.parse(fs.readFileSync(new URL('./meld-study/layout.json',import.meta.url)));
const frames=JSON.parse(fs.readFileSync(new URL('./table-layout-study/frames.json',import.meta.url)));
const keys=new Set(frames.map(f=>f.key));
const near=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('wide canvas follows original height fit and ordinary game runtime widget overrides',()=>{
 const t=computeTableLayout(1280,640);near(t.scale,8/9);assert.deepEqual(t.logical,[1440,720]);assert.deepEqual(t.deskOffset,[80,0]);
 [[120,577.7777777778],[1075.5555555556,440],[822.2222222222,44.4444444444],[266.6666666667,144]].forEach((expected,i)=>expected.forEach((v,j)=>near(t.seats[i].hand.origin[j],v)));
 near(t.compass.center[0],639.1111111111);near(t.compass.center[1],284.4444444444);
 near(t.background.width,1422.2222222222);near(t.background.x,-71.1111111111);
 near(t.deskTexture.center[1],302.2222222222);near(t.deskTexture.height,464);
 const live=computeTableLayout(1280,640,{live:true});assert.notDeepEqual(live.seats[0].hand.origin,t.seats[0].hand.origin);assert.notDeepEqual(live.profiles[0].root,t.profiles[0].root);
});

test('fresh concealed hand keeps its original origin and actual CPG alone triggers edge movement',()=>{
 const t=computeTableLayout(1280,640),groups=[{type:'peng',value:11}];
 for(let seat=0;seat<4;seat++){
  const fresh=concealedHandPlacements(13,seat,t,[],melds);assert.deepEqual([fresh[0].x,fresh[0].y],t.seats[seat].hand.origin);
  const moved=concealedHandPlacements(10,seat,t,groups,melds),edge=meldEdge(groups,seat,melds),c=t.seats[seat];
  near(moved[0].x,c.meld.origin[0]+edge[0]*c.meld.scale[0]+(seat===0?28*t.scale:0));
  near(moved[0].y,seat===0?c.hand.origin[1]:c.meld.origin[1]-edge[1]*c.meld.scale[1]);
  assert(fresh.every(p=>keys.has(p.body)));assert.equal(fresh.length,13);
 }
 const front=concealedHandPlacements(14,2,t,[],melds);near(front[13].x-front[12].x,t.seats[2].hand.step[0]*1.25);
});

test('discard rows use original per-column resources and row/floor transitions',()=>{
 const t=computeTableLayout(1280,640),values=Array.from({length:27},(_,i)=>[11,21,31][i%3]);
 for(let seat=0;seat<4;seat++){
  const out=discardTilePlacements(values,seat,t),c=t.seats[seat].discard,a=TABLE_SOURCE.rows[c.source.rowPrefabs[0]],b=TABLE_SOURCE.rows[c.source.rowPrefabs[1]];
  assert.equal(out.length,values.length);assert(out.every(p=>keys.has(p.body)&&keys.has(p.face)));
  assert.equal(out[a.params.length].row,1);assert.equal(out[a.params.length+b.params.length].row,2);
  const third=out[a.params.length+b.params.length];near(third.x,c.origin[0]+c.source.floorStep[0]*c.scale[0]);near(third.y,c.origin[1]-c.source.floorStep[1]*c.scale[1]);
  assert.equal(out[0].mirror,seat===1);assert.equal(out[0].param.colorPos.length,3);
 }
});

test('HU history retains all physical records and its native thirteen-column row spacing',()=>{
 const t=computeTableLayout(1280,640);
 for(let seat=0;seat<4;seat++){
  const records=huTilePlacements(Array(14).fill(16),seat,t),c=t.seats[seat].hu;
  assert.equal(records.length,14);assert.deepEqual([records[0].x,records[0].y],c.origin);
  near(records[13].x,c.origin[0]+c.source.rowStep[0]*c.scale[0]/c.source.tileScale);near(records[13].y,c.origin[1]-c.source.rowStep[1]*c.scale[1]/c.source.tileScale);
  assert(records.every(p=>keys.has(p.body)&&keys.has(p.face)));assert.equal(records[0].mirror,seat===1);
 }
});

test('right concealed and discard tiles paint top before bottom while retaining original flight/selection indices',()=>{
 const t=computeTableLayout(1280,640),hand=concealedHandPlacements(13,1,t),before=hand.slice();
 assert.deepEqual(tilePainterOrder(hand).map(p=>p.index),Array.from({length:13},(_,i)=>12-i));assert.deepEqual(hand,before);
 const right=discardTilePlacements([11,12],1,t);assert.deepEqual(right.map(p=>p.index),[0,1]);assert.deepEqual(tilePainterOrder(right).map(p=>p.index),[1,0]);assert(right[0].y>right[1].y);
 assert.deepEqual(tilePainterOrder(concealedHandPlacements(13,3,t)).map(p=>p.index),Array.from({length:13},(_,i)=>i));
});

test('discard parent row z outranks its children z and native front row halving is retained',()=>{
 const t=computeTableLayout(1280,640),right=discardTilePlacements(Array(27).fill(11),1,t),front=discardTilePlacements(Array(27).fill(11),2,t);
 assert.deepEqual([right[0].rowZ,right[8].rowZ,right[18].rowZ],[9,8,17]);
 assert.deepEqual(tilePainterOrder(right).slice(0,10).map(p=>p.index),[17,16,15,14,13,12,11,10,9,8]);
 assert.deepEqual([front[0].rowZ,front[8].rowZ,front[18].rowZ],[-1001,-1002,-503]);
 // An eight-column front row is symmetrical around its capacity midpoint,
 // not sorted by the current populated count.
 assert.deepEqual(tilePainterOrder(front.filter(p=>p.row===0)).map(p=>p.col),[7,6,5,0,1,2,3,4]);
});

test('whole-table painter follows original scene parent order, then child z within each parent',()=>{
 const commands=[{seat:1,kind:'discard',index:0,rowZ:9,z:0},{seat:1,kind:'hand',index:0,z:0},{seat:0,kind:'hand',index:0,z:0},{seat:2,kind:'discard',index:0,rowZ:-1001,z:0},{seat:3,kind:'hand',index:0,z:0},{seat:1,kind:'hu',index:0,z:1000},{seat:1,kind:'meld',index:0,z:0}];
 assert.deepEqual(tablePainterOrder(commands).map(p=>`${p.seat}:${p.kind}`),['2:discard','3:hand','1:hand','1:meld','1:hu','1:discard','0:hand']);
 assert.equal(TABLE_SOURCE.trustee.cancel.label.fontSize,34);assert.equal(TABLE_SOURCE.trustee.cancel.label.lineHeight,45);assert.deepEqual(TABLE_SOURCE.trustee.cancel.label.position,[0,8]);assert.equal(TABLE_SOURCE.trustee.cancel.label.color,4279196870);
});

test('native tile Sprite centers trimmed pixels without adding packed atlas offset again',()=>{
 const t=computeTableLayout(1280,640),right=discardTilePlacements([19],1,t)[0],front=discardTilePlacements([19],2,t)[0];
 const rf=frames.find(f=>f.key===right.face),ff=frames.find(f=>f.key===front.face);
 assert.deepEqual(nativeSpriteDrawArgs(rf,right.sprite.face),[0,0,53,37,-26.5,-18.5,53,37]);
 assert.deepEqual(nativeSpriteDrawArgs(ff,front.sprite.face),[5,7,46,53,-23,-26.5,46,53]);
 for(const sprite of Object.values(TABLE_SOURCE.tileSprites))for(const part of ['body','face']){
  assert.equal(sprite[part].sizeMode,1);assert.equal(sprite[part].trim,true);assert.equal(sprite[part].angle,0);assert.deepEqual(sprite[part].anchor,[.5,.5]);
 }
 // Assignment of a different face changes its contentSize to that rect, rather
 // than reusing the nine-of-characters size stored in the prefab.
 const own=TABLE_SOURCE.seats[0].hand,oneDot=frames.find(f=>f.key===own.faces[31]);
 assert.deepEqual(nativeSpriteDrawArgs(oneDot,own.sprite.face).slice(4),[-39.5,-40,79,80]);
 assert.equal(right.param.colorRotation,0);assert.equal(front.param.colorRotation,0);
});

test('padded PNG crop uses the extraction rounding and preserves explicit raw/custom sprite modes',()=>{
 const f={rect:[0,0,4,6],originalSize:[9,11],offset:[0,0]};
 // Python extraction's round(2.5) is 2, not JavaScript's 3.
 assert.deepEqual(nativeSpriteDrawArgs(f),[2,2,4,6,-2,-3,4,6]);
 assert.deepEqual(nativeSpriteDrawArgs(f,{sizeMode:0,size:[20,30],anchor:[0,1]}),[2,2,4,6,-0,-0,20,30]);
 assert.deepEqual(nativeSpriteDrawArgs(f,{sizeMode:2}),[2,2,4,6,-4.5,-5.5,9,11]);
 const raw=nativeSpriteDrawArgs(f,{sizeMode:2,trim:false});assert.deepEqual(raw.slice(4),[-2,-3,4,6]);
});
