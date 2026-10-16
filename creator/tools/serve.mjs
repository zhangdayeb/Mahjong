import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { realpath, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createFileStore } from '../../backend/file-store.js';
import { createWalletService } from '../../backend/wallet-service.js';
import { createWalletApi } from '../../backend/http-api.js';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(project, '..');
const args = process.argv.slice(2);
const apiOnly = args.includes('--api-only');
const rootIndex = args.indexOf('--root');
if (rootIndex >= 0 && !args[rootIndex + 1]) throw new Error('--root 后需要静态网页目录。');
const configFile = existsSync(join(project, 'build', 'build-config-web-mobile.json'))
  ? join(project, 'build', 'build-config-web-mobile.json')
  : join(project, 'settings', 'build-web-mobile.json');
const config = JSON.parse(readFileSync(configFile, 'utf8'));
const configuredBuild = (config.buildPath || 'project://build').replace(/^project:\/\//, `${project}/`);
const staticPath = rootIndex >= 0
  ? resolve(args[rootIndex + 1])
  : resolve(project, configuredBuild, config.outputName || 'web-mobile');
if (!apiOnly && !existsSync(join(staticPath, 'index.html'))) {
  throw new Error(`网页包尚未构建，请先执行 tools/build-web.mjs。静态目录：${staticPath}`);
}
const staticRoot = apiOnly ? null : await realpath(staticPath);
const ledgerFile = join(repo, '.local', 'creator-wallet.json');
const store = await createFileStore(ledgerFile);
const service = createWalletService(store);
service.storageName = 'creator-local-file';
// Opt-in local diagnostics contain only replay input, never cookies or account IDs.
if (args.includes('--diagnose-replays')) {
  const sync = service.sync;
  service.sync = async (accountId, input) => {
    try { return await sync(accountId, input); }
    catch (error) {
      if (error.status === 422) {
        const game = JSON.parse(readFileSync(ledgerFile, 'utf8')).games[input.id];
        if (game) {
          const replay = Object.fromEntries(['mode', 'room', 'seed', 'startBalance', 'rulesVersion', 'rulesData'].map(key => [key, game[key]]));
          replay.actions = input.actions;
          try {
            await writeFile(join(repo, '.local', 'creator-rejected-replay.json'), JSON.stringify(replay, null, 2));
            console.error('Replay diagnostic saved locally; action count:', input.actions.length);
          } catch { console.error('Local replay diagnostic could not be saved.'); }
        }
      }
      throw error;
    }
  };
}
const origin = 'http://127.0.0.1:8780';
const allowedOrigins = new Set([
  'http://127.0.0.1:8780', 'http://localhost:8780',
  'http://127.0.0.1:7456', 'http://localhost:7456',
]);
const walletHandlers = new Map([...allowedOrigins].map((allowedOrigin) => [
  allowedOrigin, createWalletApi(service, { origin: allowedOrigin, secure: false }),
]));
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm', '.bin': 'application/octet-stream',
  '.data': 'application/octet-stream', '.mem': 'application/octet-stream',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg',
  '.wav': 'audio/wav', '.mp4': 'video/mp4', '.ttf': 'font/ttf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
const inside = (target) => {
  const fromRoot = relative(staticRoot, target);
  return fromRoot !== '..' && !fromRoot.startsWith(`..${process.platform === 'win32' ? '\\' : '/'}`)
    && !isAbsolute(fromRoot);
};
function sendError(res, status, message) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  res.end(message);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', origin);
    if (url.pathname === '/demo-api' || url.pathname.startsWith('/demo-api/')) {
      const requestOrigin = req.headers.origin;
      res.setHeader('Vary', 'Origin');
      if (requestOrigin && !allowedOrigins.has(requestOrigin)) {
        sendError(res, 403, 'Origin not allowed');
        return;
      }
      if (requestOrigin) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      if (req.method === 'OPTIONS') {
        const requestedMethod = req.headers['access-control-request-method'];
        const requestedHeaders = String(req.headers['access-control-request-headers'] || '')
          .split(',').map((header) => header.trim().toLowerCase()).filter(Boolean);
        if (!requestOrigin || !['GET', 'POST'].includes(requestedMethod)
          || requestedHeaders.some((header) => header !== 'content-type')) {
          sendError(res, 403, 'Preflight not allowed');
          return;
        }
        res.writeHead(204, {
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Cache-Control': 'no-store',
          'Vary': 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers',
        });
        res.end();
        return;
      }
      await walletHandlers.get(requestOrigin || origin)(req, res);
      return;
    }
    if (url.pathname === '/health' && req.method === 'GET') {
      await service.health();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(JSON.stringify({ ok: true, client: 'creator', storage: service.storageName, payments: false }));
      return;
    }
    if (apiOnly) {
      sendError(res, url.pathname === '/' ? 200 : 404,
        'Creator 本地后端已启动。编辑器可直接点预览。网页入口请先构建，然后不用 --api-only 重启该服务。');
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD');
      sendError(res, 405, 'Method not allowed');
      return;
    }
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { sendError(res, 400, 'Invalid URL'); return; }
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').includes('..')) {
      sendError(res, 403, 'Forbidden');
      return;
    }
    let target = resolve(staticRoot, `.${pathname}`);
    if (!inside(target)) { sendError(res, 403, 'Forbidden'); return; }
    let info = await stat(target);
    if (info.isDirectory()) { target = join(target, 'index.html'); info = await stat(target); }
    if (!info.isFile()) { sendError(res, 404, 'Not found'); return; }
    target = await realpath(target);
    if (!inside(target)) { sendError(res, 403, 'Forbidden'); return; }

    let start = 0;
    let end = info.size - 1;
    let status = 200;
    const headers = {
      'Content-Type': mime[extname(target).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes',
      'X-Content-Type-Options': 'nosniff',
    };
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (match && (match[1] || match[2])) {
        if (match[1]) {
          start = Number(match[1]);
          if (match[2]) end = Math.min(Number(match[2]), end);
        } else { start = Math.max(0, info.size - Number(match[2])); }
      }
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start)
        || !Number.isSafeInteger(end) || start > end || start >= info.size) {
        res.writeHead(416, { ...headers, 'Content-Range': `bytes */${info.size}` });
        res.end();
        return;
      }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length'] = Math.max(0, end - start + 1);
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || info.size === 0) { res.end(); return; }
    const stream = createReadStream(target, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    if (res.headersSent) { res.destroy(); return; }
    sendError(res, error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500,
      error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 'Not found' : 'Local server error');
  }
});
server.on('error', (error) => { console.error('本地预览启动失败:', error.message); process.exitCode = 1; });
server.listen(8780, '127.0.0.1', () => {
  console.log(`联桌麻将 Creator 预览：${origin}/`);
  console.log('静态目录：', staticRoot || '仅后端模式；在 Creator 编辑器点击预览');
  console.log('独立本地账本：', ledgerFile);
  console.log('健康检查：', `${origin}/demo-api/health`);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
