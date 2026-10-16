import {guideControls} from './guide-controls.js';
import {createActionEffects} from './action-effects.js';
import {meldPlacements,meldEdge} from './meld-study/placements.js';
import {createPlayerDisplay} from './player-display.js';
import {createSettlementView} from './settlement-view.js';
import {createFanEffects} from './fan-effects.js';
import {createHandEffects} from './hand-effects.js';
import {computeTableLayout,concealedHandPlacements,discardTilePlacements,huTilePlacements,tablePainterOrder,nativeSpriteDrawArgs,TABLE_SOURCE} from './table-layout.js';
import {createExchangeEffects} from './room-entry.js';
import {createOpeningEffects} from './opening-effects.js';
import {createTablePanels} from './table-panels.js';
import {createControlEffects,createDiscardMarker} from './control-effects.js';
import {createExchangeControls,styleTrusteeButton} from './exchange-controls.js';
import {exchangePackLayout} from './exchange-layout.js';
import {createTileResultEffects} from './tile-result-effects.js';
import {createNativeSeatTags} from './native-seat-tags.js';
import {createExitConfirm} from './native-exit.js';
import {createNativeKongEffects,nativeCPGSmokePlacement} from './native-kong-effects.js';
import * as THREE from 'three';
import {tableControls} from './table-controls.js';
import {installGameAudio,playGameSound,updateGameAudioPreferences,readAudioPreferences} from './game-audio.js';
installGameAudio();
const $=selector=>document.querySelector(selector);
const root='assets/reference/';
let ui,layout,meldLayout,meldMarkers,renderer,camera,scene,bodyGeometry,faceGeometry,bodyMaterial,staticCanvas,staticContext,handFX,dealStarted=0,lastDiscard,markerFX;
const spriteImages=new Map();
const spriteFrames=new Map();
const nativeTable=computeTableLayout(1280,640);
const meldAnchors=nativeTable.seats.map(seat=>seat.meld.origin);
function meldEnd(player){const edge=meldEdge(round?.melds[player]||[],player,meldLayout),scale=nativeTable.seats[player].meld.scale;return[meldAnchors[player][0]+edge[0]*scale[0],meldAnchors[player][1]-edge[1]*scale[1]];}
const tableTiles=new THREE.Group(),opponents=new THREE.Group(),melds=new THREE.Group(),effects=new THREE.Group();
let selected=-1,busy=false,epoch=0,soundOn=true,toastTimer;
soundOn=!readAudioPreferences().muteAll;
let hand=[],piles=[];
let controller,round;
const flyingSlots=new Set();
const spritePath=(key)=>root+ui[key].file;
const initialHand=[18,18,18,18,21,22,22,22];
const initialPiles=[[31,11,52,26,26,39,27,27,15,13,38,22,25,29],[31,32,33,35,34,34,39,36,37,36,38,39],[11,14,32,36,28,24,21,32,11,28,27,51,52,37],[12,52,39,31,22,22,51,36,52,32,23,13]];
const faceMaterials=new Map(),clips=new Map();
// The engine gates music, tile effects and voice separately. A local sound
// switch must not accidentally suppress speech when only tile sounds are off.
function sound(name){void playGameSound(name,.5);}
function toast(text){$('#toast').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),1800);}
function geometry(data){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(data.normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(data.uvs,2));g.setIndex(data.indices);return g;}
function makeTile(value,back=false){back=back||value===57;const tile=new THREE.Group();tile.add(new THREE.Mesh(bodyGeometry,bodyMaterial));if(!back)tile.add(new THREE.Mesh(faceGeometry,faceMaterials.get(value)||faceMaterials.get(11)));tile.scale.set(.095,.095,.095);tile.position.y=.11;if(back){tile.rotation.x=-Math.PI/2;tile.position.y=.215;}return tile;}
function tilePosition(player,index){const col=index%8,row=Math.floor(index/8);return [
  {x:-1.2+col*.33,z:.74+row*.445,angle:0},
  {x:1.65+row*.335,z:-1.8+col*.445,angle:-Math.PI/2},
  {x:-1.2+col*.33,z:-1.8-row*.445,angle:Math.PI},
  {x:-1.67-row*.335,z:-1.8+col*.445,angle:Math.PI/2},
][player];}
function rebuild(){
  const arrow=$('.turn-arrow');arrow.dataset.seat=String(round?.turn??0);arrow.hidden=!['play','claim','rob'].includes(round?.phase);arrow.src=spritePath(['Other/Main/countdown/light/img_light_mine_east','Other/Main/countdown/light/img_light_right_north','Other/Main/countdown/light/img_light_right_west','Other/Main/countdown/light/img_light_left_south'][round?.turn??0]);
  if(staticContext){drawStaticTable();return;}
  tableTiles.clear();piles.forEach((pile,p)=>pile.forEach((v,i)=>{const t=makeTile(v),pos=tilePosition(p,i);t.position.x=pos.x;t.position.z=pos.z;t.rotation.y=pos.angle;tableTiles.add(t);}));
  opponents.clear();for(let i=0;i<13;i++){const top=makeTile(11,true);top.position.x=(i-6)*.30+.12;top.position.z=-5.25;opponents.add(top);for(const d of [-1,1]){const side=makeTile(11,true);side.rotation.y=d===1?-Math.PI/2:Math.PI/2;side.position.x=d*4.06;side.position.z=(i-6)*.415-.1;opponents.add(side);}}
  melds.clear();[17,17,17,17,51,19].forEach((v,i)=>{const t=makeTile(v);t.position.x=-1.96+i*.345;t.position.z=2.2;melds.add(t);});[28,28,28,27,27,27].forEach((v,i)=>{const t=makeTile(v);t.position.x=-4.3+i*.345;t.position.z=3.1;melds.add(t);});
}
function drawNativeImage(key,image,style){const frame=spriteFrames.get(key);if(frame)staticContext.drawImage(image,...nativeSpriteDrawArgs(frame,style));else staticContext.drawImage(image,-image.width/2,-image.height/2);}
function drawSprite(key,x,y,scale=1,mirror=false,style){const img=spriteImages.get(key);if(!img)return;staticContext.save();staticContext.translate(x,y);if(Array.isArray(scale))staticContext.scale(scale[0],scale[1]);else staticContext.scale(mirror?-scale:scale,scale);drawNativeImage(key,img,style);staticContext.restore();}
function rowLocation(player,index){
  return discardTilePlacements(Array(index+1).fill(11),player,nativeTable)[index];
}
function drawTileSprite(value,loc){
  const native=!!loc.face,signedScale=loc.bodyScale||[(loc.mirror?-1:1)*loc.scale,loc.scale];
  drawSprite(loc.body||loc.param.body,loc.x,loc.y,native?signedScale:loc.scale,native?false:loc.mirror,loc.sprite?.body);
  const atlas=loc.atlas||(loc.mirror?'left':'hand'),stem=`img_tile_${Math.floor(value/10)}_${value%10}`;
  const key=[loc.face,`${atlas}/${loc.mirror?'r_':''}${stem}`,`${atlas}/${stem}`,`hand/${stem}`].find(key=>spriteImages.has(key)),img=spriteImages.get(key);if(!img)return;
  const offset=loc.param.colorPos||[0,0,0],scale=loc.param.colorScale||[0,1,1];
  staticContext.save();staticContext.translate(loc.x+offset[1]*signedScale[0],loc.y-offset[2]*signedScale[1]);
  staticContext.scale(scale[1]*signedScale[0],scale[2]*signedScale[1]);const skew=loc.param.colorSkew||[0,0,0];staticContext.transform(1,-Math.tan(skew[2]*Math.PI/180),-Math.tan(skew[1]*Math.PI/180),1,0,0);drawNativeImage(key,img,loc.sprite?.face);staticContext.restore();
}
function drawStaticTable(){
  staticContext.clearRect(0,0,1280,640);
  const texture=nativeTable.deskTexture,image=spriteImages.get(texture.body);if(image)staticContext.drawImage(image,texture.x,texture.y,texture.width,texture.height);
  // Cocos sorts each parent and then its children; chronological indices are
  // retained separately for dealing and the hidden in-flight discard slot.
  const records=[];
  for(let seat=0;seat<4;seat++){
    if(seat!==0)records.push(...concealedHandPlacements(round?.hands[seat].length||0,seat,nativeTable,round?.melds[seat],meldLayout).map(loc=>({...loc,seat,kind:'hand'})));
    records.push(...discardTilePlacements(piles[seat]||[],seat,nativeTable).map(loc=>({...loc,seat,kind:'discard'})));
    records.push(...meldPlacements(round?.melds[seat]||[],seat,meldLayout).map(loc=>({...loc,seat,kind:'meld'})));
    records.push(...huTilePlacements([...(round?.huEvents||[]).filter(event=>event.seat===seat).map(event=>event.tile),...(round?.redKongs?.[seat]||[])],seat,nativeTable).map(loc=>({...loc,seat,kind:'hu'})));
  }
  for(const tile of tablePainterOrder(records)){
    const p=tile.seat;
    if(tile.kind==='hand'){
      let y=tile.y;staticContext.save();if($('#game').classList.contains('dealing')){const delay=parseFloat($('#game').style.getPropertyValue('--deal-delay'))||1200,t=Math.max(0,Math.min(1,(performance.now()-dealStarted-delay-Math.floor(tile.index/4)*500)/500)),ease=(1-Math.cos(Math.PI*t))/2;staticContext.globalAlpha=ease;y-=88.889*(1-ease);}drawSprite(tile.body,tile.x,y,tile.scale,false,tile.sprite?.body);staticContext.restore();continue;
    }
    if(tile.kind!=='meld'){if(tile.kind!=='discard'||!flyingSlots.has(`${p}:${tile.index}`))drawTileSprite(tile.value,tile);continue;}
    const scale=nativeTable.seats[p].meld.scale,sx=scale[0]*tile.tileScale,sy=scale[1]*tile.tileScale;
    const x=meldAnchors[p][0]+tile.pos[0]*scale[0],y=meldAnchors[p][1]-tile.pos[1]*scale[1];
    const body=spriteImages.get('meld/'+tile.body),face=spriteImages.get('meld/'+tile.face);
    const sprite=TABLE_SOURCE.tileSprites[meldLayout.seats[p].tilePrefab.uuid];
    if(body){staticContext.save();staticContext.translate(x,y);staticContext.scale(sx,sy);drawNativeImage('meld/'+tile.body,body,sprite?.body);staticContext.restore();}
    if(face){staticContext.save();staticContext.translate(x+tile.colorPos[0]*sx,y-tile.colorPos[1]*sy);staticContext.scale(sx*tile.colorScale[0],sy*tile.colorScale[1]);staticContext.transform(1,-Math.tan(tile.colorSkew[1]*Math.PI/180),-Math.tan(tile.colorSkew[0]*Math.PI/180),1,0,0);drawNativeImage('meld/'+tile.face,face,sprite?.face);staticContext.restore();}
    const group=round?.melds[p]?.[tile.group],tip=meldMarkers?.seats[p]?.tip;
    if(tile.index===meldMarkers?.tipTileIndex&&tip&&['gang','add'].includes(group?.type)){const frame=tip.frames[group.type==='add'?meldMarkers.patchedTipFrameIndex:meldMarkers.exposedTipFrameIndexForLocalSource[group.from]],pos=tip.stackPositions[tile.group];if(frame&&pos)drawSprite('marker/'+frame.uuid,x+pos[0]*sx,y-pos[1]*sy,[sx*tip.scale,sy*tip.scale],false,{sizeMode:tip.sizeMode,anchor:tip.anchor});}
  }
  if(markerFX){const loc=lastDiscard&&round?.discards[lastDiscard.seat]?.[lastDiscard.index]!==undefined?rowLocation(lastDiscard.seat,lastDiscard.index):null;if(loc)markerFX.set({x:loc.x+2*loc.bodyScale[0],y:loc.y-50*loc.bodyScale[1],scale:loc.bodyScale,origin:true,visible:!flyingSlots.has(`${lastDiscard.seat}:${lastDiscard.index}`)});else markerFX.hide();}
}
function label(v){return v>=50?({51:'红中',52:'发财',53:'白板'}[v]||'字牌'):`${v%10}${['','万','条','筒'][Math.floor(v/10)]}`;}
function renderHand(){
  const placements=concealedHandPlacements(hand.length,0,nativeTable,round?.melds[0],meldLayout);
  $('#hand-layer').replaceChildren(...hand.map((v,i)=>{
    const button=document.createElement('button');button.className='hand-tile';
    button.style.left=`${placements[i].x-nativeTable.ownHand.bodySize[0]/2}px`;button.style.top=`${placements[i].y-nativeTable.ownHand.bodySize[1]/2}px`;
    button.style.setProperty('--card-batch',Math.floor(i/4));button.setAttribute('aria-label',label(v));button.setAttribute('aria-pressed',controller?.selection.has(i)||false);
    button.classList.toggle('selected',controller?.selection.has(i));button.classList.toggle('que-tile',round?.missing[0]===Math.floor(v/10));button.disabled=!controller?.canSelect;
    const body=document.createElement('img');body.className='body';body.src=spritePath('hand/img_normal_card');body.alt='';
    const face=document.createElement('img'),key=`hand/img_tile_${Math.floor(v/10)}_${v%10}`,frame=ui[key],scale=nativeTable.scale;
    face.className='face';face.src=spritePath(key);face.alt='';
    Object.assign(face.style,{left:`${(91-frame.width)*scale/2}px`,top:`${((134-frame.height)/2+6)*scale}px`,width:`${frame.width*scale}px`,height:`${frame.height*scale}px`,objectFit:'fill'});
    button.append(body,face);button.addEventListener('click',()=>controller.select(i));return button;
  }));
}
const animation=[];
function screenToWorld(x,y){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/640-1,1-y/320),camera);return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-.11),new THREE.Vector3());}
function fly(value,player,target){const slot=`${player}:${target}`;flyingSlots.add(slot);lastDiscard={seat:player,index:target};const screen=rowLocation(player,target),motion=handFX.play({action:'discard',seat:player,value,to:screen,onContact:()=>{flyingSlots.delete(slot);drawStaticTable();}});if(!motion.durationMs){flyingSlots.delete(slot);drawStaticTable();}return motion;}
function animateAction(action,seat,value,options={}){const center=action==='exchange'?exchangePackLayout()[seat].center:meldEnd(seat);return handFX.play({action,seat,value,values:action==='exchange'?[57,57,57]:undefined,...options,to:options.to??{x:center[0],y:center[1]}});}
function place(element,rect){Object.assign(element.style,{position:'absolute',left:`${rect.x}px`,top:`${rect.y}px`,width:`${rect.width}px`,height:`${rect.height}px`});}
function applyNativeInterfaceLayout(){
 for(const[seat,selector]of['.profile-mine','.profile-right','.profile-top','.profile-left'].entries()){
  const node=$(selector),data=nativeTable.profiles[seat];Object.assign(node.style,{left:'0',top:'0',width:'1280px',height:'640px',pointerEvents:'none'});place(node.querySelector('.portrait'),data.portrait);place(node.querySelector('.rank'),data.rank);place(node.querySelector('.profile-info'),data.info);const rank=node.querySelector('.rank');rank.style.transform='none';const image=rank.querySelector('img');if(image)Object.assign(image.style,{left:'0',top:'0',width:'100%',height:'100%'});const que=node.querySelector('.que');if(que)place(que,{x:data.tagOrigin[0]-15,y:data.tagOrigin[1]-15,width:30,height:30});const dealer=node.querySelector('.dealer');if(dealer)place(dealer,{x:data.bankerOrigin[0]-15,y:data.bankerOrigin[1]-15,width:30,height:30});
 }
 const compass=nativeTable.compass;Object.assign($('.compass').style,{left:`${compass.x}px`,top:`${compass.y}px`,transform:`scale(${compass.width/126},${compass.height/93})`,transformOrigin:'top left'});
 const autoToggle=$('.auto-toggle'),trusteeShade=$('.trustee-shade');
 // The standalone teaching controller has no trustee or completed-que UI.
 if(autoToggle){place(autoToggle,nativeTable.trustee.cancel);autoToggle.style.bottom='auto';styleTrusteeButton(autoToggle,{scale:nativeTable.scale});}
 if(trusteeShade)place(trusteeShade,nativeTable.trustee.background);
 const title=$('.table-text');title.style.top=`${nativeTable.tableInfo.title[1]-17}px`;title.style.lineHeight='37.333px';
 for(const[seat,cls]of[[2,'.que-top'],[3,'.que-left'],[1,'.que-right']]){const marker=$(cls);if(marker)place(marker,nativeTable.que.complete[seat]);}
 const notice=nativeTable.que.notice;$('#game').style.setProperty('--que-notice-x',`${notice.x}px`);$('#game').style.setProperty('--que-notice-y',`${notice.y}px`);$('#game').style.setProperty('--que-notice-w',`${notice.width}px`);
}
function resize(){const height=Math.min(window.innerWidth/2,window.innerHeight),width=height*2;$('#viewport').style.width=`${width}px`;$('#viewport').style.height=`${height}px`;$('#viewport').style.marginTop=`${Math.max(0,(window.innerHeight-height)/2)}px`;$('#game').style.transform=`scale(${width/1280})`;}
function inspect(open){$('#inspector').hidden=!open;}
try{
  const [index,body,face,sourceLayout]=await Promise.all(['ui-index.json','mesh-body.json','mesh-face.json','layout.json'].map(file=>fetch(root+file).then(res=>{if(!res.ok)throw Error(file);return res.json();})));ui=index;layout=sourceLayout;document.querySelectorAll('[data-ui]').forEach(img=>{const item=ui[img.dataset.ui];if(item)img.src=root+item.file;});bodyGeometry=geometry(body);faceGeometry=geometry(face);
  await Promise.all(Object.entries(ui).map(async([key,item])=>{const image=new Image();image.src=root+item.file;await image.decode();spriteImages.set(key,image);}));
  const [meldData,meldFrames]=await Promise.all(['layout.json','frames.json'].map(file=>fetch('meld-study/'+file).then(r=>r.json())));meldLayout=meldData;
  await Promise.all(meldFrames.map(async frame=>{const key='meld/'+frame.uuid,image=new Image();image.src=frame.image;await image.decode();spriteImages.set(key,image);spriteFrames.set(key,frame);}));
  const tableFrames=await fetch('table-layout-study/frames.json').then(r=>r.json());await Promise.all(tableFrames.map(async frame=>{const image=new Image();image.src=frame.image;await image.decode();spriteImages.set(frame.key,image);spriteFrames.set(frame.key,frame);}));
  meldMarkers=await fetch('meld-marker-study/markers.json').then(r=>r.json());
  const markerFrames=[...new Map(Object.values(meldMarkers.seats).flatMap(seat=>seat.tip.frames).map(frame=>[frame.uuid,frame])).values()];
  await Promise.all(markerFrames.map(async frame=>{const key='marker/'+frame.uuid,image=new Image();image.src=frame.image;await image.decode();spriteImages.set(key,image);spriteFrames.set(key,frame);}));
  const uv=faceGeometry.attributes.uv,position=faceGeometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(position.getX(i)+1.459)/2.918,1-(position.getZ(i)+1.9912)/3.9996);uv.needsUpdate=true;
  const loader=new THREE.TextureLoader(),back=await loader.loadAsync(root+'tile-body.png');back.colorSpace=THREE.SRGBColorSpace;bodyMaterial=new THREE.MeshBasicMaterial({map:back});
  await Promise.all(Object.entries(ui).map(async([key,item])=>{const match=key.match(/^hand\/img_tile_([1235])_([1-9])$/);if(!match)return;const source=await loader.loadAsync(root+item.file),canvas=document.createElement('canvas');canvas.width=128;canvas.height=176;const ctx=canvas.getContext('2d'),scale=Math.min(102/source.image.width,146/source.image.height),w=source.image.width*scale,h=source.image.height*scale;ctx.drawImage(source.image,(128-w)/2,(176-h)/2,w,h);source.dispose();const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;faceMaterials.set(Number(match[1])*10+Number(match[2]),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));}));
  staticCanvas=document.createElement('canvas');staticCanvas.width=1280;staticCanvas.height=640;staticContext=staticCanvas.getContext('2d');$('#tiles-layer').append(staticCanvas);
  scene=new THREE.Scene();scene.add(effects);camera=new THREE.PerspectiveCamera(22,2,.1,100);camera.position.set(0,11.2566,13.1373);camera.rotation.x=-40*Math.PI/180;camera.updateMatrixWorld();
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(1280,640);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.className='gesture-canvas';$('#ui-layer').append(renderer.domElement);
  function frame(time){requestAnimationFrame(frame);handFX?.update(time);if($('#game').classList.contains('dealing'))drawStaticTable();renderer.render(scene,camera);}requestAnimationFrame(frame);
  handFX=await createHandEffects({THREE,scene,camera,renderer,makeTile,screenToWorld,externalClock:true});
  const controlFX=createControlEffects($('#ui-layer'));markerFX=createDiscardMarker($('#ui-layer'));await Promise.all([controlFX.ready,markerFX.ready]);
  const teaching=new URLSearchParams(location.search).has('teach');
  const [actionFX,fanFX]=await Promise.all([createActionEffects($('#ui-layer'),{force:teaching,sound:true}),createFanEffects($('#ui-layer'),{force:teaching,sound:true})]);
  const playerDisplay=createPlayerDisplay(),exchangeFX=createExchangeEffects($('#ui-layer'),{sound,center:{x:nativeTable.compass.center[0],y:nativeTable.compass.center[1]}}),openingFX=createOpeningEffects($('#ui-layer'));
  const tileFX=createTileResultEffects($('#ui-layer')),seatTags=createNativeSeatTags($('#ui-layer'),{tableLayout:nativeTable,sound:true}),kongFX=createNativeKongEffects($('#ui-layer'),{tableLayout:nativeTable,sound:true});
  await Promise.all([openingFX.ready,exchangeFX.ready,tileFX.ready,seatTags.ready,kongFX.ready]);
  const meldResultEffect={clear:()=>kongFX.clear(),syncSound:value=>kongFX.setSound(value),play:(event,state,motion)=>{
   if(event.ambient)kongFX.play({kind:event.ambient,seat:event.seat});
   const edge=meldEdge(state.melds[event.seat],event.seat,meldLayout),placement=nativeCPGSmokePlacement(nativeTable,event.seat,edge);
   const smoke=()=>{if(round?.wall!==state.wall)return;try{if(JSON.parse(localStorage.getItem('MAHJONG_SETTINGS')||'{}').effects===false)return;}catch{}
    tileFX.play({kind:'meldSmoke',x:placement.point[0],y:placement.point[1],scaleX:placement.parentScale[0]*1.6,scaleY:placement.parentScale[1]*1.6,delayMs:motion?.durationMs?150:0});};
   if(motion?.durationMs)motion.finished.then(result=>{if(!result.cancelled)smoke();});else smoke();
  }};
  controller=(teaching?guideControls:tableControls)({effect:actionFX,meldResultEffect,tileResultEffect:{clear:()=>tileFX.clear(),play:(event,state)=>{const events=state.huEvents.filter(item=>item.seat===event.seat),index=events.indexOf(event.huEvent),loc=huTilePlacements(events.map(item=>item.tile),event.seat,nativeTable)[index];return loc&&tileFX.play({x:loc.x,y:loc.y,scale:nativeTable.scale,kind:'hu'});}},seatTags,fanEffect:fanFX,playerDisplay,createSettlement:createSettlementView,createExitConfirm,createPanels:createTablePanels,createExchangeControls,openingEffect:openingFX,exchangeEffect:exchangeFX,tileImage:v=>spritePath(`hand/img_tile_${Math.floor(v/10)}_${v%10}`),render:r=>{if(round?.wall!==r.wall){effects.clear();animation.length=0;flyingSlots.clear();lastDiscard=null;handFX.clear();}if(r.phase==='dealing'&&round?.phase!=='dealing')dealStarted=performance.now();round=r;hand=r.hands[0];piles=r.discards;rebuild();renderHand();},animate:fly,animateAction,sound,toast});
  function syncAudioButton(){soundOn=!readAudioPreferences().muteAll;controller.syncSound(true);$('#sound-ref').textContent=soundOn?'全部静音':'恢复声音';$('#sound-ref').setAttribute('aria-label',soundOn?'全部静音':'恢复声音');$('#sound-ref').setAttribute('aria-pressed',String(!soundOn));}
  await controller.reset();applyNativeInterfaceLayout();syncAudioButton();$('#loading').hidden=true;resize();window.addEventListener('resize',resize);
  for(const [action,title] of [['hu','胡'],['zimo','自摸'],['gang','杠'],['qgh','抢杠胡']]){const button=document.createElement('button');button.textContent=title+'回放';button.setAttribute('aria-label',title+'特效回放');button.onclick=()=>{$('.study-tools').open=false;actionFX.play(action,3);};$('.study-bar>div').append(button);}
  $('#preview-fan').title='回放清一色，不改动牌局和积分';$('#preview-fan').onclick=()=>{$('.study-tools').open=false;fanFX.play({name:'清一色',seat:0,deltas:[0,0,0,0],preview:true});};$('#preview-settlement').onclick=()=>{$('.study-tools').open=false;controller.previewSettlement?.();};
  $('#preview-hand').title='播放原版女手出牌动作，保留当前牌局';$('#preview-hand').onclick=()=>{const tools=$('.study-tools');tools.open=false;handFX.play({action:'discard',seat:3,value:11,to:{x:440,y:240}});};
  $('#sound-ref').addEventListener('click',()=>{updateGameAudioPreferences({muteAll:!readAudioPreferences().muteAll});syncAudioButton();});
  $('#sound-ref').addEventListener('audio-preferences-change',syncAudioButton);
  addEventListener('storage',event=>{if(event.key==='MAHJONG_SETTINGS')syncAudioButton();});
  $('#inspect-open').addEventListener('click',()=>inspect($('#inspector').hidden));$('#inspect-close').addEventListener('click',()=>inspect(false));document.querySelectorAll('[data-layer]').forEach(input=>input.addEventListener('change',()=>{$('#'+input.dataset.layer).style.visibility=input.checked?'visible':'hidden';if(input.dataset.layer==='desk-layer')$('#zone-layer').style.visibility=input.checked?'visible':'hidden';}));
  $('#menu').addEventListener('click',()=>$('#menu-panel').hidden=!$('#menu-panel').hidden);$('#menu-close').addEventListener('click',()=>$('#menu-panel').hidden=true);$('#menu-inspect').addEventListener('click',()=>{inspect(true);$('#menu-panel').hidden=true;});
}catch(error){console.error(error);$('#loading').textContent=`资源或 WebGL 初始化失败：${error.message}。请使用 npm start 打开本地地址。`;}


