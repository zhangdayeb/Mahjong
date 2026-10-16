联桌麻将余额后端

完整启动、数据库结构和迁移说明见仓库根目录 README.md。
backend/ 和 demo/ 必须保持同级，后端从 demo/ 导入规则及牌局重放代码。

当前功能：游客 Cookie 会话、单一金币余额、牌局校验及结算、每日救济金、
15 秒演示广告奖励、个性签名、完整金币流水、真实意见反馈和持久邮件。新游客 30000 金币。
每日救济金及每次完整观看演示广告的奖励均为 30000 金币。
随时重置余额已取消；旧 /balance/reset 接口返回 410。
没有充值、提现、兑换或支付接口，牌局仍为人与电脑的练习对局。

本地 creator/tools/serve.mjs 提供相同 API，使用 .local/creator-wallet.json。
demo/server.mjs 保留历史页面验证，使用独立的 .local/practice-wallet.json。
backend/server.js 使用 MySQL，配置项示例见 .env.example。
服务器不会自动读取 .env，可以执行 node --env-file=.env server.js。
生产环境需将同一站点的 /demo-api/ 反向代理到本服务。

主要接口（均以 /demo-api 开头）：
GET  /health
GET  /me
GET  /balance/history
GET  /rewards
GET  /feedback
GET  /mail
POST /profile/signature
POST /balance/refresh
POST /rewards/daily
POST /ads/start、/ads/progress、/ads/complete、/ads/cancel
POST /round/start、/round/sync、/round/leave
POST /feedback
POST /mail/read

服务重放合法操作计算得失，不接受客户端提交的得失数字。
账户事务锁和操作编号用于避免并发重复发奖及重复结算。
历史币种字段和旧牌局保留用于审计及回放，当前账户只使用金币。

新增后台表上线前迁移：node --env-file=.env migrate-support.js
生产服务使用既有 DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD 环境变量。
若服务账户无 DDL 权限，可另外设置 MIGRATION_DB_USER/MIGRATION_DB_PASSWORD。
迁移可重复执行，只新增 demo_feedback、demo_mail 和金币流水检索索引；
不会改写已有账户、会话、金币或旧流水。API 账户需新表 SELECT/INSERT/UPDATE 权限。
已由管理员准备完整结构时，可用运行账户只读核对：
node --env-file=.env migrate-support.js --check
此模式仅执行 information_schema 的 SELECT，核对所有所需列、
字符集/时间精度、账户外键、反馈幂等索引及金币历史完整索引，不需要 DDL 权限。
--check 退出码：0=结构齐全；2=结构未就绪、需要管理员处理；
其他非零码=认证、连接、权限或检查错误，不能据此直接尝试 DDL。

反馈 JSON：{requestId,starLevel:1..5,advice,contact?,tags?}。
正文最多 200 个 Unicode 字符，联系最多 80 个字符，标签最多 6 个。
同一 requestId 和内容重试只保存一次；修改内容须使用新编号。
每账户滚动 24 小时最多 20 条新反馈。成功后生成本人系统收件回执，无金币附件。
初始邮箱为空，不虚构消息。GET /mail 支持 category=all/system/reward；
POST /mail/read 使用 {id} 或 {all:true}，已读状态持久保存并且幂等。

GET /balance/history 的 records 包含对局结算、救济金、广告奖励和刷新记录，
operations 旧列表保持兼容，仍仅含原余额操作。
每条 records 返回 kind/currency/before/after/amount/createdAt，
对局还包含 roundId/mode/room。旧本地流水缺少日期时 createdAt 为 null。
GET /balance/history、/feedback、/mail 均支持 limit=1..50（默认 30）、cursor；
响应 nextCursor 非空时可取下一页。游标按时间和稳定编号排序，读取严格限于本人。

依赖安装：npm ci --ignore-scripts
测试：npm test（无需生产 MySQL）
