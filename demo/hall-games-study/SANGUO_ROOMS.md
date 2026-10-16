# 三国麻将场次核对

目标为 `references/sanguo-rooms-target.png`，修改前为 `references/sanguo-rooms-before.png`。本地大厅入口与 `rooms.html?mode=sanguo` 共用 `sanguo-rooms-fixture.js`。

|场次|底分|人数|入场范围|
|---|---:|---:|---|
|新手场|10|295|10万-4000万|
|初级场|100|313|2000万-6亿|
|进阶场|1000|649|5亿-无限制|
|高级场|10000|276|20亿-无限制|
|大师场|10000|202|60亿-无限制|
|至尊场|10000|255|120亿-无限制|

这些字段是用户截图的固定显示状态，快速开始推荐初级场。原 `GameTypeCfgs.SGMJ2` 仅给出621–625五个静态场次ID，服务器列表另按 `extra.sceneIndex` 排序；截图第六项没有确认的服务器ID，使用 `sceneID:null` 与本地标识 `sanguo-supreme-reference`。本地未实现三国牌局引擎。

卡片来自原 `TableSelItem.SpriteFrameScene`，六张依次为lobby2271、666、1630、1750、257、213。保留源容器1.08缩放。底分使用原fonts63 `fnt_xc-export`，字号32、行高55，按原BMFont字形、偏移和锚点定位，`LayoutDifen` 的源Layout未启用，不添加额外字距。`10 / 100 / 1000 / 10000` 原字形宽度分别为72 / 114 / 156 / 198。

人数common668 `pic-ren` 与指尖币common707 `pic-bi` 原图均为白色，由节点色 `#5b82cf` 染蓝。门槛采用原右到左容器，按实际文本宽度调整宽度和币图位置。大厅上方返回/标题区域按源 `leftPart` Widget定位。

核对截图保存在 `../hall-audit-study/local-sanguo-rooms-fixed.jpg`（1003×510）与 `../hall-audit-study/local-sanguo-rooms-mobile.jpg`（812×375）。151项项目测试通过，其中新增BMFont测量与锚点验证、六项截图数据与入口验证，以及原QuikStart推荐逻辑的VM验证。
