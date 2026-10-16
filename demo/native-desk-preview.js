import {drawNativeNode} from './native-ui-canvas.js';

const BASE=new URL('.',import.meta.url);
const aliases=new Map([
 ['304','304'],['0','304'],['四季常春','304'],['四季常青','304'],['zhuozi_sjcc','304'],['GameDeskIcon/zhuozi_sjcc','304'],['table3DBox_SJCC','304'],['sjcc','304'],
 ['305','305'],['1','305'],['繁星之夜','305'],['zhuozi_xingyue','305'],['GameDeskIcon/zhuozi_xingyue','305'],['table3DBox_FXZY','305'],['fxzy','305'],
 ['308','308'],['2','308'],['年兽迎福','308'],['zhuozi_tyss','308'],['GameDeskIcon/zhuozi_tyss','308'],['table3DBox_YX','308'],['tyss','308']
]);
export function resolveDeskPreviewKey(key){
 if(key&&typeof key==='object')key=key.id??key.icon??key.name??key.PrefabName;
 const result=aliases.get(String(key));if(!result)throw Error(`Unknown original desk preview: ${key}`);return result;
}
function make(tag,className){const node=document.createElement(tag);if(className)node.className=className;return node;}
function find(node,name){if(node.name===name)return node;for(const child of node.children||[]){const result=find(child,name);if(result)return result;}}

// Read-only original TablePreview scene. It never purchases or equips a desk.
export function createNativeDeskPreview(parent,{onClose=()=>{},channel='zxwyouxi'}={}){
 if(!parent)throw Error('Desk preview requires a stage parent');
 if(!document.querySelector('link[data-native-desk-preview]')){const css=make('link');css.rel='stylesheet';css.href=new URL('native-desk-preview.css',BASE).href;css.dataset.nativeDeskPreview='';document.head.append(css);}
 const layer=make('section','native-desk-preview');layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-label','牌桌预览');
 const canvas=make('canvas','native-desk-preview-canvas'),back=make('button','native-desk-preview-back');back.type='button';back.setAttribute('aria-label','关闭牌桌预览，返回商城');back.onclick=close;
 layer.append(canvas,back);parent.append(layer);
 let data,frames,images,fonts,key='304',open=false,disposed=false,width=1104,height=554,previousFocus;
 const ready=Promise.all(['preview.json','frames.json'].map(file=>fetch(new URL('desk-preview-study/'+file,BASE)).then(response=>{if(!response.ok)throw Error('Original desk preview assets unavailable');return response.json();}))).then(async([metadata,frameData])=>{
  data=metadata;frames=new Map(frameData.map(frame=>[frame.uuid,frame]));
  images=new Map(await Promise.all(frameData.map(async frame=>{const image=new Image();image.src=new URL(frame.image,BASE).href;await image.decode();return[frame.uuid,image];})));
  fonts=new Map(await Promise.all(data.fonts.map(async font=>{const image=new Image();image.src=new URL(font.image,BASE).href;await image.decode();return[font.uuid,{...font,image}];})));
  if(!disposed)resize();return data;
 });
 function draw(){
  if(!data||!frames||!images||!fonts||disposed)return;
  const context=canvas.getContext('2d'),scale=height/720,worldWidth=width/scale;
  context.clearRect(0,0,width,height);context.save();context.translate(width/2,height/2);context.scale(scale,scale);
  const table=data.tables.find(table=>table.key===key),scene=structuredClone(data.tree),root=find(scene,'Root'),load=find(scene,'LoadPre');
  const desk=structuredClone(table.tree);desk.trs[0]=desk.trs[1]=0;
  const texture=find(desk,'texture');texture.size[1]=table.runtime.textureHeight;texture.trs[0]=table.runtime.texturePosition[0];texture.trs[1]=table.runtime.texturePosition[1];texture.sprite._sizeMode=0;
  const watermark=find(desk,'logo');watermark.active=channel==='wx.h5scmj';watermark.trs[0]=table.runtime.watermarkPosition[0];watermark.trs[1]=table.runtime.watermarkPosition[1];
  load.size=[worldWidth,720];load.children=[desk];root.size=[worldWidth,720];
  find(scene,'Default').active=false;find(scene,'Load').children=[structuredClone(table.countdown)];
  // Match the source close Widget: inset 0 normally, clamped to a 1380-wide area.
  const backNode=find(scene,'BtnBack'),inset=worldWidth>=1380?(worldWidth-1380)/2:0;backNode.trs[0]=-worldWidth/2+inset;
  drawNativeNode(context,scene,{frames,images,fonts});context.restore();
  back.style.left=inset*scale+'px';back.style.top=(360-backNode.trs[1]-backNode.size[1]/2)*scale+'px';back.style.width=backNode.size[0]*scale+'px';back.style.height=backNode.size[1]*scale+'px';
  canvas.setAttribute('aria-label',table.config.name+' 原牌桌大图');
 }
 function resize(){width=parent.offsetWidth||1104;height=parent.offsetHeight||554;canvas.width=width;canvas.height=height;draw();}
 function show(nextKey='304'){
  if(disposed)throw Error('Desk preview has been disposed');key=resolveDeskPreviewKey(nextKey);if(!open)previousFocus=document.activeElement;open=true;layer.hidden=false;layer.dataset.deskKey=key;
  return ready.then(()=>{if(open&&!disposed){resize();back.focus({preventScroll:true});}return api;});
 }
 function close(){if(!open)return;open=false;layer.hidden=true;previousFocus?.focus?.({preventScroll:true});onClose();}
 // Original Root cc.Button also invokes onClickClose; DeskPreTip says to tap anywhere.
 layer.addEventListener('click',close);
 layer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}else if(event.key==='Tab'){event.preventDefault();back.focus({preventScroll:true});}});
 addEventListener('resize',resize);const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(open)resize();}):null;observer?.observe(parent);
 const api={ready,show,close,get open(){return open;},get key(){return key;},get metadata(){return data;},element:layer,canvas,dispose(){close();disposed=true;observer?.disconnect();removeEventListener('resize',resize);layer.remove();}};return api;
}
