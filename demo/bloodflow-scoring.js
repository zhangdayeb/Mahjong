import {prepareHand,findStandard,isSevenPairs,matchesTiles,winningTiles,JOKER,NUMBER_TILES} from './hand-analysis.js';
import {RED_FAN_CATALOGS} from './fan-catalog.js';
const suit=v=>Math.floor(v/10),rank=v=>v%10;
const fan=(name,multiple,description,additional=false)=>({name,multiple,description,additional});
const scoreCache=new Map();
export const SICHUAN_FANS=Object.freeze([
 fan('平胡',1,'四组面子加一对将。'),fan('对对胡',2,'四组刻或杠加一对将。'),fan('清一色',4,'全部序数牌为同一种花色。'),fan('七对',4,'七个对子，不能有碰杠。'),fan('金钩钓',4,'四组碰杠，手牌只剩一对将。'),fan('清对',8,'清一色的对对胡。'),fan('清七对',16,'清一色的七对。'),fan('清金钩钓',16,'清一色的金钩钓。'),
 fan('天胡',8,'庄家首次出牌前、无人碰杠胡时的起手胡，乘8。',true),fan('地胡',4,'无人碰杠胡时，非庄家首次摸牌胡，乘4。',true),
 fan('杠上开花',2,'杠后的补牌自摸。',true),fan('杠上炮',2,'胡其他玩家杠后打出的牌。',true),fan('抢杠胡',2,'胡其他玩家补杠的牌，该补杠不成立。',true),fan('海底捞月',2,'最后一张牌的胡牌。',true),fan('绝张',2,'胡牌张的另外三张已公开。',true),fan('带幺九',4,'每一组面子和对子均含1或9。',true),fan('将对',8,'仅由2、5、8组成的对对胡，不含七对。',true),fan('门清',2,'没有碰和明杠。',true),fan('断幺九',2,'全部牌只含2至8。',true),fan('根',2,'四张相同的实体序数牌，每根乘2；杠不重复计根。',true),fan('杠',2,'每组杠乘2。',true)
]);
export function fanCatalog(profile){return profile.fanFamily==='sichuan'?SICHUAN_FANS:RED_FAN_CATALOGS[profile.fanFamily==='crazy'?883:profile.fanFamily==='eight'?885:863];}

export function fanFacts(hand,missing,melds,profile,context={}){
 const p=prepareHand(hand,missing,melds,{jokerCount:profile.jokerCount||0});if(!p)return null;
 const cache=new Map(),query=options=>{const key=JSON.stringify(options||{});if(!cache.has(key))cache.set(key,findStandard(p,{selfDraw:!!context.selfDraw,winningTile:context.tile,...options}));return cache.get(key);};
 const seven=isSevenPairs(p),standard=query({});if(!seven&&!standard)return null;
 const naturals=hand.filter(v=>v!==JOKER),all=[...naturals,...melds.flatMap(m=>Array(m.type==='peng'?3:4).fill(m.value))],suits=new Set(all.map(suit));
 const kongs=melds.filter(m=>m.type!=='peng'),darkKongs=kongs.filter(m=>m.type==='dark'),open=melds.some(m=>m.type!=='dark');
 const roots=p.physical.filter((n,v)=>n===4&&!kongs.some(m=>m.value===v)).length;
 const byAllowed=allowed=>isSevenPairs(p,{allowed})||!!query({allowed});
 const ranks=allowedRanks=>byAllowed(p.values.filter(v=>allowedRanks.includes(rank(v))));
 const triplets=!!query({tripletsOnly:true}),pure=suits.size===1,golden=melds.length===4;
 const sum=color=>all.filter(v=>suit(v)===color).reduce((n,v)=>n+rank(v),0);
 const sequenceGroups=starts=>starts.map(value=>({type:'sequence',value})),tripletGroups=starts=>starts.map(value=>({type:'triplet',value}));
 const anySuit=callback=>[1,2,3].filter(s=>s!==missing).some(callback);
 const consecutiveTriplets=n=>anySuit(s=>Array.from({length:10-n},(_,i)=>i+1).some(start=>!!query({requiredGroups:tripletGroups(Array.from({length:n},(_,i)=>s*10+start+i))})));
 const doubleDragon=anySuit(s=>matchesTiles(p,[1,2,3,1,2,3,7,8,9,7,8,9,5,5].map(v=>s*10+v)));
 const lotus=anySuit(s=>Array.from({length:9},(_,i)=>i+1).some(extra=>matchesTiles(p,[1,1,1,2,3,4,5,6,7,8,9,9,9,extra].map(v=>s*10+v))));
 let singleWait;
 function narrow(role){if(!context.tile||context.tile===JOKER)return false;if(singleWait===undefined){const before=hand.slice(),index=before.lastIndexOf(context.tile);if(index<0)return false;before.splice(index,1);const waits=winningTiles(before,missing,melds,{jokerCount:profile.jokerCount||0});singleWait=waits.length===1&&waits[0]===context.tile;}return singleWait&&!!query({waitRole:role});}
 const conditions={
  '平胡':()=>!!standard,'对对胡':()=>triplets,'清一色':()=>pure,'七对':()=>seven,'金钩钓':()=>golden,'清对':()=>pure&&triplets,'清七对':()=>pure&&seven,'清金钩钓':()=>pure&&golden,
  '清幺九':()=>ranks([1,9]),'连七对':()=>anySuit(s=>[1,2,3].some(start=>matchesTiles(p,Array.from({length:7},(_,i)=>[s*10+start+i,s*10+start+i]).flat()))),'一色双龙会':()=>doubleDragon,'九莲宝灯':()=>lotus,
  '天胡':()=>!!context.heaven,'地胡':()=>!!context.earth,'绿一色':()=>byAllowed([22,23,24,26,28]),'十八罗汉':()=>kongs.length===4,'全大':()=>ranks([7,8,9]),'全中':()=>ranks([4,5,6]),'全小':()=>ranks([1,2,3]),
  '四节高':()=>consecutiveTriplets(4),'四暗刻':()=>!!query({minDark:4}),'十二金钗':()=>kongs.length>=3,'全双刻':()=>!!query({tripletsOnly:true,allowed:p.values.filter(v=>[2,4,6,8].includes(rank(v)))}),'三节高':()=>consecutiveTriplets(3),
  '百万石':()=>sum(1)>=100,'小于五':()=>ranks([1,2,3,4]),'大于五':()=>ranks([6,7,8,9]),'三暗刻':()=>!!query({minDark:3}),
  '清龙':()=>anySuit(s=>!!query({requiredGroups:sequenceGroups([s*10+1,s*10+4,s*10+7])})),
  '杠上开花':()=>!!context.selfDraw&&!!context.kongDraw,'推不倒':()=>byAllowed([31,32,33,34,35,38,39,22,24,25,26,28,29]),'不求人':()=>!open&&!!context.selfDraw,
  '老少副':()=>anySuit(s=>!!query({requiredGroups:sequenceGroups([s*10+1,s*10+7])})),'门清':()=>!open&&(profile.fanFamily==='sichuan'||!context.selfDraw),'断幺九':()=>ranks([2,3,4,5,6,7,8]),
  '双暗刻':()=>!!query({minDark:2}),'双同刻':()=>[1,2,3].some(s=>[1,2,3].some(t=>t>s&&Array.from({length:9},(_,i)=>i+1).some(n=>!!query({requiredGroups:tripletGroups([s*10+n,t*10+n])})))),
  '坎张':()=>narrow('middle'),'边张':()=>narrow('edge'),'妙手回春':()=>!!context.selfDraw&&context.wallCount===0,'海底捞月':()=>context.wallCount===0&&(profile.fanFamily==='sichuan'||!context.selfDraw),
  '杠上炮':()=>!!context.kongDiscard,'绝张':()=>context.tile!==JOKER&&context.publicOtherCopies>=3,'抢杠胡':()=>!!context.robKong,'根':()=>roots>0,
  '带幺九':()=>!!query({groupRule:'terminal',pairValues:p.values.filter(v=>[1,9].includes(rank(v)))}),'将对':()=>triplets&&!seven&&!!query({tripletsOnly:true,allowed:p.values.filter(v=>[2,5,8].includes(rank(v)))}),
  '寒鸦栖复惊':()=>ranks([1,3,5,7,9]),'一生一世':()=>ranks([1,3,4]),'二桃三士':()=>ranks([2,3,4]),
  '大展鸿图':()=>suits.size===1&&suits.has(3)&&all.filter(v=>[1,5,7,9].includes(rank(v))).length>all.filter(v=>![1,5,7,9].includes(rank(v))).length,
  '万里挑一':()=>sum(1)>=100&&all.includes(11),'百林鸟':()=>sum(2)>=100&&all.includes(21),'八仙过海':()=>p.wild>=8,'六六大顺':()=>p.wild>=6,'四方来财':()=>p.wild>=4,'百贯铜':()=>sum(3)>=100,'百节林':()=>sum(2)>=100,
  '六十画':()=>all.filter(v=>suit(v)===1).reduce((n,v)=>n+[0,1,2,3,5,4,4,2,2,2][rank(v)],0)>=60,'起手叫':()=>!!context.initialReady
 };
 return{p,conditions,roots,kongs:kongs.length,darkKongs:darkKongs.length,openKongs:kongs.length-darkKongs.length,seven,pure,triplets,golden};
}

export function scoreHand(hand,missing,melds,profile,context={}){
 const cacheKey=JSON.stringify([hand.slice().sort((a,b)=>a-b),missing,melds,[profile.mode,profile.fanFamily,profile.jokerCount,profile.cap,profile.selfDrawMode],context]);
 if(scoreCache.has(cacheKey))return structuredClone(scoreCache.get(cacheKey));
 const facts=fanFacts(hand,missing,melds,profile,context);if(!facts)return null;
 const candidates=[fan('平胡',1,'基本胡牌')];
 for(const entry of fanCatalog(profile))if(!entry.additional&&facts.conditions[entry.name]?.())candidates.push({...entry});
 if(profile.fanFamily==='crazy'){const lotus=candidates.find(f=>f.name==='九莲宝灯');if(lotus)lotus.multiple*=2**Math.min(context.lotusWins||0,20);}
 const best=candidates.reduce((a,b)=>b.multiple>a.multiple?b:a),additional=[];let rawMultiple=best.multiple;
 if(profile.fanFamily==='sichuan'){
  for(const entry of SICHUAN_FANS.filter(f=>f.additional)){
   const count=entry.name==='根'?facts.roots:entry.name==='杠'?facts.kongs:0;
   if(count){const factor=entry.multiple**count;rawMultiple*=factor;additional.push({...entry,count,factor});}
   else if(!['根','杠'].includes(entry.name)&&facts.conditions[entry.name]()){rawMultiple*=entry.multiple;additional.push({...entry,count:1,factor:entry.multiple});}
  }
  if(context.selfDraw&&profile.selfDrawMode==='double'){rawMultiple*=2;additional.push(fan('自摸加番',2,'自摸乘2',true));}
 }else{
  for(const[name,count,amount]of[['暗杠',facts.darkKongs,2],['明杠',facts.openKongs,1],['红中杠',context.redKongs||0,2]])if(count){rawMultiple+=count*amount;additional.push({...fan(name,amount,'增加倍数',true),count,add:count*amount});}
  if(context.selfDraw&&best.name!=='不求人'){rawMultiple*=2;additional.push({...fan('自摸',2,'自摸乘2',true),factor:2});}
  if(context.revealed){rawMultiple*=6;additional.push({...fan('明牌',6,'明牌乘6',true),factor:6});}
 }
 const cap=profile.cap||32,multiple=Math.min(cap,rawMultiple);
 const result={name:best.name,multiple,rawMultiple,cap,capped:rawMultiple>cap,candidates,additional,baseMultiple:best.multiple};
 scoreCache.set(cacheKey,result);if(scoreCache.size>256)scoreCache.delete(scoreCache.keys().next().value);return structuredClone(result);
}
export function recognizedFans(profile){const dummy=fanFacts([11,12,13,14,15,16,21,22,23,27,28,29,18,18],3,[],profile);return new Set(Object.keys(dummy?.conditions||{}));}
