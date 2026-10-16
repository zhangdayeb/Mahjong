import test from 'node:test';
import assert from 'node:assert/strict';
import {BloodflowRound} from './bloodflow-round.js';
import {RULE_PROFILES,ruleProfile} from './rule-profiles.js';
import {seededRandom} from './practice-round.js';
import {snapshotActionResult,actionResultEvents} from './action-result-events.js';
import {snapshotTableAudio,tableAudioEvents,createCountdownCue} from './table-controls.js';
import {rewardWasCredited} from './practice-wallet.js';

const actor=round=>['exchange','choose'].includes(round.phase)?0:['claim','rob'].includes(round.phase)?Number(Object.keys(round.claim.options).find(seat=>!(seat in round.claim.responses))):round.turn;

test('seven real rule profiles announce normal draws, never exchange or kong replacement draws; hu cue follows every real batch',()=>{
 let normal=0,replacement=0,hu=0,reveal=0,exchanges=0;
 for(const mode of Object.keys(RULE_PROFILES))for(let seed=0;seed<5;seed++){
  const round=new BloodflowRound(seededRandom(seed),{...ruleProfile(mode),base:1});
  for(let steps=0;round.phase!=='end'&&steps<2000;steps++){
   const audioBefore=snapshotTableAudio(round),resultBefore=snapshotActionResult(round);
   const drawCount=round.drawCounts.reduce((a,b)=>a+b,0),kongCount=round.kongBatches.length;
   const seat=actor(round);if(seat===0&&round.options(0).includes('reveal'))round.reveal(0);else round.auto(seat);
   const result=actionResultEvents(resultBefore,round),audio=tableAudioEvents(audioBefore,round,result);
   const drew=round.drawCounts.reduce((a,b)=>a+b,0)>drawCount,kong=round.kongBatches.length>kongCount;
   assert.equal(audio.draw,drew&&!kong,mode+'/'+seed+'/'+steps);
   assert.equal(audio.huCue,round.huEvents.length>resultBefore.huEventCount);
   if(audioBefore.phase==='exchange'){assert.equal(audio.draw,false);exchanges++;}
   if(drew&&kong){assert.equal(audio.draw,false);replacement++;}
   if(audio.draw)normal++;
   if(audio.huCue)hu++;
   for(const seat of audio.revealSeats){assert.equal(round.revealed[seat],true);assert.equal(audioBefore.revealed[seat],false);reveal++;}
   assert.deepEqual(tableAudioEvents(snapshotTableAudio(round),round,{huEvents:[],actions:[]}).revealSeats,[]);
  }
  assert.equal(round.phase,'end');
 }
 assert.ok(normal>50);assert.ok(replacement>0);assert.ok(hu>0);assert.ok(reveal>0);assert.ok(exchanges>0);
});

test('countdown cues emit once per active last-three second, and do not catch up paused or hidden seconds',()=>{
 const tick=createCountdownCue(),deadline=15000;
 assert.equal(tick({active:true,deadline,remaining:4}),false);
 assert.equal(tick({active:true,deadline,remaining:3}),true);
 assert.equal(tick({active:true,deadline,remaining:3}),false);
 assert.equal(tick({active:false,deadline,remaining:2}),false);
 assert.equal(tick({active:true,deadline,remaining:2}),false);
 assert.equal(tick({active:true,deadline,remaining:1}),true);
 assert.equal(tick({active:true,deadline,remaining:0}),false);
 assert.equal(tick({active:false,deadline:30000,remaining:3}),false);
 assert.equal(tick({active:true,deadline:45000,remaining:3}),true);
});

test('coin reward cue requires a newly credited backend operation; retries, balance refresh and errors stay silent',()=>{
 const first={alreadyClaimed:false,operation:{kind:'daily_grant',before:30000,after:60000}};
 assert.equal(rewardWasCredited(first),true);
 assert.equal(rewardWasCredited({...first,operation:{...first.operation,kind:'ad_grant'}}),true);
 assert.equal(rewardWasCredited({...first,alreadyClaimed:true}),false);
 assert.equal(rewardWasCredited({...first,operation:{...first.operation,kind:'refresh'}}),false);
 assert.equal(rewardWasCredited({...first,operation:{...first.operation,after:30000}}),false);
 assert.equal(rewardWasCredited({balance:60000}),false);
 assert.equal(rewardWasCredited(null),false);
});
