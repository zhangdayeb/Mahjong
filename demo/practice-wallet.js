import {createPracticeRound,recordRoundActions,INITIAL_BALANCE} from './practice-round.js';
import {watchDemoAd} from './demo-ad.js';
import {playGameSound} from './game-audio.js';
let account=null,loading=null,dialog=null,activeMatch=null,dialogCurrency='coins',walletBusy=false,rewardStatus=null;
export const WALLET_CURRENCIES=['coins'];
const currencyNames={coins:'金币'};
const subscribers=new Set();
export function formatPracticeBalance(value){return Number.isFinite(value)?String(value):'—';}
function receive(value){if(value.rewards)rewardStatus=value.rewards;account={id:value.id,name:value.name,signature:value.signature??'',balance:value.balances?.coins??value.balance,balances:{coins:value.balances?.coins??value.balance}};for(const callback of subscribers)callback(account);if(dialog?.open)renderDialog();return account;}
async function request(path,body){
 const response=await fetch('/demo-api'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),cache:'no-store'});
 const data=await response.json();if(!response.ok){const error=Error(data.error||'余额服务暂时不可用');error.status=response.status;throw error;}return data;
}
export const practiceWallet={
 get account(){return account;},get match(){return activeMatch;},
 async load(){loading??=request('/me').then(receive).catch(error=>{loading=null;throw error;});return loading;},
 async refresh(currency){return receive(await request(currency?'/balance/refresh':'/me',currency?{currency,requestId:crypto.randomUUID()}:undefined));},
 async saveSignature(signature){return receive(await request('/profile/signature',{signature}));},
 async enterLobby(){await this.load();receive(await request('/round/leave',{}));return account;},
 subscribe(callback){subscribers.add(callback);if(account)callback(account);return()=>subscribers.delete(callback);},
 async rewards(){const value=await request('/rewards');receive(value);return value.rewards;},
 async claimDaily(){const value=await request('/rewards/daily',{requestId:crypto.randomUUID()});receive(value);if(rewardWasCredited(value))void playGameSound('coin',.5);return value;},
 async watchAd(){await this.load();ensureDialog();return watchDemoAd({start:()=>request('/ads/start',{requestId:crypto.randomUUID()}),progress:body=>request('/ads/progress',body),complete:body=>request('/ads/complete',body),cancel:body=>request('/ads/cancel',body),onReward:value=>{receive(value);if(rewardWasCredited(value))void playGameSound('coin',.5);if(dialog.open)void loadHistory('coins');}});},
 async show(currency='coins'){dialogCurrency=WALLET_CURRENCIES.includes(currency)?currency:'coins';ensureDialog();dialog.setAttribute('aria-label',currencyNames[dialogCurrency]+'余额管理');if(!dialog.open)dialog.showModal();dialog.querySelector('.wallet-history').open=false;renderDialog();try{await this.rewards();await loadHistory(dialogCurrency);}catch(error){dialog.querySelector('.wallet-message').textContent=error.message;}},
 async navigate(url){try{await activeMatch?.finish();location.href=url;}catch(error){ensureDialog();dialog.showModal();renderDialog();dialog.querySelector('.wallet-message').textContent=error.message;}},
 async start(mode,room,onError=()=>{}){
  await this.load();if(activeMatch)await activeMatch.finish();
  let value;try{value=await request('/round/start',{mode,room:String(room),rulesVersion:2});}catch(error){if(error.status===409)void this.show('coins');throw error;}
  receive(value);const actions=[];let timer=null,inflight=null,closed=false,pendingClose=false,failed=null;
  const info=value.round;
  const match={id:info.id,currency:info.currency||'coins',startBalance:info.startBalance,round:null,get syncError(){return failed;},get closed(){return closed;},get actions(){return structuredClone(actions);},
   async flush(){
    clearTimeout(timer);if(inflight){await inflight;if(closed)return;}
    if(closed)return;
    const count=actions.length,close=pendingClose,payload={id:info.id,actions:structuredClone(actions),close};
    const work=request('/round/sync',payload).then(response=>{failed=null;receive(response);closed=response.round.status!=='active';return response;}).catch(error=>{failed=error;onError(error);throw error;});inflight=work;
    try{await work;}finally{if(inflight===work)inflight=null;}
    if(!closed&&(actions.length>count||pendingClose&&!close))return match.flush();
   },
   async finish(){pendingClose=true;await match.flush();if(activeMatch===match)activeMatch=null;},
   beacon(){if(closed)return;const payload=JSON.stringify({id:info.id,actions,close:true});navigator.sendBeacon?.('/demo-api/round/sync',new Blob([payload],{type:'application/json'}));}
  };
  match.round=recordRoundActions(createPracticeRound(info.mode,info.room,info.seed,{rulesVersion:info.rulesVersion??1,startBalance:info.startBalance,rulesData:info.rulesData||{}}),action=>{actions.push(action);clearTimeout(timer);timer=setTimeout(()=>match.flush().catch(()=>{}),150);});
  activeMatch=match;return match;
 }
};
export function rewardWasCredited(value){return value?.alreadyClaimed===false&&['daily_grant','ad_grant'].includes(value.operation?.kind)&&Number.isFinite(value.operation?.before)&&Number.isFinite(value.operation?.after)&&value.operation.after>value.operation.before;}
function ensureDialog(){
 if(dialog)return;
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./practice-wallet.css',import.meta.url).href;document.head.append(style);
 dialog=document.createElement('dialog');dialog.className='practice-wallet-dialog';dialog.setAttribute('aria-label','练习余额');
 dialog.innerHTML='<button type="button" class="wallet-close" aria-label="关闭余额管理">×</button><h2>金币余额</h2><div class="wallet-account"></div><strong class="wallet-balance">—</strong><p>金币用于游戏练习，不可充值、提现或兑换。</p><p class="wallet-message" role="status">每日可领取一次救济金，增加 30000 金币。</p><button type="button" class="wallet-daily">领取今日救济金 · +30000</button><small class="wallet-day-note">每日 0 点更新（北京时间）</small><button type="button" class="wallet-ad">观看演示广告 · +30000</button><button type="button" class="wallet-retry">刷新余额</button><details class="wallet-history"><summary>操作记录</summary><ol></ol></details>';
 document.body.append(dialog);dialog.querySelector('.wallet-close').onclick=()=>dialog.close();
 dialog.querySelector('.wallet-daily').onclick=()=>operateWallet('daily');
 dialog.querySelector('.wallet-ad').onclick=()=>void practiceWallet.watchAd();
 dialog.querySelector('.wallet-retry').onclick=()=>operateWallet('refresh');
}
async function loadHistory(currency){const value=await request('/balance/history?currency='+currency);if(dialogCurrency!==currency)return;const list=dialog.querySelector('.wallet-history ol');list.replaceChildren();const kinds={reset:'历史重置',refresh:'刷新',daily_grant:'每日救济金 +30000',ad_grant:'演示广告奖励 +30000'};for(const item of value.operations){const row=document.createElement('li');row.textContent=`${kinds[item.kind]||item.kind} · ${formatPracticeBalance(item.before)} → ${formatPracticeBalance(item.after)} · ${new Date(item.createdAt).toLocaleString()}`;list.append(row);}if(!value.operations.length){const row=document.createElement('li');row.textContent='暂无操作记录';list.append(row);}}
async function operateWallet(kind){
 if(walletBusy)return;walletBusy=true;renderDialog();const currency=dialogCurrency;
 try{if(kind==='refresh'&&activeMatch?.syncError)await activeMatch.flush();const value=kind==='daily'?await practiceWallet.claimDaily():await practiceWallet.refresh(currency);if(kind==='refresh')await practiceWallet.rewards();await loadHistory(currency);dialog.querySelector('.wallet-message').textContent=kind==='daily'?(value.alreadyClaimed?'今日救济金已领取，明天再来。':'已领取 30000 金币救济金，余额和记录已更新。'):'金币余额已刷新，记录已保存。';}
 catch(error){dialog.querySelector('.wallet-message').textContent=error.message;}
 finally{walletBusy=false;updateButtons();}
}
function renderDialog(){
 if(!dialog)return;dialog.querySelector('h2').textContent=currencyNames[dialogCurrency]+'余额';dialog.querySelector('.wallet-account').textContent=account?.name||'正在获取账户…';dialog.querySelector('.wallet-balance').textContent=formatPracticeBalance(account?.balances[dialogCurrency]);
 updateButtons();
 dialog.querySelector('.wallet-message').textContent=rewardStatus?.daily.claimed?'今日救济金已领取，也可以观看演示广告获得金币。':'每日可领取一次救济金，增加 30000 金币。';
}
function updateButtons(){const daily=dialog.querySelector('.wallet-daily');daily.disabled=!account||!rewardStatus||rewardStatus.daily.claimed||walletBusy;daily.textContent=rewardStatus?.daily.claimed?'今日救济金已领取':'领取今日救济金 · +30000';dialog.querySelector('.wallet-retry').disabled=walletBusy;dialog.querySelector('.wallet-ad').disabled=!account||walletBusy;}
export function bindPracticeWallet({onChange=()=>{},closeActive=false}={}){
 for(const node of document.querySelectorAll('.balances span'))node.textContent='—';
 document.querySelectorAll('.balances button').forEach((button,index)=>button.setAttribute('aria-label',currencyNames[WALLET_CURRENCIES[index]]+'余额管理'));
 const unsubscribe=practiceWallet.subscribe(value=>{const balances=Object.fromEntries(WALLET_CURRENCIES.map(currency=>[currency,formatPracticeBalance(value.balances[currency])]));const values=document.querySelectorAll('.balances span');WALLET_CURRENCIES.forEach((currency,index)=>{if(values[index])values[index].textContent=balances[currency];});const name=document.querySelector('.account');if(name)name.textContent=value.name;onChange(balances,value);});
 (closeActive?practiceWallet.enterLobby():practiceWallet.load()).then(value=>{if(value.balance===0)void practiceWallet.show();}).catch(error=>{ensureDialog();dialog.showModal();renderDialog();dialog.querySelector('.wallet-message').textContent=error.message;});return unsubscribe;
}
if(typeof addEventListener==='function'){addEventListener('pagehide',()=>activeMatch?.beacon());addEventListener('online',()=>{if(activeMatch?.syncError)activeMatch.flush().catch(()=>{});});}
export {INITIAL_BALANCE};
