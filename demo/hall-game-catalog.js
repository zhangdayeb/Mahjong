import {variants} from './rooms-config.js';

// Keep the original game definitions for saved round replay; the public hall
// exposes only the seven implemented bloodflow variants.
const entries=[
 {mode:'classic',ruleID:144,icon:'Match-22.png',tone:'jade'},
 {mode:'red',ruleID:863,icon:'Match-163.png',tone:'rose'},
 {mode:'exchange',ruleID:149,icon:'Match-82.png',tone:'teal'},
 {mode:'six',ruleID:868,icon:'Match-22.png',tone:'blue',preview:false,mark:'6'},
 {mode:'sixFixed',ruleID:870,icon:'Match-90.png',tone:'amber',preview:false,mark:'6'},
 {mode:'crazy',ruleID:883,icon:'Match-286.png',tone:'orchid',preview:false,mark:'8'},
 {mode:'eightFixed',ruleID:885,icon:'Match-82.png',tone:'sand',preview:false,mark:'8'}
];
export const hallGames=Object.freeze(entries.map(entry=>Object.freeze({...entry,name:variants[entry.mode].name,en:variants[entry.mode].en,preview:!!entry.preview,art:'hall-games-study/assets/'+entry.icon})));
export function hallGameForMode(mode){return hallGames.find(game=>game.mode===mode)||null;}
export function hallGameHref(game){return game.preview?`hall.html?rules=${game.mode}`:`rooms.html?mode=${game.mode}`;}
export function publicEntryRedirect(search=''){
 const mode=new URLSearchParams(search).get('mode');
 if(['sanguo','zodiac'].includes(mode))return 'hall.html';
 const game=hallGameForMode(mode);
 return game?.preview?hallGameHref(game):null;
}
export const hallRuleEntries=Object.freeze(hallGames.map(game=>Object.freeze({id:game.ruleID,name:game.name,spell:game.en})));
