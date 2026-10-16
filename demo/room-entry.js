import {exchangePackLayout} from './exchange-layout.js';
const asset=name=>new URL(`./opening-study/entry-exchange/assets/${name}`,import.meta.url).href;
const art={loadingBg:'mainPrefab-0-img_load_res_bg.png',loadingRing:'mainPrefab-2-img_load_res.png',loadingFace:'mainPrefab-3-img_icon_fa.png',arrow:'game-1330-img_arrows.png',oppositeArrow:'game-1253-shang.png',clockwise:'game-602-img_changeMode_CCW.png',counterclockwise:'game-548-img_changeMode_CC.png',opposite:'game-717-img_changeMode_OPPO.png',tip:'game-741-tableTip.png',mine:['game-1776-Frame_xiajia_pingpai_fan_5.png','game-1705-Frame_xiajia_pingpai_fan_6.png','game-2005-Frame_xiajia_pingpai_fan_7.png'],side:['game-1741-Frame_zuojia_pingpai_fan_15.png','game-1973-Frame_zuojia_pingpai_fan_16.png','game-1653-Frame_zuojia_pingpai_fan_17.png']};
function css(){const href=new URL('./room-entry.css',import.meta.url).href;if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(e=>e.href===href)){const link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.append(link);}}
function img(name,className=''){const e=document.createElement('img');e.className=className;e.src=asset(name);e.alt='';e.draggable=false;return e;}
export function createRoomEntry(parent=document.body){
 css();const node=document.createElement('div');node.className='room-entry';node.hidden=true;node.setAttribute('role','status');node.setAttribute('aria-live','polite');
 if(parent===document.body)node.classList.add('room-entry-fixed');
 const content=document.createElement('div');content.className='room-entry-content';
 const icon=document.createElement('div');icon.className='room-entry-icon';icon.append(img(art.loadingBg,'entry-icon-bg'),img(art.loadingRing,'entry-icon-ring'),img(art.loadingFace,'entry-icon-face'));
 const label=document.createElement('span');label.className='room-entry-label';content.append(icon,label);node.append(content);parent.append(node);
 let progress=0;
 function size(){content.style.setProperty('--entry-scale',String(parent===document.body?Math.min(innerWidth/1280,innerHeight/720):parent.clientHeight/720));}
 function update(value){const n=typeof value==='number'?value:value?.progress;if(Number.isFinite(n))progress=Math.max(0,Math.min(100,n));label.textContent=`加载中... ${Math.min(progress,99.9).toFixed(1)}%`;label.hidden=progress>=99.9;return progress;}
 function show(value=0){progress=0;update(value);size();node.hidden=false;parent.setAttribute('aria-busy','true');}
 function hide(){node.hidden=true;parent.removeAttribute('aria-busy');}
 addEventListener('resize',size);
 return {show,update,hide,get open(){return !node.hidden;},get progress(){return progress;},destroy(){hide();removeEventListener('resize',size);node.remove();}};
}

// Call with a real resource preloader; progress is a measured percentage (0–100).
let entering=false;
export async function enterRoom(href,{parent=document.body,preload,onError,minVisibleMs=0,navigate=url=>location.assign(url)}={}){
 if(entering)return false;entering=true;let navigated=false;const overlay=createRoomEntry(parent),started=performance.now();overlay.show(0);
 try{
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(typeof preload==='function')await preload(percent=>overlay.update(percent));
  else if(Array.isArray(preload)&&preload.length){let done=0;await Promise.all(preload.map(async url=>{const r=await fetch(url);if(!r.ok)throw Error(`资源加载失败：${r.status}`);await r.arrayBuffer();overlay.update(++done/preload.length*100);}));}
  else{const r=await fetch(href);if(!r.ok)throw Error(`牌桌加载失败：${r.status}`);await r.text();overlay.update(100);}
  const remaining=Math.max(0,minVisibleMs-(performance.now()-started));if(remaining)await new Promise(resolve=>setTimeout(resolve,remaining));
  await navigate(href);navigated=true;addEventListener('pagehide',()=>overlay.destroy(),{once:true});return true;
 }catch(error){overlay.hide();if(onError)onError(error);else throw error;return false;}
 finally{entering=false;if(!navigated)overlay.destroy();}
}

// Resting three-card sprites and the golden arrows are native HSZ artwork.
// Character hand motion is a separate 3D skeleton and is not simulated here.
export function createExchangeEffects(parent,{sound,center={x:640,y:292}}={}){
 css();const node=document.createElement('div');node.className='exchange-effects';node.hidden=true;node.setAttribute('aria-label','换三张动画');
 const arrows=document.createElement('div');arrows.className='exchange-circle';arrows.style.left=`${center.x}px`;arrows.style.top=`${center.y}px`;
 for(let i=0;i<4;i++){const arrow=img(art.arrow,'exchange-gold-arrow');arrow.style.transform=`rotate(${i*90}deg)`;arrows.append(arrow);}
 const opposite=document.createElement('div');opposite.className='exchange-opposite';opposite.style.left=`${center.x}px`;opposite.style.top=`${center.y}px`;
 opposite.append(img(art.oppositeArrow,'exchange-opposite-up'),img(art.oppositeArrow,'exchange-opposite-down'));
 const tip=document.createElement('div');tip.className='exchange-tip';tip.style.left=`${center.x}px`;tip.style.top=`${center.y-160}px`;tip.append(img(art.tip,'exchange-tip-bg'));const word=img(art.opposite,'exchange-tip-word');word.alt='换牌中，本局对家换牌';tip.append(word);
 const backs=document.createElement('div');backs.className='exchange-backs';
 const groups=exchangePackLayout().map((source,seat)=>{const block=document.createElement('div');block.className=`exchange-back-group exchange-back-${seat}`;block.dataset.seat=seat;block.style.left=`${source.center[0]}px`;block.style.top=`${source.center[1]}px`;block.style.transform=`scale(${source.stageScale}) rotate(${-source.angle}deg) scale(${source.scale.join(',')})`;source.tiles.forEach(([x,y,w,h],i)=>{const image=img((seat===0||seat===2?art.mine:art.side)[i]);Object.assign(image.style,{left:`${x-w/2}px`,top:`${-y-h/2}px`,width:`${w}px`,height:`${h}px`});block.append(image);});backs.append(block);return block;});
 node.append(backs,arrows,opposite,tip);parent.append(node);
 let animations=[],timer,finish,currentPromise;
 const ready=Promise.all([...node.querySelectorAll('img')].map(image=>image.decode().catch(()=>{})));
 function cleanup(){clearTimeout(timer);for(const animation of animations)animation.cancel();animations=[];node.hidden=true;groups.forEach(group=>group.hidden=true);}
 function cancel(){cleanup();if(finish){finish({cancelled:true});finish=null;}}
 function prepare(){cancel();node.hidden=false;arrows.hidden=true;opposite.hidden=true;tip.hidden=true;}
 function setReady(seat){node.hidden=false;groups[seat].hidden=false;}
 function play({direction='opposite',duration=1500,style='observed',onFinished}={}){
  cancel();const valid=['opposite','clockwise','counterclockwise'].includes(direction)?direction:'opposite';const ms=Number.isFinite(duration)?Math.max(1,duration):1500;
  currentPromise=new Promise(resolve=>{finish=resolve;});currentPromise.finished=currentPromise;currentPromise.duration=ms;currentPromise.durationSeconds=ms/1000;
  word.src=asset(art[valid]);word.alt=`换牌中，本局${{opposite:'对家',clockwise:'顺时针',counterclockwise:'逆时针'}[valid]}换牌`;
  const originalOpposite=valid==='opposite'&&style==='source';arrows.hidden=originalOpposite;opposite.hidden=!originalOpposite;tip.hidden=false;groups.forEach(group=>group.hidden=false);node.hidden=false;sound?.('outtile');
  if(originalOpposite){
   const sequence=[{offset:0,p:[63,18],q:[-70,-22],easing:'cubic-bezier(.1503,.2103,.6053,.8266)'},{offset:.6666666667/1.25,p:[63,-17],q:[-70,15]},{offset:1.1333333333/1.25,p:[63,18],q:[-70,-22]},{offset:1,p:[63,18],q:[-70,-22]}];
   for(const[selector,key,flip]of[['.exchange-opposite-up','p',1],['.exchange-opposite-down','q',-1]]){const e=opposite.querySelector(selector);animations.push(e.animate(sequence.map(f=>({offset:f.offset,easing:f.easing??'linear',transform:`translate(-50%,-50%) translate(${f[key][0]}px,${f[key][1]}px) scaleY(${flip})`})),{duration:1250,fill:'both',iterations:ms/1250}));}
  }else animations.push(arrows.animate([{transform:'translate(-50%,-50%) rotate(0deg)'},{transform:`translate(-50%,-50%) rotate(${valid==='counterclockwise'?-180:180}deg)`}],{duration:ms,fill:'both',easing:'linear'}));
  timer=setTimeout(()=>{cleanup();const resolve=finish;finish=null;resolve?.({cancelled:false,direction:valid,duration:ms});onFinished?.();},ms);return currentPromise;
 }
 return {play,prepare,setReady,cancel,clear:cancel,ready,get active(){return !node.hidden;},duration:1500,destroy(){cancel();node.remove();}};
}
