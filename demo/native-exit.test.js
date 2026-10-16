import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {exitNineSliceRegions,exitBitmapLayout,createExitConfirm} from './native-exit.js';
const read=file=>JSON.parse(fs.readFileSync(new URL(`exit-study/${file}`,import.meta.url))),data=read('exit.json'),frames=read('frames.json');
test('KeepStay preserves native sliced corners and its exact title/font/button sizes',()=>{
 assert.equal(data.source.id,2084);assert.deepEqual(data.background.size,[697,450]);assert.deepEqual(data.background.capInsets,[25,20,18,24]);
 const regions=exitNineSliceRegions(data.background.sourceSize,data.background.size,data.background.capInsets);
 assert.equal(regions.length,9);assert.deepEqual(regions[0],{source:[0,0,25,20],target:[0,0,25,20]});assert.deepEqual(regions[8],{source:[35,32,18,24],target:[679,426,18,24]});
 assert.equal(regions.reduce((sum,region)=>sum+region.target[2]*region.target[3],0),697*450);
 assert.equal(data.font.source.id,235);assert.equal(data.font.name,'fnt_biaotiz-export');assert.deepEqual(data.buttons.exit.group.scale,[.9,.9]);assert.deepEqual(data.buttons.continue.size,[280,97]);
 assert.equal(data.mask.opacity,160);assert.equal(data.text.color,'#3d3e5e');assert.equal(data.buttons.exit.label.color,'#004c20');assert.equal(data.buttons.continue.label.color,'#973200');
});
test('native title spacing advances bitmap glyphs; trim metadata is preserved once',()=>{
 const glyphs=exitBitmapLayout(data.font,data.titleLabel);assert.deepEqual(glyphs.map(g=>g.character),['提',' ',' ','示']);assert.equal(glyphs[0].x,0);assert.equal(glyphs[3].x,77);assert.equal(glyphs[0].y,5);
 for(const frame of frames){const png=fs.readFileSync(new URL(frame.image,import.meta.url));assert.equal(png.readUInt32BE(16),frame.originalSize[0]);assert.equal(png.readUInt32BE(20),frame.originalSize[1]);}
 const yellow=frames.find(frame=>frame.id===350);assert.equal(yellow.offset[0],1);assert.deepEqual(yellow.originalSize,[280,97]);
});
test('exit remains closed by default; continue and exit deliver correct callbacks once',async()=>{
 const globals=['fetch','document','Image'],saved=new Map(globals.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));let closed=0,exited=0;
 const canvasContext=()=>({drawImage(){},measureText:text=>({width:text.length*35}),fillText(){}});
 class Element{constructor(tag){this.tag=tag;this.children=[];this.style={setProperty(){}};this.dataset={};this.hidden=false;}append(...elements){this.children.push(...elements);}setAttribute(){}getContext(){return this.context??=canvasContext();}focus(){document.activeElement=this;}remove(){this.removed=true;}addEventListener(type,handler){this[type]=handler;}querySelectorAll(){return this.children.flatMap(child=>[...(child.tag==='button'?[child]:[]),...child.querySelectorAll()]);}}
 try{
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});globalThis.Image=class{async decode(){}};
  globalThis.document={head:new Element('head'),activeElement:null,querySelector(){return null;},createElement:tag=>new Element(tag)};
  const parent=new Element('main'),view=createExitConfirm(parent,{onExit(){exited++;},onClose(){closed++;}});assert.equal(view.open,false);
  const pending=view.show();assert.equal(view.open,true);await pending;const [exit,keep]=parent.querySelectorAll();
  keep.onclick();assert.equal(view.open,false);assert.equal(closed,1);assert.equal(exited,0);view.close();assert.equal(closed,1);
  await view.show();exit.onclick();assert.equal(view.open,false);assert.equal(closed,2);assert.equal(exited,1);await view.show();view.dispose();assert.equal(closed,3);assert.equal(parent.children[0].removed,true);
 }finally{for(const[key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
});
