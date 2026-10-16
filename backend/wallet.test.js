import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,rmdir,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createFileStore} from './file-store.js';
import {createWalletService} from './wallet-service.js';
import {createWalletApi} from './http-api.js';
import {createPracticeRound,recordRoundActions,replayPracticeRound,replayAction} from '../demo/practice-round.js';
const actor=round=>['exchange','choose'].includes(round.phase)?0:['claim','rob'].includes(round.phase)?Number(Object.keys(round.claim.options).find(seat=>!(seat in round.claim.responses))):round.turn;
function complete(game){const actions=[],round=recordRoundActions(createPracticeRound(game.mode,game.room,game.seed),action=>actions.push(action));for(let i=0;round.phase!=='end'&&i<3000;i++)round.auto(actor(round));assert.equal(round.phase,'end');return{actions,round};}
async function setup(){const store=await createFileStore(),service=createWalletService(store),id=await service.createSession('a'.repeat(64));return{store,service,id};}

test('new guest starts with 30000 and cookie session resolves the same durable account',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'mahjong-wallet-'));
 try{const file=join(directory,'wallet.json'),store=await createFileStore(file),service=createWalletService(store),id=await service.createSession('b'.repeat(64));assert.equal((await service.me(id)).balance,30000);const reopened=createWalletService(await createFileStore(file));assert.equal(await reopened.findSession('b'.repeat(64)),id);assert.equal((await reopened.me(id)).balance,30000);assert.equal(await reopened.findSession('c'.repeat(64)),null);}finally{await rm(join(directory,'wallet.json'),{force:true});await rmdir(directory);}
});
test('only coins are available, refresh is idempotent, arbitrary reset is disabled and retired balances stay intact',async()=>{
 const {store,service,id}=await setup();await store.withAccount(id,async(tx,account)=>{account.balance=99000;account.coinBalance=123;account.diamondBalance=0;await tx.saveAccount(account);});
 const requestId=randomUUID(),results=await Promise.all([service.refresh(id,{currency:'coins',requestId}),service.refresh(id,{currency:'coins',requestId})]);assert.deepEqual(results[0].balances,{coins:123});assert.deepEqual(results[0].operation,results[1].operation);assert.equal((await service.history(id,'coins')).operations.length,1);
 for(const currency of['beans','diamond','cash'])for(const method of['refresh','history'])await assert.rejects(method==='history'?service.history(id,currency):service[method](id,{currency}),error=>error.status===400);
 await assert.rejects(service.reset(id,{}),error=>error.status===410);await store.withAccount(id,async(tx,account)=>{assert.equal(account.balance,99000);assert.equal(account.diamondBalance,0);});
});

test('both engines settle verified actions once, cap losses at zero, and reject altered transcripts',async()=>{
 const {service,id}=await setup();
 for(const [mode,room]of[['classic','beginner'],['sanguo','621']]){
  const started=await service.start(id,{mode,room}),game=started.round,{actions,round}=complete(game);
  await service.sync(id,{id:game.id,actions:actions.slice(0,2)});
  await assert.rejects(service.sync(id,{id:game.id,actions:[{method:'transfer',args:[1,0,999999]},...actions.slice(1,2)]}),error=>[409,422].includes(error.status));
  assert.equal(game.currency,'coins');assert.equal(game.startBalance,started.balance);
  const result=await service.sync(id,{id:game.id,actions,score:999999999});assert.deepEqual(result.balances,{coins:Math.max(0,game.startBalance+round.scores[0])});assert.equal(result.balance,result.balances.coins);assert.equal(result.round.status,'ended');
  const duplicate=await service.sync(id,{id:game.id,actions,close:true});assert.deepEqual(duplicate.balances,result.balances);
  if(result.balances[game.currency]===0)await service.claimDaily(id,{requestId:randomUUID()});
 }
});
test('round ownership and opponent control are enforced and arbitrary score methods are unavailable',async()=>{
 const {service,id}=await setup(),other=await service.createSession('d'.repeat(64)),game=(await service.start(id,{mode:'sanguo',room:'621'})).round;
 await assert.rejects(service.sync(other,{id:game.id,actions:[]}),error=>error.status===404);
 await assert.rejects(service.sync(id,{id:game.id,actions:[{method:'discard',args:[1,0]}]}),error=>error.status===422);
 await assert.rejects(service.sync(id,{id:game.id,actions:[{method:'payHu',args:[0,1,113]}]}),error=>error.status===422);
 await assert.rejects(service.start(id,{mode:'zodiac',room:'556'}),error=>error.status===400);
 assert.equal((await service.me(id)).balance,30000);
});
test('existing coin balances survive the switch and historical bean rounds settle into their original audit currency',async()=>{
 const {store,service,id}=await setup(),game={id:randomUUID(),accountId:id,mode:'classic',room:'beginner',currency:'beans',seed:3,startBalance:99000,actions:[],status:'active',delta:0},done=complete(game);game.actions=done.actions;
 await store.withAccount(id,async(tx,account)=>{account.balance=99000;account.coinBalance=45678;account.diamondBalance=222;await tx.saveAccount(account);await tx.saveGame(game);});
 const left=await service.leave(id);assert.deepEqual(left.balances,{coins:45678});
 await store.withAccount(id,async(tx,account)=>{assert.equal(account.balance,Math.max(0,99000+done.round.scores[0]));assert.equal(account.diamondBalance,222);});
 const started=await service.start(id,{mode:'classic',room:'beginner'});assert.equal(started.round.currency,'coins');assert.equal(started.round.startBalance,45678);
});
test('disabled reset never ends the active game or overwrites its balance',async()=>{
 const {service,id}=await setup(),game=(await service.start(id,{mode:'sanguo',room:'621'})).round;
 for(const currency of['coins','diamond'])await assert.rejects(service.reset(id,{currency}),error=>error.status===410);assert.equal((await service.me(id)).activeRound,game.id);assert.equal((await service.me(id)).balance,30000);
 const actions=[],round=recordRoundActions(createPracticeRound(game.mode,game.room,game.seed),action=>actions.push(action));for(let step=0;step<5&&round.phase!=='end';step++)round.auto(actor(round));await service.sync(id,{id:game.id,actions});const left=await service.leave(id);assert.equal(left.balance,Math.max(0,game.startBalance+round.scores[0]));const repeat=await service.sync(id,{id:game.id,actions,close:true});assert.deepEqual(repeat.balances,left.balances);
});

test('refresh and daily grant save accurate durable records and history stays within the account',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'mahjong-audit-'));try{const file=join(directory,'wallet.json'),store=await createFileStore(file),service=createWalletService(store),id=await service.createSession('e'.repeat(64)),other=await service.createSession('f'.repeat(64));await store.withAccount(id,async(tx,account)=>{account.coinBalance=88888;await tx.saveAccount(account);});const refreshed=await service.refresh(id);assert.equal(refreshed.operation.after,88888);const grant=await service.claimDaily(id,{requestId:randomUUID()});assert.equal(grant.operation.before,88888);assert.equal(grant.operation.after,118888);const reopened=createWalletService(await createFileStore(file));assert.deepEqual((await reopened.me(id)).balances,{coins:118888});assert.equal((await reopened.history(id,'coins')).operations.length,2);assert.equal((await reopened.history(other,'coins')).operations.length,0);const saved=JSON.parse(await readFile(file,'utf8')),ledger=saved.ledger.find(entry=>entry.type==='daily_grant');assert.equal(ledger.amount,30000);assert.equal(ledger.before,88888);assert.equal(ledger.balance,118888);}finally{await rm(join(directory,'wallet.json'),{force:true});await rmdir(directory);}
});

test('auto records only top-level actions and replay matches all state and special-card randomness',()=>{
 for(let seed=0;seed<6;seed++)for(const [mode,room]of[['classic','beginner'],['red','beginner'],['sanguo','621']]){const game={mode,room,seed},{round,actions}=complete(game),replayed=replayPracticeRound(game,actions);assert.ok(actions.every(action=>action.method==='auto'));assert.deepEqual(replayed.scores,round.scores);assert.deepEqual(replayed.hands,round.hands);assert.deepEqual(replayed.melds,round.melds);assert.deepEqual(replayed.unlocks,round.unlocks);}
});
test('leaving commits partial results, forbids a zero-balance new game and allows daily relief afterward',async()=>{
 const {store,service,id}=await setup();let losing;
 for(let seed=0;seed<100&&!losing;seed++){const game={mode:'classic',room:'expert',seed},{round,actions}=complete(game);if(round.scores[0]<0)losing={...game,id:randomUUID(),accountId:id,currency:'coins',startBalance:30000,actions,status:'active',delta:0};}
 assert.ok(losing);await store.withAccount(id,async tx=>tx.saveGame(losing));await assert.rejects(service.start(id,{mode:'classic',room:'beginner'}),error=>error.status===409);assert.equal((await service.me(id)).balance,0);assert.equal((await service.claimDaily(id,{requestId:randomUUID()})).balance,30000);
});
test('HTTP API sets HttpOnly guest cookie, refuses cross-origin reset, exposes no payment endpoints',async()=>{
 const {service}=await setup(),server=http.createServer(createWalletApi(service,{origin:'http://example.test'}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const base='http://127.0.0.1:'+server.address().port,me=await fetch(base+'/demo-api/me'),cookie=me.headers.get('set-cookie');assert.match(cookie,/HttpOnly; SameSite=Lax/);assert.equal((await me.json()).balance,30000);assert.equal((await fetch(base+'/demo-api/balance/reset',{method:'POST',headers:{Origin:'https://other.test','Content-Type':'application/json',Cookie:cookie.split(';')[0]},body:'{}'})).status,403);for(const path of['/deposit','/withdraw','/recharge','/balance/credit'])assert.equal((await fetch(base+'/demo-api'+path)).status,404);}finally{await new Promise(resolve=>server.close(resolve));}
});
test('HTTP exposes daily and demo ad rewards, persists history, rejects retired currencies and disables reset',async()=>{
 const store=await createFileStore();let now=Date.parse('2026-10-10T08:00:00Z');const service=createWalletService(store,{clock:()=>now}),server=http.createServer(createWalletApi(service,{origin:'http://example.test'}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const base='http://127.0.0.1:'+server.address().port,response=await fetch(base+'/demo-api/me'),initial=await response.json(),cookie=response.headers.get('set-cookie').split(';')[0];assert.deepEqual(initial.balances,{coins:30000});assert.equal(initial.resetAllowed,false);const call=async(path,body)=>fetch(base+'/demo-api'+path,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,Origin:'http://example.test','Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 assert.equal((await call('/balance/reset',{})).status,410);assert.equal((await call('/rewards')).status,200);const requestId=randomUUID(),first=await call('/rewards/daily',{requestId});assert.equal(first.status,200);assert.equal((await first.json()).balance,60000);assert.equal((await(await call('/rewards/daily',{requestId:randomUUID()})).json()).balance,60000);const ad=(await(await call('/ads/start',{requestId:randomUUID()})).json()).ad;assert.equal((await call('/ads/complete',{id:ad.id})).status,409);await call('/ads/progress',{id:ad.id,watching:true});for(let i=0;i<15;i++){now+=1000;assert.equal((await call('/ads/progress',{id:ad.id,watching:true})).status,200);}assert.equal((await(await call('/ads/complete',{id:ad.id})).json()).balance,90000);assert.equal((await(await call('/ads/complete',{id:ad.id})).json()).balance,90000);const history=(await(await call('/balance/history')).json()).operations;assert.deepEqual(history.map(row=>row.kind).sort(),['ad_grant','daily_grant']);for(const currency of['beans','diamond','cash'])assert.equal((await call('/balance/refresh',{currency,requestId:randomUUID()})).status,400);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
