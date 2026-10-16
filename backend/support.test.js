import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createFileStore} from './file-store.js';
import {createWalletService} from './wallet-service.js';
import {createWalletApi} from './http-api.js';
import {migrateSupportSchema,checkSupportSchema,SupportSchemaNotReadyError,supportMigrationExitCode} from './migrate-support.js';
import {createPracticeRound,recordRoundActions} from '../demo/practice-round.js';

async function setup(file){const store=await createFileStore(file);let now=Date.parse('2026-10-16T08:00:00Z');const service=createWalletService(store,{clock:()=>now});const id=await service.createSession('a'.repeat(64)),other=await service.createSession('b'.repeat(64));return{store,service,id,other,clock:()=>now,advance:ms=>now+=ms};}
const input=extra=>({requestId:randomUUID(),starLevel:4,tags:['操作体验'],advice:'出牌操作可以更流畅。',contact:'',...extra});
const pending=round=>['exchange','choose'].includes(round.phase)?0:['claim','rob'].includes(round.phase)?Number(Object.keys(round.claim.options).find(seat=>!(seat in round.claim.responses))):round.turn;

function schemaFixture(){
 const account={DATA_TYPE:'char',CHARACTER_MAXIMUM_LENGTH:36,CHARACTER_SET_NAME:'latin1',COLLATION_NAME:'latin1_swedish_ci'};
 const columns=[];
 for(const[table,fields]of Object.entries({
  demo_feedback:[['id','char',36],['account_id','char',36],['request_id','char',36],['star_level','tinyint'],['tags','json'],['advice','varchar',800],['contact','varchar',320],['status','varchar',16],['created_at','timestamp']],
  demo_mail:[['id','char',36],['account_id','char',36],['category','varchar',12],['title','varchar',120],['body','text'],['created_at','timestamp'],['read_at','timestamp']],
 }))for(const[name,type,length]of fields)columns.push({TABLE_NAME:table,COLUMN_NAME:name,DATA_TYPE:type,CHARACTER_MAXIMUM_LENGTH:length??null,CHARACTER_SET_NAME:['advice','contact','title','body'].includes(name)?'utf8mb4':'latin1',COLLATION_NAME:'latin1_swedish_ci',IS_NULLABLE:name==='read_at'?'YES':'NO',DATETIME_PRECISION:type==='timestamp'?3:null});
 const indexes=[];
 for(const[table,name,fields,unique]of [
  ['demo_feedback','PRIMARY',['id'],true],['demo_feedback','account_request',['account_id','request_id'],true],['demo_feedback','account_time',['account_id','created_at','id'],false],
  ['demo_mail','PRIMARY',['id'],true],['demo_mail','account_time',['account_id','created_at','id'],false],['demo_mail','account_unread',['account_id','read_at'],false],
  ['demo_ledger','idx_demo_ledger_history',['account_id','currency','created_at','id'],false],
 ])fields.forEach((column,index)=>indexes.push({TABLE_NAME:table,INDEX_NAME:name,COLUMN_NAME:column,SEQ_IN_INDEX:index+1,NON_UNIQUE:unique?0:1,INDEX_TYPE:'BTREE'}));
 const foreignKeys=['demo_feedback','demo_mail'].map(table=>({TABLE_NAME:table,COLUMN_NAME:'account_id',REFERENCED_TABLE_NAME:'demo_accounts',REFERENCED_COLUMN_NAME:'id'}));
 const reads=[];
 const conn={async execute(sql){reads.push(sql);if(sql.includes("TABLE_NAME='demo_accounts'"))return[[account]];if(sql.includes('information_schema.COLUMNS'))return[columns];if(sql.includes('information_schema.STATISTICS'))return[indexes];if(sql.includes('information_schema.KEY_COLUMN_USAGE'))return[foreignKeys];throw Error('Unexpected query');},async query(){throw Error('Read-only schema check attempted DDL');}};
 return{conn,account,columns,indexes,foreignKeys,reads};
}

test('feedback saves once with a real owned receipt, survives restart and never changes account, game or coins',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'lianzhuo-support-')),file=path.join(directory,'wallet.json');
 try{
  const ctx=await setup(file),game=(await ctx.service.start(ctx.id,{mode:'classic',room:'beginner',rulesVersion:2})).round;
  assert.deepEqual((await ctx.service.mail(ctx.id)).messages,[]);
  const request=input({contact:'contact@example.test'}),responses=await Promise.all(Array.from({length:6},()=>ctx.service.submitFeedback(ctx.id,request)));
  assert.equal(responses.filter(row=>!row.alreadySubmitted).length,1);assert.equal(new Set(responses.map(row=>row.feedback.id)).size,1);
  const inbox=await ctx.service.mail(ctx.id);assert.equal(inbox.messages.length,1);assert.equal(inbox.unreadCount,1);assert.match(inbox.messages[0].body,new RegExp(responses[0].feedback.id));
  const account=await ctx.service.me(ctx.id);assert.equal(account.balance,30000);assert.equal(account.activeRound,game.id);
  assert.equal((await ctx.service.mail(ctx.other)).unreadCount,0);
  await assert.rejects(ctx.service.readMail(ctx.other,{id:inbox.messages[0].id}),error=>error.status===404);
  await assert.rejects(ctx.service.submitFeedback(ctx.id,{...request,advice:'与首次提交不同'}),error=>error.status===409);
  const reopened=createWalletService(await createFileStore(file),{clock:ctx.clock});
  const feedback=await reopened.feedbackHistory(ctx.id);assert.equal(feedback.feedback.length,1);assert.equal(feedback.feedback[0].contact,'contact@example.test');assert.equal(feedback.feedback[0].status,'submitted');
  assert.equal('requestId' in feedback.feedback[0],false);assert.equal('accountId' in feedback.feedback[0],false);
  const read=await reopened.readMail(ctx.id,{id:inbox.messages[0].id});assert.equal(read.updated,1);assert.equal(read.unreadCount,0);
  ctx.advance(1000);const twice=await reopened.readMail(ctx.id,{id:inbox.messages[0].id});assert.equal(twice.updated,0);assert.equal(twice.message.readAt,read.message.readAt);
  const final=createWalletService(await createFileStore(file),{clock:ctx.clock});assert.equal((await final.mail(ctx.id)).messages[0].readAt,read.message.readAt);
  assert.equal((await final.me(ctx.id)).balance,30000);assert.equal((await final.me(ctx.id)).activeRound,game.id);
 }finally{const resolved=path.resolve(directory);assert.ok(resolved.startsWith(path.resolve(tmpdir())+path.sep)&&path.basename(resolved).startsWith('lianzhuo-support-'));await rm(resolved,{recursive:true,force:true});}
});

test('feedback validation and rolling cap are atomic; Unicode limits count code points and retries remain allowed',async()=>{
 const ctx=await setup();
 for(const extra of [{requestId:'bad'},{starLevel:0},{starLevel:6},{starLevel:'4'},{advice:''},{advice:'😀'.repeat(201)},{contact:'字'.repeat(81)},{tags:Array(7).fill('选项')},{tags:[{}]},{advice:'bad\u0000text'}])await assert.rejects(ctx.service.submitFeedback(ctx.id,input(extra)),error=>error.status===400);
 assert.equal((await ctx.service.feedbackHistory(ctx.id)).feedback.length,0);assert.equal((await ctx.service.mail(ctx.id)).unreadCount,0);
 const first=input({advice:'😀'.repeat(200),contact:'字'.repeat(80)});await ctx.service.submitFeedback(ctx.id,first);
 for(let i=0;i<19;i++)await ctx.service.submitFeedback(ctx.id,input({advice:'反馈 '+i}));
 await assert.rejects(ctx.service.submitFeedback(ctx.id,input()),error=>error.status===429);
 assert.equal((await ctx.service.submitFeedback(ctx.id,first)).alreadySubmitted,true);
 assert.equal((await ctx.service.mail(ctx.id)).unreadCount,20);
 await ctx.service.submitFeedback(ctx.other,input());assert.equal((await ctx.service.mail(ctx.other)).unreadCount,1);
 ctx.advance(86400001);await ctx.service.submitFeedback(ctx.id,input());assert.equal((await ctx.service.mail(ctx.id)).unreadCount,21);
});

test('mail and feedback keyset pages have no duplicates; read-all touches only the current account',async()=>{
 const ctx=await setup();for(let i=0;i<5;i++)await ctx.service.submitFeedback(ctx.id,input({advice:'意见 '+i}));await ctx.service.submitFeedback(ctx.other,input());
 let cursor,seen=[];do{const page=await ctx.service.mail(ctx.id,{limit:2,cursor});seen.push(...page.messages.map(row=>row.id));cursor=page.nextCursor;}while(cursor);
 assert.equal(seen.length,5);assert.equal(new Set(seen).size,5);
 const feedbackPage=await ctx.service.feedbackHistory(ctx.id,{limit:2});assert.equal(feedbackPage.feedback.length,2);assert.ok(feedbackPage.nextCursor);
 await assert.rejects(ctx.service.mail(ctx.id,{cursor:feedbackPage.nextCursor}),error=>error.status===400);
 assert.deepEqual((await ctx.service.mail(ctx.id,{category:'reward'})).messages,[]);
 assert.equal((await ctx.service.readMail(ctx.id,{all:true})).updated,5);assert.equal((await ctx.service.readMail(ctx.id,{all:true})).updated,0);
 assert.equal((await ctx.service.mail(ctx.other)).unreadCount,1);
 for(const value of [{},{id:randomUUID(),all:true},{all:'yes'},{id:'invalid'}])await assert.rejects(ctx.service.readMail(ctx.id,value),error=>error.status===400);
});

test('coin history includes verified rounds and grants once, paginates stably and keeps old operations compatibility',async()=>{
 const ctx=await setup();await ctx.service.refresh(ctx.id,{requestId:randomUUID()});ctx.advance(1000);await ctx.service.claimDaily(ctx.id,{requestId:randomUUID()});
 const ad=(await ctx.service.startAd(ctx.id,{requestId:randomUUID()})).ad;await ctx.service.progressAd(ctx.id,{id:ad.id,watching:true});for(let i=0;i<15;i++){ctx.advance(1000);await ctx.service.progressAd(ctx.id,{id:ad.id,watching:true});}await ctx.service.completeAd(ctx.id,{id:ad.id});
 const game=(await ctx.service.start(ctx.id,{mode:'classic',room:'beginner',rulesVersion:2})).round,actions=[],round=recordRoundActions(createPracticeRound(game.mode,game.room,game.seed,{rulesVersion:2,startBalance:game.startBalance,rulesData:game.rulesData}),action=>actions.push(action));
 for(let i=0;round.phase!=='end'&&i<3000;i++)round.auto(pending(round));ctx.advance(1000);await ctx.service.sync(ctx.id,{id:game.id,actions,close:true});
 const whole=await ctx.service.history(ctx.id,'coins');assert.equal(whole.records.length,4);assert.equal(whole.operations.length,3);
 assert.deepEqual(whole.records.map(row=>row.kind).sort(),['ad_grant','daily_grant','refresh','round']);
 const result=whole.records.find(row=>row.kind==='round');assert.equal(result.amount,round.scores[0]);assert.equal(result.after-result.before,result.amount);assert.equal(result.mode,'classic');assert.equal(result.room,'beginner');assert.equal(result.roundId,game.id);
 assert.ok(whole.records.every(row=>!('accountId' in row)&&Number.isSafeInteger(row.amount)));
 assert.deepEqual((await ctx.service.history(ctx.other,'coins')).records,[]);
 const first=await ctx.service.history(ctx.id,'coins',{limit:2});assert.ok(first.nextCursor);
 ctx.advance(1000);await ctx.service.refresh(ctx.id,{requestId:randomUUID()});
 const second=await ctx.service.history(ctx.id,'coins',{limit:2,cursor:first.nextCursor});assert.equal(second.nextCursor,null);
 assert.equal(new Set([...first.records,...second.records].map(row=>row.id)).size,4);
 assert.deepEqual([...first.records,...second.records].map(row=>row.id),whole.records.map(row=>row.id));
 for(const value of [{limit:0},{limit:-1},{limit:51},{limit:'1e2'},{cursor:'invalid!'},{cursor:'a'.repeat(201)}])await assert.rejects(ctx.service.history(ctx.id,'coins',value),error=>error.status===400);
});

test('file-store upgrades old ledger metadata without changing old balances or session identity',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'lianzhuo-support-')),file=path.join(directory,'old.json');
 try{
  const ctx=await setup(file);await ctx.store.withAccount(ctx.id,async(tx,account)=>{account.coinBalance=123456;account.balance=99;account.diamondBalance=7;await tx.saveAccount(account);await tx.addLedger({type:'round',currency:'coins',before:125456,amount:-2000,balance:123456});});
  const data=JSON.parse(await readFile(file));delete data.feedback;delete data.mail;delete data.ledger[0].id;delete data.ledger[0].createdAt;
  await (await import('node:fs/promises')).writeFile(file,JSON.stringify(data));
  const store=await createFileStore(file),service=createWalletService(store);assert.equal(await store.findSession('a'.repeat(64)),ctx.id);assert.equal((await service.me(ctx.id)).balance,123456);
  const history=await service.history(ctx.id,'coins');assert.equal(history.records[0].amount,-2000);assert.equal(history.records[0].createdAt,null);
  await service.submitFeedback(ctx.id,input());await store.withAccount(ctx.id,async(tx,account)=>{assert.equal(account.balance,99);assert.equal(account.diamondBalance,7);assert.equal(account.coinBalance,123456);});
 }finally{const resolved=path.resolve(directory);assert.ok(resolved.startsWith(path.resolve(tmpdir())+path.sep)&&path.basename(resolved).startsWith('lianzhuo-support-'));await rm(resolved,{recursive:true,force:true});}
});

test('HTTP authenticates feedback/mail/history, rejects cross-origin writes and enforces pagination limits',async()=>{
 const ctx=await setup(),origin='http://example.test',server=http.createServer(createWalletApi(ctx.service,{origin}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const base='http://127.0.0.1:'+server.address().port,me=await fetch(base+'/demo-api/me'),cookie=me.headers.get('set-cookie').split(';')[0];assert.match(me.headers.get('set-cookie'),/HttpOnly/);
  const call=(path,body,site=origin)=>fetch(base+'/demo-api'+path,{method:body===undefined?'GET':'POST',headers:{Cookie:cookie,Origin:site,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  assert.equal((await call('/feedback',input(),'https://other.test')).status,403);
  const created=await call('/feedback',input());assert.equal(created.status,200);const result=await created.json();assert.equal(result.alreadySubmitted,false);
  const inbox=await(await call('/mail')).json();assert.equal(inbox.messages.length,1);assert.equal(inbox.unreadCount,1);
  const read=await call('/mail/read',{id:inbox.messages[0].id});assert.equal(read.status,200);assert.equal((await read.json()).unreadCount,0);
  assert.equal((await call('/mail/read',{all:true},'https://other.test')).status,403);
  for(const path of ['/mail?limit=51','/feedback?limit=0','/balance/history?limit=999'])assert.equal((await call(path)).status,400);
  assert.equal((await(await call('/feedback')).json()).feedback[0].id,result.feedback.id);
  assert.ok(Array.isArray((await(await call('/balance/history')).json()).records));
 }finally{await new Promise(resolve=>server.close(resolve));}
});

test('support MySQL migration is additive and retry-safe and preserves foreign-key charset compatibility',async()=>{
 let indexed=false;const statements=[],fixture=schemaFixture();
 const conn={async execute(sql){if(sql.includes("TABLE_NAME='demo_ledger'"))return[indexed?[{INDEX_NAME:'idx_demo_ledger_history'}]:[]];return fixture.conn.execute(sql);},async query(sql){statements.push(sql);if(sql.startsWith('ALTER TABLE demo_ledger'))indexed=true;}};
 await migrateSupportSchema(conn);await migrateSupportSchema(conn);
 assert.equal(statements.filter(sql=>sql.startsWith('ALTER TABLE')).length,1);
 assert.ok(statements.filter(sql=>sql.startsWith('CREATE TABLE IF NOT EXISTS')).every(sql=>sql.includes('account_id CHAR(36) CHARACTER SET latin1 COLLATE latin1_swedish_ci')));
 assert.ok(statements.every(sql=>!/\b(?:UPDATE|DELETE|DROP|TRUNCATE|REPLACE)\b/i.test(sql)));
});

test('read-only support schema check verifies every required column, ownership constraints and full ledger index',async()=>{
 const fixture=schemaFixture(),result=await checkSupportSchema(fixture.conn);assert.equal(result.ok,true);assert.equal(result.ledgerHistoryIndex,'idx_demo_ledger_history');assert.ok(fixture.reads.every(sql=>sql.startsWith('SELECT ')));
 for(const table of ['demo_feedback','demo_mail'])for(const removed of fixture.columns.filter(column=>column.TABLE_NAME===table)){
  const incomplete=schemaFixture();incomplete.columns.splice(incomplete.columns.findIndex(column=>column.TABLE_NAME===table&&column.COLUMN_NAME===removed.COLUMN_NAME),1);
  await assert.rejects(checkSupportSchema(incomplete.conn),new RegExp(table+'\\.'+removed.COLUMN_NAME));
 }
 const wrongCharset=schemaFixture();wrongCharset.columns.find(column=>column.TABLE_NAME==='demo_mail'&&column.COLUMN_NAME==='body').CHARACTER_SET_NAME='latin1';await assert.rejects(checkSupportSchema(wrongCharset.conn),/UTF-8/);
 const badIndex=schemaFixture();badIndex.indexes.splice(badIndex.indexes.findIndex(index=>index.TABLE_NAME==='demo_ledger'&&index.COLUMN_NAME==='id'),1);await assert.rejects(checkSupportSchema(badIndex.conn),/金币历史索引/);
 const noIdempotency=schemaFixture();noIdempotency.indexes.filter(index=>index.INDEX_NAME==='account_request').forEach(index=>index.NON_UNIQUE=1);await assert.rejects(checkSupportSchema(noIdempotency.conn),/demo_feedback/);
 const noOwner=schemaFixture();noOwner.foreignKeys.pop();await assert.rejects(checkSupportSchema(noOwner.conn),/账户外键/);
 assert.equal(supportMigrationExitCode(new SupportSchemaNotReadyError('Missing column'),true),2);
 assert.equal(supportMigrationExitCode(new SupportSchemaNotReadyError('Migration still incomplete'),false),1);
 for(const code of ['ER_ACCESS_DENIED_ERROR','ER_TABLEACCESS_DENIED_ERROR','ECONNREFUSED','ETIMEDOUT']){const error=new Error('Driver error');error.code=code;assert.equal(supportMigrationExitCode(error,true),1);}
});
