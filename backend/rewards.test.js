import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,rmdir,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createFileStore} from './file-store.js';
import {createWalletService} from './wallet-service.js';
import {DEMO_AD_SECONDS} from './reward-service.js';

async function setup(file){const store=await createFileStore(file);let now=Date.parse('2026-10-10T08:00:00Z');const service=createWalletService(store,{clock:()=>now}),id=await service.createSession('r'.repeat(64));return{store,service,id,advance:ms=>now+=ms,clock:()=>now};}
async function watch(context,id=context.id){const value=await context.service.startAd(id,{requestId:randomUUID()}),adId=value.ad.id;await context.service.progressAd(id,{id:adId,watching:true});for(let i=0;i<DEMO_AD_SECONDS;i++){context.advance(1000);await context.service.progressAd(id,{id:adId,watching:true});}return adId;}

test('concurrent daily claims add 30000 once, preserve other balances and disable arbitrary reset',async()=>{
 const {store,service,id}=await setup();await store.withAccount(id,async(tx,account)=>{account.balance=123;account.diamondBalance=456;await tx.saveAccount(account);});
 const claims=await Promise.all(Array.from({length:8},()=>service.claimDaily(id,{requestId:randomUUID()})));assert.ok(claims.every(value=>value.balance===60000));assert.equal(claims.filter(value=>!value.alreadyClaimed).length,1);assert.equal((await service.history(id,'coins')).operations.length,1);
 await assert.rejects(service.reset(id,{}),error=>error.status===410);await store.withAccount(id,async(tx,account)=>{assert.equal(account.balance,123);assert.equal(account.diamondBalance,456);});
});
test('China midnight permits a new daily grant; old request retries never grant again',async()=>{
 const ctx=await setup();ctx.advance(Date.parse('2026-10-10T15:59:59Z')-ctx.clock());const requestId=randomUUID();const first=await ctx.service.claimDaily(ctx.id,{requestId});assert.equal(first.rewards.daily.day,'2026-10-10');assert.equal(first.rewards.daily.nextResetAt,'2026-10-10T16:00:00.000Z');
 ctx.advance(2000);const next=await ctx.service.rewardStatus(ctx.id);assert.equal(next.rewards.daily.claimed,false);await ctx.service.claimDaily(ctx.id,{requestId});assert.equal((await ctx.service.me(ctx.id)).balance,60000);await ctx.service.claimDaily(ctx.id,{requestId:randomUUID()});assert.equal((await ctx.service.me(ctx.id)).balance,90000);
});
test('reward request IDs cannot reuse another operation and accounts have separate daily limits',async()=>{
 const {service,id}=await setup(),requestId=randomUUID(),other=await service.createSession('o'.repeat(64));await service.refresh(id,{requestId});await assert.rejects(service.claimDaily(id,{requestId}),error=>error.status===409);assert.equal((await service.me(id)).balance,30000);await service.claimDaily(id,{requestId:randomUUID()});assert.equal((await service.rewardStatus(other)).rewards.daily.claimed,false);await assert.rejects(service.claimDaily(id,{requestId:'invalid'}),error=>error.status===400);
});
test('ad completion requires server-counted viewing, prevents cross-account access and credits only once',async()=>{
 const ctx=await setup(),other=await ctx.service.createSession('o'.repeat(64)),requestId=randomUUID();const ad=(await ctx.service.startAd(ctx.id,{requestId})).ad;assert.equal((await ctx.service.startAd(ctx.id,{requestId})).ad.id,ad.id);
 await assert.rejects(ctx.service.completeAd(other,{id:ad.id}),error=>error.status===404);await assert.rejects(ctx.service.completeAd(ctx.id,{id:ad.id,watchedSeconds:99999}),error=>error.status===409);
 await ctx.service.progressAd(ctx.id,{id:ad.id,watching:true});for(let i=0;i<15;i++){ctx.advance(1000);await ctx.service.progressAd(ctx.id,{id:ad.id,watching:true});}
 const claims=await Promise.all(Array.from({length:5},()=>ctx.service.completeAd(ctx.id,{id:ad.id})));assert.ok(claims.every(value=>value.balance===60000));assert.equal(claims.filter(value=>!value.alreadyClaimed).length,1);const operations=(await ctx.service.history(ctx.id,'coins')).operations;assert.equal(operations.length,1);assert.equal(operations[0].kind,'ad_grant');assert.equal(operations[0].after-operations[0].before,30000);
 const another=await watch(ctx);await ctx.service.completeAd(ctx.id,{id:another});assert.equal((await ctx.service.me(ctx.id)).balance,90000);
});
test('background gaps, pauses, expired sessions and early exits earn no ad reward',async()=>{
 const ctx=await setup(),ad=(await ctx.service.startAd(ctx.id,{requestId:randomUUID()})).ad;await ctx.service.progressAd(ctx.id,{id:ad.id,watching:true});ctx.advance(20000);assert.equal((await ctx.service.progressAd(ctx.id,{id:ad.id,watching:true})).ad.watchedSeconds,0);ctx.advance(1000);assert.equal((await ctx.service.progressAd(ctx.id,{id:ad.id,watching:false})).ad.watchedSeconds,0);ctx.advance(1000);assert.equal((await ctx.service.progressAd(ctx.id,{id:ad.id,watching:true})).ad.watchedSeconds,0);
 await ctx.service.cancelAd(ctx.id,{id:ad.id});await assert.rejects(ctx.service.completeAd(ctx.id,{id:ad.id}),error=>error.status===410);assert.equal((await ctx.service.me(ctx.id)).balance,30000);
 const next=(await ctx.service.startAd(ctx.id,{requestId:randomUUID()})).ad;ctx.advance(600001);await assert.rejects(ctx.service.completeAd(ctx.id,{id:next.id}),error=>error.status===410);
});
test('grants and ad sessions persist across service restart with accurate ledger amounts',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'mahjong-rewards-')),file=join(directory,'wallet.json');
 try{const ctx=await setup(file);await ctx.service.claimDaily(ctx.id,{requestId:randomUUID()});const adId=await watch(ctx);const reopened=createWalletService(await createFileStore(file),{clock:ctx.clock});await reopened.completeAd(ctx.id,{id:adId});await reopened.completeAd(ctx.id,{id:adId});assert.equal((await reopened.me(ctx.id)).balance,90000);assert.equal((await reopened.rewardStatus(ctx.id)).rewards.daily.claimed,true);const data=JSON.parse(await readFile(file));assert.deepEqual(data.ledger.map(row=>[row.type,row.amount,row.before,row.balance]),[['daily_grant',30000,30000,60000],['ad_grant',30000,60000,90000]]);}
 finally{await rm(file,{force:true});await rmdir(directory);}
});
test('a reward during a game preserves the round and survives later settlement',async()=>{
 const ctx=await setup(),round=(await ctx.service.start(ctx.id,{mode:'sanguo',room:'621'})).round;await ctx.service.claimDaily(ctx.id,{requestId:randomUUID()});assert.equal((await ctx.service.me(ctx.id)).activeRound,round.id);const sync=await ctx.service.sync(ctx.id,{id:round.id,actions:[]});assert.equal(sync.displayBalance,60000);await ctx.service.leave(ctx.id);assert.equal((await ctx.service.me(ctx.id)).balance,60000);
});
