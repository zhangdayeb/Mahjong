import {NUMBER_TILES,JOKER,canComplete,winningTiles} from './hand-analysis.js';
import {scoreHand} from './bloodflow-scoring.js';
import {chooseMissing,chooseDiscard,exchangeIndices,suitOf} from './rules.js';
export const BLOODFLOW_PLAYERS=['你','阿唐','林先生','小苏'];
const sorted=hand=>hand.slice().sort((a,b)=>a-b);
const nextSeats=from=>[1,2,3].map(n=>(from+n)%4);
const stockFor=count=>[...NUMBER_TILES.flatMap(v=>Array(4).fill(v)),...Array(count).fill(JOKER)];
export function validStock(stock,jokers=0){if(!Array.isArray(stock)||stock.length!==108+jokers)return false;const counts=new Map();for(const v of stock)counts.set(v,(counts.get(v)||0)+1);return NUMBER_TILES.every(v=>counts.get(v)===4)&&(counts.get(JOKER)||0)===jokers&&counts.size===27+(jokers?1:0);}

export class BloodflowRound{
 constructor(random=Math.random,config={}){
  this.config={...config};this.random=random;this.base=config.base||1;this.dealer=0;
  this.startBalances=config.startBalances?.slice()||[config.startBalance??30000,750000,235000,437000];
  if(this.startBalances.length!==4||!this.startBalances.every(v=>Number.isSafeInteger(v)&&v>=0))throw Error('牌局金币配置无效');
  const continued=config.noShuffle&&validStock(config.continuation,config.jokerCount||0);
  this.wall=continued?config.continuation.slice():stockFor(config.jokerCount||0);
  if(continued){const cut=Math.floor(random()*this.wall.length);this.wall=[...this.wall.slice(cut),...this.wall.slice(0,cut)];this.shuffleMethod='cut';this.cutAt=cut;}
  else{for(let i=this.wall.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[this.wall[i],this.wall[j]]=[this.wall[j],this.wall[i]];}this.shuffleMethod='shuffle';this.cutAt=null;}
  this.initialStock=this.wall.slice();this.exchangeDirection=config.exchangeDirection==='seeded'?['clockwise','counterclockwise','opposite'][Math.floor(random()*3)]:(config.exchangeDirection||'clockwise');
  this.hands=[[],[],[],[]];this.melds=[[],[],[],[]];this.discards=[[],[],[],[]];this.redKongs=[[],[],[],[]];this.revealed=[false,false,false,false];this.missing=[0,0,0,0];
  this.scores=[0,0,0,0];this.log=[];this.passedFan=[0,0,0,0];this.huCounts=[0,0,0,0];this.lotusWins=[0,0,0,0];this.drawCounts=[0,0,0,0];this.discardCounts=[0,0,0,0];this.initialReady=[false,false,false,false];this.huEvents=[];this.wonTiles=[];this.kongPayments=[];this.kongBatches=[];this.settlementEvents=[];this.interrupted=false;this.claim=null;this.lastDraw=null;
  for(let i=0;i<13;i++)for(let p=0;p<4;p++)this.hands[p].push(this.wall.pop());
  const initial=this.wall.pop();this.hands[0].push(initial);this.lastDraw={player:0,value:initial,initial:true};this.sort();this.turn=0;this.phase=config.exchange?'exchange':'choose';
  this.record(`${config.name||'联桌麻将'}：${108+(config.jokerCount||0)}张牌，${continued?'沿用上局收牌顺序后切牌':'洗牌'}，封顶${config.cap}倍`);
 }
 record(text){this.log.unshift(text);}
 sort(){this.hands.forEach(h=>h.sort((a,b)=>a-b));}
 inventory(){return[...this.wall,...this.hands.flat(),...this.discards.flat(),...this.wonTiles,...this.redKongs.flat(),...this.melds.flat().flatMap(m=>Array(m.type==='peng'?3:4).fill(m.value)),...(this.phase==='rob'&&this.claim?.addGang?[this.claim.value]:[])];}
 collectionOrder(){const order=[...this.discards.flat(),...this.wonTiles,...this.redKongs.flat(),...this.melds.flat().flatMap(m=>Array(m.type==='peng'?3:4).fill(m.value)),...(this.phase==='rob'&&this.claim?.addGang?[this.claim.value]:[]),...this.hands.flat(),...this.wall];if(!validStock(order,this.config.jokerCount||0))throw Error('收牌数量不一致');return order;}
 available(p){return Math.max(0,this.startBalances[p]+this.scores[p]);}
 pay(from,to,requested,kind='transfer',details={}){
  if(from===to||!Number.isSafeInteger(requested)||requested<0)throw Error('积分转移无效');
  const amount=this.config.walletBound===false?requested:Math.min(requested,this.available(from));
  if(!amount)return 0;this.scores[from]-=amount;this.scores[to]+=amount;
  this.record(`${BLOODFLOW_PLAYERS[from]} → ${BLOODFLOW_PLAYERS[to]}：${amount}金币`);
  if(kind!=='transfer')this.settlementEvents.push({kind,from,to,amount,...details});return amount;
 }
 transfer(from,to,n){return this.pay(from,to,n*this.base);}
 exchange(indices,direction=this.exchangeDirection){
  if(this.phase!=='exchange')throw Error('当前不是换牌阶段');if(!['clockwise','counterclockwise','opposite'].includes(direction))throw Error('换牌方向无效');
  if(direction!==this.exchangeDirection)throw Error('请按本局确定的方向换牌');
  if(!Array.isArray(indices)||indices.length!==3||new Set(indices).size!==3||indices.some(i=>!Number.isInteger(i)||i<0||i>=this.hands[0].length))throw Error('请选择三张牌');
  const selected=indices.map(i=>this.hands[0][i]);if(!this.config.exchangeAnySuit&&(selected.some(v=>![1,2,3].includes(suitOf(v)))||new Set(selected.map(suitOf)).size!==1))throw Error('请选择三张同花色的万、条或筒');
  const sets=[selected,...this.hands.slice(1).map(h=>exchangeIndices(h).map(i=>h[i]))],offset={clockwise:3,counterclockwise:1,opposite:2}[direction];
  for(let p=0;p<4;p++)for(const tile of sets[p])this.hands[p].splice(this.hands[p].indexOf(tile),1);
  for(let p=0;p<4;p++)this.hands[p].push(...sets[(p+offset)%4]);this.sort();this.lastDraw={player:0,value:this.hands[0].at(-1),initial:true};this.phase='choose';this.record(`完成${{clockwise:'顺时针',counterclockwise:'逆时针',opposite:'对家'}[direction]}换三张`);
 }
 choose(suit){
  if(this.phase!=='choose'||![1,2,3].includes(suit))throw Error('请选择缺门');
  this.missing=[suit,...this.hands.slice(1).map(chooseMissing)];this.phase='play';
  for(let p=0;p<4;p++){const hand=this.hands[p].slice();if(hand.length===14){this.initialReady[p]=this.canHu(p);const index=hand.lastIndexOf(this.lastDraw.value);hand.splice(index>=0?index:hand.length-1,1);}this.initialReady[p]||=winningTiles(hand,this.missing[p],this.melds[p],this.config).length>0;}
  this.record('定缺完成，庄家出牌');
 }
 forced(p){return this.hands[p].some(v=>suitOf(v)===this.missing[p]);}
 canHu(p,extra){return canComplete(extra===undefined?this.hands[p]:[...this.hands[p],extra],this.missing[p],this.melds[p],this.config);}
 ready(p){return winningTiles(this.hands[p],this.missing[p],this.melds[p],this.config);}
 publicCopies(tile){return this.discards.flat().filter(v=>v===tile).length+this.wonTiles.filter(v=>v===tile).length+this.redKongs.flat().filter(v=>v===tile).length+this.melds.flat().filter(m=>m.type!=='dark'&&m.value===tile).reduce((n,m)=>n+(m.type==='peng'?3:4),0);}
 scoreContext(p,extra,{settlement=false}={}){
  const selfDraw=extra===undefined,tile=selfDraw?(this.lastDraw?.player===p?this.lastDraw.value:this.hands[p].at(-1)):extra;
  return{selfDraw:!settlement&&selfDraw,tile,wallCount:settlement?-1:this.wall.length,heaven:!settlement&&selfDraw&&p===this.dealer&&!this.interrupted&&!this.discardCounts[p]&&this.drawCounts[p]===0,earth:!settlement&&selfDraw&&p!==this.dealer&&!this.interrupted&&!this.discardCounts[p]&&this.drawCounts[p]===1,kongDraw:!settlement&&selfDraw&&this.lastDraw?.player===p&&this.lastDraw.kongBatch!=null,kongDiscard:!settlement&&!selfDraw&&this.claim?.kongBatch!=null,robKong:!settlement&&!!this.claim?.addGang,publicOtherCopies:Math.max(0,this.publicCopies(tile)-(!selfDraw&&this.claim?.value===tile&&!this.claim?.addGang?1:0)),redKongs:this.redKongs[p].length,revealed:this.revealed[p],initialReady:this.initialReady[p],lotusWins:this.lotusWins[p]};
 }
 score(p,extra,options={}){return scoreHand(extra===undefined?this.hands[p]:[...this.hands[p],extra],this.missing[p],this.melds[p],this.config,this.scoreContext(p,extra,options));}
 options(p){
  if(this.phase==='claim')return p===this.claim.from?[]:this.claim.options[p]||[];
  if(this.phase!=='play'||p!==this.turn)return[];const out=[];if(this.lastDraw?.player===p&&this.canHu(p))out.push('hu');if(this.forced(p))return out;
  if(this.wall.length){for(const v of new Set(this.hands[p]))if(v!==JOKER&&this.hands[p].filter(t=>t===v).length===4)out.push('gang:'+v);for(const m of this.melds[p])if(m.type==='peng'&&this.hands[p].includes(m.value))out.push('add:'+m.value);if(this.config.redKong&&this.hands[p].includes(JOKER))out.push('redKong');}
  if(this.config.reveal&&!this.revealed[p])out.push('reveal');return out;
 }
 discard(p,index){
  if(this.phase!=='play'||p!==this.turn)throw Error('尚未轮到你');const tile=this.hands[p][index];if(tile===undefined)throw Error('请选择一张牌');if(this.forced(p)&&suitOf(tile)!==this.missing[p])throw Error('必须优先打出缺门牌');
  if(tile===JOKER&&this.config.redKong){this.redKong(p);return;}
  const kongBatch=this.lastDraw?.player===p?this.lastDraw.kongBatch:null;if(this.lastDraw?.player!==p||this.lastDraw.value!==tile)this.initialReady[p]=false;
  this.hands[p].splice(index,1);this.discards[p].push(tile);this.discardCounts[p]++;this.lastDraw=null;this.record(`${BLOODFLOW_PLAYERS[p]}打出 ${this.name(tile)}`);
  this.claim={from:p,value:tile,options:{},responses:{},kongBatch};
  for(const q of nextSeats(p)){const actions=[];if(this.canHu(q,tile)&&(this.score(q,tile)?.multiple||1)>this.passedFan[q])actions.push('hu');if(tile!==JOKER&&!this.forced(q)&&suitOf(tile)!==this.missing[q]){const copies=this.hands[q].filter(v=>v===tile).length;if(copies>=3&&this.wall.length)actions.push('gang');if(copies>=2)actions.push('peng');}if(actions.length)this.claim.options[q]=actions;}
  if(Object.keys(this.claim.options).length)this.phase='claim';else{this.claim=null;this.next(p);}
 }
 respond(p,action){
  if(this.phase!=='claim'||!this.claim.options[p]||p in this.claim.responses)throw Error('当前没有待处理响应');if(action!=='pass'&&!this.claim.options[p].includes(action))throw Error('不可执行这个操作');
  if(action==='pass'&&this.claim.options[p].includes('hu'))this.passedFan[p]=Math.max(this.passedFan[p],this.score(p,this.claim.value)?.multiple||1);
  this.claim.responses[p]=action;if(Object.keys(this.claim.options).every(seat=>seat in this.claim.responses))this.resolve();
 }
 resolve(){
  const claim=this.claim,order=nextSeats(claim.from),winners=order.filter(p=>claim.responses[p]==='hu');
  if(winners.length){for(const p of winners)this.payHu(p,claim.from);this.forwardKong(claim.kongBatch,winners[0]);this.interrupted=true;this.claim=null;this.next(claim.from);return;}
  const winner=order.find(p=>claim.responses[p]==='gang')??order.find(p=>claim.responses[p]==='peng');
  if(winner!==undefined){const type=claim.responses[winner],count=type==='gang'?3:2;for(let i=0;i<count;i++)this.hands[winner].splice(this.hands[winner].indexOf(claim.value),1);this.discards[claim.from].pop();this.melds[winner].push({type,value:claim.value,from:claim.from});this.passedFan[winner]=0;if(type==='peng')this.initialReady[winner]=false;this.interrupted=true;this.turn=winner;this.phase='play';this.claim=null;this.record(`${BLOODFLOW_PLAYERS[winner]}${type==='gang'?'杠':'碰'} ${this.name(claim.value)}`);if(type==='gang'){const batch=this.newKong(winner,'gang',claim.from);this.draw(winner,batch);}return;}
  this.claim=null;this.next(claim.from);
 }
 next(from){if(!this.wall.length){this.end();return;}this.turn=(from+1)%4;this.phase='play';this.draw(this.turn);}
 draw(p,kongBatch=null){if(!this.wall.length){this.end();return;}this.passedFan[p]=0;const tile=this.wall.pop();this.hands[p].push(tile);this.drawCounts[p]++;this.lastDraw={player:p,value:tile,kongBatch};this.record(`${BLOODFLOW_PLAYERS[p]}摸牌（牌墙剩余 ${this.wall.length} 张）`);}
 hu(p){
  if(!this.options(p).includes('hu'))throw Error('当前不能胡牌');const tile=this.lastDraw.value;this.payHu(p);const index=this.hands[p].lastIndexOf(tile);if(index<0)throw Error('胡牌张不在手牌中');this.hands[p].splice(index,1);this.wonTiles.push(tile);this.lastDraw=null;this.interrupted=true;this.next(p);
 }
 payHu(p,from){
  const selfDraw=from===undefined,tile=selfDraw?(this.lastDraw?.player===p?this.lastDraw.value:this.hands[p].at(-1)):this.claim.value,fan=this.score(p,selfDraw?undefined:tile);if(!fan)throw Error('不能结算未成立的胡牌');
  const before=this.scores.slice(),hand=sorted([...this.hands[p],...(selfDraw?[]:[tile])]),melds=this.melds[p].map(m=>({...m}));
  const limit=Math.max(this.startBalances[p],this.available(p)),payers=selfDraw?nextSeats(p):[from];
  let unit=fan.multiple*this.base;if(selfDraw&&this.config.fanFamily==='sichuan'&&this.config.selfDrawMode==='add')unit+=this.base;
  const liabilities=payers.map(q=>this.config.walletBound===false?unit:Math.min(unit,this.available(q))),total=liabilities.reduce((a,b)=>a+b,0),target=this.config.walletBound===false?total:Math.min(limit,total);
  const shares=liabilities.map(amount=>total?Number(BigInt(amount)*BigInt(target)/BigInt(total)):0);let remainder=target-shares.reduce((a,b)=>a+b,0);
  for(let i=0;remainder&&i<shares.length;i++)if(shares[i]<liabilities[i]){shares[i]++;remainder--;}
  payers.forEach((q,i)=>this.pay(q,p,shares[i]));
  this.huCounts[p]++;if(fan.name==='九莲宝灯')this.lotusWins[p]++;
  this.huEvents.push({seat:p,from:from??p,tile,selfDraw,fan,hand,melds,deltas:this.scores.map((score,q)=>score-before[q])});
  this.record(`${BLOODFLOW_PLAYERS[p]}${selfDraw?'自摸':'胡'+BLOODFLOW_PLAYERS[from]}：${fan.name} ${fan.multiple}倍${fan.capped?'（封顶）':''}，继续血流牌局`);
 }
 newKong(p,type,from,{paid=true}={}){
  const batch={id:this.kongBatches.length,seat:p,type,from,amount:0,payments:[],forwarded:false};this.kongBatches.push(batch);
  if(paid)for(const q of type==='gang'?[from]:[0,1,2,3].filter(q=>q!==p)){const amount=this.transfer(q,p,type==='add'?1:2);if(amount){const payment={from:q,to:p,amount,batch:batch.id};batch.amount+=amount;batch.payments.push(payment);this.kongPayments.push(payment);}}
  this.interrupted=true;this.passedFan[p]=0;return batch.id;
 }
 kongTransfer(from,to,n){const amount=this.transfer(from,to,n);if(amount)this.kongPayments.push({from,to,amount});return amount;}
 gang(p,value,added=false){
  if(!this.options(p).includes((added?'add:':'gang:')+value))throw Error('当前不能杠牌');
  if(added){this.hands[p].splice(this.hands[p].indexOf(value),1);this.claim={from:p,value,options:{},responses:{},addGang:true,paid:this.lastDraw?.player===p&&this.lastDraw.value===value};this.lastDraw=null;for(const q of nextSeats(p))if(this.canHu(q,value)&&(this.score(q,value)?.multiple||1)>this.passedFan[q])this.claim.options[q]=['hu'];if(Object.keys(this.claim.options).length){this.phase='rob';this.record('补杠等待抢杠响应');return;}this.finishAdd(p,value,this.claim.paid);}
  else{this.hands[p]=this.hands[p].filter(v=>v!==value);this.melds[p].push({type:'dark',value,from:p});const batch=this.newKong(p,'dark',p);this.record(`${BLOODFLOW_PLAYERS[p]}暗杠 ${this.name(value)}`);this.draw(p,batch);}
 }
 finishAdd(p,value,paid=true){const meld=this.melds[p].find(m=>m.type==='peng'&&m.value===value);if(!meld)throw Error('找不到补杠牌组');meld.type='add';this.claim=null;this.turn=p;this.phase='play';const batch=this.newKong(p,'add',p,{paid});this.record(`${BLOODFLOW_PLAYERS[p]}补杠 ${this.name(value)}${paid?'':'（非刚摸牌，不收杠分）'}`);this.draw(p,batch);}
 rob(p,action){
  const claim=this.claim;if(this.phase!=='rob'||!claim.options[p]||p in claim.responses||!['hu','pass'].includes(action))throw Error('无抢杠响应');if(action==='pass')this.passedFan[p]=Math.max(this.passedFan[p],this.score(p,claim.value)?.multiple||1);claim.responses[p]=action;if(!Object.keys(claim.options).every(seat=>seat in claim.responses))return;
  const winners=nextSeats(claim.from).filter(q=>claim.responses[q]==='hu');if(winners.length){for(const q of winners)this.payHu(q,claim.from);this.wonTiles.push(claim.value);this.interrupted=true;this.claim=null;this.next(claim.from);}else this.finishAdd(claim.from,claim.value,claim.paid);
 }
 forwardKong(id,winner){const batch=this.kongBatches[id];if(!this.config.callTransfer||!batch||batch.forwarded)return;batch.forwarded=true;const amount=this.pay(batch.seat,winner,batch.amount,'call_transfer',{batch:id,label:'呼叫转移'});if(amount)this.record(`呼叫转移：${amount}金币转给最近的胡牌家`);}
 redKong(p){if(!this.options(p).includes('redKong'))throw Error('当前不能进行红中杠');const index=this.hands[p].indexOf(JOKER);this.hands[p].splice(index,1);this.redKongs[p].push(JOKER);this.interrupted=true;this.passedFan[p]=0;const batch=this.newKong(p,'red',p,{paid:false});this.record(`${BLOODFLOW_PLAYERS[p]}红中杠，补摸一张，胡牌附加2倍`);this.draw(p,batch);}
 reveal(p){if(!this.options(p).includes('reveal'))throw Error('当前不能明牌');this.revealed[p]=true;this.record(`${BLOODFLOW_PLAYERS[p]}明牌，胡牌倍数乘6，仍受场次封顶限制`);}
 end(){
  if(this.phase==='end')return;this.phase='end';this.claim=null;
  const flower=this.hands.map((h,p)=>h.some(v=>suitOf(v)===this.missing[p])),ready=this.hands.map((h,p)=>flower[p]?[]:this.ready(p));
  for(const payment of this.kongPayments){const batch=this.kongBatches[payment.batch];if(!ready[payment.to].length&&!batch?.forwarded)this.pay(payment.to,payment.from,payment.amount,'tax_refund',{label:'退税'});}
  for(let p=0;p<4;p++)if(flower[p])for(let q=0;q<4;q++)if(!flower[q])this.pay(p,q,(this.config.flowerCap||this.config.cap)*this.base,'flower',{label:'查花猪'});
  for(let q=0;q<4;q++)if(ready[q].length&&!this.huCounts[q]){const best=Math.max(...ready[q].map(tile=>this.score(q,tile,{settlement:true})?.multiple||1));for(let p=0;p<4;p++)if(p!==q&&!flower[p]&&!ready[p].length)this.pay(p,q,best*this.base,'ready',{label:'查叫',multiple:best});}
  this.record('牌墙摸完，完成查叫、查花猪和退税');
 }
 auto(p){
  if(this.phase==='exchange'&&p===0){this.exchange(exchangeIndices(this.hands[0]));return;}
  if(this.phase==='choose'&&p===0){this.choose(chooseMissing(this.hands[0]));return;}
  if(['claim','rob'].includes(this.phase)){const options=this.claim.options[p];if(!options||p in this.claim.responses)return;const action=options.includes('hu')?'hu':options.includes('gang')?'gang':options.includes('peng')?'peng':'pass';this.phase==='rob'?this.rob(p,action):this.respond(p,action);return;}
  if(this.phase!=='play'||this.turn!==p)return;const options=this.options(p);
  if(options.includes('hu'))this.hu(p);
  else if(options.some(v=>v.startsWith('gang:')))this.gang(p,Number(options.find(v=>v.startsWith('gang:')).split(':')[1]));
  else if(options.some(v=>v.startsWith('add:')))this.gang(p,Number(options.find(v=>v.startsWith('add:')).split(':')[1]),true);
  else if(options.includes('redKong'))this.redKong(p);
  else{const candidates=this.hands[p].map((v,index)=>({v,index})).filter(x=>x.v!==JOKER||this.hands[p].every(v=>v===JOKER));const selected=candidates[chooseDiscard(candidates.map(x=>x.v),this.missing[p])];this.discard(p,selected.index);}
 }
 name(value){return value===JOKER?'红中':`${rankOf(value)}${['','万','条','筒'][suitOf(value)]}`;}
}
const rankOf=value=>value%10;
