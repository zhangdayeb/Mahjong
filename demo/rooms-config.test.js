import test from 'node:test';
import assert from 'node:assert/strict';
import{variants,variantKeys,roomsForMode,currentRoom}from'./rooms-config.js';
test('native room types retain source scene IDs and do not inherit red-mode stakes or counts',()=>{
 assert.deepEqual(variants.sanguo.sceneIDs,[621,622,623,624,625]);assert.deepEqual(variants.zodiac.sceneIDs,[556,557,558,559,560]);
 assert.equal(variants.sanguo.en,'SANGUOMAJIANG');assert.equal(variants.zodiac.en,'SHIERSHENGXIAO');assert.equal(roomsForMode('sanguo')[4].nativeImage,'hall-games-study/assets/lobby-257.png');
 for(const mode of ['sanguo','zodiac']){const scenes=roomsForMode(mode);assert.equal(scenes.length,mode==='sanguo'?6:5);assert.deepEqual(scenes.slice(0,5).map(s=>s.sceneID),variants[mode].sceneIDs);if(mode==='zodiac'){assert.deepEqual(scenes.map(s=>s.base),[10,10,1000,10000,10000]);assert.deepEqual(scenes.map(s=>s.people),[474,432,717,290,294]);assert.deepEqual(scenes.map(s=>s.limit),['10万-4000万','2000万-6亿','5亿-无限制','20亿-无限制','60亿-无限制']);assert.ok(scenes.every(s=>s.currency==='coins'));}else assert.equal(scenes[5].sceneID,null);assert.ok(scenes.every(s=>s.displayOnly));assert.equal(variants[mode].playable,mode==='sanguo');assert.deepEqual(variantKeys(mode),[mode]);}
 assert.deepEqual(variantKeys('classic'),['classic','exchange']);assert.ok(!variantKeys('red').includes('sanguo'));assert.ok(!variantKeys('red').includes('zodiac'));
});
test('native scene links and server-observed overrides preserve current mode without silent classic fallback',()=>{
 assert.equal(currentRoom('?mode=sanguo&room=624').key,'sanguo');assert.equal(currentRoom('?mode=sanguo&room=624').room.sceneID,624);
 assert.equal(currentRoom('?mode=zodiac&room=558').room.sceneID,558);assert.equal(currentRoom('?mode=unknown').key,'classic');
 const override=[{sceneID:621,id:'621',base:12,people:34,limit:'原观察值'}],result=roomsForMode('sanguo',override);assert.deepEqual(result,override);result[0].base=99;assert.equal(override[0].base,12);
});
