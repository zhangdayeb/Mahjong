import { Node, Label, Graphics, Color, Tween, tween, Vec3 } from 'cc';
import * as UI from './UI';
import { AssetCatalog } from './AssetCatalog';
import { suitOf } from '../rules/rules';

export interface TableCallbacks {
  tile(index:number):void;
  action(method:string,args:any[]):void;
  menu():void; hint():void; history():void; chat():void; profile(seat:number):void;
}
const names=['你','阿唐','林先生','小苏'];
const suits=['','万','条','筒'];
export class TableView {
  root:Node;
  private cards:Node;private wall:Node;private exposed:Node;private hand:Node;private actions:Node;
  private countdown:Label;private status:Label;private title:Label;private tilesLeft:Label;
  private playerLabels:Label[]=[];private profileNodes:Node[]=[];
  private effectLayer:Node;
  constructor(parent:Node,private callbacks:TableCallbacks) {
    this.root=UI.box(parent,'Table',0,0,UI.W,UI.H);
    void UI.image(this.root,'Tablecloth','backgrounds/table',0,0,UI.W,UI.H);
    UI.panel(this.root,'TitlePlate',160,14,295,44,'#183d36','#6e946d',14);
    this.title=UI.text(this.root,'TableTitle','血流麻将 · 金币场',162,17,290,36,22,'#eee5bd');
    UI.button(this.root,'TableMenu','菜单',28,18,92,44,()=>callbacks.menu(),{fill:'#fffbed',fontSize:20});
    this.cards=UI.box(this.root,'Profiles',0,0,UI.W,UI.H);
    const positions=[[38,376],[1143,193],[884,12],[38,187]];
    positions.forEach(([x,y],seat)=>{
      const plate=UI.button(this.cards,'Profile-'+seat,seat===0?'个人资料':names[seat]+'资料',x,y,96,125,()=>callbacks.profile(seat),{fill:'#183f36',border:'#a79558'});
      plate.getComponentInChildren(Label)!.string='';
      void UI.image(plate,'Avatar',seat===0?'ui/avatar':'ui/avatar-'+seat,12,9,72,70);
      this.playerLabels[seat]=UI.text(plate,'PlayerName',names[seat]+'\n30000',1,79,94,44,16,'#fff2cd');this.profileNodes[seat]=plate;
    });
    this.wall=UI.box(this.root,'OpponentsHands',0,0,UI.W,UI.H);
    this.exposed=UI.box(this.root,'PublicTiles',0,0,UI.W,UI.H);
    this.hand=UI.box(this.root,'MyHand',0,0,UI.W,UI.H);
    this.actions=UI.box(this.root,'Actions',0,0,UI.W,UI.H);
    UI.panel(this.root,'Compass',578,230,126,105,'#193f36','#bba469',22);
    UI.text(this.root,'West','西',613,234,52,23,16,'#dfd3a6');
    UI.text(this.root,'North','北',676,269,24,30,16,'#dfd3a6');
    UI.text(this.root,'South','南',583,269,24,30,16,'#dfd3a6');
    UI.text(this.root,'East','东',613,306,52,24,16,'#f5d883');
    this.countdown=UI.text(this.root,'Countdown','15',610,259,58,46,34,'#ffdf8c');
    this.tilesLeft=UI.text(this.root,'TilesLeft','余牌 55',471,17,150,32,20,'#f5dfac');
    this.status=UI.text(this.root,'TableStatus','正在准备牌局',280,388,720,46,23,'#fff0c6');
    UI.button(this.root,'Chat','聊天',1151,385,74,43,()=>callbacks.chat(),{fontSize:18});
    UI.button(this.root,'History','流水',1151,438,74,43,()=>callbacks.history(),{fontSize:18});
    UI.button(this.root,'Hint','听牌',1151,491,74,43,()=>callbacks.hint(),{fontSize:18});
    this.effectLayer=UI.box(this.root,'Effects',0,0,UI.W,UI.H);
  }
  updateCountdown(seconds:number) {this.countdown.string=String(seconds);}
  showSyncError(message:string) {this.status.string='牌局同步暂停 · '+message;UI.announce(this.status.string+'，请在菜单重试同步。');}
  render(round:any,account:any,selected:Set<number>,manual:boolean,auto:boolean) {
    this.title.string=round.config.name+' · 金币场';this.tilesLeft.string='余牌 '+round.wall.length;
    const phase=round.phase;
    this.status.string=phase==='choose'?'定缺：请选择本局缺门':phase==='exchange'?'选择三张'+(round.config.exchangeAnySuit?'手牌':'同花色牌')+'，再确认换牌':phase==='end'?'牌墙摸完，本局已结束':(auto?'托管中 · ':'')+(round.turn===0?'轮到你：点选手牌，再出牌':'等待电脑行动')+' · 底分 '+round.base;
    if(phase==='claim'||phase==='rob')this.status.string=round.claim?.options[0]&&!(0 in round.claim.responses)?(phase==='rob'?'抢杠胡':'响应 '+round.name(round.claim.value))+'：请选择操作':'等待电脑响应';
    this.playerLabels.forEach((label,seat)=>{const amount=Math.max(0,round.startBalances[seat]+round.scores[seat]);label.string=(seat===0?account?.name||'你':names[seat])+'\n'+amount;});
    UI.clearChildren(this.wall);UI.clearChildren(this.exposed);UI.clearChildren(this.hand);UI.clearChildren(this.actions);
    for(let seat=1;seat<4;seat++) {
      const length=round.hands[seat].length;
      for(let i=0;i<length;i++) {
        const top=seat===2,x=top?424+i*25:seat===3?181:1071,y=top?62:150+i*19;
        if(round.revealed[seat])this.smallTile(this.wall,round.hands[seat][i],x,y,top?24:28,top?34:38,'Revealed-'+seat+'-'+i);
        else void UI.image(this.wall,'Back-'+seat+'-'+i,'tiles/back',x,y,top?24:28,top?42:38);
      }
    }
    const origins=[[437,349],[798,210],[445,151],[327,205]];
    round.discards.forEach((values:number[],seat:number)=>{const [x,y]=origins[seat];values.forEach((v,i)=>this.smallTile(this.exposed,v,x+(i%10)*24,y+Math.floor(i/10)*33,23,32,'Discard-'+seat+'-'+i));});
    round.melds.forEach((groups:any[],seat:number)=>{groups.forEach((group:any,i:number)=>{
      const [x,y]=seat===0?[180+i*101,479]:seat===2?[443+i*95,110]:seat===1?[974,225+i*76]:[221,219+i*76];
      const count=group.type==='peng'?3:4;
      for(let n=0;n<count;n++)this.smallTile(this.exposed,group.type==='dark'&&seat!==0?57:group.value,x+(n%3)*23,y+Math.floor(n/3)*14,23,32,'Meld-'+seat+'-'+i+'-'+n);
    });});
    const cards=round.hands[0],width=Math.min(65,1020/Math.max(cards.length,14)-3),height=88,left=144+(1020-cards.length*(width+3))/2;
    cards.forEach((value:number,index:number)=>{
      const chosen=selected.has(index),node=UI.button(this.hand,'Hand-'+index,'手牌 '+round.name(value),left+index*(width+3),529-(chosen?15:0),width,height,()=>this.callbacks.tile(index),{fill:'#fffef1',border:chosen?'#ffe081':'#82a08e',enabled:manual&&(phase==='exchange'||phase==='play'&&round.turn===0),fontSize:16});
      node.getComponentInChildren(Label)!.string='';
      UI.setButtonPressed(node,chosen);
      void UI.image(node,'TileFace',AssetCatalog.tile(value),3,3,width-6,height-6);
      if(round.missing[0]&&suitOf(value)===round.missing[0])UI.text(node,'Missing','缺',width-24,0,23,22,15,'#bf5c3c');
    });
    const options:{label:string,method:string,args:any[],enabled?:boolean}[]=[];
    if(phase==='choose')for(let suit=1;suit<=3;suit++)options.push({label:'缺'+suits[suit],method:'choose',args:[suit]});
    if(phase==='exchange')options.push({label:'确认换三张',method:'exchange',args:[Array.from(selected)],enabled:selected.size===3});
    if(phase==='play'&&round.turn===0) {
      for(const option of round.options(0)) {
        if(option==='hu')options.push({label:'自摸',method:'hu',args:[0]});
        else if(option==='redKong')options.push({label:'红中杠',method:'redKong',args:[0]});
        else if(option==='reveal')options.push({label:'明牌 ×6',method:'reveal',args:[0]});
        else {const [kind,v]=option.split(':');options.push({label:(kind==='add'?'补杠 ':'暗杠 ')+round.name(Number(v)),method:'gang',args:[0,Number(v),kind==='add']});}
      }
      options.push({label:'出牌',method:'discard',args:[0,Array.from(selected)[0]],enabled:selected.size===1});
    }
    if((phase==='claim'||phase==='rob')&&round.claim?.options[0]&&!(0 in round.claim.responses))for(const op of [...round.claim.options[0],'pass'])options.push({label:({hu:'胡牌',peng:'碰',gang:'杠',pass:'过'} as any)[op],method:phase==='rob'?'rob':'respond',args:[0,op]});
    const total=options.length*114,start=640-total/2;
    options.forEach((op,i)=>UI.button(this.actions,'Action-'+op.method+i,op.label,start+i*114,439,106,43,()=>this.callbacks.action(op.method,op.args),{fill:op.label==='过'?'#e7edde':'#f1d782',border:'#c6a95f',fontSize:19,enabled:manual&&op.enabled!==false}));
    UI.announce(round.config.name+'，'+this.status.string+'，金币 '+(account?.balance??0));
  }
  private smallTile(parent:Node,value:number,x:number,y:number,w:number,h:number,name:string) {const tile=UI.panel(parent,name,x,y,w,h,'#fffef1','#8b9b81',3);void UI.image(tile,'Face',AssetCatalog.tile(value),1,1,w-2,h-2);return tile;}
  flyDiscard(value:number,seat:number,index:number) {
    const origins=[[620,522],[1079,285],[633,82],[189,285]],targets=[[437,349],[798,210],[445,151],[327,205]];
    const [sx,sy]=origins[seat],tx=targets[seat][0]+index%10*24,ty=targets[seat][1]+Math.floor(index/10)*33;
    const tile=this.smallTile(this.effectLayer,value,sx,sy,60,84,'FlyingTile');
    const start=tile.position.clone(),end=new Vec3(tx+11.5-UI.W/2,UI.H/2-ty-16,0),mid=new Vec3((start.x+end.x)/2,(start.y+end.y)/2+70,0);
    tween(tile).to(.19,{position:mid,scale:new Vec3(1.12,1.12,1)},{easing:'quadOut'}).to(.22,{position:end,scale:new Vec3(.38,.38,1)},{easing:'quadIn'}).call(()=>{tile.removeFromParent();tile.destroy();}).start();
  }
  burst(word:string,fan:string='') {
    const layer=UI.box(this.effectLayer,'Burst',0,0,UI.W,UI.H);
    const rays=UI.box(layer,'GoldRays',415,131,450,270);const g=rays.addComponent(Graphics);g.strokeColor=new Color(255,220,94,130);g.lineWidth=3;
    for(let i=0;i<18;i++){const angle=i*Math.PI/9;g.moveTo(Math.cos(angle)*75,Math.sin(angle)*55);g.lineTo(Math.cos(angle)*200,Math.sin(angle)*128);}g.stroke();
    const title=UI.text(layer,'ActionWord',word,451,178,380,137,89,'#ffdf6f');title.isBold=true;title.enableOutline=true;title.outlineColor=UI.color('#945e20');title.outlineWidth=3;
    if(fan){UI.panel(layer,'FanBanner',423,317,436,50,'#652f1a','#efd782',13);UI.text(layer,'FanText',fan,429,319,424,46,26,'#ffdf74');}
    layer.setScale(.72,.72,1);tween(layer).to(.16,{scale:new Vec3(1.06,1.06,1)},{easing:'backOut'}).to(.1,{scale:new Vec3(1,1,1)}).delay(.64).to(.2,{scale:new Vec3(.96,.96,1)}).call(()=>{layer.removeFromParent();layer.destroy();}).start();
    for(let i=0;i<14;i++){const particle=UI.panel(layer,'GoldParticle-'+i,637,259,5+i%3,5+i%3,'#ffe692','',3);const a=i*Math.PI/7; tween(particle).delay(.03*(i%4)).to(.62,{position:new Vec3(Math.cos(a)*(146+i*4),Math.sin(a)*103,0),scale:new Vec3(.15,.15,1)},{easing:'quadOut'}).start();}
  }
  dispose(){Tween.stopAllByTarget(this.root);this.root.removeFromParent();this.root.destroy();}
}
