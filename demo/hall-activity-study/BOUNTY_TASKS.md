# 每日悬赏左侧任务源对应

`prefabs 2567` 是 `hall/modules/PassCheck/PassCheckView`。任务是内联模板
`PassCheckView/popBig/leftTask/list/content/item`，不是 2498 / 2995 / 2111：
这些分别是悬赏通行证、通行证奖励、悬赏包。`activities.json` 的该模板已经包含所有可见节点。

## 本地绑定

`buildBountyTasks(data, tree, {tasks, scroll})` 填入调用者已克隆的页面树，并返回同树。
`data` 不变；无联网、领取和余额修改。`tasks` 可使用截图 fixture 的 `desc`、
`neednum`、`counter`、`status`、`rewards`、`achieveValue`。fixture 的 `key` 是本地键，
不是服务器任务 ID。`btnGet` 原事件 `PassCheckTaskItem.onClickGet` 保留，事件 data 是本地 key。

原 `PassCheckView.onInit` 按状态 2（可领取）、0（未完成）、1/3（已领取）排序，然后按任务 ID。
截图 fixture 没有服务器 ID，同状态保持原行次序。原每日/每周任务类别是 25 / 26，
配置和计数来自服务器；本地周任务可保持空态，不能根据日任务造周任务奖励。

## 原布局

以下都是原生坐标，整体随屏幕高度 / 720 缩放。

| 节点 | 位置 / 尺寸 | 字体 / 行为 |
| --- | --- | --- |
| leftTask | (-326, 0) | — |
| list | (0, 158.5)，540 × 460 | anchor (0.5, 1)，ScrollView / Mask |
| content | (0, 0)，宽 530 | anchor (0.5, 1)，垂直 Layout，spacingY = -3 |
| item | 首行中心 y = -50，530 × 100 | 行中心 y = -50 - 97 × index |
| taskName | (-252, 11.673)，宽 205，左锚 | 系统字体 22，lineHeight 26，RESIZE_HEIGHT |
| ProgressBar | (-250, -27.5)，198 × 16 | 左锚，背景 |
| Bar | (2, 0)，高度 12 | cc.ProgressBar totalLength **194**，宽 = 194 × clamped progress |
| ProgressLbl | (-149.033, -27.444) | 系统字体 16，lineHeight 16，运行时自动宽度 |
| awardLayout | (42.5, 2.5)，166.5 × 100 | 两 slot 76 × 76，spacingX 14.5；slot x = ±45.25 |
| iconSpr | slot (0, 0)，204 × 207 | RAW / untrimmed，scale (0.34, 0.34) |
| iconNum | slot (35, -27)，右锚 | 系统字体 20，lineHeight 20，运行时自动宽度 |
| btnGet / btnUn | (204.5, 2)，95 × 55 | 字样包含在原图片中，无额外文字标签 |
| btnFinish | (205.5, 14)，24 × 24 | 已领取文字 20，行整体有源 70/255 黑遮罩 |

五条内容高度 488，viewport 460，所以可滚动范围是 **28** 原生像素。
零进度原 Bar 宽度为 0，本地直接关闭该层，不能画最小绿色条。

没有新任务字体需求：此模板各 Label 均为源系统字体，没有 BitmapFont / TTF 引用。
原 `PassCheckTaskItem.init` 去掉描述的“每日悬赏-”和“每周悬赏-”前缀。
奖励第 1 slot 来自 `package`；第 2 slot 使用 `achieveValue` 和 `PropIcon/dailyCardJingYan`。

## 原资源

已由统一活动 collector 加入 `runtime.bounty.taskIcons` / `frames.json`：

- token：common **221** `PropIcon/xuanshangling`，UUID `46610b79-33a8-4731-9ca6-1efa977b5c1d@6c48a`。
- experience：common **510** `PropIcon/dailyCardJingYan`，UUID `a0642b61-accf-4651-a990-6be5ecc29a2d@6c48a`。

两图原画布都是 204 × 207。页面上部余额的 common 352 小悬赏令图不能代替任务 token。
按钮、行背景和进度条都已经在 2567 模板及帧表中，不需要用 CSS 重绘。

## 截图证据边界

本地 fixture 对应 `references/bounty-target.png` 的五条描述。前四条可读计数为
1/1、0/3、0/10、0/1。第五条描述“完成5局”可读，计数被截图下缘裁掉；本地 **0/5 是推断**，
已明确记录在 fixture 的注释和 evidence。五条奖励使用截图外观的 1 个悬赏令 + EXP 20，
不是在线账号的实际奖励权利。显示首条可领取也只用于重现截图状态。

原事件最后会向服务器请求领奖，本地宿主应仅反馈本地展示，不发送该请求。
