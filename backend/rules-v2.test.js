import test from 'node:test';
import assert from 'node:assert/strict';
import {createFileStore} from './file-store.js';
import {createWalletService} from './wallet-service.js';
import {createPracticeRound,recordRoundActions,replayPracticeRound} from '../demo/practice-round.js';
import {ruleProfile,RULE_PROFILES} from '../demo/rule-profiles.js';
import {validStock} from '../demo/bloodflow-round.js';
const actor=r=>['exchange','choose'].includes(r.phase)?0:['claim','rob'].includes(r.phase)?Number(Object.keys(r.claim.options).find(p=>!(p in r.claim.responses))):r.turn;
function play(game,steps=3000){const actions=[],round=recordRoundActions(createPracticeRound(game.mode,game.room,game.seed,game),a=>actions.push(a));for(let n=0;n<steps&&round.phase!=='end';n++)round.auto(actor(round));return{actions,round};}
async function setup(){const store=await createFileStore(),service=createWalletService(store),id=await service.createSession('a'.repeat(64));return{store,service,id};}
test('new clients explicitly select v2; old saved games and cached clients keep their original deterministic engine',async()=>{
 const {service,id}=await setup();const old=(await service.start(id,{mode:'classic',room:'beginner'})).round;assert.equal(old.rulesVersion,1);
 const oldRound=createPracticeRound('classic','beginner',old.seed),replay=replayPracticeRound({...old,rulesVersion:undefined,actions:[]});assert.deepEqual(replay.hands,oldRound.hands);assert.deepEqual(replay.config,oldRound.config);
 const current=(await service.start(id,{mode:'classic',room:'beginner',rulesVersion:2})).round;assert.equal(current.rulesVersion,2);assert.equal(createPracticeRound(current.mode,current.room,current.seed,current).phase,'choose');
 for(const rulesVersion of [0,3,'2',null])await assert.rejects(service.start(id,{mode:'red',room:'beginner',rulesVersion}),e=>e.status===400);
 for(const mode of ['sanguo','zodiac'])await assert.rejects(service.start(id,{mode,room:'621',rulesVersion:2}),e=>e.status===400);
});
test('all seven v2 transcripts replay exactly; server settlement and stored detail are credited once with the locked starting bank',async()=>{
 for(const mode of Object.keys(RULE_PROFILES)){
  const {store,service,id}=await setup(),game=(await service.start(id,{mode,room:'beginner',rulesVersion:2,rulesData:{startBalances:[999999999,0,0,0]}})).round;
  assert.deepEqual(game.rulesData.startBalances,[30000,750000,235000,437000]);const {actions,round}=play(game);assert.equal(round.phase,'end',mode);
  await service.sync(id,{id:game.id,actions:actions.slice(0,4)});
  const result=await service.sync(id,{id:game.id,actions});assert.equal(result.balance,30000+round.scores[0]);assert.ok(result.balance>=0);
  assert.deepEqual((await service.sync(id,{id:game.id,actions,close:true})).balances,result.balances);
  await store.withAccount(id,async tx=>{const saved=await tx.getGame(game.id);assert.equal(saved.rulesVersion,2);assert.deepEqual(saved.resultData.huEvents,round.huEvents);assert.deepEqual(saved.resultData.settlementEvents,round.settlementEvents);assert.ok(validStock(saved.resultData.stockOrder,ruleProfile(mode).jokerCount));assert.deepEqual(replayPracticeRound(saved).scores,round.scores);});
 }
});
test('no-shuffle reuses this account and mode collection order, cuts only, and ignores client-controlled stock',async()=>{
 const {store,service,id}=await setup(),first=(await service.start(id,{mode:'sixFixed',room:'beginner',rulesVersion:2})).round,done=play(first,12);
 assert.equal(done.round.shuffleMethod,'shuffle');await service.sync(id,{id:first.id,actions:done.actions,close:true});
 let order;await store.withAccount(id,async tx=>order=(await tx.getGame(first.id)).resultData.stockOrder);
 const second=(await service.start(id,{mode:'sixFixed',room:'beginner',rulesVersion:2,rulesData:{continuation:Array(114).fill(51)}})).round,r=replayPracticeRound({...second,actions:[]});
 assert.deepEqual(second.rulesData.continuation,order);assert.equal(r.shuffleMethod,'cut');assert.deepEqual(r.initialStock,[...order.slice(r.cutAt),...order.slice(0,r.cutAt)]);
 const other=await service.createSession('b'.repeat(64)),isolated=(await service.start(other,{mode:'sixFixed',room:'beginner',rulesVersion:2})).round;assert.equal(isolated.rulesData.continuation,null);
});
test('v2 account ownership, opponent control and immutable transcript checks remain enforced',async()=>{
 const {service,id}=await setup(),game=(await service.start(id,{mode:'crazy',room:'beginner',rulesVersion:2})).round;
 for(const action of [{method:'reveal',args:[1]},{method:'redKong',args:[1]},{method:'payHu',args:[0,1]},{method:'choose',args:[4]}])await assert.rejects(service.sync(id,{id:game.id,actions:[action]}),e=>e.status===422);
 const {actions}=play(game,3);await service.sync(id,{id:game.id,actions});await assert.rejects(service.sync(id,{id:game.id,actions:[]}),e=>e.status===409);assert.equal((await service.me(id)).balance,30000);
});
