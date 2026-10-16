import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildBountyRewards,bountyScreenshotFixture} from './bounty-runtime.js';
import {layoutActivityLabels,createNativeHallActivities} from './native-hall-activities.js';
const data=JSON.parse(fs.readFileSync(new URL('hall-activity-study/activities.json',import.meta.url)));
const frames=JSON.parse(fs.readFileSync(new URL('hall-activity-study/frames.json',import.meta.url)));
function find(node,name){if(node.name===name)return node;for(const child of node.children||[]){const result=find(child,name);if(result)return result;}}
test('bounty screenshot values address all twelve original IDs in screen order',()=>{
 const source=structuredClone(data.prefabs[2567].tree),root=find(source,'allAward'),positions=new Map(root.children.map(node=>[node.name,[...node.trs]]));
 buildBountyRewards(data,source);assert.deepEqual(bountyScreenshotFixture.rewards.map(reward=>reward.id),data.runtime.bounty.clockwiseIds);
 assert.deepEqual(bountyScreenshotFixture.rewards.map(reward=>[reward.name,reward.amount]),[['玉兔呈祥','7天'],['指尖币','5000万'],['指尖币','200万'],['指尖币','30万'],['指尖币','60亿'],['指尖币','60亿'],['指尖币','20亿'],['指尖币','1000万'],['指尖币','100万'],['指尖币','50万'],['指尖币','1亿'],['章鱼','永久']]);
 assert.equal(root.children.length,12);assert.equal(find(source,'actTime').label._string,'剩余时间：6天05小时27分13秒');for(const reward of bountyScreenshotFixture.rewards){const slot=root.children.find(node=>node.name==='award'+reward.id);assert.deepEqual(slot.trs,positions.get(slot.name));assert.equal(find(slot,'iconName').label._string,reward.name);assert.equal(find(slot,'iconNum').label._string,reward.amount);assert.equal(find(slot,'iconSpr').sprite.frame,data.runtime.bounty.rewardIcons[reward.icon].frame);}
});
test('bounty icons preserve native RAW size and frame metadata rather than generic substitutes',()=>{
 const source=buildBountyRewards(data,structuredClone(data.prefabs[2567].tree)),root=find(source,'allAward');
 for(const [key,path]of [['zCoin','PropIcon/ZCoin'],['rabbitDesk','GameDeskIcon/zhuozi_ytcx'],['octopus','Emoji/icon/octopus_icon']]){const entry=data.runtime.bounty.rewardIcons[key],frame=frames.find(frame=>frame.uuid===entry.frame);assert.equal(entry.path,path);assert.deepEqual(entry.originalSize,frame.originalSize);assert.ok(fs.existsSync(new URL(frame.image,import.meta.url)));}
 assert.equal(data.runtime.bounty.rewardIcons.rabbitDesk.bag.name,'玉兔呈祥');assert.equal(data.runtime.bounty.rewardIcons.rabbitDesk.bag.id,326);assert.equal(data.runtime.bounty.rewardIcons.octopus.bag.id,1407);
 const rabbit=find(root.children.find(node=>node.name==='award3'),'iconSpr'),coin=find(root.children.find(node=>node.name==='award7'),'iconSpr'),octopus=find(root.children.find(node=>node.name==='award1'),'iconSpr');assert.equal(rabbit.trs[7],.47);assert.equal(coin.trs[7],.4);assert.equal(octopus.trs[7],.45);for(const icon of [rabbit,coin,octopus]){assert.equal(icon.sprite._sizeMode,2);assert.equal(icon.sprite._isTrimmedMode,false);}
});
test('zero missile visual state hides only the two draw hints and remeasures runtime labels',()=>{
 const source=buildBountyRewards(data,structuredClone(data.prefabs[2567].tree)),right=find(source,'rightAward'),count=find(source,'nowMissile');assert.equal(count.label._string,'0');assert.equal(count.label._nativeAutoWidth,true);
 assert.equal(find(find(right,'btn_l'),'red').active,false);assert.equal(find(find(right,'btn_r'),'red').active,false);assert.equal(find(find(find(right,'bottomLayer'),'btn1'),'red').active,true);
 layoutActivityLabels(source,{save(){},restore(){},measureText(string){return {width:[...string].reduce((sum,char)=>sum+(char.charCodeAt(0)>255?20:10),0)};}});
 assert.equal(count.size[0],10);const amount=find(find(source,'award7'),'iconNum');assert.equal(amount.size[0],60);assert.equal(amount.anchor[0],1,'source numeric label remains anchored to the slot right edge');assert.equal(amount.trs[0],49);
});
test('bounty fixture rendering is isolated from source metadata and immutable display state',()=>{
 const before=JSON.stringify(data),fixture=JSON.stringify(bountyScreenshotFixture),tree=structuredClone(data.prefabs[2567].tree);
 buildBountyRewards(data,tree);assert.equal(JSON.stringify(data),before);assert.equal(JSON.stringify(bountyScreenshotFixture),fixture);assert.equal(bountyScreenshotFixture.missileCount,0);
 assert.throws(()=>buildBountyRewards(data,tree,{...bountyScreenshotFixture,rewards:[{id:99,icon:'zCoin'}]}),/Unknown original bounty reward/);
});
test('actual bounty draw buttons do not request rewards or mutate the supplied account balances',async()=>{
 const keys=['fetch','document','Image','FontFace','addEventListener','removeEventListener'],saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)])),requests=[];
 const context={save(){},restore(){},translate(){},rotate(){},scale(){},clearRect(){},drawImage(){},beginPath(){},rect(){},clip(){},fillRect(){},fillText(){},measureText(string){return {width:string.length*20};},globalAlpha:1};
 class Element{constructor(tag){this.tag=tag;this.children=[];this.style={};this.dataset={};this.attrs={};this.offsetWidth=1080;this.offsetHeight=542;}append(...nodes){this.children.push(...nodes);}setAttribute(key,value){this.attrs[key]=value;}getAttribute(key){return this.attrs[key];}getContext(){return context;}addEventListener(type,fn){this[type]=fn;}focus(){document.activeElement=this;}remove(){this.removed=true;}all(){return this.children.flatMap(child=>[child,...child.all()]);}}
 const parent=new Element('main'),balances={beans:'75.2万',coins:'2800万',diamond:'0'};let view;
 try{globalThis.document={head:new Element('head'),activeElement:null,querySelector(){return null;},createElement:tag=>new Element(tag)};globalThis.fetch=async url=>{requests.push(new URL(url).pathname);return {ok:true,json:async()=>JSON.parse(fs.readFileSync(url))};};globalThis.Image=class{async decode(){}};globalThis.FontFace=undefined;globalThis.addEventListener=()=>{};globalThis.removeEventListener=()=>{};
  view=createNativeHallActivities(parent,{balances});await view.show('bounty');const drawButtons=parent.all().filter(node=>!node.removed&&node.dataset.handler==='onClickUseMissile');assert.equal(drawButtons.length,2,'both native one/five draw hit areas are exercised');const loadedRequests=[...requests];for(const button of drawButtons)button.onclick();
  assert.deepEqual(balances,{beans:'75.2万',coins:'2800万',diamond:'0'});assert.deepEqual(requests,loadedRequests,'draw clicks may not contact a reward, purchase or advertisement endpoint');assert.equal(bountyScreenshotFixture.missileCount,0);assert.equal(view.current,'bounty');assert.equal(view.open,true);
 }finally{view?.dispose();for(const[key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
});
