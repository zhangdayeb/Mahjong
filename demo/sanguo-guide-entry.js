// hallTableSelView.initSGMJGuideBtn (type 911):
//   (login -> hall && lastShownDay !== today) || (newUser && !everShown)
// Both source flags are recorded on automatic opening, not when it closes.
// Manual onClickSGMJGuide replay has no source persistence update.
// Local persistence is intentionally separate from the original account keys.
export const SANGUO_GUIDE_STORAGE_KEY='MAHJONG_SGMJGuide';
export function sanguoGuideToday(date=new Date(),timeZone='Asia/Bangkok'){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en',{timeZone,year:'numeric',month:'numeric',day:'numeric'}).formatToParts(date).map(part=>[part.type,part.value]));
 return `${parts.year}_${Number(parts.month)}_${Number(parts.day)}`;
}
const initial=()=>({day:'000',popped:false});
const storeFallback=new WeakMap();
let unavailableFallback={state:initial(),persisted:false};
const objectStore=store=>store!==null&&['object','function'].includes(typeof store);

function resolveStore(store){
 if(store!==undefined)return store;
 try{return globalThis.localStorage;}catch{return null;}
}
function cached(store){return objectStore(store)?storeFallback.get(store):unavailableFallback;}
function remember(store,state,persisted){const entry={state:{...state},persisted};
 if(objectStore(store))storeFallback.set(store,entry);else unavailableFallback=entry;
 return entry;
}
function decode(text){
 const value=JSON.parse(text);
 if(!value||typeof value!=='object'||Array.isArray(value))return initial();
 return{day:typeof value.day==='string'?value.day:'000',popped:value.popped===true};
}

export function readSanguoGuideState(storage){
 const store=resolveStore(storage),fallback=cached(store);
 // A denied write is newer than any stale persistent record. Keep it for this
 // module's lifetime so closing/reopening the same local room cannot repop it.
 if(fallback&&!fallback.persisted)return{...fallback.state};
 try{
  if(typeof store?.getItem!=='function')return{...(fallback?.state||initial())};
  const text=store.getItem(SANGUO_GUIDE_STORAGE_KEY);
  const state=text?decode(text):initial();
  remember(store,state,true);return{...state};
 }catch{return{...(fallback?.state||initial())};}
}

export function shouldAutoOpenSanguoGuide({typeID,isLoginToHall=true,isNewUser=false,today}={},storage){
 if(Number(typeID)!==911)return false;
 const state=readSanguoGuideState(storage),day=typeof today==='string'?today:'';
 // In the client today always comes from serverTime. The local host must pass
 // its Date-based simulation. With no day available, only the new-user branch
 // is meaningful; do not generate an endlessly differing 'undefined' day.
 return Boolean((isLoginToHall&&day&&state.day!==day)||(isNewUser&&!state.popped));
}

export function recordSanguoGuideShown(today,storage){
 const store=resolveStore(storage),state={day:typeof today==='string'&&today?today:'000',popped:true};
 let persisted=false;
 try{if(typeof store?.setItem==='function'){
  store.setItem(SANGUO_GUIDE_STORAGE_KEY,JSON.stringify(state));persisted=true;
 }}catch{}
 remember(store,state,persisted);
 return{...state,persisted};
}
