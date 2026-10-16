import {randomUUID} from 'node:crypto';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
export async function createFileStore(file){
 let data={accounts:{},sessions:{},games:{},ledger:[]},chain=Promise.resolve();
 if(file)try{data=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 data.operations??=[];
 data.dailyRewards??=[];data.adSessions??={};
 for(const account of Object.values(data.accounts)){account.coinBalance??=account.balance;account.diamondBalance??=0;account.signature??='';}
 const operationView=entry=>entry?Object.fromEntries(Object.entries(entry).filter(([key])=>key!=='accountId')):null;
 const locked=fn=>{const work=chain.then(async()=>{const draft=structuredClone(data);const result=await fn(draft);if(file){await mkdir(dirname(file),{recursive:true});await writeFile(file+'.tmp',JSON.stringify(draft));await rename(file+'.tmp',file);}data=draft;return structuredClone(result);});chain=work.catch(()=>{});return work;};
 return{
  health:async()=>{},
  createSession:(hash,balance)=>locked(data=>{const id=randomUUID();data.accounts[id]={id,name:'游客'+id.slice(0,6),signature:'',balance:0,coinBalance:balance,diamondBalance:0};data.sessions[hash]={id,expires:Date.now()+2592000000};return id;}),
  async findSession(hash){await chain;const session=data.sessions[hash];return session&&session.expires>Date.now()?session.id:null;},
  withAccount:(id,callback)=>locked(async data=>{
   const account=data.accounts[id];if(!account)throw Error('Missing account');
   return callback({activeGame:async()=>Object.values(data.games).find(game=>game.accountId===id&&game.status==='active')??null,latestGameForMode:async mode=>Object.values(data.games).filter(game=>game.accountId===id&&game.mode===mode).at(-1)??null,getGame:async roundId=>data.games[roundId]?.accountId===id?data.games[roundId]:null,saveGame:async game=>{data.games[game.id]=game;},saveAccount:async account=>{data.accounts[id]=account;},addLedger:async entry=>{data.ledger.push({...entry,accountId:id});},getOperation:async requestId=>operationView(data.operations.find(entry=>entry.id===requestId&&entry.accountId===id)),addOperation:async entry=>{data.operations.push({...entry,accountId:id});},listOperations:async currency=>data.operations.filter(entry=>entry.accountId===id&&entry.currency===currency).slice(-50).reverse().map(operationView),
    getDailyReward:async day=>data.dailyRewards.find(entry=>entry.accountId===id&&entry.day===day)??null,
    saveDailyReward:async entry=>{data.dailyRewards.push({...entry,accountId:id});},
    getAdSession:async adId=>data.adSessions[adId]?.accountId===id?data.adSessions[adId]:null,
    getAdByRequestId:async requestId=>Object.values(data.adSessions).find(entry=>entry.accountId===id&&entry.requestId===requestId)??null,
    activeAd:async now=>Object.values(data.adSessions).find(entry=>entry.accountId===id&&entry.status==='watching'&&entry.expires>now)??null,
    saveAdSession:async entry=>{data.adSessions[entry.id]={...entry,accountId:id};}
   },account);
  })
 };
}
