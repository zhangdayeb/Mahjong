// Female hand mesh, skin and skeletal keyframes converted from the public fbx bundle.
// Source IDs and limitations are recorded in hand-study/移植核对.txt.
const BASE = new URL('./', import.meta.url);
const DEAL = Object.freeze({delay:1.2,batchSize:4,batchDelay:.5,duration:.5,offsetY:100,easing:'easeSineInOut'});

export function openingTiming(count = 14) {
  count = Math.max(0, Math.floor(Number(count) || 0));
  const tiles = Array.from({length:count}, (_,index) => ({index,delay:DEAL.delay + Math.floor(index / DEAL.batchSize) * DEAL.batchDelay,duration:DEAL.duration,offsetY:DEAL.offsetY,easing:DEAL.easing}));
  return {...DEAL,tiles,duration:count ? tiles.at(-1).delay + DEAL.duration : 0,tweenDuration:DEAL.duration};
}

export function createHandGeometry(THREE, data) {
  const g = new THREE.BufferGeometry();
  for (const [source,target] of [['a_position','position'],['a_normal','normal'],['a_uv0','uv']]) {
    const a = data.attributes[source];
    g.setAttribute(target,new THREE.Float32BufferAttribute(a.values,a.size));
  }
  const joints = data.attributes.a_joints;
  g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(joints.values,joints.size));
  const original = data.attributes.a_weights.values, weights = [], sums = [];
  for (let i = 0; i < original.length; i += 4) {
    const sum = original[i] + original[i+1] + original[i+2] + original[i+3];
    if (!(sum > 0)) throw new Error('Original hand vertex has no skin influence');
    sums.push(sum);
    for (let j = 0; j < 4; j++) weights.push(original[i+j] / sum);
  }
  // Native weights have unit vector length, rather than unit sum. Cocos keeps
  // the skin result as vec4 through projection. Three discards its w, so use
  // normalized positions and restore the original homogeneous factor below.
  g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  g.setAttribute('originalSkinWeightSum',new THREE.Float32BufferAttribute(sums,1));
  g.setIndex(new THREE.Uint16BufferAttribute(data.indices,1));
  g.computeBoundingSphere();
  return g;
}

export function buildHandModel(THREE, definition, geometry, material) {
  const nodes = definition.nodes.map((source,index) => {
    const node = index === 0 ? new THREE.Group() : new THREE.Bone();
    node.name = `original_hand_bone_${index}`;
    node.userData.sourcePath = source.path;
    node.position.fromArray(source.position || [0,0,0]);
    node.quaternion.fromArray(source.quat || [0,0,0,1]);
    node.scale.fromArray(source.scale || [1,1,1]);
    return node;
  });
  for (let i = 0; i < nodes.length; i++) for (const child of definition.nodes[i].children || []) nodes[i].add(nodes[child]);
  const root = new THREE.Group();
  root.name = 'original_hand_table_parent';
  const prefabRoot = new THREE.Group();
  prefabRoot.name = 'original_hand_prefab';
  root.add(prefabRoot);
  const nativeRoot = nodes[0];
  prefabRoot.add(nativeRoot);
  if (definition.rootTRS) {
    nativeRoot.position.fromArray(definition.rootTRS.slice(0,3));
    nativeRoot.quaternion.fromArray(definition.rootTRS.slice(3,7));
    nativeRoot.scale.fromArray(definition.rootTRS.slice(7,10));
  }
  const bones = definition.jointIndices.map(index => nodes[index]);
  const inverses = definition.jointIndices.map(index => new THREE.Matrix4().fromArray(definition.nodes[index].uniqueBindPose));
  const skeleton = new THREE.Skeleton(bones,inverses);
  const mesh = new THREE.SkinnedMesh(geometry,material);
  mesh.name = 'original_female_hand';
  mesh.frustumCulled = false;
  // Cocos' precomputed-joint renderer uses RootNode and baked inverse bind poses,
  // rather than the separate static transform of its mesh-only "hand" node.
  nativeRoot.add(mesh);
  mesh.bind(skeleton,new THREE.Matrix4());
  const byPath = new Map(definition.nodes.map((node,index) => [node.path,index]));
  const tracks = definition.tracks.map(track => {
    const index = byPath.get(track.path);
    if (index === undefined) throw new Error(`Missing original hand joint ${track.path}`);
    const Track = track.property === 'quaternion' ? THREE.QuaternionKeyframeTrack : THREE.VectorKeyframeTrack;
    return {node:nodes[index],property:track.property,track:new Track(`${nodes[index].name}.${track.property}`,track.times,track.values)};
  });
  const curves = tracks.map(({node,property,track}) => ({node,property,interpolant:track.createInterpolant()}));
  const clip = new THREE.AnimationClip('original_hand',definition.duration,tracks.map(x => x.track));
  const pointNode = nodes[definition.nodes.findIndex(node => node.path === definition.pointPath)];
  if (!pointNode) throw new Error('Original prefab hand attachment node is absent');
  function setTime(time) {
    time = Math.max(0,Math.min(definition.duration,time));
    for (const {node,property,interpolant} of curves) node[property].fromArray(interpolant.evaluate(time));
    root.updateMatrixWorld(true);
    skeleton.update();
    return time;
  }
  setTime(0);
  return {root,prefabRoot,mesh,skeleton,nodes,pointNode,clip,setTime,definition};
}

// Place the original prefab's hidden tile attachment precisely at contact.
export function calibrateHandContact(THREE, model, target, {seat=0,scale=200,rotations=[90,180,270,0],parentScale=model.definition.parentScale || [3.6,3.6,4.32]}={}) {
  const root = model.root;
  root.position.set(0,0,0);
  root.scale.fromArray(parentScale);
  root.rotation.set(0,0,0);
  model.prefabRoot.scale.fromArray(model.definition.prefabScale || [scale,scale,scale]);
  model.prefabRoot.rotation.set(0,THREE.MathUtils.degToRad(rotations[seat] ?? rotations[0]),0);
  model.setTime(model.definition.contactTime);
  const actual = model.pointNode.getWorldPosition(new THREE.Vector3());
  const parentTarget = target.clone();
  const parentActual = actual.clone();
  if (root.parent) {
    root.parent.worldToLocal(parentTarget);
    root.parent.worldToLocal(parentActual);
  }
  root.position.copy(parentTarget.sub(parentActual));
  model.setTime(0);
  return root;
}

export function configureHandTexture(THREE,texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  // Native cc.Texture2D (fbx 105) leaves _flipY false and uses linear filters
  // without mipmaps. Three's default flip reverses these authored hand UVs.
  texture.flipY = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export async function createHandEffects({THREE,scene,camera,renderer,screenToWorld,tableToWorld,getTarget,makeTile,force=false,externalClock=false,planeY} = {}) {
  if (!THREE || !scene || !camera) throw new Error('createHandEffects requires THREE, scene and camera');
  const [metadata,meshData] = await Promise.all([
    fetch(new URL('hand-study/animations.json',BASE)).then(response => {if (!response.ok) throw new Error('Hand animation metadata unavailable');return response.json();}),
    fetch(new URL('hand-study/mesh.json',BASE)).then(response => {if (!response.ok) throw new Error('Hand mesh unavailable');return response.json();})
  ]);
  const texture = await new THREE.TextureLoader().loadAsync(new URL(metadata.texture,BASE).href);
  planeY ??= metadata.tableSpace?.planeY ?? 1.2038;
  configureHandTexture(THREE,texture);
  const geometry = createHandGeometry(THREE,meshData);
  // girl_hand_material redirects to internal/builtin-unlit, with baked skin
  // shading in this exact texture. Additional scene lights would change it.
  const material = new THREE.MeshBasicMaterial({map:texture,color:0xffffff});
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'attribute float originalSkinWeightSum;\n' + shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\ngl_Position *= originalSkinWeightSum;');
  };
  material.customProgramCacheKey = () => 'original-hand-homogeneous-skin-v1';
  const jobs = new Set();
  const supported = Object.freeze(['discard','peng','gang','exchange']);
  let frame = 0, disposed = false;

  function resolveWorld(position, options) {
    if (position?.isVector3) return position.clone();
    if (Array.isArray(position) && position.length >= 3) return new THREE.Vector3(...position);
    if (position && Number.isFinite(position.x) && Number.isFinite(position.y) && Number.isFinite(position.z)) return new THREE.Vector3(position.x,position.y,position.z);
    if (position && Number.isFinite(position.x) && Number.isFinite(position.y)) {
      const convert = screenToWorld || tableToWorld;
      if (convert) {
        const point = convert.length >= 2 ? convert(position.x,position.y) : convert(position,options);
        const converted = point?.isVector3 ? point.clone() : Array.isArray(point) ? new THREE.Vector3(...point) : point && [point.x,point.y,point.z].every(Number.isFinite) ? new THREE.Vector3(point.x,point.y,point.z) : null;
        if (converted) {
          const origin = camera.getWorldPosition(new THREE.Vector3());
          const ray = new THREE.Ray(origin,converted.sub(origin).normalize());
          return ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-planeY),new THREE.Vector3());
        }
      }
      const size = renderer?.getSize?.(new THREE.Vector2());
      const width = size?.x || 1280, height = size?.y || 640;
      const ray = new THREE.Raycaster();
      camera.updateMatrixWorld(true);
      ray.setFromCamera(new THREE.Vector2(position.x / width * 2 - 1,1 - position.y / height * 2),camera);
      return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-planeY),new THREE.Vector3());
    }
    return null;
  }
  function removeHeld(job) {
    for (const tile of job.held) tile.removeFromParent();
    job.held.length = 0;
  }
  function finish(job,cancelled=false) {
    if (!jobs.delete(job)) return;
    removeHeld(job);
    scene.remove(job.model.root);
    job.model.skeleton.dispose();
    job.resolve({cancelled,action:job.action,seat:job.seat});
  }
  function update(now = performance.now()) {
    for (const job of [...jobs]) {
      const elapsed = Math.max(0,(now-job.start) / 1000);
      job.model.setTime(elapsed);
      if (!job.contacted && elapsed >= job.definition.contactTime) {
        job.contacted = true;
        removeHeld(job);
        job.options.onContact?.({action:job.action,seat:job.seat,value:job.options.value,position:job.target.clone()});
      }
      if (elapsed >= job.definition.duration) finish(job);
    }
  }
  function tick(now) {
    frame = 0;
    update(now);
    if (jobs.size && !disposed) frame = requestAnimationFrame(tick);
  }
  function attachHeld(job) {
    if (!makeTile || !['discard','exchange'].includes(job.action)) return;
    const values = job.action === 'exchange' ? job.options.values || [job.options.value] : [job.options.value];
    const pointScale = job.model.pointNode.getWorldScale(new THREE.Vector3());
    values.filter(value => value !== undefined && value !== null).forEach((value,index) => {
      const tile = makeTile(value);
      // makeTile is a factory; no table tile or shared geometry is destroyed here.
      const intendedScale = tile.scale.clone();
      tile.position.set(0,0,index * .28 / pointScale.z);
      tile.scale.copy(intendedScale.divide(pointScale));
      tile.rotation.set(0,Math.PI / 2,0);
      job.model.pointNode.add(tile);
      job.held.push(tile);
    });
  }
  function empty(action,reason) {return {duration:0,durationMs:0,contactTime:0,contactTimeMs:0,reason,finished:Promise.resolve({cancelled:false,action,skipped:true,reason})};}
  function play(options = {}) {
    const action = options.action || 'discard';
    if (disposed) return empty(action,'disposed');
    if (!force && globalThis.MAHJONG_SETTINGS?.hand === false) return empty(action,'hand-disabled');
    // The original trustee draws without its manual-only cuopai hand; opening
    // deal is a tile tween. Neither should be replaced with a fabricated hand.
    const name = action === 'peng' || action === 'gang' ? 'cpg' : action;
    const definition = metadata.actions[name];
    if (!definition) return empty(action,'no-original-hand-action');
    const target = resolveWorld(options.to || getTarget?.(options),options);
    if (!target || ![target.x,target.y,target.z].every(Number.isFinite)) return empty(action,'contact-target-required');
    const seat = Math.max(0,Math.min(3,Math.floor(Number(options.seat) || 0)));
    const model = buildHandModel(THREE,definition,geometry,material);
    scene.add(model.root);
    calibrateHandContact(THREE,model,target,{seat,scale:metadata.scale,rotations:metadata.sourceSeatRotation});
    let resolve;
    const finished = new Promise(done => {resolve=done;});
    const job = {model,definition,seat,action,options,target,resolve,held:[],contacted:false,start:performance.now()};
    attachHeld(job);
    jobs.add(job);
    if (!externalClock && !frame) frame = requestAnimationFrame(tick);
    return {duration:definition.duration,durationMs:definition.duration * 1000,contactTime:definition.contactTime,contactTimeMs:definition.contactTime * 1000,startTime:job.start,finished};
  }
  function clear() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    [...jobs].forEach(job => finish(job,true));
  }
  function dispose() {
    clear();disposed=true;
    geometry.dispose();material.dispose();texture.dispose();
  }
  return {play,clear,update,dispose,supported,metadata,openingTiming};
}
