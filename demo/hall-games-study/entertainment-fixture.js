// Original entertainment selector appearance captured in the user's initial
// and scrolled screenshots. Card images resolve otherwise duplicate names via
// MatchPlayType's source icon rule: (TileIdx % 100) % typeBgIconSF.length.
const entries=[
 {id:898,name:'十二生肖',en:'SHIERSHENGXIAO',tag:0},
 {id:893,name:'四季常春不洗牌',en:'SIJICHANGCHUN',tag:0},
 {id:883,name:'疯狂8红中',en:'FENGKUANGBAHONGZHONG',tag:0},
 {id:885,name:'8红中不洗牌',en:'BAHONGZHONGBUXIPAI',tag:0},
 {id:870,name:'6红中不洗牌',en:'HONGZHONGBUXIPAI',mode:'sixFixed',tag:0},
 {id:869,name:'四季常春',en:'SIJICHANGCHUN',tag:0},
].map(entry=>Object.freeze(entry));
export const entertainmentFixture=Object.freeze({
 entries:Object.freeze(entries),
 showGameCurrencies:true,
 beforeScreenshot:'hall-games-study/references/entertainment-before.png',
 sourceScreenshot:'hall-games-study/references/entertainment-target.png',
 scrolledScreenshot:'hall-games-study/references/entertainment-scrolled-target.png',
 evidence:Object.freeze([
  'hall_TileView.initRecommendNewSix forwards server enterArr/tagArr to MatchPlayType_Init_YuLe; [2,3] is only the source fallback when this list is missing.',
  'Both screenshots jointly show six regular game entries in order. Names and English spellings match GameTypeCfgs and CommonUtils.getSpellName.',
  'MatchPlayType.__showListEnterInfo chooses typeBgSF[index%6] and typeBgIconSF[(id%100)%6]. Captured backgrounds are[0,1,2,3,4,5]; icons are[2,3,5,1,4,3].',
  'The flower icon proves Crazy8 ID883 (icon5), not same-named888 (icon4); the beach-chair icon proves SixFixed ID870 (icon4), not same-named881 (icon3).',
  'No tags are visible in either screenshot; all entries explicitly use tag0, preserving native TagIcon inactive state.',
  'The captured header shows game beans, finger coins and diamonds; showGameCurrencies selects original standard wallet prefabs. Balances remain supplied by the local host.',
  'MatchPlayTypeItemView.onInitItem raises the title by15 design pixels for entertainment. The original font50 label uses SHRINK2, width280, font32, lineHeight40, no wrap; 四季常春不洗牌 requires actual size29 to fit.',
  'Regular IDs>=100 retain their distinct game type when opening a selector. Only870 maps to the implemented sixFixed practice mode; this fixture does not implement other engines, request matches or change balances.',
 ]),
});
