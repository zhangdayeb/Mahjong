# 四川麻将玩法合集核对

首屏目标为 [collection-target.png](references/collection-target.png)，首屏修改前为 [collection-before.png](references/collection-before.png)。左右拖动后的目标为 [collection-scrolled-target.png](references/collection-scrolled-target.png)，对应修改前为 [collection-scrolled-before.png](references/collection-scrolled-before.png)。两组截图共同补全了12张可见玩法卡。

大厅入口使用 `sichuan-collection-fixture.js` 的固定截图资料。名称、人数、热门标记和推荐场次是截图显示值，不代表实时在线人数或已取得完整服务器地区配置。原8项全国备用列表仍用于没有地区资料的独立预览，不当作四川列表。

|列|上排|人数|下排|人数|
|---|---|---:|---|---:|
|1|6红中不洗牌|904|癞子血流|1021|
|2|血流6红中|5688|四季常春|1996|
|3|血流换三张（热门）|16984|血流成河|3462|
|4|四川倒倒胡|2211|内江麻将|2532|
|5|巴中麻将|1674|血战到底|25474|
|6|大众麻将（热门）|11126|—|—|
|7|血战换三张|18806|—|—|

下排最后两列本来为空；表中的“—”不是新增卡片。四川倒倒胡和内江麻将的完整名称及人数由新拖动截图与原首屏前缀共同确认。旧 `partialName/titlePrefix/titleLeft` 已移除，两个标题恢复原位图字体的完整居中绘制，不再使用−131/−105的前缀偏移。

## 原版分行与重排

目标题名为“四川麻将”，原 `ProvinceChoose.getAreaList` 明列地区代码51。`hall_TileView.onClickLocalMJ` 读取 `AreaMod.curAreaCode` 打开 `ProvinceGameTypeView`（prefab6）；该视图从 `PlayCfgs.CoinGame` 加载顺序和标题，`ProvinceGameTypeItem`（prefab222）汇总各玩法场次的在线人数。

两张目标图与源码分行/隐藏规则对应原13位列表：原索引0是866，原索引4是血战换三张。源 `initProvinceGameTile` 首8项先分上行0～3、下行4～7；8之后偶数上行、奇数下行。`checkXlhzSavedTileNode` 在866与868同时存在时隐藏866，再将下排首项（原索引4）移到上排末尾。因此最终不是平均分行：

- 上行原索引：`[1,2,3,8,10,12,4]`，7张。
- 下行原索引：`[5,6,7,9,11]`，5张。

截图资料保留每项 `row/column/originalIndex`，不再让新增卡片按默认8项后交错规则重新分行。皮肤按原 `spfBgs[originalIndex % 8]` 选择，上行索引为 `[1,2,3,0,2,4,4]`，下行为 `[5,6,7,1,3]`。源热门贴图仅在 `iTag===4` 时显示；已确认血流换三张和大众麻将两张热门卡。

## 布局与滚动边界

原标题、返回和切换地区属于 `leftPart`，宽舞台按 `ProvinceGameTypeView.start()` 的Widget定位。列表使用原1180×550遮罩；行中心Y为125/−140，差265。卡片高222，原皮肤宽324或323；左padding5、间距20。

按各卡片实际源宽度计算，上排行宽2391、下排行宽1703；内容宽取2391，横向滚动上限为 `2391−1180=1211` 设计像素。两排同步滚动，下排尾部保持空白，既不提前截断上排，也不把血战换三张移到下排。首屏右边第四列仍按原遮罩裁切，拖到末端可查看上排最后一张完整卡片。

源 `ScrollSceneSel` 为横向 `cc.ScrollView`，`vertical=false`、`brake=0.75`、`bounceDuration=0.23`，没有滚动条。本地鼠标/触摸超过5px才捕获指针，保留正常轻点的按钮click，拖动后抑制误点击。白色人数图使用原蓝色节点染色；人数容器的源Layout关闭，图标与文字保留原固定坐标。

## 类型与本地行为

6红中不洗牌仍有870/881同名候选，血流换三张仍有149/895同名候选；截图不能确认唯一服务器ID，继续保留 `typeID:null`，已知本地练习模式单独映射。新增完整名称在原 `GameTypeCfgs` 中分别对应四川倒倒胡841、内江829、巴中830、大众181、血战到底143、血战换三张148。

血战到底与血战换三张保留独立类型143/148，没有套入血流的 `classic` 或 `exchange` 练习引擎。方言玩法与血战玩法点击仍按其独立ID进入相应场次展示；这份截图资料没有补造其线上场次、收费配置或未实现的牌局逻辑。

快速开始仍取原 `CoinGame[0]`，不改成可见第一卡；截图推荐为“血流红中.新手场”，ASCII点来自 `QuikStart._getFullDesc`。本地该推荐进入红中新手练习场，两张六红中卡分别使用 `sixFixed` / `six`。资料只作本地显示，不请求在线人数、领奖或购买，不改余额。

## 浏览器核对证据

- [桌面拖动后核对](../hall-audit-study/local-sichuan-collection-rear-fixed.jpg)：实际截图文件1010×501，包含四川倒倒胡、内江麻将及新增卡片。
- [桌面滚动末端](../hall-audit-study/local-sichuan-collection-end.jpg)：实际截图文件1010×501，验证上排最后一张与下排尾部空白。
- [手机首屏](../hall-audit-study/local-sichuan-collection-mobile.jpg) 与 [手机拖动后](../hall-audit-study/local-sichuan-collection-mobile-scrolled.jpg)：812×375；沿用旧文件名，图片已覆盖为这次完整12卡版本。

`sichuan-collection.test.js` 覆盖源隐藏/reparent与推荐关系、12张截图资料及上7下5位置、原2391/1703行宽与1211滚动范围、缩放下鼠标/触摸轻点和拖动、两排同步及下排空尾，以及新增方言/血战ID不会默认落入血流引擎的大厅回调。
