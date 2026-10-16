import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildSanguoReadyModel} from './sanguo-table-model.js';
import {sanguoReadyTableFixture as fixture} from './sanguo-table-study/sanguo-table-fixture.js';
import {roomsForMode} from './rooms-config.js';

const data=JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/table.json',import.meta.url)));
const frames=new Map(JSON.parse(fs.readFileSync(new URL('./sanguo-table-study/frames.json',import.meta.url))).map(frame=>[frame.uuid,frame]));
const rooms=roomsForMode('sanguo');
const desktop={width:986,height:504},phone={width:812,height:375};
const clone=value=>structuredClone(value);
function all(node,values=[]){values.push(node);for(const child of node.children||[])all(child,values);return values;}
function visibleNodes(node,values=[]){if(node.active===false||(node.opacity??255)===0)return values;values.push(node);for(const child of node.children||[])visibleNodes(child,values);return values;}
function find(node,name){const value=all(node).find(value=>value.name===name);assert.ok(value,`missing source node ${name}`);return value;}
function deepFreeze(value){if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))deepFreeze(child);}return value;}
function close(actual,expected,message){assert.ok(Math.abs(actual-expected)<1e-7,`${message}: ${actual} differs from ${expected}`);}

// These are source node bounds, not screenshot bounds. Accumulating inherited
// transforms catches omitted HeadParent/rank scales and double stage scaling.
function nodeBounds(root,name,model){
 let answer;
 function walk(node,parent={x:0,y:0,sx:1,sy:1,visible:true}){
  const trs=node.trs||[],state={x:parent.x+(trs[0]||0)*parent.sx,y:parent.y+(trs[1]||0)*parent.sy,sx:parent.sx*(trs[7]??1),sy:parent.sy*(trs[8]??1),visible:parent.visible&&node.active!==false&&(node.opacity??255)>0};
  if(node.name===name){
   const [width,height]=node.size,[ax,ay]=node.anchor;
   answer={x:model.width/2+(state.x-ax*width*state.sx)*model.scale,y:model.height/2-(state.y+(1-ay)*height*state.sy)*model.scale,width:width*state.sx*model.scale,height:height*state.sy*model.scale,visible:state.visible};
  }
  for(const child of node.children||[])walk(child,state);
 }
 walk(root);assert.ok(answer,`missing geometry ${name}`);return answer;
}
function inside(rect,model,label){
 assert.equal(rect.visible,true,`${label} is visible`);
 for(const key of ['x','y','width','height'])assert.ok(Number.isFinite(rect[key]),`${label}.${key} is finite`);
 assert.ok(rect.width>0&&rect.height>0,`${label} has positive dimensions`);
 assert.ok(rect.x>=-1e-7&&rect.y>=-1e-7,`${label} starts inside the viewport`);
 assert.ok(rect.x+rect.width<=model.width+1e-7&&rect.y+rect.height<=model.height+1e-7,`${label} ends inside the viewport`);
}

test('the preparation model preserves the original 2910 map, flag and four white directions, hiding the turn timer',()=>{
 const model=buildSanguoReadyModel(data,fixture,rooms[0],desktop);
 assert.equal(model.phase,'waiting-ready');assert.equal(model.typeID,911);
 assert.equal(data.source.id,2910);
 const map=find(model.tree,'pic_09'),flag=find(model.tree,'pic_10');
 assert.equal(frames.get(map.sprite.frame).id,1374);assert.equal(frames.get(map.sprite.frame).path,'Other/sanguo/sanguoditu/resource/table/pic_09');
 assert.deepEqual(map.size,[1600,720]);assert.deepEqual(flag.trs.slice(0,2),[27.896,41.757]);assert.deepEqual(flag.size,[152,112]);assert.equal(frames.get(flag.sprite.frame).id,178);
 assert.equal(find(model.tree,'fnt_countDown').active,false);
 const direction=find(model.tree,'direction');assert.deepEqual(direction.trs.slice(0,2),[0,50]);
 for(const [name,character,position,uuid]of[
  ['west','xi',[0,59.022],'0d6cf258-6617-46a8-96ca-43f0e0619c6f@6c48a'],
  ['north','bei',[-55,0],'350676a1-8b33-48f5-9165-4874e5781993@6c48a'],
  ['south','nan',[55,0],'5178429c-c271-47e6-967f-cde1a262ffb6@6c48a'],
  ['east','dong',[0,-56.779],'780d4df7-ada3-4f06-8d8e-bf04fa94fed0@6c48a'],
 ]){
  const slot=direction.children.find(node=>node.name===name),glyph=slot.children.find(node=>node.name===character);
  assert.deepEqual(slot.trs.slice(0,2),position);assert.equal(glyph.active,true);assert.equal(glyph.color,0xffffffff);assert.equal(glyph.sprite.frame,uuid);
 }
 assert.deepEqual(model.tree.children.map(node=>node.name),data.tree.children.map(node=>node.name),'preparation does not add a dealt wall or hand layer');
 for(const field of ['hands','wall','round','turn','bots','drawPile','scores'])assert.equal(Object.hasOwn(model,field),false,`${field} is not an implemented game state`);
});

test('only the three captured ready seats use the original gold art at the source clip final pose',()=>{
 const model=buildSanguoReadyModel(data,fixture,rooms[0],desktop);
 assert.deepEqual(model.ready.map(value=>[value.sourceSeatIndex,value.seat]),[[0,0],[1,3],[2,2]]);
 assert.deepEqual(model.ready.map(value=>value.node.trs.slice(0,2)),[[0,-195],[-379,59],[2,254]]);
 assert.ok(!model.ready.some(value=>value.sourceSeatIndex===3),'the waiting right player is not marked ready');
 assert.equal(data.ready.clip._duration,1);
 for(const ready of model.ready){
  const glyph=find(ready.node,'zhunbei_1');assert.equal(frames.get(glyph.sprite.frame).id,481);assert.deepEqual(glyph.size,[133,105]);
  assert.deepEqual(glyph.trs.slice(0,2),data.ready.clip.curveData.paths.zhunbei_1.props.position.at(-1).value);assert.equal(glyph.opacity,data.ready.clip.curveData.paths.zhunbei_1.props.opacity.at(-1).value);
  for(const name of ['path_16_2','path_16_2_0']){assert.equal(find(ready.node,name).active,false);assert.equal(data.ready.clip.curveData.paths[name].props.opacity.at(-1).value,0);}
 }
});

test('the four source 2595 profiles keep captured heads, original rank art and ZCoin without a fake account update',()=>{
 assert.equal(data.profile.source.id,2595);assert.equal(data.profile.layerSource.id,904);
 const originalPlayers=clone(fixture.players),model=buildSanguoReadyModel(data,fixture,rooms[0],desktop);
 assert.deepEqual(model.profiles.map(({player})=>[player.sourceSeatIndex,player.seat]),[[0,0],[1,3],[2,2],[3,1]]);
 for(const [index,profile]of model.profiles.entries()){
  const {player,node}=profile,expected=fixture.players[index];
  assert.equal(find(node,'label_Nickname').label._string,expected.displayName);
  assert.equal(find(node,'label_ZCoin').label._string,expected.balanceText);
  assert.equal(find(node,'img_Coin').active,false);
  const coin=find(node,'img_ZCoin');assert.equal(coin.active,true);assert.equal(frames.get(coin.sprite.frame).id,473);assert.equal(frames.get(coin.sprite.frame).path,'CoinNum&FareNum/img_ZCoin');assert.deepEqual(coin.size,[15,16]);
  const rank=find(node,'rankIcon');assert.deepEqual(rank.trs.slice(0,2),[-17.51,90.038]);assert.deepEqual(rank.trs.slice(7,9),[.7,.7]);assert.equal(frames.get(rank.sprite.frame).id,[796,796,178,254][index]);
  assert.equal(find(node,'rankNum').label._string,String(expected.rankLevel));
  const parent=find(node,'HeadParent');assert.deepEqual(parent.trs.slice(7,9),[.84,.84]);assert.equal(parent.children.length,1);
  const head=parent.children[0];assert.equal(head.name,'captured-head');assert.equal(head.sprite.frame,`avatar-${player.sourceSeatIndex}`);assert.equal(head.sprite._sizeMode,0);assert.deepEqual(head.size,[100,100]);
  assert.ok(fs.existsSync(new URL(expected.avatar,import.meta.url)));assert.equal(all(parent).some(value=>value.name==='head_trustee'||value.name==='clock_mask'),false);
 }
 assert.deepEqual(fixture.players,originalPlayers,'rendering does not write captured balances, ranks or account data');
});

test('source vertical widgets and inherited avatar/rank scales keep all four seats and ready controls inside desktop and phone views',()=>{
 for(const viewport of [desktop,phone]){
  const model=buildSanguoReadyModel(data,fixture,rooms[0],viewport);
  close(model.scale,viewport.height/720,'source height scale');
  const positions=model.profiles.map(profile=>profile.node.trs.slice(0,2));
  assert.deepEqual(positions,[[-564,-146],[-564,60],[320,247],[585,60]],'214 bottom / 300 and 113 top are preserved in the uncropped 720 logical-height stage');
  for(const profile of model.profiles){
   for(const name of ['captured-head','img_userinfo_bg','img_ZCoin'])inside(nodeBounds(profile.node,name,model),model,`${viewport.width}:seat${profile.player.sourceSeatIndex}:${name}`);
   const head=nodeBounds(profile.node,'captured-head',model);close(head.width,84*model.scale,'native avatar inherited width');close(head.height,84*model.scale,'native avatar inherited height');
   const rank=nodeBounds(profile.node,'rankIcon',model);close(rank.width,143.5*model.scale,'native rank inherited width');
   // The opposite rank's 205x95 RAW canvas extends above the stage in the
   // original top=113 widget. Its centre and lower badge remain visible; the
   // source crop must not be "fixed" by moving the four-player layout.
   assert.ok(rank.visible&&rank.x>=0&&rank.x+rank.width<=model.width);
   assert.ok(rank.y+rank.height/2>0&&rank.y+rank.height<=model.height);
  }
  for(const ready of model.ready)inside(nodeBounds(ready.node,'zhunbei_1',model),model,`${viewport.width}:ready${ready.sourceSeatIndex}`);
  inside({...model.menuRect,visible:true},model,`${viewport.width}:menu`);
  close(model.menuRect.x,34*model.scale,'left menu widget');close(model.menuRect.y,14*model.scale,'top menu widget');
  const background=nodeBounds(model.tree,'pic_09',model);assert.ok(background.x<=1e-7&&background.y<=1e-7);assert.ok(background.x+background.width>=model.width-1e-7&&background.y+background.height>=model.height-1e-7,'the complete map covers the stage');
 }
});

test('the original 974 header shows the captured clock and menu, leaving the ready-phase remaining counter and network state empty',()=>{
 const model=buildSanguoReadyModel(data,fixture,rooms[0],desktop);assert.equal(data.header.source.id,974);
 assert.equal(find(model.header,'lab_time').label._string,'10-06 10:05');assert.equal(find(model.header,'lab_remain').label._string,'');
 assert.equal(find(model.header,'WifiIcon').active,false);assert.equal(find(model.header,'NetWorkMsLabel').active,false);
 assert.equal(frames.get(find(model.header,'BatteryBg').sprite.frame).id,572);assert.equal(frames.get(find(model.header,'BatteryIcon').sprite.frame).id,623);
 const menu=all(model.header).find(node=>node.sprite?.frame==='8763a73e-9d14-4987-9f53-e6cd4d9cf037');assert.ok(menu);assert.deepEqual(menu.size,[60,62]);
 assert.equal(find(model.tree,'fnt_countDown').active,false,'clock display does not start a turn timer');
 const headerLabels=visibleNodes(model.header).filter(node=>node.label).map(node=>node.label._string);assert.ok(!headerLabels.includes('55'));assert.ok(!headerLabels.some(value=>/\d+ms/.test(value||'')));
 assert.equal(fixture.batteryPercent,null);assert.equal(fixture.networkLatency,null);
});

test('all six captured rooms retain their own base caption, including a reference-only supreme without an invented scene ID',()=>{
 assert.deepEqual(rooms.map(room=>[room.sceneID,room.base]),[[621,10],[622,100],[623,1000],[624,10000],[625,10000],[null,10000]]);
 for(const room of rooms){
  const model=buildSanguoReadyModel(data,fixture,room,desktop);
  assert.equal(model.room.id,room.id);assert.equal(model.room.sceneID,room.sceneID);
  assert.equal(model.title.label._string,'三国麻将');assert.equal(model.subtitle.label._string,`底注:${room.base} 封顶:999999倍`);
  assert.equal(model.title.color,0xff353e4a);assert.equal(model.subtitle.color,0xff353e4a);
  assert.deepEqual(model.title.trs.slice(0,2),[0,-50]);assert.deepEqual(model.subtitle.trs.slice(0,2),[0,-92]);
 }
});

test('rebuilding at another viewport cannot mutate the collected scene, fixture or an earlier view',()=>{
 const frozenData=deepFreeze(clone(data)),frozenFixture=deepFreeze(clone(fixture)),frozenRoom=deepFreeze(clone(rooms[0]));
 const before=clone(frozenData),first=buildSanguoReadyModel(frozenData,frozenFixture,frozenRoom,desktop),second=buildSanguoReadyModel(frozenData,frozenFixture,frozenRoom,phone);
 assert.deepEqual(frozenData,before);assert.deepEqual(frozenFixture,fixture);assert.deepEqual(frozenRoom,rooms[0]);
 find(first.tree,'pic_10').trs[0]=999;find(first.profiles[0].node,'label_ZCoin').label._string='changed output';first.ready[0].node.trs[0]=999;
 assert.equal(find(second.tree,'pic_10').trs[0],27.896);assert.equal(find(second.profiles[0].node,'label_ZCoin').label._string,fixture.players[0].balanceText);assert.equal(second.ready[0].node.trs[0],0);assert.deepEqual(frozenData,before);
 for(const viewport of [{width:0,height:504},{width:986,height:0},{width:-1,height:375}])assert.throws(()=>buildSanguoReadyModel(data,fixture,rooms[0],viewport),RangeError);
});

test('the table renderer keeps preview builders and connects its independent Sanguo controller without bloodflow or persistent account writes',()=>{
 const renderer=fs.readFileSync(new URL('./sanguo-table.js',import.meta.url),'utf8'),model=fs.readFileSync(new URL('./sanguo-table-model.js',import.meta.url),'utf8');
 const code=(renderer+'\n'+model).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'');
 assert.doesNotMatch(code,/from\s*['"][^'"]*(?:round|reference|table-controls|mahjong-ai)\.js['"]/i);
 assert.doesNotMatch(code,/\bnew\s+Round\b|\b(?:setInterval|setTimeout)\s*\(|\b(?:deal|dealTiles|botTurn|autoTurn|applyPayment)\s*\(/);
 assert.doesNotMatch(code,/\b(?:localStorage|sessionStorage|indexedDB)\b|\.setItem\s*\(|\bbalances?\s*(?:\[[^\]]+\]|\.[\w$]+)?\s*(?:\+\+|--|[+\-*\/]?=)/);
 assert.match(renderer,/buildSanguoReadyModel/);assert.match(renderer,/buildSanguoPlayModel/);assert.match(renderer,/createSanguoController/);assert.match(renderer,/createExitConfirm/);assert.match(renderer,/createRoomRules/);
});
