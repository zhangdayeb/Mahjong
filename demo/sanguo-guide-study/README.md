# 三国麻将首次介绍

目标截图保存在 `references/target-page-1.png`。本模块使用原资源，不把整张目标截图作为弹窗贴图。

原入口：`hallTableSelView.initSGMJGuideBtn` 在类型911的三国场次中显示介绍入口，满足原首次/每日条件时打开 `SGMJGuide`。本模块只绘制介绍；是否自动打开由宿主的本地入口逻辑决定，不写原站账户标记。

`lobby.js` 的大厅三国卡片与 `rooms.html?mode=sanguo` 两种本地入口均已接入。`sanguo-guide-entry.js` 复现当天首次/新用户条件，用单独本地键 `MAHJONG_SGMJGuide` 保存日期与已见标记；本地日期按用户 Asia/Bangkok 时区转换成源 YYYY_M_D 格式。手动点击“规则介绍”重开第1页，不修改已见日期；上方问号仍打开911玩法规则。

目标底部还显示三国番型收集，按该场景启用原1237入口，接 `collection.show('sanguo') / type911`。`btn_left` 原宽117、锚点0.5、水平Layout间距2；Cocos Layout在 AFTER_UPDATE 覆盖脚本临时位置，最终两个入口局部x为-5.5、107。保留父x=-490，避免把入口误移到父中心右侧。

用户后续场次截图已提供六个场次的底分、人数和入场范围，当前使用 `hall-games-study/sanguo-rooms-fixture.js` 的固定截图数据展示，包含红色“至尊场”，快速开始显示“三国麻将 初级场”。前五项保留原静态配置621–625，第六项服务器ID未确认，使用单独本地标识。收集进度仍为本地0，三国牌局规则引擎尚未实现。场次资源和布局记录见 `../hall-games-study/SANGUO_ROOMS.md`。

原预制体为 `prefabs1318 / hall/modules/SGMJGuide/SGMJGuide`，控制器 `SGMJGuideView`。4页分别使用原 `pageTitle` / `pageImg` 数组：

|页|标题资源ID|内容资源ID|
|---|---:|---:|
|1|lobby1969|lobby1955|
|2|lobby839|lobby1428|
|3|lobby1376|lobby1840|
|4|lobby19|lobby2270|

背景框1456、左箭391、右箭1056、关闭350也来自同预制体。第一页隐藏真实左箭，左边圆环仍显示，因为它是背景框的一部分。源关闭节点默认可见，首屏就可关闭。

原 `DlgAnimation.nodeAni=Root`：200ms从0.1放大至1.1，再用100ms回到1。关闭有入口坐标时按源 `SGMJGuideView.onClickClose`，150ms放大0.15（cubicOut），随后200ms移动回入口、缩至0.05（cubicOut）、透明度降至0。遮罩立即透明。`entryPoint` 使用父舞台未经CSS变换的本地像素坐标，与场次控件矩形同一坐标系。没有入口点时直接关闭。

`collect-sanguo-guide.mjs` 保存节点、点击事件和13个SpriteFrame（包括规则介绍入口图2425），`extract-sanguo-guide.py` 按原图集rotation/rect/offset提取，并只补一次originalSize。无缺失贴图。Source IDs与旧 `assets/lobby` 文件编号不同，不按数字文件名猜素材。

```js
import {createNativeSanguoGuide} from './native-sanguo-guide.js';
const guide=createNativeSanguoGuide(stage,{onClose});
await guide.show({entryPoint:{x:150,y:480}});
// ready / show / goTo / next / previous / close / open / page / dispose
```

`show()` 等资源解码和300ms弹出动画完成，返回可查看的稳定页面；测试或静态核对可用 `show({animate:false})`。`close({animate:false})` 可立即关闭。此介绍模块不启动牌局，不创建三国引擎，不请求奖励、支付或线上登录。

独立预览为 `/sanguo-guide-study/preview.html?page=0`。`node --test demo/native-sanguo-guide.test.js` 覆盖4页源图配对、翻页边界、原点击范围、打开/关闭关键时刻、资源未就绪期间resize，以及实际翻页只使用已加载的本地资源。
