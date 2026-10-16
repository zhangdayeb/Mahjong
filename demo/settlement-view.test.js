import test from 'node:test';
import assert from 'node:assert/strict';
import {formatSettlementScore,settlementFanRows,settlementHandSnapshot,settlementScrollOffset} from './settlement-view.js';

test('original result number style uses plain small values and large 万 values',()=>{
 assert.equal(formatSettlementScore(12000),'+12000');
 assert.equal(formatSettlementScore(-40000),'-40000');
 assert.equal(formatSettlementScore(-146000),'-14.6万');
 assert.equal(formatSettlementScore(174000),'+17.4万');
});
test('fan rows preserve actual fan names, opponent positions, signs and deltas',()=>{
 const round={base:2000,huEvents:[
  {seat:0,fan:{name:'清一色',multiple:4},deltas:[24000,-8000,-8000,-8000]},
  {seat:2,fan:{name:'对对胡',multiple:2},deltas:[-4000,0,4000,0]},
  {seat:3,fan:{name:'七对',multiple:4},deltas:[0,-8000,0,8000]}
 ],kongPayments:[{from:3,to:0,amount:4000},{from:0,to:1,amount:2000},{from:2,to:3,amount:4000}]};
 const rows=settlementFanRows({round});
 assert.deepEqual(rows.map(row=>[row.label,row.value,row.delta]),[
  ['[下家、对家、上家]清一色','4倍',24000],['[对家]对对胡','-2倍',-4000],['[上家]杠牌','2倍',4000],['[下家]杠牌','-1倍',-2000]
 ]);
 assert.ok(!rows.some(row=>/门清|暗刻/.test(row.label)));
});
test('missing records never invent original screenshot fan outcomes',()=>{
 assert.deepEqual(settlementFanRows({round:{hands:[[11]],scores:[12000,0,0,0]}}),[]);
 assert.deepEqual(settlementFanRows({huEvents:[{seat:1,fan:{name:'清一色',multiple:4},deltas:[0,8000,-8000,0]}]}),[]);
});
test('touch scrolling accounts for screen scale and clamps at both content edges',()=>{
 assert.equal(settlementScrollOffset(20,-30,.75,200),60);
 assert.equal(settlementScrollOffset(20,30,.75,200),0);
 assert.equal(settlementScrollOffset(180,-30,.75,200),200);
});
test('hand uses the latest maximum-fan hu snapshot and never later mutable hand state',()=>{
 const early={seat:0,fan:{multiple:4},hand:[11,11,12,12],melds:[{type:'peng',value:23}]};
 const best={seat:0,fan:{multiple:8},hand:[31,31,32,32],melds:[{type:'gang',value:33}]};
 const latest={seat:0,fan:{multiple:8},hand:[21,21,22,22],melds:[{type:'peng',value:24}]};
 const data={hands:[[51]],melds:[[]],huEvents:[early,best,{seat:1,fan:{multiple:32},hand:[19]},latest,{seat:0,fan:{multiple:2},hand:[13]}]};
 const result=settlementHandSnapshot(data);
 assert.deepEqual(result,{hand:[21,21,22,22],melds:[{type:'peng',value:24}],hu:true,multiple:8});
 data.hands[0].push(11);latest.hand.push(51);latest.melds[0].value=29;
 assert.deepEqual(result.hand,[21,21,22,22]);assert.equal(result.melds[0].value,24);
 const fallback=settlementHandSnapshot({hands:[[11,12]],melds:[[{type:'dark',value:31}]]});
 assert.equal(fallback.hu,false);assert.deepEqual(fallback.hand,[11,12]);
});
