import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as THREE from './node_modules/three/build/three.module.js';
import {createHandGeometry,buildHandModel,calibrateHandContact,configureHandTexture,openingTiming} from './hand-effects.js';
import {decodeCompiled} from './meld-study/decode-compiled.mjs';
const read = name => JSON.parse(fs.readFileSync(new URL(`./hand-study/${name}`,import.meta.url)));
const metadata = read('animations.json'), meshData = read('mesh.json');
const geometry = createHandGeometry(THREE,meshData);
const material = new THREE.MeshBasicMaterial();

test('native binary identities and all 18 skin joints are valid', () => {
  const native = name => fs.readFileSync(new URL(`./hand-study/native/${name}`,import.meta.url));
  const sha = value => crypto.createHash('sha256').update(value).digest('hex');
  assert.equal(meshData.vertexCount,3335);
  assert.equal(meshData.indices.length / 3,5567);
  assert.equal(sha(native(`54-${meshData.source.uuid}.bin`)),meshData.source.sha256);
  for (const [name,d] of Object.entries(metadata.actions)) {
    assert.equal(d.jointIndices.length,18);
    assert.equal(d.tracks.length,66);
    assert.ok(d.nodes.some(node => node.path === d.pointPath));
    if (name !== 'discard') assert.equal(sha(native(`${d.source.clipId}-${d.source.uuid}.bin`)),d.source.sha256);
    for (const track of d.tracks) {
      assert.equal(track.values.length,track.times.length * track.size);
      assert.ok(track.times.every((t,i) => Number.isFinite(t) && (!i || t > track.times[i-1])));
      assert.ok(track.values.every(Number.isFinite));
    }
  }
  for (let i = 0; i < meshData.vertexCount; i++) {
    const indices = geometry.attributes.skinIndex, weights = geometry.attributes.skinWeight;
    const sum = weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i);
    assert.ok(Math.abs(sum - 1) < 1e-6);
    assert.ok([indices.getX(i),indices.getY(i),indices.getZ(i),indices.getW(i)].every(n => n >= 0 && n < 18));
  }
});

test('hand texture preserves the original Cocos upload orientation and filters',()=>{
  const native=read('raw/fbx-105.json');
  assert.equal(native.type,'cc.Texture2D');
  const fields=native.data.split(',');
  assert.equal(Number(fields[1]),9729);
  assert.equal(Number(fields[2]),9729);
  assert.equal(fields[6],'0');
  const engine=fs.readFileSync(new URL('../asset-study/scripts/cocos2d-js-min.js',import.meta.url),'utf8');
  assert.ok(engine.includes('_premultiplyAlpha:!1,_flipY:!1,_minFilter:'));
  const texture=configureHandTexture(THREE,new THREE.Texture());
  assert.equal(texture.flipY,false);
  assert.equal(texture.minFilter,THREE.LinearFilter);
  assert.equal(texture.magFilter,THREE.LinearFilter);
  assert.equal(texture.generateMipmaps,false);
});

test('native poses deform the actual skinned hand and contact all four seats exactly', () => {
  for (const d of Object.values(metadata.actions)) for (let seat = 0; seat < 4; seat++) {
    const model = buildHandModel(THREE,d,geometry,material);
    const target = new THREE.Vector3((seat-1.5)*.4,.11,seat%2 ? -.7 : .7);
    calibrateHandContact(THREE,model,target,{seat});
    const initial = [];
    for (let i = 0; i < meshData.vertexCount; i += 17) {
      const point = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position,i);
      model.mesh.applyBoneTransform(i,point).applyMatrix4(model.mesh.matrixWorld);
      initial.push(point);
    }
    model.setTime(d.contactTime);
    assert.ok(model.pointNode.getWorldPosition(new THREE.Vector3()).distanceTo(target) < 1e-9);
    let movement = 0;
    for (let i = 0,j=0; i < meshData.vertexCount; i += 17,j++) {
      const point = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position,i);
      model.mesh.applyBoneTransform(i,point).applyMatrix4(model.mesh.matrixWorld);
      assert.ok(point.toArray().every(Number.isFinite));
      movement = Math.max(movement,point.distanceTo(initial[j]));
    }
    assert.ok(movement > .5,`Native action ${d.source.clipId} did not move its skinned vertices`);
    model.skeleton.dispose();
  }
});

test('converted Three skin matches the source shader homogeneous skin projection', () => {
  const d = metadata.actions.discard, model = buildHandModel(THREE,d,geometry,material);
  calibrateHandContact(THREE,model,new THREE.Vector3(.4,.11,-.1),{seat:3});
  model.setTime(d.contactTime);
  const camera = new THREE.PerspectiveCamera(22,2,.1,100);
  camera.position.set(0,11.2566,13.1373);camera.rotation.x=-40 * Math.PI/180;camera.updateMatrixWorld(true);
  const viewProjection = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);
  for (let i = 0; i < meshData.vertexCount; i += 13) {
    const source = new THREE.Vector4(...meshData.attributes.a_position.values.slice(i*3,i*3+3),1);
    const nativePosition = new THREE.Vector4(0,0,0,0);
    for (let j = 0; j < 4; j++) {
      const bone = meshData.attributes.a_joints.values[i*4+j], weight = meshData.attributes.a_weights.values[i*4+j];
      const matrix = model.skeleton.bones[bone].matrixWorld.clone().multiply(model.skeleton.boneInverses[bone]);
      nativePosition.add(source.clone().applyMatrix4(matrix).multiplyScalar(weight));
    }
    nativePosition.applyMatrix4(viewProjection);
    const normalized = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position,i);
    model.mesh.applyBoneTransform(i,normalized).applyMatrix4(model.mesh.matrixWorld);
    const converted = new THREE.Vector4(normalized.x,normalized.y,normalized.z,1).applyMatrix4(viewProjection).multiplyScalar(geometry.attributes.originalSkinWeightSum.getX(i));
    assert.ok(Math.max(...nativePosition.toArray().map((v,j) => Math.abs(v-converted.toArray()[j]))) < 2e-5);
  }
});

test('opening deal preserves original four-tile batches and release fractions', () => {
  const timing = openingTiming(14);
  assert.equal(timing.duration,3.2);
  assert.deepEqual(timing.tiles.map(tile => tile.delay),[1.2,1.2,1.2,1.2,1.7,1.7,1.7,1.7,2.2,2.2,2.2,2.2,2.7,2.7]);
  assert.ok(timing.tiles.every(tile => tile.duration === .5 && tile.offsetY === 100 && tile.easing === 'easeSineInOut'));
  assert.equal(openingTiming(0).duration,0);
  assert.equal(metadata.actions.discard.contactFraction,.4);
  assert.equal(metadata.actions.cpg.contactFraction,.28);
  assert.equal(metadata.actions.exchange.contactFraction,.35);
});

test('scene parent scale remains outside seat rotation and matches original camera units',()=>{
  const scene = decodeCompiled(read('raw/main-3.json')).instances;
  const anim = scene.find(node=>node?.class==='cc.Node'&&node._name==='anim');
  const sourceScale = new THREE.Vector3(.1,.1,.1);
  for(let node=anim;node&&node._name!=='table';node=node._parent)sourceScale.multiply(new THREE.Vector3(...node._trs.slice(7,10)));
  assert.ok(sourceScale.distanceTo(new THREE.Vector3(3.6,3.6,4.32))<1e-12);
  const d=metadata.actions.discard,model=buildHandModel(THREE,d,geometry,material);
  const target=new THREE.Vector3(-2,metadata.tableSpace.planeY,-1);
  calibrateHandContact(THREE,model,target,{seat:0});
  assert.ok(model.root.scale.distanceTo(sourceScale)<1e-12);
  assert.ok(Math.abs(model.root.rotation.y)<1e-12);
  assert.ok(Math.abs(model.prefabRoot.rotation.y-Math.PI/2)<1e-12);
  assert.ok(Math.abs(metadata.tableSpace.planeY-1.2038)<1e-12);
  model.setTime(d.contactTime);
  assert.ok(model.pointNode.getWorldPosition(new THREE.Vector3()).distanceTo(target)<1e-9);
  const sourceModel=buildHandModel(THREE,d,geometry,material);
  calibrateHandContact(THREE,sourceModel,target.clone().multiplyScalar(10),{seat:0,parentScale:sourceScale.clone().multiplyScalar(10).toArray()});
  sourceModel.setTime(d.contactTime);
  for(let i=0;i<meshData.vertexCount;i+=47){
    const point=new THREE.Vector3().fromBufferAttribute(geometry.attributes.position,i),original=point.clone();
    model.mesh.applyBoneTransform(i,point).applyMatrix4(model.mesh.matrixWorld);
    sourceModel.mesh.applyBoneTransform(i,original).applyMatrix4(sourceModel.mesh.matrixWorld).multiplyScalar(.1);
    assert.ok(point.distanceTo(original)<1e-7);
  }
});
