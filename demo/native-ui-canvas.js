import {exitNineSliceRegions} from './native-exit.js';
export const nativeColor=value=>'#'+[value&255,value>>>8&255,value>>>16&255].map(value=>value.toString(16).padStart(2,'0')).join('');
const tintCache=new WeakMap();
export {tintSprite as tintNativeSprite};
function tintSprite(image,color,frame){if((color&0xffffff)===0xffffff||typeof document==='undefined')return image;let variants=tintCache.get(image);if(!variants)tintCache.set(image,variants=new Map());if(variants.has(color))return variants.get(color);const canvas=document.createElement('canvas');canvas.width=image.naturalWidth||image.width||frame.originalSize[0];canvas.height=image.naturalHeight||image.height||frame.originalSize[1];const context=canvas.getContext('2d');context.drawImage(image,0,0);context.globalCompositeOperation='multiply';context.fillStyle=nativeColor(color);context.fillRect(0,0,canvas.width,canvas.height);context.globalCompositeOperation='destination-in';context.drawImage(image,0,0);variants.set(color,canvas);return canvas;}
export function nativeSpriteBounds(frame,sprite,size){
 const [width,height]=frame.rect.slice(2),[originalWidth,originalHeight]=frame.originalSize,[offsetX,offsetY]=frame.offset||[0,0],mode=sprite._sizeMode??1,trim=sprite._isTrimmedMode!==false;
 return {source:trim?[Math.round((originalWidth-width)/2+offsetX),Math.round((originalHeight-height)/2-offsetY),width,height]:[0,0,originalWidth,originalHeight],size:mode===0?size:mode===2?frame.originalSize:[width,height]};
}
export function drawNativeNode(context,node,{frames,images,font,fonts,filter=()=>true,overrides={},path='',ignorePosition=false}={}){
 path=path?`${path}/${node.name}`:node.name;const override=overrides[path]||{},value={...node,...override};if(!value.active||!filter(value,path))return;
 context.save();if(!ignorePosition)context.translate(value.trs[0],-value.trs[1]);context.rotate(-2*Math.atan2(value.trs[5],value.trs[6]));context.scale(value.trs[7],value.trs[8]);context.globalAlpha*=value.opacity/255;
 if(value.sprite?.frame&&value.sprite._enabled!==false){const frame=frames.get(value.sprite.frame),original=images.get(value.sprite.frame);if(frame&&original){const image=tintSprite(original,value.color,frame),bounds=nativeSpriteBounds(frame,value.sprite,value.size),size=bounds.size,left=-value.anchor[0]*size[0],top=-(1-value.anchor[1])*size[1];context.save();context.globalCompositeOperation=value.sprite._dstBlendFactor===1?'lighter':'source-over';
  if(value.sprite._type===1){const sourceSize=bounds.source.slice(2);for(const region of exitNineSliceRegions(sourceSize,size,frame.capInsets||[0,0,0,0])){if(region.source[2]<=0||region.source[3]<=0)continue;context.drawImage(image,region.source[0]+bounds.source[0],region.source[1]+bounds.source[1],region.source[2],region.source[3],region.target[0]+left,region.target[1]+top,region.target[2],region.target[3]);}}
  else context.drawImage(image,...bounds.source,left,top,...size);context.restore();
 }}else if(value.sprite?.builtinSolid&&value.sprite._enabled!==false){context.fillStyle=nativeColor(value.color);context.fillRect(-value.anchor[0]*value.size[0],-(1-value.anchor[1])*value.size[1],...value.size);}
 if(value.label&&value.label._enabled!==false){const label=value.label,text=label._string||'',size=label._fontSize??40,lineHeight=label._lineHeight??40,lines=text.split('\n'),width=value.size[0],height=value.size[1],horizontal=label._N$horizontalAlign??0,vertical=label._N$verticalAlign??0;
  context.save();context.fillStyle=nativeColor(value.color);context.font=`${label._styleFlags&1?'bold ':''}${size}px ${label._nativeFontFamily||'Arial'}`;context.textBaseline='alphabetic';context.textAlign=horizontal===1?'center':horizontal===2?'right':'left';
  const x=horizontal===1?width*(.5-value.anchor[0]):horizontal===2?width*(1-value.anchor[0]):-width*value.anchor[0];
  const blockHeight=(lines.length+.26)*lineHeight,firstBaseline=size*.87-(size-(1+.26)*lineHeight)/2;
  const blockTop=-height*(1-value.anchor[1])+(vertical===1?(height-blockHeight)/2:vertical===2?height-blockHeight:0);
  const bitmap=fonts?.get(label._N$file)||font;
  if(label._isSystemFontUsed===false&&bitmap){let advance=0,glyphs=[];for(const character of text){const glyph=bitmap.glyphs[character.charCodeAt(0)];if(!glyph)continue;glyphs.push({glyph,x:advance});advance+=glyph.xAdvance*size/bitmap.size+(label._spacingX??0);}const start=horizontal===1?width*(.5-value.anchor[0])-advance/2:horizontal===2?width*(1-value.anchor[0])-advance:-width*value.anchor[0];for(const {glyph,x}of glyphs){const rect=glyph.rect,scale=size/bitmap.size;if(rect.width&&rect.height)context.drawImage(bitmap.image,rect.x,rect.y,rect.width,rect.height,start+x+glyph.xOffset*scale,blockTop+glyph.yOffset*scale,rect.width*scale,rect.height*scale);}}
  else lines.forEach((line,index)=>context.fillText(line,x,blockTop+firstBaseline+index*lineHeight));context.restore();
 }
 if(value.mask){context.beginPath();context.rect(-value.anchor[0]*value.size[0],-(1-value.anchor[1])*value.size[1],...value.size);context.clip();}
 for(const child of value.children||[])drawNativeNode(context,child,{frames,images,font,fonts,filter,overrides,path});context.restore();
}
