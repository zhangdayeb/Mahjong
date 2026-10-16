# 联桌麻将 · Cocos Creator 客户端

这是与现有网页客户端并存的 Creator 3.8.8 工程。入口场景为 `assets/scenes/main.scene`，使用标准 2D Canvas 与 UI Camera，设计尺寸 1280 × 640。`LianzhuoApp` 挂在 Canvas 上，通过代码生成界面节点；编辑器里的空 Canvas 并不代表运行时没有界面。

## 打开与预览

1. 在 Cocos Dashboard 中选择“添加项目”，选中本目录（`creator`），使用 Creator **3.8.8** 打开。
2. 等待首次资源与脚本导入完成，然后双击 `assets/scenes/main.scene`。
3. 先启动下文的本地 API 服务，再点击编辑器顶部的预览按钮。当前已打通加载页 → 大厅 → 场次 → 人机对局 → 后端结算。

当前七种玩法共用场次与牌桌组件，保留原规则引擎；支持换牌、定缺、碰杠胡、托管、听牌、快捷消息、流水、签名、每日救济金和演示广告。首版采用 2D 牌面、飞牌补间与金色字牌粒子，完整 3D 牌桌及原版骨骼／风雨特效尚未迁入。界面由 TypeScript 建立；后续可逐步拆为供美术直接调整的 Prefab。

当前目标为浏览器 Web Mobile 横屏人机练习。Android/iOS 原生包尚需服务器地址、登录会话和网络适配；演示广告的可见性计时也需要原生实现。现阶段没有真人联网匹配。

`tools/open-project.ps1` 是用户主动打开交互编辑器的辅助脚本。右键该文件选择“使用 PowerShell 运行”，或在本目录执行 `powershell -File tools/open-project.ps1`。脚本默认使用本机安装位置，其他机器可传入 `-CreatorExe` 指定路径；它不会构建或启动本地后端。

也可以在 PowerShell 中直接打开：

```powershell
& 'C:\ProgramData\cocos\editors\Creator\3.8.8\CocosCreator.exe' --project 'C:\Asoft\Codex\majong\creator'
```

## 构建网页版本

在本目录执行 `node tools/build-web.mjs --prepare-only` 会生成构建参数，并打印工程、输出和日志路径；不会启动编辑器。

执行 `node tools/build-web.mjs` 会使用本机 Creator 3.8.8 构建 Web Mobile 横屏版本，输出到 `build/web-mobile/`。其他机器可以用 `COCOS_CREATOR_EXE` 环境变量指定安装路径。CLI 构建仍需要桌面会话，不能在没有图形环境的系统服务中直接运行。构建失败时查看 `build/creator-build.log`；Creator 的成功退出码为 36，脚本会转为正常结果。

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

提交 `assets`、`settings`、`package.json`、`tsconfig.json`、工具脚本和本说明。`library`、`temp`、`build`、个人 `profiles` 和日志由 Creator 生成，已忽略。图片、语音和规则模块按当前迁移阶段导入；现有线上版本由根目录的原客户端继续提供。

工程场景基于本机 Creator 自带 `scene-2d.scene` 模板，而不是跨版本复制旧场景。命令行构建参数与退出码参考 [Creator 3.8 官方说明](https://docs.cocos.com/creator/3.8/manual/zh/editor/publish/publish-in-command-line.html)。
