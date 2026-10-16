import {alignActivityWidgets} from './native-hall-activities.js';
const clone=value=>structuredClone(value);
export function findSanguoNode(node,name){if(node.name===name)return node;for(const child of node.children||[]){const match=findSanguoNode(child,name);if(match)return match;}return null;}
function visit(node,change){change(node);for(const child of node.children||[])visit(child,change);}
const brown=0xff353e4a;

// The independent page preserves the observed pre-deal state. No wall, hands,
// turn countdown, hero effects or scoring are borrowed from a bloodflow round.
export function buildSanguoReadyModel(data,fixture,room,{width=986,height=483}={}){
 if(!(width>0&&height>0))throw RangeError('Sanguo table dimensions must be positive');
 const scale=Math.min(width/1280,height/720),logical=[width/scale,height/scale],tree=clone(data.tree);
 findSanguoNode(tree,'fnt_countDown').active=false;
 const background=findSanguoNode(tree,'pic_09');background.size=[Math.max(1600,logical[0]),Math.max(720,logical[1])];
 const ready=data.ready.seats.filter(slot=>fixture.readySourceSeats.includes(slot.sourceSeatIndex)).map(slot=>{
  const node=clone(data.ready.template);node.trs[0]=slot.position[0];node.trs[1]=slot.position[1];
  visit(node,part=>{if(part.name==='zhunbei_1'){part.trs[0]=0;part.opacity=255;}else if(part.name.startsWith('path_16'))part.active=false;});
  return{sourceSeatIndex:slot.sourceSeatIndex,seat:slot.seat,node};
 });
 const profiles=fixture.players.map(player=>{
  const slot=data.profile.slots.find(value=>value.sourceSeatIndex===player.sourceSeatIndex),node=clone(data.profile.tree),widget=slot.widget,runtime=data.profile.runtimeWidgetOverrides.find(value=>value.sourceSeatIndex===player.sourceSeatIndex);
  node.trs[0]=slot.trs[0];node.trs[1]=widget?._alignFlags&1?logical[1]/2-(runtime?.top??widget._top):widget?._alignFlags&4?-logical[1]/2+(runtime?.bottom??widget._bottom):slot.trs[1];
  const nick=findSanguoNode(node,'label_Nickname');nick.label._string=player.displayName;
  const info=findSanguoNode(node,'img_userinfo_bg');info.size[1]=47;
  findSanguoNode(node,'img_Coin').active=false;
  const coins=findSanguoNode(node,'img_ZCoin');coins.active=true;coins.trs[1]=-31;
  findSanguoNode(node,'label_ZCoin').label._string=player.balanceText;
  const rank=findSanguoNode(node,'rankIcon');rank.sprite.frame=data.profile.rankFrames[player.rankIndex];
  const rankNumber=findSanguoNode(node,'rankNum');rankNumber.label._string=String(player.rankLevel);rankNumber.size[0]=48;
  const avatar=findSanguoNode(node,'HeadParent');avatar.children=[{name:'captured-head',active:true,opacity:255,color:0xffffffff,trs:[0,0,0,0,0,0,1,1,1,1],size:[100,100],anchor:[.5,.5],sprite:{frame:`avatar-${player.sourceSeatIndex}`,_sizeMode:0},children:[]}];
  return{player,node};
 });
 const title=clone(data.textNodes.title),subtitle=clone(data.textNodes.subtitle);
 for(const node of[title,subtitle]){node.trs[0]-=640;node.trs[1]-=420;node.color=brown;node.size[0]=700;}
 title.label._string=fixture.title;subtitle.label._string=`底注:${room.base} 封顶:${fixture.maxFan}倍`;
 const header=clone(data.header.tree);header.children=header.children.filter(node=>['img_MJ_Remain_info','LeftAllNode'].includes(node.name));
 const env=findSanguoNode(header,'LeftAllNode');env.children=env.children.filter(node=>['LineNode1','img_Time_Info'].includes(node.name));
 findSanguoNode(header,'lab_remain').label._string=data.header.runtime.remainText;
 findSanguoNode(header,'lab_time').label._string=fixture.clockDisplay;
 findSanguoNode(header,'WifiIcon').active=false;findSanguoNode(header,'NetWorkMsLabel').active=false;
 const menuNode=clone(data.header.menu.tree);header.children.push(menuNode);alignActivityWidgets(header,...logical);
 const menuRect={x:width/2+(menuNode.trs[0]-menuNode.anchor[0]*menuNode.size[0])*scale,y:height/2-(menuNode.trs[1]+(1-menuNode.anchor[1])*menuNode.size[1])*scale,width:menuNode.size[0]*scale,height:menuNode.size[1]*scale};
 return{width,height,scale,logical,tree,ready,profiles,title,subtitle,header,room,phase:'waiting-ready',typeID:911,menuRect};
}
