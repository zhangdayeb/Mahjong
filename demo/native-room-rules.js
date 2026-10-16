import {liveRulebook} from './live-rulebook.js';
import {ROOM_RULE_SOURCE} from './native-room-rule-source.js';
export {ROOM_RULE_SOURCE};
const BASE=new URL('.',import.meta.url),nativeNodes=ROOM_RULE_SOURCE.prefabs[746];
const sourceNode=name=>nativeNodes.find(n=>n.name===name);
const sourceImage=name=>new URL(sourceNode(name).sprite.frame.image,BASE).href;
export function resolveRoomRule(config,mode='red'){
 const request=typeof mode==='object'?(mode.gameType??mode.id??mode.mode):mode;
 const gameType=ROOM_RULE_SOURCE.roomMappings[request]?.gameType??(Number.isInteger(Number(request))?Number(request):null);
 if(gameType===null)return null;
 // RuleView gives an exact entry priority over its rulePair fallback.
 const id=config[gameType]?String(gameType):String(config.rulePair?.[gameType]??'');
 return config[id]?{id,gameType,...config[id]}:null;
}
export function roomRuleBlocks(lines=[]){
 const blocks=[];let text=[];
 const flush=()=>{if(text.length){blocks.push({type:'text',text:text.join('\n')});text=[];}};
 for(const line of lines)if(line.startsWith('<pic>')){flush();blocks.push({type:'picture',value:line.slice(5)});}else text.push(line.replace(/<\/?color(?:=[#a-f0-9]+)?>/gi,''));
 flush();return blocks;
}
// Port RuleHallTemplatePic.show: scale .8 does not change its cursor widths;
// the separate 8px accumulator and four-tile stack placement do.
export function nativeRulePicture(value,map){
 let cursor=-340,indent=8,afterStack=false,index=0;const tiles=[];
 for(const group of value.replace(/^<pic>/,'').split('#')){
  const tokens=group.split('|').filter(Boolean);
  for(let j=0;j<tokens.length;j++){
   const token=tokens[j],parts=token.split('_'),raw=Number(parts.at(-1)),mode=parts.length>1?Number(parts[0]):0,code=raw%1000,front=raw<1000,stack=tokens.length===4&&j===2,width=code<0?16:48;
   let x=cursor,y=0;if(stack){x=cursor-width+8;y=front?-6:9;}else cursor+=width;
   if(afterStack){x+=7;afterStack=false;}if(stack)afterStack=true;
   x=x-indent+348;indent+=8;
   const face=(mode===908||mode===911)&&map.sanguo[code]?map.sanguo[code]:map.standard[code];
   tiles.push({index:index++,token,code,front,stack,gap:code<0,x,y,width:width*.8,height:56.8,faceOffset:front?0:-6.4,body:code===0?map.standard[front?201:202]:code>0?map.standard[front?301:302]:null,face:code>0?face:null});
  }
 }
 return tiles;
}
export function roomRulesLayout(width=1104,height=554){const scale=Math.min(width/1280,height/720);return {width,height,scale,panel:{width:950,height:600},view:{x:75,y:155.227,width:800,height:410},tabs:{x:296.8,y:92.433,width:356.4,height:40.5},text:{left:75,width:660,fontSize:22,lineHeight:40,baselinePadding:10.4},picture:{left:65,width:680,height:56.8}};}

export function createRoomRules(parent,{mode='red',onTeach,liveRules=false,width=parent?.clientWidth||1104,height=parent?.clientHeight||554}={}){
 if(!parent)throw Error('Room rules require their stage parent');
 if(!document.querySelector('link[data-native-room-rules]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('native-room-rules.css',BASE).href;link.dataset.nativeRoomRules='';document.head.append(link);}
 const layout=roomRulesLayout(width,height),layer=document.createElement('div');layer.className='native-room-rule-layer';layer.hidden=true;
 const mask=document.createElement('button');mask.className='native-room-rule-mask';mask.setAttribute('aria-label','点击遮罩关闭玩法规则');mask.type='button';
 const panel=document.createElement('section');panel.className='native-room-rule-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','玩法规则');panel.tabIndex=-1;panel.style.setProperty('--native-room-rule-scale',layout.scale);
 const bg=document.createElement('div');bg.className='native-room-rule-bg';bg.style.borderImageSource=`url("${sourceImage('bg')}")`;
 const titleBar=document.createElement('img');titleBar.className='native-room-rule-titlebar';titleBar.src=sourceImage('bg_title');titleBar.alt='';
 const title=document.createElement('h2');title.textContent='玩法规则';title.className='native-room-rule-title';
 // lab_title is fonts235 fnt_biaotiz-export, not a system-font/bold label.
 // Its original glyphs overlap by xAdvance and extend beyond the32px node.
 const titleReady=fetch(new URL('room-rule-study/native-title-font.json',BASE)).then(r=>{if(!r.ok)throw Error('原规则标题字体加载失败');return r.json();}).then(async font=>{
  const atlas=new Image();atlas.src=new URL(font.frame.image,BASE).href;await atlas.decode();
  const ratio=font.fontSize/font.fontAssetSize,chars=[...font.text];let cursor=0,width=0,height=0;
  for(const ch of chars){const g=font.glyphs[ch];width=Math.max(width,cursor+g.xOffset+g.rect.width);height=Math.max(height,g.yOffset+g.rect.height);cursor+=g.xAdvance;}
  const canvas=document.createElement('canvas');canvas.className='native-room-rule-title-bitmap';canvas.width=Math.ceil(width);canvas.height=Math.ceil(height);canvas.style.width=width*ratio+'px';canvas.style.height=height*ratio+'px';canvas.setAttribute('aria-hidden','true');
  const context=canvas.getContext('2d');cursor=0;for(const ch of chars){const g=font.glyphs[ch],r=g.rect;context.drawImage(atlas,r.x,r.y,r.width,r.height,cursor+g.xOffset,g.yOffset,r.width,r.height);cursor+=g.xAdvance;}
  title.setAttribute('aria-label',font.text);title.replaceChildren(canvas);title.dataset.nativeFont=font.source.fontUUID;return font;
 }).catch(()=>null);
 const closeButton=document.createElement('button');closeButton.className='native-room-rule-close';closeButton.setAttribute('aria-label','关闭玩法规则');closeButton.type='button';const closeIcon=document.createElement('img');closeIcon.src=sourceImage('close3');closeIcon.alt='';closeButton.append(closeIcon);
 const tabs=document.createElement('div');tabs.className='native-room-rule-tabs';tabs.setAttribute('role','tablist');
 const viewport=document.createElement('div');viewport.className='native-room-rule-scroll';viewport.setAttribute('role','tabpanel');viewport.tabIndex=0;
 panel.append(bg,titleBar,title,closeButton,tabs,viewport);layer.append(mask,panel);parent.append(layer);
 const tabDefs=[['BASERULE','基本规则'],['CUSTOMRULE','可选规则'],['FANRULE','番型说明']],off=new URL('room-rule-study/assets/common-102.png',BASE).href,on=new URL('room-rule-study/assets/common-432.png',BASE).href;
 let config,map,selected,tab='FANRULE',showVersion=0,returnFocus=null,drag=null;
 const ruleReady=Promise.all(['rule-study/RuleCfg.json','rule-study/tile-code-map.json'].map(path=>fetch(new URL(path,BASE)).then(r=>{if(!r.ok)throw Error('规则资料加载失败');return r.json();}))).then(([rules,tiles])=>{config=rules;map=tiles;return {config,map};});
 const ready=Promise.all([ruleReady,titleReady]).then(([data])=>data);
 function image(name,cls){const img=document.createElement('img');img.className=cls;img.src=new URL('rule-study/assets/'+name+'.png',BASE).href;img.alt='';return img;}
 function picture(value){const row=document.createElement('div');row.className='native-room-rule-picture';row.setAttribute('aria-label','原版配牌示例');const items=nativeRulePicture(value,map);row.dataset.tileCount=items.filter(item=>!item.gap).length;
  for(const item of items){if(item.gap)continue;const tile=document.createElement('span');tile.className='native-room-rule-tile';tile.style.cssText=`left:${item.x}px;top:${-item.y}px;width:${item.width}px;height:${item.height}px;--tile-reveal:${item.index*.02}s`;if(item.body)tile.append(image(item.body,'native-rule-tile-body'));if(item.face){const face=image(item.face,'native-rule-tile-face');face.style.top=item.faceOffset+'px';tile.append(face);}tile.title=item.token;row.append(tile);}return row;
 }
 function render(){if(!selected)return;tabs.replaceChildren();const defs=tabDefs.filter(([key])=>key!=='CUSTOMRULE'||selected.CUSTOMRULE?.length);tabs.style.width=defs.length*178.2+'px';tabs.style.left=(950-defs.length*178.2)/2+'px';
  for(const[key,label]of defs){const button=document.createElement('button');button.className='native-room-rule-tab';button.type='button';button.setAttribute('role','tab');button.setAttribute('aria-selected',String(tab===key));button.style.backgroundImage=`url("${tab===key?on:off}")`;const span=document.createElement('span');span.textContent=label;span.style.transform=`translateX(${key==='BASERULE'?5.58:key==='FANRULE'?1.89:-.486}px)`;button.append(span);button.onclick=()=>{tab=key;render();};tabs.append(button);}
  viewport.replaceChildren();for(const block of roomRuleBlocks(selected[tab]||[])){if(block.type==='picture')viewport.append(picture(block.value));else{const p=document.createElement('p');p.className='native-room-rule-text';p.textContent=block.text;viewport.append(p);}}viewport.scrollTop=0;
 }
 function close(){showVersion++;layer.hidden=true;drag=null;returnFocus?.isConnected&&returnFocus.focus?.();returnFocus=null;}
 function show(nextMode=mode){mode=nextMode;const version=++showVersion;if(layer.hidden)returnFocus=document.activeElement;layer.hidden=false;panel.focus();ready.then(()=>{if(version!==showVersion||layer.hidden)return;selected=liveRules?liveRulebook(mode):resolveRoomRule(config,mode);tab='FANRULE';if(selected){panel.dataset.ruleId=selected.id;render();}else{tabs.replaceChildren();viewport.textContent='暂无规则资料';}}).catch(error=>{if(version===showVersion&&!layer.hidden)viewport.textContent=error.message;});return ready;}
 closeButton.onclick=mask.onclick=close;layer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();event.preventDefault();close();}else if(event.key==='Tab'){const focusable=[...panel.querySelectorAll('button,[tabindex="0"]')],first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===panel)){event.preventDefault();last?.focus();}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===panel)){event.preventDefault();first?.focus();}}});
 viewport.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.button!==0)return;drag={id:event.pointerId,y:event.clientY,top:viewport.scrollTop,scale:panel.getBoundingClientRect().height/600};viewport.setPointerCapture?.(event.pointerId);viewport.classList.add('dragging');});
 viewport.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;viewport.scrollTop=drag.top-(event.clientY-drag.y)/drag.scale;event.preventDefault();});
 const endDrag=()=>{drag=null;viewport.classList.remove('dragging');};viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
 return {ready,show,close,get open(){return !layer.hidden;},teach(){onTeach?.(mode);},dispose(){close();layer.remove();}};
}
