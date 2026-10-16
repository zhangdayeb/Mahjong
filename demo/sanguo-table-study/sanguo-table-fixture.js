// Captured ready-table display only. No dealt tiles, hero logic, opponents or online clock are simulated.
const avatar=name=>`sanguo-table-study/assets/captured-avatar-${name}.png`;
const players=[
 {sourceSeatIndex:0,seat:0,position:'mine',displayName:'420152...',rankLevel:4,rankIndex:0,rankName:'初阶雀尊',avatar:avatar('mine'),balanceText:'2800万',ready:true},
 {sourceSeatIndex:1,seat:3,position:'left',displayName:'何珠浪...',nameConfidence:'Visible cropped nickname only; second character should be checked against the reference, not interpreted as a complete account name.',rankLevel:1,rankIndex:0,rankName:'初阶雀尊',avatar:avatar('left'),balanceText:'34.2万',ready:true},
 {sourceSeatIndex:2,seat:2,position:'front',displayName:'白马过...',rankLevel:21,rankIndex:4,rankName:'雀神',avatar:avatar('front'),balanceText:'99.7万',ready:true},
 {sourceSeatIndex:3,seat:1,position:'right',displayName:'枝上懒...',rankLevel:6,rankIndex:1,rankName:'超凡雀尊',avatar:avatar('right'),balanceText:'55万',ready:false},
].map(player=>Object.freeze(player));
export const sanguoReadyTableFixture=Object.freeze({
 beforeScreenshot:'sanguo-table-study/references/before.png',
 sourceScreenshot:'sanguo-table-study/references/target.png',
 screenshotSize:Object.freeze([986,483]),
 typeID:911,sceneID:621,phase:'waiting-ready',title:'三国麻将',base:10,maxFan:999999,
 subtitle:'底注:10 封顶:999999倍',
 readySourceSeats:Object.freeze([0,1,2]),
 readySeats:Object.freeze([0,3,2]),
 players:Object.freeze(players),
 clockDisplay:'10-06 10:05',batteryPercent:null,networkLatency:null,
 displayOnly:true,
 evidence:Object.freeze({
  bundledAssets:'Original prefab2910/653/2595 geometry and SpriteFrames are exported independently in table.json and frames.json.',
  accountData:'These four small avatar images, displayed rank numbers, truncated names and balance strings are a visual snapshot from the user target. They are not local account state or artificial opponents.',
  ready:'Only mine, left and front display the settled original ready badge in the target. Right is waiting.',
  rules:'The screenshot is before dealing. No Sanguo tile wall, hero hands, turn logic or rewards are inferred.',
 }),
});
