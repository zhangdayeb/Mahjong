import {drawNativeNode,nativeColor} from './native-ui-canvas.js';
import {updateGameAudioPreferences,playGameSound} from './game-audio.js';

const BASE=new URL('.',import.meta.url),SETTING_DEFAULTS={music:true,sound:true,local:true,effects:false};
const aliases={设置:'settings',邮件:'mail',背包:'bag',活动:'activity',头像:'profile',资料:'profile',头像资料:'profile',个人资料:'profile',个人中心:'profile',更多:'more',反馈:'feedback',麻卡巴卡:'maka',麻卡包卡:'maka',麻将月卡:'maka'};
const names={settings:'设置',mail:'邮件',bag:'背包',activity:'活动',profile:'个人中心',more:'更多',feedback:'意见反馈',maka:'麻卡巴卡'};
const settingHandlers={onClickedMusic:['music','音乐'],onClickedSound:['sound','音效'],onClickedLocal:['local','方言'],onClickSwitchVFX:['effects','特效']};
export function hallPanelKind(value){const kind=aliases[value]||value;return Object.hasOwn(names,kind)?kind:null;}
export function findHallNode(node,key){if(node.id===key||node.name===key)return node;for(const child of node.children||[]){const result=findHallNode(child,key);if(result)return result;}}
function walk(node,visit){visit(node);for(const child of node.children||[])walk(child,visit);}
function prefixIds(node,prefix){walk(node,n=>n.id=prefix+':'+n.id);}
function setText(node,key,value){const target=findHallNode(node,key);if(target?.label)target.label._string=String(value??'');return target;}
function nodeOf(tree,binding){return findHallNode(tree,binding?.node);}
function richLabels(tree){walk(tree,node=>{const rich=node.components?.find(c=>c.class==='cc.RichText');if(rich&&!node.label){const text=(rich._N$string||'').replace(/<[^>]+>/g,'');node.label={_string:text,_fontSize:rich._N$fontSize||21,_lineHeight:rich._N$lineHeight||30,_N$horizontalAlign:1,_N$verticalAlign:1};node.children=node.children.filter(child=>child.name!=='RICHTEXT_CHILD');node.richUnderline=/<u>/.test(rich._N$string||'');const color=rich._N$string?.match(/<color=#([0-9a-f]{6})>/i)?.[1];if(color)node.color=0xff000000|(parseInt(color.slice(4,6),16)<<16)|(parseInt(color.slice(2,4),16)<<8)|parseInt(color.slice(0,2),16);}});}
function rootSize(tree,worldWidth){tree.trs[0]=tree.trs[1]=0;tree.size=[worldWidth,720];for(const child of tree.children||[])if(/^(mask|Mask|Bg)$/.test(child.name)&&child.size[1]>=720)child.size[0]=worldWidth;}
function groupWelfare(data,state){
 const binding=data.panels.maka.bindings.c8dc0KEMqZOW5XlT5dE6cRb;
 return data.makaWelfare.map((info,index)=>{
  const group=structuredClone(data.templates.welfareGroup.tree);prefixIds(group,`welfare-group-${index}`);group.trs[0]=0;group.trs[1]=-5-145-index*300;
  const title=findHallNode(group,'title_icon1');title.sprite.frame=binding.TitleIconArr[info.TitleIcon-1];
  const items=info.ListInfoArr.filter(item=>!/(转盘|抽奖)/.test(item.TitleStr+item.SubStr));
  const list=findHallNode(group,'WelfareList'),count=items.length,gap=count>=5?0:count>=4?45:85;list.size[0]=count*180+(count-1)*gap;
  list.children=items.map((item,i)=>{const node=structuredClone(data.templates.welfare.tree);prefixIds(node,`welfare-${index}-${i}`);node.trs[0]=-list.size[0]/2+90+i*(180+gap);node.trs[1]=0;findHallNode(node,'WelfareIcon').sprite.frame=binding.WelfareIconArr[item.IconNum-1];setText(node,'TitleLabel',item.TitleStr);setText(node,'SubLabel',item.SubStr.replace(/\*/g,'—').replace(/\{[01]\}/g,'—'));return node;});
  return group;
 });
}

// Pure source-layout transformation, also used by the standalone visual fixture.
export function prepareHallPanel(data,kind,state={},worldWidth=1280){
 kind=hallPanelKind(kind);if(!kind)throw Error('Unknown hall panel');const source=data.panels[kind],tree=structuredClone(source.tree);rootSize(tree,worldWidth);richLabels(tree);
 if(kind==='settings'){
  const binding=source.bindings.d1c84ZRWQlBtpmDy8Q04wRs,preferences={...SETTING_DEFAULTS,...state.preferences};
  nodeOf(tree,binding.nodeDelCount).active=false;
  for(const name of['silence','vibrate','highPower','sanGuoTable'])findHallNode(tree,name).active=false;
  for(const col of['LayoutLeft','LayoutRight']){const layout=findHallNode(tree,col);layout.trs[1]=100;layout.children.filter(n=>n.active).forEach((node,index)=>node.trs[1]=-25-index*86);}
  findHallNode(tree,'LayoutBottomBtn').trs[1]=-132;
  for(const [handler,[key]]of Object.entries(settingHandlers))walk(tree,node=>{if(node.components?.some(c=>c.events?.some(e=>e.handler===handler)))node.sprite.frame=preferences[key]?binding.spfCheckOn:binding.spfCheckOff;});
  nodeOf(tree,binding.lab_version).label._string=state.version||'v.6.01.907';
 }
 if(kind==='mail'){
  const binding=source.bindings['1c897RoEU5ArpzkLmCX8cUi'],tab=state.mailTab||'system';
  nodeOf(tree,binding.nodeMailContainer).children=[];nodeOf(tree,binding.nodeNoMail).active=true;nodeOf(tree,binding.imgSystemLight).active=tab==='system';nodeOf(tree,binding.imgGiftLight).active=tab==='reward';
  for(const key of['btnGetReward','btnGetRead','imgRedPointLeft','imgRedPointRight'])nodeOf(tree,binding[key]).active=false;
  // Keep native authored retention copy only when its account-independent limits are provided.
  nodeOf(tree,binding.labKeepDayTips).label._string=state.mailLimits?`仅保留最近${state.mailLimits.days}天的邮件，最多${state.mailLimits.count}封`:'';
 }
 if(kind==='bag'){
  const binding=source.bindings.b6b33UfAaFBqKKa7W1jHqzJ,tabs=state.bagTabs||[0,1,2],tab=tabs.includes(state.bagTab)?state.bagTab:tabs[0],left=nodeOf(tree,binding.wgt_left);
  left.trs[0]=-worldWidth/2+45+left.size[0]/2+(worldWidth>=1380?(worldWidth-1380)/2:0);
  for(const[index,ref]of binding.toggles.entries()){const node=nodeOf(tree,ref);node.active=tabs.includes(index);findHallNode(node,'CheckMark').active=index===tab;findHallNode(node,'Background').active=index!==tab;findHallNode(node,'red').active=false;}
  nodeOf(tree,binding.toggleRoot).children.filter(n=>n.active).forEach((n,index)=>n.trs[1]=-45-index*84);
  for(const[index,ref]of binding.views.entries())nodeOf(tree,ref).active=index===tab;
  for(const bindings of Object.values(source.bindings))if(bindings.content&&bindings.itemPrefab){const content=nodeOf(tree,bindings.content);if(content)content.children=[];}
  for(const name of ['Preview','yulan'])walk(tree,n=>{if(n.name===name)n.active=false;});
 const used=findHallNode(tree,'isUsedEmojNode');used.children=[];
  const balances={beans:state.profile?.beans??'57万',coins:state.profile?.coins??'300万',diamond:state.profile?.diamond??'0'};
  for(const[name,key]of[['CoinRoot','beans'],['ZCoinRoot','coins'],['DiamondRoot','diamond']]){const parent=findHallNode(tree,name);if(state.profile?.singleCurrency&&key!=='coins'){parent.active=false;continue;}const coin=structuredClone(data.templates[key].tree);prefixIds(coin,`bag-currency-${key}`);coin.trs[0]=coin.trs[1]=0;walk(coin,node=>{if(node.label)node.label._string=String(balances[key]);if(node.name==='btn_add')node.active=false;});parent.children=[coin];}
 }
 if(kind==='activity'){
  const tab=state.activityTab||'activity';for(const[name,value]of[['toggleActivity','activity'],['toggleSystem','system']])findHallNode(findHallNode(tree,name),'checkmark').active=tab===value;
  findHallNode(tree,'ScrollViewActivity').active=tab==='activity';findHallNode(tree,'ScrollViewSystem').active=tab==='system';
  // The source fills notices remotely. Clear prefab authoring examples instead of inventing an event.
  walk(tree,node=>{if(node.name==='content'&&['cc.Layout'].some(type=>node.components?.some(c=>c.class===type)))node.children=[];});
  const activity=findHallNode(tree,'ComActivity');activity.active=tab==='activity';activity.sprite=null;activity.components=[];
  const system=findHallNode(tree,'ComSystem');system.active=tab==='system';setText(system,'title','');findHallNode(system,'New Label').active=false;findHallNode(system,'New RichText').active=false;
 }
 if(kind==='profile'){
  const binding=source.bindings['1b9adOkyKtAQrQVkWp+B0+x'],profile=state.profile||{};
  if(profile.rewardAds){findHallNode(tree,'main_pannel').size[1]=500;const bg=findHallNode(tree,'bg');bg.size[1]=500;findHallNode(bg,'close_btn').trs[1]+=73.5;}
  if(profile.singleCurrency)findHallNode(tree,'icon_coin').sprite.frame=findHallNode(data.templates.coins.tree,'zcoin').sprite.frame;
  for(const[key,value]of [['lab_name',profile.name??'4201529133'],['lab_id',profile.id??'4201529133'],['lab_coin',(profile.singleCurrency?profile.coins:profile.beans)??'57万'],['lab_gameCount',profile.games??0],['lab_winRate',profile.winRate??'0%']])nodeOf(tree,binding[key]).label._string=String(value);
  if(profile.rewardAds&&/^[a-f0-9-]{36}$/i.test(profile.id||''))nodeOf(tree,binding.lab_id).label._string=profile.id.slice(0,8);
  const gender=profile.gender??state.gender??0;for(const[name,index]of[['toggle_man',0],['toggle_woman',1]])findHallNode(findHallNode(tree,name),'checkmark').active=gender===index;
  const rank=nodeOf(tree,binding.img_MJPath),progress=nodeOf(tree,binding.MJMPath_progress);rank.active=!!profile.rankLevel;progress.active=!!profile.rankProgress;
  if(rank.active)rank.sprite={frame:data.rankFrames[Math.min(6,Math.max(0,(profile.rankIndex||1)-1))],_sizeMode:0};
  if(progress.active){const[value,max]=profile.rankProgress;setText(progress,'lab',`${value}/${max}`);findHallNode(progress,'bar').size[0]=200*Math.min(1,Math.max(0,value/(max||1)));}
  nodeOf(tree,binding.lab_rank).active=!!profile.rankLevel;nodeOf(tree,binding.lab_rank).label._string=String(profile.rankLevel||'');
  if(profile.avatar)nodeOf(tree,binding.head_node).sprite={frame:'local-profile-avatar',_sizeMode:0};
  // This SectionMatch badge belongs to online account data. Hide when that data is absent.
  nodeOf(tree,binding.SectionInfoPlaceholder).children=[];
 }
 if(kind==='feedback'){
  const binding=source.bindings['6e77f2SDjZJa76aWE8miuem'],stars=source.bindings.c06e2NSB09L04MgBOKoPKwc,level=state.starLevel||0;
  nodeOf(tree,binding.btnSubscribe).active=false;nodeOf(tree,binding.wecahtIcon).active=false;nodeOf(tree,binding.phoneIcon).active=true;nodeOf(tree,binding.n_serviceBtn).active=false;
  nodeOf(tree,stars.starsBox).children.forEach((node,index)=>node.opacity=index<level?255:0);
  const descriptions=['非常不满意，各方面都很差','不满意，很差','一般，不太满意','满意，仍有优化空间','非常满意，继续加油','非常完美，太棒了'];if(level)nodeOf(tree,stars.lab_starDesc).label._string=descriptions[level];
  nodeOf(tree,binding.n_tooLongTip).active=(state.advice||'').length>200;
  nodeOf(tree,binding.n_tooLongTip).label._string=`反馈内容超过200字，无法提交(${(state.advice||'').length}/200)`;
  nodeOf(tree,binding.edit_advise).children=[];nodeOf(tree,binding.edit_wechatNum).children=[];
  const tags=data.feedbackDefaults.tag,selected=state.tags||[],groups=tags.starTags[level]||[0],list=groups.flatMap(id=>tags.tagGroup.find(group=>group.id===id)?.tags||[]),bgRoot=nodeOf(tree,stars.n_tagBgRoot),labRoot=nodeOf(tree,stars.n_tagLabRoot);
  bgRoot.children=[];labRoot.children=[];
  list.forEach((name,index)=>{const bg=structuredClone(nodeOf(tree,stars.tplt_tagBg)),label=structuredClone(nodeOf(tree,stars.tplt_tagLab));prefixIds(bg,`tag-bg-${index}`);prefixIds(label,`tag-${index}`);for(const node of[bg,label]){node.active=true;node.trs[0]=-140+index%3*136;node.trs[1]=-19-Math.floor(index/3)*60;}bg.sprite.frame=selected.includes(name)?stars.spf_tagSelect:stars.spf_tagNormal;findHallNode(label,'lab').label._string=name;label.feedbackTag=name;bgRoot.children.push(bg);labRoot.children.push(label);});
 }
 if(kind==='maka'){
  const binding=source.bindings.c8dc0KEMqZOW5XlT5dE6cRb,normal=source.bindings['9b8b4AUtKdNjoXL4QX+quUz'],shop=state.makaPage==='shop';
  nodeOf(tree,binding.MkbkNormalNode).active=!shop;nodeOf(tree,binding.ShopListNode).active=shop;findHallNode(tree,'CloseBtn').active=!shop;
  nodeOf(tree,normal.NoGetNode).active=true;nodeOf(tree,normal.AlreadyGetNode).active=false;findHallNode(tree,'RegressionAct').active=false;
  nodeOf(tree,binding.TimeBgIcon).active=false;nodeOf(tree,binding.ShopListContent).children=[];
  const content=nodeOf(tree,normal.ScrollContent);content.size[1]=data.makaWelfare.length*300;content.trs[1]=190+(state.scroll||0);content.children=groupWelfare(data,state);
 }
 if(kind==='more'){
  const more=findHallNode(tree,'btn_More'),menu=findHallNode(tree,'img_moreBg'),arrow=findHallNode(tree,'img_moreBg2');
  menu.active=true;arrow.active=true;menu.size[0]=252;const buttons=[findHallNode(tree,'btn_down'),findHallNode(tree,'btn_Rule'),findHallNode(tree,'btn_feedback')];buttons.forEach((node,index)=>{node.active=true;node.trs[0]=44+index*82;node.trs[1]=0;});menu.children=buttons;
  // Attach to the actual local lobby button, while preserving all native menu offsets.
  const anchor=state.moreAnchor||[worldWidth/2-387,674.0];more.trs[0]=anchor[0]-worldWidth/2;more.trs[1]=360-anchor[1];more.sprite=null;more.components=[];more.children=[menu,arrow];tree.children=[more];
 }
 return tree;
}

export function hallNodeRects(tree){
 const result=new Map();function visit(node,px=0,py=0,psx=1,psy=1,active=true){const x=px+node.trs[0]*psx,y=py+node.trs[1]*psy,sx=psx*node.trs[7],sy=psy*node.trs[8];active&&=node.active;result.set(node.id,{node,x,y,sx,sy,active,left:x-node.anchor[0]*node.size[0]*sx,top:-y-(1-node.anchor[1])*node.size[1]*sy,width:node.size[0]*sx,height:node.size[1]*sy});for(const child of node.children||[])visit(child,x,y,sx,sy,active);}visit(tree);return result;
}

export function createNativeHallPanels(parent,{onClose=()=>{},onRules=()=>{},onPolicy,onWatchAd,onEditSignature,onSettingsChange=()=>{},onProfileChange=()=>{},profile={},bagTabs,version='v.6.01.907',mailLimits}={}){
 if(!parent)throw Error('Hall panels require their stage parent');
 if(onEditSignature&&!document.querySelector('link[data-profile-signature]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('profile-signature.css',BASE).href;link.dataset.profileSignature='';document.head.append(link);}
 if(!document.querySelector('link[data-native-hall-panels]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('native-hall-panels.css',BASE).href;css.dataset.nativeHallPanels='';document.head.append(css);}
 const layer=document.createElement('section');layer.className='native-hall-panels';layer.hidden=true;layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');
 const canvas=document.createElement('canvas'),hits=document.createElement('div'),notice=document.createElement('div');canvas.className='native-hall-panel-canvas';hits.className='native-hall-panel-hits';notice.className='native-hall-panel-notice';notice.setAttribute('role','status');notice.hidden=true;layer.append(canvas,hits,notice);parent.append(layer);
 let preferences={...SETTING_DEFAULTS};try{preferences={...preferences,...JSON.parse(localStorage.getItem('MAHJONG_SETTINGS')||'{}')};}catch{}
 let data,frames,images,fonts,current,open=false,disposed=false,width=1104,height=554,lastFocus,noticeTimer,music,controls=[],lastScene,lastRects;
 let state={preferences,profile,bagTabs,version,mailLimits,mailTab:'system',bagTab:0,activityTab:'activity',starLevel:0,tags:[],advice:'',contact:'',makaPage:'normal',scroll:0};
 const ready=Promise.all(['panels.json','frames.json'].map(file=>fetch(new URL('hall-panel-study/'+file,BASE)).then(response=>{if(!response.ok)throw Error('Original hall panel assets unavailable');return response.json();}))).then(async([metadata,frameData])=>{
  data=metadata;frames=new Map(frameData.map(frame=>[frame.uuid,frame]));images=new Map(await Promise.all(frameData.map(async frame=>{const image=new Image();image.src=new URL(frame.image,BASE).href;await image.decode();return[frame.uuid,image];})));fonts=new Map(await Promise.all(data.fonts.map(async font=>{const image=new Image();image.src=new URL(font.image,BASE).href;await image.decode();return[font.uuid,{...font,image}];})));
  if(profile.avatar){const image=new Image();image.src=new URL(profile.avatar,BASE).href;await image.decode();frames.set('local-profile-avatar',{rect:[0,0,image.naturalWidth,image.naturalHeight],originalSize:[image.naturalWidth,image.naturalHeight],offset:[0,0]});images.set('local-profile-avatar',image);}
  if(!disposed)resize();return data;
 });
 function nativeLabel(node){let text=node.label?._string;walk(node,child=>{text??=child.label?._string;});return text||names[current];}
 function place(element,rect){const scale=height/720;element.style.left=width/2+rect.left*scale+'px';element.style.top=height/2+rect.top*scale+'px';element.style.width=rect.width*scale+'px';element.style.height=rect.height*scale+'px';}
 function button(rect,label,callback,{role,selected}={}){const button=document.createElement('button');button.className='native-hall-panel-button';button.type='button';button.setAttribute('aria-label',label);if(role)button.setAttribute('role',role);if(role==='tab')button.setAttribute('aria-selected',String(selected));if(['switch','checkbox','radio'].includes(role))button.setAttribute('aria-checked',String(selected));button.onclick=event=>{event.stopPropagation();callback();};place(button,rect);hits.append(button);controls.push(button);return button;}
 function textInput(rect,kind){const input=document.createElement(kind==='advice'?'textarea':'input');input.className='native-hall-panel-input';input.setAttribute('aria-label',kind==='advice'?'反馈建议':'联系方式（选填）');input.placeholder=kind==='advice'?'请输入您宝贵的建议（必填）':'请输入联系方式(选填)';input.maxLength=kind==='advice'?250:80;input.value=state[kind];const scale=height/720;input.style.fontSize=25*scale+'px';input.style.lineHeight=30*scale+'px';input.style.padding=kind==='advice'?`${5*scale}px ${10*scale}px`:'0';place(input,rect);input.oninput=()=>{state[kind]=input.value;if(kind==='advice')draw(false);};hits.append(input);controls.push(input);}
 function wrapLabels(tree,context){walk(tree,node=>{
  if(!node.label||node.label._isSystemFontUsed===false)return;const label=node.label,size=label._fontSize||40,overflow=label._N$overflow??0,text=label._string||'';context.font=`${label._styleFlags&1?'bold ':''}${size}px Arial`;
  if(overflow===0){node.size[0]=Math.max(...text.split('\n').map(line=>context.measureText(line).width),0);return;}
  if(overflow===2){const measured=Math.max(...text.split('\n').map(line=>context.measureText(line).width),0);if(measured>node.size[0]){const ratio=node.size[0]/measured;label._fontSize=size*ratio;label._lineHeight=(label._lineHeight||size)*ratio;}return;}
  if(label._enableWrapText===false||node.size[0]<=0)return;const lines=[];
  for(const paragraph of text.split('\n')){let line='';for(const char of paragraph){if(line&&context.measureText(line+char).width>node.size[0]){lines.push(line);line=char;}else line+=char;}lines.push(line);}
  label._string=lines.join('\n');if(overflow===3)node.size[1]=(lines.length+.26)*(label._lineHeight||size);
 });}
 function draw(rebuildControls=true){
  if(!data||!frames||!images||!fonts||!current||disposed)return;const context=canvas.getContext('2d'),scale=height/720;const scene=prepareHallPanel(data,current,state,width/scale);wrapLabels(scene,context);lastScene=scene;lastRects=hallNodeRects(scene);
  context.clearRect(0,0,width,height);context.save();context.translate(width/2,height/2);context.scale(scale,scale);drawNativeNode(context,scene,{frames,images,fonts});
  for(const {node,left,top,width:w,height:h,active}of lastRects.values())if(active&&node.richUnderline){context.strokeStyle=nativeColor(node.color);context.lineWidth=1;context.beginPath();context.moveTo(left,top+h/2+12);context.lineTo(left+w,top+h/2+12);context.stroke();}context.restore();
  if(!rebuildControls)return;hits.replaceChildren();controls=[];
  for(const rect of lastRects.values()){
   if(!rect.active)continue;const {node}=rect;
   if(node.feedbackTag){button(rect,node.feedbackTag,()=>{state.tags=state.tags.includes(node.feedbackTag)?state.tags.filter(tag=>tag!==node.feedbackTag):[...state.tags,node.feedbackTag];draw();},{role:'checkbox',selected:state.tags.includes(node.feedbackTag)});continue;}
   for(const component of node.components||[])if(component.class==='cc.Button'||component.class==='cc.Toggle'){
    const event=component.events?.[0];
    if(current==='bag'&&component.class==='cc.Toggle'){const binding=data.panels.bag.bindings.b6b33UfAaFBqKKa7W1jHqzJ,index=binding.toggles.findIndex(ref=>ref.node===node.id);button(rect,nativeLabel(node),()=>{state.bagTab=index;draw();},{role:'tab',selected:state.bagTab===index});continue;}
    if(current==='profile'&&component.class==='cc.Toggle'){const gender=node.name==='toggle_man'?0:1;button(rect,gender===0?'男性':'女性',()=>{state.profile={...state.profile,gender};onProfileChange({gender});draw();},{role:'radio',selected:(state.profile.gender??0)===gender});continue;}
    if(!event)continue;const {handler}=event,label=handler==='onClickClose'?'关闭'+names[current]:handler==='onClickDownMor'?'收起':handler==='onClickRuleHall'?'规则':handler==='onClickFeedback'?'反馈':current==='activity'&&handler==='onChangeToggle'?event.customEventData==='1'?'公告':'活动':handler==='onClickStar'?`${event.customEventData}星`:settingHandlers[handler]?.[1]||nativeLabel(node);
    const setting=settingHandlers[handler],tab=handler==='clickTagSystem'?'system':handler==='clickTagGift'?'reward':null;
    button(rect,label,()=>action(handler,event,node),setting?{role:'switch',selected:preferences[setting[0]]}:tab?{role:'tab',selected:state.mailTab===tab}:{});
   }
  }
  if(current==='feedback'){const binding=data.panels.feedback.bindings['6e77f2SDjZJa76aWE8miuem'];textInput(lastRects.get(binding.edit_advise.node),'advice');textInput(lastRects.get(binding.edit_wechatNum.node),'contact');}
  if(current==='profile'&&state.profile.rewardAds&&onWatchAd){
   const title=document.createElement('h2');title.className='profile-center-title';title.textContent='个人中心';place(title,{left:-220,top:-227,width:440,height:40});title.style.fontSize=30*scale+'px';hits.append(title);
   const card=document.createElement('div');card.className='profile-ad-reward';card.innerHTML='<div><strong>看广告得金币</strong><small>完整观看演示广告，每次 +30000 金币</small></div><button type="button">观看演示广告</button>';place(card,{left:-282,top:179,width:564,height:64});card.style.fontSize=21*scale+'px';card.style.padding=9*scale+'px '+14*scale+'px';const control=card.querySelector('button');control.setAttribute('aria-label','观看演示广告，获得30000 金币');control.onclick=()=>Promise.resolve(onWatchAd()).catch(error=>showNotice(error.message));controls.push(control);hits.append(card);
  }
  if(current==='profile'&&(state.profile.signatureEditable||Object.hasOwn(state.profile,'signature'))){
   const row=document.createElement('div');row.className='profile-signature-row';place(row,{left:20,top:14,width:264,height:65});row.style.fontSize=19*scale+'px';const copy=document.createElement('div');copy.className='profile-signature-copy';const caption=document.createElement('small');caption.textContent='个性签名';const value=document.createElement('p');value.textContent=state.profile.signature||'还没有个性签名';value.title=state.profile.signature||'';value.classList.toggle('profile-signature-empty',!state.profile.signature);copy.append(caption,value);row.append(copy);
   if(state.profile.signatureEditable&&onEditSignature){const edit=document.createElement('button');edit.type='button';edit.className='profile-signature-edit';edit.textContent='编辑';edit.setAttribute('aria-label','编辑个性签名');edit.onclick=()=>onEditSignature();controls.push(edit);row.append(edit);}hits.append(row);
  }
  if(current==='maka'&&state.makaPage==='normal'){
   const view=findHallNode(scene,'view'),rect=lastRects.get(view.id),area=document.createElement('div');area.className='native-hall-panel-scroll';area.setAttribute('aria-label','麻卡巴卡权益，拖动查看');place(area,rect);hits.append(area);bindScroll(area);
  }
 }
 function bindScroll(area){let pointer,y,start;area.onpointerdown=event=>{pointer=event.pointerId;y=event.clientY;start=state.scroll;area.setPointerCapture(pointer);};area.onpointermove=event=>{if(event.pointerId!==pointer)return;const scale=(parent.getBoundingClientRect().height||height)/720;state.scroll=Math.max(0,Math.min(data.makaWelfare.length*300-380,start+(y-event.clientY)/scale));draw(false);};area.onpointerup=area.onpointercancel=()=>pointer=null;area.onwheel=event=>{event.preventDefault();state.scroll=Math.max(0,Math.min(data.makaWelfare.length*300-380,state.scroll+event.deltaY/(height/720)));draw(false);};}
 function action(handler,event,node){
  if(handler==='onClickClose'||handler==='onClickDownMor'){close();return;}
  if(handler==='onClickRuleHall'){close();onRules();return;}
  if(handler==='onClickFeedback'){show('feedback');return;}
  if(settingHandlers[handler]){const key=settingHandlers[handler][0];preferences[key]=!preferences[key];state.preferences=preferences;localStorage.setItem('MAHJONG_SETTINGS',JSON.stringify(preferences));onSettingsChange({...preferences},key);updateGameAudioPreferences({music:preferences.music,sound:preferences.sound});if(key==='sound'&&preferences.sound)void playGameSound('select',.7);draw();return;}
  if(handler==='clickTagSystem'||handler==='clickTagGift'){state.mailTab=handler==='clickTagSystem'?'system':'reward';draw();return;}
  if(handler==='onClickQuickDel'){showNotice('暂无可删除的邮件');return;}
  if(handler==='onClickQuickGet'){showNotice('暂无可领取的附件');return;}
  if(handler==='onClickQuickRead'){showNotice('已读取全部邮件!');return;}
  if(current==='activity'&&handler==='onChangeToggle'){state.activityTab=event.customEventData==='1'?'system':'activity';draw();return;}
  if(handler==='onClickStar'){const level=Number(event.customEventData);if((state.starLevel<4)!==(level<4))state.tags=[];state.starLevel=level;draw();return;}
  if(handler==='onClickPost'){const advice=state.advice.trim();if(!state.starLevel){showNotice('请选择星数为游戏打分');return;}if(!advice){showNotice('请输入具体的反馈内容');return;}if(advice.length>200){showNotice('反馈内容超过200字，无法提交');return;}localStorage.setItem('MAHJONG_FEEDBACK_DRAFT',JSON.stringify({starLevel:state.starLevel,tags:state.tags,advice,contact:state.contact.trim()}));showNotice('已保存到本地，未发送给游戏客服');return;}
  if(handler==='onClickGet'){showNotice('金币可通过每日救济金或观看演示广告获得。');return;}
  if(handler==='onClickShopListNode'){state.makaPage='normal';draw();return;}
  if(/UserContract|PrivacyPolicy|Child?Protect/.test(handler)){const title=handler.includes('UserContract')?'用户服务协议':handler.includes('Privacy')?'隐私保护政策':'儿童保护政策';if(onPolicy)onPolicy(title);else showNotice(`${title}全文尚未移植`);return;}
  if(handler==='initMjMPath'){showNotice('本地段位资料');return;}
 }
 function showNotice(message){notice.textContent=message;notice.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.hidden=true,2400);}
 function resize(){width=parent.offsetWidth||1104;height=parent.offsetHeight||554;canvas.width=width;canvas.height=height;if(open)draw();}
 function show(value,details={}){const kind=hallPanelKind(value);if(!kind)return false;if(disposed)throw Error('Hall panels have been disposed');if(!open)lastFocus=document.activeElement;current=kind;state={...state,...details};if(kind==='maka'){state.makaPage='normal';state.scroll=0;}open=true;layer.hidden=false;layer.dataset.panelKind=kind;layer.classList.toggle('native-hall-panel-more',kind==='more');layer.setAttribute('aria-modal',String(kind!=='more'));layer.setAttribute('aria-label',names[kind]);notice.hidden=true;return ready.then(()=>{if(open){resize();(controls.find(button=>button.getAttribute('aria-label')?.startsWith('关闭'))||controls[0])?.focus({preventScroll:true});}return api;});}
 function close(){if(!open)return;const previous=current;open=false;layer.hidden=true;notice.hidden=true;clearTimeout(noticeTimer);lastFocus?.focus?.({preventScroll:true});onClose(previous);}
 layer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}if(event.key==='Tab'&&controls.length){const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}});
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>{if(open)resize();}):null;observer?.observe(parent);addEventListener('resize',resize);
 const api={ready,show,close,toggleMore(details={}){return open&&current==='more'?close():show('more',details);},get open(){return open;},get kind(){return current;},get metadata(){return data;},get scene(){return lastScene;},get preferences(){return{...preferences};},element:layer,canvas,setProfile(value){profile={...profile,...value};state.profile={...state.profile,...value};draw();},dispose(){close();disposed=true;observer?.disconnect();removeEventListener('resize',resize);music?.pause();layer.remove();}};return api;
}
