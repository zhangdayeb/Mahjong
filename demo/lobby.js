import {createSignatureEditor} from './profile-signature.js';
import {installGameAudio} from './game-audio.js';
import {createNativeHallPanels,hallPanelKind} from './native-hall-panels.js';
import {createLianzhuoPanels,lianzhuoPanelKind} from './lianzhuo-panels.js';
import {hallIcon} from './hall-interface-icons.js';
import {createHallGameCards} from './hall-game-cards.js';
import {hallGameForMode} from './hall-game-catalog.js';
import {enterRoom} from './room-entry.js';
import {practiceWallet,bindPracticeWallet} from './practice-wallet.js';
const $=s=>document.querySelector(s),asset=n=>`assets/lobby/${n}.png`,stage=$('#lobby');
function fit(){stage.style.transform=`scale(${Math.min(innerWidth/1080,innerHeight/542)})`;}
addEventListener('resize',fit);fit();
$('.activities').innerHTML=`<span class="welfare-heading">游戏福利</span><button class="daily-relief-entry" aria-label="每日救济金" data-info="每日救济金"><img src="${asset(391)}" alt="金币"><strong>每日救济金</strong><small>每天领取 30000 金币</small></button>`;
const nav=[['更多','more'],['活动','activity'],['邮件','mail'],['设置','settings']];
$('.nav-items').innerHTML=nav.map(([name,icon])=>`<button aria-label="${name}" data-info="${name}" ${icon==='more'?'aria-haspopup="dialog" aria-expanded="false"':''}>${hallIcon(icon)}<span>${name}</span></button>`).join('');
const dialog=$('#info'),hallUI=createLianzhuoPanels(stage,{onWallet:()=>practiceWallet.show('coins'),onWatchAd:()=>practiceWallet.watchAd(),onError:fail});
const panels=createNativeHallPanels(stage,{profile:{singleCurrency:true,rewardAds:true,name:'—',id:'—',coins:'—',avatar:'assets/lobby/user-avatar.png'},onRules:()=>hallUI.show('rules'),onWatchAd:()=>practiceWallet.watchAd(),onEditSignature:()=>signatureEditor.show()});
const signatureEditor=createSignatureEditor({getSignature:()=>practiceWallet.account?.signature||'',onSave:value=>practiceWallet.saveSignature(value),onClose:()=>panels.element.querySelector('.profile-signature-edit')?.focus({preventScroll:true})});
function closePanels(){panels.close();hallUI.close();}
function fail(error){dialog.querySelector('h2').textContent='资源加载失败';dialog.querySelector('p').textContent=error.message;dialog.showModal();}
function show(action){Promise.resolve(action()).catch(fail);}
function preview(game){closePanels();show(()=>hallUI.show('rules',{mode:game.mode}));}
createHallGameCards($('.modes'),{onPreview:preview});
document.querySelectorAll('[data-info]').forEach(button=>button.addEventListener('click',event=>{
 event.preventDefault();const name=button.dataset.info;
 if(name==='更多'&&hallUI.open&&hallUI.kind==='more'){hallUI.close();return;}
 closePanels();
 if(['金币','每日救济金'].includes(name)){show(()=>practiceWallet.show('coins'));return;}
 if(lianzhuoPanelKind(name)){show(()=>hallUI.show(name,{trigger:button}));return;}
 if(hallPanelKind(name)){show(()=>panels.show(name));return;}
 dialog.querySelector('h2').textContent=name;dialog.querySelector('p').textContent='此入口仅用于界面展示。';dialog.showModal();
}));
$('.quick').addEventListener('click',event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();closePanels();enterRoom(event.currentTarget.href,{parent:stage,preload:['reference.html','reference-entry.js','reference.js','reference.css'],minVisibleMs:650,onError:fail});});
dialog.querySelector('.close').onclick=dialog.querySelector('.okay').onclick=()=>dialog.close();
$('#study-open').onclick=()=>$('#study').hidden=false;$('#study-close').onclick=()=>$('#study').hidden=true;
const names={background:'中式湖景背景',profile:'头像与顶部资产栏',activities:'每日救济金',modes:'麻将玩法卡片',navigation:'底部导航'};
$('#layers').innerHTML=Object.entries(names).map(([key,name])=>`<label><input type="checkbox" data-layer="${key}" checked> ${name}</label>`).join('');
document.querySelectorAll('[data-layer]').forEach(input=>input.onchange=()=>{document.querySelectorAll(`[data-part="${input.dataset.layer}"]`).forEach(node=>node.style.visibility=input.checked?'visible':'hidden');});
bindPracticeWallet({closeActive:true,onChange:(value,account)=>panels.setProfile({...value,singleCurrency:true,rewardAds:true,name:account.name,id:account.id,signature:account.signature,signatureEditable:true})});
const requested=hallGameForMode(new URLSearchParams(location.search).get('rules'));if(requested)preview(requested);
installGameAudio();
