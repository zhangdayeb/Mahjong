import test from 'node:test';
import assert from 'node:assert/strict';
import {createSanguoController,nextSanguoActor,pendingSanguoPlayer} from './sanguo-controller.js';
import {SANGUO_NUMBERS} from './sanguo-rules.js';
const rng=(seed=7)=>()=>((seed=(seed*1664525+1013904223)>>>0)/2**32);
function setup(){let time=0,paused=false,ends=0;const controller=createSanguoController({room:{base:1000},random:rng(),clock:()=>time,autoStart:false,isPaused:()=>paused,onEnd:()=>ends++});return{controller,advance(ms=1000){time+=ms;controller.tick();},pause(value){paused=value;},get ends(){return ends;}};}
test('manual selection is separate from an actual discard and advances to the next legal actor',()=>{
 const {controller}=setup(),round=controller.round,index=round.hands[0].findIndex(value=>SANGUO_NUMBERS.includes(value)),value=round.hands[0][index],before=round.inventory().slice().sort((a,b)=>a-b);
 assert.equal(controller.canSelect,true);assert.equal(controller.select(index),true);assert.equal(controller.selected,index);assert.equal(round.discards[0].length,0);assert.equal(controller.select(index),true);assert.equal(round.discards[0][0],value);assert.equal(controller.selected,-1);assert.equal(controller.canSelect,false);assert.notEqual(nextSanguoActor(round),null);assert.deepEqual(round.inventory().slice().sort((a,b)=>a-b),before);controller.dispose();
});
test('a newly entered practice table waits for the first gesture instead of playing away its opening hand during visual inspection',()=>{
 const session=setup(),{controller}=session,before=controller.round.inventory().slice();session.advance(120000);assert.deepEqual(controller.round.inventory(),before);assert.equal(controller.canSelect,true);assert.equal(controller.remaining,20);const index=controller.round.hands[0].findIndex(value=>SANGUO_NUMBERS.includes(value));controller.select(index);session.advance(21000);assert.notDeepEqual(controller.round.inventory(),before);controller.dispose();
});
test('opening a menu or panel freezes both NPC actions and human timeout until it closes',()=>{
 const session=setup(),{controller}=session,before=controller.round.inventory().slice();session.pause(true);controller.setAuto(true);for(let step=0;step<5;step++)session.advance(30000);assert.deepEqual(controller.round.inventory(),before);assert.equal(controller.select(0),false);session.pause(false);session.advance();assert.notDeepEqual(controller.round.inventory(),before);controller.dispose();
});
test('trustee completes a real 135-tile round, emits exactly one settlement, and reset starts an independently shuffled manual round',()=>{
 const session=setup(),{controller}=session;controller.setAuto(true);let steps=0;while(controller.round.phase!=='end'&&steps++<2000)session.advance();assert.equal(controller.round.phase,'end');assert.equal(controller.round.inventory().length,135);assert.equal(session.ends,1);session.advance(40000);assert.equal(session.ends,1);const old=controller.round;controller.reset();assert.notEqual(controller.round,old);assert.equal(controller.round.phase,'play');assert.equal(controller.round.wall.length,82);assert.equal(controller.auto,false);assert.equal(controller.canSelect,true);controller.dispose();
});
test('human response remains pending while other NPC responses are processed, instead of skipping the player',()=>{
 const {controller}=setup(),round=controller.round;round.phase='claim';round.claim={from:3,value:17,options:{0:['peng'],1:['peng'],2:['hu']},responses:{}};assert.equal(pendingSanguoPlayer(round),true);assert.equal(nextSanguoActor(round,false),1);round.claim.responses[1]='pass';assert.equal(nextSanguoActor(round,false),2);round.claim.responses[2]='pass';assert.equal(nextSanguoActor(round,false),null);assert.equal(nextSanguoActor(round,true),0);controller.dispose();
});
test('a discarded tile awaiting NPC response is described as the responding NPC, not a disabled human turn',()=>{
 const {controller}=setup(),round=controller.round;round.phase='claim';round.turn=0;round.claim={from:0,value:17,options:{1:['peng']},responses:{}};assert.equal(controller.canSelect,false);assert.equal(pendingSanguoPlayer(round),false);assert.equal(controller.status,'阿唐考虑响应');controller.dispose();
});
