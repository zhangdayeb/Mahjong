import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {sanguoRoomScreenshotFixture} from './hall-games-study/sanguo-rooms-fixture.js';
import {variants,variantKeys,roomsForMode,currentRoom} from './rooms-config.js';
import {hallGamesModel,HALL_GAMES_SOURCE} from './native-hall-games.js';
import {getSanguoTableEntry} from './sanguo-table-entry.js';

test('Sanguo screenshot scenes preserve six observed tiers and an unconfirmed supreme scene ID',()=>{
 const fixture=sanguoRoomScreenshotFixture,scenes=roomsForMode('sanguo');
 assert.equal(fixture.typeID,911);
 assert.equal(fixture.recommendedRoomID,'622');
 assert.deepEqual(scenes.map(scene=>scene.name),['新手场','初级场','进阶场','高级场','大师场','至尊场']);
 assert.deepEqual(scenes.map(scene=>scene.base),[10,100,1000,10000,10000,10000]);
 assert.deepEqual(scenes.map(scene=>scene.number),['10','100','1000','10000','10000','10000']);
 assert.deepEqual(scenes.map(scene=>scene.people),[295,313,649,276,202,255]);
 assert.deepEqual(scenes.map(scene=>scene.limit.replace(/[–—]/g,'-')),['10万-4000万','2000万-6亿','5亿-无限制','20亿-无限制','60亿-无限制','120亿-无限制']);
 assert.deepEqual(scenes.slice(0,5).map(scene=>scene.sceneID),[621,622,623,624,625]);
 assert.deepEqual(variants.sanguo.sceneIDs,[621,622,623,624,625],'the static source list cannot acquire an invented sixth server ID');
 assert.equal(scenes[5].sceneID,null);
 assert.equal(scenes[5].referenceOnly,true);
 assert.ok(scenes.every(scene=>scene.displayOnly&&scene.currency==='coins'));
 assert.ok(scenes.every(scene=>fs.existsSync(new URL(scene.nativeImage,import.meta.url))),'all six original tier images are available');
 assert.equal(variants.sanguo.playable,true,'Sanguo routes to its independent local engine');assert.equal(variants.sanguo.localPractice,true);
 assert.deepEqual(variantKeys('sanguo'),['sanguo']);
 scenes[0].base=999999;assert.equal(roomsForMode('sanguo')[0].base,10,'callers cannot overwrite the stored screenshot fixture');
});

test('the snapshot defaults to its observed initial tier without leaking into other modes',()=>{
 assert.equal(currentRoom('?mode=sanguo').room.id,'622');
 assert.equal(currentRoom('?mode=sanguo&room=621').room.id,'621');
 assert.equal(currentRoom('?mode=sanguo&room=unknown').room.id,'622');
 const supreme=roomsForMode('sanguo')[5];
 assert.equal(currentRoom('?mode=sanguo&room='+supreme.id).room.sceneID,null);
 assert.equal(currentRoom('?mode=zodiac').room.sceneID,557);
 assert.equal(currentRoom('?mode=red').room.base,2000);
 assert.equal(roomsForMode('zodiac').length,5);
 assert.deepEqual(roomsForMode('zodiac').map(scene=>scene.base),[10,10,1000,10000,10000]);
 assert.deepEqual(roomsForMode('zodiac').map(scene=>scene.people),[474,432,717,290,294]);
 assert.ok(roomsForMode('zodiac').every(scene=>scene.displayOnly&&scene.currency==='coins'));
 const provided=[{id:'observed-other-room',sceneID:null,name:'显式观察场次',base:7,people:8,limit:'已观察'}];
 const scenes=roomsForMode('sanguo',provided);assert.deepEqual(scenes,provided);scenes[0].base=99;assert.equal(provided[0].base,7);
});

test('native room rendering preserves six scene actions and its displayed quick-start target',()=>{
 const model=hallGamesModel({mode:'rooms',typeID:911,width:1000,height:506,showFanGather:true});
 const sceneActions=model.controls.filter(control=>control.action.type==='scene');
 assert.equal(sceneActions.length,6);
 assert.deepEqual(sceneActions.map(control=>control.action.scene.sceneID),[621,622,623,624,625,null]);
 assert.ok(sceneActions.every(control=>control.action.typeID===911));
 assert.equal(model.quickScene.id,'622');
 assert.equal(model.quickScene.name,'初级场');
 assert.ok(model.records.some(node=>['lab_gameScene','lab_enterSceneDes'].includes(node.name)&&node.text.includes('初级场')),'quick-start subtitle matches the scene it refers to');
 const currencyFrames=HALL_GAMES_SOURCE.components[196].find(component=>component.spIcon)?.spIcon;
 assert.ok(currencyFrames?.[1]?.frame,'the original finger-coin entry condition icon is collected');
 const icons=model.records.filter(node=>node.name==='img_bean'&&node.path.startsWith('scene'));
 assert.equal(icons.length,6);
 assert.ok(icons.every(node=>node.sprite.frame.uuid===currencyFrames[1].frame.uuid),'Sanguo entry limits use finger coins rather than game beans');
 const explicit=hallGamesModel({mode:'rooms',typeID:911,scenes:roomsForMode('sanguo'),recommendedRoomID:'621'});
 assert.equal(explicit.quickScene.id,'621','explicit host recommendation overrides the snapshot default');
 const zodiac=hallGamesModel({mode:'rooms',typeID:898});
 assert.deepEqual(zodiac.entryInfo.map(entry=>entry.sceneID),[556,557,558,559,560]);
});

test('the original recommendation code selects the target primary tier using finger coins and the explicit Sanguo type',()=>{
 // These are normalized screenshot units, not recovered online protocol
 // payloads. A zero source-default JumpSceneCoefficient makes the recommendation
 // depend on the visible entry intervals, without inventing a blind multiplier.
 const scenes=[
  [621,100000,40000000],[622,20000000,600000000],[623,500000000,-1],
  [624,2000000000,-1],[625,6000000000,-1],
 ].map(([typeID,enterFingerCoinLower,enterFingerCoinUpper],index)=>({typeID,gameType:911,blind:0,enterCoinLower:0,enterCoinUpper:0,enterFingerCoinLower,enterFingerCoinUpper,extra:'sceneIndex:'+index}));
 const user={coin:752000,fingerCoin:28000000},requests=[];
 const modules={
  mod_gamecfg:{getGameTypeSceneCfgs(type){requests.push(type);return type===911?scenes:[];}},
  SwitchModel:{refreshJumpToPlayCfg(){return null;},getTableItemSelCfg(){return{};},getJumpSceneCoefficient(){return 0;}},
  UserLocalModel:{getData(){return 144;}},sdkUser:user,SectionMatchMod:{isSectionMatchState:false},
  DianFengSaiMod:{canSupportScene(){return false;}},PrivateMsgModel:{getGameNameByGameType:type=>type===911?'三国麻将':'其它玩法'},
 };
 const globals={window:{},cc:{_RF:{push(){},pop(){}}},g_oData:{get:key=>modules[key]},g_tData:Object.fromEntries(Object.keys(modules).map(key=>[key,key])),g_oMjProject:{CurGameTypeInfo:{nGameType:866}},g_tConst:{GameTypeCfgs:{JBCXZDDHSZ:{TYPEID:149}},GameConfig:{quickRecommendCheckCfg:{Coin:{value:'coin',lower:'enterCoinLower',upper:'enterCoinUpper'},ZCoin:{value:'fingerCoin',lower:'enterFingerCoinLower',upper:'enterFingerCoinUpper'}}}}};
 function load(name,dependencies){const source=fs.readFileSync(new URL('../asset-study/readable/modules/'+name+'.js',import.meta.url),'utf8'),factory=vm.runInNewContext('({'+source+'})',globals)[name][0],module={exports:{}};factory(key=>dependencies[key],module);return module.exports;}
 const common=load('CommonGT',{RoomTypeEnum:{}}),original=load('QuikStart',{CommonGT:common});
 assert.equal(common.isZCoinGameType(911),true);
 assert.equal(original.getRecommendSceneCfg(911).typeID,622);
 assert.equal(original.getRecommendSceneCfg(911).fullDesc,'三国麻将.初级场');
 assert.ok(requests.every(type=>type===911),'explicit room type wins over last-played 144 and project-default 866');
 user.fingerCoin=5000000;
 assert.equal(original.getRecommendSceneCfg(911).typeID,621,'primary is this screenshot state, not a universal default for all balances');
});

// Run the page's actual orchestration with view factories replaced by inert
// spies. Table preload and navigation would fail this test if a display-only
// scene ever slipped into the playable bloodflow path.
function sourceRoomPage(){
 const calls=[],elements=new Map(),listeners=new Map();
 const node=(tagName='DIV')=>({tagName,children:[],hidden:false,textContent:'',dataset:{},style:{removeProperty(key){delete this[key];}},setAttribute(){},addEventListener(type,callback){listeners.set(type,callback);}});
 const lobby=node(),background=node(),dialog=node('DIALOG'),okay=node('BUTTON'),close=node('BUTTON'),heading=node('H2'),body=node('P');
 dialog.id='info';dialog.hidden=true;dialog.style.display='none';dialog.open=false;dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};
 dialog.querySelector=selector=>({'.okay':okay,'.close':close,h2:heading,p:body})[selector];lobby.children=[background,dialog];
 const balanceButtons=[node('BUTTON'),node('BUTTON'),node('BUTTON')],balanceValues=['75.2万','2800万','0'].map(textContent=>({...node('SPAN'),textContent}));
 for(const[selector,value]of[['#lobby',lobby],['#info',dialog],['#variant-title',node('BUTTON')],['#room-help',node('BUTTON')],['.month',node('BUTTON')],['[data-info="玩法指引"]',node('BUTTON')],['[data-info="番型收集"]',node('BUTTON')]])elements.set(selector,value);
 const document={querySelector:selector=>elements.get(selector),querySelectorAll:selector=>selector==='.balances button'?balanceButtons:selector==='.balances span'?balanceValues:[],body:{classList:{add(){},contains(){return false;}}}};
 const location={search:'?mode=sanguo',href:'http://localhost/rooms.html?mode=sanguo'};
 let options,payload;
 const context={document,location,innerWidth:1104,innerHeight:554,URLSearchParams,URL,variants,variantKeys,roomsForMode,currentRoom:()=>currentRoom(location.search),addEventListener(){},
  localStorage:{getItem(){return null;}},getSanguoTableEntry,enterSanguoTable(payload){const entry=getSanguoTableEntry(payload);assert.ok(entry);calls.push(['sanguoEntry',entry.href,entry.sceneID]);return Promise.resolve(true);},enterRoom(){calls.push('enterRoom');throw Error('display-only Sanguo cannot enter the bloodflow engine');},fetch(){calls.push('fetch');throw Error('display-only Sanguo cannot preload the bloodflow engine');},
  createRoomRules:()=>({show:type=>calls.push(['rules',type])}),createNativeCollection:()=>({drawEntry(){},show:mode=>calls.push(['collection',mode])}),
  createNativeWeekCard:()=>({show:()=>calls.push('week')}),createNativeShop:()=>({show:currency=>calls.push(['shop',currency])}),
  createNativeSanguoGuide:()=>({show:options=>calls.push(['guide',options])}),createNativeZodiacGuide:()=>({show:options=>calls.push(['zodiacGuide',options])}),sanguoGuideToday:()=> '2026_10_6',readSanguoGuideState:()=>({popped:true}),shouldAutoOpenSanguoGuide:()=>false,recordSanguoGuideShown(){throw Error('automatic guide is disabled for the route fixture');},
  createNativeHallGames:(parent,next)=>{assert.equal(parent,lobby);options=next;return{model:{controls:[]},show:(view,data)=>{payload={view,data};return Promise.resolve();}};},
 };
 const code=fs.readFileSync(new URL('rooms.js',import.meta.url),'utf8').replace(/^import .*;\r?$/gm,'');
 context.practiceWallet={show:()=>calls.push(['wallet'])};context.bindPracticeWallet=()=>{};
 context.installGameAudio=()=>{};
 vm.runInNewContext(code,context,{filename:'rooms.js'});
 return{calls,options,payload,location,dialog,heading,body,listeners,background};
}

test('every Sanguo tier and quick start opens its own preparation table without loading a basic table',()=>{
 const view=sourceRoomPage();
 assert.equal(view.background.hidden,true);
 assert.equal(view.payload.data.typeID,911);
 assert.equal(view.payload.data.scenes.length,6);
 for(const scene of view.payload.data.scenes){
  view.options.onSelect({type:'scene',typeID:911,scene});
  const expected=getSanguoTableEntry({typeID:911,scene});
  assert.deepEqual(view.calls.at(-1),['sanguoEntry',expected.href,scene.sceneID]);
  assert.equal(view.dialog.open,false);
 }
 view.options.onQuick({mode:'rooms',typeID:911,quickScene:roomsForMode('sanguo')[1]});assert.deepEqual(view.calls.at(-1),['sanguoEntry','sanguo-table.html?room=622',622]);assert.equal(view.dialog.open,false);
 const event={button:0,target:{closest:()=>({href:'reference.html?mode=sanguo&room=621'})},preventDefault(){this.prevented=true;}};
 view.listeners.get('click')(event);assert.equal(event.prevented,true);
 assert.equal(view.location.href,'http://localhost/rooms.html?mode=sanguo');assert.deepEqual(view.calls.at(-1),['sanguoEntry','sanguo-table.html?room=621',621]);
 assert.equal(view.calls.length,8);assert.ok(view.calls.every(call=>call[0]==='sanguoEntry'));
});
