import test from 'node:test';
import assert from 'node:assert/strict';
import {Round} from './round.js';
import {redPractice,RED} from './red-rules.js';

const inventory=r=>[...r.wall,...r.hands.flat(),...r.discards.flat(),...(r.wonTiles||[]),...r.melds.flat().flatMap(m=>Array(m.type==='peng'?3:4).fill(m.value))];
function conserved(r){const all=inventory(r);assert.equal(all.length,112);for(const tile of [...Array.from({length:27},(_,i)=>Math.floor(i/9)*10+11+i%9),RED])assert.equal(all.filter(v=>v===tile).length,4,`Four physical copies of ${tile}`)}
// Create legal inventories instead of injecting duplicate fixture tiles.
function fixture(required,melds=[[],[],[],[]]){
 const r=new Round(()=>.3,{...redPractice,settlement:false});
 const stock=inventory(r),take=tile=>{const i=stock.indexOf(tile);assert(i>=0,`Fixture has available ${tile}`);stock.splice(i,1);return tile};
 r.melds=melds.map(m=>m.map(x=>({...x})));for(const m of r.melds.flat())for(let i=0;i<(m.type==='peng'?3:4);i++)take(m.value);
 r.hands=[[],[],[],[]];for(const [seat,hand]of Object.entries(required))r.hands[seat]=hand.map(take);
 // Fill the remaining hands after reserving all constrained winner tiles.
 for(let seat=0;seat<4;seat++){const size=(seat===0?14:13)-r.melds[seat].length*3;while(r.hands[seat].length<size){const i=seat===0?stock.findIndex(v=>Math.floor(v/10)!==3):0;assert(i>=0);r.hands[seat].push(stock.splice(i,1)[0])}}
 r.wall=stock;r.discards=[[],[],[],[]];r.missing=[3,3,3,3];r.huCounts=[0,0,0,0];r.huEvents=[];r.wonTiles=[];r.scores=[0,0,0,0];r.phase='play';r.turn=0;r.claim=null;r.lastDraw=null;r.base=2000;conserved(r);return r;
}
function eventContract(event,r){assert.equal(event.deltas.reduce((sum,v)=>sum+v,0),0);assert(event.fan.name);assert(event.fan.multiple>0);assert(event.deltas[event.seat]>0);assert.equal(event.deltas[event.seat],(event.selfDraw?3:1)*r.base*event.fan.multiple)}

test('self-draw event reports actual scaled deltas, fan and drawn tile without losing physical tiles',()=>{
 const r=fixture({0:[11,11,11,12,12,12,13,13,13,14,14,14,15,15]});r.lastDraw={player:0,value:15};r.scores=[500,-700,200,0];const before=r.scores.slice();
 r.hu(0);assert.equal(r.huEvents.length,1);const e=r.huEvents[0];
 assert.deepEqual({seat:e.seat,from:e.from,tile:e.tile,selfDraw:e.selfDraw},{seat:0,from:0,tile:15,selfDraw:true});assert.equal(e.fan.name,'清一色');assert.equal(e.fan.multiple,4);
 assert.deepEqual(e.deltas,[24000,-8000,-8000,-8000]);assert.deepEqual(r.scores.map((v,i)=>v-before[i]),e.deltas);eventContract(e,r);assert.deepEqual(r.wonTiles,[15]);conserved(r);
 assert.deepEqual(e.hand,[11,11,11,12,12,12,13,13,13,14,14,14,15,15]);assert.notEqual(e.hand,r.hands[0]);assert.deepEqual(e.melds,[]);const snapshot=e.hand.slice();r.hands[0].sort((a,b)=>b-a);assert.deepEqual(e.hand,snapshot);
});

test('one discard with two winners emits independent zero-sum events and keeps one physical discard',()=>{
 const waiting=[11,12,13,14,15,16,21,22,23,26,27,28,29],r=fixture({0:[29],1:waiting,2:waiting});
 r.discard(0,r.hands[0].indexOf(29));assert.equal(r.phase,'claim');assert(r.claim.options[1].includes('hu'));assert(r.claim.options[2].includes('hu'));
 const respondents=Object.keys(r.claim.options).map(Number);for(const seat of respondents)r.respond(seat,[1,2].includes(seat)?'hu':'pass');
 assert.equal(r.huEvents.length,2);assert.deepEqual(r.huEvents.map(e=>({seat:e.seat,from:e.from,tile:e.tile,selfDraw:e.selfDraw})),[{seat:1,from:0,tile:29,selfDraw:false},{seat:2,from:0,tile:29,selfDraw:false}]);
 for(const event of r.huEvents){assert.equal(event.hand.length,14);assert.equal(event.hand.filter(v=>v===29).length,2);assert.notEqual(event.hand,r.hands[event.seat]);}
 assert.deepEqual(r.huEvents.map(e=>e.deltas),[[-2000,2000,0,0],[-2000,0,2000,0]]);assert.deepEqual(r.scores,[-4000,2000,2000,0]);r.huEvents.forEach(e=>eventContract(e,r));
 assert.equal(r.discards[0].filter(v=>v===29).length,1);assert.deepEqual(r.wonTiles,[]);conserved(r);
});

test('robbed added kong emits source/tile payment metadata and stores the fourth physical tile once',()=>{
 const r=fixture({0:[29],1:[11,12,13,14,15,16,21,22,23,27,28,25,25]},[[{type:'peng',value:29,from:3}],[],[],[]]);
 r.gang(0,29,true);assert.equal(r.phase,'rob');assert(r.claim.options[1].includes('hu'));
 const respondents=Object.keys(r.claim.options).map(Number);for(const seat of respondents)r.rob(seat,seat===1?'hu':'pass');
 assert.equal(r.huEvents.length,1);const e=r.huEvents[0];assert.equal(e.seat,1);assert.equal(e.from,0);assert.equal(e.tile,29);assert.equal(e.selfDraw,false);assert.deepEqual(e.deltas,[-2000,2000,0,0]);eventContract(e,r);
 assert.equal(r.melds[0][0].type,'peng');assert.deepEqual(r.wonTiles,[29]);conserved(r);
});
