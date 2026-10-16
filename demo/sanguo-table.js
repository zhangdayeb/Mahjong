import {drawNativeNode} from './native-ui-canvas.js';
import {nativeSpriteDrawArgs,TABLE_SOURCE} from './table-layout.js';
import {buildSanguoReadyModel,findSanguoNode} from './sanguo-table-model.js';
import {buildSanguoDealtModel,buildSanguoMenu,buildSanguoRecorder} from './sanguo-dealt-model.js';
import {sanguoReadyTableFixture as readyFixture} from './sanguo-table-study/sanguo-table-fixture.js';
import {sanguoDealtTableFixture as dealtFixture} from './sanguo-table-study/sanguo-dealt-fixture.js';
import {getSanguoTableEntry} from './sanguo-table-entry.js';
import {createRoomRules} from './native-room-rules.js';
import {createExitConfirm} from './native-exit.js';
import {createNativeHallPanels} from './native-hall-panels.js';
import {createTablePanels} from './table-panels.js';
import {buildSanguoPlayModel,sanguoTileLayers} from './sanguo-play-model.js';
import {createSanguoController} from './sanguo-controller.js';
import {createControlEffects} from './control-effects.js';
import {createSettlementView} from './settlement-view.js';
import {sanguoName} from './sanguo-rules.js';
import {practiceWallet} from './practice-wallet.js';
import {installGameAudio,playGameSound} from './game-audio.js';
installGameAudio();

const $=selector=>document.querySelector(selector),stage=$('#table'),canvas=$('#table-canvas'),status=$('#load-status'),menu=$('#menu'),panel=$('#menu-panel'),dismiss=$('#menu-dismiss'),dialog=$('#table-dialog');
const BASE=new URL('.',import.meta.url),query=new URLSearchParams(location.search),entry=getSanguoTableEntry({typeID:911,roomID:query.get('room')??undefined}),prepared=query.get('state')==='ready',preview=prepared||query.get('state')==='dealt',fixture=prepared?readyFixture:dealtFixture;
const rules=createRoomRules(stage,{mode:'sanguo'}),exit=createExitConfirm(stage,{onExit:()=>practiceWallet.navigate('hall.html')});
const panelHost=document.createElement('div');panelHost.className='sanguo-table-panel-host';Object.assign(panelHost.style,{position:'absolute',width:'1280px',height:'640px',pointerEvents:'none',transformOrigin:'top left',zIndex:20});stage.append(panelHost);
const panelStyle=document.createElement('link');panelStyle.rel='stylesheet';panelStyle.href=new URL('table-panels.css',BASE).href;document.head.append(panelStyle);
const tablePanels=createTablePanels(panelHost,{tileRenderer:value=>tileWidget(value,'table-popup-tile'),onChat:payload=>noticeText('你：'+payload.text)});let walletMatch,starting=false,settings,data,dealt,play,frames,images,fonts,model,controller,auto=false,dialogKind=null,timeoutAutoHu=true,handKey='',actionKey='',notice='',noticeUntil=0;
const actionLayer=$('#round-actions'),controlFX=createControlEffects(actionLayer),settlement=createSettlementView({tileRenderer:value=>tileWidget(value,'settlement-tile'),onAgain:()=>restartPractice().catch(error=>noticeText(error.message)),onExit:()=>practiceWallet.navigate('rooms.html?mode=sanguo')});
const image=async file=>{const value=new Image();value.src=new URL(file,BASE).href;await value.decode();return value;};
const place=(element,rect)=>Object.assign(element.style,{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px'});
function sprite(context,uuid,x,y,scale=[1,1],style){const frame=frames.get(uuid),bitmap=images.get(uuid);if(!frame||!bitmap)return;context.save();context.translate(x,y);context.scale(...scale);context.drawImage(bitmap,...nativeSpriteDrawArgs(frame,style));context.restore();}
function isPaused(){return starting||!!walletMatch?.syncError||!panel.hidden||rules.open||exit.open||settings?.open||tablePanels.open||dialogKind!==null||settlement.open;}
function noticeText(text){notice=text;noticeUntil=Date.now()+2500;draw();}
function paintTile(context,tile){for(const layer of sanguoTileLayers(tile,play)){if(!layer.skew){sprite(context,layer.frame,layer.x,layer.y,layer.scale,layer.style);continue;}context.save();context.translate(layer.x,layer.y);context.scale(...layer.scale);context.transform(1,-Math.tan(layer.skew[1]*Math.PI/180),-Math.tan(layer.skew[0]*Math.PI/180),1,0,0);sprite(context,layer.frame,0,0,[1,1],layer.style);context.restore();}}
function tileWidget(value,className){if(!play||!frames)return null;const node=document.createElement('span');node.className=className;node.setAttribute('aria-label',sanguoName(value));const bitmap=document.createElement('canvas');bitmap.width=91;bitmap.height=134;bitmap.className='sanguo-settlement-tile-canvas';const context=bitmap.getContext('2d'),source=TABLE_SOURCE.seats[0].hand.sprite;paintTile(context,{value,body:source.body.frame,x:45.5,y:67,scale:[1,1],sprite:source,faceOffset:[0,-6],faceScale:[1,1]});node.append(bitmap);return node;}
function renderPlayControls(){
 const scale=model.scale,canSelect=controller.canSelect,key=[canvas.width,canvas.height,controller.round.phase,controller.round.turn,controller.round.hands[0].join(','),controller.selected,canSelect].join('|');
 if(key!==handKey){handKey=key;const focused=document.activeElement?.dataset.handIndex,hits=$('#hand-controls');hits.replaceChildren();for(const rect of model.handButtons){const value=controller.round.hands[0][rect.index],button=document.createElement('button');button.type='button';button.className='sanguo-hand-hit';button.dataset.handIndex=String(rect.index);button.setAttribute('aria-label',sanguoName(value)+'，手牌'+(rect.index+1));button.setAttribute('aria-pressed',String(rect.index===controller.selected));button.disabled=!canSelect;button.onclick=()=>controller.select(rect.index);place(button,rect);hits.append(button);if(focused===String(rect.index))button.focus({preventScroll:true});}}
 const options=controller.options,selected=controller.round.hands[0][controller.selected],display=[];
 if(controller.round.phase==='play'){if(options.includes('hu'))display.push(['hu','自摸']);for(const prefix of['gang:','add:']){const option=options.find(option=>option===prefix+selected)||options.find(option=>option.startsWith(prefix));if(option){display.push([option,prefix==='add:'?'补杠':'暗杠']);break;}}const seal=options.find(option=>option==='seal:'+selected)||options.find(option=>option.startsWith('seal:'));if(seal)display.push([seal,'玉玺杠']);if(options.includes('dig'))display.push(['dig','挖宝']);}
 else if(['claim','rob'].includes(controller.round.phase))for(const option of options)display.push([option,{hu:'胡牌',peng:'碰',gang:'杠',pass:'过'}[option]]);
 const actionsKey=JSON.stringify([display,isPaused(),controller.auto,controller.round.phase]);if(actionsKey!==actionKey){actionKey=actionsKey;actionLayer.replaceChildren();for(const[option,label]of display){const kind=option==='hu'?(controller.round.phase==='play'?'zimo':'hu'):option.startsWith('gang:')||option.startsWith('add:')?'gang':option;let button;if(['hu','zimo','peng','gang','pass'].includes(kind))button=controlFX.createNativeClaimButton(kind,{label,onClick:()=>controller.execute(option)});else{button=document.createElement('button');button.type='button';button.className='sanguo-special-action';button.textContent=label;button.onclick=()=>controller.execute(option);}button.setAttribute('aria-label',label);button.disabled=isPaused()||controller.auto;actionLayer.append(button);}}
 const actionWidth=Math.max(1,display.length)*116-16;Object.assign(actionLayer.style,{left:model.width/2-actionWidth*scale/2+'px',top:model.height-280*scale+'px',width:actionWidth+'px',transform:`scale(${scale})`});actionLayer.hidden=isPaused()||controller.auto||controller.round.phase==='end';
 const text=$('#round-status');text.hidden=isPaused();text.textContent=Date.now()<noticeUntil?notice:`本地练习 · 战图${model.mapCount}/12 · ${controller.auto?'托管中':controller.status}`;Object.assign(text.style,{left:'5%',width:'90%',top:model.height-177*scale+'px',fontSize:21*scale+'px'});
}
function setMenu(open){panel.hidden=!open;dismiss.hidden=!open;menu.setAttribute('aria-expanded',String(open));draw();}
function closeDialog(){dialog.hidden=true;dialogKind=null;$('#dialog-controls').replaceChildren();menu.focus();draw();}
function dialogButton(label,rect,action,{role,checked}={}){const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',label);if(role)button.setAttribute('role',role);if(checked!==undefined)button.setAttribute('aria-checked',String(checked));button.onclick=action;place(button,rect);$('#dialog-controls').append(button);return button;}
function drawDialog(){
 if(!dialogKind||!model)return;const target=$('#dialog-canvas');target.width=model.width;target.height=model.height;const context=target.getContext('2d'),scale=model.scale;
 let tree;if(dialogKind==='timeout'){tree=structuredClone(dealt.timeout);findSanguoNode(findSanguoNode(tree,'Hu'),'gou').active=timeoutAutoHu;findSanguoNode(findSanguoNode(tree,'Pass'),'gou').active=!timeoutAutoHu;}else tree=buildSanguoRecorder(dealt,dealtFixture).tree;
 context.save();context.translate(model.width/2,model.height/2);context.scale(scale,scale);drawNativeNode(context,tree,{frames,images,fonts});context.restore();
 const hits=$('#dialog-controls');hits.replaceChildren();
 if(dialogKind==='timeout'){
  const parent=findSanguoNode(tree,'di');for(const[name,label,value]of[['Hu','超时自动胡牌',true],['Pass','超时自动打出',false]]){const node=findSanguoNode(tree,name);dialogButton(label,{x:model.width/2+(parent.trs[0]-145)*scale,y:model.height/2-(parent.trs[1]+node.trs[1]+33)*scale,width:290*scale,height:65*scale},()=>{timeoutAutoHu=value;controller?.setTimeoutHu(value);drawDialog();},{role:'radio',checked:timeoutAutoHu===value});}
  const node=findSanguoNode(tree,'Close');dialogButton('关闭超时设置',{x:model.width/2+(node.trs[0]-30)*scale,y:model.height/2-(node.trs[1]+30)*scale,width:60*scale,height:60*scale},closeDialog);
 }else{const button=dialogButton('关闭记牌器',{x:model.width/2+190*scale,y:model.height/2-115*scale,width:45*scale,height:45*scale},closeDialog);button.textContent='×';button.style.fontSize=32*scale+'px';}
}
function showDialog(kind){setMenu(false);dialogKind=kind;dialog.hidden=false;dialog.setAttribute('aria-label',kind==='timeout'?'超时设置':'记牌器：当前手牌');drawDialog();$('#dialog-controls button')?.focus();}
function showRecorder(){if(!controller){showDialog('recorder');return;}setMenu(false);dialogKind='live-recorder';dialog.hidden=false;dialog.setAttribute('aria-label','记牌器');const hits=$('#dialog-controls');hits.replaceChildren();$('#dialog-canvas').getContext('2d').clearRect(0,0,model.width,model.height);const box=document.createElement('section');box.className='sanguo-recorder-grid';box.style.pointerEvents='auto';const heading=document.createElement('header');heading.textContent='记牌器';const close=document.createElement('button');close.type='button';close.setAttribute('aria-label','关闭记牌器');close.textContent='×';close.onclick=closeDialog;heading.append(close);const explanation=document.createElement('p');explanation.textContent='牌库总量 − 自己手牌 − 已公开牌；不读取其他玩家的暗牌。';const grid=document.createElement('div');grid.className='items';for(const item of controller.round.recorder()){const cell=document.createElement('div');cell.className='item'+(item.remaining?'':' exhausted');const tile=tileWidget(item.value,'');const label=document.createElement('b');label.textContent=String(item.remaining);cell.title=sanguoName(item.value)+'：未知'+item.remaining+'张';cell.append(tile,label);grid.append(cell);}box.append(heading,explanation,grid);hits.append(box);close.focus();}
function draw(){
 if(!data||!dealt||!entry||!preview&&!controller)return;
 canvas.width=stage.clientWidth;canvas.height=stage.clientHeight;
 const now=new Date(),clockDisplay=`${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
 model=controller?buildSanguoPlayModel(data,dealt,play,fixture.players,controller.round,entry.room,{width:canvas.width,height:canvas.height,selected:controller.selected,remaining:controller.remaining,clockDisplay,practiceBalance:walletMatch?.startBalance}):prepared?buildSanguoReadyModel(data,fixture,entry.room,{width:canvas.width,height:canvas.height}):buildSanguoDealtModel(data,dealt,fixture,entry.room,{width:canvas.width,height:canvas.height});
 if(controller)auto=controller.auto;
 model.menu??=buildSanguoMenu(dealt,model);
 const context=canvas.getContext('2d'),options={frames,images,fonts};context.clearRect(0,0,model.width,model.height);context.save();context.translate(model.width/2,model.height/2);context.scale(model.scale,model.scale);
 drawNativeNode(context,model.tree,options);drawNativeNode(context,model.title,options);drawNativeNode(context,model.subtitle,options);
 for(const ready of model.ready)drawNativeNode(context,ready.node,options);
 for(const profile of model.profiles){if(auto&&profile.player.sourceSeatIndex===0)findSanguoNode(profile.node,'captured-head').sprite.frame='trustee-head';drawNativeNode(context,profile.node,options);}
 if(model.dealer)sprite(context,model.dealer.frame,model.dealer.position[0],-model.dealer.position[1]);
 drawNativeNode(context,model.header,options);for(const node of model.tools||[])drawNativeNode(context,node,options);context.restore();
 if(controller){for(const tile of model.publicTiles)paintTile(context,tile);for(const tile of model.hand)paintTile(context,tile);}
 else{for(const tile of model.concealed||[])sprite(context,tile.body,tile.x,tile.y,tile.scale,tile.sprite?.body);for(const tile of model.hand||[]){sprite(context,tile.body,tile.x,tile.y,tile.scale,tile.sprite?.body);sprite(context,tile.face,tile.x+tile.faceOffset[0]*tile.scale[0],tile.y-tile.faceOffset[1]*tile.scale[1],tile.scale,tile.sprite?.face);}}
 if(auto){const shade=images.get('trustee-bg');context.drawImage(shade,0,model.height-128*model.scale,model.width,128*model.scale);}
 if(!panel.hidden){context.save();context.translate(model.width/2,model.height/2);context.scale(model.scale,model.scale);drawNativeNode(context,model.menu.tree,options);context.restore();}
 place(menu,model.menuRect);for(const item of model.menu.buttons)place($('#'+item.id),item.rect);
 $('#table-tools').hidden=prepared;for(const item of model.toolButtons||[])place($('#'+item.id),item.rect);
 const scale=model.scale;Object.assign(panelHost.style,{left:(model.width-1280*scale)/2+'px',top:(model.height-640*scale)/2+'px',transform:`scale(${scale})`});
 const cancel=$('#cancel-trustee');cancel.hidden=!auto;place(cancel,{x:model.width/2-100*scale,y:model.height-128*scale,width:200*scale,height:64*scale});cancel.style.fontSize=27*scale+'px';
 stage.setAttribute('aria-label',controller?'三国麻将本地牌局':prepared?'三国麻将准备牌桌':'三国麻将发牌画面预览');
 canvas.setAttribute('aria-label',`${fixture.title}，${entry.room.name}，${model.subtitle.label._string}，${controller?`你的手牌${controller.round.hands[0].length}张，剩牌${controller.round.wall.length}张，${controller.status}`:prepared?'自己、上家、对家已准备，下家等待准备':'十三张英雄手牌，另外三家各十三张牌背，剩牌82张'}${auto?'，托管中':''}`);
 if(controller)renderPlayControls();if(dialogKind!=='live-recorder')drawDialog();
}
menu.onclick=()=>setMenu(panel.hidden);dismiss.onclick=()=>setMenu(false);
$('#table-rules').onclick=()=>{setMenu(false);rules.show(911);};$('#table-fan').onclick=()=>rules.show(911);
$('#table-exit').onclick=()=>{setMenu(false);exit.show();};
$('#table-settings').onclick=()=>{setMenu(false);settings??=createNativeHallPanels(stage);settings.show('settings');};
$('#table-trustee').onclick=()=>{if(controller)controller.setAuto(!controller.auto);else if(!prepared)auto=!auto;setMenu(false);};$('#cancel-trustee').onclick=()=>{if(controller)controller.setAuto(false);auto=false;draw();};
$('#table-timeout').onclick=()=>showDialog('timeout');$('#table-recorder').onclick=showRecorder;
$('#table-chat').onclick=()=>tablePanels.chat();$('#table-ledger').onclick=()=>tablePanels.ledger(controller?.round??{scores:[0,0,0,0],huEvents:[],kongPayments:[],log:[]});
addEventListener('resize',draw);addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(dialogKind)closeDialog();else if(!panel.hidden){setMenu(false);menu.focus();}});
try{
 if(!entry)throw Error('未找到这个三国场次。');
 const response=await Promise.all(['table.json','frames.json','dealt.json','dealt-frames.json','play.json','play-frames.json'].map(async file=>{const result=await fetch(new URL('sanguo-table-study/'+file,BASE));if(!result.ok)throw Error('三国牌桌资料加载失败');return result.json();}));
 data=response[0];dealt=response[2];play=response[4];const list=[...new Map([...response[1],...response[3],...response[5]].map(frame=>[frame.uuid,frame])).values()];frames=new Map(list.map(frame=>[frame.uuid,frame]));images=new Map(await Promise.all(list.map(async frame=>[frame.uuid,await image(frame.image)])));
 for(const player of fixture.players){const bitmap=await image(player.avatar),uuid=`avatar-${player.sourceSeatIndex}`;frames.set(uuid,{uuid,rect:[0,0,bitmap.naturalWidth,bitmap.naturalHeight],originalSize:[bitmap.naturalWidth,bitmap.naturalHeight],offset:[0,0]});images.set(uuid,bitmap);}
 for(const [uuid,file]of[['trustee-bg','trustee-study/game-140-trustee_bg.png'],['trustee-head','trustee-study/common-245-head_trustee.png']]){const bitmap=await image(file);frames.set(uuid,{uuid,rect:[0,0,bitmap.naturalWidth,bitmap.naturalHeight],originalSize:[bitmap.naturalWidth,bitmap.naturalHeight],offset:[0,0]});images.set(uuid,bitmap);}
 fonts=new Map(Object.entries(data.fonts).map(([uuid,value])=>[uuid,{size:value.size,glyphs:value.config.fontDefDictionary,image:images.get(value.frame)}]));
 if(!preview){walletMatch=await practiceWallet.start('sanguo',entry.room.id,error=>noticeText(error.message));const fast=query.get('pace')==='fast';controller=createSanguoController({room:entry.room,roundFactory:()=>walletMatch.round,onAction:playRoundAudio,interval:fast?30:200,speed:fast?50:600,onChange:()=>{if(controller)draw();},isPaused,onNotice:noticeText,onEnd:async round=>{try{await walletMatch.finish();settlement.show({scores:round.scores,profiles:[0,1,2,3].map(seat=>{const player=fixture.players.find(player=>player.seat===seat);return{name:['你','阿唐','林先生','小苏'][seat],avatar:player.avatar,rankName:player.rankName,level:player.rankLevel};}),room:{variant:{name:'三国麻将 · 本地练习'},room:entry.room},details:{round},practice:true});}catch(error){noticeText(error.message);}}});}
 draw();status.hidden=true;
}catch(error){status.textContent=error.message;const back=document.createElement('a');back.href='rooms.html?mode=sanguo';back.textContent='返回场次';status.append(' ',back);}
addEventListener('pagehide',()=>{controller?.dispose();controlFX.destroy();tablePanels.close();settings?.dispose();settlement.destroy();});

async function restartPractice(){starting=true;draw();try{walletMatch=await practiceWallet.start('sanguo',entry.room.id,error=>noticeText(error.message));controller.reset();}finally{starting=false;draw();}}

function playRoundAudio(event){for(const value of event.discarded){void playGameSound('outtile');if(value>=17&&value<=25)void playGameSound('1-'+(value-16));else if(value>=33&&value<=41)void playGameSound('2-'+(value-32));}for(const action of new Set(event.actions.map(action=>action.action==='qgh'?'hu':action.action)))void playGameSound('action-result-study/audio/'+action+'.mp3');if(event.seal)void playGameSound('action-result-study/audio/gang.mp3');if(event.dig)void playGameSound('draw');}
