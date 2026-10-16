# 娱乐页横向列表核对

用户提供的 [修改前页面](references/entertainment-before.png)、[目标首屏](references/entertainment-target.png) 和 [目标后半列表](references/entertainment-scrolled-target.png) 共同确认6张卡片。`entertainment-fixture.js` 只保存这组静态截图资料，不把原代码的离线备用列表当作当前娱乐页配置。

|顺序|原玩法ID|名称|英文|背景索引|图标索引|
|---|---:|---|---|---:|---:|
|1|898|十二生肖|SHIERSHENGXIAO|0|2|
|2|893|四季常春不洗牌|SIJICHANGCHUN|1|3|
|3|883|疯狂8红中|FENGKUANGBAHONGZHONG|2|5|
|4|885|8红中不洗牌|BAHONGZHONGBUXIPAI|3|1|
|5|870|6红中不洗牌|HONGZHONGBUXIPAI|4|4|
|6|869|四季常春|SIJICHANGCHUN|5|3|

两张目标图都没有上角标签，所有卡片显式使用 `tag:0`。原六张背景与图标已在 `hall-games-study/assets`，无需截图抠图或生成近似图。

## 原入口与资源绑定

`hall_TileView.initRecommendNewSix` 根据在线大厅 `layoutDict/enterLayout/subTagDict`，把 `enterArr/tagArr` 交给 `MatchPlayType_Init_YuLe`。未提供 `enterArr` 时，`MatchPlayType.onInitYuLe` 才使用 `[2,3]` 备用值；原先只有两张2V2的本地页面来自此缺省分支。

原容器为 `MatchPlayType`（prefab37），卡片为 `MatchPlayTypeItemView`（prefab57）。`__showListEnterInfo` 选择：

- 背景：`typeBgSF[index % 6]`，本组依次为 Match66/41/158/8/344/118。
- 图标：`typeBgIconSF[(id % 100) % 6]`，本组依次为 Match22/418/286/82/90/418。
- 角标：`tag > 0` 才选 `TagSpArr[tag-1]`；本组不显示。

原图标与公式可以消除同名ID歧义：疯狂8红中的目标是花枝麻将（tu-6），对应883的索引5；888会选躺椅，不符合目标。6红中不洗牌的目标是躺椅（tu-5），对应870的索引4；881会选中牌，同样不符合目标。这组ID由原图和源码共同核对，不按名称随意选一个候选。

## 原布局与文字

源卡片根节点343×540。普通背景使用RAW尺寸318×559，保留原透明边距与倒影；具体字形、扇子、躺椅及花枝均按源 SpriteFrame 的trim/offset绘制，不重复补透明边距。

源 `ContentLayout` 对超过2张的列表设置左右padding15、spacing35。六卡内容宽为 `15+6×343+5×35+15=2263`，原水平视口宽1209，对应设计滚动范围1054。列表初始从左侧开始，后半仍在同一行，拖动不能提前截断或变成分页列表。

`MatchPlayTypeItemView.onInitItem` 在娱乐状态把标题Y增加15设计像素。标题使用原font50位图字体、fontSize32、lineHeight40、SHRINK模式2、禁止折行，文字框280×72.19；英文使用原16px系统字体。六个标题的原32px位图宽度为165/307/197/240/241/174。本地model已按原SHRINK模式逐级测宽并减小字号，只有“四季常春不洗牌”缩至29（宽278.22），其余保持32；规则按文字实际宽度执行，没有按这个名称写死字号。

目标顶部显示游戏豆、指尖币与钻石三个钱包。`showGameCurrencies:true` 使用原标准预制体1180/1473/2098，分别对应 `CoinNodeRoot/CommNodeRoot2/CommNodeRoot3`，源根缩放0.9。余额仍由本地大厅宿主提供，不由截图资料修改；没有截图资料的独立默认娱乐预览保留原缺省行为。

## 本地接入与范围

```js
import {entertainmentFixture} from './hall-games-study/entertainment-fixture.js';
await games.show('fun', entertainmentFixture);
```

本地大厅娱乐入口传入这组资料，左右拖动均使用同一个原列表。常规卡片ID大于等于100时按其独立 `typeID` 打开场次选择，不再套用2V2或比赛入口动作。

目前资料只为870设置已有的 `sixFixed` 本地练习模式；其他卡片保留独立类型，并不宣称已经实现其完整牌局引擎。打开场次展示不等于进入真实线上游戏。本模块不请求在线列表、匹配、奖励或购买，也不修改余额。

## 浏览器核对证据

用户首屏目标PNG为1008×488，后半PNG为996×492，都是裁切图片。桌面核对使用原横屏比例1009×504，按原卡宽、间距和遮罩分别查看首屏、后半和末端。

- [桌面首屏](../hall-audit-study/local-entertainment-fixed.jpg)：1009×504，前三张完整、第四张在右侧裁切，六张原图和三钱包均已接入。
- [桌面拖动后半](../hall-audit-study/local-entertainment-scrolled.jpg)：1009×504，实际向左拖动约700屏幕像素，对应约1000设计像素；左侧保留第三卡的裁切部分，右侧显示后三卡，与用户后半目标一致。
- [桌面滚动末端](../hall-audit-study/local-entertainment-end.jpg)：1009×504，继续拖至源上限1054设计像素，最后一张“四季常春”完整显示，列表没有提前结束。
- [手机首屏](../hall-audit-study/local-entertainment-mobile.jpg) 与 [手机拖动后半](../hall-audit-study/local-entertainment-mobile-scrolled.jpg)：812×375。已实际反向拖回0，再正向拖动约520屏幕像素（约998设计像素），确认同一六卡列表和正确裁切。

桌面与手机都进行了真实指针拖动，沿用此前修正的轻点/拖动区分、指针捕获阈值和拖动后误点击抑制。卡片顺序、原图绑定、原SHRINK标题、完整滚动范围及独立类型路由均按这组固定截图核对；图片中的余额和页面资料仍是本地显示，不是实时线上结果。
