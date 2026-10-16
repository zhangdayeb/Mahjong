import {buildSanguoReadyModel,findSanguoNode} from './sanguo-table-model.js';
import {computeTableLayout,concealedHandPlacements,tilePainterOrder} from './table-layout.js';
const clone=value=>structuredClone(value);
export const SANGUO_MENU_ITEMS=Object.freeze([
 {node:'btn_trustee',id:'table-trustee',label:'托管'},
 {node:'btn_set',id:'table-settings',label:'设置'},
 {node:'btn_PlayRule',id:'table-rules',label:'规则'},
 {node:'btn_GameBehavior',id:'table-timeout',label:'超时'},
 {node:'btn_exit',id:'table-exit',label:'退出'},
].map(Object.freeze));
const nodeRect=(node,model,offset=[0,0])=>({x:model.width/2+(offset[0]+node.trs[0]-node.anchor[0]*node.size[0])*model.scale,y:model.height/2-(offset[1]+node.trs[1]+(1-node.anchor[1])*node.size[1])*model.scale,width:node.size[0]*model.scale,height:node.size[1]*model.scale});
export function buildSanguoMenu(data,model){
 const tree=clone(data.menu),[logicalWidth,logicalHeight]=model.logical;
 tree.active=true;tree.size[1]=logicalHeight;tree.trs[0]=-logicalWidth/2+127.5;tree.trs[1]=0;
 const list=findSanguoNode(tree,'panel_menuList');list.trs[0]=0;list.trs[1]=-logicalHeight/2;
 const buttons=SANGUO_MENU_ITEMS.map((item,index)=>{const node=findSanguoNode(list,item.node);node.active=true;node.trs[1]=logicalHeight-70-index*80;return{...item,rect:nodeRect(node,model,[tree.trs[0],list.trs[1]])};});
 return{tree,buttons};
}
export function buildSanguoDealtModel(data,dealt,fixture,room,viewport={}){
 const model=buildSanguoReadyModel(data,fixture,room,viewport),layout=computeTableLayout(model.width,model.height);
 model.phase='dealt-preview';model.ready=[];
 findSanguoNode(model.header,'lab_remain').label._string=String(fixture.remaining);
 findSanguoNode(model.header,'WifiIcon').active=true;findSanguoNode(model.header,'NetWorkMsLabel').active=true;
 findSanguoNode(model.header,'NetWorkMsLabel').label._string=`${fixture.networkLatency}ms`;
 model.hand=concealedHandPlacements(fixture.hand.length,0,layout,[],undefined,{drawnCount:0}).map((placement,index)=>({...placement,value:fixture.hand[index],body:dealt.tileBodies[0][index],face:dealt.tileFaces[fixture.hand[index]],seat:0}));
 model.concealed=[1,2,3].flatMap(seat=>tilePainterOrder(concealedHandPlacements(fixture.opponentHandCounts[seat],seat,layout)).map(placement=>({...placement,body:dealt.tileBodies[seat][placement.index],seat})));
 const top=clone(dealt.tools.top),right=clone(dealt.tools.right),fan=clone(dealt.tools.fan);
 top.trs[0]=-model.logical[0]/2+260;top.trs[1]=model.logical[1]/2-53.8;
 fan.trs[0]=98.5;fan.trs[1]=6.181;findSanguoNode(fan,'Root').active=true;findSanguoNode(fan,'Reddot').active=true;top.children.push(fan);
 right.trs[1]=-120;model.tools=[top,right];
 const recorder=findSanguoNode(top,'Btn_recode'),chat=findSanguoNode(right,'btn_chat'),ledger=findSanguoNode(right,'Btn_Hu_Details');
 model.toolButtons=[{id:'table-recorder',label:'记牌器',rect:nodeRect(recorder,model,top.trs)},{id:'table-fan',label:'番型',rect:nodeRect(fan,model,top.trs)},{id:'table-chat',label:'聊天',rect:nodeRect(chat,model,right.trs)},{id:'table-ledger',label:'流水',rect:nodeRect(ledger,model,right.trs)}];
 const left=model.profiles.find(profile=>profile.player.sourceSeatIndex===fixture.dealerSourceSeatIndex);
 model.dealer={position:[left.node.trs[0]+84,left.node.trs[1]+20],frame:dealt.dealer,size:[48,48]};
 model.menu=buildSanguoMenu(dealt,model);
 return model;
}
export function buildSanguoRecorder(dealt,fixture){
 const tree=clone(dealt.recorder);tree.trs[0]=0;tree.trs[1]=0;
 const original=findSanguoNode(tree,'root'),template=clone(findSanguoNode(original,'paiItem'));
 original.trs[0]=0;original.trs[1]=0;
 const background=clone(findSanguoNode(original,'img_di1'));background.trs[0]=0;background.trs[1]=0;background.size=[440,110];background.sprite._sizeMode=0;
 const title=clone(findSanguoNode(original,'Tip'));title.trs[0]=0;title.trs[1]=90;title.label._string='当前手牌（截图预览）';title.size[0]=440;
 const counts=[...new Set(fixture.hand)].map(value=>({value,count:fixture.hand.filter(tile=>tile===value).length}));
 original.children=[background,title,...counts.map(({value,count},index)=>{const node=clone(template);node.trs[0]=(index-1.5)*85;node.trs[1]=0;node.active=true;findSanguoNode(node,'value').sprite.frame=dealt.tileFaces[value];findSanguoNode(findSanguoNode(node,'num'),'label').label._string=String(count);return node;})];
 return{tree,counts};
}
