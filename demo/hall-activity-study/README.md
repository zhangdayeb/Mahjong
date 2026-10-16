# 大厅活动来源

`collect-hall-activities.mjs` 从已保存的原游戏 Cocos 编译资源读取节点、SpriteFrame、字体、组件点击事件。`extract-hall-activities.py` 按原图集旋转、裁切和 offset 提取图片，并只补一次 originalSize 透明边距。

|入口|原预制体 ID|本地入口 key|
|---|---:|---|
|每日福利|2692|daily|
|自选宝藏|63，选择117，抽奖70|treasure|
|幸运转盘|4，奖励单元93|wheel|
|开运福利|899，后续骰子2329|luck|
|奇珍阁|193，奖励单元22|attic|
|每日悬赏|2567，规则/记录3128|bounty|
|指尖周卡|709（复用已完成模块）|week|
|番型收集|2366（复用已完成模块）|collection|

本组包含23个原预制体和207张原 SpriteFrame，无未解析的预制体 SpriteFrame。新增每日悬赏的原指尖币、玉兔呈祥、章鱼、悬赏令和EXP图标。另有奇珍阁规则原字体 SourceHanSansCN-Regular，8,164,040字节，lobby540；下载来源、SHA256在 `source/font.json`，通过 `collect-hall-activity-fonts.mjs` 复现。原材质、配置等非 SpriteFrame UUID 单独列在 `nonSpriteReferences`，不是丢失的图片。

## 实现范围

独立 `native-hall-activities.js/css` 绘制原背景、标题、装饰、原按钮、原节点大小/锚点/TRS、cc.Widget 对宽屏的布局、遮罩裁切和对应点击区。每日福利支持横向滚动。奇珍阁规则和记录、悬赏规则和记录、悬赏每日/每周页签、自选选择页均由原预制体构成；规则可滚动。

带原 `ui_Canvas` 组件但未序列化 Widget 的节点，会按 `source/ui_Canvas.js` 的 onLoad 补四边零距离、flags45的布局。每日悬赏全屏遮罩因此随舞台宽度拉伸；任务列表及奖品格内的遮罩维持各自源尺寸。

原服务端在 `customTreasureCfg`、`treasureAtticCfg`、悬赏活动配置、`getSlyderCfg()` 中动态提供奖池、奖品图、领取资格和账户数据。初版未取得这些配置，相关槽位保留空容器，未知数字显示 `—`。不把序列化模板里的3280钻石/400/1/20等样例当实际账户状态。领取、抽奖和购买按钮只给本地反馈，不修改余额。

幸运转盘现使用用户提供的准确截图 `references/wheel-target.png` 作为本地视觉参数：8格顺时针为18880豆、15钻石、8钻石、3钻石、8880万豆、100万豆、10万豆、50000豆，提示为看视频剩余8次。这个8是截图显示值，不是本地账户资格。`wheel-fixture.js` 明确记录来源，点击不扣次数、不随机派奖、不写余额。圆半径166、8格源index映射[0,7,6,5,4,3,2,1]、原6图索引、22.5°初始转角及标签直立来自 SlyderView/SlyderItem。

每日悬赏现用 `references/bounty-target.png` 绑定十二格原奖池和五条每日任务。任务使用原内联 PassCheckTaskItem，530×100行、97行步长、540×460裁切区、194进度条；支持鼠标/触摸上下拖动。玉兔呈祥是原牌桌图，按源 `.47` 缩放；章鱼与指尖币保留源 `.45/.4`。悬赏令0及6天05小时27分13秒是截图固定显示值，未模拟在线资格或截止时间。第五条0/5由可见目标“完成5局”推断，来源注释保留在 `bounty-task-fixture.js`。每周任务配置仍未取得；不会把每日任务复制成每周任务。领取与悬赏按钮只反馈本地预览，不变任务状态、余额或资格。

本组不能宣称已完整复刻所有活动奖池、领取弹窗或骰子三维动画。正在用原站逐页截图继续对照动态内容；已取得的结构与已核对的在线内容应分别记录。

## 使用

```js
import {createNativeHallActivities} from './native-hall-activities.js';
const activities = createNativeHallActivities(stage, {
  balances: {beans:'57万', coins:'300万', diamond:'0'},
  onWeekCard: () => weekly.show(),
  onCollection: mode => collection.show(mode),
});
await activities.show('每日福利');
// .ready / .show(key或中文名) / .close() / .open / .setBalances / .setWheelState / .setBountyState / .dispose()
```

独立预览：`http://127.0.0.1:8770/hall-activity-study/preview.html?activity=daily`。

验证：`node --test native-hall-activities.test.js bounty-runtime.test.js hall-activity-study/bounty-tasks.test.js`，覆盖原图尺寸、宽屏 Widget/遮罩点击范围、十二奖池原图及槽位、任务进度/状态/滚动，以及资源加载期间 resize、真实子页和余额保持。
