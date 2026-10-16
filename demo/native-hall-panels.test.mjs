import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {hallPanelKind,prepareHallPanel,findHallNode,hallNodeRects} from './native-hall-panels.js';

const data=JSON.parse(fs.readFileSync(new URL('./hall-panel-study/panels.json',import.meta.url)));
function nodes(tree){return[tree,...tree.children.flatMap(nodes)];}

test('all native hall panels keep unique hit nodes and a source close control',()=>{
 for(const kind of Object.keys(data.panels)){
  const scene=prepareHallPanel(data,kind,{},1440),all=nodes(scene);
  assert.equal(new Set(all.map(node=>node.id)).size,all.length,`${kind} duplicate node IDs`);
  assert.ok(all.some(node=>node.active&&node.components.some(component=>component.events?.some(event=>['onClickClose','onClickDownMor'].includes(event.handler)))),`${kind} source close control`);
  for(const rect of hallNodeRects(scene).values())assert.ok([rect.left,rect.top,rect.width,rect.height].every(Number.isFinite),`${kind}/${rect.node.name} invalid geometry`);
 }
 assert.equal(hallPanelKind('个人资料'),'profile');assert.equal(hallPanelKind('麻卡巴卡'),'maka');assert.equal(hallPanelKind('unsupported'),null);
});

test('native setting runtime spacing and switch state are applied',()=>{
 const scene=prepareHallPanel(data,'settings',{preferences:{music:false,effects:true}});
 assert.deepEqual(findHallNode(scene,'LayoutLeft').children.filter(node=>node.active).map(node=>node.trs[1]),[-25,-111]);
 assert.equal(findHallNode(scene,'sanGuoTable').active,false);
 assert.deepEqual(findHallNode(scene,'LayoutRight').children.filter(node=>node.active).map(node=>node.trs[1]),[-25,-111]);
 const source=data.panels.settings.bindings.d1c84ZRWQlBtpmDy8Q04wRs;
 const music=nodes(scene).find(node=>node.components.some(component=>component.events?.some(event=>event.handler==='onClickedMusic')));
 assert.equal(music.sprite.frame,source.spfCheckOff);
 assert.equal(findHallNode(scene,'LayoutBottomBtn').trs[1],-132);
});

test('empty local account data removes authored inventory and live mail examples',()=>{
 const mail=prepareHallPanel(data,'mail',{}),binding=data.panels.mail.bindings['1c897RoEU5ArpzkLmCX8cUi'];
 assert.equal(findHallNode(mail,binding.nodeMailContainer.node).children.length,0);
 assert.equal(findHallNode(mail,binding.nodeNoMail.node).active,true);
 assert.equal(findHallNode(mail,binding.btnGetReward.node).active,false);
 assert.equal(findHallNode(mail,binding.labKeepDayTips.node).label._string,'');
 const bag=prepareHallPanel(data,'bag',{});
 for(const current of Object.values(data.panels.bag.bindings))if(current.content&&current.itemPrefab)assert.equal(findHallNode(bag,current.content.node).children.length,0);
});

test('profile and welfare content use local facts without filling server multipliers',()=>{
 const profile=prepareHallPanel(data,'profile',{profile:{name:'本地玩家',id:'local-1',beans:'120',games:4,winRate:'25%'}}),binding=data.panels.profile.bindings['1b9adOkyKtAQrQVkWp+B0+x'];
 assert.equal(findHallNode(profile,binding.lab_name.node).label._string,'本地玩家');
 assert.equal(findHallNode(profile,binding.lab_gameCount.node).label._string,'4');
 assert.equal(findHallNode(profile,binding.SectionInfoPlaceholder.node).children.length,0);
 const maka=prepareHallPanel(data,'maka',{}),welfare=nodes(maka).filter(node=>node.name==='SubLabel');
 assert.ok(welfare.length>0);assert.ok(welfare.every(node=>!/[\*]|\{[01]\}/.test(node.label._string)));
});

test('more menu is the source three-node toolbar and feedback resets its tag family',()=>{
 const more=prepareHallPanel(data,'more',{moreAnchor:[330,674]},1440),menu=findHallNode(more,'img_moreBg');
 assert.equal(menu.size[0],252);assert.deepEqual(menu.children.map(node=>node.name),['btn_down','btn_Rule','btn_feedback']);
 const low=prepareHallPanel(data,'feedback',{starLevel:2}),high=prepareHallPanel(data,'feedback',{starLevel:5});
 assert.equal(nodes(low).filter(node=>node.feedbackTag).length,12);
 assert.equal(nodes(high).filter(node=>node.feedbackTag).length,7);
});
