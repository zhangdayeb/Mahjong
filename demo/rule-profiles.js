export const RULES_VERSION=2;
const shared={rulesVersion:2,settlement:true,callTransfer:true,passedHu:true,selfDrawMode:'none',jokerCount:0,exchange:false,exchangeAnySuit:false,exchangeDirection:'clockwise',noShuffle:false,redKong:false,reveal:false};
export const RULE_PROFILES=Object.freeze({
 classic:{...shared,mode:'classic',name:'血流麻将',fanFamily:'sichuan',ruleID:144,cap:32,flowerCap:64},
 exchange:{...shared,mode:'exchange',name:'血流换三张',fanFamily:'sichuan',ruleID:149,cap:32,flowerCap:64,exchange:true,exchangeDirection:'seeded'},
 red:{...shared,mode:'red',name:'血流红中',fanFamily:'red',ruleID:863,cap:32,flowerCap:32,jokerCount:4,exchange:true,exchangeAnySuit:true,exchangeDirection:'opposite'},
 six:{...shared,mode:'six',name:'血流六红中',fanFamily:'red',ruleID:868,cap:64,flowerCap:64,jokerCount:6},
 sixFixed:{...shared,mode:'sixFixed',name:'6红中不洗牌',fanFamily:'red',ruleID:870,cap:64,flowerCap:64,jokerCount:6,noShuffle:true},
 crazy:{...shared,mode:'crazy',name:'疯狂8红中',fanFamily:'crazy',ruleID:883,cap:8888,flowerCap:8888,jokerCount:8,redKong:true,reveal:true},
 eightFixed:{...shared,mode:'eightFixed',name:'8红中不洗牌',fanFamily:'eight',ruleID:885,cap:128,flowerCap:128,jokerCount:8,noShuffle:true,redKong:true,reveal:true}
});
export function ruleProfile(mode){const profile=RULE_PROFILES[mode];if(!profile)throw Error('这个玩法暂未开放');return{...profile,red:profile.jokerCount>0};}
export function ruleModeForId(value){return Object.keys(RULE_PROFILES).find(mode=>RULE_PROFILES[mode].ruleID===Number(value))||null;}
