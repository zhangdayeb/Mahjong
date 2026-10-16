import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(project, 'build');
const configured = JSON.parse(readFileSync(join(project, 'settings', 'build-web-mobile.json'), 'utf8'));
const mainScene = join(project, 'assets', 'scenes', 'main.scene');
const mainMeta = JSON.parse(readFileSync(`${mainScene}.meta`, 'utf8'));
if (configured.startScene !== mainMeta.uuid) throw new Error('入口场景 UUID 与构建配置不一致。');
if (!existsSync(join(project, 'assets', 'scripts', 'LianzhuoApp.ts'))) {
  throw new Error('找不到 LianzhuoApp.ts，客户端源文件尚未准备完整。');
}

mkdirSync(build, { recursive: true });
const configPath = join(build, 'build-config-web-mobile.json');
const logPath = join(build, 'creator-build.log');
writeFileSync(configPath, `${JSON.stringify({ ...configured, buildPath: build }, null, 2)}\n`);
const exe = process.env.COCOS_CREATOR_EXE
  || 'C:/ProgramData/cocos/editors/Creator/3.8.8/CocosCreator.exe';
const args = ['--project', project, '--build', `configPath=${configPath};logDest=${logPath}`];
console.log('工程:', project);
console.log('构建配置:', configPath);
console.log('输出:', join(build, configured.outputName));
console.log('日志:', logPath);
console.log('Creator:', exe);
if (!process.argv.includes('--prepare-only')) {
  if (!existsSync(exe)) throw new Error('找不到 Creator 3.8.8；请设置 COCOS_CREATOR_EXE 为编辑器可执行文件路径。');
  const child = spawn(exe, args, { cwd: project, stdio: 'inherit', windowsHide: true });
  child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
  child.on('exit', (code, signal) => {
    // Creator 3.8 uses 36 for a successful command-line build.
    if (code === 36 || code === 0) console.log('构建完成，请检查 build/web-mobile/index.html。');
    else { console.error(`Creator 构建失败: ${code ?? signal}`); process.exitCode = code || 1; }
  });
}
