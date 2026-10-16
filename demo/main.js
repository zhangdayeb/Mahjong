import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createDeck, suits, suitOf, nameOf, faceOf, exchangeIndices, chooseMissing, chooseDiscard, canWin } from './rules.js';

const $ = selector => document.querySelector(selector);
const names=['你','阿唐','林先生','小苏'];
let game, serial=0, generation=0, selected=new Set(), soundOn=true, musicOn=false;
let announcementTimer, music;
const sounds=new Map();
function play(name,volume=.3){
  if(!soundOn)return;
  let audio=sounds.get(name);if(!audio){audio=new Audio(`assets/sounds/${name}.mp3`);sounds.set(name,audio);}
  audio.currentTime=0;audio.volume=volume;audio.play().catch(()=>{});
}
function announce(text){$('#announcement').textContent=text;$('#announcement').classList.add('show');clearTimeout(announcementTimer);announcementTimer=setTimeout(()=>$('#announcement').classList.remove('show'),1800);}
function log(text){game.log.unshift(text);game.log=game.log.slice(0,3);$('#log').replaceChildren(...game.log.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const values=hand=>hand.map(t=>t.value);
const sort=hand=>hand.sort((a,b)=>a.value-b.value);

// The table uses new mesh geometry. Only face textures and audio come from the reference client.
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(35,1,.1,100);
camera.position.set(0,11.8,13.8);camera.lookAt(0,0,0);
let renderer;
try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;$('#scene').append(renderer.domElement);
}catch{
  $('#render-error').hidden=false;$('#render-error').textContent='当前浏览器未启用 WebGL。请使用开启硬件加速的 Chrome 或 Edge 打开本地地址。手牌操作仍可使用。';
}
scene.add(new THREE.HemisphereLight(0xfff5dd,0x264837,2.3));
const light=new THREE.DirectionalLight(0xfff3d3,3);light.position.set(-4,12,6);light.castShadow=true;
light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-11,right:11,top:10,bottom:-10,near:.1,far:30});light.shadow.bias=-.001;
scene.add(light);
const box=(w,h,d,color,roughness=.7)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness}));
const table=box(18,.4,11,0x275540);table.position.y=-.35;table.receiveShadow=true;scene.add(table);
const feltCanvas=document.createElement('canvas');feltCanvas.width=feltCanvas.height=256;
const fc=feltCanvas.getContext('2d');fc.fillStyle='#396b50';fc.fillRect(0,0,256,256);
for(let i=0;i<18000;i++){fc.fillStyle=i%2?'#ffffff08':'#00000009';fc.fillRect(Math.random()*256,Math.random()*256,1,2);}
const feltTexture=new THREE.CanvasTexture(feltCanvas);feltTexture.wrapS=feltTexture.wrapT=THREE.RepeatWrapping;feltTexture.repeat.set(8,5);feltTexture.colorSpace=THREE.SRGBColorSpace;
table.material.map=feltTexture;table.material.color.set(0xb6c9ae);
for(const [w,d,x,z] of [[18.5,.35,0,5.5],[18.5,.35,0,-5.5],[.35,11.3,-9.1,0],[.35,11.3,9.1,0]]){const rim=box(w,.5,d,0x59472e,.4);rim.position.set(x,-.2,z);rim.castShadow=true;scene.add(rim);}
const border=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-8.4,-.14,-4.9),new THREE.Vector3(8.4,-.14,-4.9),new THREE.Vector3(8.4,-.14,4.9),new THREE.Vector3(-8.4,-.14,4.9)]),new THREE.LineBasicMaterial({color:0x8b9564,transparent:true,opacity:.3}));scene.add(border);
const compassCanvas=document.createElement('canvas');compassCanvas.width=compassCanvas.height=512;
const cc=compassCanvas.getContext('2d');cc.strokeStyle='#cfc18d';cc.lineWidth=3;cc.strokeRect(45,45,422,422);cc.strokeRect(60,60,392,392);
cc.textAlign='center';cc.textBaseline='middle';cc.fillStyle='#d8cb9d';cc.font='32px Microsoft YaHei';cc.fillText('北',256,95);cc.fillText('南',256,417);cc.fillText('西',95,256);cc.fillText('东',417,256);cc.font='bold 56px Microsoft YaHei';cc.fillText('麻',256,240);cc.font='18px Microsoft YaHei';cc.fillStyle='#adc4a3';cc.fillText('青 绿 牌 桌',256,304);
const compass=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(compassCanvas),transparent:true,opacity:.65,depthWrite:false}));compass.rotation.x=-Math.PI/2;compass.position.y=-.139;scene.add(compass);
const board=new THREE.Group(), flights=new THREE.Group();scene.add(board,flights);
const tileGeometry=new RoundedBoxGeometry(.51,.25,.72,2,.035);
const backGeometry=new RoundedBoxGeometry(.51,.12,.72,2,.025);
const ivory=new THREE.MeshStandardMaterial({color:0xf3edd6,roughness:.35});
const jade=new THREE.MeshStandardMaterial({color:0x16754e,roughness:.3});
const faceGeometry=new THREE.PlaneGeometry(.45,.64), faceMaterials=new Map();
const loader=new THREE.TextureLoader();
for(let s=1;s<=3;s++)for(let n=1;n<=9;n++){const texture=loader.load(faceOf(s*10+n));texture.colorSpace=THREE.SRGBColorSpace;faceMaterials.set(s*10+n,new THREE.MeshStandardMaterial({map:texture,transparent:true,roughness:.6,depthWrite:false}));}
function tileMesh(value,hidden=false){
  const g=new THREE.Group();const base=new THREE.Mesh(tileGeometry,hidden?jade:ivory);base.position.y=.125;base.castShadow=true;g.add(base);
  const back=new THREE.Mesh(backGeometry,jade);back.position.y=.035;g.add(back);
  if(!hidden){const face=new THREE.Mesh(faceGeometry,faceMaterials.get(value));face.rotation.x=-Math.PI/2;face.position.y=.252;g.add(face);}
  return g;
}
const rotateFor=player=>[0,Math.PI/2,Math.PI,-Math.PI/2][player];
function discardPosition(player,index){
  const x=(index%6-2.5)*.57,z=Math.floor(index/6)*.79+1.4;
  const angle=rotateFor(player);return new THREE.Vector3(x*Math.cos(angle)+z*Math.sin(angle),0,-x*Math.sin(angle)+z*Math.cos(angle));
}
function rebuildBoard(){
  board.clear();
  game.discards.forEach((pile,p)=>pile.forEach((value,i)=>{const tile=tileMesh(value);tile.position.copy(discardPosition(p,i));tile.rotation.y=rotateFor(p);board.add(tile);}));
  let remaining=game.deck.length;
  for(let side=0;side<4;side++)for(let i=0;i<14&&remaining>0;i++){
    remaining--;const tile=tileMesh(11,true);const column=Math.floor(i/2),layer=i%2,offset=(column-3)*.55;
    const angle=side*Math.PI/2;const wallZ=side%2?6.2:3.9;
    tile.position.set(offset*Math.cos(angle)+wallZ*Math.sin(angle),layer*.25,-offset*Math.sin(angle)+wallZ*Math.cos(angle));tile.rotation.y=angle;board.add(tile);
  }
  for(let p=1;p<=3;p++)game.hands[p].forEach((_,i)=>{const tile=tileMesh(11,true);const off=(i-(game.hands[p].length-1)/2)*.52;const ang=rotateFor(p);const z=p===2?4.8:7.6;tile.position.set(off*Math.cos(ang)+z*Math.sin(ang),.06,-off*Math.sin(ang)+z*Math.cos(ang));tile.rotation.y=ang;board.add(tile);});
}
const tweens=[];
function fly(value,player,index){
  const tile=tileMesh(value);tile.rotation.y=rotateFor(player);const end=discardPosition(player,index),start=end.clone().multiplyScalar(0);
  const angle=rotateFor(player);start.set(4.8*Math.sin(angle),1.3,4.8*Math.cos(angle));tile.position.copy(start);flights.add(tile);
  tweens.push({tile,start,end,time:performance.now(),duration:450});
}
function resize(){if(!renderer)return;const el=$('#scene');renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe($('#scene'));resize();
function frame(time){requestAnimationFrame(frame);for(let i=tweens.length-1;i>=0;i--){const t=tweens[i],p=Math.min(1,(time-t.time)/t.duration),ease=1-(1-p)**3;t.tile.position.lerpVectors(t.start,t.end,ease);t.tile.position.y+=Math.sin(p*Math.PI)*.8;if(p===1){flights.remove(t.tile);tweens.splice(i,1);}}renderer?.render(scene,camera);}requestAnimationFrame(frame);

function update(){
  const hand=game.hands[0], phase=game.phase, playable=phase==='play'&&!game.busy;
  const forced=playable&&hand.some(t=>suitOf(t.value)===game.missing[0]);
  $('#remaining').textContent=game.deck.length;$('#hand-count').textContent=`${hand.length} 张 · ${game.turn===0?'东家':'练习局'}`;
  $('#missing-badge').textContent=game.missing[0]?`缺 ${suits[game.missing[0]]}`:'待定缺';
  $('#stage-label').textContent={exchange:'01 / 换三张',choose:'02 / 选择缺门',play:'03 / 牌局进行',end:'04 / 本局结束'}[phase];
  $('#status').textContent=phase==='exchange'?'顺时针交换三张牌':phase==='choose'?'选择本局不保留的花色':phase==='end'?game.result:game.busy?`${names[game.turn]}正在行动…`:'轮到你出牌';
  const existing=new Map(Array.from($('#hand').children,button=>[Number(button.dataset.id),button]));
  const buttons=hand.map(tile=>{
    let button=existing.get(tile.id);
    if(!button){
      button=document.createElement('button');button.className='tile';button.type='button';button.dataset.id=tile.id;button.setAttribute('aria-label',nameOf(tile.value));
      const image=document.createElement('img');image.src=faceOf(tile.value);image.alt='';button.append(image);
      button.addEventListener('click',()=>select(tile));button.addEventListener('dblclick',()=>{if(game.phase==='play'&&!game.busy){selected=new Set([tile.id]);discard();}});
    }
    button.setAttribute('aria-pressed',selected.has(tile.id));
    button.disabled=!(phase==='exchange'||playable);button.classList.toggle('selected',selected.has(tile.id));button.classList.toggle('required',forced&&suitOf(tile.value)===game.missing[0]);button.classList.toggle('drawn',tile.id===game.drawn);
    return button;
  });
  if(buttons.length!==existing.size||buttons.some((button,i)=>$('#hand').children[i]!==button))$('#hand').replaceChildren(...buttons);
  const action=$('#action');action.hidden=phase==='choose';action.disabled=game.busy||(phase==='exchange'?selected.size!==3:phase==='play'?selected.size!==1:false);
  action.replaceChildren(document.createTextNode(phase==='exchange'?'确认换牌':phase==='end'?'再来一局':'出牌'));
  if(phase==='exchange'){const span=document.createElement('span');span.textContent=`${selected.size} / 3`;action.append(span);}
  $('#auto').hidden=phase==='choose'||phase==='end';$('#auto').disabled=game.busy;
  $('#suit-controls').hidden=phase!=='choose';$('#win').hidden=!(playable&&canWin(values(hand),game.missing[0]));
  $('#hint').textContent=phase==='exchange'?'选出 3 张同一花色的牌':phase==='choose'?`建议缺「${suits[chooseMissing(values(hand))]}」：当前张数最少`:phase==='end'?'点击再来一局，重新洗牌':game.busy?'其他玩家依次摸牌、出牌':forced?'手里有缺门牌，请优先打出':'点击选牌，双击或按空格出牌';
  $('.me').classList.toggle('active',playable);for(let p=1;p<=3;p++){$(`#seat-${p}`).classList.toggle('active',phase==='play'&&game.turn===p);$(`#seat-${p} b`).textContent=game.missing[p]?`缺${suits[game.missing[p]]}`:'';}
}
function select(tile){
  if(game.busy||!['exchange','play'].includes(game.phase))return;
  if(selected.has(tile.id))selected.delete(tile.id);else if(game.phase==='exchange'){if(selected.size>=3){announce('最多选择三张');return;}selected.add(tile.id);}else selected=new Set([tile.id]);
  play('select',.2);update();
}
function reset(){
  generation++;flights.clear();tweens.length=0;selected.clear();clearTimeout(announcementTimer);$('#announcement').classList.remove('show');
  const deck=createDeck().map(value=>({value,id:++serial}));const hands=Array.from({length:4},()=>[]);
  for(let i=0;i<13;i++)for(let p=0;p<4;p++)hands[p].push(deck.pop());hands[0].push(deck.pop());hands.forEach(sort);
  game={deck,hands,discards:[[],[],[],[]],missing:[0,0,0,0],phase:'exchange',busy:false,turn:0,drawn:null,log:[],result:''};
  log('新牌局 · 东家起手 14 张');rebuildBoard();update();
}
async function exchange(){
  const outgoing=game.hands[0].filter(t=>selected.has(t.id));
  if(outgoing.length!==3)return;
  if(new Set(outgoing.map(t=>suitOf(t.value))).size!==1){announce('换三张需要同一花色');return;}
  const token=generation;game.busy=true;play('saizi',.18);announce('顺时针换三张');
  const sets=[outgoing,...game.hands.slice(1).map(hand=>exchangeIndices(values(hand)).map(i=>hand[i]))];
  game.hands=game.hands.map((hand,p)=>hand.filter(t=>!sets[p].includes(t)));selected.clear();update();
  await wait(700);if(token!==generation)return;
  game.hands.forEach((hand,p)=>{hand.push(...sets[(p+3)%4]);sort(hand);});game.phase='choose';game.busy=false;
  for(let p=1;p<=3;p++)game.missing[p]=chooseMissing(values(game.hands[p]));
  log(`你换出 ${outgoing.map(t=>nameOf(t.value)).join('、')}`);announce('换牌完成，请选择缺门');rebuildBoard();update();
}
function chooseSuit(suit){if(game.phase!=='choose')return;game.missing[0]=suit;game.phase='play';play('dingque');log(`你选择缺${suits[suit]}，开始出牌`);announce(`定缺：${suits[suit]}`);update();}
async function putTile(player,index,token){
  const [tile]=game.hands[player].splice(index,1);const pile=game.discards[player];fly(tile.value,player,pile.length);play('outtile',.23);
  log(`${names[player]}打出 ${nameOf(tile.value)}`);update();await wait(450);if(token!==generation)return false;
  pile.push(tile.value);rebuildBoard();play(`${suitOf(tile.value)}-${tile.value%10}`,player===0?.4:.28);return true;
}
async function discard(){
  if(game.phase!=='play'||game.busy||selected.size!==1)return;
  const hand=game.hands[0],index=hand.findIndex(t=>selected.has(t.id));if(index<0)return;
  if(hand.some(t=>suitOf(t.value)===game.missing[0])&&suitOf(hand[index].value)!==game.missing[0]){announce(`请优先打出缺门「${suits[game.missing[0]]}」`);return;}
  const token=generation;game.busy=true;game.drawn=null;selected.clear();
  if(!await putTile(0,index,token))return;
  for(let p=1;p<=3;p++){
    game.turn=p;update();await wait(450);if(token!==generation)return;
    if(!game.deck.length){end('牌墙摸完 · 本局流局');return;}
    const hand=game.hands[p];hand.push(game.deck.pop());
    if(canWin(values(hand),game.missing[p])){play('win');end(`${names[p]}自摸 · 本局结束`);return;}
    if(!await putTile(p,chooseDiscard(values(hand),game.missing[p]),token))return;
  }
  if(!game.deck.length){end('牌墙摸完 · 本局流局');return;}
  game.turn=0;const drawn=game.deck.pop();sort(game.hands[0]);game.hands[0].push(drawn);game.drawn=drawn.id;game.busy=false;
  play('draw',.25);log(`你摸到 ${nameOf(drawn.value)}`);rebuildBoard();update();
}
function end(result){game.phase='end';game.busy=false;game.result=result;selected.clear();announce(result);log(result);rebuildBoard();update();}
$('#action').addEventListener('click',()=>game.phase==='exchange'?exchange():game.phase==='end'?reset():discard());
$('#auto').addEventListener('click',()=>{if(game.busy)return;const hand=game.hands[0];selected=new Set((game.phase==='exchange'?exchangeIndices(values(hand)):[chooseDiscard(values(hand),game.missing[0])]).map(i=>hand[i].id));play('select',.2);update();});
document.querySelectorAll('[data-suit]').forEach(button=>button.addEventListener('click',()=>chooseSuit(Number(button.dataset.suit))));
$('#reset').addEventListener('click',reset);
$('#win').addEventListener('click',()=>{if(!game.busy&&game.phase==='play'&&canWin(values(game.hands[0]),game.missing[0])){play('win');end('你自摸了 · 恭喜胡牌');}});
$('#sound').addEventListener('click',()=>{soundOn=!soundOn;$('#sound').textContent=`音效 ${soundOn?'开':'关'}`;$('#sound').setAttribute('aria-pressed',soundOn);if(!soundOn)sounds.forEach(audio=>audio.pause());else play('select',.15);});
$('#music').addEventListener('click',()=>{musicOn=!musicOn;if(!music){music=new Audio('assets/sounds/music.mp3');music.loop=true;music.volume=.12;}if(musicOn)music.play().catch(()=>{musicOn=false;$('#music').textContent='音乐 关';$('#music').setAttribute('aria-pressed',false);});else music.pause();$('#music').textContent=`音乐 ${musicOn?'开':'关'}`;$('#music').setAttribute('aria-pressed',musicOn);});
$('#help').addEventListener('click',()=>$('#help-dialog').showModal());$('#close-help').addEventListener('click',()=>$('#help-dialog').close());$('#help-ok').addEventListener('click',()=>$('#help-dialog').close());
document.addEventListener('keydown',event=>{if(event.code==='Space'&&!$('#help-dialog').open&&event.target===document.body){event.preventDefault();discard();}});
reset();
