# 十二生肖场次截图核对

目标为 [zodiac-rooms-target.png](references/zodiac-rooms-target.png)，修改前为 [zodiac-rooms-before.png](references/zodiac-rooms-before.png)。`zodiac-rooms-fixture.js` 保存这张原游戏截图的显示资料，不把数值当作实时在线人数、入场资格或已实现的牌局逻辑。

原 `GameTypeCfgs.SESXMJ` 明列类型898，场次ID `[556,557,558,559,560]`。截图按此五级顺序显示，不增加未出现的第六场，也不改用其他玩法的场次ID。

|原场次ID|场次|底分显示|人数|指尖币入场范围|原背景资源|
|---:|---|---:|---:|---|---|
|556|新手场|10|474|10万-4000万|lobby2271|
|557|初级场|10|432|2000万-6亿|lobby666|
|558|进阶场|1000|717|5亿-无限制|lobby1630|
|559|高级场|10000|290|20亿-无限制|lobby1750|
|560|大师场|10000|294|60亿-无限制|lobby257|

新手和初级都是10，是截图明确显示值；高级与大师也同为10000。本地按图保存，不根据等级推导10倍递增数列。推荐场是557初级场，本地推荐文案为“十二生肖.初级场”。

## 资料接口

```js
import {zodiacRoomScreenshotFixture} from './hall-games-study/zodiac-rooms-fixture.js';
// typeID / recommendedRoomID / quickDescription / rooms / screenshot references
```

结构与 `sanguoRoomScreenshotFixture` 一致：每项 `id` 为字符串场次ID，另有原数值 `sceneID`、`name/base/number/people/limit`、`currency:'coins'` 和原 `nativeImage` 路径。五项均 `displayOnly:true`、`referenceOnly:false`，仅557标记为推荐。

`referenceOnly:false` 只表示这五个场次ID都有原代码依据；`displayOnly:true` 明确这是截图展示配置，不等于已经具备真实游戏引擎或线上入场能力。资料对象及其每项只读，不进行网络请求或改余额。

## 原页面与绘制依据

场次页面采用原 `Hall_TableSelPanel`（prefab43），卡片采用原 `TableSelItem`（prefab196）的前五张 `SpriteFrameScene`。白色人数图、指尖币下栏图与原蓝色节点染色保持源绑定；指尖币为 `spIcon[1]`，不换成游戏豆图。

底分使用原font63位图字体（图集frame227），fontSize32、lineHeight55、NONE模式居中；数字字形高60，原Canvas局部顶部为−1。标题、阴影、三钱包、周卡以及五卡位置由现有原版场次渲染器处理，资料不另造一套近似CSS。

入场范围为原21px文字，其容器使用右锚点的横向RIGHT_TO_LEFT布局：文字按实际宽度计算，币图紧接左侧。人数与范围是目标截图的静态值，格式保留原半角连字符。

目标下方同时有“规则介绍”和“番型收集”；修改前只显示规则介绍。该入口应以十二生肖类型898调用对应页面，不能借用红中番型内容冒充十二生肖资料。

## 本地范围

根模块将这组资料接入 `roomsForMode('zodiac')` 和898场次展示。原玩法标记 `playable:false` 保留，五张卡片不默认进入血流或红中引擎，也不请求真实线上开局。未实现的十二生肖独立牌局、在线结算与动态服务器配置不由这张截图资料补造。

## 实机核对证据

五个场次已接入大厅十二生肖入口及直接地址 `rooms.html?mode=zodiac`。各场次 `fullDesc` 按原快速开始拼接方式使用 `十二生肖.${name}`，推荐按钮的小字为“十二生肖.初级场”，保留源ASCII点。底栏中的原1237番型收集入口以类型898打开十二生肖收集；规则介绍打开独立生肖介绍，问号打开十二生肖文字规则。

主证据为 [桌面五场与底栏](../hall-audit-study/local-zodiac-rooms-fixed-target-size.jpg) 和 [手机五场与底栏](../hall-audit-study/local-zodiac-rooms-mobile.jpg)。桌面请求视口992×502，实际保存图片经PIL读取为 **991×502**；手机图片为 **812×375**。两图的标题、五场、推荐小字及底部入口均可见。[较早大厅入口截图](../hall-audit-study/local-zodiac-rooms-fixed.jpg) 为1009×504，仅保留为入口验证；其中推荐小字仍是旧空格，最终文案以主证据为准。

“规则介绍”使用独立原 `SESXGuide`（prefab1034），四页均已实际打开并核对首末箭头、关闭与翻页：

|介绍页|实机截图|实际图片尺寸|
|---|---|---|
|第1页|[第1页](../hall-audit-study/local-zodiac-guide-page-1.jpg)|1009×504|
|第2页|[第2页](../hall-audit-study/local-zodiac-guide-page-2.jpg)|1009×504|
|第3页|[第3页](../hall-audit-study/local-zodiac-guide-page-3.jpg)|1009×504|
|第4页|[第4页](../hall-audit-study/local-zodiac-guide-page-4.jpg)|1009×504|
|手机介绍|[手机页](../hall-audit-study/local-zodiac-guide-mobile.jpg)|812×375|

第3、4页的标题和说明语义看似互换，但原 `SESXGuideView.pageData` 与 `loadPage` 按同索引绑定，原资源就是这一组合。本地保留原页序，具体资源ID与说明文字见 [原版页序核对](../zodiac-guide-study/原版页序核对.txt)。

[番型收集选中十二生肖](../hall-audit-study/local-zodiac-collection.jpg) 与 [问号十二生肖规则](../hall-audit-study/local-zodiac-rules.jpg) 均为1009×504，已实机确认对应类型，未使用红中规则替代。以上图片尺寸均读取实际文件确认。整套175项回归通过；截图中的人数、金额和入场范围仍为这次目标图的静态显示资料，验证不代表在线动态数据或十二生肖独立牌局引擎已经实现。
