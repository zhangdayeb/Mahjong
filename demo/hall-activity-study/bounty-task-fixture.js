// This is the user's screenshot display state, not a live account/task entitlement.
// The fifth row's 0/5 counter is inferred from its visible “完成5局” goal and the
// other unfinished rows. It is not legible in the cropped screenshot.
const reward=Object.freeze({icon:'token',label:'1个'});
const row=(key,desc,neednum,counter,status,extra={})=>Object.freeze({
 key,desc,neednum,counter,status,rewards:Object.freeze([reward]),achieveValue:20,...extra,
});
export const bountyTaskScreenshotFixture=Object.freeze({
 sourceScreenshot:'hall-activity-study/references/bounty-target.png',
 evidence:'screenshot-display-fixture',
 tasks:Object.freeze([
  row('login','每日悬赏-每日登录',1,1,2),
  row('three-rounds','每日悬赏-完成3场对局',3,0,0),
  row('ten-diamonds','每日悬赏-消耗10钻石',10,0,0),
  row('capped-win','每日悬赏-指尖币高级场/大师场\n打出1次封顶',1,0,0),
  row('five-advanced-rounds','每日悬赏-指尖币高级场/大师场\n完成5局',5,0,0,{
   evidence:Object.freeze({counter:'inferred; cropped in screenshot',achieveValue:'same task reward display fixture'}),
  }),
 ]),
});
