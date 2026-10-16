import test from 'node:test';
import assert from 'node:assert/strict';
import {scoreHand,fanCatalog,recognizedFans} from './bloodflow-scoring.js';
import {ruleProfile,RULE_PROFILES} from './rule-profiles.js';
const profile=mode=>({...ruleProfile(mode),cap:100000000});
const entry=(result,name)=>result?.candidates.find(f=>f.name===name);

test('every advertised base fan has an executable recognizer',()=>{
 for(const mode of Object.keys(RULE_PROFILES)){const p=profile(mode),recognized=recognizedFans(p);for(const fan of fanCatalog(p).filter(f=>!f.additional))assert.ok(recognized.has(fan.name),mode+'/'+fan.name);}
});
test('ordinary seven pairs and clear combinations receive their actual fan values',()=>{
 const seven=[11,11,12,12,13,13,14,14,21,21,22,22,23,23];
 const result=scoreHand(seven,3,[],profile('exchange'),{tile:23,selfDraw:false});assert.equal(entry(result,'七对').multiple,4);assert.equal(result.baseMultiple,4);
 const pure=[11,11,12,12,13,13,14,14,15,15,16,16,17,17],clear=scoreHand(pure,3,[],profile('classic'),{tile:17});assert.equal(clear.name,'清七对');assert.equal(clear.baseMultiple,16);
 const mixed=[11,11,11,12,12,12,21,21,21,22,22,22,29,29];assert.equal(entry(scoreHand(mixed,3,[],profile('classic'),{tile:22}),'对对胡').multiple,2);
});
test('red high-value poems and terminal hands are counted, capped and never silently reduced to flat hu',()=>{
 const cases=[['连七对',[11,11,12,12,13,13,14,14,15,15,16,16,17,17],88],['一色双龙会',[11,12,13,11,12,13,17,18,19,17,18,19,15,15],64],['九莲宝灯',[11,11,11,12,13,14,15,16,17,18,19,19,19,15],64],['清幺九',[11,11,11,11,19,19,19,19,21,21,21,21,29,29],88]];
 for(const[name,hand,multiple]of cases){const result=scoreHand(hand,3,[],profile('red'),{tile:hand.at(-1)});assert.equal(entry(result,name)?.multiple,multiple,name);const capped=scoreHand(hand,3,[],ruleProfile('red'),{tile:hand.at(-1)});assert.equal(capped.multiple,32);assert.ok(capped.capped);}
 const bad=cases[0][1].slice();bad[0]=31;assert.equal(scoreHand(bad,3,[],profile('red')),null);
});
test('red range, sequence, triplet and concealed features use real decompositions',()=>{
 const steps=[11,11,11,12,12,12,13,13,13,14,14,14,21,21],r=scoreHand(steps,3,[],profile('red'),{tile:21});assert.equal(entry(r,'四节高')?.multiple,24);assert.equal(entry(r,'四暗刻')?.multiple,16);
 const exposed=scoreHand([11,11,11,12,12,12,13,13,13,21,21],3,[{type:'peng',value:14}],profile('red'),{tile:21});assert.equal(entry(exposed,'四暗刻'),undefined);assert.ok(entry(exposed,'三暗刻'));
 const green=[22,23,24,26,26,26,28,28,28,22,22,22,24,24];assert.equal(entry(scoreHand(green,1,[],profile('red'),{tile:24}),'绿一色')?.multiple,48);
 const dragon=[11,12,13,14,15,16,17,18,19,21,21,21,22,22];assert.equal(entry(scoreHand(dragon,3,[],profile('red'),{tile:22}),'清龙')?.multiple,6);
});
test('self draw, supplement kongs, revealed hands and physical roots are accounted without double counting',()=>{
 const melds=[{type:'dark',value:11},{type:'gang',value:12},{type:'peng',value:21},{type:'add',value:22}],hand=[29,29];
 const plain=scoreHand(hand,3,melds,profile('eightFixed'),{tile:29}),drawn=scoreHand(hand,3,melds,profile('eightFixed'),{tile:29,selfDraw:true,redKongs:2,revealed:true});
 assert.equal(drawn.rawMultiple,(plain.baseMultiple+2+2+4)*2*6);assert.equal(drawn.additional.find(f=>f.name==='明杠').add,2);assert.equal(drawn.additional.find(f=>f.name==='暗杠').add,2);
 assert.equal(entry(plain,'根'),undefined,'the physical kong is not counted again as a root');
 const caught=scoreHand([11,12,13,14,15,16,21,22,23,27,28,29,18,18],3,[],profile('red'),{tile:18,robKong:true,wallCount:0});assert.ok(entry(caught,'抢杠胡'));assert.ok(entry(caught,'海底捞月'));
});
test('eight-joker bonuses and repeat lotus use their variant-specific values',()=>{
 const hand=[51,51,51,51,51,51,51,51,11,12,13,21,21,21];assert.equal(entry(scoreHand(hand,3,[],profile('crazy'),{tile:21}),'八仙过海')?.multiple,16);
 const lotus=[11,11,11,12,13,14,15,16,17,18,19,19,19,15],a=scoreHand(lotus,3,[],profile('crazy'),{tile:15,lotusWins:0}),b=scoreHand(lotus,3,[],profile('crazy'),{tile:15,lotusWins:2});assert.equal(entry(a,'九莲宝灯').multiple,1999);assert.equal(entry(b,'九莲宝灯').multiple,7996);
});
