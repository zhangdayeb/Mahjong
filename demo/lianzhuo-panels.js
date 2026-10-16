import {hallIcon} from './hall-interface-icons.js';
import {hallGames} from './hall-game-catalog.js';
import {liveRulebook} from './live-rulebook.js';
import {updateGameAudioPreferences} from './game-audio.js';
import {createAudioSettings} from './audio-settings.js';

const titles={more:'更多',rules:'玩法规则',feedback:'意见反馈',activity:'游戏活动',mail:'邮件',settings:'设置'};
const aliases={更多:'more',规则:'rules',反馈:'feedback',活动:'activity',邮件:'mail',设置:'settings'};
const DRAFT_KEY='MAHJONG_FEEDBACK_DRAFT';
const tags=['界面体验','玩法规则','声音效果','操作体验','功能建议','其他问题'];
const ratings=['请选择你的体验评分','体验不佳','有待改进','中规中矩','感觉不错','非常满意'];
function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return{};}}
function node(tag,className,text){const value=document.createElement(tag);if(className)value.className=className;if(text!==undefined)value.textContent=text;return value;}
function iconNode(name,className=''){const value=node('span',className);value.innerHTML=hallIcon(name);return value;}
function button(text,className,action){const value=node('button',className,text);value.type='button';value.onclick=action;return value;}
export function lianzhuoPanelKind(value){return aliases[value]||(Object.hasOwn(titles,value)?value:null);}

export function createLianzhuoPanels(parent,{onWallet=()=>{},onWatchAd=()=>{},onError=()=>{}}={}){
 const layer=node('section','lianzhuo-panel-layer');layer.hidden=true;parent.append(layer);
 let current=null,lastFocus,menuTrigger=null,ruleMode='classic',ruleTab='basic',mailTab='system',activityTab='benefits',inertStates=[];
 const saved=readJson(DRAFT_KEY);
 let draft={starLevel:Number.isInteger(saved.starLevel)&&saved.starLevel>=1&&saved.starLevel<=5?saved.starLevel:0,tags:Array.isArray(saved.tags)?saved.tags.filter(t=>tags.includes(t)):[],advice:typeof saved.advice==='string'?saved.advice.slice(0,200):'',contact:typeof saved.contact==='string'?saved.contact.slice(0,80):''};
 function setInert(){inertStates=[...parent.children].filter(child=>child!==layer).map(child=>[child,child.inert]);for(const[child]of inertStates)child.inert=true;}
 function releaseInert(){for(const[child,previous]of inertStates)child.inert=previous;inertStates=[];}
 function close({restoreFocus=true}={}){if(layer.hidden)return;layer.hidden=true;releaseInert();menuTrigger?.setAttribute('aria-expanded','false');menuTrigger=null;current=null;if(restoreFocus&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});}
 function status(text){layer.querySelector('.lz-status').textContent=text;}
 function tabs(items,selected,onSelect,label){
  const bar=node('div','lz-tabs');bar.setAttribute('role','tablist');bar.setAttribute('aria-label',label);
  const controls=items.map(([key,text])=>{const b=button(text,'lz-tab',()=>onSelect(key));b.setAttribute('role','tab');b.setAttribute('aria-selected',String(selected===key));b.tabIndex=selected===key?0:-1;bar.append(b);return b;});
  bar.onkeydown=event=>{const index=controls.indexOf(event.target);if(index<0)return;let next;if(event.key==='ArrowRight')next=(index+1)%controls.length;if(event.key==='ArrowLeft')next=(index+controls.length-1)%controls.length;if(event.key==='Home')next=0;if(event.key==='End')next=controls.length-1;if(next===undefined)return;event.preventDefault();onSelect(items[next][0]);layer.querySelector(`[role="tab"][aria-selected="true"]`)?.focus();};
  return bar;
 }
 function buildFrame(kind){
  layer.replaceChildren();layer.className='lianzhuo-panel-layer';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-labelledby','lz-panel-title');
  const panel=node('div',`lz-panel lz-${kind}`);panel.tabIndex=-1;
  const header=node('header','lz-panel-header');
  const heading=node('div','lz-heading');heading.append(node('span','lz-eyebrow','联桌麻将'),node('h2','',titles[kind]));heading.querySelector('h2').id='lz-panel-title';
  const ornament=iconNode('leaf','lz-header-leaf');
  const exit=button('','lz-close',()=>close());exit.innerHTML=hallIcon('close');exit.setAttribute('aria-label','关闭'+titles[kind]);header.append(heading,ornament,exit);
  const body=node('div','lz-panel-body');const footer=node('footer','lz-panel-footer');footer.append(node('span','lz-footer-brand','联桌相逢 · 乐在此间'),node('span','lz-status',''));footer.querySelector('.lz-status').setAttribute('role','status');
  panel.append(header,body,footer);layer.append(panel);return body;
 }
 function sectionHeading(title,copy){const head=node('div','lz-section-heading');head.append(node('h3','',title));if(copy)head.append(node('p','',copy));return head;}
 function emptyState(icon,title,copy){const empty=node('div','lz-empty');empty.append(iconNode(icon,'lz-empty-art'),node('h3','',title),node('p','',copy));return empty;}
 function showMore(trigger){
  layer.replaceChildren();layer.className='lianzhuo-panel-layer lz-more-layer';layer.setAttribute('role','dialog');layer.setAttribute('aria-label','更多');layer.removeAttribute('aria-labelledby');layer.setAttribute('aria-modal','false');
  const menu=node('div','lz-more-menu');menu.append(node('span','lz-menu-title','桌边小笺'));
  for(const[kind,label,copy]of[['rules','玩法规则','查看七种麻将玩法'],['feedback','意见反馈','记下你的体验与建议']]){
   const entry=button('','lz-menu-item',()=>show(kind));entry.append(iconNode(kind,'lz-menu-icon'));const text=node('span','');text.append(node('strong','',label),node('small','',copy));entry.append(text,iconNode('next'));menu.append(entry);
  }
  const collapse=button('','lz-menu-collapse',()=>close());collapse.append(iconNode('down'),node('span','','收起'));menu.append(collapse);layer.append(menu);
  const stageRect=parent.getBoundingClientRect(),rect=trigger?.getBoundingClientRect();const scale=stageRect.width/parent.offsetWidth;
  const center=rect?(rect.left+rect.width/2-stageRect.left)/scale:180;
  menu.style.left=Math.max(16,Math.min(parent.offsetWidth-268,center-126))+'px';menu.style.bottom=(rect?(stageRect.bottom-rect.top)/scale+12:73)+'px';
  menuTrigger=trigger;trigger?.setAttribute('aria-expanded','true');
 }
 function showRules(body){
  const aside=node('aside','lz-rules-sidebar');aside.append(node('span','lz-sidebar-label','选择玩法'));
  for(const[ index,game]of hallGames.entries()){
   const entry=button('','lz-rule-game',()=>{ruleMode=game.mode;renderRulesContent();for(const b of aside.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b===entry));});
   entry.append(node('span','lz-rule-index',String(index+1).padStart(2,'0')),node('span','',game.name));entry.setAttribute('aria-pressed',String(game.mode===ruleMode));aside.append(entry);
  }
  aside.append(node('p','lz-sidebar-note','七种玩法 · 人机练习\n规则与当前牌局一致'));
  const content=node('section','lz-rules-main');body.append(aside,content);renderRulesContent();
 }
 function renderRulesContent(){
  const content=layer.querySelector('.lz-rules-main');if(!content)return;const rules=liveRulebook(ruleMode),game=hallGames.find(g=>g.mode===ruleMode);content.replaceChildren();
  const head=node('div','lz-rule-heading');head.append(node('h3','',game.name),node('span','lz-chip',`${rules.profile.jokerCount} 张红中 · ${rules.profile.cap} 倍封顶`));
  if(!rules.profile.jokerCount)head.querySelector('.lz-chip').textContent=`108 张序数牌 · ${rules.profile.cap} 倍封顶`;
  const bar=tabs([['basic','基本规则'],['fans','番型说明'],['scoring','计分细则']],ruleTab,key=>{ruleTab=key;renderRulesContent();layer.querySelector('[role="tab"][aria-selected="true"]')?.focus();},'规则分类');
  const scroll=node('div','lz-rule-scroll');scroll.tabIndex=0;scroll.setAttribute('role','tabpanel');scroll.setAttribute('aria-label',({basic:'基本规则',fans:'番型说明',scoring:'计分细则'})[ruleTab]);
  const lines=ruleTab==='fans'?rules.FANRULE:ruleTab==='scoring'?rules.CUSTOMRULE:rules.BASERULE;
  for(const[index,line]of lines.entries()){
   const fan=ruleTab==='fans'&&line.match(/^(.+?)【(.+?)】\s*(.*)$/);
   if(fan){const card=node('article','lz-fan-card');const title=node('div','lz-fan-heading');title.append(node('h4','',fan[1]),node('span','',fan[2]));card.append(title,node('p','',fan[3]));scroll.append(card);}
   else{const row=node('div','lz-rule-paragraph');row.append(node('span','lz-paragraph-index',String(index+1).padStart(2,'0')),node('p','',line));scroll.append(row);}
  }
  content.append(head,bar,scroll);
 }
 function showFeedback(body){
  const aside=node('aside','lz-feedback-aside');aside.append(iconNode('feedback','lz-feature-icon'),sectionHeading('听见你的声音','每一条建议，都是下一桌更好的开始。'));
  const ratingLabel=node('span','lz-field-label','本次体验');ratingLabel.id='lz-rating-label';const stars=node('div','lz-stars');stars.setAttribute('role','radiogroup');stars.setAttribute('aria-labelledby',ratingLabel.id);
  const scoreText=node('p','lz-rating-copy',ratings[draft.starLevel]);
  const starButtons=[];
  function selectRating(level){draft.starLevel=level;starButtons.forEach((b,index)=>{b.setAttribute('aria-checked',String(index+1===level));b.classList.toggle('is-lit',index<level);b.textContent=index<level?'★':'☆';b.tabIndex=index+1===(level||1)?0:-1;});scoreText.textContent=ratings[level];}
  for(let i=1;i<=5;i++){const b=button('☆','lz-star',()=>selectRating(i));b.setAttribute('role','radio');b.setAttribute('aria-label',`${i} 星`);starButtons.push(b);stars.append(b);}
  stars.onkeydown=event=>{let level=draft.starLevel||1;if(['ArrowRight','ArrowUp'].includes(event.key))level=level%5+1;else if(['ArrowLeft','ArrowDown'].includes(event.key))level=(level+3)%5+1;else return;event.preventDefault();selectRating(level);starButtons[level-1].focus();};selectRating(draft.starLevel);
  const topicLabel=node('span','lz-field-label','反馈方向');const topicList=node('div','lz-feedback-tags');
  for(const tag of tags){const b=button(tag,'lz-topic',()=>{draft.tags=draft.tags.includes(tag)?draft.tags.filter(t=>t!==tag):[...draft.tags,tag];b.setAttribute('aria-pressed',String(draft.tags.includes(tag)));});b.setAttribute('aria-pressed',String(draft.tags.includes(tag)));topicList.append(b);}
  aside.append(ratingLabel,stars,scoreText,topicLabel,topicList);
  const form=node('form','lz-feedback-form');const label=node('label','lz-field-label','想对我们说');label.htmlFor='lz-advice';
  const advice=node('textarea','lz-advice');advice.id='lz-advice';advice.placeholder='遇到了什么问题？或是希望加入哪些改进？';advice.maxLength=200;advice.value=draft.advice;advice.setAttribute('aria-describedby','lz-feedback-limit');
  const counter=node('span','lz-counter',`${advice.value.length} / 200`);counter.id='lz-feedback-limit';advice.oninput=()=>{draft.advice=advice.value;counter.textContent=`${advice.value.length} / 200`;};
  const contactLabel=node('label','lz-field-label','联系方式（选填）');contactLabel.htmlFor='lz-contact';const contact=node('input','lz-contact');contact.id='lz-contact';contact.placeholder='便于你后续补充反馈';contact.maxLength=80;contact.value=draft.contact;contact.oninput=()=>draft.contact=contact.value;
  const bottom=node('div','lz-form-bottom');const note=node('p','lz-form-note','反馈保存在当前浏览器，暂不发送给客服。');const save=button('保存反馈','lz-primary',null);save.type='submit';bottom.append(note,save);
  form.append(label,advice,counter,contactLabel,contact,bottom);
  form.onsubmit=event=>{event.preventDefault();if(!draft.starLevel){status('请先选择体验评分。');starButtons[0].focus();return;}if(!draft.advice.trim()){status('请写下具体的反馈内容。');advice.focus();return;}try{draft={...draft,advice:draft.advice.trim(),contact:draft.contact.trim()};localStorage.setItem(DRAFT_KEY,JSON.stringify(draft));status('反馈已保存在本机。');}catch{status('当前浏览器无法保存，请保留你的反馈文字。');}};
  body.append(aside,form);
 }
 function showActivity(body){
  body.append(tabs([['benefits','日常福利'],['notices','活动公告']],activityTab,key=>{activityTab=key;render('activity');layer.querySelector('[aria-selected="true"]')?.focus();},'活动分类'));
  if(activityTab==='notices'){body.append(emptyState('leaf','暂无新的活动公告','日常福利一直在，闲来一桌，轻松相聚。'));return;}
  body.append(sectionHeading('每天添一点好心情','金币用于游戏练习，福利按实际领取结果到账。'));
  const cards=node('div','lz-benefit-cards');
  for(const[icon,title,copy,foot,label,action]of[
   ['coin','每日救济金','每天可领取一次，增加 30000 金币。','每日 0 点更新 · 北京时间','前往领取',onWallet],
   ['play','演示广告奖励','完整观看演示广告，增加 30000 金币。','演示广告 · 约 15 秒','观看演示广告',onWatchAd]
  ]){const card=node('article','lz-benefit-card');card.append(iconNode(icon,'lz-benefit-icon'),node('span','lz-chip','+ 30000 金币'),node('h3','',title),node('p','',copy),node('small','',foot),button(label,'lz-primary',()=>{close();Promise.resolve().then(action).catch(onError);}));cards.append(card);}
  body.append(cards);
 }
 function showMail(body){body.append(tabs([['system','系统邮件'],['reward','奖励邮件']],mailTab,key=>{mailTab=key;render('mail');layer.querySelector('[aria-selected="true"]')?.focus();},'邮件分类'),emptyState('mail',mailTab==='system'?'暂无系统邮件':'暂无奖励邮件','暂时没有需要查看的消息，安心享受这一桌。'));}
 function showSettings(body){
  const aside=node('aside','lz-settings-aside');aside.append(iconNode('leaf','lz-feature-icon'),sectionHeading('自在入座','音乐轻一点，\n牌声清楚一点。'),node('p','lz-settings-note','声音与动画偏好\n保存在当前浏览器。'));
  const controls=node('div','lz-settings-controls');createAudioSettings(controls);
  const row=node('div','lz-setting-row lz-setting-effects');row.append(iconNode('effects','lz-setting-icon'));const text=node('div','lz-setting-copy');text.append(node('strong','','动画特效'),node('small','','碰杠胡与番型展示动画'));row.append(text);
  const preferences=readJson('MAHJONG_SETTINGS'),toggle=button('','lz-switch',()=>{const enabled=toggle.getAttribute('aria-checked')!=='true';try{updateGameAudioPreferences({effects:enabled});toggle.setAttribute('aria-checked',String(enabled));toggle.querySelector('span').textContent=enabled?'开启':'关闭';status(`动画特效已${enabled?'开启':'关闭'}。`);}catch{status('当前浏览器无法保存设置。');}});
  toggle.setAttribute('role','switch');toggle.setAttribute('aria-label','动画特效');toggle.setAttribute('aria-checked',String(preferences.effects!==false));toggle.append(node('span','',preferences.effects!==false?'开启':'关闭'),node('i',''));row.append(toggle);controls.append(row);body.append(aside,controls);
 }
 function render(kind){const body=buildFrame(kind);({rules:showRules,feedback:showFeedback,activity:showActivity,mail:showMail,settings:showSettings})[kind](body);}
 function show(value,{trigger,mode}={}){
  const kind=lianzhuoPanelKind(value);if(!kind)return false;
  const wasOpen=!layer.hidden;if(!wasOpen)lastFocus=document.activeElement;releaseInert();menuTrigger?.setAttribute('aria-expanded','false');menuTrigger=null;
  if(mode){const game=hallGames.find(g=>g.mode===mode||String(g.ruleID)===String(mode));if(game)ruleMode=game.mode;}
  current=kind;layer.hidden=false;
  if(kind==='more')showMore(trigger);else{render(kind);setInert();}
  (layer.querySelector(kind==='more'?'.lz-menu-item':'.lz-close')||layer.querySelector('button'))?.focus({preventScroll:true});return true;
 }
 layer.onpointerdown=event=>{if(event.target===layer&&current!=='more')close();};
 function outside(event){if(current==='more'&&!layer.contains(event.target)&&!event.target.closest('[data-info="更多"]'))close({restoreFocus:false});}
 function keyboard(event){if(layer.hidden)return;if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();return;}if(event.key!=='Tab')return;const focusable=[...layer.querySelectorAll('button,input,textarea,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length);const index=focusable.indexOf(document.activeElement);if(event.shiftKey&&index<=0){event.preventDefault();focusable.at(-1)?.focus();}else if(!event.shiftKey&&index===focusable.length-1){event.preventDefault();focusable[0]?.focus();}}
 document.addEventListener('pointerdown',outside,true);layer.addEventListener('keydown',keyboard);
 return{show,close,get open(){return!layer.hidden;},get kind(){return current;},element:layer,dispose(){close();document.removeEventListener('pointerdown',outside,true);layer.remove();}};
}
