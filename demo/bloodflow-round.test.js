import test from 'node:test';
import assert from 'node:assert/strict';
import {BloodflowRound,validStock} from './bloodflow-round.js';
import {ruleProfile,RULE_PROFILES} from './rule-profiles.js';
const seeded=initial=>{let seed=initial>>>0;return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);};
const actor=r=>['exchange','choose'].includes(r.phase)?0:['claim','rob'].includes(r.phase)?Number(Object.keys(r.claim.options).find(p=>!(p in r.claim.responses))):r.turn;
function fixture(required,{mode='classic',melds=[[],[],[],[]],missing=[3,3,3,3],walletBound=false,startBalances}={}){
 const r=new BloodflowRound(seeded(4),{...ruleProfile(mode),walletBound,startBalances,base:1}),stock=r.inventory();
 const take=value=>{const index=stock.indexOf(value);assert.ok(index>=0,'physical '+value);return stock.splice(index,1)[0];};
 r.melds=melds.map(groups=>groups.map(m=>({...m})));for(const m of r.melds.flat())for(let n=0;n<(m.type==='peng'?3:4);n++)take(m.value);
 r.hands=[[],[],[],[]];for(const[p,hand]of Object.entries(required))r.hands[p]=hand.map(take);
 for(let p=0;p<4;p++)while(r.hands[p].length<(p===0?14:13)-3*r.melds[p].length){const index=stock.findIndex(v=>Math.floor(v/10)!==missing[p]);assert.ok(index>=0,'available non-missing filler');r.hands[p].push(stock.splice(index,1)[0]);}
 r.wall=stock;r.phase='play';r.turn=0;r.missing=missing;r.lastDraw=null;r.interrupted=true;r.discardCounts=[1,1,1,1];assert.ok(validStock(r.inventory(),r.config.jokerCount));return r;
}
test('all seven rule profiles finish deterministic rounds with physical tiles and available coins conserved',()=>{
 for(const mode of Object.keys(RULE_PROFILES))for(let seed=0;seed<5;seed++){
  const cfg={...ruleProfile(mode),base:2000},r=new BloodflowRound(seeded(seed),cfg),actions=[];
  for(let steps=0;r.phase!=='end'&&steps<2000;steps++){const p=actor(r);actions.push(p);r.auto(p);assert.equal(r.scores.reduce((a,b)=>a+b,0),0);assert.ok(validStock(r.inventory(),r.config.jokerCount),mode+'/'+seed+'/'+steps);assert.ok(r.startBalances.every((n,p)=>n+r.scores[p]>=0));}
  assert.equal(r.phase,'end',mode+'/'+seed);assert.ok(validStock(r.collectionOrder(),r.config.jokerCount));
  const replay=new BloodflowRound(seeded(seed),cfg);for(const p of actions)replay.auto(p);assert.deepEqual(replay.scores,r.scores);assert.deepEqual(replay.huEvents,r.huEvents);
 }
});
test('two discard winners retain one physical discard and distinct zero-sum payout records',()=>{
 const wait=[11,12,13,14,15,16,21,22,23,24,25,26,29],r=fixture({0:[29],1:wait,2:wait},{missing:[3,3,3,1]});
 r.discard(0,r.hands[0].indexOf(29));assert.deepEqual(Object.keys(r.claim.options),['1','2']);r.respond(1,'hu');r.respond(2,'hu');
 assert.equal(r.huEvents.length,2);for(const event of r.huEvents)assert.equal(event.deltas.reduce((a,b)=>a+b,0),0);assert.equal(r.discards[0].filter(v=>v===29).length,1);assert.ok(validStock(r.inventory(),0));
});
test('a robbed supplement keeps the peng, makes no kong income and preserves its pending tile on early exit',()=>{
 const wait=[11,12,13,14,15,16,21,22,23,27,28,18,18],r=fixture({0:[29],1:wait},{mode:'red',melds:[[{type:'peng',value:29,from:1}],[],[],[]]});
 r.lastDraw={player:0,value:29};r.gang(0,29,true);assert.equal(r.phase,'rob');assert.ok(validStock(r.collectionOrder(),4));
 for(const p of Object.keys(r.claim.options))r.rob(Number(p),Number(p)===1?'hu':'pass');
 assert.equal(r.melds[0][0].type,'peng');assert.equal(r.kongPayments.length,0);assert.ok(r.huEvents.some(e=>e.seat===1&&e.fan.candidates.some(f=>f.name==='抢杠胡')));assert.ok(validStock(r.inventory(),4));
});
test('call transfer goes to the nearest winner once, and transferred income is not taxed twice',()=>{
 const wait=[21,22,23,24,25,26,31,32,33,34,35,36,39],r=fixture({0:[39],1:wait,2:wait},{melds:[[{type:'dark',value:11,from:0}],[],[],[]],missing:[2,1,1,2]});
 const batch=r.newKong(0,'dark',0);r.lastDraw={player:0,value:39,kongBatch:batch};r.discard(0,r.hands[0].indexOf(39));assert.ok(r.scoreContext(1,39).kongDiscard);
 r.respond(1,'hu');r.respond(2,'hu');const rows=r.settlementEvents.filter(e=>e.kind==='call_transfer');assert.equal(rows.length,1);assert.equal(rows[0].to,1);assert.equal(rows[0].amount,6);assert.equal(r.kongBatches[batch].forwarded,true);
 if(r.hands[1].length===14){r.discards[1].push(r.hands[1].pop());}r.end();assert.ok(!r.settlementEvents.some(e=>e.kind==='tax_refund'&&e.from===0));assert.equal(r.scores.reduce((a,b)=>a+b,0),0);
});
test('only a drawn supplement gets kong income, and a peng cannot turn into a false self-draw',()=>{
 const r=fixture({0:[29]},{melds:[[{type:'peng',value:29,from:1}],[],[],[]]});r.lastDraw={player:0,value:12};r.gang(0,29,true);if(r.phase==='rob')for(const p of Object.keys(r.claim.options))r.rob(Number(p),'pass');assert.equal(r.kongPayments.length,0);
 const p=fixture({0:[11,12,13,21,22,23,24,25,26,29,29]},{melds:[[{type:'peng',value:18,from:1}],[],[],[]]});p.lastDraw=null;assert.ok(p.canHu(0));assert.ok(!p.options(0).includes('hu'));assert.throws(()=>p.hu(0),/不能胡牌/);
});
test('red kongs replace a single physical joker and no-shuffle continuation cuts without reordering the stock',()=>{
 const r=fixture({0:[51]},{mode:'eightFixed'}),before=r.hands[0].length;r.redKong(0);assert.equal(r.redKongs[0].length,1);assert.equal(r.hands[0].length,before);assert.ok(validStock(r.inventory(),8));
 const stock=r.collectionOrder(),next=new BloodflowRound(seeded(9),{...ruleProfile('eightFixed'),continuation:stock});assert.equal(next.shuffleMethod,'cut');assert.deepEqual(next.initialStock,[...stock.slice(next.cutAt),...stock.slice(0,next.cutAt)]);assert.deepEqual(stock,r.collectionOrder());
});
test('settlement and payer limits are idempotent and cannot invent or overspend coins',()=>{
 const r=fixture({0:[11,14],1:[11,12,13,21,22,23,24,25,26,27,28,29,29]},{walletBound:true,startBalances:[3,10,10,10]});
 assert.equal(r.pay(0,1,99),3);assert.equal(r.available(0),0);assert.equal(r.pay(0,2,20),0);r.end();const scores=r.scores.slice(),rows=r.settlementEvents.slice();r.end();assert.deepEqual(r.scores,scores);assert.deepEqual(r.settlementEvents,rows);assert.equal(r.scores.reduce((a,b)=>a+b,0),0);assert.ok(r.startBalances.every((n,p)=>n+r.scores[p]>=0));
});
test('a capped self-draw shares actual liabilities fairly, including integer remainder and bankrupt payers',()=>{
 const hand=[11,12,13,14,15,16,21,22,23,27,28,29,18,18];
 const r=fixture({0:hand},{walletBound:true,startBalances:[5,10,10,10]});r.lastDraw={player:0,value:18};r.hu(0);
 assert.deepEqual(r.huEvents[0].deltas,[5,-2,-2,-1]);assert.equal(r.scores.reduce((a,b)=>a+b,0),0);
 const bankrupt=fixture({0:hand},{walletBound:true,startBalances:[5,0,10,10]});bankrupt.lastDraw={player:0,value:18};bankrupt.hu(0);assert.deepEqual(bankrupt.huEvents[0].deltas,[4,0,-2,-2]);
});
