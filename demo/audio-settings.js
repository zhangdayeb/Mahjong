import {readAudioPreferences,updateGameAudioPreferences,previewGameAudio,stopAudioPreview} from './game-audio.js';

const channels=[
 {key:'music',volume:'musicVolume',kind:'music',title:'背景音乐',copy:'轻音乐，陪你自在入座'},
 {key:'sound',volume:'effectsVolume',kind:'effects',title:'牌桌音效',copy:'点击、摸牌与落牌声音'},
 {key:'voice',volume:'voiceVolume',kind:'voice',title:'牌局语音',copy:'报牌及碰、杠、胡的播报'}
];
function node(tag,className,text){const value=document.createElement(tag);if(className)value.className=className;if(text!==undefined)value.textContent=text;return value;}
function button(text,className,action){const value=node('button',className,text);value.type='button';value.onclick=action;return value;}
function installStyle(){
 if(document.querySelector('link[data-audio-settings-style]'))return;
 const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('./audio-settings.css',import.meta.url).href;style.dataset.audioSettingsStyle='';document.head.append(style);
}

/** Shared hall/table controls. Returns dispose() to stop a preview and remove listeners. */
export function createAudioSettings(container,{onStatus=()=>{},onChange=()=>{}}={}){
 installStyle();const root=node('section','lz-audio-settings');root.setAttribute('aria-label','声音设置');container.append(root);
 const rows=new Map();let disposed=false,previewSequence=0;
 const status=node('p','lz-audio-status','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 function announce(text){if(disposed)return;status.textContent=text;onStatus(text);}
 function sync(){
  const preferences=readAudioPreferences();
  for(const channel of channels){
   const row=rows.get(channel.key),enabled=preferences[channel.key];
   row.toggle.setAttribute('aria-checked',String(enabled));row.toggle.querySelector('span').textContent=enabled?'开启':'关闭';
   row.slider.value=String(Math.round(preferences[channel.volume]*100));row.output.textContent=row.slider.value+'%';
   row.slider.setAttribute('aria-valuetext',row.slider.value+'%');row.wrapper.classList.toggle('is-muted',preferences.muteAll||!enabled);
  }
  mute.setAttribute('aria-pressed',String(preferences.muteAll));mute.textContent=preferences.muteAll?'已全部静音':'一键静音';
  restore.disabled=!preferences.muteAll;root.classList.toggle('is-all-muted',preferences.muteAll);
  return preferences;
 }
 function change(value,message){
  try{updateGameAudioPreferences(value);sync();onChange(readAudioPreferences());if(message)announce(message);}
  catch{announce('当前浏览器无法保存声音设置。');}
 }
 function stop(message='试听已停止。'){
  previewSequence++;stopAudioPreview();if(message)announce(message);
 }
 async function preview(kind){
  const preferences=readAudioPreferences(),channel=channels.find(item=>item.kind===kind);
  if(preferences.muteAll){announce('当前已全部静音，请先恢复声音。');return;}
  if(channel&&(!preferences[channel.key]||preferences[channel.volume]===0)){announce(`请先开启${channel.title}并调高音量。`);return;}
  if(kind==='all'&&!channels.some(item=>preferences[item.key]&&preferences[item.volume]>0)){announce('请先开启至少一种声音并调高音量。');return;}
  const sequence=++previewSequence;stopAudioPreview();announce(kind==='all'?'正在试听音乐、牌声与语音…':`正在试听${channel.title}…`);
  try{await previewGameAudio(kind);if(!disposed&&sequence===previewSequence)announce('试听结束，可继续调整音量。');}
  catch{if(!disposed&&sequence===previewSequence)announce('试听暂时无法播放，请重新试一下。');}
 }
 for(const channel of channels){
  const wrapper=node('div','lz-audio-row');wrapper.dataset.audioChannel=channel.kind;
  const heading=node('div','lz-audio-row-heading'),copy=node('div','lz-audio-copy');copy.append(node('strong','',channel.title),node('small','',channel.copy));
  const toggle=button('','lz-audio-switch',()=>{stop(null);const preferences=readAudioPreferences(),enabled=!preferences[channel.key];change({[channel.key]:enabled},`${channel.title}已${enabled?'开启':'关闭'}。`);});toggle.setAttribute('role','switch');toggle.setAttribute('aria-label',channel.title);toggle.append(node('span',''),node('i',''));
  const audition=button('试听','lz-audio-audition',()=>void preview(channel.kind));audition.setAttribute('aria-label','试听'+channel.title);heading.append(copy,toggle,audition);
  const volume=node('div','lz-audio-volume'),slider=node('input','lz-audio-slider'),output=node('output','lz-audio-output');slider.type='range';slider.min='0';slider.max='100';slider.step='1';slider.setAttribute('aria-label',channel.title+'音量');
  slider.oninput=()=>{change({[channel.volume]:Number(slider.value)/100});};slider.onchange=()=>announce(`${channel.title}音量 ${slider.value}%。`);
  volume.append(slider,output);wrapper.append(heading,volume);root.append(wrapper);rows.set(channel.key,{wrapper,toggle,slider,output});
 }
 const actions=node('div','lz-audio-actions');const mute=button('一键静音','lz-audio-soft',()=>{stop(null);change({muteAll:true},'所有声音已静音，音量设置已保留。');});mute.setAttribute('aria-pressed','false');
 const restore=button('恢复声音','lz-audio-soft',()=>change({muteAll:false},'已恢复原有的声音设置。'));
 const all=button('试听全部','lz-audio-primary',()=>void preview('all')),end=button('停止试听','lz-audio-soft',()=>stop());actions.append(mute,restore,all,end);root.append(actions,status);
 function onStorage(event){if(event.key==='MAHJONG_SETTINGS'){stop(null);sync();}}
 addEventListener('storage',onStorage);sync();
 const observer=new MutationObserver(()=>{if(!root.isConnected)dispose();else if(root.closest('[hidden]'))stop(null);});
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
 function dispose(){if(disposed)return;disposed=true;previewSequence++;stopAudioPreview();removeEventListener('storage',onStorage);observer.disconnect();}
 return{element:root,refresh:sync,dispose};
}
