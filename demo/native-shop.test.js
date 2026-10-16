import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import{diamondCatalog,deskCatalog,shopLayout,shopCardPositions,createNativeShop}from'./native-shop.js';
import{nativeSpriteBounds,drawNativeNode}from'./native-ui-canvas.js';
import{collectionCells,createNativeCollection}from'./native-collection.js';
import{createNativeDeskPreview}from'./native-desk-preview.js';
const read=(folder,file)=>JSON.parse(fs.readFileSync(new URL(`${folder}/${file}`,import.meta.url))),data=read('shop-study','shop.json'),frames=read('shop-study','frames.json');
test('shop uses source 720-height layout, width clamp, native grid and screenshot catalog',()=>{
 assert.equal(data.source.id,135);assert.equal(data.tree.children[0].sprite.frame,'ec4858ee-5ff5-4e90-9878-91d926459f98');assert.equal(shopLayout(1104,554).leftX,-582);assert.equal(shopLayout(1280,720).leftX,-532);
 const grid=shopCardPositions('diamond',8);assert.equal(grid[4].x,grid[0].x);assert.equal(grid[4].y,grid[0].y-271);assert.equal(grid[1].x-grid[0].x,241);assert.deepEqual(grid[0],{x:-239,y:142,width:216,height:246});
 assert.deepEqual(diamondCatalog.map(d=>d.price),[3,6,18,30,68,128,328,648]);assert.equal(diamondCatalog[7].name,'6480+2500钻石');assert.deepEqual(deskCatalog.map(d=>[d.name,d.amount]),[['四季常春',18],['繁星之夜',18],['年兽迎福',38]]);
 const recommend=shopCardPositions('recommend',3);assert.equal(recommend[1].x-recommend[0].x,299);assert.equal(recommend[0].height,376);
});
test('all shop assets preserve originalSize once, and trim selects only native occupied pixels',()=>{
 for(const frame of frames){const png=fs.readFileSync(new URL(frame.image,import.meta.url));assert.equal(png.readUInt32BE(16),frame.originalSize[0]);assert.equal(png.readUInt32BE(20),frame.originalSize[1]);}
 const bag=frames.find(f=>f.id===354);assert.deepEqual(nativeSpriteBounds(bag,{_sizeMode:2,_isTrimmedMode:false},[221,223]).source,[0,0,221,223]);assert.deepEqual(nativeSpriteBounds(bag,{_sizeMode:1,_isTrimmedMode:true},[221,223]).source.slice(2),bag.rect.slice(2));
});
test('collection selects real red badge and column-major two-row card slots; multi-line labels retain line spacing',()=>{
 const collection=read('collection-study','collection.json');assert.equal(collection.runtime.playTypes.red,'866');const cells=collectionCells(collection.runtime);assert.equal(cells.length,10);assert.equal(cells[0].x,cells[1].x);assert.equal(cells[0].y-cells[1].y,250);assert.equal(cells[2].x-cells[0].x,200);
 const calls=[],context={save(){},restore(){},translate(){},scale(){},rotate(){},globalAlpha:1,fillText(...args){calls.push(args);}},node={name:'body',active:true,trs:[0,0,0,0,0,0,1,1,1,1],opacity:255,anchor:[.5,.5],size:[500,200],color:0xffffffff,label:{_string:'第一行\n第二行\n第三行',_fontSize:25,_lineHeight:30,_N$verticalAlign:1},children:[]};drawNativeNode(context,node);assert.equal(calls[1][2]-calls[0][2],30);assert.equal(calls[2][2]-calls[1][2],30);assert.equal(calls[0][2],-20.75);
});
test('disabled parent Sprite and Label never paint, but enabled child Sprite remains visible',()=>{
 const draws=[],labels=[],solids=[],context={save(){},restore(){},translate(){},scale(){},rotate(){},globalAlpha:1,drawImage(...args){draws.push(args);},fillText(...args){labels.push(args);},fillRect(...args){solids.push(args);}},frame={rect:[0,0,2,2],originalSize:[2,2],offset:[0,0]},image={width:2,height:2},base={active:true,trs:[0,0,0,0,0,0,1,1,1,1],opacity:255,anchor:[.5,.5],size:[2,2],color:0xffffffff};
 const parent={...base,name:'DiamondNum',sprite:{builtinSolid:true,_enabled:false},label:{_enabled:false,_string:'disabled'},children:[{...base,name:'NodeBg',sprite:{frame:'native',_sizeMode:2,_isTrimmedMode:false},children:[]}]};drawNativeNode(context,parent,{frames:new Map([['native',frame]]),images:new Map([['native',image]])});assert.equal(solids.length,0);assert.equal(labels.length,0);assert.equal(draws.length,1);assert.equal(draws[0][0],image);assert.deepEqual(draws[0].slice(1),[0,0,2,2,-1,-1,2,2]);
});
test('centered system and bitmap labels respect an anchor at the left edge',()=>{
 const words=[],glyphs=[],context={save(){},restore(){},translate(){},rotate(){},scale(){},globalAlpha:1,fillText(...args){words.push(args);},drawImage(...args){glyphs.push(args);}},base={name:'free-label',active:true,trs:[0,0,0,0,0,0,1,1,1,1],opacity:255,anchor:[0,.5],size:[128,40],color:0xffffffff,children:[]};drawNativeNode(context,{...base,label:{_string:'免费领取',_fontSize:32,_lineHeight:32,_N$horizontalAlign:1}});assert.equal(words[0][1],64);
 const image={},font={size:32,image,glyphs:{65:{rect:{x:0,y:0,width:10,height:10},xOffset:0,yOffset:0,xAdvance:12}}};drawNativeNode(context,{...base,label:{_string:'A',_fontSize:32,_lineHeight:32,_N$horizontalAlign:1,_isSystemFontUsed:false}},{font});assert.equal(glyphs[0][5],58);
});
test('shop category clicks and preview actions do not mutate balances; back closes once',async()=>{
 const keys=['fetch','document','Image','addEventListener','removeEventListener'],saved=new Map(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let closes=0,weeks=0;
 const context={save(){},restore(){},translate(){},rotate(){},scale(){},clearRect(){},drawImage(){},beginPath(){},rect(){},clip(){},fillRect(){},fillText(){},globalAlpha:1};
 class Element{constructor(tag){this.tag=tag;this.children=[];this.style={};this.dataset={};this.attrs={};}append(...nodes){this.children.push(...nodes);}setAttribute(key,value){this.attrs[key]=value;}getContext(){return context;}addEventListener(type,fn){this[type]=fn;}focus(){document.activeElement=this;}remove(){this.removed=true;}all(){return this.children.flatMap(c=>[c,...c.all()]);}}
 try{globalThis.document={head:new Element('head'),activeElement:null,querySelector(){return null;},createElement:tag=>new Element(tag)};globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});globalThis.Image=class{async decode(){}};globalThis.addEventListener=globalThis.removeEventListener=()=>{};const parent=new Element('main');parent.offsetWidth=1104;parent.offsetHeight=554;const balances={beans:'57万',coins:'300万',diamond:'0'},shop=createNativeShop(parent,{balances,onClose(){closes++;},onWeekCard(){weeks++;}});assert.equal(shop.open,false);await shop.show('diamond');assert.equal(shop.category,'diamond');let controls=parent.all();assert.equal(controls.filter(n=>n.className==='native-shop-item'&&!n.removed).length,8);controls.find(n=>n.attrs['aria-label']==='30钻石 本地预览').onclick();assert.deepEqual(balances,{beans:'57万',coins:'300万',diamond:'0'});controls.find(n=>n.attrs['aria-label']==='牌桌').onclick();assert.equal(shop.category,'desk');await shop.show('coins');assert.equal(shop.category,'coins');controls=parent.all();controls.find(n=>n.className==='native-shop-week').onclick();assert.equal(weeks,1);controls.find(n=>n.className==='native-shop-back').onclick();assert.equal(shop.open,false);assert.equal(closes,1);shop.close();assert.equal(closes,1);shop.dispose();}
 finally{for(const[key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
});
test('resize waits for both decoded images and fonts after metadata arrives in collection, shop and desk preview',async()=>{
 const keys=['fetch','document','Image','addEventListener','removeEventListener','ResizeObserver'],saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)])),listeners=new Set(),pending=[],views=[];
 const turn=()=>new Promise(resolve=>setImmediate(resolve));
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.style={};this.dataset={};this.attrs={};this.offsetWidth=1104;this.offsetHeight=554;}
  append(...nodes){this.children.push(...nodes);}setAttribute(key,value){this.attrs[key]=value;}addEventListener(type,fn){this[type]=fn;}focus(){document.activeElement=this;}remove(){this.removed=true;}
  all(){return this.children.flatMap(child=>[child,...child.all()]);}
  getContext(){if(!this.context){const paints=[];this.context={paints,globalAlpha:1,save(){},restore(){},translate(){},scale(){},rotate(){},beginPath(){},rect(){},clip(){},clearRect(...args){paints.push(['clear',...args]);},drawImage(...args){paints.push(['image',...args]);},fillRect(...args){paints.push(['solid',...args]);},fillText(...args){paints.push(['text',...args]);}};}return this.context;}
 }
 const parents=[new Element('collection-stage'),new Element('shop-stage'),new Element('preview-stage')],canvases=()=>parents.flatMap(parent=>parent.all().filter(node=>node.tag==='canvas')),paintCount=()=>canvases().reduce((count,node)=>count+(node.context?.paints.length||0),0);
 try{
  globalThis.document={head:new Element('head'),activeElement:null,querySelector(){return null;},createElement:tag=>new Element(tag)};
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});
  globalThis.Image=class{decode(){return new Promise(resolve=>pending.push({src:String(this.src),resolve}));}};
  globalThis.addEventListener=(event,callback)=>{if(event==='resize')listeners.add(callback);};globalThis.removeEventListener=(event,callback)=>listeners.delete(callback);globalThis.ResizeObserver=undefined;
  views.push(createNativeCollection(parents[0]),createNativeShop(parents[1]),createNativeDeskPreview(parents[2]));
  const shown=[views[0].show('red'),views[1].show('diamond'),views[2].show(304)];
  await turn();assert.ok(views.every(view=>view.metadata),'metadata has arrived while Image.decode is deliberately pending');assert.ok(pending.length>100,'all original sprite images are still pending');assert.equal(paintCount(),0);
  parents.forEach(parent=>{parent.offsetWidth=812;parent.offsetHeight=375;});assert.doesNotThrow(()=>{for(const resize of listeners)resize();});assert.equal(paintCount(),0,'resize must not paint metadata before sprite images decode');
  const imageBatch=pending.splice(0);imageBatch.forEach(item=>item.resolve());await turn();assert.ok(pending.length>=3,'separate bitmap-font decode remains pending after sprite images finish');assert.equal(paintCount(),0);
  assert.doesNotThrow(()=>{for(const resize of listeners)resize();});assert.equal(paintCount(),0,'decoded sprite images alone must not allow a draw before fonts are ready');
  pending.splice(0).forEach(item=>item.resolve());await Promise.all(shown);await turn();
  assert.ok(canvases().every(canvas=>canvas.context?.paints.some(([type])=>type==='image')),'each factory, including the shop-owned desk preview, paints after complete readiness');
  const before=paintCount();assert.doesNotThrow(()=>{for(const resize of listeners)resize();});assert.ok(paintCount()>before,'subsequent mobile resize redraws the complete views');
 }finally{
  views.forEach(view=>view.dispose());for(let pass=0;pass<4;pass++){pending.splice(0).forEach(item=>item.resolve());await turn();}await Promise.allSettled(views.map(view=>view.ready));
  for(const[key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
 }
});
