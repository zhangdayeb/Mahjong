import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {getSanguoTableEntry} from './sanguo-table-entry.js';
import {zodiacRoomScreenshotFixture as fixture} from './hall-games-study/zodiac-rooms-fixture.js';
import {variants,variantKeys,roomsForMode,currentRoom} from './rooms-config.js';
import {hallGamesModel,HALL_GAMES_SOURCE as source,screenRect} from './native-hall-games.js';
import {hallBitmapTextPatches} from './native-hall-games-text.js';

const sceneIDs=[556,557,558,559,560],names=['新手场','初级场','进阶场','高级场','大师场'];
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('the five observed zodiac tiers preserve source IDs, coin thresholds and the captured primary recommendation',()=>{
 const scenes=roomsForMode('zodiac');
 assert.equal(fixture.typeID,898);assert.equal(fixture.recommendedRoomID,'557');
 assert.deepEqual(scenes.map(scene=>scene.id),sceneIDs.map(String));
 assert.deepEqual(scenes.map(scene=>scene.sceneID),sceneIDs);
 assert.deepEqual(variants.zodiac.sceneIDs,sceneIDs);assert.deepEqual(variantKeys('zodiac'),['zodiac']);
 assert.deepEqual(scenes.map(scene=>scene.name),names);
 assert.deepEqual(scenes.map(scene=>scene.base),[10,10,1000,10000,10000]);
 assert.deepEqual(scenes.map(scene=>scene.number),['10','10','1000','10000','10000']);
 assert.deepEqual(scenes.map(scene=>scene.people),[474,432,717,290,294]);
 assert.deepEqual(scenes.map(scene=>scene.limit),['10万-4000万','2000万-6亿','5亿-无限制','20亿-无限制','60亿-无限制']);
 assert.ok(scenes.every(scene=>scene.displayOnly&&scene.currency==='coins'));
 assert.equal(variants.zodiac.playable,false,'scene appearance does not implement a zodiac table');
 for(const item of scenes)assert.ok(fs.existsSync(new URL(item.nativeImage,import.meta.url)),item.nativeImage);
 assert.ok(fs.existsSync(new URL(fixture.sourceScreenshot,import.meta.url)));
 assert.equal(currentRoom('?mode=zodiac').room.id,'557');
 assert.equal(currentRoom('?mode=zodiac&room=560').room.id,'560');
 assert.equal(currentRoom('?mode=zodiac&room=missing').room.id,'557');
 assert.equal(currentRoom('?mode=sanguo').room.id,'622');assert.equal(currentRoom('?mode=red').room.base,2000);
 scenes[0].base=12345;assert.equal(roomsForMode('zodiac')[0].base,10,'renderers receive copies of captured display values');
});

test('source zodiac introduction opens SESXGuide while fan collection uses its distinct server-gated play type',()=>{
 let definition,fanEnabled=false;const calls=[];
 const types={SJCCBXP:{TYPEID:869},SESXMJ:{TYPEID:898},FKSJCCBXP:{TYPEID:893},XLHZMJ2:{TYPEID:892},SGMJ2:{TYPEID:911}};
 const globals={cc:{_RF:{push(){},pop(){}},Node:{EventType:{}},Class(value){definition=value;return function(){};}},
  g_tConst:{GameTypeCfgs:types,FanGatherGameTypeMap:{898:2},GameLayerCfg:{SESXGuide:{id:'zodiac-guide'},SGMJGuide:{id:'sanguo-guide'}}},
  g_tData:{mod_gamecfg:'catalog'},g_oData:{get(){return{getPlatCfgByName(name){assert.equal(name,'fanGatherCfg');return{playFanGatherCfg:fanEnabled?[{playType:2}]:[]};}};}},
  g_oLayerManager:{emitEvent2Dlg:(...args)=>calls.push(args)},
 };
 const code=fs.readFileSync(new URL('../asset-study/readable/modules/hallTableSelView.js',import.meta.url),'utf8');
 vm.runInNewContext('({'+code+'})',globals).hallTableSelView[0](key=>key==='AlertDlgBaseView'?class{}:{},{exports:{}});
 const point={x:12,y:34},updates=[],view={...definition,btnSESXGuide:{worldPosition:point},btnFanGather:{children:[{emit:(...args)=>updates.push(args)}]}};
 view.onClickSESXGuide();assert.equal(calls[0][0],'zodiac-guide');assert.equal(calls[0][1],'ON_INIT');assert.equal(calls[0][2].btnEntryWorldPos,point);
 view.initFanGatherBtn(898);assert.deepEqual({...updates.at(-1)[1]},{show:false,nGameType:898});
 fanEnabled=true;view.initFanGatherBtn(898);assert.deepEqual({...updates.at(-1)[1]},{show:true,nGameType:898});
 view.initFanGatherBtn(144);assert.deepEqual({...updates.at(-1)[1]},{show:false,nGameType:144});
});

test('native zodiac cards use source skins, bitmap amounts and blue coin icons with the correct quick caption',()=>{
 const model=hallGamesModel({mode:'rooms',typeID:898,showFanGather:true,width:1280,height:720,balances:{beans:'57万',coins:'300万',diamond:'0'}});
 const config=source.components[196].find(component=>component.SpriteFrameScene);
 assert.deepEqual(model.entryInfo.map(entry=>entry.sceneID),sceneIDs);
 assert.equal(model.quickScene.id,'557');assert.equal(model.records.find(node=>node.name==='lab_gameScene').text,fixture.quickDescription);
 assert.equal(model.records.find(node=>node.name==='lab_gametype').text,'十二生肖');
 assert.equal(model.records.find(node=>node.name==='spellName').text,'SHIERSHENGXIAO');
 for(const [index,scene]of fixture.rooms.entries()){
  const children=model.records.filter(node=>node.path.startsWith('scene'+index+'/'));
  assert.equal(children.find(node=>node.name==='box_bg').sprite.frame.uuid,config.SpriteFrameScene[index].frame.uuid);
  const amount=children.find(node=>node.name==='labelDifen'),bitmap=hallBitmapTextPatches(amount);
  assert.equal(amount.text,scene.number);assert.equal(amount.label.font.id,63);assert.equal(amount.label.useSystemFont,false);
  assert.equal(bitmap.fallback.length,0);assert.equal(bitmap.glyphs.length,scene.number.length);
  assert.ok(fs.existsSync(new URL(amount.label.font.frame.image,import.meta.url)));
  near(amount.position[1],source.runtime.tableScene.baseLabel.position[1]);
  const icon=children.find(node=>node.name==='img_bean');assert.equal(icon.sprite.frame.uuid,config.spIcon[1].frame.uuid);
  assert.equal(icon.sprite.frame.path,'NewSkin/other/pic-bi');
  assert.equal(children.find(node=>node.name==='labelEnterCondition').text,scene.limit);
  assert.equal(children.find(node=>node.name==='labelOnline').text,scene.people+'人');
 }
 assert.deepEqual(model.records.filter(node=>node.path.startsWith('currency-')&&node.label).map(node=>node.text),['57万','300万','0']);
 assert.equal(hallGamesModel({mode:'rooms',typeID:898,recommendedRoomID:'559'}).quickScene.id,'559','an explicit host recommendation takes precedence');
});

test('mobile and desktop preserve all five hit targets plus two adjacent footer entries and a separate question mark',()=>{
 for(const [width,height]of[[1280,720],[1009,504],[812,375]]){
  const model=hallGamesModel({mode:'rooms',typeID:898,showFanGather:true,width,height});
  assert.equal(model.controls.filter(control=>control.action.type==='scene').length,5);
  assert.ok(model.controls.filter(control=>control.action.type==='scene').every(control=>control.action.typeID===898&&control.rect.width>0&&control.rect.height>0));
  const guide=model.controls.find(control=>control.action.type==='guide'),collection=model.controls.find(control=>control.action.type==='collection');
  assert.equal(guide.action.typeID,898);assert.equal(guide.label,'规则介绍');
  assert.deepEqual(collection.action,{type:'collection',mode:'zodiac',typeID:898});
  assert.deepEqual(model.controls.filter(control=>control.action.type==='rules').map(control=>control.action.typeID),[898]);
  near(guide.action.entryPoint.x,guide.rect.x+guide.rect.width/2);near(guide.action.entryPoint.y,guide.rect.y+guide.rect.height/2);
  const footer=model.records.find(node=>node.name==='btn_left'),left=model.records.find(node=>node.name==='btn_sesxGuide'),right=model.records.find(node=>node.name==='FanGatherEntry'&&node.parentIndex===footer.index);
  near(right.position[0]-right.size[0]*right.anchor[0],left.position[0]+left.size[0]*(1-left.anchor[0])+footer.layout._N$spacingX);
  assert.ok(right.active);assert.ok(model.records.some(node=>node.path.startsWith('zodiac-fan-gather/')&&node.sprite));
  const first=screenRect(model.records[model.entryInfo[0].node],model),next=screenRect(model.records[model.entryInfo[1].node],model);
  near(next.x-first.x,336*1.08*model.scale);
 }
 assert.ok(!hallGamesModel({mode:'rooms',typeID:898}).controls.some(control=>control.action.type==='collection'),'the account-controlled collection visibility remains explicit');
});

// The former hall host has been replaced by the public card catalog.
// Public route exclusions and preview behavior are covered by hall-game-catalog.test.js.
