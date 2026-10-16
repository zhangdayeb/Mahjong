// Local settlement data presented with the original CoinGameResultPage sprites.
import {fanDetail} from './table-panels.js';
const asset=name=>new URL(`./settlement-study/assets/${name}`,import.meta.url).href;
const art={win:'game-461-yingdi.png',lose:'game-1232-shudi.png',cardWin:'game-270-yingxiao.png',cardLose:'game-255-shuxiao.png',again:'common-169-btn_com09.png',back:'common-480-btn_com01.png',more:'game-974-xiala.png',rank:'common-114-r_1.png',rankTag:'common-796-s_1.png',gift:'lobby-2403-pic_24.png',winner:'game-172-dayingjia.png',peek:'game-390-zhiwen.png',progressWin:'lobby-925-pic_25-1.png',progressLose:'lobby-1309-pic_25-2.png',progressFill:'lobby-1247-pic_26.png'};
const selectors=['.profile-mine','.profile-right','.profile-top','.profile-left'];
const positions=['本家','下家','对家','上家'];
export function formatSettlementScore(n){const value=Math.abs(n);return `${n>=0?'+':'-'}${value>=100000000?Number((value/100000000).toFixed(1))+'亿':value>=100000?Number((value/10000).toFixed(1))+'万':String(value)}`;}
const signed=formatSettlementScore;
// CoinGameResultPage147: native Canvas 1280x720; detail_scrollView/view68,
// onClickChangeView grows its parent by100 while preserving the lower edge.
export const settlementLayout=Object.freeze({width:1280,height:720,fanLeft:399.612,fanBottom:460.491,fanWidth:800,fanHeight:68,fanExpandedHeight:168,rowHeight:30,rowSpacing:2,arrowX:1109.612,arrowY:416.783});
export function settlementScrollOffset(start,screenDelta,scale,max){return Math.max(0,Math.min(max,start-screenDelta/Math.max(.001,scale)));}
export function settlementFanRows(info,seat=0){
 const data=info?.round??info??{},rows=[];
 for(const event of data.huEvents??[]){const delta=event.deltas?.[seat];if(!Number.isFinite(delta)||!delta)continue;const win=delta>0;
  const other=win?[0,1,2,3].filter(p=>p!==seat&&event.deltas[p]<0):[event.seat];
  const label=`[${other.map(p=>positions[p]).join('、')}]${event.fan?.name??'胡牌'}`;
  rows.push({label,prefix:`[${other.map(p=>positions[p]).join('、')}]`,name:(event.fan?.name??'胡牌')+fanDetail(event.fan),value:Number.isFinite(event.fan?.multiple)?`${win?'':'-'}${Math.abs(event.fan.multiple)}倍`:`${signed(delta)}分`,win,delta});
 }
 for(const event of data.kongPayments??[]){const win=event.to===seat;if(!win&&event.from!==seat)continue;if(!Number.isFinite(event.amount))continue;
  const multiple=Number.isFinite(data.base)&&data.base>0?event.amount/data.base:null;
  rows.push({label:`[${positions[win?event.from:event.to]}]杠牌`,prefix:`[${positions[win?event.from:event.to]}]`,name:'杠牌',value:multiple!==null?`${win?'':'-'}${Math.abs(multiple)}倍`:`${signed(win?event.amount:-event.amount)}分`,win,delta:win?event.amount:-event.amount});
 }
 for(const event of data.settlementEvents??[]){const win=event.to===seat;if(!win&&event.from!==seat)continue;rows.push({label:event.label||event.kind,prefix:`[${positions[win?event.from:event.to]}]`,name:event.label||event.kind,value:signed(win?event.amount:-event.amount)+'金币',win,delta:win?event.amount:-event.amount});}
 if(data.config?.rulesVersion===2)for(const row of rows)row.value=signed(row.delta)+'金币';
 return rows;
}
export function settlementHandSnapshot(info,seat=0){
 const data=info?.round??info??{};let selected=null;
 for(const event of data.huEvents??[]){if(event.seat!==seat||!Array.isArray(event.hand))continue;const multiple=Number.isFinite(event.fan?.multiple)?event.fan.multiple:1;
  if(!selected||multiple>=selected.multiple)selected={event,multiple};
 }
 const hand=selected?.event.hand??data.hands?.[seat]??[],melds=selected?.event.melds??data.melds?.[seat]??[];
 return {hand:[...hand],melds:melds.map(meld=>({...meld})),hu:!!selected,multiple:selected?.multiple??null};
}
const make=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
const image=(src,className,alt='')=>{const e=make('img',className);e.src=src;e.alt=alt;return e;};

export function createSettlementView({players=['你','下家','对家','上家'],onAgain=()=>{},onExit=()=>{},onClose=()=>{},tileRenderer}={}){
 const cssUrl=new URL('./settlement-view.css',import.meta.url).href;
 if(![...document.querySelectorAll('link[rel="stylesheet"]')].some(e=>e.href===cssUrl)){const css=make('link');css.rel='stylesheet';css.href=cssUrl;document.head.append(css);}
 const dialog=make('dialog','settlement-view');dialog.setAttribute('aria-label','本局结算');
 const stage=make('div','settlement-stage');const backdrop=image(asset(art.win),'settlement-main-bg');
 const opponents=make('div','settlement-opponents');const me=make('section','settlement-me');
 const rank=make('section','settlement-rank');
 const summary=make('div','settlement-summary');const hand=make('div','settlement-hand');const fans=make('section','settlement-fans');fans.setAttribute('aria-label','本局实际胡牌与杠牌明细');
 fans.id=`settlement-fans-${Math.random().toString(36).slice(2,9)}`;fans.tabIndex=0;
 const actions=make('div','settlement-actions');
 const again=make('button','settlement-again');again.type='button';again.append(make('span','','再来一局'));again.style.borderImageSource=`url("${asset(art.again)}")`;actions.append(again);
 const backButton=make('button','settlement-back');backButton.type='button';backButton.setAttribute('aria-label','返回场次');backButton.append(image(asset(art.back),'','返回'));
 const peek=make('button','settlement-peek');peek.type='button';peek.append(image(asset(art.peek),'','长按查看牌桌'));peek.setAttribute('aria-label','长按查看牌桌');
 const more=make('button','settlement-more');more.type='button';more.append(image(asset(art.more),'',''));more.setAttribute('aria-label','展开本局明细');more.setAttribute('aria-controls',fans.id);more.setAttribute('aria-expanded','false');
 stage.append(backdrop,opponents,rank,me,summary,hand,fans,more,actions,backButton,peek);dialog.append(stage);document.body.append(dialog);
 let lastData,uiIndex,stageScale=1,expanded=false,drag=null,scrollFrame=0,fontData;
 const uiReady=fetch(new URL('./assets/reference/ui-index.json',import.meta.url)).then(r=>r.ok?r.json():null).then(data=>{uiIndex=data;if(lastData)drawHand(lastData.details);}).catch(()=>{});
 const fontReady=fetch(new URL('./settlement-study/native-fonts.json',import.meta.url)).then(r=>r.ok?r.json():null).then(async data=>{if(!data)return;fontData=data;await Promise.all(Object.values(data).map(async f=>{const img=new Image();img.src=new URL(`./${f.frame.image}`,import.meta.url).href;await img.decode();f.bitmap=img;}));if(lastData)drawScore(lastData.scores[0]);}).catch(()=>{});
 function resize(){stageScale=Math.min(innerWidth/settlementLayout.width,innerHeight/settlementLayout.height);stage.style.setProperty('--settlement-scale',String(stageScale));}
 addEventListener('resize',resize);resize();
 function close(){if(dialog.open)dialog.close();}
 function stopScroll(){if(scrollFrame)cancelAnimationFrame(scrollFrame);scrollFrame=0;drag=null;}
 dialog.addEventListener('close',()=>{stopScroll();dialog.classList.remove('peeking');onClose();});
 again.onclick=()=>{close();onAgain();};backButton.onclick=()=>{close();onExit();};
 function setExpanded(value){expanded=!!value;stage.classList.toggle('settlement-expanded',expanded);more.setAttribute('aria-expanded',String(expanded));more.setAttribute('aria-label',expanded?'收起本局明细':'展开本局明细');stopScroll();fans.scrollTop=0;}
 more.onclick=()=>setExpanded(!expanded);
 fans.onpointerdown=event=>{if(event.button!==0)return;stopScroll();drag={id:event.pointerId,y:event.clientY,start:fans.scrollTop,lastY:event.clientY,lastTime:event.timeStamp,velocity:0};fans.setPointerCapture(event.pointerId);event.preventDefault();};
 fans.onpointermove=event=>{if(!drag||drag.id!==event.pointerId)return;const dt=event.timeStamp-drag.lastTime;if(dt>0)drag.velocity=(drag.lastY-event.clientY)/stageScale/dt;drag.lastY=event.clientY;drag.lastTime=event.timeStamp;fans.scrollTop=settlementScrollOffset(drag.start,event.clientY-drag.y,stageScale,fans.scrollHeight-fans.clientHeight);event.preventDefault();};
 fans.onpointerup=event=>{if(!drag||drag.id!==event.pointerId)return;let velocity=event.timeStamp-drag.lastTime<80?drag.velocity:0;drag=null;let last=performance.now();const glide=time=>{const dt=Math.min(32,time-last);last=time;const before=fans.scrollTop;fans.scrollTop+=velocity*dt;velocity*=Math.pow(.75,dt/16);if(Math.abs(velocity)>.025&&fans.scrollTop!==before)scrollFrame=requestAnimationFrame(glide);else scrollFrame=0;};if(Math.abs(velocity)>.025)scrollFrame=requestAnimationFrame(glide);};
 fans.onpointercancel=()=>stopScroll();
 peek.onpointerdown=event=>{peek.setPointerCapture(event.pointerId);dialog.classList.add('peeking');};
 const stopPeek=()=>dialog.classList.remove('peeking');peek.onpointerup=peek.onpointercancel=peek.onlostpointercapture=stopPeek;
 peek.onkeydown=event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();dialog.classList.add('peeking');}};peek.onkeyup=stopPeek;peek.onblur=stopPeek;
 function profileFor(profiles,p){const entry=profiles?.[p]??players[p],source=typeof entry==='string'?{name:entry}:entry||{};
  const name=source.name??source.nickName??source.sNickName??(typeof players[p]==='string'?players[p]:players[p]?.name)??positions[p];
  const portrait=document.querySelector(`${selectors[p]} .portrait`);
  const avatar=source.avatar??source.headUrl??source.sHeadUrl??portrait?.querySelector('img.player-avatar, img.avatar, img.profile-head')?.src;
  return {...source,name,avatar};
 }
 function portrait(profile,className){const node=make('div',className);if(profile.avatar){const img=image(profile.avatar,'settlement-avatar',profile.name);img.addEventListener('error',()=>{img.remove();node.append(make('span','',profile.name.slice(0,1)));},{once:true});node.append(img);}else node.append(make('span','',profile.name.slice(0,1)));return node;}
 function playerCard(profile,p,score,biggest){const card=make('section',`settlement-player ${score>=0?'winning':'losing'}`);card.style.backgroundImage=`url("${asset(score>=0?art.cardWin:art.cardLose)}")`;
  // Native ItemView omits '+' on the three other players. The main score
  // retains '+' exactly as CoinGameResultPageView.setMyResultInfo does.
  card.append(portrait(profile,'settlement-player-head'),make('b','settlement-player-name',profile.name),make('span','settlement-player-position',positions[p]),make('strong','settlement-player-score',signed(score).replace(/^\+/,'')));
  if(score>0&&score===biggest)card.append(image(asset(art.winner),'settlement-winner-tag','大赢家'));return card;
 }
 function tile(value){if(tileRenderer)return tileRenderer(value);const body=uiIndex?.['hand/img_normal_card'],face=uiIndex?.[`hand/img_tile_${Math.floor(value/10)}_${value%10}`];if(!body||!face)return null;
  const node=make('span','settlement-tile');node.append(image(new URL(`./assets/reference/${body.file}`,import.meta.url).href,'settlement-tile-body'),image(new URL(`./assets/reference/${face.file}`,import.meta.url).href,'settlement-tile-face'));return node;
 }
 function drawHand(info){hand.replaceChildren();if(!info||!uiIndex&&!tileRenderer)return;const snapshot=settlementHandSnapshot(info),values=snapshot.hand;
  const blocks=[];for(const meld of snapshot.melds){if(!Number.isFinite(meld.value))continue;blocks.push(Array(meld.type==='peng'?3:4).fill(meld.value));}if(values.length)blocks.push(values);
  for(const block of blocks){const group=make('span','settlement-tile-group');for(const value of block){const t=tile(value);if(t)group.append(t);}hand.append(group);}const width=blocks.flat().length*45+Math.max(0,blocks.length-1)*9;hand.style.setProperty('--hand-scale',String(Math.min(1,710/Math.max(1,width))));hand.setAttribute('aria-label',snapshot.hu?'本局最大番胡牌时的牌型':'本局结束时你的真实手牌和碰杠牌');
 }
 function drawScore(score){summary.replaceChildren();const f=fontData?.[score>=0?'win':'lose'];if(!f?.bitmap){summary.append(make('strong','settlement-my-score',signed(score)));return;}const chars=[...signed(score)],cfg=f.config,ratio=30/f.fontSize,width=chars.reduce((x,ch)=>x+(cfg.fontDefDictionary[ch.codePointAt(0)]?.xAdvance??0),0),canvas=make('canvas','settlement-score-bitmap');canvas.width=Math.ceil(width);canvas.height=cfg.commonHeight;canvas.style.width=`${width*ratio}px`;canvas.style.height=`${cfg.commonHeight*ratio}px`;canvas.setAttribute('aria-label',signed(score));const ctx=canvas.getContext('2d');let x=0;for(const ch of chars){const glyph=cfg.fontDefDictionary[ch.codePointAt(0)];if(!glyph)continue;const r=glyph.rect;if(r.width&&r.height)ctx.drawImage(f.bitmap,r.x,r.y,r.width,r.height,x+glyph.xOffset,glyph.yOffset,r.width,r.height);x+=glyph.xAdvance;}summary.append(canvas);}
 function drawDetails(info){fans.replaceChildren();const rows=settlementFanRows(info);
  for(const row of rows){const item=make('div',`settlement-fan-row ${row.win?'gain':'loss'}`),label=make('span','settlement-fan-label');label.append(make('span','settlement-fan-prefix',row.prefix),make('span','settlement-fan-name',row.name));item.append(label,make('span','settlement-fan-value',row.value));fans.append(item);}
  if(!rows.length)fans.append(make('p','settlement-no-fan','本局暂无已记录番型'));
  more.hidden=!rows.length;
 }
 function show({scores,profiles,room,details:info,practice=true}={}){
  if(!Array.isArray(scores)||scores.length!==4||scores.some(n=>!Number.isFinite(n)))throw new TypeError('结算需要四个有效的本局得失数值');
  lastData={scores:[...scores],profiles,room,details:info,practice};const data=info?.round??info??{},names=[0,1,2,3].map(p=>profileFor(profiles,p));
  stage.classList.toggle('settlement-loss',scores[0]<0);backdrop.src=asset(scores[0]>=0?art.win:art.lose);
  dialog.title=typeof room==='string'?room:[room?.variant?.name??room?.name,room?.room?.name,Number.isFinite(room?.room?.base??room?.base)?`底分 ${room?.room?.base??room?.base}`:''].filter(Boolean).join(' · ');
  opponents.replaceChildren(...[3,2,1].map(p=>playerCard(names[p],p,scores[p],Math.max(...scores))));
  me.replaceChildren(portrait(names[0],'settlement-my-head'),make('b','settlement-my-name',names[0].name));
  const initial=names[0].rank==='初阶雀尊'||names[0].rankName==='初阶雀尊'||!names[0].rankImage;
  rank.replaceChildren(image(initial?asset(art.rank):names[0].rankImage,'settlement-rank-image',names[0].rank??'段位'));
  const tag=make('div','settlement-rank-tag');if(initial)tag.append(image(asset(art.rankTag),'','初阶雀尊'));else tag.append(make('span','settlement-rank-name',names[0].rank??names[0].rankName??''));
  if(Number.isFinite(names[0].level))tag.append(make('b','settlement-rank-level',String(names[0].level)));rank.append(tag);
  const experience=Number.isFinite(names[0].experience)?Math.max(0,names[0].experience):0,required=Number.isFinite(names[0].experienceRequired)&&names[0].experienceRequired>0?names[0].experienceRequired:40;
  const progress=make('div','settlement-progress');progress.style.backgroundImage=`url("${asset(scores[0]>=0?art.progressWin:art.progressLose)}")`;progress.title=Number.isFinite(names[0].experience)?'本地演示段位进度':'本地演示进度，尚未接入线上经验';const bar=make('div','settlement-progress-fill');bar.style.width=`${Math.min(100,experience/required*100)}%`;bar.style.borderImageSource=`url("${asset(art.progressFill)}")`;progress.append(bar,make('span','settlement-progress-value',`${experience}/${required}`));rank.append(progress,image(asset(art.gift),'settlement-rank-gift','段位礼盒装饰'));
  drawScore(scores[0]);drawHand(info);drawDetails(info);setExpanded(false);
  resize();if(!dialog.open)dialog.showModal();
 }
 return {show,close,setExpanded,get expanded(){return expanded;},get open(){return dialog.open;},ready:Promise.all([uiReady,fontReady]),destroy(){close();stopScroll();removeEventListener('resize',resize);dialog.remove();}};
}
