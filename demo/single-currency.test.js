import test from 'node:test';
import assert from 'node:assert/strict';
import {hallGamesModel} from './native-hall-games.js';
import {sichuanCollectionFixture} from './hall-games-study/sichuan-collection-fixture.js';
import {entertainmentFixture} from './hall-games-study/entertainment-fixture.js';

test('all live native selectors show just one interactive coin balance without losing game entries',()=>{
 for(const [mode,options]of [['rooms',{typeID:911,showFanGather:true}],['rooms',{typeID:898,showFanGather:true}],['collection',sichuanCollectionFixture],['fun',entertainmentFixture],['match',{}]]){
  const model=hallGamesModel({mode,...options,singleCurrency:true,balances:{coins:'3万'}});
  const controls=model.controls.filter(control=>control.action.type==='currency');
  assert.equal(controls.length,1,mode);
  assert.equal(controls[0].action.currency,'coins');assert.equal(controls[0].label,'金币余额详情');
  assert.ok(model.records.some(node=>node.active&&node.path.startsWith('currency-coins/')&&node.text==='3万'));
  assert.ok(model.entryInfo.length>0);
 }
});
