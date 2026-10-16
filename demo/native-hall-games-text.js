// Cocos BMFont assembler 274: _multilineTextWrap, _computeAlignmentOffset and
// _updateQuads. These helpers return local Canvas coordinates, before the
// caller applies the node/parent transforms. Atlas commonHeight is not used
// to center a cc.Label; its runtime content height comes from lineHeight.
const finite=(value,fallback)=>Number.isFinite(value)?value:fallback,contentValue=value=>Number(value.toFixed(2));
function bitmap(label){const font=label?.font,config=font?.config;if(font?.missing||!config?.fontDefDictionary)return null;const size=finite(config.fontSize,finite(font.size,32));if(size<=0)throw RangeError('Bitmap font source size must be positive');return {font,config,size};}
function systemWidth(text,label,measure){let width;if(measure){const value=measure(text,label);width=typeof value==='number'?value:value?.width;if(!Number.isFinite(width)||width<0)throw RangeError('System text measurement must be a finite non-negative width');}else{const size=finite(label?.fontSize,40);if(size<0)throw RangeError('Label font size must be non-negative');width=[...text].reduce((sum,char)=>sum+(char.codePointAt(0)>255?1:.53)*size,0);}return width;}
function runsFor(text,label,measureFallback){const bm=bitmap(label);if(!bm)return null;const size=finite(label.fontSize,bm.size);if(size<0)throw RangeError('Label font size must be non-negative');const scale=size/bm.size,spacing=finite(label.spacing,0),characters=[...text],runs=[];let pen=0,width=0;
 for(let index=0;index<characters.length;index++){const char=characters[index],code=char.codePointAt(0),glyph=bm.config.fontDefDictionary[code];
  // The original assembler stores the final pair's kerning as zero. Existing
  // hall fonts have empty kerning dictionaries, but preserve the source rule.
  if(index>0&&index<characters.length-1)pen+=(bm.config.kerningDict?.[(characters[index-1].codePointAt(0)<<16)|code]||0)*scale;
  if(glyph){const rect=glyph.rect;if(!rect||![rect.x,rect.y,rect.width,rect.height].every(Number.isFinite)||rect.x<0||rect.y<0||rect.width<0||rect.height<0)throw RangeError('Invalid bitmap glyph rectangle for '+char);const x=pen+finite(glyph.xOffset,0)*scale,advance=finite(glyph.xAdvance,rect.width)*scale;runs.push({char,glyph,x});width=Math.max(width,x+rect.width*scale);pen+=advance+spacing;
  }else{const fallbackWidth=measureFallback?systemWidth(char,label,measureFallback):size*.5;runs.push({char,x:pen,fallbackWidth});width=Math.max(width,pen+fallbackWidth);pen+=fallbackWidth+spacing;}
 }
 return {...bm,scale,size,width,runs};
}

// For native BMFont labels this is their NONE single-line content width. A
// system measurement callback receives (text,label) and may return either a
// number or Canvas TextMetrics. Without it, the system estimate is explicit.
export function hallLabelWidth(text,label,measureSystemText){text=String(text??'');if(text.includes('\n'))throw RangeError('Hall label width requires a single line');const layout=runsFor(text,label,measureSystemText);return layout?contentValue(layout.width):systemWidth(text,label,measureSystemText);}

// Returns null for a system/unknown font. For native BMFont returns:
// {frameUUID,width,height,textWidth,fontScale,glyphs,fallback}, where glyphs
// contain {char,source:[sx,sy,sw,sh],target:[dx,dy,dw,dh]}. The source arrays
// address the once-padded original atlas PNG. fallback entries are deliberate
// local substitutes for missing characters (e.g. the unknown-value dash), not
// claims that Cocos had an original glyph. Draw them with textBaseline=middle.
export function hallBitmapTextPatches(node,measureSystemText){const label=node?.label;if(!bitmap(label))return null;const text=String(node.text??label.text??'');if(text.includes('\n'))throw RangeError('Hall bitmap patches require a single line');const layout=runsFor(text,label,measureSystemText),overflow=label.overflow??0,lineHeight=finite(label.lineHeight,layout.size),anchor=node.anchor||[.5,.5],horizontal=label.align??0,vertical=label.verticalAlign??0;
 if(lineHeight<0)throw RangeError('Label line height must be non-negative');
 const height=overflow===0?contentValue(lineHeight):finite(node.size?.[1],lineHeight),width=overflow===0?contentValue(layout.width):finite(node.size?.[0],layout.width),lineExtent=lineHeight*(overflow===2?layout.scale:1);
 let top=height;if(vertical!==0){const offset=height-lineExtent+lineExtent-layout.size;top-=vertical===2?offset:offset/2;}
 const alignment=horizontal===1?(width-layout.width)/2:horizontal===2?width-layout.width:0,start=alignment-width*anchor[0],lineTop=height*anchor[1]-top,glyphs=[],fallback=[];
 for(const run of layout.runs){if(run.glyph){const rect=run.glyph.rect;if(rect.width&&rect.height)glyphs.push({char:run.char,source:[rect.x,rect.y,rect.width,rect.height],target:[start+run.x,lineTop+finite(run.glyph.yOffset,0)*layout.scale,rect.width*layout.scale,rect.height*layout.scale]});}else fallback.push({char:run.char,x:start+run.x,y:lineTop+layout.size/2,width:run.fallbackWidth,fontSize:layout.size});}
 return {frameUUID:layout.font.frame?.uuid,width,height,textWidth:layout.width,fontScale:layout.scale,glyphs,fallback};
}
