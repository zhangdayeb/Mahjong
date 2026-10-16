const BASE=new URL('.',import.meta.url);
export function exitNineSliceRegions(size,target,capInsets){
 const [width,height]=size,[outWidth,outHeight]=target,[left,top,right,bottom]=capInsets;
 const x=[0,left,width-right,width],y=[0,top,height-bottom,height],dx=[0,left,outWidth-right,outWidth],dy=[0,top,outHeight-bottom,outHeight],regions=[];
 for(let row=0;row<3;row++)for(let column=0;column<3;column++)regions.push({source:[x[column],y[row],x[column+1]-x[column],y[row+1]-y[row]],target:[dx[column],dy[row],dx[column+1]-dx[column],dy[row+1]-dy[row]]});
 return regions;
}
export function exitBitmapLayout(font,label){
 const scale=label.fontSize/font.size,letters=[];let advance=0,width=0;
 for(const character of label.text){const glyph=font.glyphs[character.charCodeAt(0)];if(!glyph)continue;
  letters.push({character,rect:glyph.rect,x:advance+glyph.xOffset*scale,y:glyph.yOffset*scale,width:glyph.rect.width*scale,height:glyph.rect.height*scale});
  width=advance+(glyph.xOffset+glyph.rect.width)*scale;advance+=glyph.xAdvance*scale+label.spacing;
 }
 const horizontal=(label.size[0]-width)/2,vertical=(label.size[1]-label.fontSize)/2;
 return letters.map(letter=>({...letter,x:letter.x+horizontal,y:letter.y+vertical}));
}
const make=(tag,className)=>{const element=document.createElement(tag);if(className)element.className=className;return element;};
export function createExitConfirm(parent,{onExit=()=>{},onClose=()=>{},message}={}){
 if(!parent)throw Error('Exit confirmation requires a stage parent');
 const cssUrl=new URL('native-exit.css',BASE).href;
 if(!document.querySelector('link[data-native-exit]')){const css=make('link');css.rel='stylesheet';css.href=cssUrl;css.dataset.nativeExit='';document.head.append(css);}
 const overlay=make('div','native-exit');overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','退出游戏确认');parent.append(overlay);
 const content=make('div','native-exit-content');overlay.append(content);
 let open=false,disposed=false,previousFocus,metadata,focusButton;
 function place(element,geometry,center,parentPosition=[0,0]){
  const [width,height]=geometry.size,x=center[0]+parentPosition[0]+geometry.position[0],y=center[1]-parentPosition[1]-geometry.position[1];
  element.style.width=width+'px';element.style.height=height+'px';element.style.left=(x-width*geometry.anchor[0])+'px';element.style.top=(y-height*(1-geometry.anchor[1]))+'px';
  if(geometry.scale[0]!==1||geometry.scale[1]!==1)element.style.transform=`scale(${geometry.scale[0]},${geometry.scale[1]})`;
 }
 function loadImage(file){const image=new Image();image.src=new URL(file,BASE).href;return image.decode().then(()=>image);}
 const ready=fetch(new URL('exit-study/exit.json',BASE)).then(response=>{if(!response.ok)throw Error('Native exit metadata unavailable');return response.json();}).then(async data=>{
  if(message)data={...data,text:{...data.text,local:message}};
  metadata=data;const files=[data.background.image,data.title.image,data.font.image,...Object.values(data.buttons).map(button=>button.image)],images=new Map(await Promise.all(files.map(async file=>[file,await loadImage(file)])));
  if(disposed)return data;
  const center=data.content.size.map(value=>value/2);content.style.width=data.content.size[0]+'px';content.style.height=data.content.size[1]+'px';content.style.setProperty('--native-exit-scale',Math.min(1280/data.design[0],640/data.design[1]));overlay.style.background=`rgba(0,0,0,${data.mask.opacity/255})`;
  const background=make('canvas','native-exit-background');background.width=data.background.size[0];background.height=data.background.size[1];place(background,data.background,center);
  const context=background.getContext('2d');for(const region of exitNineSliceRegions(data.background.sourceSize,data.background.size,data.background.capInsets))context.drawImage(images.get(data.background.image),...region.source,...region.target);
  const title=make('img','native-exit-title');title.src=images.get(data.title.image).src;title.alt='';place(title,data.title,center);
  const titleLabel=make('canvas','native-exit-title-label');titleLabel.width=data.titleLabel.size[0];titleLabel.height=60;titleLabel.setAttribute('aria-label',data.titleLabel.text.trim());place(titleLabel,{...data.titleLabel,size:[data.titleLabel.size[0],60]},center,[data.title.position[0]+data.titleParent.position[0],data.title.position[1]+data.titleParent.position[1]+10]);
  // The original 40px label has 52px bitmap glyphs that overflow its bounds.
  // Keep the original label top while extending its transparent canvas to 60px.
  titleLabel.style.top=(center[1]-data.title.position[1]-data.titleParent.position[1]-data.titleLabel.position[1]-data.titleLabel.size[1]/2)+'px';
  const titleContext=titleLabel.getContext('2d');for(const glyph of exitBitmapLayout(data.font,data.titleLabel)){const rect=glyph.rect;if(rect.width&&rect.height)titleContext.drawImage(images.get(data.font.image),rect.x,rect.y,rect.width,rect.height,glyph.x,glyph.y,glyph.width,glyph.height);}
  const text=make('canvas','native-exit-text');text.setAttribute('aria-label',data.text.local);text.textContent=data.text.local;text.width=data.text.maxWidth;
  const textContext=text.getContext('2d');textContext.font=`${data.text.fontSize}px ${data.text.fontFamily}`;let line='';const lines=[];
  for(const character of data.text.local){if(line&&textContext.measureText(line+character).width>data.text.maxWidth){lines.push(line);line=character;}else line+=character;}if(line)lines.push(line);
  const textHeight=lines.length*data.text.lineHeight+data.text.lineHeight*.26;text.height=Math.ceil(textHeight);place(text,{...data.text,size:[data.text.maxWidth,textHeight]},center);textContext.font=`${data.text.fontSize}px ${data.text.fontFamily}`;textContext.fillStyle=data.text.color;textContext.textBaseline='alphabetic';
  const childHeight=data.text.lineHeight*1.26,baseline=data.text.fontSize*.87-(data.text.fontSize-childHeight)/2;
  lines.forEach((line,index)=>textContext.fillText(line,0,baseline+index*data.text.lineHeight));
  content.append(background,title,titleLabel,text);
  for(const [key,definition]of Object.entries(data.buttons)){
   const button=make('button',`native-exit-button native-exit-${key}`);button.type='button';button.setAttribute('aria-label',key==='exit'?'退出并返回大厅':'继续玩');button.style.backgroundImage=`url("${images.get(definition.image).src}")`;
   place(button,{...definition,scale:definition.group.scale},center,definition.group.position);
   const label=make('canvas','native-exit-button-label');label.width=Math.ceil(definition.label.size[0]);label.height=Math.ceil(definition.label.size[1]);place(label,definition.label,definition.size.map(value=>value/2));label.setAttribute('aria-hidden','true');
   const labelContext=label.getContext('2d');labelContext.font=`${definition.label.fontSize}px Arial`;labelContext.textAlign='center';labelContext.fillStyle=definition.label.color;labelContext.textBaseline='alphabetic';const baseline=definition.label.fontSize*.87-(definition.label.fontSize-definition.label.size[1])/2;labelContext.fillText(definition.label.text,definition.label.size[0]/2,baseline);
   button.append(label);button.onclick=()=>{close();if(key==='exit')onExit();};content.append(button);if(key==='continue')focusButton=button;
  }
  if(open)focusButton?.focus({preventScroll:true});return data;
 });
 function show(){if(disposed)return ready;if(!open){previousFocus=document.activeElement;open=true;overlay.hidden=false;}return ready.then(()=>{if(open&&!disposed)focusButton?.focus({preventScroll:true});return api;});}
 function close(){if(!open)return;open=false;overlay.hidden=true;previousFocus?.focus?.({preventScroll:true});onClose();}
 function keydown(event){if(!open)return;if(event.key==='Escape'){event.preventDefault();close();}else if(event.key==='Tab'){const buttons=[...content.querySelectorAll('button')];if(buttons.length){const current=buttons.indexOf(document.activeElement),next=(current+(event.shiftKey?-1:1)+buttons.length)%buttons.length;event.preventDefault();buttons[next].focus();}}}
 overlay.addEventListener('keydown',keydown);
 const api={ready,show,close,get open(){return open;},get metadata(){return metadata;},dispose(){close();disposed=true;overlay.remove();}};
 return api;
}
