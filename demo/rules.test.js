import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck, canWin, chooseDiscard, exchangeIndices } from './rules.js';
test('108 tiles, four of every tile, no honors',()=>{
  const deck=createDeck();assert.equal(deck.length,108);
  for(let s=1;s<=3;s++)for(let n=1;n<=9;n++)assert.equal(deck.filter(v=>v===s*10+n).length,4);
});
test('complete hands, seven pairs, missing suit and incomplete hands',()=>{
  const normal=[11,12,13,14,15,16,21,22,23,27,27,27,29,29];
  assert.equal(canWin(normal,3),true);assert.equal(canWin(normal,1),false);
  assert.equal(canWin(normal.slice(1),3),false);
  assert.equal(canWin([11,11,12,12,13,13,14,14,21,21,22,22,23,23],3),true);
  assert.equal(canWin([11,12,13,14,15,16,21,22,23,27,27,28,29,29],3),false);
});
test('exchange chooses three same-suit tiles and discard respects missing suit',()=>{
  const hand=[11,12,13,14,21,22,23,31,32,33,34,35,36,39];
  const picks=exchangeIndices(hand);assert.equal(picks.length,3);assert.ok(picks.every(i=>Math.floor(hand[i]/10)===2));
  assert.equal(Math.floor(hand[chooseDiscard(hand,1)]/10),1);
});
