import {liveRulebook} from './live-rulebook.js';
import {drawNativeNode} from './native-ui-canvas.js';
import {findHallNode,hallNodeRects} from './native-hall-panels.js';
import {nativeRulePicture,roomRuleBlocks,resolveRoomRule} from './native-room-rules.js';
const BASE=new URL('.',import.meta.url),tabNames={BASERULE:'基本规则',CUSTOMRULE:'可选规则',FANRULE:'番型说明'};
const observed=[{id:863,name:'血流红中'},{id:870,name:'6红中不洗牌'},{id:867,name:'血流红中2V2'},{id:849,name:'血流2V2'},{id:868,name:'血流6红中'},{id:149,name:'血流成河换三张'},{id:148,name:'血战到底换三张'}];
function walk(node,visit){visit(node);node.children.forEach(child=>walk(child,visit));}
export function hallRuleCatalog(source,config,games=[]){
 const types=new Map(source.gameTypes.map(item=>[String(item.typeID),item])),used=new Set(),entries=[];
 for(const entry of observed){const rule=resolveRoomRule(config,entry.id);if(!rule)continue;used.add(rule.id);entries.push({...entry,spell:types.get(String(entry.id))?.spellName||'',ruleID:rule.id});}
 for(const game of games){if(used.has(game.id))continue;const type=types.get(game.id),name=(type?.name||game.name).replace(/好友[桌局房]/g,'');if(/^规则编号|未命名玩法/.test(name))continue;used.add(game.id);entries.push({id:Number(game.id),ruleID:game.id,name,spell:type?.spellName||''});}
 return entries;
}
export function prepareHallRules(source,config,{gameType=863,tab='FANRULE',width=1280}={}){
 const scene=structuredClone(source.panels.rules.tree);scene.size=[width,720];findHallNode(scene,'mask').size[0]=width;
 const binding=source.panels.rules.bindings['ff805EKWotGzZ/FIRkn37Mj'],rule=resolveRoomRule(config,gameType),container=findHallNode(scene,'ToggleContainer');
 const visible=container.children.filter(node=>node.name!=='toggleDiyRule'||rule?.CUSTOMRULE?.length),total=visible.reduce((sum,node)=>sum+node.size[0],0);container.size[0]=total;let x=-total/2;
 for(const node of container.children){node.active=visible.includes(node);if(!node.active)continue;node.trs[0]=x+node.anchor[0]*node.size[0];x+=node.size[0];const key=node.components.find(component=>component.class==='cc.Toggle').events[0].customEventData;findHallNode(node,'checkmark').active=key===tab;}
 findHallNode(scene,binding.content.node).children=[];
 findHallNode(scene,26).children=[];findHallNode(scene,'scrollBar').active=false;
 return scene;
}

export function createNativeHallRules(parent,{onClose=()=>{},entries:customEntries,liveRules=false}={}){
 if(!parent)throw Error('Hall rules require a stage parent');
 if(!document.querySelector('link[data-native-hall-rules]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('native-hall-rules.css',BASE).href;link.dataset.nativeHallRules='';document.head.append(link);}
 const layer=document.createElement('section');layer.className='native-hall-rules';layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','玩法规则');
 const canvas=document.createElement('canvas'),hits=document.createElement('div'),menu=document.createElement('div'),view=document.createElement('div');canvas.className='native-hall-rule-canvas';hits.className='native-hall-rule-hits';menu.className='native-hall-rule-menu';menu.setAttribute('role','tablist');menu.setAttribute('aria-label','麻将玩法');view.className='native-hall-rule-view';view.setAttribute('role','tabpanel');view.tabIndex=0;layer.append(canvas,hits,menu,view);parent.append(layer);
 let data,config,tileMap,frames,images,fonts,entries=[],gameType=863,tab='FANRULE',width=1280,height=720,scale=1,rects,scene,returnFocus,disposed=false;
 const ready=Promise.all(['hall-rule-study/source.json','hall-rule-study/frames.json','rule-study/RuleCfg.json','rule-study/tile-code-map.json','rule-study/games.json'].map(file=>fetch(new URL(file,BASE)).then(response=>{if(!response.ok)throw Error('大厅规则原资源加载失败');return response.json();}))).then(async([source,frameData,rules,tiles,games])=>{
  data=source;config=rules;tileMap=tiles;frames=new Map(frameData.map(frame=>[frame.uuid,frame]));images=new Map(await Promise.all(frameData.map(async frame=>{const image=new Image();image.src=new URL(frame.image,BASE).href;await image.decode();return[frame.uuid,image];})));fonts=new Map(await Promise.all(source.fonts.map(async font=>{const image=new Image();image.src=new URL(font.image,BASE).href;await image.decode();return[font.uuid,{...font,image}];})));
  entries=customEntries||hallRuleCatalog(source,rules,games);if(!disposed&&!layer.hidden)render();return source;
 });
 function place(element,rect,unscaled=false){element.style.left=width/2+rect.left*scale+'px';element.style.top=height/2+rect.top*scale+'px';element.style.width=rect.width*(unscaled?1:scale)+'px';element.style.height=rect.height*(unscaled?1:scale)+'px';element.style.transform=unscaled?`scale(${scale})`:'';}
 function close(){if(layer.hidden)return;layer.hidden=true;returnFocus?.focus?.({preventScroll:true});onClose();}
 function hit(rect,label,callback,role,selected){const button=document.createElement('button');button.className='native-hall-rule-hit';button.type='button';button.setAttribute('aria-label',label);if(role){button.setAttribute('role',role);button.setAttribute('aria-selected',String(selected));}place(button,rect);button.onclick=callback;hits.append(button);return button;}
 function shrinkLabels(node,context){walk(node,n=>{if(n.label?._N$overflow!==2)return;const label=n.label,size=label._fontSize||40;context.font=`${size}px Arial`;const measured=context.measureText(label._string||'').width;if(measured>n.size[0]){label._fontSize=size*n.size[0]/measured;label._lineHeight=(label._lineHeight||size)*n.size[0]/measured;}});}
 function renderMenu(){const previous=menu.scrollTop;menu.replaceChildren();const template=data.templates.item,bind=template.bindings['01969aCGdBNIYJ66DtNEyuR'];
  for(const entry of entries){const button=document.createElement('button');button.type='button';button.className='native-hall-rule-game';button.setAttribute('role','tab');button.setAttribute('aria-label',entry.name);button.setAttribute('aria-selected',String(Number(entry.id)===Number(gameType)));const icon=document.createElement('canvas');icon.width=220;icon.height=80;icon.setAttribute('aria-hidden','true');button.append(icon);const item=structuredClone(template.tree),selected=Number(entry.id)===Number(gameType);if(item.sprite)item.sprite._enabled=selected;findHallNode(item,bind.n_choose.node).active=selected;findHallNode(item,bind.n_Com.node).active=!selected;
   for(const key of ['lab_comTitle','lab_choTitle'])findHallNode(item,bind[key].node).label._string=entry.name;for(const key of ['lab_comSpell','lab_choSpell'])findHallNode(item,bind[key].node).label._string=entry.spell||'';
   const context=icon.getContext('2d');shrinkLabels(item,context);context.translate(110,40);drawNativeNode(context,item,{frames,images,fonts});button.onclick=()=>{gameType=entry.id;tab='FANRULE';render();};menu.append(button);
  }menu.scrollTop=previous;
 }
 function image(name,cls){const image=document.createElement('img');image.src=new URL('rule-study/assets/'+name+'.png',BASE).href;image.className=cls;image.alt='';return image;}
 function renderBody(rule){view.replaceChildren();if(!rule)return;for(const block of roomRuleBlocks(rule[tab]||[])){
  if(block.type==='text'){const paragraph=document.createElement('p');paragraph.className='native-hall-rule-text';paragraph.textContent=block.text;view.append(paragraph);}
  else{const row=document.createElement('div');row.className='native-hall-rule-picture';row.setAttribute('aria-label','原版配牌示例');for(const tile of nativeRulePicture(block.value,tileMap)){if(tile.gap)continue;const node=document.createElement('span');node.className='native-hall-rule-tile';node.style.cssText=`left:${tile.x}px;top:${-tile.y}px;width:${tile.width}px;height:${tile.height}px;--reveal:${tile.index*.02}s`;if(tile.body)node.append(image(tile.body,'native-hall-rule-body'));if(tile.face){const face=image(tile.face,'native-hall-rule-face');face.style.top=tile.faceOffset+'px';node.append(face);}row.append(node);}view.append(row);}
 }view.scrollTop=0;}
 function render(){if(!data||!frames||!images||!fonts||layer.hidden||disposed)return;width=parent.offsetWidth||1280;height=parent.offsetHeight||720;scale=height/720;canvas.width=width;canvas.height=height;scene=prepareHallRules(data,config,{gameType,tab,width:width/scale});rects=hallNodeRects(scene);
  const context=canvas.getContext('2d');context.clearRect(0,0,width,height);context.save();context.translate(width/2,height/2);context.scale(scale,scale);drawNativeNode(context,scene,{frames,images,fonts});context.restore();hits.replaceChildren();
  const closeNode=findHallNode(scene,'btn_close');hit(rects.get(closeNode.id),'关闭玩法规则',close);
  for(const node of findHallNode(scene,'ToggleContainer').children)if(node.active){const key=node.components.find(component=>component.class==='cc.Toggle').events[0].customEventData;hit(rects.get(node.id),tabNames[key],()=>{tab=key;render();},'tab',tab===key);}
  place(menu,rects.get(20),true);place(view,rects.get(18),true);renderMenu();const rule=liveRules?liveRulebook(gameType):resolveRoomRule(config,gameType);view.setAttribute('aria-label',(entries.find(entry=>Number(entry.id)===Number(gameType))?.name||'')+' '+tabNames[tab]);layer.dataset.gameType=gameType;layer.dataset.ruleId=rule?.id||'';renderBody(rule);
 }
 function dragScroll(element){let drag;const end=()=>drag=null;element.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.button!==0)return;drag={id:event.pointerId,y:event.clientY,top:element.scrollTop,moved:false};});element.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const ratio=element.getBoundingClientRect().height/element.offsetHeight,delta=(event.clientY-drag.y)/ratio;if(Math.abs(delta)>4)drag.moved=true;if(drag.moved){element.scrollTop=drag.top-delta;element.setPointerCapture?.(event.pointerId);event.preventDefault();}});element.addEventListener('click',event=>{if(drag?.moved){event.preventDefault();event.stopImmediatePropagation();}},true);element.addEventListener('pointerup',()=>setTimeout(end,0));element.addEventListener('pointercancel',end);}
 dragScroll(menu);dragScroll(view);
 layer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}else if(event.key==='Tab'){const buttons=[...layer.querySelectorAll('button'),view],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(!layer.hidden)render();}):null;observer?.observe(parent);
 const api={ready,show(next=863){if(disposed)throw Error('Hall rules have been disposed');if(layer.hidden)returnFocus=document.activeElement;const requested=typeof next==='object'?(next.gameType??next.mode??next.id??863):next;gameType=requested==='red'?863:requested==='classic'?144:requested==='exchange'?149:Number(requested)||863;tab='FANRULE';layer.hidden=false;menu.scrollTop=0;return ready.then(()=>{render();hits.querySelector('button')?.focus({preventScroll:true});return api;});},close,get open(){return !layer.hidden;},get metadata(){return data;},get scene(){return scene;},get catalog(){return entries;},select(id){gameType=id;tab='FANRULE';render();},selectTab(key){if(tabNames[key]){tab=key;render();}},element:layer,canvas,dispose(){close();disposed=true;observer?.disconnect();layer.remove();}};return api;
}
