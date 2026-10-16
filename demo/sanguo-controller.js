import {SanguoRound,SANGUO_PLAYERS} from './sanguo-round.js';
import {sanguoName,isSanguoSeal} from './sanguo-rules.js';
import {snapshotActionResult,actionResultEvents} from './action-result-events.js';
export function pendingSanguoPlayer(round){if(round.phase==='play')return round.turn===0;if(['claim','rob'].includes(round.phase))return!!round.claim.options[0]&&!(0 in round.claim.responses);return false;}
export function nextSanguoActor(round,auto=false){if(['claim','rob'].includes(round.phase)){const bot=[1,2,3].find(seat=>round.claim.options[seat]&&!(seat in round.claim.responses));return bot??(auto&&pendingSanguoPlayer(round)?0:null);}return round.phase==='play'&&(round.turn!==0||auto)?round.turn:null;}
export function createSanguoController({room,roundFactory,onAction=()=>{},onChange=()=>{},onEnd=()=>{},isPaused=()=>false,onNotice=()=>{},random=Math.random,clock=()=>Date.now(),interval=200,speed=600,seconds=20,autoStart=true}={}){
 let round,selected=-1,auto=false,started=false,deadline=0,botAt=0,ended=false,disposed=false,timer,timeoutHu=true;
 function reset(){round=roundFactory?roundFactory():new SanguoRound(random,{base:room.base,cap:999999});selected=-1;auto=false;started=false;ended=false;deadline=clock()+seconds*1000;botAt=clock()+speed;onChange(api);return round;}
 function changed(){selected=-1;deadline=clock()+seconds*1000;botAt=clock()+speed;onChange(api);if(round.phase==='end'&&!ended){ended=true;onEnd(round);}}
 function act(callback){if(disposed||round.phase==='end'||isPaused())return false;try{const before=snapshotActionResult(round),piles=round.discards.map(pile=>pile.length),seals=round.sealKongs.flat().length,treasures=round.treasuresSpent.flat().length;callback();onAction({...actionResultEvents(before,round),discarded:round.discards.flatMap((pile,seat)=>pile.length>piles[seat]?[pile.at(-1)]:[]),seal:round.sealKongs.flat().length>seals,dig:round.treasuresSpent.flat().length>treasures});started=true;changed();return true;}catch(error){onNotice(error.message);return false;}}
 function select(index){if(!api.canSelect||!Number.isInteger(index)||index<0||index>=round.hands[0].length)return false;if(selected===index)return act(()=>round.discard(0,index));if(!started){started=true;deadline=clock()+seconds*1000;}selected=index;onChange(api);return true;}
 function execute(option){return act(()=>{if(option==='hu')round.phase==='play'?round.hu(0):round.phase==='rob'?round.rob(0,'hu'):round.respond(0,'hu');else if(['peng','gang','pass'].includes(option)&&round.phase!=='play')round.phase==='rob'?round.rob(0,option):round.respond(0,option);else if(option==='dig')round.dig(0);else{const[kind,value]=option.split(':');if(kind==='seal')round.sealKong(0,Number(value));else round.gang(0,Number(value),kind==='add');}});}
 function tick(){
  if(disposed||!round||round.phase==='end')return;
  const now=clock();if(isPaused()){deadline=now+seconds*1000;botAt=now+speed;return;}
  if(!started&&!auto){onChange(api);return;}
  const actor=nextSanguoActor(round,auto);
  if(actor!==null&&now>=botAt){act(()=>round.auto(actor,{hu:actor===0?timeoutHu:true}));return;}
  if(pendingSanguoPlayer(round)&&!auto&&now>=deadline){act(()=>round.auto(0,{hu:timeoutHu}));return;}
  onChange(api);
 }
 const api={reset,select,execute,tick,get round(){return round;},get selected(){return selected;},get auto(){return auto;},get remaining(){return !started&&!auto?seconds:Math.max(0,Math.ceil((deadline-clock())/1000));},get canSelect(){return!disposed&&!auto&&!isPaused()&&round?.phase==='play'&&round.turn===0;},get options(){return round?.options(0)||[];},get status(){if(!round)return'';if(round.phase==='end')return'本局结束';if(pendingSanguoPlayer(round)){if(['claim','rob'].includes(round.phase))return`${sanguoName(round.claim.value)}：请选择响应`;const value=round.hands[0][selected];return selected<0?'点击选牌，再点同一张出牌':`再点${sanguoName(value)}${value===193?'挖宝':isSanguoSeal(value)?'玉玺杠':'出牌'}`;}if(['claim','rob'].includes(round.phase))return`${SANGUO_PLAYERS[nextSanguoActor(round,false)??round.turn]}考虑响应`;return`${SANGUO_PLAYERS[round.turn]}思考中`;},setAuto(value){auto=!!value;selected=-1;deadline=clock()+seconds*1000;botAt=clock()+speed;onChange(api);},setTimeoutHu(value){timeoutHu=!!value;},dispose(){disposed=true;clearInterval(timer);}};
 reset();if(autoStart)timer=setInterval(tick,interval);return api;
}
