import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {variants,variantKeys,roomsForMode,currentRoom} from './rooms-config.js';
import {getSanguoTableEntry} from './sanguo-table-entry.js';
import {SANGUO_GUIDE_STORAGE_KEY,readSanguoGuideState,shouldAutoOpenSanguoGuide,recordSanguoGuideShown} from './sanguo-guide-entry.js';

// Execute the page's actual orchestration with inert view factories. This
// verifies route policy and dialog state without canvas or account services.
const code=fs.readFileSync(new URL('rooms.js',import.meta.url),'utf8').replace(/^import .*;\r?$/gm,'');
function page(mode){
 const calls=[],elements=new Map(),listeners={};
 const node=(tagName='DIV')=>({tagName,children:[],hidden:false,style:{removeProperty(name){delete this[name];}},textContent:'',dataset:{},setAttribute(){},addEventListener(type,fn){listeners[type]=fn;}});
 const lobby=node(),dialog=node('DIALOG'),okay=node('BUTTON'),close=node('BUTTON'),heading=node('H2'),text=node('P');dialog.id='info';dialog.hidden=true;dialog.style.display='none';dialog.open=false;dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;};dialog.querySelector=selector=>({'.okay':okay,'.close':close,h2:heading,p:text})[selector];
 const background=node(),month=node('BUTTON'),balanceButtons=[node('BUTTON'),node('BUTTON'),node('BUTTON')],balanceValues=['57万','300万','0'].map(value=>({...node('SPAN'),textContent:value}));
 // Nest the dialog intentionally: a future HTML relocation must not hide it.
 lobby.children=[background,dialog];
 for(const[selector,value]of[['#lobby',lobby],['#info',dialog],['#variant-title',node('BUTTON')],['#room-help',node('BUTTON')],['.month',month],['[data-info="玩法指引"]',node('BUTTON')],['[data-info="番型收集"]',node('BUTTON')]])elements.set(selector,value);
 const document={querySelector:selector=>elements.get(selector),querySelectorAll:selector=>selector==='.balances button'?balanceButtons:selector==='.balances span'?balanceValues:[],body:{classList:{add(){},contains(){return false;}}}};
 const location={search:`?mode=${mode}`,href:'http://localhost/rooms.html'+`?mode=${mode}`};
 const storage={values:new Map(),getItem(key){return this.values.get(key)??null;},setItem(key,value){this.values.set(key,value);}};
 let options,payload;const context={document,location,innerWidth:1104,innerHeight:554,addEventListener(){},localStorage:storage,URLSearchParams,URL,variants,variantKeys,roomsForMode,currentRoom:()=>currentRoom(location.search),getSanguoTableEntry,enterSanguoTable:payload=>{const entry=getSanguoTableEntry(payload);assert.ok(entry);calls.push(['sanguoEntry',entry.href,entry.sceneID]);return Promise.resolve(true);},enterRoom:()=>calls.push(['enterRoom']),createRoomRules:()=>({show:type=>calls.push(['rules',type])}),createNativeCollection:()=>({drawEntry(){},show:mode=>calls.push(['collection',mode])}),createNativeSanguoGuide:()=>({show:value=>{calls.push(['guide',value]);return Promise.resolve();}}),createNativeZodiacGuide:()=>({show:value=>{calls.push(['zodiacGuide',value]);return Promise.resolve();}}),sanguoGuideToday:()=>'2026_10_6',readSanguoGuideState:()=>readSanguoGuideState(storage),shouldAutoOpenSanguoGuide:value=>shouldAutoOpenSanguoGuide(value,storage),recordSanguoGuideShown:today=>recordSanguoGuideShown(today,storage),createNativeWeekCard:()=>({show:()=>calls.push(['week'])}),createNativeShop:()=>({show:currency=>calls.push(['shop',currency])}),createNativeHallGames:(parent,next)=>{assert.equal(parent,lobby);options=next;return{show:(view,data)=>{payload={view,data};return Promise.resolve();}};},fetch:()=>{calls.push(['fetch']);throw Error('Unsupported native rooms must not preload or enter a table');}};
 context.practiceWallet={show:()=>calls.push(['wallet'])};context.bindPracticeWallet=()=>{};
 context.installGameAudio=()=>{};
 vm.runInNewContext(code,context,{filename:'rooms.js'});return{calls,options,payload,lobby,dialog,text,heading,background,location,storage,listeners};
}
test('direct native room routes preserve their scene IDs and separate Sanguo preparation from unsupported zodiac play',()=>{
 for(const mode of['sanguo','zodiac']){const view=page(mode);assert.equal(view.background.hidden,true);assert.equal(view.background.style.display,'none');assert.equal(view.payload.view,'rooms');assert.equal(view.payload.data.typeID,variants[mode].typeID);assert.deepEqual(Array.from(view.payload.data.scenes.slice(0,5),scene=>scene.sceneID),variants[mode].sceneIDs);if(mode==='zodiac'){assert.deepEqual(Array.from(view.payload.data.scenes,scene=>scene.base),[10,10,1000,10000,10000]);assert.ok(view.payload.data.scenes.every(scene=>scene.displayOnly&&scene.currency==='coins'));}else{assert.equal(view.payload.data.scenes.length,6);assert.equal(view.payload.data.scenes[5].sceneID,null);assert.ok(view.payload.data.scenes.every(scene=>scene.displayOnly));}
  view.options.onSelect({type:'scene',typeID:variants[mode].typeID,scene:view.payload.data.scenes[0]});
  if(mode==='sanguo'){assert.deepEqual(view.calls,[['sanguoEntry','sanguo-table.html?room=621',621]]);assert.equal(view.dialog.open,false);view.options.onQuick({mode:'rooms',typeID:911,quickScene:view.payload.data.scenes[1]});assert.deepEqual(view.calls.at(-1),['sanguoEntry','sanguo-table.html?room=622',622]);assert.equal(view.dialog.open,false);}
  else{assert.equal(view.dialog.hidden,false);assert.equal(view.dialog.style.display,undefined);assert.equal(view.dialog.open,true);assert.equal(view.heading.textContent,variants[mode].name);assert.match(view.text.textContent,/尚未实现/);assert.deepEqual(view.calls,[]);view.dialog.close();view.options.onQuick({mode:'rooms',typeID:898,quickScene:view.payload.data.scenes[1]});assert.equal(view.dialog.open,true);assert.deepEqual(view.calls,[]);}
 }
});
test('direct native room rules and account previews remain on the source page and return uses the hall route',()=>{
 const view=page('sanguo');view.options.onRules(911);view.options.onWeekCard();view.options.onCurrency('diamond');assert.deepEqual(view.calls,[['rules',911],['wallet'],['wallet']]);assert.equal(view.location.href,'http://localhost/rooms.html?mode=sanguo');view.options.onClose();assert.equal(view.location.href,'hall.html');
});
test('direct Sanguo rooms automatically introduce once per day and manually replay without changing seen state',async()=>{
 const view=page('sanguo'),action={type:'guide',typeID:911,entryPoint:{x:150,y:480}},model={controls:[{action}]};assert.equal(view.payload.data.showFanGather,false);
 await view.options.onRoomShown(model);assert.equal(view.calls[0][0],'guide');assert.deepEqual(JSON.parse(JSON.stringify(view.calls[0][1])),{entryPoint:action.entryPoint});const recorded=view.storage.values.get(SANGUO_GUIDE_STORAGE_KEY);assert.deepEqual(JSON.parse(recorded),{day:'2026_10_6',popped:true});
 await view.options.onRoomShown(model);assert.equal(view.calls.length,1);await view.options.onGuide(action);assert.equal(view.calls.length,2);assert.equal(view.storage.values.get(SANGUO_GUIDE_STORAGE_KEY),recorded);assert.equal(view.options.onCollection,undefined);assert.ok(view.calls.every(call=>!['fetch','enterRoom'].includes(call[0])));
 const zodiac=page('zodiac');assert.equal(zodiac.payload.data.showFanGather,false);await zodiac.options.onRoomShown({controls:[]});assert.deepEqual(zodiac.calls,[]);
});

test('every zodiac tier and its primary quick target stays local, with independent manual guide and unchanged Sanguo seen state',async()=>{
 const view=page('zodiac'),model={controls:[{action:{type:'guide',typeID:898,entryPoint:{x:150,y:480}}}],quickScene:view.payload.data.scenes[1]};
 assert.equal(view.payload.data.showFanGather,false);await view.options.onRoomShown(model);assert.deepEqual(view.calls,[]);assert.equal(view.storage.values.size,0,'unknown zodiac showGuide config cannot mark the Sanguo introduction as seen');
 for(const scene of view.payload.data.scenes){view.options.onSelect({type:'scene',typeID:898,scene});assert.equal(view.dialog.open,true);assert.equal(view.heading.textContent,'十二生肖');assert.match(view.text.textContent,/尚未实现/);assert.doesNotMatch(view.text.textContent,/底分、人数.*缺少/);view.dialog.close();}
 view.options.onQuick(model);assert.equal(view.dialog.open,true);view.dialog.close();
 const event={button:0,target:{closest:()=>({href:'reference.html?mode=zodiac&room=560'})},preventDefault(){this.prevented=true;}};
 view.listeners.click(event);assert.equal(event.prevented,true);assert.equal(view.dialog.open,true);view.dialog.close();assert.deepEqual(view.calls,[]);assert.equal(view.location.href,'http://localhost/rooms.html?mode=zodiac');
 await view.options.onGuide(model.controls[0].action);view.options.onRules(898);assert.equal(view.options.onCollection,undefined);
 assert.deepEqual(JSON.parse(JSON.stringify(view.calls)),[['zodiacGuide',{entryPoint:{x:150,y:480}}],['rules',898]]);assert.equal(view.storage.values.size,0);
});
