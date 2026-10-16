import {randomUUID,randomBytes} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {INITIAL_BALANCE,practiceConfig,replayPracticeRound} from '../demo/practice-round.js';
import {CURRENCIES,currencyForMode,currencyBalance,setCurrencyBalance} from './currencies.js';
import {ruleProfile} from '../demo/rule-profiles.js';
import {validStock} from '../demo/bloodflow-round.js';
import {normalizeSignature} from '../demo/profile-signature-model.js';
import {createRewardService} from './reward-service.js';
export class WalletError extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new WalletError(status,message);};
export function createWalletService(store,options={}){
 function accountView(account){return{id:account.id,name:account.name,signature:account.signature||'',balance:currencyBalance(account,'coins'),balances:{coins:currencyBalance(account,'coins')},currency:'coins',currencyName:'金币',resetAllowed:false,payments:false};}
 function operationInput({currency='coins',requestId=randomUUID()}={}){if(!CURRENCIES.includes(currency)||typeof requestId!=='string'||!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(requestId))fail(400,'余额操作参数无效');return{currency,requestId};}
 async function existingOperation(tx,requestId,kind,currency){const previous=await tx.getOperation(requestId);if(previous&&(previous.kind!==kind||previous.currency!==currency))fail(409,'操作编号已用于其他余额操作');return previous;}
 async function closeGame(tx,account,game){
  if(game.status!=='active')return;
  const round=replayPracticeRound(game),delta=round.scores[0];
  const currency=game.currency||(game.mode==='sanguo'?'coins':'beans'),before=currencyBalance(account,currency),after=Math.max(0,before+delta);
  if(!Number.isSafeInteger(after))fail(422,'积分超出支持范围');
  setCurrencyBalance(account,currency,after);
  game.status=round.phase==='end'?'ended':'closed';game.delta=delta;
  if(game.rulesVersion===2)game.resultData={scores:round.scores,huEvents:round.huEvents,kongPayments:round.kongPayments,settlementEvents:round.settlementEvents,stockOrder:round.collectionOrder(),shuffleMethod:round.shuffleMethod,cutAt:round.cutAt};
  await tx.saveGame(game);await tx.saveAccount(account);await tx.addLedger({type:'round',roundId:game.id,currency,before,amount:after-before,balance:after});
 }
 return{
  ...createRewardService(store,{accountView,fail,...options}),
  createSession:tokenHash=>store.createSession(tokenHash,INITIAL_BALANCE),
  findSession:tokenHash=>store.findSession(tokenHash),
  health:()=>store.health(),
  updateSignature:(accountId,{signature}={})=>store.withAccount(accountId,async(tx,account)=>{let text;try{text=normalizeSignature(signature);}catch(error){fail(400,error.message);}account.signature=text;await tx.saveAccount(account);return accountView(account);}),
  me:accountId=>store.withAccount(accountId,async(tx,account)=>{const active=await tx.activeGame();return{...accountView(account),activeRound:active?.id??null};}),
  leave:accountId=>store.withAccount(accountId,async(tx,account)=>{const active=await tx.activeGame();if(active)await closeGame(tx,account,active);return accountView(account);}),
  refresh:(accountId,input)=>store.withAccount(accountId,async(tx,account)=>{
   const {currency,requestId}=operationInput(input),previous=await existingOperation(tx,requestId,'refresh',currency);
   const balance=currencyBalance(account,currency),operation=previous||{id:requestId,kind:'refresh',currency,before:balance,after:balance,createdAt:new Date().toISOString()};
   if(!previous)await tx.addOperation(operation);return{...accountView(account),operation};
  }),
  history:(accountId,currency)=>store.withAccount(accountId,async tx=>{if(!CURRENCIES.includes(currency))fail(400,'币种无效');return{operations:await tx.listOperations(currency)};}),
  async reset(){fail(410,'随时重置已取消，请领取每日救济金或观看演示广告获得金币');},
  async start(accountId,{mode,room,rulesVersion=1}){const result=await store.withAccount(accountId,async(tx,account)=>{
   let config;try{config=practiceConfig(mode,room,rulesVersion);}catch(error){fail(400,error.message);}
   const old=await tx.activeGame();if(old)await closeGame(tx,account,old);
   const currency=currencyForMode(config.mode),balance=currencyBalance(account,currency);if(balance<=0)return{blocked:true};
   const game={id:randomUUID(),accountId,currency,seed:randomBytes(4).readUInt32LE(),mode:config.mode,room:config.room,startBalance:balance,rulesVersion,rulesData:null,resultData:null,createdAt:new Date().toISOString(),actions:[],status:'active',delta:0};
   if(rulesVersion===2){const profile=ruleProfile(mode);game.rulesData={startBalances:[balance,750000,235000,437000],continuation:null};if(profile.noShuffle){const previous=await tx.latestGameForMode(mode);if(previous?.rulesVersion===2){const order=previous.resultData?.stockOrder||replayPracticeRound(previous).collectionOrder();if(validStock(order,profile.jokerCount))game.rulesData.continuation=order;}}}
   await tx.saveGame(game);return{...accountView(account),round:{id:game.id,seed:game.seed,mode:game.mode,room:game.room,currency:game.currency,startBalance:game.startBalance,rulesVersion:game.rulesVersion,rulesData:game.rulesData,sequence:0}};
  });if(result.blocked)fail(409,'余额已用完，请领取每日救济金或在个人中心观看广告获得金币');return result;},
  sync:(accountId,{id,actions,close=false})=>store.withAccount(accountId,async(tx,account)=>{
   if(typeof id!=='string'||!Array.isArray(actions)||actions.length>3000||typeof close!=='boolean')fail(400,'牌局同步参数无效');
   const game=await tx.getGame(id);if(!game)fail(404,'找不到这局练习');
   if(actions.length<game.actions.length||game.actions.some((action,index)=>!isDeepStrictEqual(action,actions[index])))fail(409,'牌局操作顺序不一致');
   if(game.status!=='active'){
    if(actions.length!==game.actions.length)fail(409,'这局练习已经结算，请重新开局');
    return{...accountView(account),round:{id:game.id,sequence:game.actions.length,status:game.status,delta:game.delta}};
   }
   let round;try{round=replayPracticeRound(game,actions);}catch(error){fail(422,'牌局校验失败：'+error.message);}
   game.actions=actions;await tx.saveGame(game);
   if(close||round.phase==='end')await closeGame(tx,account,game);
   return{...accountView(account),round:{id:game.id,sequence:actions.length,status:game.status,delta:round.scores[0]},displayBalance:game.status==='active'?Math.max(0,currencyBalance(account,game.currency)+round.scores[0]):currencyBalance(account,game.currency)};
  })
 };
}
