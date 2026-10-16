import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {hallGames,hallGameHref,hallRuleEntries,publicEntryRedirect} from './hall-game-catalog.js';
import {resolveRoomRule} from './native-room-rules.js';

test('public cards distinguish playable entries from rule previews and every preview resolves real rules',()=>{
 const rules=JSON.parse(fs.readFileSync(new URL('rule-study/RuleCfg.json',import.meta.url)));
 assert.equal(hallGames.length,7);assert.equal(new Set(hallGames.map(game=>game.mode)).size,7);
 assert.deepEqual(hallGames.filter(game=>!game.preview).map(game=>game.mode),['classic','red','exchange','six','sixFixed','crazy','eightFixed']);
 for(const game of hallGames){assert.ok(fs.existsSync(new URL(game.art,import.meta.url)));assert.ok(resolveRoomRule(rules,game.ruleID));assert.equal(hallGameHref(game),game.preview?`hall.html?rules=${game.mode}`:`rooms.html?mode=${game.mode}`);}
 assert.ok(hallRuleEntries.every(entry=>![898,911].includes(entry.id)));
});

test('public room and table entry points never load removed games or unfinished practice variants',()=>{
 for(const page of ['rooms-entry.js','reference-entry.js']){
  const code=fs.readFileSync(new URL(page,import.meta.url),'utf8').replace(/^import .*;\r?$/gm,'').replace(/await import\('[^']+'\)/,'openGame()');
  for(const mode of ['sanguo','zodiac',...hallGames.map(game=>game.mode)]){
   const calls=[],location={search:`?mode=${mode}&room=beginner`,replace:target=>calls.push(['redirect',target])};
   vm.runInNewContext(code,{location,publicEntryRedirect,openGame:()=>calls.push(['open'])});
   const target=publicEntryRedirect(location.search);assert.deepEqual(calls,target?[['redirect',target]]:[['open']],`${page}/${mode}`);
  }
 }
 assert.equal(publicEntryRedirect('?mode=sanguo'),'hall.html');assert.equal(publicEntryRedirect('?mode=zodiac'),'hall.html');
 assert.equal(publicEntryRedirect('?mode=unknown'),null);
 const oldTable=fs.readFileSync(new URL('sanguo-table.html',import.meta.url),'utf8');
 assert.match(oldTable,/http-equiv="refresh"/);assert.doesNotMatch(oldTable,/<script/);
});
