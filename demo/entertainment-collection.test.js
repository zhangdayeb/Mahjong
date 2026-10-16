import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {getSanguoTableEntry} from './sanguo-table-entry.js';
import {entertainmentFixture} from './hall-games-study/entertainment-fixture.js';
import {HALL_GAMES_SOURCE,hallGamesModel,createNativeHallGames} from './native-hall-games.js';
import {hallBitmapTextPatches,hallLabelWidth} from './native-hall-games-text.js';
const ids=[898,893,883,885,870,869],names=['十二生肖','四季常春不洗牌','疯狂8红中','8红中不洗牌','6红中不洗牌','四季常春'];
const config=HALL_GAMES_SOURCE.components[37].find(value=>value.typeBgSF),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
function originalClass(name,dependencies,globals={}){
 let definition;
 const context={Cls_BaseView:class{},cc:{_RF:{push(){},pop(){}},Class(value){definition=value;return function(){};}},isNull:value=>value==null,console:{log(){},error(){}},...globals};
 const source=fs.readFileSync(new URL('../asset-study/readable/modules/'+name+'.js',import.meta.url),'utf8');
 vm.runInNewContext('({'+source+'})',context)[name][0](key=>dependencies[key],{exports:{}});
 return definition;
}

test('original entertainment source accepts six regular IDs and selects skins by position but icons by type',()=>{
 const cards=[],layout={node:{removeAllChildren(){cards.length=0;}}};
 const original=originalClass('MatchPlayType',{PopDlgBaseView:class{},CommonUtils:{},CommonPlat:{},PopDlgCtrl:{},hall_TileDefine:{HallGameTypeName:{Match:{id:4}}}},{
  Log:{info(){}},g_oPrefabLoader:{instantiate(){return{getComponent(){return{onInitItem(type,art){cards.push({type,art});}};},destroy(){throw Error('the six regular IDs cannot be discarded as the reserved match entry');}};}},
 });
 const view={...original,...config,lab_TitleArr:['比赛场','赛事中心','娱乐'],lab_spellTitleArr:['BISAICHANG','SAISHIZHONGXIN','YULE'],lab_Title:{},lab_spellTitle:{},NiuRankEnter:{},LeagueRewardEnter:{},ContentLayout:layout,PlayItemPre:{},closeComNode(){}};
 view.onInitYuLe({enterArr:ids.join('|'),tagArr:'0|0|0|0|0|0'});
 assert.equal(view.lab_Title.string,'娱乐');assert.equal(view.lab_spellTitle.string,'YULE');
 assert.deepEqual(cards.map(card=>card.type.TileIdx),ids);
 assert.deepEqual(cards.map(card=>card.art.typeBg.frame.uuid),config.typeBgSF.map(value=>value.frame.uuid));
 assert.deepEqual(cards.map(card=>card.art.typeBgIcon.frame.uuid),[2,3,5,1,4,3].map(index=>config.typeBgIconSF[index].frame.uuid));
 assert.ok(cards.every(card=>card.art.isYULE&&card.art.TagIcon===null));
 assert.equal(layout.paddingLeft,15);assert.equal(layout.paddingRight,15);assert.equal(layout.spacingX,35);
 const regular=originalClass('MatchPlayTypeItemView',{hall_TileDefine:{HallGameTypeName:{}},CommonUtils:{getSpellName:()=> 'HONGZHONGBUXIPAI'}},{
  g_tConst:{GameTypeCfgs:Object.fromEntries(Object.entries(HALL_GAMES_SOURCE.gameTypes).map(([key,value])=>[key,{TYPEID:value.typeID,Name:value.name}])),GameLayerCfg:{Hall_TabelSel:{id:'native-room-selector'}}},
  g_oLayerManager:{emitEvent2Dlg:(...args)=>cards.push(args)},
 });
 const item={...regular,TextLabel:{},lab_spell:{}};item.showAsRegular(870);item.onClickItemAction();
 const emitted=cards.at(-1);assert.equal(emitted[0],'native-room-selector');assert.equal(emitted[1],'onInit');
 assert.deepEqual({...emitted[2]},{nGameType:870,sGameName:'6红中不洗牌',isHallCome:true});
});

test('captured entertainment names and type IDs remain distinct from the legacy two-card fallback',()=>{
 assert.deepEqual(entertainmentFixture.entries.map(entry=>entry.id),ids);
 assert.deepEqual(entertainmentFixture.entries.map(entry=>entry.name),names);
 assert.ok(entertainmentFixture.entries.every(entry=>entry.tag===0));
 assert.equal(entertainmentFixture.entries[4].mode,'sixFixed');
 assert.ok(entertainmentFixture.entries.filter((_,index)=>index!==4).every(entry=>entry.mode===undefined));
 assert.notEqual((883%100)%6,(888%100)%6,'the flower icon disambiguates Crazy8');
 assert.notEqual((870%100)%6,(881%100)%6,'the beach-chair icon disambiguates SixFixed');
 for(const key of['sourceScreenshot','scrolledScreenshot'])assert.ok(fs.existsSync(new URL(entertainmentFixture[key],import.meta.url)));
 assert.deepEqual(hallGamesModel({mode:'fun'}).entryInfo.map(entry=>entry.id),[2,3]);
});

test('the six-card model uses original artwork, native SHRINK titles and three host-supplied balances',()=>{
 const before=JSON.stringify(entertainmentFixture),balances={beans:'75.2万',coins:'2800万',diamond:'0'},model=hallGamesModel({mode:'fun',...entertainmentFixture,balances,width:1280,height:720});
 assert.deepEqual(model.entryInfo.map(entry=>entry.id),ids);assert.equal(model.records.find(node=>node.name==='lab_title').text,'娱乐');
 assert.equal(model.records.find(node=>node.name==='lab_spelTtIyle').text,'YULE');
 for(const[index,entry]of model.entryInfo.entries()){
  const children=model.records.filter(node=>node.path.startsWith('entry'+index+'/'));
  assert.equal(children.find(node=>node.name==='TileIcon').sprite.frame.uuid,config.typeBgSF[index].frame.uuid);
  assert.equal(children.find(node=>node.name==='bgIcon').sprite.frame.uuid,config.typeBgIconSF[(entry.id%100)%6].frame.uuid);
  assert.ok(!children.find(node=>node.name==='TagIcon').active);
  const title=children.find(node=>node.name==='TextLabel'),bitmap=hallBitmapTextPatches(title);
  assert.equal(title.text,names[index]);assert.equal(title.label.font.id,50);assert.equal(title.label.useSystemFont,false);
  assert.equal(title.label.overflow,2);assert.equal(title.label.enableWrap,false);assert.equal(title.size[0],280);
  assert.equal(title.label.fontSize,index===1?29:32);near(title.position[1],-133.678+15);
  assert.equal(bitmap.fallback.length,0);assert.ok(bitmap.textWidth<=title.size[0]);
  assert.equal(bitmap.glyphs.length,[...title.text].length);
  assert.ok(fs.existsSync(new URL(title.label.font.frame.image,import.meta.url)));
  if(index===1)assert.ok(hallLabelWidth(title.text,{...title.label,fontSize:30})>280,'29 is the largest integer font size that fits the long original title');
  assert.equal(children.find(node=>node.name==='spell').text,entertainmentFixture.entries[index].en);
 }
 assert.deepEqual(model.records.filter(node=>node.path.startsWith('currency-')&&node.label).map(node=>node.text),['75.2万','2800万','0']);
 assert.deepEqual(model.controls.filter(control=>control.action.type==='currency').map(control=>control.action.currency),['beans','coins','diamond']);
 assert.ok(hallGamesModel({mode:'fun',...entertainmentFixture}).records.filter(node=>node.path.startsWith('currency-')&&node.label).every(node=>node.text==='—'));
 assert.equal(JSON.stringify(entertainmentFixture),before);assert.deepEqual(balances,{beans:'75.2万',coins:'2800万',diamond:'0'});
});

test('all six cards are reachable through the source horizontal content bounds and keep their mode/type payloads',()=>{
 const start=hallGamesModel({mode:'fun',...entertainmentFixture,width:1280,height:720,scroll:-999}),end=hallGamesModel({mode:'fun',...entertainmentFixture,width:1280,height:720,scroll:1e6});
 const content=start.records.find(node=>node.name==='content');
 assert.equal(content.size[0],15+6*343+5*35+15);assert.equal(start.scroll,0);assert.equal(end.scroll,end.maxScroll);
 near(end.maxScroll,content.size[0]-start.viewport.width/start.scale);
 const roots=start.entryInfo.map(entry=>start.records[entry.node]);
 for(let index=1;index<roots.length;index++)near(roots[index].position[0]-roots[index-1].position[0],378);
 assert.deepEqual(roots.map(node=>node.action.typeID),ids);assert.ok(roots.every(node=>node.action.type==='rooms'));
 assert.deepEqual(roots.map(node=>node.action.mode),['zodiac',undefined,undefined,undefined,'sixFixed',undefined]);
 const last=end.controls.find(control=>control.action.typeID===869);assert.ok(last);
 near(last.rect.x+last.rect.width+15*end.scale,end.viewport.x+end.viewport.width);
 assert.ok(!end.controls.some(control=>control.action.typeID===898),'a fully clipped first card cannot keep an offscreen hit area');
 assert.ok(end.controls.every(control=>control.action.type!=='rooms'||control.rect.x>=end.viewport.x&&control.rect.x+control.rect.width<=end.viewport.x+end.viewport.width+1e-9));
});

test('the entertainment selector preserves mouse/touch taps, captures only drags, and exposes clickable tail cards',async()=>{
 const keys=['document','Image','fetch','localStorage'],saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)])),calls=[],captures=[];let view,requests=0,writes=0;
 const ctx={clearRect(){},save(){},restore(){},beginPath(){},rect(){},clip(){},transform(){},drawImage(){},fillRect(){},fillText(){},strokeText(){}};
 const node=()=>({children:[],style:{},attributes:{},dataset:{},listeners:{},hidden:false,isConnected:true,setAttribute(key,value){this.attributes[key]=value;},append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},addEventListener(type,callback){this.listeners[type]=callback;},setPointerCapture(id){captures.push(id);},getContext(){return ctx;},getBoundingClientRect(){return{left:25,top:12,width:540,height:271};},querySelectorAll(){return this.children.flatMap(child=>[child,...child.querySelectorAll()]);},focus(){document.activeElement=this;},remove(){this.isConnected=false;}});
 try{
  globalThis.document={querySelector(){return null;},createElement:node,head:node(),activeElement:node()};globalThis.Image=class{decode(){return Promise.resolve();}};
  globalThis.fetch=()=>{requests++;throw Error('a selector cannot request game matching');};globalThis.localStorage={setItem(){writes++;}};
  const parent=node();view=createNativeHallGames(parent,{width:1080,height:542,onRooms:(mode,entry)=>calls.push(['rooms',mode,entry.typeID]),onCurrency:currency=>calls.push(['currency',currency])});await view.show('fun',entertainmentFixture);
  const panel=parent.children[0].children[0],buttons=()=>panel.children[2].children,center=button=>({x:25+(parseFloat(button.style.left)+parseFloat(button.style.width)/2)*.5,y:12+(parseFloat(button.style.top)+parseFloat(button.style.height)/2)*.5});
  function tap(button,pointerType,pointerId){const{x,y}=center(button),count=captures.length;panel.listeners.pointerdown({button:0,pointerType,pointerId,clientX:x,clientY:y});panel.listeners.pointerup();assert.equal(captures.length,count);let stopped=false;panel.listeners.click({preventDefault(){stopped=true;},stopImmediatePropagation(){stopped=true;}});assert.equal(stopped,false);button.onclick();}
  for(const[type,id]of[['mouse',1],['touch',2]])tap(buttons().find(button=>button.attributes['aria-label']==='十二生肖'),type,id);
  assert.deepEqual(calls,[['rooms','zodiac',898],['rooms','zodiac',898]]);calls.length=0;
  const first=buttons().find(button=>button.attributes['aria-label']==='十二生肖'),{x,y}=center(first);
  panel.listeners.pointerdown({button:0,pointerType:'touch',pointerId:3,clientX:x,clientY:y});assert.deepEqual(captures,[]);
  panel.listeners.pointermove({pointerId:3,clientX:x-5,preventDefault(){throw Error('5px remains a tap');}});assert.deepEqual(captures,[]);
  panel.listeners.pointermove({pointerId:3,clientX:x-80,preventDefault(){}});assert.deepEqual(captures,[3]);assert.ok(view.model.scroll>0&&view.model.scroll<view.model.maxScroll);
  panel.listeners.pointermove({pointerId:3,clientX:-2000,preventDefault(){}});panel.listeners.pointerup();assert.deepEqual(captures,[3]);assert.equal(view.model.scroll,view.model.maxScroll);
  let blocked=false;panel.listeners.click({preventDefault(){blocked=true;},stopImmediatePropagation(){blocked=true;}});assert.equal(blocked,true);assert.deepEqual(calls,[]);
  tap(buttons().find(button=>button.attributes['aria-label']==='6红中不洗牌'),'mouse',4);tap(buttons().find(button=>button.attributes['aria-label']==='四季常春'),'touch',5);
  assert.deepEqual(calls,[['rooms','sixFixed',870],['rooms',undefined,869]]);calls.length=0;
  for(const button of buttons().filter(button=>button.dataset.action==='currency'))button.onclick();assert.deepEqual(calls,[['currency','beans'],['currency','coins'],['currency','diamond']]);
  const last=buttons().find(button=>button.attributes['aria-label']==='四季常春'),point=center(last);panel.listeners.pointerdown({button:0,pointerType:'touch',pointerId:6,clientX:point.x,clientY:point.y});panel.listeners.pointermove({pointerId:6,clientX:2000,preventDefault(){}});panel.listeners.pointerup();assert.equal(view.model.scroll,0);
  assert.equal(requests,0);assert.equal(writes,0);
 }finally{view?.dispose();for(const[key,value]of saved)if(value)Object.defineProperty(globalThis,key,value);else delete globalThis[key];}
});

// The former hall host has been replaced by the public card catalog.
// Public route exclusions and preview behavior are covered by hall-game-catalog.test.js.
