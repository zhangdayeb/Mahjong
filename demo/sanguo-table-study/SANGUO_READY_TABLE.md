# 三国麻将准备牌桌资料

当前状态（可玩接入后）：默认 `sanguo-table.html?room=场次ID` 已进入独立三国**本地电脑对局**。首次选牌或操作后开始计时；准备和固定发牌图片仅分别保留在 `state=ready`、`state=dealt` 对比入口。以下准备/发牌截图说明是对应阶段的历史记录，当前玩法接入见文末。

2026-10-06 后续核对：页面默认已切换到最新截图的**发牌画面预览**。下文准备状态的来源记录保留；`sanguo-table.html?room=621&state=ready` 可单独复看准备画面。默认进入场次不再停在三处“准备”字的画面。

目标为 [target.png](references/target.png)，修改前为 [before.png](references/before.png)。目标图片实际986×483，显示三国麻将初级资料中的底注10、封顶999999倍，四家已入座，本家、左家、上家显示准备，右家等待。仅核对进入后的准备牌桌，不由这张图补造发牌、英雄牌规则或在线对手。

## 原版资源与层级

原 `GameDeskCtrl.loadDesk` 在三国类型并启用 `isSanGuoTable` 时显示 `GameViewHandler.SGMJTableParent`，调用 `SanGuoTableUICtrl` 加载 **prefab2910** `game/Table2DUI_SanGuo/Table2DUI_SanGuo`。地图桌面来自其中的 `pic_09` 节点；与商城另一个MWSG牌桌道具贴图不同。

|内容|原来源|原尺寸与位置|
|---|---|---|
|完整地图、桌边、河流、魏蜀吴文字|game1374 SpriteFrame → game724 texture，`Other/sanguo/sanguoditu/resource/table/pic_09`|1600×720，位置(0,0)、scale1|
|中央小旗|game178 SpriteFrame → game682 texture，`.../table/pic_10`|152×112，位置(27.896,41.757)|
|白色方位字|2910 `direction` → 四暗方向节点|父位置(0,50)，上西、左北、右南、下东|
|金色准备字及菱形底|UserStateLayer653，SpriteFrame game481 `NewSkin/GamePanelBtn/zhunbei`|133×105，原RAW且trim=false|
|准备原动画|resources447 `fx_kaiju_zhunbei`，模板resources827|1秒；金字从x300到0，渐显到255；两个原add光带最终透明|
|头像与昵称余额壳|UserInfoLayer904 + prefabUserNode2595|原Widget、锚点、头像遮罩、昵称/指尖币字体保留|
|段位|common `MJMasterPath/s_1…s_7`|原frame796、254、364、118、178、428、179；截图使用s1/s2/s5|
|桌面说明|main3 `desk_baseinfo` 原两Label|原 `SET_TABLE_COLOR_SANGUO` 颜色 `#4A3E35`|
|左上菜单|main3 `Canvas/menu/btn_menu`|60×62，原Widget左34/上14|
|电池、日期时间、剩牌图|BaseInfoLayer974|电池common572/623，日期时间原font16/line36；准备阶段剩牌文字为空|

金色准备动画的源位次是 `[本家,左家,上家,右家]`，不能直接当作本地Round的 `[本家,右家,上家,左家]`。非DIY场的本家准备位置由 `UserStateCtrl` 从序列化y=-125调整到-195；左(-379,59)、上(2,254)、右(395,59)保留源值。

`table.json` 保留原中心坐标、y向上、父TRS及Widget。背景原宽1600超过设计1280，可随实际可见宽度裁切；坐标适配由宿主渲染器完成，不在素材中拉伸或重画地图。2910完整tree含方位字多个候选子节点，`runtime.directions` 明列截图对应的白色四方向供选择。

## 可接入资料

```js
import {sanguoReadyTableFixture} from './sanguo-table-study/sanguo-table-fixture.js';
// fetch sanguo-table-study/table.json and frames.json; frame.image is relative to demo/.
```

`table.json` 提供 `tree`、`ready.tree/template/clip/seats/image`、`profile.tree/slots/rankFrames/runtimeWidgetOverrides`、`header.tree/menu/runtime`、`textNodes`、`mainNodes`、`runtime` 与两个Bitmap字体资料。`frames.json` 为47张原SpriteFrame数组，记录原bundle/id/path、图集rect、旋转、offset、originalSize及独立PNG路径。

`header` 按原 `BaseInfoView.INIT_BASE_INFO` 保留绿色剩牌图与黑底，但准备阶段不显示虚构的剩牌数字。Wi-Fi和网络延迟默认隐藏；截图未提供的电量百分比或网络毫秒值不补造。原时间格式为“MM-DD HH:mm”，冒号闪烁可使截图瞬间看起来像空格。头像Widget的非直播运行值也独立保留：本家bottom214、左/右top300、上家top113。

fixture单独保存type911、场次621、准备状态、本图底注与封顶、四家显示段位/截短昵称/余额与静态日期时间。`readySourceSeats=[0,1,2]`，换成本地Round位次是 `[0,3,2]`。其余场次底注由各场自己的配置输入，不能把本图10写死到全部三国场。

四个 `captured-avatar-*.png` 仅裁自用户目标图的头像小矩形。动态头像、账号昵称与余额没有原bundled静态值可推出，因此明确作为截图展示资料，未把整页截图扁平化当作UI，也未写回本地余额。左家昵称的微小第二字仍保留核对说明，不据此猜测完整账号名。

## 已知限制与复现

准备光带SpriteFrame `796a9547-a8fb-48f1-8944-f09540a7556b` 的本地import/native未收集，原代码及完整动画曲线已保留。尝试读取源地址时本机网络沙箱拒绝连接，未取得该贴图。它在动画0.333秒后已经透明，目标截图的稳定准备金字不依赖该光带；若以后重放前0.333秒的原光带，需要补齐该明确资源，不能用任意通用光替代。

重新提取：

```powershell
node demo/collect-sanguo-table.mjs
& 'C:/Users/iphon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' demo/extract-sanguo-table.py
node --test demo/sanguo-table-study.test.js
```

四项独立验证检查原背景/中央旗ID及几何、全部可用PNG原尺寸、四头像裁切范围、段位原图、准备源位次、原末帧与未收集光带记录、原菜单/电池和等待期无数字/延迟的初始状态。

## 本地接入与实机证据

场次卡片与快速开始通过 `sanguo-table-entry.js` 进入独立 `sanguo-table.html?room=场次ID`，不再停留于“场次选择”提示框。已知621至625与截图中的至尊场都保留自己的本地入口；至尊仍使用参考ID、`sceneID:null`，不推测626。入口按真实文件完成数加载47张原素材与四张小头像，出错时停止跳转。

- [新手场准备桌面](../hall-audit-study/local-sanguo-table-ready.jpg)：实际986×504；从新手场卡片实点进入621，显示底注10。
- [快速开始准备桌面](../hall-audit-study/local-sanguo-table-quick.jpg)：实际986×504；实点快速开始进入622，显示底注100。
- [手机横屏](../hall-audit-study/local-sanguo-table-ready-mobile.jpg)：实际812×375；地图、四家、三处准备与菜单可见。
- [牌桌三国规则](../hall-audit-study/local-sanguo-table-rules.jpg)：实际986×504；菜单规则打开911配牌与番型内容。

原目标986×483是裁切图。原金色准备图片与源位置匹配约0.70缩放，不能将裁切高度483直接当作完整720设计高度的缩放依据。桌面使用完整986×504核对，保留自己`bottom214`、左右`top300`及对家`top113`的原运行位置。

整套192项回归通过，包括源素材、独立入口/真实预加载、跨视口准备模型与原有玩法。当前页面只复现截图中的准备状态，没有三国发牌、英雄逻辑、结算、在线匹配或余额写入。浏览器已保留621准备桌面供继续核对。

## 发牌画面二次核对

最新目标为 [dealt-target.png](references/dealt-target.png)，实际999×508；修改前为 [dealt-before.png](references/dealt-before.png)。差异的主因是准备状态与发牌后的状态没有对应，此外菜单只显示规则、退出两项，未使用原版完整展开层。

`collect-sanguo-dealt.mjs` 与 `extract-sanguo-dealt.py` 新增 `dealt.json`、`dealt-frames.json` 和58张可核查来源的原SpriteFrame。底部使用原牌身game1457及游戏1397图集中 `sg_img_tile_7_1/7_2/7_3/10_3`：董卓3、貂蝉3、吕布4、吕蒙3，四张图的UUID均不同。三家13张牌背使用原主场景2D手牌的帧顺序、间距、镜像与兄弟绘制次序；没有把别的玩法牌面替换成三国字样。

展开菜单使用main3的原 `panel_menuList_bg` 和五项原按钮，恢复托管、设置、规则、超时、退出。菜单x偏移50来自 `Menu.start`，行距为原80（60高+20间隔）。顶部记牌器/番与右侧聊天/流水来自prefab264；“番”图为prefab1052，超时选择窗口为prefab952。菜单阴影由原贴图渲染，透明DOM控件只提供点击范围。原“番”入口在资源中的快速番型推荐服务器数据没有采集，本地展示现有完整三国番型规则。

显示剩牌82、119ms、10-06 10:47及四家段位余额均为目标截图的静态展示值；每个场次仍使用自己的底注。最新目标底注1000对应进阶场623，本地可直接打开 `sanguo-table.html?room=623` 核对。对家与右家头像只截取各自头像小区域；左家头像和昵称被展开菜单挡住，因此没有猜造账号头像，保留先前的空头像展示。

托管只切换原头像/遮罩与取消入口；超时两项只保存当前页的展示选项；记牌器明确展示“当前手牌（截图预览）”及3/3/4/3，未推断全牌堆或未见牌数量。聊天、流水复用已有原样式弹窗，本截图预览没有新增输赢记录。完整三国发牌、摸打、英雄牌逻辑、地图解锁、算番及结算仍未实现，`variants.sanguo.playable` 维持false。

已实测大厅→三国→进阶場的实际资源加载和跳转；五项菜单的打开、托管取消、超时选项切换、设置、番型、聊天、流水及退出返回大厅已检查。最新整套196项测试通过。

- [同尺寸展开菜单](../hall-audit-study/local-sanguo-table-dealt-menu.jpg)：999×508，五项菜单、手牌及三家牌背。
- [收起菜单的牌桌](../hall-audit-study/local-sanguo-table-dealt.jpg)：999×508，大厅实点进阶场623进入。
- [手机横屏展开菜单](../hall-audit-study/local-sanguo-table-dealt-mobile.jpg)：812×375，13张手牌及五项菜单可见。
- [原版超时窗口](../hall-audit-study/local-sanguo-table-timeout.jpg)：999×508，两项切换和关闭已实测。

测试结束后已清除临时视口覆盖，浏览器保留623发牌画面及展开菜单。

## 三国本地牌局接入

用户指出固定发牌图无法玩后，默认入口已改为 `SanguoRound`，没有把现有血流引擎改名或换皮。`rooms-config.js` 将三国标为 `playable:true, localPractice:true, engine:'sanguo-local'`；原版场次模板的选择与是否已实现引擎分开判断，十二生肖继续保留其原先状态。

135张牌按资源中的911基本规则建立：万、条各1至9每种4张（72），12种英雄每种4张（48），龙/狮/龟玺每种3张（9），宝牌6张。庄家14张、其余13张，发牌后剩82。原十六进制风格编码17至25、33至41、113至163、177至179、193贯穿牌局、显示和计分，不混入筒牌、换三张或定缺。

本地已支持手动选牌/出牌、三家电脑响应、碰、明杠、暗杠、补杠、抢杠胡、一炮多响、自摸及胡后继续，直到牌墙耗尽并进行查叫和结算。手牌第一次点击抬起选中，第二次点击该牌执行；玉玺牌打出执行玉玺杠、宝牌执行挖宝。托管实际驱动牌局，取消托管恢复手动；菜单、规则、设置等窗口打开时暂停行动和超时。

玉玺仅替代原文字中“手牌中没有的牌”，普通英雄不能当作序数顺子；已胡后最后一张宝牌支持独立的万能牌和绝世珍宝封顶条件。英雄地图按实际获得去重，玉玺杠和攻城略地点亮未获得的地图；地图块数、已识别国家/角色组合及已实现番型计入本地练习分。三国杠牌按原资料列作胡牌加倍，不加入未确认的血流即时刮风下雨杠分。所有记分只存在当前本地牌局，不写入账号余额。

`collect-sanguo-play.mjs` / `extract-sanguo-play.py` 导出280张本次使用的SpriteFrame，其中64张新PNG，另外复用已提取的原桌面资源。四个方向的牌图集来自1397、121、385、121，均覆盖34种牌值；手牌、弃牌、碰杠区及胡牌记录保留原2D位置、缩放、镜像与顺序。结算和流水通过可选 `tileRenderer` 使用真实三国牌面，原血流显示路径不受影响。

### 当前边界

这是本地练习实现，尚未声称与线上全部规则逐项相同。锦囊妙计和战法之争目前按连续三个单张摸打回合实现，已胡后一次性摸三张、原26张手牌上限等时序仍待移植；服务器技能概率、全部番型互斥/叠加、真实携带余额的单次结算上限也未接入。地图收集及其倍数已计算，原地图发光/国家解锁动画仍未移植。原规则窗口保留完整资料供参照，本地结算只列实际计算的项。

### 验证

- 215项回归全部通过。包含80局完整电脑对局，每一步检查135张实体牌守恒、计分零和及有限终止；另有点炮多响、抢杠、玉玺、两种挖宝、冻结窗口、首次手势前等待和再开局验证。
- [手动出牌实测](../hall-audit-study/local-sanguo-play-manual.jpg)：实际点击选牌再点出牌，弃牌出现且摸牌后牌墙减少。
- [完整实际结算](../hall-audit-study/local-sanguo-play-settlement.jpg)：通过托管跑完完整135张牌的对局，展示实际胡牌手牌、得失及番型；不是固定结算数字。计分修正后已重跑浏览器验证。
- `pace=fast` 只用于浏览器完整流程测试，仍使用完整牌库及合法操作。正常场次入口不附带该参数；“再来一局”已实际点击并验证重新发牌及手动恢复。
- [正常场次进入后的可玩桌面](../hall-audit-study/local-sanguo-play-ready.jpg)：1114×538，从原场次页实际点新手场，完成资源加载进入621；14张真实手牌及玉玺杠/挖宝入口可操作。
- [手机横屏](../hall-audit-study/local-sanguo-play-mobile.jpg)：812×375，14张手牌及操作按钮可见且落在画面内。
- 浏览器最终保留正常速度的621手动牌局，清除了临时视口覆盖；首次操作前手牌与牌墙不会被超时操作改变。当前浏览器未记录JavaScript错误。
