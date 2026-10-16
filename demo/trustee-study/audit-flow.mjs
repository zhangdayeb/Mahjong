// Headless controller audit: use deterministic time and a minimal DOM,
// without accessing the browser or original site's account/game services.
import assert from 'node:assert/strict';
import {tableControls} from '../table-controls.js';
const ids=new Map(),selectors=new Map(),listeners=new Map();
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.style={setProperty(){}};this.dataset={};this.hidden=false;this.open=false;this.textContent='';const classes=new Set();this.classList={toggle(n,v){if(v??!classes.has(n))classes.add(n);else classes.delete(n);},add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));},contains(n){return classes.has(n);}};}
 set innerHTML(value){this.html=value;for(const m of value.matchAll(/id="([^"]+)"/g))ids.set('#'+m[1],new Element());}
 get innerHTML(){return this.html||'';}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;}
 prepend(...children){this.children.unshift(...children);}
 querySelector(selector){this.parts??=new Map();if(!this.parts.has(selector))this.parts.set(selector,new Element());return this.parts.get(selector);}
 querySelectorAll(){return [];}
 setAttribute(key,value){this.attrs[key]=value;}
 addEventListener(name,fn){this.events??=new Map();this.events.set(name,fn);}
 remove(){}
 close(){if(this.open){this.open=false;this.events?.get('close')?.();}}
 showModal(){this.open=true;}
}
function el(selector){const map=selector.startsWith('#')?ids:selectors;if(!map.has(selector))map.set(selector,new Element());return map.get(selector);}
globalThis.document={querySelector:el,createElement:tag=>new Element(tag),body:new Element('body')};
globalThis.location={search:'?mode=red',href:''};globalThis.localStorage={getItem(){return null}};
globalThis.addEventListener=(name,fn)=>listeners.set(name,fn);
let now=0,nextID=0;const timers=new Map();Date.now=()=>now;
globalThis.setTimeout=(fn,delay)=>{const id=++nextID;timers.set(id,{fn,time:now+delay});return id;};
globalThis.clearTimeout=id=>timers.delete(id);
globalThis.setInterval=(fn,period)=>{const id=++nextID;timers.set(id,{fn,time:now+period,period});return id;};
globalThis.clearInterval=id=>timers.delete(id);
function tick(ms){const until=now+ms;for(let guard=0;guard<2000;guard++){const pair=[...timers].filter(([,t])=>t.time<=until).sort((a,b)=>a[1].time-b[1].time)[0];if(!pair)break;const[id,t]=pair;now=t.time;if(t.period)t.time+=t.period;else timers.delete(id);t.fn();}now=until;}
const rendered=[],notes=[],animations=[];
const panels={open:null,close(){this.open=null;},profile(){},chat(){},ledger(){},hint(){}};
const exchangeView={open:false,button:new Element('button'),state:{},hide(){this.open=false;},update(state){Object.assign(this.state,state);this.button.disabled=this.state.enabled===false;},show(state){this.update(state);this.open=true;}};
const controller=tableControls({render:r=>rendered.push(r),animate:()=>Promise.resolve(),sound(){},toast:s=>notes.push(s),playerDisplay:{profiles:[{},{},{},{}],update(){}},createPanels:()=>panels,createExchangeControls:(_,options)=>{exchangeView.button.setAttribute('aria-label','同意换三张');exchangeView.button.onclick=options.onConfirm;return exchangeView;},createSettlement:()=>({show(){},close(){}}),effect:{clear(){},play:(...args)=>{animations.push(args);return {durationMs:1100,finished:Promise.resolve()}},syncSound(){}}});
const controls=()=>el('.action-area').children[0];
const actions=()=>[...controls().children,...(exchangeView.open?[exchangeView.button]:[])];
const clickAction=async name=>{assert(!controls().hidden,'Manual controls are visible');const b=actions().find(b=>b.attrs['aria-label']===name||b.textContent===name);assert(b,`Action ${name} exists`);await b.onclick();};
async function flush(){for(let i=0;i<8;i++)await Promise.resolve()}
async function tickAsync(ms){tick(ms);await flush()}
async function enterExchange(){controller.reset();assert.equal(exchangeView.open,false,'Exchange notice is hidden during opening');await tickAsync(3300);assert.equal(controller.round.phase,'exchange');assert.equal(controller.selection.size,3,'Recommended three tiles are selected on entry');assert.equal(actions().length,1,'Original exchange flow has one confirmation button');assert.equal(actions()[0].disabled,false,'Default recommendation can be confirmed');}
async function prepare(){await enterExchange();await clickAction('同意换三张');assert.equal(exchangeView.open,false,'Exchange controls hide as the three tiles move');await tickAsync(1500);assert.equal(controller.round.phase,'choose');}
// The supplied red-room reference uses bAllColor: three mixed natural suits are
// permitted. The fourth selected tile still replaces the previous three.
await enterExchange();controller.round.hands[0]=[11,12,13,14,21,22,23,31,32,33,51,51,51,51];controller.selection.clear();
controller.select(0);controller.select(4);assert.deepEqual([...controller.selection],[0,4],'Reference room permits a mixed two-card selection');
assert.equal(actions()[0].disabled,true);await clickAction('同意换三张');assert.equal(controller.round.phase,'exchange','Incomplete set cannot confirm');
controller.selection.clear();controller.select(0);controller.select(1);controller.select(2);assert.deepEqual([...controller.selection],[0,1,2]);assert.equal(actions()[0].disabled,false);
controller.select(3);assert.deepEqual([...controller.selection],[3],'Fourth card replaces previous three');
controller.select(3);assert.equal(controller.selection.size,0,'Clicking the selected card deselects it');
await prepare();
el('#trustee').onclick();assert.equal(controller.canSelect,false);
assert.equal(controls().hidden,true,'Trustee hides manual action controls');
assert.equal(controller.selection.size,0,'Trustee clears selected tiles');
// Cancel through the actual generated overlay button; manual choice returns.
const cancel=el('#ui-layer').children.find(b=>b.className==='auto-toggle');assert(cancel,'Cancel trustee overlay exists');cancel.onclick();
assert.equal(controls().hidden,false,'Cancel restores manual action controls');
await clickAction('缺条');await flush();assert.equal(controller.round.missing[0],2);assert.equal(controller.canSelect,true);
// Opening a native popup must also block an already focused hand tile.
panels.open='profile';const heldSelection=controller.selection.size;assert.equal(controller.canSelect,false);controller.select(0);assert.equal(controller.selection.size,heldSelection);panels.close();assert.equal(controller.canSelect,true);
// Canceling near the old deadline grants a fresh manual operation window.
await tickAsync(14500);assert(!controller.round.log.some(s=>s.includes('操作超时')));
el('#trustee').onclick();cancel.onclick();const heldHand=controller.round.hands[0].slice();await tickAsync(800);
assert(!controller.round.log.some(s=>s.includes('操作超时')),'No inherited near-expired deadline after cancellation');
assert.deepEqual(controller.round.hands[0],heldHand,'Cancellation does not silently discard the hand');
assert(Number(el('#countdown').textContent)>=14,'Manual countdown receives a fresh window');
// A selected tile must not survive either trustee transition.
await prepare();await clickAction('缺万');await flush();controller.select(0);
assert.equal(controller.selection.size,1);el('#trustee').onclick();assert.equal(controller.selection.size,0);assert.equal(controls().hidden,true);cancel.onclick();
assert.equal(controller.selection.size,0);assert.equal(controls().hidden,false);assert.equal(controller.canSelect,true);
// With no selection, the restored discard button cannot use the old tile.
const beforeDiscard=controller.round.discards[0].slice();assert.equal(controller.selection.size,0);await flush();assert.deepEqual(controller.round.discards[0],beforeDiscard);
// Native response indicators remain visible during trustee, but cannot issue a
// manual action. This is the state shown in the reference's Hu/Peng/Pass image.
controller.round.phase='claim';controller.round.claim={from:3,value:11,options:{0:['peng']},responses:{}};controller.round.hands[0]=[11,11,21];el('#trustee').onclick();assert.equal(controls().hidden,false);const peng=actions().find(b=>b.attrs['aria-label']==='碰');assert(peng.disabled);await peng.onclick();assert.deepEqual(controller.round.claim.responses,{});assert.equal(controller.canSelect,false);cancel.onclick();
await clickAction('碰');assert.equal(controller.canSelect,false,'The native action result locks selection until its clip ends');await tickAsync(1120);assert.equal(controller.canSelect,false);await tickAsync(20);assert.equal(controller.canSelect,true,'Controls resume after the source PENG duration');
listeners.get('pagehide')?.();
console.log(JSON.stringify({audit:'trustee regression assertions passed',nativeClaimIndicatorsVisibleDuringAuto:true,manualCallbacksBlockedDuringAuto:true,popupBlocksHandSelection:true,cancelResetsDeadline:true,selectionClearedOnToggle:true,handSelectionDisabledDuringAuto:true,manualControlRestoredOnCancel:true,scope:'local controller only; original server cancellation and decision policy not tested'},null,2));
