import {randomUUID} from 'node:crypto';
import {currencyBalance,setCurrencyBalance} from './currencies.js';

export const REWARD_AMOUNT=30000;
export const DEMO_AD_SECONDS=15;
const UUID=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const DAY=86400000,CHINA_OFFSET=8*3600000;
export const rewardDay=now=>new Date(now+CHINA_OFFSET).toISOString().slice(0,10);

export function createRewardService(store,{accountView,fail,clock=Date.now}={}){
 const requestId=input=>{const id=input?.requestId;if(typeof id!=='string'||!UUID.test(id))fail(400,'奖励请求编号无效');return id;};
 const adView=session=>({id:session.id,mode:'demo',duration:DEMO_AD_SECONDS,watchedSeconds:Math.min(DEMO_AD_SECONDS,Math.floor(session.watchedMs/1000)),status:session.status,expiresAt:new Date(session.expires).toISOString()});
 async function status(tx){const now=clock(),day=rewardDay(now),claimed=await tx.getDailyReward(day);return{daily:{amount:REWARD_AMOUNT,day,claimed:!!claimed,timezone:'Asia/Shanghai',nextResetAt:new Date(Date.parse(day+'T00:00:00Z')+DAY-CHINA_OFFSET).toISOString()},ad:{amount:REWARD_AMOUNT,mode:'demo',duration:DEMO_AD_SECONDS}};}
 async function credit(tx,account,id,kind){
  const previous=await tx.getOperation(id);
  if(previous){if(previous.kind!==kind||previous.currency!=='coins')fail(409,'请求编号已用于其他操作');return previous;}
  const before=currencyBalance(account,'coins'),after=before+REWARD_AMOUNT;
  if(!Number.isSafeInteger(after))fail(422,'金币余额超出支持范围');
  setCurrencyBalance(account,'coins',after);
  const operation={id,kind,currency:'coins',before,after,createdAt:new Date(clock()).toISOString()};
  await tx.saveAccount(account);await tx.addLedger({type:kind,currency:'coins',before,amount:REWARD_AMOUNT,balance:after});await tx.addOperation(operation);
  return operation;
 }
 async function ownedAd(tx,input){
  if(typeof input?.id!=='string'||!UUID.test(input.id))fail(400,'广告观看编号无效');
  const session=await tx.getAdSession(input.id);if(!session)fail(404,'找不到这次广告观看');
  if(session.status!=='completed'&&session.expires<=clock())fail(410,'本次演示广告已过期，请重新观看');
  return session;
 }
 return{
  rewardStatus:accountId=>store.withAccount(accountId,async(tx,account)=>({...accountView(account),rewards:await status(tx)})),
  claimDaily:(accountId,input)=>store.withAccount(accountId,async(tx,account)=>{
   const id=requestId(input),day=rewardDay(clock()),previous=await tx.getOperation(id);
   if(previous){if(previous.kind!=='daily_grant')fail(409,'请求编号已用于其他操作');return{...accountView(account),rewards:await status(tx),operation:previous,alreadyClaimed:true};}
   const claimed=await tx.getDailyReward(day);
   if(claimed)return{...accountView(account),rewards:await status(tx),operation:await tx.getOperation(claimed.operationId),alreadyClaimed:true};
   const operation=await credit(tx,account,id,'daily_grant');
   await tx.saveDailyReward({day,operationId:id,createdAt:operation.createdAt});
   return{...accountView(account),rewards:await status(tx),operation,alreadyClaimed:false};
  }),
  startAd:(accountId,input)=>store.withAccount(accountId,async tx=>{
   const id=requestId(input),previous=await tx.getOperation(id);if(previous)fail(409,'请求编号已用于其他操作');
   let session=await tx.getAdByRequestId(id);
   if(!session)session=await tx.activeAd(clock());
   if(!session){const now=clock();session={id:randomUUID(),requestId:id,watchedMs:0,lastHeartbeat:now,watching:false,status:'watching',expires:now+600000};await tx.saveAdSession(session);}
   if(session.status!=='completed'&&session.expires<=clock())fail(410,'本次演示广告已过期，请重新观看');
   return{ad:adView(session)};
  }),
  progressAd:(accountId,input)=>store.withAccount(accountId,async tx=>{
   const session=await ownedAd(tx,input);if(typeof input.watching!=='boolean')fail(400,'广告播放状态无效');
   if(session.status==='cancelled')fail(410,'本次观看已取消，请重新观看');
   if(session.status==='completed')return{ad:adView(session)};
   const now=clock(),delta=now-session.lastHeartbeat;
   // Only continuous foreground heartbeats count. A long gap or a pause earns no time.
   if(session.watching&&input.watching&&delta>=0&&delta<=2500)session.watchedMs=Math.min(DEMO_AD_SECONDS*1000,session.watchedMs+delta);
   session.lastHeartbeat=now;session.watching=input.watching;await tx.saveAdSession(session);
   return{ad:adView(session)};
  }),
  completeAd:(accountId,input)=>store.withAccount(accountId,async(tx,account)=>{
   const session=await ownedAd(tx,input);
   if(session.status==='cancelled')fail(410,'本次观看已取消，请重新观看');
   if(session.watchedMs<DEMO_AD_SECONDS*1000)fail(409,'请完整观看演示广告后再领取奖励');
   const alreadyClaimed=session.status==='completed',operation=await credit(tx,account,session.id,'ad_grant');
   session.status='completed';session.watching=false;await tx.saveAdSession(session);
   return{...accountView(account),rewards:await status(tx),ad:adView(session),operation,alreadyClaimed};
  }),
  cancelAd:(accountId,input)=>store.withAccount(accountId,async tx=>{
   const session=await ownedAd(tx,input);if(session.status!=='completed'){session.status='cancelled';session.watching=false;await tx.saveAdSession(session);}return{ad:adView(session)};
  })
 };
}
