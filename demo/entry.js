import {preloadEntryResources} from './entry-loading.js';
const $=selector=>document.querySelector(selector),panel=$('.loading-panel');
const preview=new URLSearchParams(location.search).has('preview');
let attempt=0,leaving=null;
function progress(value){const percent=Math.max(0,Math.min(100,value));$('#progress-text').textContent=Math.round(percent)+'%';$('#progress-fill').style.width=percent+'%';$('#progress').setAttribute('aria-valuenow',String(Math.round(percent)));}
async function start(){
 const current=++attempt,started=performance.now();clearTimeout(leaving);panel.dataset.state='loading';$('#retry').hidden=true;$('#loading-state').textContent='正在准备牌桌';$('#loading-detail').textContent='加载大厅资源…';progress(0);
 try{
  const result=await preloadEntryResources(undefined,{onProgress:value=>{if(current!==attempt)return;progress(value.percent);$('#loading-detail').textContent=`大厅资源 ${value.loaded} / ${value.total}`;}});
  if(current!==attempt)return;
  if(!result.ready){panel.dataset.state='error';$('#loading-state').textContent='资源暂时未加载完成';$('#loading-detail').textContent='请检查网络后重新加载';$('#retry').hidden=false;return;}
  progress(100);panel.dataset.state='ready';$('#loading-state').textContent='准备完毕，即将入座';$('#loading-detail').textContent='欢迎来到联桌麻将';
  leaving=setTimeout(()=>{if(current===attempt)location.replace('hall.html');},Math.max(600,1800-(performance.now()-started)));
 }catch{if(current===attempt){panel.dataset.state='error';$('#loading-state').textContent='暂时无法加载';$('#loading-detail').textContent='请检查网络后重新加载';$('#retry').hidden=false;}}
}
$('#retry').onclick=()=>void start();
addEventListener('pagehide',()=>{attempt++;clearTimeout(leaving);});
if(preview){progress(72);$('#loading-detail').textContent='入口设计预览';}
else void start();
