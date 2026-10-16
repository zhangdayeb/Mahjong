import {sanguoReadyTableFixture} from './sanguo-table-fixture.js';
const captured=sanguoReadyTableFixture.players;
export const sanguoDealtTableFixture=Object.freeze({
 typeID:911,sceneID:623,phase:'dealt-preview',title:'三国麻将',base:1000,maxFan:999999,
 screenshotSize:Object.freeze([999,508]),sourceScreenshot:'sanguo-table-study/references/dealt-target.png',
 // The screenshot has a thirteen-tile hand and thirteen concealed backs per opponent.
 hand:Object.freeze([113,113,113,114,114,114,115,115,115,115,163,163,163]),
 opponentHandCounts:Object.freeze([0,13,13,13]),readySourceSeats:Object.freeze([]),
 players:Object.freeze([
  Object.freeze({...captured[0],balanceText:'9.72亿',ready:false}),
  Object.freeze({...captured[1],displayName:'…',balanceText:'7.05亿',ready:false,nameConfidence:'Nickname and avatar are obscured by the expanded menu; previous neutral head retained.'}),
  Object.freeze({...captured[2],displayName:'杰爱机',rankLevel:11,rankIndex:2,rankName:'雀圣',balanceText:'5.09亿',avatar:'sanguo-table-study/assets/dealt-avatar-front.png',ready:false}),
  Object.freeze({...captured[3],displayName:'纯情小…',rankLevel:19,rankIndex:3,rankName:'超凡雀王',balanceText:'7.35亿',avatar:'sanguo-table-study/assets/dealt-avatar-right.png',ready:false}),
 ]),
 dealerSourceSeatIndex:1,remaining:82,clockDisplay:'10-06 10:47',networkLatency:119,displayOnly:true,
 evidence:Object.freeze({state:'Captured static post-deal table. No countdown value or whose turn is inferred.',accountData:'Only screen labels and two small account-avatar crops are used; balances are not local account values.',layout:'Original table hand placement and tile painter order; source SG frame names are used without substituting bloodflow tiles.'}),
});
