# 联桌麻将 · Cocos Creator 客户端

这是游戏的 Creator 3.8.8 客户端工程。入口场景为 `assets/scenes/main.scene`，使用标准 2D Canvas 与 UI Camera，设计尺寸 1280 × 640。`LianzhuoApp` 挂在 Canvas 上，通过代码生成界面节点；运行后加载页、大厅、场次、七种玩法牌桌及全部功能窗口均由 Cocos 呈现。

## 打开与预览

1. 在 Cocos Dashboard 中选择“添加项目”，选中本目录（`creator`），使用 Creator **3.8.8** 打开。
2. 等待首次资源与脚本导入完成，然后双击 `assets/scenes/main.scene`。
3. 先启动下文的本地 API 服务，再点击编辑器顶部的预览按钮。当前已打通加载页 → 大厅 → 场次 → 人机对局 → 后端结算。

七种玩法共用场次与牌桌组件，保留经过后端校验的规则引擎；支持换牌、定缺、碰杠胡、托管、听牌、快捷消息、流水、签名、每日救济金和演示广告。大厅支持拖动、滚轮和箭头查看全部玩法；规则覆盖基础、番型及补充说明。反馈真实保存并生成系统邮件，邮件可阅读及标记已读，金币历史可分页查看。

牌桌动画以 Creator Sprite、Graphics、UIOpacity 和引擎时钟重制，覆盖开场、发牌、换牌、定缺、碰杠胡、自摸、抢杠胡、明牌、闪电、光圈、粒子、明杠旋风、暗杠雨、番型金字扫光和金币曲线。窗口打开或切到后台时暂停，恢复后保持动画与操作计时一致。原金字、牌面及光效纹理迁入 Creator 资源，全部效果由 Cocos 绘制。浏览器语义控制层提供键盘、读屏和平台文字输入，与场景中的 Button/EditBox 共用业务逻辑。

当前目标为浏览器 Web Mobile 横屏人机练习。Android/iOS 原生包尚需服务器地址、登录会话和网络适配；演示广告的可见性计时也需要原生实现。现阶段没有真人联网匹配。

`tools/open-project.ps1` 是用户主动打开交互编辑器的辅助脚本。右键该文件选择“使用 PowerShell 运行”，或在本目录执行 `powershell -File tools/open-project.ps1`。脚本默认使用本机安装位置，其他机器可传入 `-CreatorExe` 指定路径；它不会构建或启动本地后端。

也可以在 PowerShell 中直接打开：

```powershell
& 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe' --project 'C:\Asoft\Codex\majong\creator'
```

## 构建网页版本

在本目录执行 `node tools/build-web.mjs --prepare-only` 会生成构建参数，并打印工程、输出和日志路径；不会启动编辑器。

执行 `node tools/build-web.mjs` 会使用本机 Creator 3.8.8 构建 Web Mobile 横屏版本，输出到 `build/web-mobile/`；生产包使用 `node tools/build-web.mjs --release` 关闭调试。其他机器可以用 `COCOS_CREATOR_EXE` 环境变量指定安装路径。CLI 构建需要桌面会话。日志为 `build/creator-build.log` 与 `build/creator-launcher.log`；成功后生成源、metadata 及真实输出指纹。

`settings/build-web-mobile.json` 保存入口场景、横屏和调试构建设置。正式发布前可以将其中的 `debug` 改为 `false`，也可在编辑器“项目 → 构建发布”面板导出进一步调整过的配置。

网页包必须通过 HTTP 服务打开；不能直接双击 `index.html`。后端连接设置和当前实现范围以 `assets/scripts` 中的客户端代码及根项目说明为准。独立预览时，浏览器的跨域规则仍然适用。

## 本地完整流程测试

网页构建完成后，在本目录执行：

```powershell
node tools/serve.mjs
```

然后访问 `http://127.0.0.1:8780/`。服务从生成的构建配置自动读取输出目录，默认是 `build/web-mobile/`；若构建输出名称已调整，则以配置为准。也可通过 `node tools/serve.mjs --root ./build/其他输出目录` 指定网页包目录。

该服务将静态网页与 `/demo-api` 放在同一来源，复用根项目的金币后端与对局校验逻辑。数据单独写入根目录 `.local/creator-wallet.json`，不会使用原网页客户端的本地账本或服务器生产账本。健康检查为 `http://127.0.0.1:8780/demo-api/health`，按 `Ctrl+C` 停止服务。仅监听本机地址。

## 编辑器直接预览

尚未构建网页包时，可先在根项目目录执行：

```powershell
node creator/tools/serve.mjs --api-only
```

再打开 Creator 工程，点击编辑器预览。默认预览地址 `http://localhost:7456` 或 `http://127.0.0.1:7456` 会连接**相同主机名**的 `8780/demo-api`，携带该主机名下的游客会话 Cookie。可以直接测试金币、签名和牌局同步，数据仍然写入独立 Creator 本地账本。仅后端模式不提供网页包，访问 `8780/` 会显示构建提示。

本地预览服务只接受上述两个 `7456` 来源以及 `localhost:8780`、`127.0.0.1:8780` 网页入口来源；其余来源不能跨域访问，也不使用通配 CORS。编辑器预览端口改为其他端口时不会自动连接；请继续使用默认 `7456`，或者使用网页构建后的 `8780` 同域预览。正式网站默认使用同域接口，不套用本机预览端口规则。

## 源码与版本管理

从仓库根目录验证服务和规则：

```powershell
node creator/tools/sync-rules.mjs --check
node creator/tools/sync-assets.mjs --check --require-imported
node creator/tools/verify-services.mjs
node creator/tools/verify-built-rules.mjs
```

第二条需要 Creator 已完成图片导入；第三条使用临时转译、内存账户和随机本机端口，不连接生产数据库，不修改当前游客账本。需 TypeScript 包或本机 Creator 3.8.8 的 TypeScript 工具链。

第四条需要已完成网页构建，直接加载实际 `System.register` 脚本，与原后端规则逐动作比较七种玩法，并覆盖标准胡和不洗牌续局。Creator 的松散转译会将部分可迭代展开当成数组；规则生成工具在明确的 Map/Set 站点使用等价的 `Array.from`，客户端选牌和声音队列同样显式转换，避免源文件测试通过而发布产物分叉。

提交 `assets`、`settings`、`package.json`、`tsconfig.json`、工具脚本和本说明。`library`、`temp`、`build`、个人 `profiles` 和日志由 Creator 生成，已忽略。

## 发布

完成上述构建与验证后运行 `node tools/pack-release.mjs`。工具拒绝过期或调试构建，生成独立 Creator 前端、兼容现有会话的新后端、文件 SHA256 清单、gzip、Nginx 缓存配置以及激活和回滚脚本，写入根目录忽略的 `.deploy/`。同域 `/demo-api` 沿用游客 Cookie；现有账户与余额不会重新初始化。反馈／邮件 schema 为追加式迁移。

旧 `hall.html`、`rooms.html`、`reference.html`、玩法合集和娱乐等 15 个主要入口均返回同一 Creator Canvas。入口脚本解析原玩法、场次及 `view` 参数；旧牌桌链接先显示场次确认，避免刷新时自动创建新局。已关闭的三国／十二生肖链接返回大厅提示。发布切换保留上一版本用于回滚。

工程场景基于本机 Creator 自带 `scene-2d.scene` 模板，而不是跨版本复制旧场景。命令行构建参数与退出码参考 [Creator 3.8 官方说明](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-in-command-line.html)。
