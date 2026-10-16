# 联桌麻将

基于 Cocos Creator 3.8.8 的浏览器麻将练习项目，包含加载、大厅、场次、牌桌、人机对局、个人中心和余额服务。七种玩法及全部游戏窗口由 Cocos 客户端呈现；后台使用 Node.js／MySQL 校验牌局并保存记录。当前对手是电脑，尚未实现联网真人匹配。

## 当前版本

大厅开放以下 7 种玩法，各自的规则配置见 `demo/rule-profiles.js`：

| 玩法 | 模式参数 |
| --- | --- |
| 血流麻将 | `classic` |
| 血流红中 | `red` |
| 血流换三张 | `exchange` |
| 血流六红中 | `six` |
| 6 红中不洗牌 | `sixFixed` |
| 疯狂 8 红中 | `crazy` |
| 8 红中不洗牌 | `eightFixed` |

支持摸牌、出牌、碰杠胡、自摸、托管、听牌提示、番型和结算；换三张、红中数量及其他差异按玩法配置处理。“不洗牌”采用项目约定：首局随机洗牌，之后沿用上一局收牌顺序，随机切牌再发牌。具体规则以游戏内规则窗口与源码为准。

- 只使用金币；新游客初始余额为 `30000`，界面显示完整数字。
- 每天可领取 `30000` 金币救济金，按北京时间零点刷新领取资格。
- 个人中心提供明确标注的 **15 秒演示广告**，完整观看奖励 `30000` 金币；未接入真实广告平台。奖励由后端校验并记录。
- 支持最多 40 个字符的个性签名、音乐／音效／语音独立调节及牌桌特效。
- 已取消随时重置余额、商城、背包、牌型收集、抽奖、充值和提现。
- 游客会话使用 Cookie，尚未提供正式账号登录或跨设备账号同步。
- 反馈真实保存到后台，提交后生成本人收件回执；邮件支持查看、单封及全部已读。金币历史包括对局、救济金、广告奖励和刷新。

三国麻将、十二生肖及部分原版活动的研究代码仍用于历史回归，不作为当前大厅入口。

## 本地启动

游戏客户端位于 `creator/`，打开、构建和本机预览步骤见 [Creator 工程说明](creator/README.md)。`demo/` 保留共享规则、素材源及历史回归代码；发布工具从 Creator 构建包生成完整前端。

需要 Node.js 和 npm。建议使用 Node.js 22 或更新版本。从仓库根目录执行：

```sh
npm run build:web
npm start
```

打开 <http://127.0.0.1:8780>。本地服务器同时提供 Cocos 网页包和 `/demo-api/`，不需要配置 MySQL。账户、余额、奖励、牌局、反馈和邮件数据保存到根目录 `.local/creator-wallet.json`，不提交到 Git。首次构建需要安装 Creator 3.8.8；可用 `COCOS_CREATOR_EXE` 指定编辑器路径。

**必须保留 `demo/` 与 `backend/` 的同级目录结构。** 本地服务器从 `backend/` 导入余额服务，后端也从 `demo/` 导入规则和牌局重放代码。仅复制其中一个目录无法完整运行。

## MySQL 后端

生产环境使用 `backend/server.js`，监听 `127.0.0.1:8771`。前端静态目录使用 Creator 的发布包，反向代理把同一站点 `/demo-api/` 转发到后端。`PUBLIC_ORIGIN` 必须与浏览器实际访问的来源一致。旧大厅、场次及牌桌链接均加载同一 Cocos 客户端。

在 `backend/` 执行 `npm ci --ignore-scripts`，将 `.env.example` 复制为 `.env`，填写自己的数据库配置。源码不会自动读取 `.env`；可以由服务管理器注入环境变量，或使用下文的 Node.js `--env-file` 参数。不要提交实际 `.env`。

数据库文件的用途如下：

| 文件 | 用途 |
| --- | --- |
| `backend/schema.sql` | 基础表；新库已包含规则版本字段和签名字段 |
| `backend/rewards-schema.sql` | 每日救济金和演示广告的记录表 |
| `backend/rules-v2-schema.sql` | 旧库缺少规则版本／收牌顺序相关字段时的升级脚本 |
| `backend/signature-schema.sql` | 旧库缺少签名字段时的升级脚本 |
| `backend/migrate-support.js` | 可重复创建反馈／邮件表及金币历史索引，保留原账户和余额 |

新数据库示例：先创建自己的数据库，再在仓库根目录打开 MySQL 客户端，执行以下 SQL（数据库名需与 `.env` 的 `DB_NAME` 一致）：

```sql
CREATE DATABASE example_mahjong CHARACTER SET utf8mb4;
USE example_mahjong;
SOURCE backend/schema.sql;
SOURCE backend/rewards-schema.sql;
```

随后在 `backend/` 执行：

```sh
node --env-file=.env migrate-currencies.js
node --env-file=.env migrate-support.js
node --env-file=.env server.js
```

`migrate-currencies.js` 可重复运行，创建基础表并补齐旧币种及余额操作字段；不会替代奖励表、旧库规则版本字段或签名字段的升级。它使用 `MIGRATION_DB_USER`／`MIGRATION_DB_PASSWORD`，未配置时使用普通 `DB_USER`／`DB_PASSWORD`。

**新库不要再执行两个 `ALTER TABLE` 升级脚本。** `rules-v2-schema.sql` 和 `signature-schema.sql` 没有重复执行保护；旧库应先检查表结构，只补缺少的字段。后端运行账户需要相应数据表的读写权限，初始化或迁移账户另需建表／改表权限。

健康检查为 `GET /demo-api/health`。后端重放合法牌局操作计算结算，并保存账户、奖励及流水；不接受客户端直接提交得失金额。

## 测试

从仓库根目录执行：

```sh
npm --prefix demo test
npm --prefix backend ci --ignore-scripts
npm --prefix backend test
```

测试覆盖规则、牌局重放、结算、余额奖励、反馈、邮件及界面模型。默认后端测试使用内存或临时文件存储，不连接生产数据库。另运行 `npm run test:services` 验证 Cocos 网络接口、异步顺序与余额边界，`npm run test:built` 验证实际 Creator 构建产物与后端规则一致。

## 目录与素材来源

- `creator/`：完整 Cocos 游戏客户端、资源、构建和发布工具。
- `demo/`：共享规则引擎、素材源、历史界面研究及回归夹具。
- `backend/`：余额、奖励、签名、反馈、邮件 API、持久化实现及数据库结构。
- `asset-study/`：仅保留少量历史回归所需参考夹具；不提供完整原始素材库。

项目部分牌面、人物、图标及特效素材来自原游戏客户端的参考采集，出处见 `demo/assets/sources.json` 及各研究目录的 `source.json`、原始资源说明。采集的原客户端脚本用于参考和测试夹具，不作为当前游戏的运行入口。V2 音乐和音效使用本地 DSP 合成，语音由 Microsoft Windows SAPI／Huihui Desktop 本地生成，详细记录见 `demo/assets/audio-v2/manifest.json`。

`collect`、`extract`、`prepare`、`audit` 等素材重建工具依赖原始参考素材，属于研究工具，不是本地启动或默认测试的前置步骤；完整原始素材目录未随仓库提供。

本仓库未附加统一开源许可证。第三方素材的来源记录不构成商业使用或再次分发授权，相关权利归各自权利人所有。
