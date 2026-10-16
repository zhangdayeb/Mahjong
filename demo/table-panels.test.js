import test from 'node:test';
import assert from 'node:assert/strict';
import {tableLedger,tableWaits,createTablePanels} from './table-panels.js';

test('ledger displays recorded HU deltas and kong transfers, including amounts affected by prior scoring',()=>{
 const r={scores:[900,100,-1000,0],huEvents:[{seat:0,tile:15,selfDraw:true,fan:{name:'清一色',multiple:4},deltas:[1500,-500,-500,-500]},{seat:1,tile:22,selfDraw:false,fan:{name:'平胡',multiple:1},deltas:[-200,200,0,0]},{seat:2,tile:33,selfDraw:false,fan:{name:'平胡',multiple:1},deltas:[0,-200,200,0]}],kongPayments:[{from:0,to:3,amount:400}],log:['你摸牌','阿唐出牌']};
 const data=tableLedger(r);assert.equal(data.total,900);assert.deepEqual(data.rows.map(x=>x.amount),[1500,-200,-400]);assert.equal(data.rows[0].multiple,4);assert.equal(data.rows[0].tile,15);assert.equal(data.rows[1].label,'【下家】平胡');assert.deepEqual(data.log,r.log);assert.notEqual(data.log,r.log);
});

function waitingRound(){return {config:{red:true,jokerCount:4,cap:16},hands:[[11,12,13,21,22,23,24,25,26,27,28,29,29],[11,14],[22,32],[33]],melds:[[],[],[],[]],discards:[[29],[11,29],[],[]],missing:[3,3,3,3],huEvents:[{tile:29,seat:1,selfDraw:false}],wonTiles:[],wall:[29,51]};}
test('wait counts only own and public physical tiles, without double-counting claimed HU records',()=>{
 const r=waitingRound(),before=JSON.stringify(r),data=tableWaits(r),twentyNine=data.items.find(x=>x.tile===29);assert(twentyNine);assert.equal(twentyNine.remain,0);assert.equal(JSON.stringify(r),before);
 r.hands[1]=Array(13).fill(51);r.wall=[];assert.deepEqual(tableWaits(r),data,'Hidden hands and remaining wall must not affect displayed visible counts');
 r.wonTiles=[51];assert.equal(tableWaits(r).items.find(x=>x.tile===51).remain,3,'A public self-draw/robbed tile is a separate physical record');
});

test('a fourteen-tile hand requires a legal discard selection and computes waits without mutating the hand',()=>{
 const r=waitingRound();r.hands[0].push(19);assert.equal(tableWaits(r).items.length,0);const before=r.hands[0].slice(),discardIndex=r.hands[0].length-1;
 const data=tableWaits(r,0,{discardIndex});assert(data.items.length);assert.deepEqual(r.hands[0],before);assert.equal(tableWaits(r,0,{discardIndex:99}).items.length,0);
});

test('popup owns keyboard focus and restores only a connected original trigger across panel switches',()=>{
 const originalDocument=globalThis.document;
 const connected=(node,value)=>{node.isConnected=value;node.children.forEach(child=>connected(child,value));};
 class Element{
  constructor(){this.children=[];this.style={};this.classList={toggle(){}};this.events={};this.isConnected=false;}
  append(...nodes){this.children.push(...nodes);nodes.forEach(node=>connected(node,this.isConnected));}
  replaceChildren(...nodes){this.children.forEach(node=>connected(node,false));this.children=[];this.append(...nodes);}
  setAttribute(){}
  addEventListener(name,callback){this.events[name]=callback;}
  focus(){globalThis.document.activeElement=this;}
 }
 const parent=new Element(),trigger=new Element();parent.isConnected=true;parent.append(trigger);let pauses=0,resumes=0;
 globalThis.document={activeElement:trigger,createElement:()=>new Element()};
 try{
  const panels=createTablePanels(parent,{onPause:()=>pauses++,onResume:()=>resumes++}),r={scores:[0,0,0,0],huEvents:[],kongPayments:[],log:[]};
  const first=panels.ledger(r);assert.equal(first.tabIndex,-1);assert.equal(document.activeElement,first);
  const second=panels.ledger(r);assert.equal(document.activeElement,second);assert.equal(pauses,1);
  parent.children[1].events.keydown({key:'Escape'});assert.equal(panels.open,null);assert.equal(document.activeElement,trigger);assert.equal(resumes,1);
  panels.ledger(r);trigger.isConnected=false;const current=document.activeElement;panels.close();assert.equal(document.activeElement,current,'A removed trigger is not focused');
 }finally{globalThis.document=originalDocument;}
});
