// Captured appearance of the original Sichuan selector, not a live region
// catalog. Initial and scrolled screenshots resolve twelve visible cards;
// duplicate game IDs remain explicitly unresolved.
const entries=[
 {name:'6红中不洗牌',typeID:null,candidates:[870,881],mode:'sixFixed',row:0,column:0,originalIndex:1,sourceIndex:1,people:904,tag:0},
 {name:'血流6红中',typeID:868,mode:'six',row:0,column:1,originalIndex:2,sourceIndex:2,people:5688,tag:0},
 {name:'血流换三张',typeID:null,candidates:[149,895],mode:'exchange',row:0,column:2,originalIndex:3,sourceIndex:3,people:16984,tag:4},
 {name:'四川倒倒胡',typeID:841,row:0,column:3,originalIndex:8,sourceIndex:0,people:2211,tag:0},
 {name:'癞子血流',typeID:864,row:1,column:0,originalIndex:5,sourceIndex:5,people:1021,tag:0},
 {name:'四季常春',typeID:869,row:1,column:1,originalIndex:6,sourceIndex:6,people:1996,tag:0},
 {name:'血流成河',typeID:144,mode:'classic',row:1,column:2,originalIndex:7,sourceIndex:7,people:3462,tag:0},
 {name:'内江麻将',typeID:829,row:1,column:3,originalIndex:9,sourceIndex:1,people:2532,tag:0},
 {name:'巴中麻将',typeID:830,row:0,column:4,originalIndex:10,sourceIndex:2,people:1674,tag:0},
 {name:'血战到底',typeID:143,row:1,column:4,originalIndex:11,sourceIndex:3,people:25474,tag:0},
 {name:'大众麻将',typeID:181,row:0,column:5,originalIndex:12,sourceIndex:4,people:11126,tag:4},
 {name:'血战换三张',typeID:148,row:0,column:6,originalIndex:4,sourceIndex:4,people:18806,tag:0},
].map(entry=>Object.freeze({...entry,...(entry.candidates?{candidates:Object.freeze(entry.candidates)}:{})}));
export const sichuanCollectionFixture=Object.freeze({
 province:'四川',
 areaCode:51,
 entries:Object.freeze(entries),
 quickRecommendation:Object.freeze({mode:'red',typeID:866,name:'血流红中',roomId:'beginner',description:'血流红中.新手场'}),
 sourceScreenshot:'hall-games-study/references/collection-target.png',
 beforeScreenshot:'hall-games-study/references/collection-before.png',
 scrolledScreenshot:'hall-games-study/references/collection-scrolled-target.png',
 scrolledBeforeScreenshot:'hall-games-study/references/collection-scrolled-before.png',
 sourceIndices:Object.freeze([1,2,3,0,5,6,7,1,2,3,4,4]),
 evidence:Object.freeze([
  'ProvinceChoose.getAreaList explicitly maps 四川 to iAreaCode51; the shown title is ProvinceGameTypeView.initProvinceLabel(sName).',
  'ProvinceGameTypeView uses server PlayCfgs.CoinGame order; this fixture reconstructs twelve visible cards from the initial and scrolled screenshots, not a fetched online catalog.',
  'Source checkXlhzSavedTileNode hides original0=866 when868 is also present and moves original4 (血战换三张) from the lower-row start to the upper-row end; quick still uses CoinGame[0].',
  'Captured visible upper original indices are[1,2,3,8,10,12,4]; lower are[5,6,7,9,11]. Explicit row/column preserve the seven/five layout instead of default alternating insertion.',
  'ProvinceGameTypeItem shows its baked hot tag only for iTag===4; the screenshots prove it on 血流换三张 and 大众麻将.',
  'Background indices address original ProvinceGameTypeItem.spfBgs zero-based: pink0/orange1/green2/purple3/blue4/blue5/cyan6/gold7.',
  'The scrolled screenshot plus initial prefixes confirm 四川倒倒胡/2211 and 内江麻将/2532; partial-title offsets are removed in favor of full native centered titles.',
  'Static GameTypeCfgs uniquely maps 四川倒倒胡841, 内江829, 巴中830, 大众181, 血战到底143 and 血战换三张148. Blood-flow duplicate IDs remain candidates. War variants are not mapped to blood-flow practice modes.',
  'QuikStart._getFullDesc joins server game name and scene level with an ASCII dot; screenshot recommendation is a local display fixture.',
  'People counts are captured screenshot values. This module sends no requests and changes no balances.',
 ]),
});
