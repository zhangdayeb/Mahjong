import test from 'node:test';
import assert from 'node:assert/strict';
import {SanguoRound} from './sanguo-round.js';
import {SANGUO_VALUES,createSanguoDeck,sanguoCopies,sanguoWinning,sanguoScore,sanguoMapFan} from './sanguo-rules.js';
const rng=(seed=1)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
function conserved(round){const all=round.inventory();assert.equal(all.length,135);for(const value of SANGUO_VALUES)assert.equal(all.filter(tile=>tile===value).length,sanguoCopies(value),`physical ${value}`);assert.equal(round.scores.reduce((sum,value)=>sum+value,0),0);assert.ok(round.scores.every(Number.isSafeInteger));}
function fixture(required,melds=[[],[],[],[]]){
 const round=new SanguoRound(rng(31),{base:10}),stock=round.inventory(),take=value=>{const index=stock.indexOf(value);assert.ok(index>=0,`available ${value}`);return stock.splice(index,1)[0];};
 round.hands=[[],[],[],[]];round.melds=structuredClone(melds);round.wall=[];round.unlocks=[[],[],[],[]];
 for(const meld of melds.flat())for(let copy=0;copy<(meld.type==='peng'?3:4);copy++)take(meld.value);
 for(const [seat,hand]of Object.entries(required))round.hands[seat]=hand.map(take);
 for(let seat=0;seat<4;seat++)while(round.hands[seat].length<(seat===0?14:13)-melds[seat].length*3)round.hands[seat].push(stock.shift());
 round.wall=stock;round.lastDraw={player:0,value:round.hands[0].at(-1)};conserved(round);return round;
}
test('Sanguo deals its distinct 135-card stock directly into play without bloodflow exchange, dingque or circles',()=>{
 const deck=createSanguoDeck(rng(9));assert.equal(deck.length,135);
 for(const value of SANGUO_VALUES)assert.equal(deck.filter(tile=>tile===value).length,sanguoCopies(value));
 const round=new SanguoRound(rng(9));assert.equal(round.phase,'play');assert.equal(round.wall.length,82);assert.deepEqual(round.hands.map(hand=>hand.length),[14,13,13,13]);assert.equal('missing'in round,false);conserved(round);
});
test('hero cards form triples or pairs, never a numeric sequence; seals replace only absent values and last-wall treasure is separate',()=>{
 assert.ok(sanguoWinning([17,18,19,33,34,35,113,113,113,145,145,145,163,163]));
 assert.ok(!sanguoWinning([17,18,19,33,34,35,113,114,115,145,145,145,163,163]));
 assert.ok(sanguoWinning([17,18,177,33,34,35,113,113,113,145,145,145,163,163]));
 const pairMissing=[17,18,19,33,34,35,113,113,113,145,145,145,163,177];assert.ok(!sanguoWinning(pairMissing));
 const treasure=pairMissing.map(value=>value===177?193:value);assert.ok(!sanguoWinning(treasure));assert.ok(sanguoWinning(treasure,[],{treasureWild:true}));
 assert.ok(!sanguoWinning([17,18,19,33,34,35,113,113,113,113,113], [{type:'peng',value:113}]),'reject impossible fifth copies across a meld and hand');
});
test('invalid out-of-turn or out-of-range actions are atomic and do not lose any tiles',()=>{
 const round=new SanguoRound(rng(5)),before=JSON.stringify(round.inventory());assert.throws(()=>round.discard(1,0),/轮到/);assert.throws(()=>round.discard(0,-1),/选择/);assert.throws(()=>round.gang(0,129),/不能/);assert.equal(JSON.stringify(round.inventory()),before);conserved(round);
});
test('one discard can produce two winning events, outranks peng, and retains exactly one physical discard',()=>{
 const wait=[17,18,19,20,21,22,33,34,35,38,39,40,41],round=fixture({0:[41],1:wait,2:wait});round.discard(0,round.hands[0].indexOf(41));assert.equal(round.phase,'claim');assert.ok(round.claim.options[1].includes('hu'));assert.ok(round.claim.options[2].includes('hu'));
 for(const seat of Object.keys(round.claim.options).map(Number))if(round.phase==='claim')round.respond(seat,[1,2].includes(seat)?'hu':'pass');
 assert.equal(round.huEvents.length,2);for(const event of round.huEvents){assert.equal(event.deltas.reduce((sum,value)=>sum+value,0),0);assert.equal(event.deltas[event.seat],event.fan.multiple*round.base);assert.equal(event.hand.length,14);}
 assert.equal(round.discards[0].filter(value=>value===41).length,1);conserved(round);
});
test('peng and exposed kong consume only the reserved claim; exposed kong draws one replacement without inventing bloodflow wind/rain fees',()=>{
 for(const action of['peng','gang']){const round=fixture({0:[129],1:[129,129,129]});round.discard(0,round.hands[0].indexOf(129));const size=round.wall.length;for(const seat of Object.keys(round.claim.options).map(Number))if(round.phase==='claim')round.respond(seat,seat===1?action:'pass');assert.equal(round.melds[1][0].type,action);assert.equal(round.turn,1);assert.equal(round.discards[0].includes(129),false);assert.equal(round.wall.length,size-(action==='gang'?1:0));assert.equal(round.kongPayments.length,0);assert.deepEqual(round.scores,[0,0,0,0]);conserved(round);}
});
test('self draw keeps an immutable fan/hand snapshot, moves its physical tile once and continues the round',()=>{
 const hand=[17,18,19,33,34,35,113,113,113,145,145,145,163,163],round=fixture({0:hand});round.hu(0);const event=round.huEvents[0];assert.equal(event.selfDraw,true);assert.deepEqual(event.hand,hand);assert.equal(round.wonTiles.length,1);assert.equal(event.deltas[0],event.fan.multiple*round.base*3);assert.notEqual(event.hand,round.hands[0]);assert.equal(round.phase,'play');conserved(round);
});
test('robbed added kong leaves the peng in place, pays winners and preserves the fourth physical tile',()=>{
 const wait=[17,18,19,20,21,22,33,34,35,39,40,37,37],round=fixture({0:[41],1:wait},[[{type:'peng',value:41,from:3}],[],[],[]]);round.gang(0,41,true);assert.equal(round.phase,'rob');conserved(round);for(const seat of Object.keys(round.claim.options).map(Number))if(round.phase==='rob')round.rob(seat,seat===1?'hu':'pass');assert.equal(round.melds[0][0].type,'peng');assert.equal(round.huEvents[0].from,0);assert.ok(round.huEvents[0].fan.name.includes('抢杠胡'));assert.deepEqual(round.wonTiles,[41]);conserved(round);
});
test('seal kong and both treasure skills remove a special card, draw replacement, and unlock maps without duplicate map entries',()=>{
 const seal=fixture({0:[177]});seal.sealKong(0,177);assert.deepEqual(seal.sealKongs[0],[177]);assert.equal(seal.unlocks[0].length,1);seal.addMap(0,seal.unlocks[0][0]);assert.equal(seal.unlocks[0].length,1);conserved(seal);
 for(const [roll,bonus]of[[.1,3],[.9,0]]){const round=fixture({0:[193]});round.random=()=>roll;const before=round.wall.length;round.dig(0);assert.equal(round.wall.length,before-1);assert.deepEqual(round.treasuresSpent[0],[193]);assert.equal(round.bonusTurns[0],bonus);assert.equal(round.unlocks[0].length,bonus?0:1);conserved(round);}
});
test('recognized Sanguo fans and map sets are capped, and recorder counts never read concealed opponent hands',()=>{
 const hand=[17,17,17,18,18,18,19,19,19,115,115,115,20,20];const fan=sanguoScore(hand,[],{cap:1000,unlocks:[113,147,114]});assert.equal(fan.baseMultiple,399);assert.equal(fan.multiple,1000);assert.ok(sanguoMapFan([113,147,114]).items.some(item=>item.name==='左三雄'));
 const round=new SanguoRound(rng(3)),before=round.recorder();round.hands[1].reverse();assert.deepEqual(round.recorder(),before);
});
test('eighty complete bot rounds conserve every physical tile, zero-sum safe scores, and terminate under both special skills',()=>{
 for(let seed=1;seed<=80;seed++){const round=new SanguoRound(rng(seed));let steps=0;while(round.phase!=='end'&&steps++<2000){if(['claim','rob'].includes(round.phase)){for(const seat of Object.keys(round.claim.options).map(Number))if(['claim','rob'].includes(round.phase))round.auto(seat);}else round.auto(round.turn);conserved(round);}assert.equal(round.phase,'end',`seed ${seed}, steps ${steps}`);assert.ok(steps<2000);}
});
