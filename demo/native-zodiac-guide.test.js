import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildZodiacGuidePage,zodiacGuideFingerPose,createNativeZodiacGuide} from './native-zodiac-guide.js';
import {activityButtonRects} from './native-hall-activities.js';
import {nativeSpriteBounds} from './native-ui-canvas.js';

const data=JSON.parse(fs.readFileSync(new URL('zodiac-guide-study/guide.json',import.meta.url))),frames=JSON.parse(fs.readFileSync(new URL('zodiac-guide-study/frames.json',import.meta.url))),frameMap=new Map(frames.map(frame=>[frame.uuid,frame]));
function find(node,name){if(node.name===name)return node;for(const child of node.children||[]){const result=find(child,name);if(result)return result;}}
test('four zodiac pages retain original title/body resources and explanatory sentences',()=>{
 assert.equal(data.source.id,1034);assert.equal(data.pages.length,4);assert.equal(frames.length,18);
 assert.deepEqual(data.pages.map(page=>frameMap.get(page.title).id),[1700,390,1568,1779]);
 assert.deepEqual(data.pages.map(page=>frameMap.get(page.image).id),[330,617,1965,280]);
 assert.deepEqual(data.pages.map(page=>page.info),[
  '生肖牌：鼠、牛、虎、兔、龙、蛇、马、羊、猴、鸡、狗、猪    吉星牌：福、禄、寿',
  '玩家每摸到一张本次对局未摸到过的生肖牌，即可收集到生肖图中增加倍数。',
  '打出吉星牌后，会随机点亮一张生肖图中未点亮的生肖牌。',
  '根据收集到的生肖牌组成的不同形状，可以获得倍数加成。',
 ]);
 const original=JSON.stringify(data);
 for(let page=0;page<4;page++){
  const tree=buildZodiacGuidePage(data,page);assert.equal(find(tree,'Title').sprite.frame,data.pages[page].title);assert.equal(find(tree,'ShowPic').sprite.frame,data.pages[page].image);assert.equal(find(tree,'Label').label._string,data.pages[page].info);
  assert.deepEqual(find(tree,'Title').size,data.pages[page].titleSize);assert.equal(find(tree,'Left').active,page>0);assert.equal(find(tree,'Right').active,page<3);assert.equal(find(tree,'BtnClose').active,true);assert.equal(find(tree,'shouzhi').active,page<3);
 }
 assert.equal(JSON.stringify(data),original);assert.equal(find(buildZodiacGuidePage(data,-5),'Left').active,false);assert.equal(find(buildZodiacGuidePage(data,1,{completed:true}),'shouzhi').active,false);
});
test('native backdrop, body, rotation, sprite trim and actionable areas retain source geometry',()=>{
 const tree=buildZodiacGuidePage(data),root=find(tree,'Root'),finger=find(tree,'shouzhi'),hits=activityButtonRects(tree);
 assert.deepEqual(root.children.map(node=>node.name),['Bg','baibian','Left','Right','ShowPic','Title','di','shouzhi','BtnClose']);
 assert.deepEqual(find(tree,'Bg').size,[872,537]);assert.deepEqual(find(tree,'ShowPic').size,[804,362]);assert.deepEqual(find(tree,'Title').trs.slice(0,2),[0,261]);assert.equal(find(tree,'Mask').opacity,216);
 assert.deepEqual(finger.trs.slice(0,2),[502,0]);assert.ok(Math.abs(2*Math.atan2(finger.trs[5],finger.trs[6])-Math.PI)<1e-12);
 assert.deepEqual(hits.map(hit=>hit.events[0].handler),['onClickRight','onClickClose']);assert.deepEqual(hits[0].bounds,[464,-60,544,40]);
 for(const frame of frames){const image=fs.readFileSync(new URL(frame.image,import.meta.url));assert.equal(image.readUInt32BE(16),frame.originalSize[0]);assert.equal(image.readUInt32BE(20),frame.originalSize[1]);}
 const glow=find(finger,'glow'),frame=frameMap.get(glow.sprite.frame),bounds=nativeSpriteBounds(frame,glow.sprite,glow.size);assert.deepEqual(bounds.size,[112,112]);assert.deepEqual(frame.originalSize,[128,128]);assert.deepEqual(bounds.source,[8,8,112,112]);
});
test('finger runs from initialization, appears after 300ms and loops the exact native keys',()=>{
 const initial=zodiacGuideFingerPose(data,0),hidden=zodiacGuideFingerPose(data,299),visible=zodiacGuideFingerPose(data,300),pressed=zodiacGuideFingerPose(data,1000/3);
 assert.equal(initial.opacity,0);assert.equal(initial.paths.shouzhi.position[1],80);assert.equal(hidden.opacity,0);assert.equal(visible.opacity,255);assert.ok(visible.paths.shouzhi.position[1]<60,'the clip has already advanced when the 300ms display delay ends');
 assert.ok(Math.abs(pressed.paths.shouzhi.position[1]-52.1)<1e-9);assert.equal(zodiacGuideFingerPose(data,400).paths.glow.opacity,255);assert.deepEqual(zodiacGuideFingerPose(data,1000).paths.glow.scale,[1.47,1.47]);
 const loop=zodiacGuideFingerPose(data,data.fingerAnimation.durationMs+300);assert.ok(Math.abs(loop.paths.shouzhi.position[1]-visible.paths.shouzhi.position[1])<1e-9);assert.equal(zodiacGuideFingerPose(data,700,{completed:true}).active,false);
});

function installDom({deferred=false,raf=false}={}){
 const keys=['fetch','document','Image','addEventListener','removeEventListener','requestAnimationFrame','cancelAnimationFrame'],saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)])),pending=[],listeners=new Set(),requests=[],queue=new Map();let paints=0,id=0;
 const context={save(){},restore(){},translate(){},rotate(){},scale(){},clearRect(){paints++;},drawImage(){paints++;},fillRect(){paints++;},fillText(){paints++;},measureText(text){return {width:text.length*21};},globalAlpha:1};
 class Element{
  constructor(tag){this.tag=tag;this.children=[];this.style={};this.dataset={};this.attrs={};this.offsetWidth=1080;this.offsetHeight=542;this.isConnected=true;}
  append(...nodes){this.children.push(...nodes);}setAttribute(key,value){this.attrs[key]=value;}getContext(){return context;}addEventListener(type,callback){this[type]=callback;}
  focus(){document.activeElement=this;}remove(){this.removed=true;this.isConnected=false;}all(){return this.children.flatMap(child=>[child,...child.all()]);}
 }
 const parent=new Element('main'),originFocus=new Element('button');
 globalThis.document={head:new Element('head'),activeElement:originFocus,querySelector(){return null;},createElement:tag=>new Element(tag)};
 globalThis.fetch=async url=>{requests.push(new URL(url).pathname);return {ok:true,json:async()=>JSON.parse(fs.readFileSync(url))};};
 globalThis.Image=class{decode(){return deferred?new Promise(resolve=>pending.push(resolve)):Promise.resolve();}};
 globalThis.addEventListener=(type,callback)=>listeners.add(callback);globalThis.removeEventListener=(type,callback)=>listeners.delete(callback);
 if(raf){globalThis.requestAnimationFrame=callback=>{queue.set(++id,callback);return id;};globalThis.cancelAnimationFrame=id=>queue.delete(id);}
 return {parent,originFocus,pending,listeners,requests,get paints(){return paints;},get queued(){return queue.size;},live:()=>parent.all().filter(node=>!node.removed&&node.tag==='button'),fire(timestamp){const callbacks=[...queue.values()];queue.clear();for(const callback of callbacks)callback(timestamp);},restore(){pending.splice(0).forEach(resolve=>resolve());for(const[key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}};
}
test('decode readiness, four-page navigation, focus and reopening remain entirely local',async()=>{
 const dom=installDom({deferred:true});let view,closed=0;
 try{
  view=createNativeZodiacGuide(dom.parent,{onClose(){closed++;}});const opening=view.show({animate:false,motion:false});await new Promise(resolve=>setImmediate(resolve));assert.equal(dom.pending.length,18);assert.equal(dom.paints,0);
  dom.parent.offsetWidth=812;dom.parent.offsetHeight=375;for(const callback of dom.listeners)callback();assert.equal(dom.paints,0);dom.pending.splice(0).forEach(resolve=>resolve());await opening;assert.ok(dom.paints>18);assert.equal(view.model.width,812);assert.equal(view.page,0);assert.deepEqual(dom.live().map(button=>button.attrs['aria-label']),['下一页','关闭介绍']);
  const localRequests=[...dom.requests];for(let index=0;index<3;index++)dom.live().find(button=>button.attrs['aria-label']==='下一页').onclick();assert.equal(view.page,3);assert.deepEqual(dom.live().map(button=>button.attrs['aria-label']),['上一页','关闭介绍']);assert.equal(view.model.completed,true);
  view.next();assert.equal(view.page,3);view.previous();assert.equal(view.page,2);assert.equal(find(view.model.tree,'shouzhi').active,false);assert.deepEqual(dom.requests,localRequests);
  await view.close({animate:false});assert.equal(view.open,false);assert.equal(closed,1);assert.equal(document.activeElement,dom.originFocus);await view.show({animate:false,motion:false});assert.equal(view.page,0);assert.equal(view.model.completed,false);assert.deepEqual(dom.requests,localRequests);
  const layer=dom.parent.all().find(node=>node.tag==='section');layer.keydown({key:'Escape',preventDefault(){},stopPropagation(){}});assert.equal(view.open,false);assert.equal(closed,2);
 }finally{view?.dispose();dom.restore();}
});
test('native close animation targets entry pixels and interrupted transitions cannot close a reopened guide',async()=>{
 const dom=installDom({raf:true});let view,closed=0;
 try{
  const entryPoint={x:130,y:480};view=createNativeZodiacGuide(dom.parent,{onClose(){closed++;}});await view.show({animate:false,motion:false,entryPoint});
  const closing=view.close(),root=find(view.model.tree,'Root');assert.equal(find(view.model.tree,'Mask').opacity,0);dom.fire(0);dom.fire(150);assert.equal(root.trs[7],1.15);dom.fire(350);await closing;
  assert.equal(view.open,false);assert.equal(closed,1);assert.ok(Math.abs(root.trs[7]-.05)<1e-12);assert.ok(Math.abs(root.trs[0]-(entryPoint.x-540)/(542/720))<1e-9);assert.ok(Math.abs(root.trs[1]+(entryPoint.y-271)/(542/720))<1e-9);assert.equal(root.opacity,0);assert.equal(dom.queued,0);
  await view.show({animate:false,motion:false});const interrupted=view.close();dom.fire(500);await view.show({animate:false,motion:false});assert.deepEqual(await interrupted,{cancelled:true});dom.fire(1000);assert.equal(view.open,true);assert.equal(closed,1);
  const opening=view.show({motion:false});await new Promise(resolve=>setImmediate(resolve));dom.fire(1200);dom.fire(1400);assert.equal(find(view.model.tree,'Root').trs[7],1.1);dom.fire(1500);await opening;assert.equal(find(view.model.tree,'Root').trs[7],1);assert.equal(dom.queued,0);
 }finally{view?.dispose();dom.restore();}
});
