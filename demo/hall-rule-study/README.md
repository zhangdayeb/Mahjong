# 原大厅玩法规则

原大厅 `hall_LobbyBottom.onClickRuleHall` 打开 `Hall_RuleHall`，使用 prefab 224。它与房间/牌局内 prefab 746 的规则窗口不同：224 含左侧可滚动的玩法列表。

已还原原 224 节点树、60 玩法列表项、1113 麻将牌例行、3283 规则文字模板；标题使用原位图字体。规则栏、左侧高亮、关闭图标和底板共 13 张原精灵图片。左侧原 item 高度 80、宽 220；原遮罩窗口宽 250、高 510；右侧窗口宽 680、高 400。原根节点 `cc.Sprite` 没有 SpriteFrame，高亮使用 `n_cho` 子节点。

正文来自已保存 `rule-study/RuleCfg.json`，逐项使用原规则映射，并保留原 `<pic>` 牌例编码的排列。红中默认配置 863 的琴/诗等高倍番型与用户较后截图 `0b98f59f-15d6-42d3-8781-eded31991fa1` 一致；早期截图中的平胡 1/对对胡 2/清一色 4 是另一份可见证据，不覆盖此次目标版本。

原左侧完整运行时列表由 `PrivateMsgModel.getMJAreaCfg().PlayCfgs.CoinGame` 在线配置下发；该列表未采集。默认前七项按用户截图已观察顺序，后续使用已保存原客户端命名规则。无原名称的 886/892/908 保留于规则资料文件，默认不向玩家显示编号占位；可通过工厂 `entries` 提供确切的列表。没有伪造新增规则。

工厂 `createNativeHallRules(parent,{onClose,entries})` 返回 `ready/show(gameType或'red')/close/open/select(id)/selectTab('BASERULE'|'CUSTOMRULE'|'FANRULE')/dispose()`。独立视觉入口 `preview.html?game=red`。菜单、正文支持触摸滚动和鼠标拖动；切换玩法使用源默认番型页。

`native-hall-rules.test.mjs` 包含工厂静态资源加载、实际 renderMenu 路径、无根 SpriteFrame 选中项、规则切换、关闭和占位清除回归。浏览器实际图与点击由根代理验证。
