import test from 'node:test';
import assert from 'node:assert/strict';
import {SANGUO_GUIDE_STORAGE_KEY,shouldAutoOpenSanguoGuide,recordSanguoGuideShown,readSanguoGuideState,sanguoGuideToday} from './sanguo-guide-entry.js';
function memoryStorage(values={}){return{values:new Map(Object.entries(values)),calls:[],getItem(key){this.calls.push(['get',key]);return this.values.get(key)??null;},setItem(key,value){this.calls.push(['set',key,value]);this.values.set(key,value);}};}
const entry=(today,extra={})=>({typeID:911,isLoginToHall:true,isNewUser:false,today,...extra});
test('local day keeps source date formatting and uses the user time zone at midnight',()=>{
 assert.equal(sanguoGuideToday(new Date('2026-10-05T16:59:00Z')),'2026_10_5');assert.equal(sanguoGuideToday(new Date('2026-10-05T17:00:00Z')),'2026_10_6');assert.equal(sanguoGuideToday(new Date('2026-10-05T17:00:00Z'),'UTC'),'2026_10_5');
});

test('automatic entry repeats on a new day, not on same-day room reentry, and records before closing',()=>{
 const storage=memoryStorage();
 assert.deepEqual(readSanguoGuideState(storage),{day:'000',popped:false});
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),storage),true);
 assert.deepEqual(recordSanguoGuideShown('2026_10_6',storage),{day:'2026_10_6',popped:true,persisted:true});
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),storage),false);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_7'),storage),true);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_7',{isLoginToHall:false}),storage),false,'returning from a game is not login -> hall');
 recordSanguoGuideShown('2026_10_7',storage);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_7'),storage),false);
 assert.ok(storage.calls.every(call=>call[1]===SANGUO_GUIDE_STORAGE_KEY),'no original account persistence key is touched');
});

test('new users still see the guide when the daily marker is today but ever-shown is false',()=>{
 const storage=memoryStorage({[SANGUO_GUIDE_STORAGE_KEY]:JSON.stringify({day:'2026_10_6',popped:false})});
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),storage),false);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6',{isLoginToHall:false,isNewUser:true}),storage),true);
 recordSanguoGuideShown('2026_10_6',storage);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6',{isLoginToHall:false,isNewUser:true}),storage),false);
 assert.equal(shouldAutoOpenSanguoGuide({typeID:911,isNewUser:true,isLoginToHall:false},memoryStorage()),true);
 assert.equal(shouldAutoOpenSanguoGuide({typeID:911,isLoginToHall:true},memoryStorage()),false,'missing server/local day cannot form a daily comparison');
});

test('non-Sanguo entries never inspect or change guide state',()=>{
 const storage={getItem(){throw Error('must not read');},setItem(){throw Error('must not write');}};
 for(const typeID of[898,866,908,0,null,undefined])assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6',{typeID,isNewUser:true}),storage),false);
});

test('blocked or malformed local storage degrades to a current-session seen record',()=>{
 const broken={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};
 assert.doesNotThrow(()=>assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),broken),true));
 assert.equal(recordSanguoGuideShown('2026_10_6',broken).persisted,false);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),broken),false);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_7'),broken),true);
 const writeDenied={getItem(){return JSON.stringify({day:'2026_10_5',popped:false});},setItem(){throw Error('quota');}};
 recordSanguoGuideShown('2026_10_6',writeDenied);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),writeDenied),false,'a stale readable value cannot supersede the failed-write memory record');
 const corrupt=memoryStorage({[SANGUO_GUIDE_STORAGE_KEY]:'{not JSON'});
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),corrupt),true);
 recordSanguoGuideShown('2026_10_6',corrupt);
 const state=readSanguoGuideState(corrupt);state.popped=false;
 assert.equal(readSanguoGuideState(corrupt).popped,true,'callers receive a copy of the stored record');
 assert.equal(recordSanguoGuideShown('2026_10_6',null).persisted,false);
 assert.equal(shouldAutoOpenSanguoGuide(entry('2026_10_6'),null),false,'storage-unavailable fallback suppresses same-session repeat');
});
