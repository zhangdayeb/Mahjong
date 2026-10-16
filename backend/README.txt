联桌麻将余额后端

完整启动、数据库结构和迁移说明见仓库根目录 README.md。
backend/ 和 demo/ 必须保持同级，后端从 demo/ 导入规则及牌局重放代码。

当前功能：游客 Cookie 会话、单一金币余额、牌局校验及结算、每日救济金、
15 秒演示广告奖励、个性签名和余额操作流水。新游客 30000 金币。
每日救济金及每次完整观看演示广告的奖励均为 30000 金币。
随时重置余额已取消；旧 /balance/reset 接口返回 410。
没有充值、提现、兑换或支付接口，牌局仍为人与电脑的练习对局。

本地 demo/server.mjs 提供相同 API，使用 .local/practice-wallet.json。
backend/server.js 使用 MySQL，配置项示例见 .env.example。
服务器不会自动读取 .env，可以执行 node --env-file=.env server.js。
生产环境需将同一站点的 /demo-api/ 反向代理到本服务。

主要接口（均以 /demo-api 开头）：
GET  /health
GET  /me
GET  /balance/history
GET  /rewards
POST /profile/signature
POST /balance/refresh
POST /rewards/daily
POST /ads/start、/ads/progress、/ads/complete、/ads/cancel
POST /round/start、/round/sync、/round/leave

服务重放合法操作计算得失，不接受客户端提交的得失数字。
账户事务锁和操作编号用于避免并发重复发奖及重复结算。
历史币种字段和旧牌局保留用于审计及回放，当前账户只使用金币。

依赖安装：npm ci --ignore-scripts
测试：npm test（无需生产 MySQL）
