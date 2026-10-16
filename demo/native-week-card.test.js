import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {WEEK_CARD_SOURCE,weekCardModel,weekCardLayout,createNativeWeekCard} from './native-week-card.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('week card preview includes both native prefabs, all original frames and bitmap font atlases',()=>{
 assert.equal(WEEK_CARD_SOURCE.defaultPrefab,709);assert.equal(WEEK_CARD_SOURCE.prefabs[709].length,245);assert.equal(WEEK_CARD_SOURCE.prefabs[1804].length,108);
 assert.equal(WEEK_CARD_SOURCE.frames.length,92);for(const frame of WEEK_CARD_SOURCE.frames)assert.ok(fs.existsSync(new URL(frame.image,import.meta.url)),frame.image);
 assert.equal(Object.values(WEEK_CARD_SOURCE.fonts).filter(font=>!font.missing).length,5);
 for(const font of Object.values(WEEK_CARD_SOURCE.fonts))assert.ok(font.config.fontDefDictionary&&font.frame.image);
});

test('new template preserves native tab positions, scroll mask and four card anchors',()=>{
 const model=weekCardModel({width:1280,height:720}),first=model.records.find(n=>n.name==='item0'),fourth=model.records.find(n=>n.name==='item3');
 assert.deepEqual(first.world,[1,0,0,1,-309.5,0]);assert.deepEqual(fourth.world,[1,0,0,1,698.5,0]);
 const finger=model.controls.find(c=>c.action==='zCoin'),bean=model.controls.find(c=>c.action==='coin');close(finger.rect.x,43.53);close(finger.rect.y,401);close(bean.rect.y,168);assert.equal(bean.selected,true);assert.equal(finger.selected,false);
 assert.equal(bean.label,'游戏豆周卡');assert.equal(finger.label,'指尖币周卡');assert.equal(model.controls.filter(c=>c.action==='close').length,1);
 assert.deepEqual(model.viewport,{x:165,y:163,width:1080,height:510});assert.equal(model.maxScroll,304);
 const scrolled=weekCardModel({width:1280,height:720,scroll:1000});assert.equal(scrolled.scroll,304);assert.equal(scrolled.records.find(n=>n.name==='item3').world[4],394.5);
 const endButton=scrolled.controls.at(-1);assert.equal(endButton.name,'btnBuy');assert.equal(endButton.rect.width,214);assert.ok(endButton.rect.x+214<=scrolled.viewport.x+scrolled.viewport.width);
});

test('currency switch reproduces native bean/coin sprite branches and checked tab without inventing prices or ownership',()=>{
 assert.deepEqual(WEEK_CARD_SOURCE.runtime.new.tabs,{zCoin:'toggle1',coin:'toggle2'});
 for(const currency of ['zCoin','coin']){
  const m=weekCardModel({currency}),item=m.records.filter(n=>n.path.includes('/item0/'));
  const toggle=m.records.find(n=>n.name===WEEK_CARD_SOURCE.runtime.new.tabs[currency]);assert.deepEqual(toggle.toggle.events,[{handler:'onClickToggle',customEventData:currency}]);
  const checkmark=m.records.find(n=>n.parentIndex===toggle.index&&n.name==='checkmark');assert.equal(checkmark.active,true);assert.equal(checkmark.sprite.frame.id,currency==='coin'?1978:718);
  assert.equal(m.records.find(n=>n.name==='title'&&n.path.endsWith('/main/title')).sprite.frame.id,1023);
  for(const name of ['icon_bag','iconGold'])assert.equal(item.find(n=>n.name===name).active,currency==='zCoin');
  for(const name of ['icon_bag2','iconGold3'])assert.equal(item.find(n=>n.name===name).active,currency==='coin');
  assert.ok(m.records.filter(n=>['btnGetAward','btnGray','itemDownTimerBg','red_icon','pic_10'].includes(n.name)).every(n=>!n.active));
  const labels=m.records.filter(n=>n.active&&n.label);
  for(const name of ['lab_money','lab_oldMoney','lab_time','labGoldNum','labNum'])assert.ok(labels.filter(n=>n.name===name).every(n=>n.text.includes('—')&&!/\d/.test(n.text)),name);
  assert.equal(m.controls.find(c=>c.action===currency).selected,true);
 }
 const old=weekCardModel({variant:'old'});assert.equal(old.prefab,1804);assert.equal(old.maxScroll,0);assert.equal(old.controls.filter(c=>c.tab).length,0);
 assert.deepEqual(old.records.filter(n=>/^item\d$/.test(n.name)).map(n=>n.world[4]),[-350,0,350]);
 close(weekCardLayout().scale,554/720);
});

test('DOM preview changes tabs, shows a local message, restores focus and cancels pending show without writing balances',async()=>{
 const keys=['document','Image','setTimeout','clearTimeout','localStorage','fetch'],saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));let imageCount=0,timer=0,writes=0,requests=0;
 const context={clearRect(){},save(){},restore(){},beginPath(){},rect(){},clip(){},transform(){},drawImage(){},fillRect(){},fillText(){},strokeText(){}};
 function node(){return {children:[],style:{},dataset:{},attributes:{},listeners:{},hidden:false,isConnected:true,className:'',setAttribute(k,v){this.attributes[k]=v;},append(...n){this.children.push(...n);},replaceChildren(...n){this.children=n;},addEventListener(type,fn){this.listeners[type]=fn;},focus(){document.activeElement=this;},remove(){this.isConnected=false;},getContext(){return context;},getBoundingClientRect(){return {width:1104};},querySelector(selector){return this.querySelectorAll().find(n=>n.dataset.action===selector.match(/data-action="([^"]+)"/)?.[1]);},querySelectorAll(){return this.children.flatMap(n=>[n,...n.querySelectorAll()]);}};}
 globalThis.document={querySelector(){return null;},createElement:node,head:node(),activeElement:node()};const originalFocus=document.activeElement;
 globalThis.Image=class{constructor(){imageCount++;}decode(){return Promise.resolve();}};globalThis.setTimeout=()=>++timer;globalThis.clearTimeout=()=>{};globalThis.localStorage={setItem(){writes++;}};globalThis.fetch=()=>{requests++;throw Error('No account API expected');};
 try{
  const parent=node(),preview=createNativeWeekCard(parent);await preview.ready;assert.equal(imageCount,92);await preview.show();assert.equal(preview.open,true);assert.equal(preview.model.currency,'coin');
  const panel=parent.children[0].children[1],controls=panel.children[2];const finger=controls.querySelectorAll().find(n=>n.dataset.action==='zCoin');finger.focus();finger.onclick();assert.equal(preview.model.currency,'zCoin');assert.equal(document.activeElement.dataset.action,'zCoin');
  const buy=controls.querySelectorAll().find(n=>n.attributes['aria-label']?.startsWith('初级周卡'));buy.onclick();assert.equal(panel.children[3].hidden,false);assert.match(panel.children[3].textContent,/本地预览/);
  const scroller=panel.children[1];scroller.listeners.wheel({deltaX:0,deltaY:1000,preventDefault(){}});assert.equal(preview.model.scroll,304);
  let prevented=false;parent.children[0].listeners.keydown({key:'Escape',preventDefault(){prevented=true;},stopPropagation(){}});assert.equal(preview.open,false);assert.equal(prevented,true);assert.equal(document.activeElement,originalFocus);
  const pending=preview.show();preview.close();await pending;assert.equal(preview.open,false);assert.equal(writes,0);assert.equal(requests,0);preview.dispose();
 }finally{for(const k of keys)if(saved[k]===undefined)delete globalThis[k];else globalThis[k]=saved[k];}
});
