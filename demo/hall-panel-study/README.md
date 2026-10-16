# 大厅弹窗源节点

`collect-hall-panel-study.mjs` 从已收集客户端配置和编译 prefab 提取节点、SpriteFrame、位图字体、文字、事件以及原脚本绑定；`extract-hall-panel-sprites.py` 按原 atlas 的裁剪、旋转、透明边缘与偏移恢复 PNG。

| 本地 key | 原 prefab | 原模块 |
| --- | --- | --- |
| settings | prefabs 16 | hall_SetView / hall_SetLayoutCtrl |
| mail | prefabs 207 | hall_MailView |
| bag | prefabs 45 | BackpackView / BackpackBaseView |
| activity | prefabs 246 | PublicNoticeView |
| profile | prefabs 371 | UserInfoApkView |
| maka | prefabs 178；权益模板 138、272 | MaCardShop / MaCardNormal |
| feedback | prefabs 3712 | FeedbackView / StarAndTagsCtrl |
| more | main 2 / bottomLayer | hall_LobbyBottom |

还原运行时布局：设置两列每行间隔 86（50 高、36 间距），底部政策区 y=-132；更多原背景 252×80、三个 48×71 节点、82 间隔；背包使用原 H5 fallback 显示牌桌、头像框、参赛券三项；麻卡权益按原源码四组静态说明渲染，并使用原滚动窗口。

账户邮件、活动公告列表和内容、背包商品、会员价格和资格依赖线上数据。本地采用空数据；源 prefab 的编辑器示例已经清除。资料面板使用根控制器传入的本地头像和统计。权益文案中的服务器倍率与数量占位不填写假值。反馈提交只保存浏览器本地草稿，没有网络发送。

示例头像 `assets/lobby/user-avatar.png` 是用户参考大厅 `user-reference.png` 中 (58,4)-(127,74) 的 69×70 原像素。整张 `user-reference.png` 仅供原大厅 CSS 切片；不能直接作为头像纹理。

独立核对入口：`preview.html?kind=settings`，可将 kind 换为上述八项。该入口是源节点视觉测试，不是线上账户页面。坐标基准为父容器高度 / 720，宽度根据父容器比例拓展。

工厂：`createNativeHallPanels(parent, {profile,onRules,onPolicy,onSettingsChange,onProfileChange})`。返回 `ready / show(kind,details) / close() / toggleMore(details) / open / kind / preferences / dispose()`。`moreAnchor` 是本地原生坐标的左上角坐标，原点在父容器左上，单位为高度 720 的设计像素。

已进行语法和源布局回归验证。完整原站每个弹窗的实时账户内容未逐项观察，不能据此声称逐帧一致。
