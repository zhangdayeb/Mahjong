import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildBountyTasks,bountyTaskScrollLimit,orderBountyTasks} from './bounty-tasks.js';
import {bountyTaskScreenshotFixture} from './bounty-task-fixture.js';
import {activityButtonRects,layoutActivityLabels} from '../native-hall-activities.js';
const data=JSON.parse(fs.readFileSync(new URL('activities.json',import.meta.url)));
const frames=JSON.parse(fs.readFileSync(new URL('frames.json',import.meta.url)));
const find=(node,name)=>node?.name===name?node:node?.children?.map(child=>find(child,name)).find(Boolean);
const listFor=tree=>find(find(tree,'leftTask'),'list');
const contentFor=tree=>find(listFor(tree),'content');
const build=options=>buildBountyTasks(data,structuredClone(data.prefabs[2567].tree),options);

test('the five source screenshot tasks replace the inline placeholder without changing source data',()=>{
 const before=JSON.stringify(data),tree=build({tasks:bountyTaskScreenshotFixture.tasks}),content=contentFor(tree);
 assert.equal(content.children.length,5);
 assert.deepEqual(content.children.map(row=>find(row,'taskName').label._string),[
  '每日登录','完成3场对局','消耗10钻石','指尖币高级场/大师场\n打出1次封顶','指尖币高级场/大师场\n完成5局',
 ]);
 assert.deepEqual(content.children.map(row=>find(row,'ProgressLbl').label._string),['1/1','0/3','0/10','0/1','0/5']);
 assert.deepEqual(content.children.map(row=>find(row,'btnGet').active),[true,false,false,false,false]);
 assert.deepEqual(content.children.map(row=>find(row,'btnUn').active),[false,true,true,true,true]);
 assert.equal(find(content.children[0],'btnGet').button.events[0].handler,'onClickGet');
 assert.equal(find(content.children[0],'btnGet').button.events[0].data,'login');
 assert.equal(JSON.stringify(data),before,'authored prefab and dynamic icon metadata remain immutable');
 assert.ok(bountyTaskScreenshotFixture.tasks.every(task=>task.id===undefined),'screenshot rows cannot pretend to have server task IDs');
 assert.match(bountyTaskScreenshotFixture.tasks[4].evidence.counter,/inferred/);
});

test('task progress is bounded, never draws a minimum sliver at zero, and status sorting follows the client',()=>{
 const rows=[{id:9,desc:'每周悬赏-已完成',neednum:1,counter:2,status:1},{id:7,desc:'未完成',neednum:10,counter:-1,status:0},{id:8,desc:'待领取',neednum:2,counter:2,status:2},{id:6,desc:'已领取',neednum:1,counter:1,status:3}];
 assert.deepEqual(orderBountyTasks(rows).map(task=>task.id),[8,7,6,9]);
 const tree=build({tasks:rows}),items=contentFor(tree).children;
 assert.deepEqual(items.map(item=>find(item,'Bar').size[0]),[194,0,194,194]);
 assert.equal(find(items[1],'Bar').active,false);
 assert.ok(items.slice(2).every(item=>find(item,'btnFinish').active));
 assert.ok(items.slice(2).every(item=>!find(item,'btnGet').active&&!find(item,'btnUn').active));
 assert.equal(find(items[3],'taskName').label._string,'已完成');
});

test('the original task viewport clips rows and scrolls to the actual end without an HTML scrollbar',()=>{
 const tasks=Array.from({length:10},(_,index)=>({key:'row-'+index,desc:'任务'+index,neednum:1,counter:1,status:2}));
 const tree=build({tasks,scroll:1e5}),content=contentFor(tree),list=listFor(tree);
 assert.equal(list.mask,true);assert.equal(list.anchor[1],1);
 assert.deepEqual(list.size,[540,460]);assert.equal(content.size[1],973);
 assert.equal(content.trs[1],513);assert.equal(bountyTaskScrollLimit(tasks.length),513);
 assert.equal(bountyTaskScrollLimit(5),28);assert.equal(bountyTaskScrollLimit(0),0);
 assert.deepEqual(content.children.map(item=>item.trs[1]),[-50,-147,-244,-341,-438,-535,-632,-729,-826,-923]);
 const buttons=activityButtonRects(tree).filter(hit=>hit.events.some(event=>event.handler==='onClickGet'));
 assert.ok(buttons.some(hit=>hit.events[0].data==='row-9'),'last claimable row is reachable');
 assert.ok(!buttons.some(hit=>hit.events[0].data==='row-0'),'a fully clipped task cannot retain an offscreen click target');
 const listBottom=301.5;
 assert.ok(buttons.every(hit=>hit.bounds[3]<=listBottom),'native buttons stay inside the original ScrollView mask');
 const empty=build({tasks:[],scroll:200});assert.equal(contentFor(empty).size[1],0);assert.equal(contentFor(empty).trs[1],0);
});

test('both task rewards use the correct original RAW icon canvases and the authored two-slot layout',()=>{
 const tree=build({tasks:bountyTaskScreenshotFixture.tasks}),layout=find(contentFor(tree).children[0],'awardLayout');
 assert.equal(layout.children.length,2);assert.equal(layout.size[0],166.5);
 assert.deepEqual(layout.children.map(slot=>slot.trs[0]),[-45.25,45.25]);
 assert.deepEqual(layout.children.map(slot=>find(slot,'iconNum').label._string),['1个','20']);
 for(const [index,key]of ['token','experience'].entries()){
  const icon=find(layout.children[index],'iconSpr'),frame=frames.find(value=>value.uuid===data.runtime.bounty.taskIcons[key]);
  assert.ok(frame,'dynamic task '+key+' frame is collected');assert.ok(fs.existsSync(new URL('../'+frame.image,import.meta.url)));
  assert.deepEqual(frame.originalSize,[204,207]);assert.deepEqual(icon.size,[204,207]);
  assert.equal(icon.sprite._sizeMode,2);assert.equal(icon.sprite._isTrimmedMode,false);
  assert.equal(icon.trs[7],.34);assert.equal(icon.trs[8],.34);
 }
 // Canvas measurement is provided in the real view. Arial '/' is much narrower
 // than the layout helper's no-canvas ASCII estimate; the source 205px row fits.
 const context={save(){},restore(){},measureText(text){const size=Number(this.font.match(/([\d.]+)px/)[1]);return {width:[...text].reduce((sum,char)=>sum+size*(char==='/'?.278:/[\x00-\x7f]/.test(char)?.55:1),0)};}};
 layoutActivityLabels(tree,context);
 assert.equal(find(contentFor(tree).children[3],'taskName').label._string,'指尖币高级场/大师场\n打出1次封顶');
 assert.equal(find(contentFor(tree).children[0],'ProgressLbl').label._nativeAutoWidth,true);
});
