import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {hallRuleCatalog,prepareHallRules,createNativeHallRules} from './native-hall-rules.js';
import {findHallNode,hallNodeRects} from './native-hall-panels.js';
import {resolveRoomRule} from './native-room-rules.js';
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url)));
const source=read('./hall-rule-study/source.json'),config=read('./rule-study/RuleCfg.json'),games=read('./rule-study/games.json');

test('the hall menu preserves observed variants while covering collected rule groups',()=>{
 const catalog=hallRuleCatalog(source,config,games);
 assert.deepEqual(catalog.slice(0,7).map(entry=>entry.id),[863,870,867,849,868,149,148]);
 assert.equal(new Set(catalog.map(entry=>entry.ruleID)).size,games.filter(game=>!/^规则编号|未命名玩法/.test(game.name)).length);
 assert.ok(catalog.every(entry=>resolveRoomRule(config,entry.id)));
 assert.equal(catalog[1].spell,'HONGZHONGBUXIPAI');
});

test('hall rules keep native title, left viewport and room-independent content geometry',()=>{
 const scene=prepareHallRules(source,config,{gameType:863,width:1440}),rects=hallNodeRects(scene);
 assert.equal(findHallNode(scene,'lab_title').label._N$file,'d3224ad4-b37f-4730-90f0-c91c90307c2a');
 assert.deepEqual([rects.get(20).width,rects.get(20).height],[250,510]);
 assert.deepEqual([rects.get(18).width,rects.get(18).height],[680,400]);
 assert.equal(findHallNode(scene,9).children.length,0);assert.equal(findHallNode(scene,26).children.length,0);
 assert.equal(findHallNode(scene,'mask').size[0],1440);
});

test('native tabs reflow around absent optional rules and select the original fan tab',()=>{
 const candidate=games.find(game=>!game.CUSTOMRULE?.length);assert.ok(candidate);
 const scene=prepareHallRules(source,config,{gameType:candidate.id}),tabs=findHallNode(scene,'ToggleContainer');
 assert.equal(tabs.children.filter(node=>node.active).length,2);assert.equal(tabs.size[0],397);
 assert.equal(findHallNode(findHallNode(scene,'toggleFan'),'checkmark').active,true);
 assert.equal(findHallNode(findHallNode(scene,'toggleBase'),'checkmark').active,false);
 const frameData=read('./hall-rule-study/frames.json');for(const frame of frameData)assert.ok(fs.existsSync(new URL(frame.image,import.meta.url)),frame.image);
});

test('factory loads source assets, shows an item with no root SpriteFrame, and switches rules',async()=>{
 const keys=['document','Image','fetch','ResizeObserver'],previous=new Map(keys.map(key=>[key,globalThis[key]]));
 class Element{
  constructor(tag){this.tagName=tag;this.children=[];this.style={};this.dataset={};this.attributes={};this.offsetWidth=1280;this.offsetHeight=720;this.scrollTop=0;this.hidden=false;}
  append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
  replaceChildren(...children){this.children=[];this.append(...children);}
  setAttribute(key,value){this.attributes[key]=String(value);}
  getAttribute(key){return this.attributes[key];}
  addEventListener(){}
  focus(){globalThis.document.activeElement=this;}
  querySelector(tag){return this.children.find(node=>node.tagName===tag)||this.children.map(node=>node.querySelector(tag)).find(Boolean);}
  getBoundingClientRect(){return{width:this.offsetWidth,height:this.offsetHeight};}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(node=>node!==this);}
  getContext(){return{font:'22px Arial',globalAlpha:1,save(){},restore(){},translate(){},scale(){},rotate(){},drawImage(){},fillRect(){},clearRect(){},beginPath(){},rect(){},clip(){},fillText(){},measureText(text){return{width:text.length*22};}};}
 }
 try{
  const first=new Element('button');globalThis.document={createElement:tag=>new Element(tag),head:new Element('head'),querySelector:()=>null,activeElement:first};
  globalThis.Image=class{naturalWidth=32;naturalHeight=32;decode(){return Promise.resolve();}};
  globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(url))});
  globalThis.ResizeObserver=class{observe(){}disconnect(){}};
  // Native item60 deliberately contains an empty cc.Sprite on its root.
  assert.equal(source.templates.item.tree.sprite,null);
  const stage=new Element('main'),rules=createNativeHallRules(stage);
  await rules.show('red');assert.equal(rules.open,true);assert.equal(rules.element.dataset.ruleId,'863');
  const menu=rules.element.children.find(node=>node.className==='native-hall-rule-menu');
  assert.equal(menu.children.length,rules.catalog.length);assert.equal(menu.children[0].attributes['aria-selected'],'true');
  assert.ok(menu.children.every(node=>!/^规则编号|未命名玩法/.test(node.attributes['aria-label'])));
  const sixth=menu.children.find(node=>node.attributes['aria-label']==='6红中不洗牌');sixth.onclick();assert.equal(rules.element.dataset.ruleId,'868');
  rules.selectTab('BASERULE');const view=rules.element.children.find(node=>node.className==='native-hall-rule-view');assert.ok(view.children.some(node=>node.tagName==='p'&&node.textContent));
  rules.close();assert.equal(rules.open,false);assert.equal(globalThis.document.activeElement,first);rules.dispose();assert.equal(stage.children.length,0);
 }finally{for(const[key,value]of previous)if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
});
