import { existsSync, mkdirSync, readFileSync, writeFileSync, openSync, closeSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(project, 'build');
const configured = JSON.parse(readFileSync(join(project, 'settings', 'build-web-mobile.json'), 'utf8'));
function sourceFingerprint() {
  const hash = createHash('sha256');
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const filename = join(directory, entry.name);
      if (entry.isDirectory()) visit(filename);
      else if (entry.isFile() && !entry.name.endsWith('.meta')) {
        hash.update(filename.slice(project.length).replaceAll('\\', '/')); hash.update(readFileSync(filename));
      }
    }
  };
  visit(join(project, 'assets'));
  hash.update(readFileSync(join(project, 'settings', 'build-web-mobile.json')));
  return hash.digest('hex');
}
function directoryFingerprint(directory, filter = () => true) {
  const hash = createHash('sha256');
  const visit = (folder) => {
    for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const filename = join(folder, entry.name);
      if (entry.isDirectory()) visit(filename);
      else if (entry.isFile() && filter(filename)) { hash.update(filename.slice(directory.length).replaceAll('\\', '/')); hash.update(readFileSync(filename)); }
    }
  };
  visit(directory); return hash.digest('hex');
}
const mainScene = join(project, 'assets', 'scenes', 'main.scene');
const mainMeta = JSON.parse(readFileSync(`${mainScene}.meta`, 'utf8'));
if (configured.startScene !== mainMeta.uuid) throw new Error('入口场景 UUID 与构建配置不一致。');
if (!existsSync(join(project, 'assets', 'scripts', 'LianzhuoApp.ts'))) {
  throw new Error('找不到 LianzhuoApp.ts，客户端源文件尚未准备完整。');
}

mkdirSync(build, { recursive: true });
const configPath = join(build, 'build-config-web-mobile.json');
const logPath = join(build, 'creator-build.log');
writeFileSync(configPath, `${JSON.stringify({ ...configured, debug: process.argv.includes('--release') ? false : configured.debug, buildPath: build }, null, 2)}\n`);
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
  const launcherLog = join(build, 'creator-launcher.log');
  const logFd = openSync(launcherLog, 'w');
  let closed = false;
  const closeLog = () => { if (!closed) { closed = true; closeSync(logFd); } };
  const environment = { ...process.env };
  delete environment.ELECTRON_RUN_AS_NODE;
  console.log('启动器日志:', launcherLog);
  const inputsBeforeBuild = sourceFingerprint();
  // Creator may leave auxiliary processes alive. Direct file descriptors prevent
  // those processes from retaining the terminal's stdout/stderr pipes after build.
  const child = spawn(exe, args, { cwd: project, env: environment, stdio: ['ignore', logFd, logFd], windowsHide: true });
  child.on('error', (error) => { closeLog(); console.error(error.message); process.exitCode = 1; });
  child.on('exit', (code, signal) => {
    closeLog();
    // Creator 3.8 uses 36 for a successful command-line build.
    if ((code === 36 || code === 0) && existsSync(join(build, configured.outputName, 'index.html'))) {
      const inputsAfterBuild = sourceFingerprint();
      if (inputsBeforeBuild !== inputsAfterBuild) {
        console.error('构建过程中源文件发生改变，请等待编辑完成后重新构建。'); process.exitCode = 1; return;
      }
      writeFileSync(join(build, 'build-provenance.json'), JSON.stringify({
        engine: '3.8.8', completedAt: new Date().toISOString(), sourceFingerprint: inputsAfterBuild,
        assetMetadataFingerprint: directoryFingerprint(join(project, 'assets'), (filename) => filename.endsWith('.meta')),
        outputFingerprint: directoryFingerprint(join(build, configured.outputName)),
        debug: process.argv.includes('--release') ? false : configured.debug,
        outputName: configured.outputName,
      }, null, 2) + '\n');
      console.log(`构建完成，请检查 build/${configured.outputName}/index.html。`);
    }
    else { console.error(`Creator 构建失败: ${code ?? signal}`); process.exitCode = code || 1; }
  });
}
