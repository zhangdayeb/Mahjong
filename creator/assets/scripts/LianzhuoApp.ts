import { _decorator, Component, Node, UITransform, Label, Button, EditBox, ScrollView, Mask, BlockInputEvents, ResolutionPolicy, view, resources, SpriteFrame, game, Game, isValid, sys, profiler } from 'cc';
import * as UI from './ui/UI';
import { TableView } from './ui/TableView';
import { AssetCatalog } from './ui/AssetCatalog';
import { AudioService } from './services/AudioService';
import { WalletClient } from './services/WalletClient';
import { GameSession, PLAYABLE_MODES } from './services/GameSession';
import { RULE_PROFILES } from './rules/rule-profiles';
import { roomsForMode } from './rules/rooms-config';
import { liveRulebook } from './rules/live-rulebook';
import { snapshotActionResult, actionResultEvents } from './rules/action-result-events';
import { snapshotTableAudio, tableAudioEvents, createCountdownCue } from './rules/table-audio-events';
import { winningTiles } from './rules/hand-analysis';
import { suitOf } from './rules/rules';

const { ccclass }=_decorator;
const MODE_COLORS=['#deebbf','#f5cfc3','#bee1cc','#d1e3e7','#f0dfa8','#dfcce6','#e6d8bc'];
const signed=(value:number)=>value>=0?'+'+value:String(value);

@ccclass('LianzhuoApp')
export class LianzhuoApp extends Component {
  private wallet=new WalletClient();private session:GameSession|null=null;private audio!:AudioService;
  private page!:Node;private modal:Node|null=null;private toastNode:Node|null=null;private table:TableView|null=null;
  private route='loading';private mode='classic';private room='beginner';private carousel=0;
  private selected=new Set<number>();private balanceLabel:Label|null=null;
  private deadline=0;private busyUntil=0;private nextBot=0;private pending=false;private foreground=true;
  private seconds=15;private botSpeed=650;private effects=true;private settlementQueued=false;
  private countdownCue=createCountdownCue();
  private wasBusy=false;private adTimer:ReturnType<typeof setInterval>|null=null;private adBusy=false;
  private unsubscribe:()=>void=()=>{};
  private hide=()=>{this.foreground=false;this.audio?.pause();};
  private show=()=>{this.foreground=true;this.deadline=Date.now()+this.seconds*1000;this.nextBot=Date.now()+this.botSpeed;this.audio?.resume();};
  onLoad() {
    view.setDesignResolutionSize(UI.W,UI.H,ResolutionPolicy.SHOW_ALL);view.resizeWithBrowserSize(true);
    this.node.getComponent(UITransform)!.setContentSize(UI.W,UI.H);UI.setUIRoot(this.node);profiler.hideStats();
    this.audio=new AudioService(this.node);game.on(Game.EVENT_HIDE,this.hide);game.on(Game.EVENT_SHOW,this.show);
    this.unsubscribe=this.wallet.subscribe(account=>{if(this.balanceLabel&&isValid(this.balanceLabel))this.balanceLabel.string=String(account.balance);});
    try {const settings=JSON.parse(sys.localStorage.getItem('LIANZHUO_CREATOR_SETTINGS')||'{}');this.seconds=[5,15,30].includes(settings.seconds)?settings.seconds:15;this.botSpeed=settings.fast?120:650;this.effects=settings.effects!==false;}catch{}
  }
  start(){void this.loading();}
  update() {
    UI.updateAccessibility(this.modal);
    const s=this.session,now=Date.now();
    if(this.route!=='table'||!s?.round||this.modal||this.pending||!this.foreground)return;
    if(s.syncError)return;
    const busy=now<this.busyUntil;if(this.wasBusy&&!busy)this.drawTable();this.wasBusy=busy;
    const remaining=s.round.phase==='end'?0:Math.min(this.seconds,Math.max(0,Math.ceil((this.deadline-now)/1000)));
    this.table?.updateCountdown(remaining);if(this.countdownCue({active:!busy&&!s.auto&&s.humanPending(),deadline:this.deadline,remaining}))void this.audio.play('countdown');
    if(busy||s.round.phase==='end')return;
    if(now>=this.nextBot){this.nextBot=now+this.botSpeed;this.automate();}
    if(s.humanPending()&&!s.auto&&now>=this.deadline)this.act('auto',[0]);
  }
  private resetPage(route:string) {
    this.closeModal();if(this.page){UI.clearChildren(this.page);this.page.removeFromParent();this.page.destroy();}
    this.table=null;this.balanceLabel=null;this.route=route;this.page=UI.box(this.node,'Page-'+route,0,0,UI.W,UI.H);UI.announce('联桌麻将 · '+({loading:'加载',hall:'大厅',rooms:'场次选择',table:'牌桌'} as any)[route]);
  }
  private async loading() {
    this.resetPage('loading');void UI.image(this.page,'LoadingBackground','backgrounds/loading',0,0,UI.W,UI.H);
    UI.panel(this.page,'BrandPlate',408,149,464,244,'#fffbe9','#d4be82',28);
    UI.text(this.page,'Brand','联桌麻将',414,173,452,95,58);UI.text(this.page,'Tagline','相逢一桌，轻松一局',422,275,436,37,24);
    const status=UI.text(this.page,'LoadingStatus','正在加载资源与金币服务…',350,411,580,48,20);
    let ready=false;
    const enter=UI.button(this.page,'EnterHall','进入大厅',529,478,222,60,()=>{if(!ready){void this.loading();return;}void this.audio.unlock();void this.run(()=>this.hall());},{fill:'#e8cc7a',fontSize:29,enabled:false});
    try {
      const assets=new Promise<void>((resolve,reject)=>resources.loadDir('backgrounds',SpriteFrame,(done,total)=>{if(isValid(status))status.string='加载资源 '+Math.round(done/Math.max(1,total)*100)+'%';},error=>error?reject(error):resolve()));
      await Promise.all([assets,this.wallet.enterLobby()]);if(!isValid(status))return;ready=true;status.string='准备就绪';UI.setButtonEnabled(enter,true);UI.announce('联桌麻将加载完成，金币 '+this.wallet.account!.balance+'，进入大厅。');
    }catch(error){if(!isValid(status))return;status.string=String((error as Error).message);UI.setButtonText(enter,'重新加载');UI.setButtonEnabled(enter,true);this.toast('加载未完成，请重试。');}
  }
  private async hall() {
    if(this.session){await this.session.dispose();this.session=null;}
    await this.wallet.enterLobby();this.audio.setScene('hall');this.resetPage('hall');
    void UI.image(this.page,'HallBackground','backgrounds/hall',0,0,UI.W,UI.H);
    this.hallHeader();
    UI.text(this.page,'BenefitsTitle','游戏福利',76,139,242,43,24,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);
    const relief=UI.button(this.page,'DailyRelief','每日救济金',76,190,253,109,()=>void this.daily(),{fontSize:28,fill:'#fffbec'});
    relief.getComponentInChildren(Label)!.string='';void UI.image(relief,'Coin','ui/coin',15,28,50,53);UI.text(relief,'ReliefTitle','每日救济金',69,13,179,40,27);UI.text(relief,'ReliefAmount','每天领取 30000 金币',56,56,195,35,17);
    UI.text(this.page,'GamesTitle','麻将玩法',439,123,206,42,31);UI.text(this.page,'GameCount','7 种人机玩法',648,127,172,34,18);
    const visible=PLAYABLE_MODES.slice(this.carousel,this.carousel+3);
    visible.forEach((mode,index)=>{
      const n=PLAYABLE_MODES.indexOf(mode),profile=(RULE_PROFILES as any)[mode];
      const card=UI.button(this.page,'Game-'+mode,profile.name,437+index*255,179,228,355,()=>{this.mode=mode;this.rooms();},{fill:MODE_COLORS[n],fontSize:25,border:'#fffae3'});
      card.getComponentInChildren(Label)!.string='';UI.text(card,'GameNumber',String(n+1).padStart(2,'0'),13,15,40,30,18);UI.text(card,'CoinMode','金币场',139,16,72,29,17);
      void UI.image(card,'GameArtwork',(AssetCatalog.games as any)[mode],21,62,186,195);
      UI.panel(card,'CardFooter',1,251,226,102,'#fffdf1','',15);UI.text(card,'GameName',profile.name,5,258,218,48,26);UI.text(card,'EnterRooms','进入场次 ›',33,310,162,31,19);
    });
    UI.button(this.page,'PreviousGames','‹',704,551,50,32,()=>{this.carousel=Math.max(0,this.carousel-1);void this.hall();},{enabled:this.carousel>0});
    UI.text(this.page,'CarouselHint','左右查看更多玩法',758,550,186,33,18);UI.button(this.page,'NextGames','›',950,551,50,32,()=>{this.carousel=Math.min(4,this.carousel+1);void this.hall();},{enabled:this.carousel<4});
    const nav=UI.panel(this.page,'HallNavigation',74,581,649,53,'#f9f6e5','#fff9e5',25);
    [['更多',()=>this.more()],['活动',()=>this.benefits()],['邮件',()=>this.listModal('邮件',['暂无新邮件。'])],['设置',()=>this.settings()]].forEach(([label,fn],i)=>UI.button(nav,'Nav-'+i,String(label),19+i*159,7,150,39,fn as ()=>void,{border:'',fill:'#f9f6e5'}));
    UI.button(this.page,'QuickStart','快速开始 ›',993,583,220,51,()=>void this.run(()=>this.startGame('classic','beginner')),{fill:'#e7cb71',fontSize:29});
    UI.announce('大厅，金币 '+this.wallet.account!.balance+'，7种麻将玩法。');
  }
  private hallHeader() {
    const account=this.wallet.account!;const profile=UI.button(this.page,'PersonalProfile','个人资料',69,13,280,84,()=>this.profile(0),{fill:'#fffbed',border:'#fff9e5'});profile.getComponentInChildren(Label)!.string='';
    void UI.image(profile,'Avatar','ui/avatar',9,6,71,71);UI.text(profile,'Name',account.name,88,12,184,29,21,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);UI.text(profile,'Rank','初阶雀尊',87,43,183,27,16,UI.PALETTE.muted,Label.HorizontalAlign.LEFT);
    const money=UI.button(this.page,'Wallet','金币补给',533,29,238,43,()=>this.benefits(),{fill:'#fffbed',border:'#fff9e5'});money.getComponentInChildren(Label)!.string='';void UI.image(money,'Coin','ui/coin',-3,-6,49,52);
    UI.text(money,'Currency','金币',46,0,68,43,20,'#987530');this.balanceLabel=UI.text(money,'Balance',String(account.balance),111,0,97,43,25);UI.text(money,'MoreCoins','+',201,0,34,43,30);
  }
  private rooms() {
    this.resetPage('rooms');void UI.image(this.page,'RoomsBackground','backgrounds/hall',0,0,UI.W,UI.H);
    UI.button(this.page,'ReturnHall','‹ 返回大厅',33,24,171,48,()=>void this.run(()=>this.hall()));
    const profile=(RULE_PROFILES as any)[this.mode];UI.text(this.page,'ModeName',profile.name,230,23,317,49,32);UI.button(this.page,'ModeRules','玩法规则',597,28,126,40,()=>this.rules());
    const money=UI.button(this.page,'RoomWallet','金币补给',920,26,316,44,()=>this.benefits(),{fill:'#fffbed'});money.getComponentInChildren(Label)!.string='';void UI.image(money,'Coin','ui/coin',7,0,43,43);UI.text(money,'Currency','金币',54,0,57,44,19);this.balanceLabel=UI.text(money,'Balance',String(this.wallet.account!.balance),108,0,165,44,26);UI.text(money,'Plus','+',276,0,31,44,25);
    UI.text(this.page,'ChooseRoom','选择适合自己的底分，开始一局',191,119,898,45,27);
    roomsForMode(this.mode).forEach((room:any,index:number)=>{
      const x=198+(index%2)*448,y=198+Math.floor(index/2)*167;
      const card=UI.button(this.page,'Room-'+room.id,room.name+' 底分'+room.base,x,y,399,137,()=>void this.run(()=>this.startGame(this.mode,room.id)),{fill:['#e4ecc9','#c7e4d0','#d3e8ed','#e3d6e7'][index],border:'#fff9e7'});card.getComponentInChildren(Label)!.string='';
      UI.text(card,'RoomName',room.name,20,12,356,36,27);UI.text(card,'Base',String(room.base),24,45,351,55,43);UI.text(card,'Practice','人机练习  ·  进入牌桌 ›',20,102,357,29,18);
    });
    UI.text(this.page,'PracticeNote','金币得失按本局规则结算',319,570,641,37,20);
  }
  private async startGame(mode:string,room:string) {
    if(this.session)await this.session.dispose();this.mode=mode;this.room=room;this.selected.clear();this.settlementQueued=false;
    this.resetPage('table');this.audio.setScene('table');this.table=new TableView(this.page,{tile:i=>this.selectTile(i),action:(method,args)=>this.act(method,args),menu:()=>this.tableMenu(),hint:()=>this.hint(),history:()=>this.history(),chat:()=>this.chat(),profile:seat=>this.profile(seat)});
    this.session=new GameSession(this.wallet,{onChange:()=>this.drawTable(),onError:error=>{this.toast(error.message);this.drawTable();},onEnd:()=>{if(this.settlementQueued)return;this.settlementQueued=true;this.scheduleOnce(()=>this.settlement(),Math.max(0,(this.busyUntil-Date.now())/1000));}});
    try{await this.session.start(mode,room);this.deadline=Date.now()+this.seconds*1000;this.nextBot=Date.now()+900;void this.audio.play('shuffle');this.drawTable();}
    catch(error){this.toast((error as Error).message);this.rooms();throw error;}
  }
  private drawTable() {const s=this.session;if(this.route!=='table'||!s?.round||!this.table)return;const manual=!s.auto&&!s.closed&&!s.syncError&&!this.pending&&!this.modal&&Date.now()>=this.busyUntil;this.table.render(s.round,this.wallet.account,this.selected,manual,s.auto);if(s.syncError)this.table.showSyncError(s.syncError.message);}
  private selectTile(index:number) {
    const s=this.session;if(!s?.round||s.syncError||s.auto||this.modal||this.pending||Date.now()<this.busyUntil||!s.humanPending())return;
    const r=s.round;if(r.phase==='exchange'){if(this.selected.has(index))this.selected.delete(index);else{this.selected.add(index);if(this.selected.size>3||!r.config.exchangeAnySuit&&new Set(Array.from(this.selected).map(i=>suitOf(r.hands[0][i]))).size>1)this.selected=new Set([index]);}}
    else if(r.phase==='play'&&r.turn===0){if(this.selected.has(index)){this.act('discard',[0,index]);return;}this.selected=new Set([index]);}
    else return;void this.audio.play('select');this.drawTable();
  }
  private act(method:string,args:any[]) {
    const s=this.session;if(!s?.round||s.syncError||this.pending||this.modal||Date.now()<this.busyUntil||s.closed)return;
    const before=snapshotActionResult(s.round),audioBefore=snapshotTableAudio(s.round),discards=s.round.discards.map((p:number[])=>p.length);
    if(!s.perform(method,args))return;this.afterAction(before,audioBefore,discards);
  }
  private automate() {
    const s=this.session;if(!s?.round||s.closed)return;const before=snapshotActionResult(s.round),audioBefore=snapshotTableAudio(s.round),discards=s.round.discards.map((p:number[])=>p.length);
    if(s.stepBots())this.afterAction(before,audioBefore,discards);
  }
  private afterAction(before:any,audioBefore:any,discards:number[]) {
    const r=this.session!.round,result=actionResultEvents(before,r),sound=tableAudioEvents(audioBefore,r,result);this.selected.clear();
    if(sound.draw)void this.audio.play('draw');if(sound.huCue)void this.audio.play('hu-cue');
    let duration=80;
    for(const action of result.actions){void this.audio.play(action.action);if(this.effects){this.table?.burst(({peng:'碰',gang:'杠',hu:'胡',zimo:'自摸',qgh:'抢杠胡'} as any)[action.action],action.fan?`${action.fan.name} · ${action.fan.multiple}倍`:'');duration=Math.max(duration,1100);}}
    if(before.phase==='choose'&&r.phase==='play')void this.audio.play('dingque');
    r.discards.forEach((p:number[],seat:number)=>{if(p.length>discards[seat]){void this.audio.play('outtile');const tile=p[p.length-1];void this.audio.play(tile===51?'red':`${suitOf(tile)}-${tile%10}`);if(this.effects){this.table?.flyDiscard(tile,seat,p.length-1);duration=Math.max(duration,420);}}});
    this.busyUntil=Date.now()+duration;this.wasBusy=true;this.deadline=this.busyUntil+this.seconds*1000;this.nextBot=this.busyUntil+this.botSpeed;this.drawTable();
  }
  private tableMenu() {
    const s=this.session!;const {body}=this.openModal('牌桌菜单',570,s.syncError?540:430);
    [['托管'+(s.auto?'：开启':'：关闭'),()=>{s.auto=!s.auto;this.closeModal();this.deadline=Date.now()+this.seconds*1000;this.nextBot=Date.now()+120;this.drawTable();}],['设置',()=>this.settings()],['规则',()=>this.rules()],['本局流水',()=>this.history()],['保存本局并返回场次',()=>void this.run(async()=>{await s.dispose();this.session=null;this.closeModal();this.rooms();})]].forEach(([label,fn],i)=>UI.button(body,'Menu-'+i,String(label),33,65+i*58,504,45,fn as ()=>void));
    if(s.syncError){UI.text(body,'SyncFailure',s.syncError.message,33,357,504,87,20,'#9d493a');UI.button(body,'RetrySync','重试同步',33,465,504,45,()=>void this.run(async()=>{await s.flush();this.closeModal();this.drawTable();}),{fill:'#eed28a'});}
  }
  private settlement() {
    const s=this.session;if(!s?.round||this.route!=='table')return;this.audio.cancelTransient();void this.audio.play(s.round.scores[0]>0?'settlement-win':'settlement-end');
    const {body}=this.openModal('本局结算',740,503);UI.text(body,'Settled','已完成后端结算 · '+s.round.config.name,28,60,684,37,22);
    const names=[this.wallet.account!.name,'阿唐','林先生','小苏'];names.forEach((name,i)=>{UI.panel(body,'ScoreRow-'+i,43,110+i*58,654,49,i===0?'#edf0d5':'#f5f2e4','',12);UI.text(body,'ScoreName-'+i,name,50,116+i*58,217,36,20);UI.text(body,'ScoreDelta-'+i,signed(s.round.scores[i]),281,116+i*58,171,36,24,s.round.scores[i]>=0?'#aa7731':'#a34c43');UI.text(body,'ScoreBalance-'+i,String(Math.max(0,s.round.startBalances[i]+s.round.scores[i])),473,116+i*58,210,36,23);});
    UI.text(body,'SettledBalance','当前金币 '+this.wallet.account!.balance,99,350,542,37,25);
    UI.button(body,'AnotherRound','再来一局',95,422,255,49,()=>void this.run(()=>this.startGame(this.mode,this.room)),{fill:'#e5ca7c',fontSize:25});
    UI.button(body,'BackToRooms','返回场次',390,422,255,49,()=>{this.closeModal();this.rooms();},{fontSize:25});UI.announce('本局结算，得失 '+signed(s.round.scores[0])+'，当前金币 '+this.wallet.account!.balance);
  }
  private rules(){const data:any=liveRulebook(this.mode);this.listModal('规则 · '+(RULE_PROFILES as any)[this.mode].name,[...data.BASERULE,...data.FANRULE]);}
  private hint() {
    const r=this.session?.round;if(!r)return;let hand=r.hands[0].slice();const target=13-r.melds[0].length*3;
    if(['exchange','choose'].includes(r.phase)){this.listModal('听牌提示',['完成换牌、定缺后查看听牌。']);return;}
    if(hand.length===target+1){const index=Array.from(this.selected)[0];if(index===undefined){this.listModal('听牌提示',['请选择一张手牌，再查看打出后的听牌。']);return;}hand.splice(index,1);}
    const waits=winningTiles(hand,r.missing[0],r.melds[0],r.config);this.listModal('听牌提示',[waits.length?'可胡牌张：'+waits.map((v:number)=>r.name(v)).join('、'):'当前没有可胡牌张。','这是牌型可胡张，未知牌可能在牌墙或其他玩家手里。']);
  }
  private history() {const r=this.session?.round;if(r&&this.route==='table'){this.listModal('本局流水',['本局得失 '+signed(r.scores[0]),...r.log]);return;}void this.run(async()=>{const rows=await this.wallet.history();this.listModal('金币记录',rows.length?rows.map((row:any)=>`${({daily_grant:'每日救济金',ad_grant:'演示广告',refresh:'刷新余额',reset:'历史重置'} as any)[row.kind]||row.kind} · ${row.before} → ${row.after} · ${new Date(row.createdAt).toLocaleString()}`):['暂无金币操作记录。']);});}
  private chat() {const {body}=this.openModal('快捷聊天',490,403);['大家好，开心一局！','慢慢想牌，不着急。','打得不错！','联桌相逢，好运常在。'].forEach((line,i)=>UI.button(body,'Chat-'+i,line,31,74+i*63,428,49,()=>{this.session?.round?.record('你：'+line);this.closeModal();this.toast(line);}));UI.text(body,'ChatNote','快捷消息仅在本次人机对局显示',36,334,420,32,16);}
  private profile(seat:number) {
    const mine=seat===0,account=this.wallet.account!,names=[account.name,'阿唐','林先生','小苏'];const {body}=this.openModal(mine?'个人中心':'玩家资料',650,494);
    void UI.image(body,'ProfileAvatar','ui/avatar'+(mine?'':'-'+seat),43,71,105,105);UI.text(body,'ProfileName',names[seat],168,81,428,42,28,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);
    UI.text(body,'ProfileBalance','金币 '+(mine?this.session&&this.route==='table'?this.session.displayBalance:account.balance:this.session?.round?.available(seat)??0),170,125,423,39,23,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);
    if(!mine){UI.text(body,'PlayerSignature',['','牌桌相逢，开心就好。','慢慢想牌，稳稳出牌。','不急不躁，享受每一局。'][seat],40,212,570,78,24);return;}
    UI.text(body,'SignatureTitle','个性签名（最多40字）',40,193,570,34,20,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);
    const input=UI.panel(body,'SignatureInput',41,234,566,64,'#f3f1e4','#b7c5b1',12).addComponent(EditBox);input.textLabel=UI.text(input.node,'InputText','',10,2,545,59,21,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);input.placeholderLabel=UI.text(input.node,'InputPlaceholder','写一句你的个性签名',10,2,545,59,21,UI.PALETTE.muted,Label.HorizontalAlign.LEFT);input.maxLength=40;input.string=account.signature;UI.accessibleInput(input,'个性签名');
    UI.button(body,'SaveSignature','保存签名',41,320,180,46,()=>void this.run(async()=>{await this.wallet.saveSignature(input.string);this.toast('签名已保存');}));
    UI.button(body,'WatchAd','观看演示广告 · +30000',246,320,361,46,()=>void this.ad(),{fill:'#e6d18c'});
    UI.button(body,'ProfileHistory','金币记录',41,393,263,43,()=>this.history());UI.button(body,'ProfileRefresh','刷新余额',327,393,280,43,()=>void this.run(async()=>{await this.wallet.refresh();this.profile(0);}));
  }
  private async daily() {await this.run(async()=>{const result=await this.wallet.claimDaily();this.toast(result.alreadyClaimed?'今天已领取，明天再来。':'已领取 30000 金币');if(!result.alreadyClaimed)void this.audio.play('coin');});}
  private benefits() {const {body}=this.openModal('金币补给',625,440);UI.text(body,'WalletBalance','当前金币 '+this.wallet.account!.balance,31,72,563,49,31);UI.text(body,'DailyText','每日一次救济金，增加 30000 金币\n领取资格按北京时间零点刷新',40,132,545,77,21);UI.button(body,'ClaimDaily','领取今日救济金 · +30000',43,231,539,54,()=>void this.daily(),{fill:'#e8d08a'});UI.button(body,'BenefitAd','观看演示广告 · +30000',43,302,539,54,()=>void this.ad());UI.text(body,'RewardNote','金币用于游戏练习，不可充值、提现或兑换',33,379,559,29,17);}
  private more(){const {body}=this.openModal('更多',490,325);UI.button(body,'GlobalRules','规则',47,86,395,49,()=>this.rules());UI.button(body,'Feedback','反馈',47,159,395,49,()=>this.listModal('反馈',['目前为人机练习版本，反馈请联系项目维护者。','正式反馈提交服务尚未接入。']));}
  private settings() {
    const {body}=this.openModal('设置',650,507),p=this.audio.preferences;
    const channels=[['背景音乐','musicVolume'],['牌桌音效','effectsVolume'],['牌局语音','voiceVolume']];
    channels.forEach(([name,key],i)=>{const y=87+i*73;UI.text(body,'Channel-'+key,name,35,y,181,36,22,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);UI.text(body,'Volume-'+key,Math.round((p as any)[key]*100)+'%',279,y,102,36,23);UI.button(body,'VolumeDown-'+key,'−',230,y,41,35,()=>{this.audio.setPreferences({[key]:Math.max(0,(this.audio.preferences as any)[key]-.05)});this.settings();});UI.button(body,'VolumeUp-'+key,'+',390,y,41,35,()=>{this.audio.setPreferences({[key]:Math.min(1,(this.audio.preferences as any)[key]+.05)});this.settings();});UI.button(body,'Preview-'+key,'试听',469,y,128,35,()=>{void this.audio.unlock();void this.audio.play(key==='voiceVolume'?'hu':key==='musicVolume'?'music':'outtile');});});
    UI.button(body,'Mute',p.muteAll?'恢复声音':'一键静音',38,316,171,41,()=>{this.audio.setPreferences({muteAll:!p.muteAll});this.settings();});UI.button(body,'Effects',this.effects?'特效：开启':'特效：关闭',228,316,171,41,()=>{this.effects=!this.effects;this.saveSettings();this.settings();});UI.button(body,'Fast',this.botSpeed===120?'电脑：快速':'电脑：正常',418,316,187,41,()=>{this.botSpeed=this.botSpeed===120?650:120;this.saveSettings();this.settings();});
    UI.text(body,'TimeTitle','操作时限',40,389,138,34,21);[5,15,30].forEach((sec,i)=>UI.button(body,'Seconds-'+sec,sec+'秒'+(this.seconds===sec?' ✓':''),199+i*129,387,111,38,()=>{this.seconds=sec;this.saveSettings();this.settings();}));UI.text(body,'PauseNote','打开功能窗口会暂停牌局行动',47,451,550,29,17);
  }
  private saveSettings(){sys.localStorage.setItem('LIANZHUO_CREATOR_SETTINGS',JSON.stringify({seconds:this.seconds,fast:this.botSpeed===120,effects:this.effects}));}
  private async ad() {
    if(this.adTimer||this.adBusy)return;this.adBusy=true;
    const {body}=this.openModal('演示广告',665,443),overlay=this.modal!;let closed=false;let credited=false;
    UI.text(body,'AdHeadline','每天练一局，轻松学麻将',33,91,599,71,34);UI.text(body,'AdTiles','中    發    白',72,160,521,99,52,UI.PALETTE.jade);
    const status=UI.text(body,'AdStatus','正在准备演示广告…',43,266,579,49,23);UI.text(body,'AdDisclosure','演示内容，未接入商业广告平台\n完整观看15秒可得30000金币；切换页面暂停，提前关闭无奖励',29,320,607,67,18);
    const oldClose=this.modalClose;this.modalClose=()=>{closed=true;if(this.adTimer){clearInterval(this.adTimer);this.adTimer=null;}this.adBusy=false;if(!credited)void this.wallet.cancelAd().catch(()=>{});oldClose();};
    const tick=async()=>{if(closed||this.adBusy||credited)return;this.adBusy=true;try{const value=await this.wallet.progressAd(true);if(closed)return;status.string=(typeof document!=='undefined'&&document.hasFocus()&&!document.hidden?'已观看 ':'已暂停 ')+value.watchedSeconds+' / '+value.duration+' 秒';UI.announce('演示广告 '+status.string);if(value.watchedSeconds>=value.duration){const result=await this.wallet.completeAd();if(closed)return;credited=true;if(this.adTimer){clearInterval(this.adTimer);this.adTimer=null;}status.string='已获得 30000 金币，余额已更新。';if(!result.alreadyClaimed)void this.audio.play('coin');UI.button(body,'AdDone','完成',221,398,223,36,()=>this.closeModal());}}catch(error){if(!closed)status.string=(error as Error).message;}finally{this.adBusy=false;}};
    try{await this.wallet.startAd();this.adBusy=false;if(closed){await this.wallet.cancelAd();return;}await tick();if(!closed&&!credited)this.adTimer=setInterval(()=>void tick(),1000);}catch(error){this.adBusy=false;if(!closed)status.string=(error as Error).message;}
  }
  private modalClose:()=>void=()=>{};
  private openModal(title:string,width=750,height=500) {
    this.closeModal();const overlay=UI.overlay(this.node,'Modal-'+title);overlay.addComponent(BlockInputEvents);this.modal=overlay;
    const body=UI.panel(overlay,'ModalPanel',(UI.W-width)/2,(UI.H-height)/2,width,height,UI.PALETTE.paper,UI.PALETTE.gold,25);UI.text(body,'ModalTitle',title,26,14,width-104,44,28,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);
    UI.button(body,'CloseModal','关闭窗口',width-77,18,54,34,()=>this.closeModal(),{fontSize:14,border:'',fill:'#eee9d9'});
    this.modalClose=()=>{if(isValid(overlay)){UI.clearChildren(overlay);overlay.removeFromParent();overlay.destroy();}if(this.modal===overlay)this.modal=null;this.deadline=Date.now()+this.seconds*1000;this.nextBot=Date.now()+this.botSpeed;this.drawTable();};UI.updateAccessibility(overlay);return {overlay,body};
  }
  private closeModal(){if(this.modal)this.modalClose();}
  private listModal(title:string,rows:string[]) {
    const {body}=this.openModal(title,865,534),viewport=UI.box(body,'ScrollViewport',30,79,805,421);viewport.addComponent(Mask).type=Mask.Type.GRAPHICS_RECT;
    const heights=rows.map(row=>Math.max(52,Math.ceil(row.length/40)*28+22)),total=Math.max(421,heights.reduce((a,b)=>a+b,0));
    const content=UI.box(viewport,'ScrollContent',0,0,805,total);let y=0;rows.forEach((row,i)=>{UI.text(content,'Row-'+i,row,9,y,782,heights[i],19,UI.PALETTE.ink,Label.HorizontalAlign.LEFT);y+=heights[i];});
    const scroll=viewport.addComponent(ScrollView);scroll.content=content;scroll.horizontal=false;scroll.vertical=true;scroll.inertia=true;
  }
  private toast(message:string) {
    if(this.toastNode){this.toastNode.removeFromParent();this.toastNode.destroy();}const toast=UI.panel(this.node,'Toast',302,543,676,51,'#174a3d','#c3a862',16);this.toastNode=toast;UI.text(toast,'ToastText',message,11,3,654,45,21,'#fff1c5');UI.announce(message);this.scheduleOnce(()=>{if(isValid(toast)){toast.removeFromParent();toast.destroy();}if(this.toastNode===toast)this.toastNode=null;},3);
  }
  private async run(work:()=>Promise<any>) {if(this.pending)return;this.pending=true;try{await this.audio.unlock();await work();}catch(error){this.toast((error as Error).message);}finally{this.pending=false;this.deadline=Date.now()+this.seconds*1000;this.drawTable();}}
  onDestroy(){this.unsubscribe();if(this.adTimer)clearInterval(this.adTimer);void this.wallet.cancelAd().catch(()=>{});void this.session?.dispose().catch(()=>{});this.audio?.dispose();game.off(Game.EVENT_HIDE,this.hide);game.off(Game.EVENT_SHOW,this.show);UI.disposeUI();}
}
