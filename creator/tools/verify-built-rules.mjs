// Validate the real Creator System.register build, not a separate TS transpile.
// Only pure rule modules are executed. No UI, sockets, wallets or saved data.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createPracticeRound,replayAction} from '../../demo/practice-round.js';
import {SANGUO_NUMBERS} from '../../demo/sanguo-rules.js';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const option=process.argv.indexOf('--build');
if(option>=0&&!process.argv[option+1])throw Error('--build 后需要 Creator 网页包目录。');
const build=option>=0?path.resolve(process.argv[option+1]):path.join(repo,'creator/build/web-mobile');
const registered=new Map();
const context=vm.createContext({console,structuredClone,setTimeout,clearTimeout});
context.System={register(...args){
 let [name,deps,declare]=args;
 if(Array.isArray(name)){
  // Creator's helper chunk wraps named registrations in one empty dependency module.
  if(name.length)throw Error('Unexpected anonymous module dependencies');
  declare=deps;
  declare((key,value)=>value,{}).execute();return;
 }
 registered.set(name,{deps,declare,exports:{},loaded:false,subscribers:[]});
}};
const cc={cclegacy:{_RF:{push(){},pop(){}}}};
function load(name){
 if(name==='cc')return cc;
 const module=registered.get(name);if(!module)throw Error('Missing built rule module: '+name);
 if(module.loaded)return module.exports;module.loaded=true;
 const definition=module.declare((key,value)=>{
  if(typeof key==='string')module.exports[key]=value;else Object.assign(module.exports,key);
  for(const setter of module.subscribers)setter(module.exports);
  return typeof key==='string'?value:key;
 },{id:name,meta:{url:name}});
 module.deps.forEach((dep,index)=>{
  const dependency=dep==='cc'?dep:new URL(dep,name).href;
  const setter=definition.setters[index];
  if(dependency!=='cc')registered.get(dependency)?.subscribers.push(setter);
  setter?.(load(dependency));
 });
 definition.execute();return module.exports;
}
async function readRegistrations(directory,pattern){
 for(const file of (await readdir(directory)).sort())if(pattern.test(file)){
  const filename=path.join(directory,file);
  vm.runInContext(await readFile(filename,'utf8'),context,{filename,timeout:10000});
 }
}
await readRegistrations(path.join(build,'src/chunks'),/\.js$/);
await readRegistrations(path.join(build,'assets/main'),/^index.*\.js$/);
const engine=load('chunks:///_virtual/practice-round.ts');
const hand=load('chunks:///_virtual/hand-analysis.ts');
const sanguo=load('chunks:///_virtual/sanguo-rules.ts');
const normalize=value=>JSON.parse(JSON.stringify(value));
const state=round=>normalize({phase:round.phase,turn:round.turn,wall:round.wall,hands:round.hands,melds:round.melds,discards:round.discards,missing:round.missing,scores:round.scores,claim:round.claim,lastDraw:round.lastDraw,huEvents:round.huEvents,kongPayments:round.kongPayments,settlementEvents:round.settlementEvents,redKongs:round.redKongs,revealed:round.revealed});
const actor=round=>{
 if(['exchange','choose'].includes(round.phase))return 0;
 if(['claim','rob'].includes(round.phase)){
  const pending=Object.keys(round.claim.options).map(Number).filter(seat=>!(seat in round.claim.responses));
  return pending.find(seat=>seat!==0)??pending[0];
 }
 return round.turn;
};
const modes=['classic','red','exchange','six','sixFixed','crazy','eightFixed'];
const seeds=[3282235851,0,1,7,42];
let fullRounds=0,verifiedActions=0,huEvents=0;

// Exact first divergence from Creator's original loose iterable lowering.
const exposed=[{type:'peng',value:39},{type:'peng',value:38},{type:'peng',value:27}];
assert.equal(hand.canComplete([24,25,25,25,23],1,exposed,{}),true,'Built Map iteration must detect sequence 23/24/25 and pair 25');
assert.deepEqual(normalize(sanguo.SANGUO_NUMBERS),SANGUO_NUMBERS,'Built sparse arrays must materialize all 18 number values');

for(const mode of modes)for(const seed of seeds){
 const rulesData={startBalances:[60000,750000,235000,437000],continuation:null};
 const options={rulesVersion:2,startBalance:60000,rulesData};
 const canonical=createPracticeRound(mode,'beginner',seed,options);
 const built=engine.createPracticeRound(mode,'beginner',seed,options);
 assert.deepEqual(state(built),state(canonical),`${mode}/${seed} initial state`);
 for(let index=0;canonical.phase!=='end'&&index<3000;index++){
  // The observed browser game chose 缺条 manually, then enabled trustee.
  const action=mode==='classic'&&seed===3282235851&&index===0?{method:'choose',args:[2]}:{method:'auto',args:[actor(canonical)]};
  engine.replayAction(built,normalize(action));replayAction(canonical,action);
  assert.deepEqual(state(built),state(canonical),`${mode}/${seed} action ${index+1}: ${action.method}(${action.args.join(',')})`);
  if(mode==='classic'&&seed===3282235851&&index===36){
   assert.equal(canonical.phase,'claim');assert.equal(canonical.wall.length,30);
   assert.deepEqual(normalize(built.claim.options),{'3':['hu']});
  }
  verifiedActions++;
 }
 assert.equal(built.phase,'end',`${mode}/${seed} must finish`);huEvents+=built.huEvents.length;fullRounds++;
 assert.deepEqual(normalize(built.collectionOrder()),canonical.collectionOrder(),`${mode}/${seed} final collection order`);
 if(['sixFixed','eightFixed'].includes(mode)){
  const continuation=canonical.collectionOrder();
  const nextOptions={...options,rulesData:{...rulesData,continuation}};
  const nextBuilt=engine.createPracticeRound(mode,'beginner',seed+1,nextOptions);
  const nextCanonical=createPracticeRound(mode,'beginner',seed+1,nextOptions);
  assert.equal(nextBuilt.shuffleMethod,'cut');assert.deepEqual(state(nextBuilt),state(nextCanonical),`${mode}/${seed} continuation cut`);
 }
}
assert.ok(huEvents>0,'Built verification must exercise real wins');
// Version-one modules remain bundled for compatibility, including Set iteration.
for(const seed of [0,3282235851]){
 const canonical=createPracticeRound('sanguo','621',seed,{rulesVersion:1});
 const built=engine.createPracticeRound('sanguo','621',seed,{rulesVersion:1});
 for(let index=0;canonical.phase!=='end'&&index<3000;index++){
  const action={method:'auto',args:[actor(canonical)]};
  engine.replayAction(built,normalize(action));replayAction(canonical,action);
  assert.deepEqual(state(built),state(canonical),`Legacy sanguo/${seed} action ${index+1}`);verifiedActions++;
 }
 assert.equal(built.phase,'end');fullRounds++;
}
console.log(JSON.stringify({ok:true,fullRounds,verifiedActions,huEvents,verified:[
 'actual Creator System.register bundle','Map/Set/sparse array iteration',
 'seed 3282235851 first-hu regression at action 37','seven modes across five seeds',
 'every action matches canonical rule state','no-shuffle continuation cut',
 'version-one legacy replay compatibility',
]},null,2));
