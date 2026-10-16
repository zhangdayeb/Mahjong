// Client/service contract verification. No production server, database or saved
// local wallet is used; the wallet store exists only in memory for this process.
import assert from 'node:assert/strict';
import http from 'node:http';
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir,readdir,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createFileStore} from '../../backend/file-store.js';
import {createWalletService} from '../../backend/wallet-service.js';
import {createWalletApi} from '../../backend/http-api.js';
import {replayPracticeRound} from '../../demo/practice-round.js';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(import.meta.url);

async function typescriptRuntime(){
 try{const installed=await import('typescript');return installed.default||installed;}catch(error){if(error.code!=='ERR_MODULE_NOT_FOUND'&&error.code!=='MODULE_NOT_FOUND')throw error;}
 const roots=[
  process.env.COCOS_CREATOR_EXE?path.dirname(path.resolve(process.env.COCOS_CREATOR_EXE)):null,
  process.env.COCOS_CREATOR_PATH?path.resolve(process.env.COCOS_CREATOR_PATH):null,
  'C:/ProgramData/cocos/editors/Creator/3.8.8',
  '/Applications/Cocos/Creator/3.8.8/CocosCreator.app/Contents',
 ].filter(Boolean);
 const candidates=roots.flatMap(root=>[
  path.join(root,'resources/app.asar.unpacked/node_modules/typescript/lib/typescript.js'),
  path.join(root,'Resources/app.asar.unpacked/node_modules/typescript/lib/typescript.js'),
  path.join(root,'../Resources/app.asar.unpacked/node_modules/typescript/lib/typescript.js'),
 ]);
 for(const candidate of candidates){
  try{return require(candidate);}catch(error){if(error.code!=='MODULE_NOT_FOUND')throw error;}
 }
 throw Error('找不到 TypeScript。请安装 typescript，或设置 COCOS_CREATOR_EXE / COCOS_CREATOR_PATH 指向 Creator 3.8.8。');
}

async function compileServices(ts,output){
 await writeFile(path.join(output,'package.json'),'{"type":"commonjs"}\n');
 async function compile(directory,relative){
  for(const entry of await readdir(directory,{withFileTypes:true})){
   const rel=path.join(relative,entry.name),source=path.join(directory,entry.name);
   if(entry.isDirectory()){await compile(source,rel);continue;}
   if(!entry.name.endsWith('.ts'))continue;
   const result=ts.transpileModule(await readFile(source,'utf8'),{
    fileName:source,reportDiagnostics:true,
    compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS},
   });
   const errors=result.diagnostics?.filter(diagnostic=>diagnostic.category===ts.DiagnosticCategory.Error)||[];
   if(errors.length)throw Error(ts.formatDiagnosticsWithColorAndContext(errors,{getCurrentDirectory:()=>repo,getCanonicalFileName:file=>file,getNewLine:()=> '\n'}));
   const target=path.join(output,rel.replace(/\.ts$/,'.js'));
   await mkdir(path.dirname(target),{recursive:true});await writeFile(target,result.outputText);
  }
 }
 for(const folder of ['services','rules'])await compile(path.join(repo,'creator/assets/scripts',folder),folder);
}

async function verifyOrigins(WalletClient){
 const previousLocation=globalThis.location,previousFetch=globalThis.fetch;
 try{
  for(const host of ['localhost','127.0.0.1']){
   globalThis.location=new URL(`http://${host}:7456/`);let captured;
   globalThis.fetch=async(input,options)=>{captured={input,options};return Response.json({id:'preview',name:'预览',balance:30000,balances:{coins:30000}});};
   await new WalletClient().load();
   assert.equal(captured.input,`http://${host}:8780/demo-api/me`);
   assert.equal(captured.options.credentials,'include');
   const other=host==='localhost'?'127.0.0.1':'localhost';
   for(const baseUrl of [
    `http://${other}:8780/demo-api`,`http://${host}:8770/demo-api`,
    `http://${host}:8780/other`,`https://${host}:8780/demo-api`,
    `http://${host}:8780/demo-api?redirect=1`,`http://user:pass@${host}:8780/demo-api`,
    'https://example.test/demo-api',
   ])assert.throws(()=>new WalletClient({baseUrl}),undefined,'Unexpected cross-origin preview endpoint');
  }
  for(const page of ['https://example.test/hall','http://localhost:8780/','https://localhost:7456/','http://localhost.evil:7456/']){
   globalThis.location=new URL(page);let captured;
   globalThis.fetch=async(input,options)=>{captured={input,options};return Response.json({id:'same-origin',name:'预览',balance:30000,balances:{coins:30000}});};
   await new WalletClient().load();
   assert.equal(captured.input,'/demo-api/me');assert.equal(captured.options.credentials,'same-origin');
   assert.throws(()=>new WalletClient({baseUrl:'http://127.0.0.1:8780/demo-api'}));
  }
 }finally{
  if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;
  globalThis.fetch=previousFetch;
 }
}

async function verifyHttp(WalletClient,requestId,GameSession,PLAYABLE_MODES){
 // Omitting a file path makes this store entirely in-memory.
 const store=await createFileStore();let now=Date.parse('2026-10-16T10:00:00Z');
 const service=createWalletService(store,{clock:()=>now});let handler;
 const server=http.createServer((req,res)=>handler(req,res));
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const origin='http://127.0.0.1:'+server.address().port;
 handler=createWalletApi(service,{origin});
 const originalFetch=globalThis.fetch,originalDocument=globalThis.document;
 let cookie='',failSync=false,gate=null;const payloads=[];
 // Node has no browser cookie jar; emulate only the current synthetic guest.
 // Cookies, account IDs and tokens are never written or printed.
 globalThis.fetch=async(input,options={})=>{
  const url=new URL(input,origin);
  assert.equal(url.origin,origin,'The verifier must never contact a non-test server');
  const headers={...(options.headers||{}),Origin:origin};if(cookie)headers.Cookie=cookie;
  if(url.pathname.endsWith('/round/sync')){
   if(failSync)throw Error('Simulated disconnect');
   payloads.push(JSON.parse(options.body));if(gate)await gate;
  }
  const response=await originalFetch(url,{...options,headers});
  const received=response.headers.get('set-cookie');if(received)cookie=received.split(';')[0];
  return response;
 };
 let completed=0,actions=0;
 try{
  assert.deepEqual(new Set(PLAYABLE_MODES),new Set(['classic','red','exchange','six','sixFixed','crazy','eightFixed']));
  for(const mode of PLAYABLE_MODES){
   cookie='';const wallet=new WalletClient();let ended=0;
   const game=new GameSession(wallet,{onEnd:()=>ended++});
   await wallet.enterLobby();await game.start(mode,'beginner');
   assert.deepEqual(game.account.balances,{coins:30000});
   let saved;await store.withAccount(wallet.account.id,async tx=>{saved=await tx.getGame(game.id);});
   assert.equal(saved.rulesVersion,2);assert.ok(Number.isInteger(saved.seed));assert.ok(saved.rulesData.startBalances);
   game.auto=true;
   for(let index=0;game.round.phase!=='end'&&index<3000;index++){
    assert.ok(game.stepBots(),`Stalled ${mode} ${game.round.phase}`);
    if(index%70===0)await game.flush();
   }
   assert.equal(game.round.phase,'end');await game.finish();await game.flush();assert.equal(ended,1);
   const replay=replayPracticeRound(saved,game.actions);
   assert.deepEqual(replay.scores,game.round.scores);assert.deepEqual(replay.hands,game.round.hands);
   assert.deepEqual(replay.melds,game.round.melds);assert.deepEqual(replay.settlementEvents,game.round.settlementEvents);
   assert.equal(game.account.balance,Math.max(0,game.startBalance+replay.scores[0]));
   assert.ok(game.closed);assert.ok(game.actions.every(action=>action.method==='auto'));
   actions+=game.actions.length;completed++;await game.dispose();
  }
  cookie='';const wallet=new WalletClient(),game=new GameSession(wallet);
  await game.start();assert.ok(game.perform('choose',[1]));
  failSync=true;await assert.rejects(game.flush());const transcript=game.actions;
  assert.ok(game.syncError);assert.equal(game.perform('auto',[0]),false);assert.deepEqual(game.actions,transcript);
  failSync=false;await game.flush();assert.equal(game.syncError,null);assert.ok(game.perform('auto',[0]));
  let release;gate=new Promise(resolve=>release=resolve);const syncing=game.flush();
  game.auto=true;assert.ok(game.stepBots());const closing=game.finish();
  release();gate=null;await Promise.all([syncing,closing]);
  assert.ok(game.closed);assert.deepEqual(payloads.at(-1).actions,game.actions);assert.equal(payloads.at(-1).close,true);
  await store.withAccount(wallet.account.id,async tx=>{assert.deepEqual((await tx.getGame(game.id)).actions,game.actions);});
  assert.equal(game.account.balance,Math.max(0,game.startBalance+game.round.scores[0]));await game.dispose();

  await wallet.saveSignature('联桌同乐');assert.equal(wallet.account.signature,'联桌同乐');
  await assert.rejects(wallet.saveSignature('字'.repeat(41)),error=>error.status===400);
  const dailyBefore=wallet.account.balance;
  assert.equal((await wallet.claimDaily()).alreadyClaimed,false);assert.equal(wallet.account.balance,dailyBefore+30000);
  assert.equal((await wallet.claimDaily()).alreadyClaimed,true);assert.equal(wallet.account.balance,dailyBefore+30000);
  now+=86400000;assert.equal((await wallet.rewards()).daily.claimed,false);
  assert.equal((await wallet.claimDaily()).alreadyClaimed,false);assert.equal(wallet.account.balance,dailyBefore+60000);
  await wallet.claimDaily();assert.equal(wallet.account.balance,dailyBefore+60000);

  let hidden=true,focused=false;
  globalThis.document={get hidden(){return hidden;},hasFocus:()=>focused};
  await wallet.startAd();await assert.rejects(wallet.completeAd(),error=>error.status===409);
  for(let second=0;second<4;second++){now+=1000;await wallet.progressAd();}
  assert.equal(wallet.activeAd.watchedSeconds,0);
  hidden=false;
  for(let second=0;second<4;second++){now+=1000;await wallet.progressAd();}
  assert.equal(wallet.activeAd.watchedSeconds,0,'A visible but unfocused page must not accrue ad time');
  focused=true;await wallet.progressAd();
  for(let second=0;second<15;second++){now+=1000;await wallet.progressAd();}
  assert.equal(wallet.activeAd.watchedSeconds,15);
  const ad=await wallet.completeAd();assert.equal(ad.operation.after-ad.operation.before,30000);assert.equal(wallet.activeAd,null);
  const history=await wallet.history();
  assert.equal(history.filter(row=>row.kind==='daily_grant').length,2);assert.equal(history.filter(row=>row.kind==='ad_grant').length,1);
  const adBalance=wallet.account.balance,cancelled=await wallet.startAd();
  await wallet.cancelAd();assert.equal(wallet.activeAd,null);
  await assert.rejects(wallet.request('/ads/complete',{id:cancelled.id}),error=>error.status===410);
  assert.equal((await wallet.refresh()).balance,adBalance);
  assert.match(requestId(),/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i);
  return{fullRounds:completed,recordedActions:actions};
 }finally{
  globalThis.fetch=originalFetch;
  if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;
  await new Promise(resolve=>server.close(resolve));
 }
}

const ts=await typescriptRuntime();
const output=await mkdtemp(path.join(tmpdir(),'lianzhuo-creator-services-'));
try{
 await compileServices(ts,output);
 const {WalletClient,requestId}=require(path.join(output,'services/WalletClient.js'));
 const {GameSession,PLAYABLE_MODES}=require(path.join(output,'services/GameSession.js'));
 await verifyOrigins(WalletClient);
 const result=await verifyHttp(WalletClient,requestId,GameSession,PLAYABLE_MODES);
 console.log(JSON.stringify({ok:true,...result,verified:[
  'Creator localhost/127.0.0.1:7456 preview whitelist','production same-origin restriction',
  'all seven modes with server seed/rulesData replay','partial synchronization and exit tail actions',
  'network failure input lock and recovery','onEnd exactly once','single coin balance',
  'signature validation','daily reward idempotency and next-day grant',
  '15-second foreground demonstration ad','unfocused/hidden ad pause','cancelled ad receives no reward',
 ]},null,2));
}finally{
 const relative=path.relative(tmpdir(),output);
 if(!relative.startsWith('lianzhuo-creator-services-')||relative.includes(path.sep)||path.isAbsolute(relative))throw Error('Invalid temporary cleanup path');
 await rm(output,{recursive:true,force:true});
}
