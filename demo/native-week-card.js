import {WEEK_CARD_SOURCE} from './native-week-card-source.js';
import {nativeSpriteDrawArgs} from './table-layout.js';
export {WEEK_CARD_SOURCE};
const BASE=new URL('.',import.meta.url),names=['初级','进阶','高级','大师'];
const rgba=(color,opacity=255)=>`rgba(${color&255},${color>>>8&255},${color>>>16&255},${opacity/255})`;
const compose=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];

export function weekCardLayout(width=1104,height=554){return {width,height,scale:Math.min(width/1280,height/720)};}

// Reproduce the native unpurchased-card branch, with unknown server fields
// represented by em dashes. No account state, prize values or prices are made up.
export function weekCardModel({variant='new',currency='coin',scroll=0,width=1104,height=554}={}){
 const prefab=variant==='old'?1804:709,nodes=WEEK_CARD_SOURCE.prefabs[prefab],layout=weekCardLayout(width,height),records=[];
 scroll=prefab===709?Math.max(0,Math.min(304,scroll)):0;currency=currency==='coin'?'coin':'zCoin';
 for(const node of nodes){
  const {name,path,parentIndex}=node,parent=records[parentIndex];let active=node.active,text=node.label?.text;
  const itemMatch=path.match(/\/item(\d+)(?:\/|$)/),itemIndex=itemMatch?Number(itemMatch[1]):null;
  const inItem=itemIndex!==null;
  if(name==='mask'||name==='slyder'||name==='title2'||name==='labelDownTimer'||name==='dailyBag'||/red_icon|dailyBagRed/.test(name))active=false;
  if(path.includes('/typeToggleContainer/')&&name==='checkmark')active=path.includes('/toggle1/')?currency==='zCoin':currency==='coin';
  if(inItem){
   if(['btnGetAward','btnGray','itemDownTimerBg','icon_discount','item_title2','pic_10','iconUse','labGetAway'].includes(name))active=false;
   if(['btnBuy','itemTitleBg','item_title','lab_money','lab_oldMoney'].includes(name))active=true;
   if(['icon_bag','iconGold','iconCoin','iconGold3','icon_bag2'].includes(name)){
    // Native zCoin is the 指尖币 tab; coin is the 游戏豆 tab. Node names
    // iconGold/icon_bag do not reliably identify the currency they display.
    if(name==='iconGold')active=prefab===1804||currency==='zCoin';
    else if(name==='iconCoin'||name==='iconGold3'||name==='icon_bag2')active=prefab===709&&currency==='coin';
    else if(name==='icon_bag')active=prefab===1804||currency==='zCoin';
   }
   if(name==='lab_money')text='—元购买';
   if(name==='lab_oldMoney')text='原价—元';
   if(name==='lab_time')text='每日赠送—次';
   if(name==='labGoldNum')text='—';
   if(name==='labGoldNum2')text=names[itemIndex]+'转盘';
   if(name==='labNum')text='x—';
   if(name==='labDesc2')text='周卡权益：—';
  }
  if(path.includes('/strLayout/')&&name==='labDesc')text='周卡预览';
  const position=node.position.slice();if(name==='content'&&prefab===709)position[0]-=scroll;
  const radians=node.angle*Math.PI/180,local=[Math.cos(radians)*node.scale[0],Math.sin(radians)*node.scale[0],-Math.sin(radians)*node.scale[1],Math.cos(radians)*node.scale[1],...position];
  const world=compose(parent?.world||[1,0,0,1,0,0],local);active=active&&(parent?.active??true);
  let clip=parent?.clip||null;
  if(node.mask){const center=[layout.width/2+world[4]*layout.scale,layout.height/2-world[5]*layout.scale];clip={x:center[0]-node.anchor[0]*node.size[0]*layout.scale,y:center[1]-(1-node.anchor[1])*node.size[1]*layout.scale,width:node.size[0]*layout.scale,height:node.size[1]*layout.scale};}
  records.push({...node,text,active,world,clip,opacity:node.opacity*(parent?.opacity??255)/255});
 }
 // The prefab also contains an invisible full-header btnClose hit region.
 // Expose the actual close icon once so the accessible controls match the UI.
 const controls=records.filter(node=>node.active&&(node.button||node.name==='toggle1'||node.name==='toggle2')&&(node.name!=='btnClose'||node.sprite?.frame&&!node.sprite.frame.missing)).map(node=>{
  const rect={x:layout.width/2+(node.world[4]-node.anchor[0]*node.size[0]*node.world[0])*layout.scale,y:layout.height/2-(node.world[5]+(1-node.anchor[1])*node.size[1]*node.world[3])*layout.scale,width:node.size[0]*Math.abs(node.world[0])*layout.scale,height:node.size[1]*Math.abs(node.world[3])*layout.scale};
  if(node.clip){const right=Math.min(rect.x+rect.width,node.clip.x+node.clip.width),bottom=Math.min(rect.y+rect.height,node.clip.y+node.clip.height);rect.x=Math.max(rect.x,node.clip.x);rect.y=Math.max(rect.y,node.clip.y);rect.width=right-rect.x;rect.height=bottom-rect.y;}
  const action=node.name==='btnClose'?'close':node.name==='toggle1'?'zCoin':node.name==='toggle2'?'coin':'preview';
  return {index:node.index,name:node.name,action,rect,label:action==='close'?'关闭指尖周卡':action==='zCoin'?'指尖币周卡':action==='coin'?'游戏豆周卡':node.name==='itemBg2_2'?'查看转盘预览':`${names[Number(node.path.match(/\/item(\d+)/)?.[1]??0)]}周卡，价格和权益待获取`,tab:action==='zCoin'||action==='coin',selected:currency===action};
 }).filter(control=>control.rect.width>0&&control.rect.height>0);
 return {...layout,prefab,variant,currency,scroll,maxScroll:prefab===709?304:0,records,controls,viewport:records.find(node=>node.mask&&node.path.includes('/uiScrollView/'))?.clip||null};
}

function drawBitmap(context,node,image){
 const font=node.label.font;if(!font?.config||!image)return false;const config=font.config,letters=[...node.text].map(char=>({char,glyph:config.fontDefDictionary[char.codePointAt(0)]}));
 if(letters.every(letter=>!letter.glyph))return false;
 // The source atlas has the fixed words and digits but no em dash. Keep its
 // native glyphs and use a half-em fallback only for the unknown-value marker.
 const scale=node.label.fontSize/font.size,total=letters.reduce((sum,letter)=>sum+(letter.glyph?.xAdvance??font.size/2)+node.label.spacing,0)*scale;
 let cursor=node.label.align===1?-total/2:node.label.align===2?node.size[0]*(1-node.anchor[0])-total:-node.size[0]*node.anchor[0];
 const top=-config.commonHeight*scale/2;
 for(const{char,glyph}of letters){if(glyph){const r=glyph.rect;if(r.width&&r.height)context.drawImage(image,r.x,r.y,r.width,r.height,cursor+glyph.xOffset*scale,top+glyph.yOffset*scale,r.width*scale,r.height*scale);}else{context.font=`${node.label.fontSize}px Arial,"Microsoft YaHei",sans-serif`;context.fillStyle=rgba(node.color);context.textAlign='left';context.textBaseline='middle';context.fillText(char,cursor,0,font.size*scale/2);}cursor+=((glyph?.xAdvance??font.size/2)+node.label.spacing)*scale;}return true;
}

export function drawWeekCard(context,model,images){
 context.clearRect(0,0,model.width,model.height);
 for(const node of model.records){
  if(!node.active||node.opacity<=0||(!node.sprite&&!node.label))continue;
  context.save();if(node.clip){context.beginPath();context.rect(node.clip.x,node.clip.y,node.clip.width,node.clip.height);context.clip();}
  const[a,b,c,d,x,y]=node.world,s=model.scale;context.transform(a*s,-b*s,-c*s,d*s,model.width/2+x*s,model.height/2-y*s);context.globalAlpha=node.opacity/255;
  const frame=node.sprite?.frame,image=frame&&images.get(frame.uuid);
  if(image&&!frame.missing){context.globalCompositeOperation=node.sprite.blend===1?'lighter':'source-over';context.drawImage(image,...nativeSpriteDrawArgs(frame,{...node.sprite,size:node.size,anchor:node.anchor}));}
  if(node.label){
   const fontUUID=node.label.font?.frame?.uuid;
   if(!drawBitmap(context,node,images.get(fontUUID+':'+node.color)||images.get(fontUUID))){context.font=`${node.label.bold?'bold ':''}${node.label.fontSize}px Arial,"Microsoft YaHei",sans-serif`;context.fillStyle=rgba(node.color);context.textAlign=['left','center','right'][node.label.align];context.textBaseline='middle';const tx=node.label.align===1?0:node.label.align===2?node.size[0]*(1-node.anchor[0]):-node.size[0]*node.anchor[0];
    if(node.label.outline){context.lineWidth=node.label.outline.width*2;context.strokeStyle=rgba(node.label.outline.color);context.strokeText(node.text,tx,0);}context.fillText(node.text,tx,0);
   }
  }
  context.restore();
 }
}

export function createNativeWeekCard(parent,{width=parent?.clientWidth||1104,height=parent?.clientHeight||554,variant='new',currency='coin'}={}){
 if(!parent)throw Error('Native week card requires its stage parent');
 if(!document.querySelector('link[data-native-week-card]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('native-week-card.css',BASE).href;link.dataset.nativeWeekCard='';document.head.append(link);}
 const layer=document.createElement('div');layer.className='native-week-card-layer';layer.hidden=true;
 const mask=document.createElement('button');mask.className='native-week-card-mask';mask.type='button';mask.setAttribute('aria-label','关闭周卡预览');
 const panel=document.createElement('section');panel.className='native-week-card-panel';panel.tabIndex=-1;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','指尖周卡');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.className='native-week-card-canvas';
 const controls=document.createElement('div');controls.className='native-week-card-controls';const scroller=document.createElement('div');scroller.className='native-week-card-scroll';scroller.tabIndex=0;scroller.setAttribute('aria-label','左右拖动查看周卡');
 const message=document.createElement('div');message.className='native-week-card-message';message.setAttribute('role','status');message.hidden=true;
 panel.append(canvas,scroller,controls,message);layer.append(mask,panel);parent.append(layer);
 const images=new Map();let scroll=0,model=null,returnFocus=null,disposed=false,version=0,drag=null,messageTimer=0;
 const ready=Promise.all(WEEK_CARD_SOURCE.frames.map(async frame=>{const img=new Image();img.src=new URL(frame.image,BASE).href;await img.decode();if(!disposed)images.set(frame.uuid,img);})).then(()=>{
  if(disposed)return;
  for(const node of Object.values(WEEK_CARD_SOURCE.prefabs).flat()){
   const font=node.label?.font,frame=font?.frame,image=images.get(frame?.uuid),key=frame?.uuid+':'+node.color;
   if(!image||node.color===0xffffffff||images.has(key))continue;
   // Native bitmap glyphs are tinted by cc.Label's node color. Preserve atlas
   // alpha while multiplying its RGB, instead of drawing white digits/words.
   const tint=document.createElement('canvas');[tint.width,tint.height]=frame.originalSize;const ctx=tint.getContext('2d');ctx.drawImage(image,0,0);ctx.globalCompositeOperation='multiply';ctx.fillStyle=rgba(node.color);ctx.fillRect(0,0,tint.width,tint.height);ctx.globalCompositeOperation='destination-in';ctx.drawImage(image,0,0);images.set(key,tint);
  }
 });
 const setRect=(node,rect)=>Object.assign(node.style,{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px'});
 function toast(){message.textContent='当前为本地预览，价格与权益待获取。';message.hidden=false;clearTimeout(messageTimer);messageTimer=setTimeout(()=>message.hidden=true,2400);}
 function render({keepFocus=false}={}){
  if(disposed)return;const focusAction=keepFocus?document.activeElement?.dataset?.action:null;model=weekCardModel({variant,currency,scroll,width,height});drawWeekCard(canvas.getContext('2d'),model,images);controls.replaceChildren();
  const tabs=document.createElement('div');tabs.className='native-week-card-tabs';tabs.setAttribute('role','tablist');controls.append(tabs);
  for(const control of model.controls){const button=document.createElement('button');button.type='button';button.className='native-week-card-control';button.dataset.action=control.action;button.setAttribute('aria-label',control.label);setRect(button,control.rect);if(control.tab){button.setAttribute('role','tab');button.setAttribute('aria-selected',String(control.selected));tabs.append(button);}else controls.append(button);
   button.onclick=()=>{if(control.action==='close')close();else if(control.tab){currency=control.action;scroll=0;render({keepFocus:true});}else toast();if(focusAction===control.action)button.focus();};
  }
  scroller.hidden=!model.viewport;if(model.viewport)setRect(scroller,model.viewport);
  if(focusAction)controls.querySelector(`[data-action="${focusAction}"]`)?.focus();
 }
 function close(){version++;layer.hidden=true;drag=null;message.hidden=true;clearTimeout(messageTimer);if(returnFocus?.isConnected)returnFocus.focus?.();returnFocus=null;}
 async function show(options={}){if(disposed)return;if(typeof options==='string')options={currency:options};if(options.currency)currency=options.currency==='coin'?'coin':'zCoin';if(options.variant)variant=options.variant==='old'?'old':'new';scroll=0;const current=++version;if(layer.hidden)returnFocus=document.activeElement;layer.hidden=false;panel.focus();await ready;if(current===version&&!layer.hidden)render();}
 function moveScroll(delta){if(!model||!model.maxScroll)return;scroll=Math.max(0,Math.min(model.maxScroll,scroll+delta));render();}
 scroller.addEventListener('pointerdown',event=>{if(event.button!==0&&event.pointerType!=='touch')return;drag={id:event.pointerId,x:event.clientX,scroll,scale:model.scale*(parent.getBoundingClientRect().width/width)};scroller.setPointerCapture?.(event.pointerId);});
 scroller.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;scroll=Math.max(0,Math.min(model.maxScroll,drag.scroll-(event.clientX-drag.x)/drag.scale));render();event.preventDefault();});
 const endDrag=()=>drag=null;scroller.addEventListener('pointerup',endDrag);scroller.addEventListener('pointercancel',endDrag);
 scroller.addEventListener('wheel',event=>{if(model?.maxScroll){moveScroll((Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)/model.scale);event.preventDefault();}},{passive:false});
 scroller.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();moveScroll(event.key==='ArrowLeft'?-100:100);}});
 layer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}else if(event.key==='Tab'){const focusable=[...panel.querySelectorAll('button:not([hidden]),[tabindex="0"]')].filter(node=>!node.hidden),first=focusable[0],last=focusable.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===panel)){event.preventDefault();last?.focus();}else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===panel)){event.preventDefault();first?.focus();}}});
 mask.onclick=close;
 return {ready,show,close,get open(){return !layer.hidden;},get model(){return model;},dispose(){disposed=true;close();layer.remove();images.clear();}};
}
