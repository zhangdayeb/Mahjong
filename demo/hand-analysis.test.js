import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareHand,findStandard,isSevenPairs,canComplete,winningTiles,matchesTiles} from './hand-analysis.js';

test('physical limits, missing suits and meld lengths are validated before joker substitution',()=>{
 const hand=[11,12,13,21,22,23,24,25,26,29,29];
 assert.ok(canComplete(hand,3,[{type:'peng',value:18}]));
 assert.equal(canComplete(hand,1,[{type:'peng',value:18}]),false);
 assert.equal(canComplete([11,11,11,11,12,12,12,21,21,21,22],3,[{type:'peng',value:11}]),false);
 assert.equal(canComplete([11,11,11,11,11,12,13,14,21,22,23,51,51,51],3,[],{jokerCount:4}),false);
});
test('six and eight jokers complete shapes while excessive copies and a fifth natural wait stay illegal',()=>{
 const six=[51,51,51,51,51,51,11,12,13,21,22,23,29,29],eight=[51,51,51,51,51,51,51,51,11,12,13,21,21,21];
 assert.ok(canComplete(six,3,[],{jokerCount:6}));assert.ok(canComplete(eight,3,[],{jokerCount:8}));
 assert.equal(canComplete(eight,3,[],{jokerCount:6}),false);
 assert.ok(!winningTiles([11,11,11,11,21,22,23,24,25,26,27,28,29],3).includes(11));
});
test('specific sequence and triplet queries honor jokers, exposed groups and physical pair requirements',()=>{
 const p=prepareHand([11,12,13,51,51,51,51,51,51,51,51,25,25,25],3,[],{jokerCount:8});
 assert.ok(findStandard(p,{requiredGroups:[{type:'sequence',value:11},{type:'sequence',value:14},{type:'sequence',value:17}]}));
 assert.equal(findStandard(p,{tripletsOnly:true,requiredGroups:[{type:'sequence',value:11}]}),null);
 const pairs=prepareHand([11,11,12,12,13,13,14,14,21,21,22,22,23,51],3,[],{jokerCount:4});
 assert.ok(isSevenPairs(pairs));assert.equal(isSevenPairs(pairs,{allowed:[11,12,13,14]}),false);
 assert.ok(matchesTiles(pairs,[11,11,12,12,13,13,14,14,21,21,22,22,23,23]));
});
test('concealed triplet and narrow-wait queries distinguish a discard completion from a drawn pair',()=>{
 const h=[11,11,11,12,12,12,21,21,21,22,22,22,29,29],p=prepareHand(h,3);
 assert.ok(findStandard(p,{minDark:4,selfDraw:false,winningTile:29}));
 assert.equal(findStandard(p,{minDark:4,selfDraw:false,winningTile:22}),null);
 const closed=prepareHand([11,12,13,21,22,23,24,25,26,27,28,29,18,18],3);
 assert.ok(findStandard(closed,{selfDraw:false,winningTile:12,waitRole:'middle'}));
 assert.ok(findStandard(closed,{selfDraw:false,winningTile:13,waitRole:'edge'}));
});
