import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// A small, reproducible first-stage resource collection. Existing image UUIDs
// stay stable. SpriteFrame import settings are committed with the images so a
// fresh checkout cannot silently import 2D UI pictures as Texture2D-only.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = path.dirname(projectRoot);
const outputRoot = path.join(projectRoot, 'assets', 'resources');
const checkOnly = process.argv.includes('--check');
const requireImported = process.argv.includes('--require-imported');
const uiIndex = JSON.parse(await fs.readFile(path.join(workspaceRoot, 'demo/assets/reference/ui-index.json'), 'utf8'));
const entries = [
  ['demo/assets/entry/lianzhuo-loading-bg-v1.png', 'backgrounds/loading.png'],
  ['demo/assets/lobby/lianzhuo-hall-bg-v1.png', 'backgrounds/hall.png'],
  ['demo/assets/reference/desk.jpg', 'backgrounds/table.jpg'],
  ['demo/assets/lobby/user-avatar.png', 'ui/avatar.png'],
  ['demo/player-study/head_3.png', 'ui/avatar-1.png'],
  ['demo/player-study/head_5.png', 'ui/avatar-2.png'],
  ['demo/player-study/head_7.png', 'ui/avatar-3.png'],
  ['demo/assets/lobby/391.png', 'ui/coin.png'],
  ['demo/hall-games-study/assets/Match-22.png', 'games/classic.png'],
  ['demo/hall-games-study/assets/Match-163.png', 'games/red.png'],
  ['demo/hall-games-study/assets/Match-82.png', 'games/exchange.png'],
  ['demo/hall-games-study/assets/Match-22.png', 'games/six.png'],
  ['demo/hall-games-study/assets/Match-90.png', 'games/sixFixed.png'],
  ['demo/hall-games-study/assets/Match-286.png', 'games/crazy.png'],
  ['demo/hall-games-study/assets/Match-82.png', 'games/eightFixed.png'],
  ['demo/assets/reference/' + uiIndex['hand/img_normal_card'].file, 'tiles/body.png'],
];
for (const suit of [1, 2, 3, 5]) {
  for (let rank = 1; rank <= (suit === 5 ? 3 : 9); rank++) {
    const frame = uiIndex[`hand/img_tile_${suit}_${rank}`];
    if (!frame) throw new Error(`Missing tile ${suit}-${rank}`);
    entries.push(['demo/assets/reference/' + frame.file, `tiles/${suit * 10 + rank}.png`]);
  }
}
// The top opponent's actual concealed tile is the green-backed sprite.
const { TABLE_SOURCE } = await import(pathToFileURL(path.join(workspaceRoot, 'demo/table-layout-source.js')).href);
const tableFrames = JSON.parse(await fs.readFile(path.join(workspaceRoot, 'demo/table-layout-study/frames.json'), 'utf8'));
const backKey = TABLE_SOURCE.seats[2].hand.frames[Math.floor(TABLE_SOURCE.seats[2].hand.frames.length / 2)];
const back = tableFrames.find(frame => frame.key === backKey);
if (!back) throw new Error(`Cannot resolve concealed tile sprite: ${backKey}`);
entries.push(['demo/' + back.image, 'tiles/back.png']);
const texture = tableFrames.find(frame => frame.key === TABLE_SOURCE.desk.texture.body);
if (texture) entries.push(['demo/' + texture.image, 'backgrounds/table-texture.png']);
for (const name of (await fs.readdir(path.join(workspaceRoot, 'demo/assets/audio-v2'))).sort()) {
  if (name.endsWith('.mp3')) entries.push(['demo/assets/audio-v2/' + name, 'audio/' + name]);
}
for (const name of (await fs.readdir(path.join(workspaceRoot, 'demo/assets/audio-v2/voice'))).sort()) {
  if (name.endsWith('.mp3')) entries.push(['demo/assets/audio-v2/voice/' + name, 'audio/voice/' + name]);
}

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const collection = await Promise.all(entries.map(async ([source, destination]) => {
  const bytes = await fs.readFile(path.join(workspaceRoot, source));
  return { source, destination, bytes, sha256: hash(bytes) };
}));
if (new Set(collection.map(entry => entry.destination)).size !== collection.length) throw new Error('Duplicate destination');
let changed = 0;
let metadataChanged = 0;
let pendingSpriteFrames = 0;
for (const entry of collection) {
  const destination = path.resolve(outputRoot, entry.destination);
  if (!destination.startsWith(outputRoot + path.sep)) throw new Error('Resource destination leaves project');
  let current = null;
  try { current = await fs.readFile(destination); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (!current || hash(current) !== entry.sha256) {
    changed++;
    if (!checkOnly) {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(destination, entry.bytes);
    }
  }
  if (!/\.(png|jpe?g)$/i.test(entry.destination)) continue;
  const metaPath = destination + '.meta';
  let original = null;
  try { original = JSON.parse(await fs.readFile(metaPath, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (original && original.importer !== 'image') throw new Error(`Unexpected image importer: ${entry.destination}`);
  // Creator 3.8.8's image inspector applies this same userData.type change,
  // then changes texture wrap mode to Clamp and disables mipmaps. The image
  // importer produces the named spriteFrame subasset during its next import.
  // Do not fabricate generated dimensions, vertices, or trimmed rectangles.
  const meta = original ? structuredClone(original) : {
    ver: '1.0.27', importer: 'image', imported: false, uuid: randomUUID(), files: [], subMetas: {}, userData: {},
  };
  meta.userData ||= {};
  meta.userData.type = 'sprite-frame';
  meta.subMetas ||= {};
  const texture = meta.subMetas['6c48a'] ||= { userData: {} };
  texture.userData ||= {};
  texture.userData.wrapModeS = 'clamp-to-edge';
  texture.userData.wrapModeT = 'clamp-to-edge';
  texture.userData.mipfilter = 'none';
  if (JSON.stringify(original) !== JSON.stringify(meta)) {
    metadataChanged++;
    if (!checkOnly) {
      // Mark only changed images for import. Re-running sync after Creator
      // generated SpriteFrames leaves imported flags and all UUIDs untouched.
      meta.imported = false;
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2) + '\n');
    }
  }
  if (!Object.values(meta.subMetas).some(sub => sub.importer === 'sprite-frame' && sub.name === 'spriteFrame')) pendingSpriteFrames++;
}
const manifest = JSON.stringify({
  version: 1,
  collection: 'lianzhuo-classic-client-stage-one',
  files: collection.map(({ source, destination, bytes, sha256 }) => ({ source, resource: destination, size: bytes.length, sha256 })),
}, null, 2) + '\n';
const manifestPath = path.join(outputRoot, 'asset-manifest.json');
if (!checkOnly) await fs.writeFile(manifestPath, manifest);
else {
  let current = '';
  try { current = await fs.readFile(manifestPath, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (current !== manifest) changed++;
}
console.log(JSON.stringify({ resources: collection.length, bytes: collection.reduce((total, entry) => total + entry.bytes.length, 0), changed, metadataChanged, pendingSpriteFrames, mode: checkOnly ? 'check' : 'sync' }));
if ((checkOnly && (changed || metadataChanged)) || (requireImported && pendingSpriteFrames)) process.exitCode = 1;
