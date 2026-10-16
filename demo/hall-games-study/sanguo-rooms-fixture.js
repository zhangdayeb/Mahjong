// Display values transcribed from the user's original-game room screenshot.
// They are a visual snapshot, not live occupancy, entry eligibility or stakes.
const rows=[
 ['621',621,'新手场',10,295,'10万-4000万',2271],
 ['622',622,'初级场',100,313,'2000万-6亿',666],
 ['623',623,'进阶场',1000,649,'5亿-无限制',1630],
 ['624',624,'高级场',10000,276,'20亿-无限制',1750],
 ['625',625,'大师场',10000,202,'60亿-无限制',257],
 ['sanguo-supreme-reference',null,'至尊场',10000,255,'120亿-无限制',213],
];
export const sanguoRoomScreenshotFixture=Object.freeze({
 sourceScreenshot:'hall-games-study/references/sanguo-rooms-target.png',
 typeID:911,
 recommendedRoomID:'622',
 quickDescription:'三国麻将 初级场',
 rooms:Object.freeze(rows.map(([id,sceneID,name,base,people,limit,image],index)=>Object.freeze({
  id,sceneID,name,base,number:String(base),people,limit,currency:'coins',
  nativeImage:`hall-games-study/assets/lobby-${image}.png`,sceneIndex:index,
  displayOnly:true,referenceOnly:sceneID===null,recommended:id==='622',
  source:'User screenshot room display order; known source SGMJ2 IDs retained for the first five. The sixth server ID is unconfirmed.',
 }))),
});
