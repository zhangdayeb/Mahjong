import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { spawnSync } from 'node:child_process';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(project, '..');
const deploy = join(repo, '.deploy');
const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  if (!process.argv[index + 1] || process.argv[index + 1].startsWith('--')) throw new Error(`${name} requires a value`);
  return process.argv[index + 1];
};
const release = option('--release', `${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-creator-${randomUUID().slice(0, 8)}`);
const previousFront = option('--previous-front', '20261015-table-ui-a3e2000e');
const previousBack = option('--previous-back', '20261014-signature-f0f8e857');
for (const name of [release, previousFront, previousBack]) {
  if (!/^[a-zA-Z0-9-]+$/.test(name)) throw new Error('Unsafe release name');
}
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
function filesIn(directory) {
  const output = [];
  const visit = (folder) => {
    for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const filename = join(folder, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Release source cannot contain symlinks: ${filename}`);
      if (entry.isDirectory()) visit(filename); else if (entry.isFile()) output.push(filename);
    }
  };
  visit(directory); return output;
}
function sourceFingerprint() {
  const hash = createHash('sha256');
  for (const filename of filesIn(join(project, 'assets'))) {
    if (!filename.endsWith('.meta')) { hash.update(filename.slice(project.length).replaceAll('\\', '/')); hash.update(readFileSync(filename)); }
  }
  hash.update(readFileSync(join(project, 'settings', 'build-web-mobile.json')));
  return hash.digest('hex');
}
function directoryFingerprint(directory, filter = () => true) {
  const hash = createHash('sha256');
  for (const filename of filesIn(directory)) {
    if (filter(filename)) { hash.update(filename.slice(directory.length).replaceAll('\\', '/')); hash.update(readFileSync(filename)); }
  }
  return hash.digest('hex');
}
const provenanceFile = join(project, 'build', 'build-provenance.json');
if (!existsSync(provenanceFile)) throw new Error('Use tools/build-web.mjs --release first; build provenance is missing.');
const provenance = JSON.parse(readFileSync(provenanceFile, 'utf8'));
if (provenance.sourceFingerprint !== sourceFingerprint()) throw new Error('The Creator build is stale; sources changed after the build.');
if (provenance.assetMetadataFingerprint !== directoryFingerprint(join(project, 'assets'), (filename) => filename.endsWith('.meta'))) throw new Error('Asset metadata changed after the build.');
const build = resolve(option('--build', join(project, 'build', provenance.outputName)));
if (provenance.outputFingerprint !== directoryFingerprint(build)) throw new Error('The Creator output differs from its completed build fingerprint.');
const settingsFile = filesIn(join(build, 'src')).find((file) => /^settings\.[0-9a-f]+\.json$/.test(file.split(/[\\/]/).pop()));
if (!settingsFile) throw new Error('Built Creator settings are missing.');
const builtSettings = JSON.parse(readFileSync(settingsFile, 'utf8'));
if (builtSettings.CocosEngine !== '3.8.8' || builtSettings.engine?.platform !== 'web-mobile') throw new Error('Expected a Creator 3.8.8 Web Mobile build.');
if (!process.argv.includes('--allow-debug') && (provenance.debug || builtSettings.engine.debug)) throw new Error('Production packaging requires tools/build-web.mjs --release (debug=false).');
if (builtSettings.assets?.server || builtSettings.assets?.remoteBundles?.length) throw new Error('Remote bundles need a separate deployment plan.');

const stage = join(deploy, `${release}-staging`);
if (existsSync(stage)) throw new Error('Release staging already exists; choose a fresh release name.');
const frontend = join(stage, 'frontend');
const backend = join(stage, 'backend');
mkdirSync(frontend, { recursive: true }); mkdirSync(backend, { recursive: true });
for (const filename of filesIn(build)) {
  const name = relative(build, filename);
  if (name.endsWith('.gz') || name.endsWith('.map')) continue;
  const target = join(frontend, name); mkdirSync(dirname(target), { recursive: true }); copyFileSync(filename, target);
}
let html = readFileSync(join(frontend, 'index.html'), 'utf8');
if (!html.includes('GameCanvas') || !html.includes('System.import') || /<(?:iframe|webview)\b/i.test(html)) throw new Error('Expected the actual Creator canvas entry, without legacy embeddings.');
html = html.replace('<head>', '<head>\n  <base href="/">').replace(/<title>[^<]*<\/title>/, '<title>联桌麻将</title>');
const entryPages = ['index.html', 'entry.html', 'loading.html', 'hall.html', 'rooms.html', 'reference.html', 'table.html', 'collections.html', 'collection.html', 'entertainment.html', 'games.html', 'playable.html', 'table-backup.html', 'sanguo-table.html', 'hall-games-preview.html'];
for (const name of entryPages) writeFileSync(join(frontend, name), html);
const gzipReport = [];
for (const filename of filesIn(frontend)) {
  if (!/\.(?:html|js|css|json|wasm|bin|svg)$/.test(filename)) continue;
  const bytes = readFileSync(filename); const compressed = gzipSync(bytes, { level: 9 });
  if (compressed.length >= bytes.length * 0.95) continue;
  writeFileSync(`${filename}.gz`, compressed);
  gzipReport.push({ file: relative(frontend, filename).replaceAll('\\', '/'), bytes: bytes.length, gzip: compressed.length });
}
const publicFiles = Object.fromEntries(filesIn(frontend).map((filename) => {
  const bytes = readFileSync(filename);
  return [relative(frontend, filename).replaceAll('\\', '/'), { bytes: bytes.length, sha256: sha(bytes) }];
}));
const frontManifest = { release, client: 'cocos-creator', engine: '3.8.8', entryPages, files: publicFiles };
writeFileSync(join(frontend, 'release-manifest.json'), JSON.stringify(frontManifest, null, 2) + '\n');

// Private server-only archive: backend source plus its relative pure-rule imports.
// Production dependencies are reused from the prior immutable backend release.
const privateFiles = new Set();
for (const entry of readdirSync(join(repo, 'backend'), { withFileTypes: true })) {
  if (entry.isFile() && /\.(?:js|json|sql|txt)$/.test(entry.name)) privateFiles.add(join(repo, 'backend', entry.name));
}
privateFiles.add(join(repo, 'demo', 'package.json'));
const queue = [...privateFiles].filter((filename) => filename.endsWith('.js'));
while (queue.length) {
  const filename = queue.pop(); const source = readFileSync(filename, 'utf8');
  const imports = /(?:import|export)[^\n]*?(?:from\s*)?['"](\.[^'"]+)['"]/g;
  for (const match of source.matchAll(imports)) {
    const dependency = resolve(dirname(filename), match[1]);
    const name = relative(repo, dependency);
    if (name.startsWith('..') || !existsSync(dependency)) throw new Error(`Invalid backend dependency: ${match[1]} from ${filename}`);
    if (!privateFiles.has(dependency)) { privateFiles.add(dependency); if (dependency.endsWith('.js')) queue.push(dependency); }
  }
}
for (const filename of privateFiles) {
  const target = join(backend, relative(repo, filename)); mkdirSync(dirname(target), { recursive: true }); copyFileSync(filename, target);
}
for (const name of ['backend/migrate-support.js', 'backend/support-schema.sql', 'backend/support.test.js', 'backend/server.js']) {
  if (!existsSync(join(backend, name))) throw new Error(`Required backend release file missing: ${name}`);
}
const privateManifest = Object.fromEntries(filesIn(backend).map((filename) => {
  const bytes = readFileSync(filename);
  return [relative(backend, filename).replaceAll('\\', '/'), { bytes: bytes.length, sha256: sha(bytes) }];
}));
writeFileSync(join(backend, 'backend-release-manifest.json'), JSON.stringify({ release, files: privateManifest }, null, 2) + '\n');
const frontArchive = join(deploy, `${release}-frontend.tar.gz`);
const backArchive = join(deploy, `${release}-backend.tar.gz`);
for (const [directory, archive] of [[frontend, frontArchive], [backend, backArchive]]) {
  const result = spawnSync(process.platform === 'win32' ? 'tar.exe' : 'tar', ['-czf', archive, '-C', directory, '.'], { stdio: 'pipe', windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || result.stderr.toString());
}

const cacheConfig = `# Managed only for majong.xgmajong.top Creator client.
gzip_static on;
location = / {
    try_files /index.html =404;
    add_header Cache-Control "no-cache" always;
}
location ~* ^/(?:index|entry|loading|hall|rooms|reference|table|collections|collection|entertainment|games|playable|table-backup|sanguo-table|hall-games-preview)\\.html$ {
    try_files /index.html =404;
    add_header Cache-Control "no-cache" always;
}
location ~* \\.wasm$ {
    default_type application/wasm;
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location ~* "^/(?:assets|cocos-js|src)/.*\\.[0-9a-f]{5,}\\.(?:js|json|css|png|jpg|jpeg|webp|mp3|ogg|wav|bin|svg|ttf|woff|woff2)$" {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location ~* "^/(?:index|application|style)\\.[0-9a-f]{5,}\\.(?:js|css)$" {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
`;
const record = {
  release, previous_frontend: previousFront, previous_backend: previousBack,
  frontend_archive: frontArchive, backend_archive: backArchive,
  frontend_sha256: sha(readFileSync(frontArchive)), backend_sha256: sha(readFileSync(backArchive)),
  frontend_files: Object.keys(publicFiles).length, backend_files: Object.keys(privateManifest).length,
  public_bytes: Object.values(publicFiles).reduce((sum, file) => sum + file.bytes, 0),
  frontend_archive_bytes: readFileSync(frontArchive).length,
  entry_pages: entryPages, build_provenance: provenance,
  gzip: { original_bytes: gzipReport.reduce((sum, file) => sum + file.bytes, 0), compressed_bytes: gzipReport.reduce((sum, file) => sum + file.gzip, 0), largest: gzipReport.sort((a, b) => b.bytes - a.bytes).slice(0, 12) },
};
const activation = makeActivation(record, cacheConfig, sha(Buffer.from(html)));
const rollback = makeRollback(record);
writeFileSync(join(deploy, `${release}-activate.sh`), activation);
writeFileSync(join(deploy, `${release}-rollback.sh`), rollback);
writeFileSync(join(deploy, `${release}-nginx.conf`), cacheConfig);
writeFileSync(join(deploy, `${release}-release.json`), JSON.stringify(record, null, 2) + '\n');
writeFileSync(join(deploy, 'creator-release.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ ...record, build_provenance: undefined, gzip: { ...record.gzip, largest: record.gzip.largest.slice(0, 5) }, activation: `${release}-activate.sh`, rollback: `${release}-rollback.sh` }, null, 2));

function makeActivation(info, nginx, indexHash) {
  return `set -eu
RELEASE=${info.release}
PREVIOUS_FRONT=${info.previous_frontend}
PREVIOUS_BACK=${info.previous_backend}
FRONT_ROOT=/www/wwwroot/majong-demo
BACK_ROOT=/opt/majong-demo-service
NGINX=/www/server/nginx/sbin/nginx
CONFIG=/www/server/panel/vhost/nginx/extension/majong.xgmajong.top/creator-client.conf
SNAPSHOT="$FRONT_ROOT/deployment/$RELEASE"
test "$(readlink "$FRONT_ROOT/current")" = "releases/$PREVIOUS_FRONT"
test "$(readlink "$BACK_ROOT/current")" = "releases/$PREVIOUS_BACK"
test ! -e "$FRONT_ROOT/releases/$RELEASE"
test ! -e "$BACK_ROOT/releases/$RELEASE"
test ! -e "$FRONT_ROOT/current.new" && test ! -L "$FRONT_ROOT/current.new"
test ! -e "$BACK_ROOT/current.new" && test ! -L "$BACK_ROOT/current.new"
printf '%s  %s\\n' ${info.frontend_sha256} /home/ubuntu/$RELEASE-frontend.tar.gz | sha256sum -c -
printf '%s  %s\\n' ${info.backend_sha256} /home/ubuntu/$RELEASE-backend.tar.gz | sha256sum -c -
install -d -m 755 "$FRONT_ROOT/releases/$RELEASE" "$BACK_ROOT/releases/$RELEASE" "$SNAPSHOT"
tar --no-same-owner -xzf /home/ubuntu/$RELEASE-frontend.tar.gz -C "$FRONT_ROOT/releases/$RELEASE"
tar --no-same-owner -xzf /home/ubuntu/$RELEASE-backend.tar.gz -C "$BACK_ROOT/releases/$RELEASE"
cp -al "$BACK_ROOT/releases/$PREVIOUS_BACK/backend/node_modules" "$BACK_ROOT/releases/$RELEASE/backend/node_modules"
python3 - "$FRONT_ROOT/releases/$RELEASE" "$BACK_ROOT/releases/$RELEASE" <<'PY'
import hashlib,json,pathlib,sys
for directory,manifest_name in [(sys.argv[1],'release-manifest.json'),(sys.argv[2],'backend-release-manifest.json')]:
 root=pathlib.Path(directory);manifest=json.loads((root/manifest_name).read_text())
 for name,info in manifest['files'].items():
  target=(root/name).resolve();assert target.is_relative_to(root.resolve()),name
  assert hashlib.sha256(target.read_bytes()).hexdigest()==info['sha256'],name
 print('Verified release files:',len(manifest['files']))
assert not (pathlib.Path(sys.argv[1])/'lobby.js').exists()
PY
find "$FRONT_ROOT/releases/$RELEASE" -type d -exec chmod 755 {} +
find "$FRONT_ROOT/releases/$RELEASE" -type f -exec chmod 644 {} +
cd "$BACK_ROOT/releases/$RELEASE"
node --test backend/wallet.test.js backend/rewards.test.js backend/rules-v2.test.js backend/signature.test.js backend/support.test.js
if test -f "$CONFIG"; then cp -p "$CONFIG" "$SNAPSHOT/nginx-before.conf"; else touch "$SNAPSHOT/nginx-before.absent"; fi
rollback() {
  if test "$(readlink "$FRONT_ROOT/current")" = "releases/$RELEASE"; then ln -sfn "releases/$PREVIOUS_FRONT" "$FRONT_ROOT/current.rollback"; mv -Tf "$FRONT_ROOT/current.rollback" "$FRONT_ROOT/current"; fi
  if test "$(readlink "$BACK_ROOT/current")" = "releases/$RELEASE"; then ln -sfn "releases/$PREVIOUS_BACK" "$BACK_ROOT/current.rollback"; mv -Tf "$BACK_ROOT/current.rollback" "$BACK_ROOT/current"; systemctl restart majong-demo.service; fi
  if test -f "$SNAPSHOT/nginx-before.conf"; then cp -p "$SNAPSHOT/nginx-before.conf" "$CONFIG"; else rm -f "$CONFIG"; fi
  "$NGINX" -t && "$NGINX" -s reload
}
trap 'result=$?; if test "$result" -ne 0; then rollback; fi' EXIT
python3 - "$BACK_ROOT/releases/$RELEASE/backend/migrate-support.js" "$RELEASE" <<'PY'
import os,pathlib,subprocess,sys
settings=dict(line.split('=',1) for line in pathlib.Path('/etc/majong-demo/backend.env').read_text().splitlines() if '=' in line and not line.lstrip().startswith('#'))
environment=dict(os.environ,**settings)
check=subprocess.run(['/usr/bin/node',sys.argv[1],'--check'],env=environment)
if check.returncode==0:
 print('Support schema already ready; no DDL or administrator credential used.')
elif check.returncode==2:
 helper=pathlib.Path('/home/ubuntu/creator-admin-migrate-once.sh')
 credential=pathlib.Path('/home/ubuntu/.creator-migration-admin-'+sys.argv[2]+'.json')
 if helper.is_file() and credential.is_file():
  subprocess.run(['/bin/bash',str(helper),sys.argv[1],str(credential)],check=True)
 else:
  subprocess.run(['/usr/bin/node',sys.argv[1]],env=environment,check=True)
 subprocess.run(['/usr/bin/node',sys.argv[1],'--check'],env=environment,check=True)
 print('Additive support migration completed; existing accounts and coin ledger retained.')
else:
 raise RuntimeError('Support schema read-only precheck failed; deployment stopped without migration')
PY
ln -s "releases/$RELEASE" "$BACK_ROOT/current.new"
mv -Tf "$BACK_ROOT/current.new" "$BACK_ROOT/current"
systemctl restart majong-demo.service
healthy=false
for attempt in 1 2 3 4 5 6 7 8 9 10; do
  if curl --silent --fail http://127.0.0.1:8771/demo-api/health; then healthy=true; break; fi
  sleep 1
done
test "$healthy" = true
ln -s "releases/$RELEASE" "$FRONT_ROOT/current.new"
mv -Tf "$FRONT_ROOT/current.new" "$FRONT_ROOT/current"
cat > "$CONFIG" <<'CREATOR_NGINX'
${nginx}CREATOR_NGINX
chmod 644 "$CONFIG"
"$NGINX" -t
"$NGINX" -s reload
python3 - <<'PY'
import hashlib,subprocess
for page in ${JSON.stringify(info.entry_pages)}:
 data=subprocess.check_output(['curl','--silent','--fail','--compressed','--resolve','majong.xgmajong.top:443:127.0.0.1','https://majong.xgmajong.top/'+page])
 assert hashlib.sha256(data).hexdigest()=='${indexHash}',page
 assert b'GameCanvas' in data and b'<iframe' not in data
print('Every public entry serves the same Creator canvas client.')
PY
curl --silent --fail --resolve majong.xgmajong.top:443:127.0.0.1 https://majong.xgmajong.top/demo-api/health
systemctl is-active majong-demo.service
trap - EXIT
printf '\\nCreator release live: %s\\n' "$RELEASE"
`;
}
function makeRollback(info) {
  return `set -eu
RELEASE=${info.release}
PREVIOUS_FRONT=${info.previous_frontend}
PREVIOUS_BACK=${info.previous_backend}
FRONT_ROOT=/www/wwwroot/majong-demo
BACK_ROOT=/opt/majong-demo-service
NGINX=/www/server/nginx/sbin/nginx
CONFIG=/www/server/panel/vhost/nginx/extension/majong.xgmajong.top/creator-client.conf
SNAPSHOT="$FRONT_ROOT/deployment/$RELEASE"
test "$(readlink "$FRONT_ROOT/current")" = "releases/$RELEASE"
test "$(readlink "$BACK_ROOT/current")" = "releases/$RELEASE"
test -d "$FRONT_ROOT/releases/$PREVIOUS_FRONT"
test -d "$BACK_ROOT/releases/$PREVIOUS_BACK"
ln -sfn "releases/$PREVIOUS_FRONT" "$FRONT_ROOT/current.rollback"
mv -Tf "$FRONT_ROOT/current.rollback" "$FRONT_ROOT/current"
ln -sfn "releases/$PREVIOUS_BACK" "$BACK_ROOT/current.rollback"
mv -Tf "$BACK_ROOT/current.rollback" "$BACK_ROOT/current"
if test -f "$SNAPSHOT/nginx-before.conf"; then cp -p "$SNAPSHOT/nginx-before.conf" "$CONFIG"; else test -f "$SNAPSHOT/nginx-before.absent"; rm -f "$CONFIG"; fi
"$NGINX" -t && "$NGINX" -s reload
systemctl restart majong-demo.service
curl --silent --fail http://127.0.0.1:8771/demo-api/health
printf '\\nPrior frontend/backend restored; additive tables and all user data retained.\\n'
`;
}
