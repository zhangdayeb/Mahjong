let activeView=null;

export function watchDemoAd({start,progress,complete,cancel,onReward=()=>{}}){
 if(activeView)return activeView;
 const dialog=document.createElement('dialog');dialog.className='demo-ad-dialog';dialog.setAttribute('aria-label','演示广告');
 dialog.innerHTML='<button class="wallet-close" type="button" aria-label="关闭演示广告">×</button><span class="demo-ad-tag">演示广告</span><h2>每天练一局，轻松学麻将</h2><div class="demo-ad-scene" aria-hidden="true"><span>中</span><span>發</span><span>白</span></div><p>完整观看后获得 <strong>30000 金币</strong></p><progress max="15" value="0" aria-label="广告观看进度"></progress><p class="demo-ad-status" role="status">正在准备演示广告…</p><small>这是用于测试奖励流程的演示内容，未接入商业广告平台。<br>切换页面会暂停计时，提前关闭不发放奖励。</small><button class="demo-ad-done" type="button" hidden>完成</button>';
 const lastFocus=document.activeElement;document.body.append(dialog);dialog.showModal();
 let session=null,timer=null,busy=false,closed=false,result=null,finishing=false;
 let resolve;const done=new Promise(value=>resolve=value);activeView=done;
 const status=dialog.querySelector('.demo-ad-status'),bar=dialog.querySelector('progress');
 async function close(){if(closed)return;closed=true;clearInterval(timer);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',visibility);window.removeEventListener('focus',visibility);if(session&&!result)try{await cancel({id:session.id});}catch{}dialog.close();dialog.remove();activeView=null;lastFocus?.focus?.({preventScroll:true});resolve(result);}
 dialog.querySelector('.wallet-close').onclick=close;dialog.querySelector('.demo-ad-done').onclick=close;dialog.addEventListener('cancel',event=>{event.preventDefault();void close();});
 async function tick(){
  if(!session||closed||busy||result||finishing)return;busy=true;
  try{
   const watching=!document.hidden&&document.hasFocus(),value=await progress({id:session.id,watching});if(closed)return;session=value.ad;bar.value=session.watchedSeconds;
   dialog.classList.toggle('demo-ad-paused',!watching);
   status.textContent=watching?`已观看 ${session.watchedSeconds} / ${session.duration} 秒`:'已暂停，返回此页面继续观看';
   if(session.watchedSeconds>=session.duration){finishing=true;status.textContent='观看完成，正在发放奖励…';clearInterval(timer);try{const credited=await complete({id:session.id});if(closed)return;result=credited;onReward(credited);status.textContent='已获得 30000 金币，余额和记录已更新。';dialog.querySelector('.demo-ad-done').hidden=false;dialog.querySelector('.demo-ad-done').focus();}catch(error){finishing=false;status.textContent=error.message+'，稍后自动重试';timer=setInterval(()=>void tick(),1000);}}
  }catch(error){if(!closed){status.textContent=error.message;if([404,410].includes(error.status)){clearInterval(timer);dialog.querySelector('.demo-ad-done').hidden=false;}else status.textContent+='，正在尝试恢复…';}}
  finally{busy=false;}
 }
 function visibility(){if(document.hidden||!document.hasFocus()){dialog.classList.add('demo-ad-paused');status.textContent='已暂停，返回此页面继续观看';}void tick();}
 document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',visibility);window.addEventListener('focus',visibility);
 void start().then(async value=>{session=value.ad;if(closed){try{await cancel({id:session.id});}catch{}return;}bar.max=session.duration;bar.value=session.watchedSeconds;await tick();if(!closed&&!result)timer=setInterval(()=>void tick(),1000);}).catch(error=>{if(!closed){status.textContent=error.message;dialog.querySelector('.demo-ad-done').hidden=false;}});
 return done;
}
