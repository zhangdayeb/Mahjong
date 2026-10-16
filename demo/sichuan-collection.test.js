import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {getSanguoTableEntry} from './sanguo-table-entry.js';
import {sichuanCollectionFixture} from './hall-games-study/sichuan-collection-fixture.js';
import {hallGamesModel,createNativeHallGames,HALL_GAMES_SOURCE} from './native-hall-games.js';

// Execute the collected client methods; do not reproduce their implementation
// in the local model test. All account, resource and event services are inert.
function originalView(name,{dependencies={},globals={}}={}){
 let definition;
 const context={cc:{_RF:{push(){},pop(){}},Class(value){definition=value;return function(){};},Node:class{},Prefab:class{},Label:class{},Widget:class{}},...globals};
 const source=fs.readFileSync(new URL('../asset-study/readable/modules/'+name+'.js',import.meta.url),'utf8');
 const factory=vm.runInNewContext('({'+source+'})',context)[name][0];
 factory(key=>dependencies[key],{exports:{}});
 return definition;
}
function container(){return{children:[]};}
function sourceTile(){let parent=null;return{active:true,data:null,get parent(){return parent;},set parent(value){if(parent)parent.children.splice(parent.children.indexOf(this),1);parent=value;if(value)value.children.push(this);},getComponent(){return{init:data=>{this.data=data;}};}};}

test('original province selector removes the duplicate red tile, closes its layout gap, and preserves the raw quick-start type',()=>{
 const calls=[],rawTypes=[866,868,870,149,144,864,143,181],raw=rawTypes.map(iID=>({iID,sName:'source-type-'+iID,iTag:0}));
 const original=originalView('ProvinceGameTypeView',{
  dependencies:{PopDlgBaseView:class{},QuikStart:{getRecommendSceneCfg(type){calls.push(['recommend',type]);return{fullDesc:type===866?'血流红中.新手场':'其他推荐'};},quickStart(...args){calls.push(['quick',...args]);}},CommonGT:{},PopDlgCtrl:{}},
  globals:{g_tConst:{GameTypeCfgs:{XLHZMJ2:{TYPEID:866},XLHZMJ3:{TYPEID:868}}},g_tData:{mod_gamecfg:'cfg'},g_oData:{get:()=>({isGameTypeExist:()=>true})},g_oPrefabLoader:{instantiate:()=>sourceTile()}},
 });
 const view={...original,containerLineOne:container(),containerLineTwo:container(),GameTypeItem:{},model:{supplementGameTypes(){throw Error('eight supplied raw types need no supplement');}},_provinceCfg:{sName:'四川',PlayCfgs:{CoinGame:raw}},lab_QuickGameType:{string:''},_xlhz866TileNode:null,_xlhz868TileNode:null};
 view.initProvinceGameTile(raw);
 assert.deepEqual(view.containerLineOne.children.map(node=>node.data.nGameType),[866,868,870,149,144]);
 assert.equal(view.containerLineOne.children[0].active,false,'duplicate bloodflow-red source tile is hidden');
 assert.deepEqual(view.containerLineOne.children.filter(node=>node.active).map(node=>node.data.nGameType),[868,870,149,144],'Cocos Layout receives four active upper cards without a gap');
 assert.deepEqual(view.containerLineTwo.children.map(node=>node.data.nGameType),[864,143,181],'the lower first card was moved, not cloned');
 assert.deepEqual(Array.from(view._tileGTidTop2),[866,868]);
 assert.equal(raw[0].iID,866,'visual duplicate handling must not change the raw province recommendation list');
 view.initQuickstartBtn();assert.equal(view.lab_QuickGameType.string,'血流红中.新手场');
 view.onClickQuick();assert.deepEqual(calls,[['recommend',undefined],['recommend',866],['quick',true,866]]);
 const redOnly={...view,containerLineOne:container(),containerLineTwo:container(),_xlhz866TileNode:null,_xlhz868TileNode:null};
 redOnly.initProvinceGameTile([866,149,144,870,864,143,181,187].map(iID=>({iID,sName:'source-type-'+iID,iTag:0})));
 assert.equal(redOnly.containerLineOne.children.length,4);assert.equal(redOnly.containerLineTwo.children.length,4);
 assert.equal(redOnly.containerLineOne.children[0].active,true,'866 remains visible if the 868 companion is absent');
 // Synthetic source indices demonstrate the 13-node algorithm. Apart from
 // the duplicate-check pair these numbers are layout fixtures, not asserted
 // online game assignments for the newly visible screenshot cards.
 const thirteen=Array.from({length:13},(_,index)=>({iID:index===0?866:index===2?868:90000+index,sName:'raw-slot-'+index,iTag:0}));
 const full={...view,containerLineOne:container(),containerLineTwo:container(),_xlhz866TileNode:null,_xlhz868TileNode:null};
 full.initProvinceGameTile(thirteen);
 const upper=full.containerLineOne.children.filter(node=>node.active).map(node=>node.data.index),lower=full.containerLineTwo.children.filter(node=>node.active).map(node=>node.data.index);
 assert.deepEqual(upper,[1,2,3,8,10,12,4]);assert.deepEqual(lower,[5,6,7,9,11]);
 assert.equal(upper.length,7);assert.equal(lower.length,5);
 assert.deepEqual(upper.map(index=>index%8),[1,2,3,0,2,4,4]);
 assert.deepEqual(lower.map(index=>index%8),[5,6,7,1,3]);
});

test('original province switch saves three unique recent choices and returns to refresh the selector',()=>{
 const calls=[],saved={recent:[34,51,44,34]},modules={
  UserLocalModel:{getData:()=>saved,setData(key,value){calls.push(['save',key,Array.from(value.recent)]);saved.recent=Array.from(value.recent);}},
  AreaMod:{setCurAreaCode(code){calls.push(['area',code]);}},
 };
 const original=originalView('ProvinceChoose',{
  dependencies:{AlertDlgBaseView:class{},PopDlgCtrl:{}},
  globals:{g_tData:{UserLocalModel:'UserLocalModel',AreaMod:'AreaMod'},g_oData:{get:key=>modules[key]},g_tEvent:{START_OTHER_LIST_ANIMATION:'refresh-underlying-selector'},g_oEvent:{dispatchEvent:event=>calls.push(['event',event])}},
 });
 const view={...original,close(){calls.push(['close']);}};
 const areas=Array.from(view.getAreaList());
 assert.equal(areas.length,34);assert.deepEqual({...areas.find(area=>area.iAreaCode===51)},{iAreaCode:51,sName:'四川'});
 view.clickItem(51);
 assert.deepEqual(calls,[['save','ProvinceChoose',[51,34,44]],['area',51],['close'],['event','refresh-underlying-selector']]);
 view.selectList={active:false};view.toggleSelectList();assert.equal(view.selectList.active,true);view.toggleSelectList();assert.equal(view.selectList.active,false);
});

test('the Sichuan appearance fixture preserves observed names, counts, colors and unresolved assignments',()=>{
 const fixture=sichuanCollectionFixture;
 assert.equal(fixture.province,'四川');assert.equal(fixture.areaCode,51);
 assert.deepEqual(fixture.entries.map(entry=>entry.name),['6红中不洗牌','血流6红中','血流换三张','四川倒倒胡','癞子血流','四季常春','血流成河','内江麻将','巴中麻将','血战到底','大众麻将','血战换三张']);
 assert.deepEqual(fixture.entries.map(entry=>entry.people),[904,5688,16984,2211,1021,1996,3462,2532,1674,25474,11126,18806]);
 assert.deepEqual(fixture.entries.map(entry=>entry.sourceIndex),[1,2,3,0,5,6,7,1,2,3,4,4]);
 assert.equal(fixture.entries[0].typeID,null,'the screenshot does not resolve 870 versus 881');
 assert.equal(fixture.entries[2].typeID,null,'exchange aliases remain unresolved');
 const slots=row=>fixture.entries.filter(entry=>entry.row===row).sort((a,b)=>a.column-b.column);
 assert.deepEqual(slots(0).map(entry=>entry.originalIndex),[1,2,3,8,10,12,4]);
 assert.deepEqual(slots(1).map(entry=>entry.originalIndex),[5,6,7,9,11]);
 assert.deepEqual(slots(0).map(entry=>entry.column),[0,1,2,3,4,5,6]);
 assert.deepEqual(slots(1).map(entry=>entry.column),[0,1,2,3,4]);
 assert.equal(new Set(fixture.entries.map(entry=>entry.row+':'+entry.column)).size,12);
 for(const index of[3,7,8,9,10,11])assert.ok(!fixture.entries[index].partialName&&!fixture.entries[index].titlePrefix,'the second screenshot resolves the full centered title');
 assert.deepEqual([fixture.entries[9].typeID,fixture.entries[11].typeID],[143,148]);
 assert.ok([fixture.entries[9],fixture.entries[11]].every(entry=>entry.mode===undefined),'war variants cannot inherit bloodflow modes');
 assert.deepEqual(fixture.quickRecommendation,{mode:'red',typeID:866,name:'血流红中',roomId:'beginner',description:'血流红中.新手场'});
 assert.ok(fs.existsSync(new URL(fixture.sourceScreenshot,import.meta.url)));
 assert.ok(fs.existsSync(new URL(fixture.scrolledScreenshot,import.meta.url)));
});

test('the explicit Sichuan profile binds its title, native card artwork and recommendation independently of the first visible card',()=>{
 const before=JSON.stringify(sichuanCollectionFixture),model=hallGamesModel({mode:'collection',...sichuanCollectionFixture,width:1280,height:720});
 assert.equal(model.records.find(node=>node.name==='lab_province').text,'四川麻将');
 assert.equal(model.records.find(node=>node.name==='lab_enterSceneDes').text,'血流红中.新手场');
 assert.deepEqual(model.quickScene,sichuanCollectionFixture.quickRecommendation);
 assert.equal(model.controls.find(control=>control.action.type==='rooms').action.mode,'sixFixed');
 assert.equal(model.quickScene.mode,'red','the hidden raw recommendation does not follow the visible six-red card');
 const backgrounds=HALL_GAMES_SOURCE.components[222].find(component=>component.spfBgs).spfBgs;
 for(const[index,entry]of model.entryInfo.entries()){
  const card=model.records[entry.node];
  assert.equal(card.sprite.frame.uuid,backgrounds[sichuanCollectionFixture.entries[index].sourceIndex].frame.uuid);
  const label=model.records.find(node=>node.name==='lab_gameType'&&node.path.startsWith('collection'+index+'/'));
  assert.ok(label.text.startsWith(sichuanCollectionFixture.entries[index].titlePrefix||sichuanCollectionFixture.entries[index].name));
 }
 assert.deepEqual(model.records.filter(node=>node.name==='lab_membernum').map(node=>node.text),['904人','5688人','16984人','2211人','1021人','1996人','3462人','2532人','1674人','25474人','11126人','18806人']);
 assert.equal(model.records.filter(node=>node.name==='tag_hot'&&node.active).length,2);
 assert.ok(model.records.find(node=>node.name==='tag_hot'&&node.path.startsWith('collection2/')).active);
 assert.ok(model.records.find(node=>node.name==='tag_hot'&&node.path.startsWith('collection10/')).active);
 assert.deepEqual(model.entryInfo.map(entry=>[entry.row,entry.column]),sichuanCollectionFixture.entries.map(entry=>[entry.row,entry.column]));
 model.quickScene.name='caller-owned display change';assert.equal(JSON.stringify(sichuanCollectionFixture),before,'rendering and host display state cannot modify the recorded source appearance');
 // The source's generic alternate list is still a useful fallback when the
 // caller has no observed region, not a globally overwritten Sichuan catalog.
 assert.deepEqual(hallGamesModel({mode:'collection'}).entryInfo.map(entry=>entry.typeID),[149,143,181,187,189,183,182,188]);
});

test('both selector rows share the same clipped horizontal movement and the exact source bounds',()=>{
 const begin=hallGamesModel({mode:'collection',...sichuanCollectionFixture,width:1280,height:720,scroll:-999});
 const end=hallGamesModel({mode:'collection',...sichuanCollectionFixture,width:1280,height:720,scroll:1e6});
 assert.equal(begin.scroll,0);assert.equal(end.scroll,end.maxScroll);
 const backgrounds=HALL_GAMES_SOURCE.components[222].find(component=>component.spfBgs).spfBgs;
 const rowWidth=row=>{const entries=sichuanCollectionFixture.entries.filter(entry=>entry.row===row);return 5+entries.reduce((sum,entry)=>sum+backgrounds[entry.sourceIndex].frame.rect[2],0)+(entries.length-1)*20;};
 assert.equal(begin.records.find(node=>node.name==='lineOne').size[0],rowWidth(0));
 assert.equal(begin.records.find(node=>node.name==='lineTwo').size[0],rowWidth(1));
 assert.equal(rowWidth(0),2391);assert.equal(rowWidth(1),1703);
 assert.equal(end.maxScroll,Math.max(rowWidth(0),rowWidth(1))-begin.viewport.width/begin.scale);
 const right=begin.viewport.x+begin.viewport.width;
 for(const index of[3,7]){
  const card=begin.records[begin.entryInfo[index].node],control=begin.controls.find(value=>value.index===card.index);
  assert.ok(control.rect.width>0&&control.rect.width<card.size[0]*begin.scale,'rightmost upper/lower card is partially visible at the starting edge');
  assert.ok(Math.abs(control.rect.x+control.rect.width-right)<1e-9,'hit area ends exactly at the original viewport mask');
  assert.equal(control.action.typeID,sichuanCollectionFixture.entries[index].typeID,'clipping retains the now-resolved card identity');
 }
 for(let index=0;index<12;index++){
  const a=begin.records[begin.entryInfo[index].node],b=end.records[end.entryInfo[index].node];
  assert.ok(Math.abs(a.world[4]-b.world[4]-end.maxScroll)<1e-9,'both rows move by the same native scroll value');
  assert.equal(a.world[5],b.world[5]);
 }
 const endUpper=end.controls.find(control=>control.index===end.entryInfo[11].node),endLower=end.controls.find(control=>control.index===end.entryInfo[9].node);
 assert.equal(endUpper.action.name,'血战换三张');assert.equal(endLower.action.name,'血战到底');
 assert.ok(Math.abs(endUpper.rect.x+endUpper.rect.width-right)<1e-9,'the final upper card fits at the true right boundary');
 assert.ok(Math.abs(right-(endLower.rect.x+endLower.rect.width)-(rowWidth(0)-rowWidth(1))*end.scale)<1e-9,'the lower tail stays empty by its two missing columns');
 assert.equal(end.entryInfo.filter(entry=>entry.row===0).length,7);assert.equal(end.entryInfo.filter(entry=>entry.row===1).length,5);
 assert.ok(!end.entryInfo.some(entry=>entry.row===1&&entry.column>4));
 assert.ok(end.controls.every(control=>control.action.type!=='rooms'||control.rect.x>=end.viewport.x&&control.rect.x+control.rect.width<=end.viewport.x+end.viewport.width+1e-9));
});

test('a card tap stays uncaptured, while a scaled-parent drag captures after its threshold and never selects',async()=>{
 const keys=['document','Image','fetch','localStorage'],saved=new Map(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)])),calls=[],captures=[];
 let requests=0,writes=0,view;
 const context={clearRect(){},save(){},restore(){},beginPath(){},rect(){},clip(){},transform(){},drawImage(){},fillRect(){},fillText(){},strokeText(){}};
 const element=()=>({children:[],style:{},attributes:{},dataset:{},listeners:{},hidden:false,isConnected:true,setAttribute(key,value){this.attributes[key]=value;},append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},addEventListener(type,callback){this.listeners[type]=callback;},setPointerCapture(id){captures.push(id);},getContext(){return context;},getBoundingClientRect(){return{left:40,top:20,width:540,height:271};},querySelectorAll(){return this.children.flatMap(node=>[node,...node.querySelectorAll()]);},focus(){document.activeElement=this;},remove(){this.isConnected=false;}});
 try{
  globalThis.document={querySelector(){return null;},createElement:element,head:element(),activeElement:element()};
  globalThis.Image=class{decode(){return Promise.resolve();}};
  globalThis.fetch=()=>{requests++;throw Error('selector scrolling cannot request an account');};
  globalThis.localStorage={setItem(){writes++;}};
  const parent=element();view=createNativeHallGames(parent,{width:1080,height:542,onRooms:(mode,entry)=>calls.push(['card',mode,entry.typeID]),onQuick:model=>calls.push(['quick',model.quickScene.typeID])});
  await view.show('collection',sichuanCollectionFixture);
  const panel=parent.children[0].children[0];
  assert.equal(view.model.scroll,0);
  const card=panel.children[2].children.find(node=>node.attributes['aria-label']==='6红中不洗牌');
  assert.ok(card,'the visible native card has a real button callback');
  for(const[pointerType,pointerId]of[['mouse',9],['touch',10]]){
   panel.listeners.pointerdown({button:0,pointerType,pointerId,clientX:200,clientY:140});
   const upWasCaptured=captures.includes(pointerId);
   panel.listeners.pointerup();
   assert.deepEqual(captures,[],'a normal '+pointerType+' tap must not retarget pointerup to the panel');
   let tapStopped=false;panel.listeners.click({preventDefault(){tapStopped=true;},stopImmediatePropagation(){tapStopped=true;}});
   // Browser click targeting uses pointerdown/up's common target. If pointerup
   // was captured by the panel, the button would never receive its onclick.
   if(!tapStopped&&!upWasCaptured)card.onclick();
   assert.equal(tapStopped,false);
  }
  assert.deepEqual(calls,[['card','sixFixed',null],['card','sixFixed',null]]);
  calls.length=0;
  panel.listeners.pointerdown({button:0,pointerType:'touch',pointerId:1,clientX:200,clientY:140});
  assert.deepEqual(captures,[]);
  panel.listeners.pointermove({pointerId:1,clientX:205,preventDefault(){throw Error('exactly 5px is still a tap');}});
  assert.deepEqual(captures,[]);assert.equal(view.model.scroll,0);
  panel.listeners.pointermove({pointerId:1,clientX:80,preventDefault(){}});
  assert.deepEqual(captures,[1],'capture starts only when horizontal movement exceeds 5px');
  assert.ok(view.model.scroll>0&&view.model.scroll<view.model.maxScroll,'a short drag only moves partway through twelve cards');
  panel.listeners.pointermove({pointerId:1,clientX:-1000,preventDefault(){}});
  assert.deepEqual(captures,[1],'one drag only captures once');
  panel.listeners.pointerup();
  assert.equal(view.model.scroll,view.model.maxScroll);
  let stopped=false;panel.listeners.click({preventDefault(){stopped=true;},stopImmediatePropagation(){stopped=true;}});
  assert.equal(stopped,true);assert.deepEqual(calls,[]);
  for(const[name,typeID]of[['巴中麻将',830],['大众麻将',181],['血战到底',143],['血战换三张',148]]){
   const button=panel.children[2].children.find(node=>node.attributes['aria-label']===name);assert.ok(button,'dragging exposes '+name);
   const x=40+(parseFloat(button.style.left)+parseFloat(button.style.width)/2)*.5,y=20+(parseFloat(button.style.top)+parseFloat(button.style.height)/2)*.5,count=captures.length;
   panel.listeners.pointerdown({button:0,pointerType:'mouse',pointerId:20+typeID,clientX:x,clientY:y});panel.listeners.pointerup();
   assert.equal(captures.length,count);let blocked=false;panel.listeners.click({preventDefault(){blocked=true;},stopImmediatePropagation(){blocked=true;}});
   assert.equal(blocked,false);button.onclick();
  }
  assert.deepEqual(calls,[['card',undefined,830],['card',undefined,181],['card',undefined,143],['card',undefined,148]],'newly exposed dialect and war cards retain their own IDs and have no bloodflow mode');
  calls.length=0;
  panel.listeners.pointerdown({button:0,pointerType:'touch',pointerId:2,clientX:200,clientY:140});
  assert.deepEqual(captures,[1],'reverse drag also waits for movement before capture');
  panel.listeners.pointermove({pointerId:2,clientX:2000,preventDefault(){}});panel.listeners.pointerup();
  assert.deepEqual(captures,[1,2]);
  assert.equal(view.model.scroll,0);
  assert.equal(view.model.quickScene.typeID,866,'dragging cannot retarget the footer recommendation');
  assert.equal(requests,0);assert.equal(writes,0);
 }finally{view?.dispose();for(const[key,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}
});

// The former hall host has been replaced by the public card catalog.
// Public route exclusions and preview behavior are covered by hall-game-catalog.test.js.
