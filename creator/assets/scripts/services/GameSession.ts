import {createPracticeRound,recordRoundActions,replayAction} from '../rules/practice-round';
import {WalletClient,WalletError,RoundAction,RoundInfo,WalletAccount} from './WalletClient';

export const PLAYABLE_MODES=['classic','red','exchange','six','sixFixed','crazy','eightFixed'];
const clone=<T>(value:T):T=>typeof globalThis.structuredClone==='function'?globalThis.structuredClone(value):JSON.parse(JSON.stringify(value));
export interface GameSessionOptions {
 onChange?:(session:GameSession)=>void;
 onError?:(error:Error)=>void;
 onEnd?:(session:GameSession)=>void;
}

/** One seeded, server-verified practice game. Opponents remain computer players. */
export class GameSession {
 readonly wallet:WalletClient;
 round:any=null;
 auto=false;
 private info:RoundInfo|null=null;
 private transcript:RoundAction[]=[];
 private timer:ReturnType<typeof setTimeout>|null=null;
 private inflight:Promise<any>|null=null;
 private failure:Error|null=null;
 private isClosed=true;
 private pendingClose=false;
 private disposed=false;
 private endNotified=false;
 private callbacks:GameSessionOptions;
 private readonly pageHide=()=>{if(!this.isClosed&&this.info)this.wallet.beaconRound(this.info.id,clone(this.transcript));};
 constructor(wallet:WalletClient,options:GameSessionOptions={}) {
  this.wallet=wallet;this.callbacks=options;
  if(typeof window!=='undefined')window.addEventListener('pagehide',this.pageHide);
 }
 get account():WalletAccount|null{return this.wallet.account;}
 get actions():RoundAction[]{return clone(this.transcript);}
 get id():string|null{return this.info?.id??null;}
 get closed():boolean{return this.isClosed;}
 get syncError():Error|null{return this.failure;}
 get startBalance():number{return this.info?.startBalance??0;}
 get displayBalance():number{return this.round?Math.max(0,this.startBalance+this.round.scores[0]):this.account?.balance??0;}
 async start(mode='classic',room='beginner'):Promise<GameSession> {
  if(this.disposed)throw new WalletError('该牌局客户端已关闭。');
  if(!PLAYABLE_MODES.includes(mode))throw new WalletError('这个玩法未开放。');
  if(!this.isClosed)await this.finish();
  await this.wallet.load();const value=await this.wallet.startRound(mode,room);
  this.info=value.round;this.transcript=[];this.failure=null;this.isClosed=false;
  this.pendingClose=false;this.auto=false;this.endNotified=false;
  // Recorder arguments are arrays and primitive values. Older WebViews may lack structuredClone.
  if(typeof globalThis.structuredClone!=='function')globalThis.structuredClone=<T>(input:T):T=>JSON.parse(JSON.stringify(input));
  const info=this.info!;
  this.round=recordRoundActions(createPracticeRound(info.mode,info.room,info.seed,{rulesVersion:info.rulesVersion??1,startBalance:info.startBalance,rulesData:info.rulesData||{}}),(action:RoundAction)=>{
   this.transcript.push(action);this.scheduleFlush();
  });
  this.notify();return this;
 }
 humanPending():boolean {
  const round=this.round;if(!round||round.phase==='end')return false;
  return ['exchange','choose'].includes(round.phase)||(round.phase==='play'&&round.turn===0)||
   (['claim','rob'].includes(round.phase)&&!!round.claim?.options[0]&&!(0 in round.claim.responses));
 }
 perform(method:string,args:any[]=[]):boolean {
  if(!this.round||this.isClosed||this.pendingClose||this.failure||this.disposed)return false;
  try{replayAction(this.round,{method,args});this.notify();return true;}
  catch(error){this.report(error);return false;}
 }
 stepBots():boolean {
  const round=this.round;if(!round||this.isClosed||this.pendingClose||this.failure||this.disposed||round.phase==='end')return false;
  if(['claim','rob'].includes(round.phase)){
   const seat=Object.keys(round.claim.options).map(Number).find(seat=>seat!==0&&!(seat in round.claim.responses));
   if(seat!==undefined)return this.perform('auto',[seat]);
  }
  if(this.humanPending())return this.auto?this.perform('auto',[0]):false;
  return round.phase==='play'?this.perform('auto',[round.turn]):false;
 }
 private scheduleFlush():void {
  if(this.timer!==null)clearTimeout(this.timer);
  this.timer=setTimeout(()=>{this.timer=null;void this.flush().catch(()=>{});},150);
 }
 private notify():void{this.callbacks.onChange?.(this);}
 private report(error:unknown):void{this.callbacks.onError?.(error instanceof Error?error:new Error(String(error)));}
 async flush():Promise<any> {
  if(this.timer!==null){clearTimeout(this.timer);this.timer=null;}
  if(this.inflight)return this.inflight;
  if(this.isClosed||!this.info)return;
  const run=async()=>{
   let value:any,count:number,close:boolean;
   do {
    count=this.transcript.length;close=this.pendingClose;
    value=await this.wallet.syncRound(this.info!.id,clone(this.transcript),close);
    this.failure=null;this.isClosed=value.round.status!=='active';this.notify();
    if(this.isClosed&&this.round?.phase==='end'&&!this.endNotified){this.endNotified=true;this.callbacks.onEnd?.(this);}
   }while(!this.isClosed&&(this.transcript.length>count||this.pendingClose&&!close));
   return value;
  };
  const work=run().catch(error=>{this.failure=error;this.report(error);this.notify();throw error;});
  this.inflight=work;
  try{return await work;}finally{if(this.inflight===work)this.inflight=null;}
 }
 async finish():Promise<void>{if(this.isClosed)return;this.pendingClose=true;await this.flush();}
 async dispose():Promise<void>{await this.finish();this.disposed=true;if(this.timer!==null)clearTimeout(this.timer);if(typeof window!=='undefined')window.removeEventListener('pagehide',this.pageHide);}
}
