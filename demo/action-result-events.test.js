import test from 'node:test';
import assert from 'node:assert/strict';
import {Round} from './round.js';
import {snapshotActionResult,actionResultEvents} from './action-result-events.js';

function fixture(){const round=new Round(()=>.4);round.phase='play';round.missing=[3,3,3,3];return round;}
const win=[11,11,11,12,13,14,15,16,17,21,22,23,24,24];
test('self draw derives native ZIMO from the actual HU event and zero-sum payout',()=>{
 const round=fixture();round.hands[0]=win.slice();round.lastDraw={player:0,value:24};round.turn=0;
 const before=snapshotActionResult(round);round.hu(0);const result=actionResultEvents(before,round);
 assert.equal(result.actions[0].action,'zimo');assert.equal(result.actions[0].nativeEvent,'ANIM_ZIMO');assert.equal(result.actions[0].tile,24);assert.equal(result.actions[0].selfDraw,true);
 assert.deepEqual(result.deltas,[3,-1,-1,-1]);assert.deepEqual(result.otherDeltas,[0,0,0,0]);assert.equal(result.deltas.reduce((a,b)=>a+b),0);assert.equal(result.actionLockMs,1120);
});
test('one discard with two winners produces one synchronous action batch and combined actual payout',()=>{
 const round=fixture();round.hands[1]=win.slice(0,-1);round.hands[2]=win.slice(0,-1);round.claim={from:0,value:24,options:{1:['hu'],2:['hu']},responses:{1:'hu'}};round.phase='claim';
 const before=snapshotActionResult(round);round.respond(2,'hu');const result=actionResultEvents(before,round);
 assert.deepEqual(result.actions.map(e=>[e.seat,e.action,e.nativeEvent]),[[1,'hu','ANIM_HU'],[2,'hu','ANIM_HU']]);assert.deepEqual(result.deltas,[-2,1,1,0]);assert.equal(result.actionLockMs,1030);
});
test('robbed patched kong produces QGH without a successful gang action',()=>{
 const round=fixture();round.hands[1]=win.slice(0,-1);round.claim={from:0,value:24,options:{1:['hu']},responses:{},addGang:true};round.melds[0]=[{type:'peng',value:24,from:2}];round.phase='rob';
 const before=snapshotActionResult(round);round.rob(1,'hu');const result=actionResultEvents(before,round);
 assert.deepEqual(result.actions.map(e=>e.action),['qgh']);assert.equal(result.actions[0].nativeEvent,'ANIM_QGH');assert.equal(round.melds[0][0].type,'peng');assert.deepEqual(result.deltas,[-1,1,0,0]);
});
test('patching an earlier group reports that group, not the last peng; dark gang uses rain',()=>{
 const round=fixture();round.hands[0]=[11,12,13,14,15,16,17,18];round.melds[0]=[{type:'peng',value:11,from:1},{type:'peng',value:21,from:2}];round.turn=0;
 const before=snapshotActionResult(round);round.gang(0,11,true);const result=actionResultEvents(before,round);
 assert.deepEqual(result.actions.map(e=>[e.group,e.tile,e.action,e.gangType,e.ambient]),[[0,11,'gang','patched','wind']]);assert.deepEqual(result.deltas,[3,-1,-1,-1]);assert.equal(result.kongPayments.length,3);
 const dark=fixture();dark.hands[0]=[11,11,11,11,12,13,14];dark.turn=0;const bd=snapshotActionResult(dark);dark.gang(0,11);const rd=actionResultEvents(bd,dark);assert.equal(rd.actions[0].gangType,'concealed');assert.equal(rd.actions[0].ambient,'rain');
});
