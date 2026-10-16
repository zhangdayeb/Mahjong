export interface WalletAccount {
 id:string;
 name:string;
 signature:string;
 balance:number;
 balances:{coins:number};
}

export interface RoundAction {method:string;args:any[];}
export interface RoundInfo {
 id:string;mode:string;room:string;seed:number;currency:string;
 startBalance:number;rulesVersion:number;rulesData:any;
 sequence?:number;status?:string;delta?:number;
}
export interface DemoAd {id:string;duration:number;watchedSeconds:number;status?:string;}
export interface FeedbackInput {rating:number;message:string;contact?:string;tags?:string[];requestId?:string;}
export interface MailMessage {id:string;category:'system'|'reward';title:string;body:string;createdAt:string;readAt:string|null;}
export interface PageOptions {limit?:number;cursor?:string|null;}
export class WalletError extends Error {
 status:number;
 constructor(message:string,status=0){super(message);this.name='WalletError';this.status=status;}
}

/** Secure UUID fallback for older WebViews; never use Math.random for request IDs. */
export function requestId():string {
 const secure=globalThis.crypto;
 if(!secure?.getRandomValues)throw new WalletError('当前环境无法生成安全操作编号，请使用 HTTPS 或本机浏览器。');
 if(typeof secure.randomUUID==='function')return secure.randomUUID();
 const bytes=new Uint8Array(16);secure.getRandomValues(bytes);
 bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export class WalletClient {
 private readonly baseUrl:string;
 private readonly credentials:RequestCredentials;
 private readonly timeoutMs:number;
 private current:WalletAccount|null=null;
 private loading:Promise<WalletAccount>|null=null;
 private listeners=new Set<(account:WalletAccount)=>void>();
 private status:any=null;
 private ad:DemoAd|null=null;
 private adBusy=false;
 private pendingFeedback:{content:string;requestId:string}|null=null;
 private requestTail:Promise<void>=Promise.resolve();
 private nextSequence=0;
 private appliedSequence=0;
 private responseSequences=new WeakMap<object,number>();

 constructor(options:{baseUrl?:string;timeoutMs?:number}={}) {
  const preview=typeof location!=='undefined'&&location.protocol==='http:'&&
   ['localhost','127.0.0.1'].includes(location.hostname)&&location.port==='7456';
  const previewBase=preview?`http://${location.hostname}:8780/demo-api`:null;
  this.baseUrl=(options.baseUrl||previewBase||'/demo-api').replace(/\/$/,'');
  this.timeoutMs=options.timeoutMs??15000;
  if(!Number.isFinite(this.timeoutMs)||this.timeoutMs<100||this.timeoutMs>30000)throw new WalletError('金币接口超时须为 100 至 30000 毫秒。');
  this.credentials='same-origin';
  if(typeof location!=='undefined'){
   const api=new URL(this.baseUrl,location.href);
   if(api.origin!==location.origin){
    const allowedPreview=preview&&api.href===previewBase;
    if(!allowedPreview)throw new WalletError('金币接口必须与游戏使用同一域名。');
    this.credentials='include';
   }
  }
 }
 get account():WalletAccount|null{return this.current;}
 get rewardStatus():any{return this.status;}
 get activeAd():DemoAd|null{return this.ad;}
 subscribe(callback:(account:WalletAccount)=>void):()=>void {
  this.listeners.add(callback);if(this.current)callback(this.current);
  return()=>this.listeners.delete(callback);
 }
 receive(value:any):WalletAccount {
  if(!value||typeof value!=='object')throw new WalletError('金币服务返回了无效账户，请刷新重试。');
  const sequence=value&&typeof value==='object'?this.responseSequences.get(value):undefined;
  if(sequence!==undefined&&sequence<this.appliedSequence)return this.current!;
  const balance=value.balances?.coins??value.balance;
  if(typeof value.id!=='string'||!Number.isSafeInteger(balance)||balance<0)
   throw new WalletError('金币服务返回了无效账户，请刷新重试。');
  this.current={id:value.id,name:value.name,signature:value.signature??'',balance,balances:{coins:balance}};
  if(value.rewards)this.status=value.rewards;
  if(sequence!==undefined)this.appliedSequence=sequence;
  for(const callback of this.listeners)callback(this.current);
  return this.current;
 }
 async request(path:string,body?:any):Promise<any> {
  const sequence=++this.nextSequence,serialized=body===undefined?undefined:JSON.stringify(body);
  const work=this.requestTail.then(async()=>{
   const abort=new AbortController();let timer:ReturnType<typeof setTimeout>;
   const timeout=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(new WalletError('金币服务响应超时，请稍后重试。'));},this.timeoutMs);});
   const network=async()=>{
    let response:Response;
    try{response=await fetch(this.baseUrl+path,{method:body===undefined?'GET':'POST',credentials:this.credentials,headers:body===undefined?{}:{'Content-Type':'application/json'},body:serialized,cache:'no-store',signal:abort.signal});}
    catch{throw new WalletError('金币服务连接失败，请检查网络后重试。');}
    let data:any;try{data=await response.json();}catch{throw new WalletError('金币服务返回格式无效，请稍后重试。',response.status);}
    if(!response.ok)throw new WalletError(data?.error||'金币服务暂时不可用。',response.status);
    return data;
   };
   try{
    const data=await Promise.race([network(),timeout]);
    if(data&&typeof data==='object')this.responseSequences.set(data,sequence);
    return data;
   }finally{clearTimeout(timer!);}
  });
  // Serialize reads and writes so the server commits them in the same order.
  // Rejections release the queue; a late caller applying an old DTO is guarded
  // separately by receive()'s response sequence.
  this.requestTail=work.then(()=>{},()=>{});
  return work;
 }
 async load():Promise<WalletAccount> {
  if(!this.loading)this.loading=this.request('/me').then(value=>this.receive(value)).catch(error=>{this.loading=null;throw error;});
  await this.loading;return this.current!;
 }
 async enterLobby():Promise<WalletAccount>{await this.load();return this.receive(await this.request('/round/leave',{}));}
 async refresh():Promise<WalletAccount>{return this.receive(await this.request('/balance/refresh',{currency:'coins',requestId:requestId()}));}
 async rewards():Promise<any>{const value=await this.request('/rewards');this.receive(value);return this.status;}
 async claimDaily():Promise<any>{const value=await this.request('/rewards/daily',{requestId:requestId()});this.receive(value);return value;}
 async saveSignature(signature:string):Promise<WalletAccount>{return this.receive(await this.request('/profile/signature',{signature}));}
 async history():Promise<any[]>{return (await this.historyPage()).records;}
 async historyPage(options:PageOptions={}):Promise<{records:any[];nextCursor:string|null}>{
  const value=await this.request('/balance/history?'+this.pageQuery({currency:'coins'},options));
  return{records:value.records??value.operations,nextCursor:value.nextCursor??null};
 }
 async feedback(input:FeedbackInput):Promise<any>{
  const body={starLevel:input.rating,advice:input.message,contact:input.contact??'',tags:input.tags??[]};
  const content=JSON.stringify(body);
  if(!this.pendingFeedback||this.pendingFeedback.content!==content)this.pendingFeedback={content,requestId:input.requestId||requestId()};
  const pending=this.pendingFeedback;
  const value=await this.request('/feedback',{...body,requestId:input.requestId||pending.requestId});
  if(this.pendingFeedback===pending)this.pendingFeedback=null;
  return value;
 }
 async feedbackHistory(options:PageOptions={}):Promise<any>{return this.request('/feedback?'+this.pageQuery({},options));}
 async mails(options:PageOptions&{category?:'all'|'system'|'reward'}={}):Promise<{messages:MailMessage[];unreadCount:number;nextCursor:string|null}>{
  return this.request('/mail?'+this.pageQuery({category:options.category??'all'},options));
 }
 async readMail(id:string|'all'):Promise<any>{return this.request('/mail/read',id==='all'?{all:true}:{id});}
 private pageQuery(initial:Record<string,string>,options:PageOptions):string{
  const query=new URLSearchParams(initial);if(options.limit!==undefined)query.set('limit',String(options.limit));if(options.cursor)query.set('cursor',options.cursor);return query.toString();
 }
 async startRound(mode:string,room:string):Promise<any>{const value=await this.request('/round/start',{mode,room:String(room),rulesVersion:2});this.receive(value);return value;}
 async syncRound(id:string,actions:RoundAction[],close=false):Promise<any>{const value=await this.request('/round/sync',{id,actions,close});this.receive(value);return value;}

 /** The UI shows a clearly labelled demonstration ad. Server heartbeats determine rewards. */
 async startAd():Promise<DemoAd> {
  if(this.ad)throw new WalletError('请先完成或关闭当前演示广告。');
  if(this.adBusy)throw new WalletError('演示广告正在准备，请稍候。');
  this.adBusy=true;
  try{await this.load();const value=await this.request('/ads/start',{requestId:requestId()});this.ad=value.ad;return this.ad!;}
  finally{this.adBusy=false;}
 }
 async progressAd(watching=true):Promise<DemoAd> {
  if(!this.ad)throw new WalletError('当前没有演示广告。');
  // A native/offscreen environment cannot assert that a Web demonstration ad was watched.
  const foreground=typeof document!=='undefined'&&!document.hidden&&document.hasFocus();
  const value=await this.request('/ads/progress',{id:this.ad.id,watching:watching&&foreground});
  this.ad=value.ad;return this.ad!;
 }
 async completeAd():Promise<any> {
  if(!this.ad)throw new WalletError('当前没有演示广告。');
  const value=await this.request('/ads/complete',{id:this.ad.id});this.receive(value);this.ad=null;return value;
 }
 async cancelAd():Promise<void> {
  if(!this.ad)return;const id=this.ad.id;
  await this.request('/ads/cancel',{id});if(this.ad?.id===id)this.ad=null;
 }
 beaconRound(id:string,actions:RoundAction[]):boolean {
  if(typeof navigator==='undefined'||typeof navigator.sendBeacon!=='function')return false;
  return navigator.sendBeacon(this.baseUrl+'/round/sync',new Blob([JSON.stringify({id,actions,close:true})],{type:'application/json'}));
 }
}
