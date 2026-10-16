import {installGameAudio} from './game-audio.js';
import {variants,variantKeys,roomsForMode,currentRoom} from './rooms-config.js';
import {enterRoom} from './room-entry.js';
import {getSanguoTableEntry,enterSanguoTable} from './sanguo-table-entry.js';
import {createRoomRules} from './native-room-rules.js';
import {createNativeHallGames} from './native-hall-games.js';
import {createNativeSanguoGuide} from './native-sanguo-guide.js';
import {createNativeZodiacGuide} from './native-zodiac-guide.js';
import {sanguoGuideToday,readSanguoGuideState,shouldAutoOpenSanguoGuide,recordSanguoGuideShown} from './sanguo-guide-entry.js';
import {practiceWallet,bindPracticeWallet} from './practice-wallet.js';
import {hallGameForMode} from './hall-game-catalog.js';
const $=s=>document.querySelector(s);const initial=currentRoom();let key=initial.key,selected=initial.room;const nativeOnly=['sanguo','zodiac'].includes(initial.variant.group);
// Source room templates are chosen by game family, independently of whether
// that game's local engine has been implemented.
if(nativeOnly)for(const child of $('#lobby').children){if(child.id==='info'||child.tagName==='DIALOG')continue;child.hidden=true;child.style.display='none';}
const roomRules=createRoomRules($('#lobby'),{mode:key,liveRules:true});
const balances={coins:'—'};
const sanguoGuide=createNativeSanguoGuide($('#lobby')),zodiacGuide=createNativeZodiacGuide($('#lobby'));
function autoSanguoGuide(model){const entry=model.controls.find(control=>control.action.type==='guide'&&control.action.typeID===911);if(!entry)return;const today=sanguoGuideToday();if(shouldAutoOpenSanguoGuide({typeID:entry.action.typeID,today,isNewUser:!readSanguoGuideState().popped})){recordSanguoGuideShown(today);return sanguoGuide.show({entryPoint:entry.action.entryPoint});}}
const weekly={show:()=>practiceWallet.show(),close(){},get open(){return false;}};
try{if(JSON.parse(localStorage.getItem('MAHJONG_SETTINGS')||'{}').effects===false)document.body.classList.add('effects-off');}catch{}
// Port hallTableSelView.playUIShowAnimation(): .3 s arrival, .15 s settle,
// quartic easing, scale .8 → 1, and a 20 px overshoot.
function enterAnimation(){
 if(document.body.classList.contains('effects-off')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const quartic=t=>1-(1-t)**4,frames=[];
 for(let i=0;i<=30;i++){const time=i/30*.45;const x=time<=.3?1600-1620*quartic(time/.3):-20+20*quartic((time-.3)/.15);const scale=.8+.2*Math.min(time/.15,1);frames.push({transform:`translateX(${x}px) scale(${scale})`,offset:i/30});}
 $('#rooms').animate(frames,{duration:450,easing:'linear'});
 for(const node of document.querySelectorAll('.room-back,#variant-title,#room-help,.month,.balances')){const base=getComputedStyle(node).transform;node.animate(Array.from({length:21},(_,i)=>({transform:`translateY(${-900*(1-quartic(i/20))}px) ${base==='none'?'':base}`,offset:i/20})),{duration:300,delay:10,easing:'linear',fill:'backwards'});}
 for(const node of document.querySelectorAll('.room-activities,.quick'))node.animate(Array.from({length:21},(_,i)=>({transform:`translateY(${900*(1-quartic(i/20))}px)`,offset:i/20})),{duration:300,delay:10,easing:'linear',fill:'backwards'});
}
function fit(){$('#lobby').style.transform=`scale(${Math.min(innerWidth/1104,innerHeight/554)})`;}addEventListener('resize',fit);fit();
function update(){
 const variant=variants[key],roomList=roomsForMode(key);
 if(!roomList.some(room=>room.id===selected.id))selected=roomList[0];
 $('#variant-title b').textContent=variant.name;$('#variant-title small').textContent=variant.en;
 document.title=`联桌麻将 · ${variant.name} · 场次选择`;
 $('#variants').innerHTML=variantKeys(key).map(k=>{const v=variants[k];return `<button data-variant="${k}" class="${k===key?'active':''}" aria-pressed="${k===key}"><b>${v.name}</b><small>${hallGameForMode(k)?.preview?'规则预览':v.en}</small></button>`;}).join('');
 $('#variants').querySelectorAll('button').forEach(b=>b.onclick=()=>{const choice=hallGameForMode(b.dataset.variant);if(choice?.preview){roomRules.show(choice.ruleID);return;}key=b.dataset.variant;history.replaceState(null,'',`?mode=${key}`);update();});
 // Stakes and tier IDs still come from the unchanged room configuration.
 // Captured population counts and balance ranges are not live multiplayer data
 // or enforced entry gates, so describe the actual human-versus-bots game.
 $('#rooms').innerHTML=roomList.map(r=>`<a class="room-card" href="reference.html?mode=${key}&room=${r.id}" aria-label="${r.name} 底分${r.number}"><span class="room-card-name">${r.name}</span><span class="room-card-label">金币底分</span><span class="room-gloss" aria-hidden="true"></span><strong>${r.number}</strong><div class="meta"><span class="people">人机练习</span><span class="room-enter">进入牌桌 <i aria-hidden="true">›</i></span></div></a>`).join('');
 $('#room-quick').href=`reference.html?mode=${key}&room=${selected.id}`;
 $('#room-quick small').textContent=`${variant.name} ${selected.name}`;
}
$('#variant-title').onclick=()=>{const collapsed=$('#lobby').classList.toggle('collapsed');$('#variant-title').setAttribute('aria-expanded',String(!collapsed));};
const dialog=$('#info');function info(title,text){dialog.hidden=false;dialog.style.removeProperty('display');dialog.querySelector('.okay').textContent='知道了';dialog.querySelector('.okay').onclick=()=>dialog.close();dialog.querySelector('h2').textContent=title;dialog.querySelector('p').textContent=text;dialog.showModal();}$('#room-help').onclick=()=>roomRules.show(key);document.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>{if(b.dataset.info==='玩法指引'){dialog.querySelector('h2').textContent='提  示';dialog.querySelector('p').textContent='确定立即学习玩法指引吗？';dialog.querySelector('.okay').textContent='开始学习';dialog.querySelector('.okay').onclick=()=>location.href=`reference.html?mode=${key}&teach=1`;dialog.showModal();}else{dialog.querySelector('.okay').textContent='知道了';dialog.querySelector('.okay').onclick=()=>dialog.close();info(b.dataset.info,'此入口为本地展示。当前可以选场进入练习牌局；详细活动页面尚未移植。');}});dialog.querySelector('.close').onclick=dialog.querySelector('.okay').onclick=()=>dialog.close();
if(!nativeOnly){update();enterAnimation();}

// Keep the room screen behind the original 發 loader until real table resources
// are in the browser cache. The percentage counts completed resource requests.
async function preloadTable(report){
 const response=await fetch('assets/reference/ui-index.json');if(!response.ok)throw Error('无法加载牌桌资源目录');const index=await response.json();
 const [tableFrames,handMeta]=await Promise.all(['table-layout-study/frames.json','hand-study/animations.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error(`无法加载 ${url}`);return r.json();})));
 const files=[...new Set(['reference.html','reference-entry.js','reference.js','reference.css','table-controls.js','table-layout.js','table-layout-source.js','hand-effects.js','hand-study/animations.json','hand-study/mesh.json',handMeta.texture,'assets/reference/desk.jpg','assets/reference/mesh-body.json','assets/reference/mesh-face.json','assets/reference/layout.json','meld-study/layout.json','meld-study/frames.json',...tableFrames.map(frame=>frame.image),...Object.values(index).map(item=>'assets/reference/'+item.file)])];
 let next=0,done=0;report(0);await Promise.all(Array.from({length:6},async()=>{while(next<files.length){const file=files[next++];const r=await fetch(file);if(!r.ok)throw Error(`无法加载 ${file}`);await r.arrayBuffer();report(++done/files.length*100);}}));
}
function openRoom(event){const link=event.target.closest('a.room-card,#room-quick');if(!link||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();if(key==='sanguo'){const roomID=new URL(link.href,location.href).searchParams.get('room');enterSanguoTable({typeID:911,roomID},{parent:$('#lobby'),onError:error=>info('资源加载失败',error.message)});return;}if(variants[key].playable===false){unsupportedRoom();return;}enterRoom(link.href,{parent:$('#lobby'),preload:preloadTable,minVisibleMs:650,onError:error=>info('资源加载失败',error.message)});}
$('#lobby').addEventListener('click',openRoom);

document.querySelectorAll('.balances button').forEach((button,index)=>{button.onclick=()=>practiceWallet.show('coins');});
const month=document.querySelector('.month');month.setAttribute('aria-label','金币补给');month.onclick=()=>weekly.show();

function unsupportedRoom(){info(variants[key].name,`${variants[key].name}的原版场次页面已可预览；本地尚未实现这一玩法的牌局规则。场次数据按目标截图展示。`);}
function openNativeTable(payload){if(key==='sanguo')return enterSanguoTable({typeID:911,scene:payload?.scene||payload?.quickScene},{parent:$('#lobby'),onError:error=>info('资源加载失败',error.message)});unsupportedRoom();}
if(nativeOnly){
 document.title=`${variants[key].name} · 场次选择`;
 const sourceRooms=createNativeHallGames($('#lobby'),{width:1104,height:554,balances,singleCurrency:true,onClose:()=>location.href='hall.html',onRoomShown:autoSanguoGuide,onGuide:action=>(action.typeID===898?zodiacGuide:sanguoGuide).show({entryPoint:action.entryPoint}),onRules:typeID=>roomRules.show(typeID),onSelect:openNativeTable,onQuick:openNativeTable,onWeekCard:()=>weekly.show(),onCurrency:currency=>practiceWallet.show(currency)});
 bindPracticeWallet({closeActive:true,onChange:value=>{Object.assign(balances,value);sourceRooms.setBalances(value);}});
 sourceRooms.show('rooms',{typeID:variants[key].typeID,scenes:roomsForMode(key),showFanGather:false}).catch(error=>info('资源加载失败',error.message));
}
if(!nativeOnly)bindPracticeWallet({closeActive:true,onChange:value=>{Object.assign(balances,value);}});

installGameAudio();
