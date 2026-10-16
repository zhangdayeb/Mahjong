import { Node, UITransform, Graphics, Color, Label, Button, EditBox, Sprite, SpriteFrame, ScrollView, Vec2, resources, assetManager, Director, director, isValid, view } from 'cc';

export const W = 1280, H = 640;
export const PALETTE = { ink:'#245849', muted:'#638573', paper:'#fffbed', jade:'#397762', gold:'#dcbb69', dark:'#173e36', red:'#a8493b' };
export const color = (hex:string) => new Color().fromHEX(hex);
let root:Node|null=null;
let layer:HTMLDivElement|null=null;
let counter=0;
const accessible=new Map<Node,{element:HTMLButtonElement|HTMLInputElement|HTMLTextAreaElement,callback:()=>void}>();
const scrollRegions=new Map<Node,ScrollView>();
const frames=new Map<string,Promise<SpriteFrame>>();
const ownedFrames=new Set<SpriteFrame>();
let frameGeneration=0;
let activation:()=>void=()=>{};

export function setUIRoot(node:Node) { root=node; }
export function onActivate(callback:()=>void) {activation=callback;}
export function clearChildren(node:Node) { for(const child of [...node.children]) { removeAccessible(child); child.removeFromParent(); child.destroy(); } }
function removeAccessible(node:Node) { accessible.get(node)?.element.remove(); accessible.delete(node);scrollRegions.delete(node); for(const child of node.children)removeAccessible(child); }
export function box(parent:Node,name:string,x:number,y:number,w:number,h:number) {
  const node=new Node(name); node.layer=parent.layer; parent.addChild(node);
  const size=parent.getComponent(UITransform)?.contentSize;
  node.addComponent(UITransform).setContentSize(w,h);
  node.setPosition(x+w/2-(size?.width||W)/2,(size?.height||H)/2-y-h/2);
  return node;
}
export function panel(parent:Node,name:string,x:number,y:number,w:number,h:number,fill=PALETTE.paper,border=PALETTE.gold,radius=18) {
  const node=box(parent,name,x,y,w,h); const g=node.addComponent(Graphics);
  g.fillColor=color(fill);g.roundRect(-w/2,-h/2,w,h,radius);g.fill();
  if(border){g.lineWidth=1.4;g.strokeColor=color(border);g.roundRect(-w/2+1,-h/2+1,w-2,h-2,radius);g.stroke();}
  return node;
}
export function text(parent:Node,name:string,value:string,x:number,y:number,w:number,h:number,size=22,tint=PALETTE.ink,align=Label.HorizontalAlign.CENTER) {
  const node=box(parent,name,x,y,w,h);const label=node.addComponent(Label);
  label.string=value;label.fontSize=size;label.lineHeight=Math.ceil(size*1.4);label.color=color(tint);
  label.horizontalAlign=align;label.verticalAlign=Label.VerticalAlign.CENTER;label.overflow=Label.Overflow.SHRINK;
  label.fontFamily='Microsoft YaHei';label.isBold=false;return label;
}
export function button(parent:Node,name:string,value:string,x:number,y:number,w:number,h:number,callback:()=>void,options:{fill?:string;color?:string;border?:string;fontSize?:number,enabled?:boolean}={}) {
  const node=panel(parent,name,x,y,w,h,options.fill||PALETTE.paper,options.border===undefined?PALETTE.gold:options.border,Math.min(16,h/3));
  const label=text(node,name+'-label',value,0,0,w,h,options.fontSize||21,options.color||PALETTE.ink);
  const control=node.addComponent(Button);control.transition=Button.Transition.SCALE;control.zoomScale=.96;control.interactable=options.enabled!==false;
  if(!control.interactable)label.color=color('#8b9b90');
  node.on(Button.EventType.CLICK,()=>{if(control.interactable){activation();callback();}});
  addAccessible(node,value,callback);return node;
}
export function setButtonText(node:Node,value:string) {const label=node.getComponentInChildren(Label);if(label)label.string=value;const item=accessible.get(node);if(item){item.element.textContent=value;item.element.setAttribute('aria-label',value);}}
export function setButtonPressed(node:Node,value:boolean) {accessible.get(node)?.element.setAttribute('aria-pressed',String(value));}
export function setAccessibleName(node:Node,value:string) {accessible.get(node)?.element.setAttribute('aria-label',value);}
export function setButtonEnabled(node:Node,value:boolean) {const b=node.getComponent(Button);if(b)b.interactable=value;const label=node.getComponentInChildren(Label);if(label)label.color=color(value?PALETTE.ink:'#8b9b90');const item=accessible.get(node);if(item)item.element.disabled=!value;}
export function accessibleInput(input:EditBox,name:string,options:{multiline?:boolean}={}) {
  if(typeof document==='undefined')return;
  const element=options.multiline?document.createElement('textarea'):document.createElement('input');if(element.tagName==='INPUT')(element as HTMLInputElement).type='text';element.setAttribute('aria-label',name);element.maxLength=input.maxLength;element.value=input.string;
  isolateDOMInput(element);
  Object.assign(element.style,{position:'fixed',zIndex:'21',opacity:'0.001',border:'0',padding:'8px',boxSizing:'border-box',background:'#f3f1e4',color:PALETTE.ink,font:'21px Microsoft YaHei',borderRadius:'12px'});
  element.addEventListener('input',()=>{input.string=element.value;input.node.emit(EditBox.EventType.TEXT_CHANGED,input);});
  element.addEventListener('focus',()=>{element.style.opacity='1';if(input.textLabel)input.textLabel.node.active=false;});
  element.addEventListener('blur',()=>{element.style.opacity='0.001';if(input.textLabel)input.textLabel.node.active=true;});
  layer?.append(element);accessible.set(input.node,{element,callback:()=>{}});
}
function requestFrame(key:string,reload=false):Promise<SpriteFrame> {
  const generation=frameGeneration;
  const pending=new Promise<SpriteFrame>((resolve,reject)=>{
    const complete=(err:Error|null,frame:SpriteFrame)=>{
      if(err){reject(err);return;}
      if(generation!==frameGeneration){reject(new Error('界面已关闭，取消图片加载'));return;}
      if(!isValid(frame,true)){reject(new Error('加载的SpriteFrame已失效：'+key));return;}
      // A promise/JS variable does not count as a Cocos asset reference. The
      // shared UI cache owns its reference for the entire app lifetime, even
      // when a shorter-lived TableEffects instance releases the same frame.
      if(!ownedFrames.has(frame)){frame.addRef();ownedFrames.add(frame);}
      resolve(frame);
    };
    if(reload)assetManager.loadAny({path:key,type:SpriteFrame,bundle:resources.name},{reloadAsset:true},complete);
    else resources.load(key,SpriteFrame,complete);
  });
  frames.set(key,pending);
  void pending.catch(()=>{if(frames.get(key)===pending)frames.delete(key);});
  return pending;
}
async function cachedFrame(path:string):Promise<SpriteFrame> {
  const key=path.endsWith('/spriteFrame')?path:path+'/spriteFrame';
  const pending=frames.get(key)||requestFrame(key);
  const frame=await pending;
  if(isValid(frame,true))return frame;
  if(frames.get(key)===pending)frames.delete(key);
  const stale=frame as SpriteFrame;
  if(ownedFrames.delete(stale))stale.decRef(false);
  // Also bypass assetManager's cache when an external force-release destroyed
  // an object that had been cached before this ownership fix.
  return requestFrame(key,true);
}
export async function image(parent:Node,name:string,path:string,x:number,y:number,w:number,h:number) {
  const node=box(parent,name,x,y,w,h);const s=node.addComponent(Sprite);s.sizeMode=Sprite.SizeMode.CUSTOM;
  const generation=frameGeneration;
  try {const frame=await cachedFrame(path);if(generation===frameGeneration&&isValid(node,true)&&isValid(frame,true)){s.spriteFrame=frame;
      const face=path.startsWith('tiles/')&&path!=='tiles/back'&&path!=='tiles/body';
      const original=frame!.originalSize,factor=face?Math.min(w/original.width,h/original.height):1;
      node.getComponent(UITransform)!.setContentSize(face?original.width*factor:w,face?original.height*factor:h);}
  }catch(error){if(generation===frameGeneration&&isValid(node,true))console.warn('Image resource unavailable:',path,String(error));}return node;
}
export function overlay(parent:Node,name:string) {const node=box(parent,name,0,0,W,H);const g=node.addComponent(Graphics);g.fillColor=new Color(5,29,24,180);g.rect(-W/2,-H/2,W,H);g.fill();return node;}
export function scrollRegion(viewport:Node,scroll:ScrollView) {scrollRegions.set(viewport,scroll);}
function enclosingScroll(node:Node):ScrollView|null {let ancestor:Node|null=node;while(ancestor){const scroll=scrollRegions.get(ancestor);if(scroll)return scroll;ancestor=ancestor.parent;}return null;}
function scrollOffset(scroll:ScrollView) {const offset=scroll.getScrollOffset();return new Vec2(-offset.x,offset.y);}
function scrollPixels(scroll:ScrollView,start:Vec2,dx:number,dy:number) {
  const canvas=typeof document==='undefined'?null:document.querySelector('canvas');if(!canvas)return;
  const rect=canvas.getBoundingClientRect(),visible=view.getVisibleSize(),max=scroll.getMaxScrollOffset();
  scroll.scrollToOffset(new Vec2(scroll.horizontal?Math.max(0,Math.min(max.x,start.x-dx*visible.width/rect.width)):start.x,scroll.vertical?Math.max(0,Math.min(max.y,start.y-dy*visible.height/rect.height)):start.y),0);
}

// Web buttons expose the same Cocos actions to keyboard and screen-reader users.
// They follow scene geometry; native targets keep the Cocos Button components.
function addAccessible(node:Node,value:string,callback:()=>void) {
  if(typeof document==='undefined')return;
  if(!layer){layer=document.createElement('div');layer.id='lianzhuo-accessible-controls';layer.setAttribute('role','region');layer.setAttribute('aria-label','联桌麻将操作');document.body.append(layer);}
  const element=document.createElement('button');element.type='button';element.id='lz-control-'+(++counter);
  element.textContent=value;element.setAttribute('aria-label',value);
  element.disabled=!node.getComponent(Button)?.interactable;isolateDOMInput(element);
  Object.assign(element.style,{position:'fixed',zIndex:'20',opacity:'0.001',border:'0',padding:'0',margin:'0',background:'transparent',color:'transparent',cursor:'pointer',fontSize:'12px'});
  let drag:{scroll:ScrollView,x:number,y:number,start:Vec2}|null=null,suppressClick=false;
  element.addEventListener('pointerdown',event=>{suppressClick=false;const scroll=enclosingScroll(node);if(scroll){scroll.stopAutoScroll();drag={scroll,x:event.clientX,y:event.clientY,start:scrollOffset(scroll)};element.setPointerCapture(event.pointerId);}});
  element.addEventListener('pointermove',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(Math.hypot(dx,dy)>7)suppressClick=true;if(suppressClick)scrollPixels(drag.scroll,drag.start,dx,dy);});
  element.addEventListener('pointerup',()=>{drag=null;});element.addEventListener('pointercancel',()=>{drag=null;suppressClick=true;});
  element.addEventListener('wheel',event=>{const scroll=enclosingScroll(node);if(!scroll)return;event.preventDefault();const offset=scrollOffset(scroll);scrollPixels(scroll,offset,scroll.horizontal?-(Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY):0,scroll.vertical?-event.deltaY:0);},{passive:false});
  element.addEventListener('click',()=>{if(suppressClick){suppressClick=false;return;}const b=node.getComponent(Button);if(isValid(node)&&node.activeInHierarchy&&b?.interactable){activation();callback();}});
  element.addEventListener('focus',()=>{element.style.opacity='.9';element.style.outline='2px solid #dcbb69';element.style.color='transparent';});
  element.addEventListener('blur',()=>{element.style.opacity='0.001';element.style.outline='none';});
  layer.append(element);accessible.set(node,{element,callback});
}
function isolateDOMInput(element:HTMLElement) {
  // Cocos also listens for mouseup on window. One Web activation must produce
  // exactly one action, rather than both a DOM click and a scene input event.
  for(const name of ['pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','click','dblclick'])element.addEventListener(name,event=>event.stopPropagation());
}
export function updateAccessibility(blocked:Node|null=null) {
  if(typeof document==='undefined'||!root||!isValid(root))return;
  if(layer){layer.setAttribute('role',blocked?'dialog':'region');layer.setAttribute('aria-label',blocked?blocked.name.replace(/^Modal-/, ''):'联桌麻将操作');if(blocked)layer.setAttribute('aria-modal','true');else layer.removeAttribute('aria-modal');}
  const canvas=document.querySelector('canvas');if(!canvas)return;const rect=canvas.getBoundingClientRect(),visible=view.getVisibleSize();
  const origin=root.getWorldPosition();
  for(const[node,item]of accessible){
    if(!isValid(node)){item.element.remove();accessible.delete(node);continue;}
    let ancestor:Node|null=node,inside=!blocked;while(ancestor){if(ancestor===blocked)inside=true;ancestor=ancestor.parent;}
    const shown=node.activeInHierarchy&&inside;item.element.hidden=!shown;if(!shown)continue;
    const b=node.getComponent(Button);if(item.element.tagName==='BUTTON')item.element.disabled=!b?.interactable;
    const size=node.getComponent(UITransform)!.contentSize,pos=node.getWorldPosition();
    const width=size.width*Math.abs(node.worldScale.x),height=size.height*Math.abs(node.worldScale.y);
    const sx=rect.width/visible.width,sy=rect.height/visible.height;
    const left=rect.left+(visible.width/2+pos.x-origin.x-width/2)*sx,top=rect.top+(visible.height/2-pos.y+origin.y-height/2)*sy,right=left+width*sx,bottom=top+height*sy;
    let clipLeft=left,clipTop=top,clipRight=right,clipBottom=bottom,clipParent:Node|null=node.parent;
    while(clipParent){if(scrollRegions.has(clipParent)){const p=clipParent.getWorldPosition(),s=clipParent.getComponent(UITransform)!.contentSize,w=s.width*Math.abs(clipParent.worldScale.x)*sx,h=s.height*Math.abs(clipParent.worldScale.y)*sy,l=rect.left+(visible.width/2+p.x-origin.x)*sx-w/2,t=rect.top+(visible.height/2-p.y+origin.y)*sy-h/2;clipLeft=Math.max(clipLeft,l);clipTop=Math.max(clipTop,t);clipRight=Math.min(clipRight,l+w);clipBottom=Math.min(clipBottom,t+h);}clipParent=clipParent.parent;}
    if(clipRight<=clipLeft||clipBottom<=clipTop){item.element.hidden=true;continue;}
    Object.assign(item.element.style,{left:left+'px',top:top+'px',width:(width*sx)+'px',height:(height*sy)+'px',clipPath:`inset(${clipTop-top}px ${right-clipRight}px ${bottom-clipBottom}px ${clipLeft-left}px)`});
  }
}
export function announce(value:string) {if(typeof document==='undefined')return;let node=document.getElementById('lianzhuo-screen-status');if(!node){node=document.createElement('div');node.id='lianzhuo-screen-status';node.setAttribute('role','status');Object.assign(node.style,{position:'fixed',left:'0',bottom:'0',width:'1px',height:'1px',overflow:'hidden',opacity:'0.001',pointerEvents:'none'});document.body.append(node);}node.textContent=value;}
export function disposeUI() {
  for(const item of accessible.values())item.element.remove();accessible.clear();scrollRegions.clear();activation=()=>{};layer?.remove();layer=null;
  if(typeof document!=='undefined')document.getElementById('lianzhuo-screen-status')?.remove();root=null;
  frameGeneration++;frames.clear();
  const releasing=Array.from(ownedFrames);ownedFrames.clear();
  // App.onDestroy calls this while Cocos is tearing down the scene. Wait for
  // the following draw boundary; then decRef uses the engine's delayed asset
  // release instead of invalidating a renderer during its current batch.
  if(releasing.length)director.once(Director.EVENT_AFTER_DRAW,()=>{for(const frame of releasing)frame.decRef();});
}
