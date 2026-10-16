import test from 'node:test';
import assert from 'node:assert/strict';
import {liveRulebook,liveRulesHtml} from './live-rulebook.js';
import {RULE_PROFILES} from './rule-profiles.js';
import {fanCatalog} from './bloodflow-scoring.js';
import {tableWaits,tableLedger,visibleTableTiles} from './table-panels.js';
import {settlementFanRows} from './settlement-view.js';
import {normalizeFanName} from './fan-effects.js';
test('live rulebooks expose exactly the runtime profile and fan definitions, including approved cut-only continuation',()=>{
 for(const [mode,p] of Object.entries(RULE_PROFILES)){const book=liveRulebook(mode);assert.equal(book.id,String(p.ruleID));assert.equal(book.profile.cap,p.cap);assert.equal(book.profile.jokerCount,p.jokerCount);assert.deepEqual(liveRulebook(p.ruleID),book);const text=liveRulesHtml(mode);assert.ok(text.includes(`${p.cap}倍`));assert.ok(text.includes('人机练习'));for(const fan of fanCatalog(p).filter(f=>!f.additional))assert.ok(text.includes(`${fan.name}【${fan.multiple}倍】`));if(p.noShuffle)assert.match(text,/首局随机洗牌.*仅随机切牌/);}
 assert.equal(liveRulebook('sanguo'),null);assert.equal(liveRulebook('zodiac'),null);assert.equal(normalizeFanName('九莲宝灯'),'九莲宝灯');assert.equal(normalizeFanName('平胡'),'');
});
test('v2 waits and visible counts honor eight jokers without reading a hidden opponent kong',()=>{
 const round={config:{...RULE_PROFILES.crazy,red:true},hands:[[11,12,13,21,22,23,24,25,26,27,28,29,29],[],[],[]],melds:[[],[{type:'dark',value:29}],[],[]],discards:[[],[],[],[]],missing:[3,3,3,3],redKongs:[[],[51],[],[]],wonTiles:[]};
 const a=tableWaits(round);assert.equal(a.items.find(x=>x.tile===51).remain,7);assert.equal(a.items.find(x=>x.tile===29).remain,2);assert.equal(visibleTableTiles(round).filter(v=>v===29).length,2);
 round.melds[1][0].value=19;round.hands[1]=Array(13).fill(51);assert.deepEqual(tableWaits(round),a);
});
test('ledger and settlement include refunds, call transfer, flower and ready adjustments using actual paid coins',()=>{
 const round={config:{rulesVersion:2},scores:[100,-100,0,0],huEvents:[],kongPayments:[],settlementEvents:[{kind:'call_transfer',label:'呼叫转移',from:1,to:0,amount:150},{kind:'tax_refund',label:'退税',from:0,to:1,amount:50}],log:[]};
 assert.deepEqual(tableLedger(round).rows.map(r=>r.amount),[150,-50]);assert.deepEqual(settlementFanRows(round).map(r=>r.delta),[150,-50]);assert.ok(settlementFanRows(round).every(r=>r.value.endsWith('金币')));
});
