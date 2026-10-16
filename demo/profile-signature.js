import {MAX_SIGNATURE_LENGTH,normalizeSignature} from './profile-signature-model.js';
export function createSignatureEditor({getSignature=()=>'',onSave,onClose=()=>{}}={}){
 if(!document.querySelector('link[data-profile-signature]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('profile-signature.css',import.meta.url).href;css.dataset.profileSignature='';document.head.append(css);}
 const dialog=document.createElement('dialog');dialog.className='signature-editor';dialog.setAttribute('aria-labelledby','signature-editor-title');
 dialog.innerHTML='<form><button type="button" class="signature-close" aria-label="关闭签名编辑">×</button><h2 id="signature-editor-title">个性签名</h2><label for="signature-input">写一句话介绍自己</label><textarea id="signature-input" rows="3" placeholder="例如：牌桌相逢，开心就好。"></textarea><div class="signature-caption"><span>可随时修改，留空即可清除</span><output aria-live="polite"></output></div><p class="signature-status" role="status"></p><div class="signature-actions"><button type="button" class="signature-cancel">取消</button><button type="submit" class="signature-save">保存签名</button></div></form>';
 document.body.append(dialog);const form=dialog.querySelector('form'),input=dialog.querySelector('textarea'),count=dialog.querySelector('output'),status=dialog.querySelector('.signature-status'),save=dialog.querySelector('.signature-save');let busy=false,returnFocus;
 input.maxLength=MAX_SIGNATURE_LENGTH*2;
 function measure(){const n=Array.from(input.value.normalize('NFC').replace(/\s+/gu,' ').trim()).length;count.textContent=`${n}/${MAX_SIGNATURE_LENGTH}`;count.classList.toggle('over-limit',n>MAX_SIGNATURE_LENGTH);save.disabled=busy||n>MAX_SIGNATURE_LENGTH;}
 input.oninput=()=>{status.textContent='';measure();};
 function close(){if(!busy)dialog.close();}
 dialog.querySelector('.signature-close').onclick=dialog.querySelector('.signature-cancel').onclick=close;
 dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
 dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});onClose();});
 form.onsubmit=async event=>{
  event.preventDefault();if(busy)return;
  let signature;try{signature=normalizeSignature(input.value);}catch(error){status.textContent=error.message;measure();return;}
  busy=true;input.disabled=true;save.textContent='保存中…';status.textContent='';measure();
  try{await onSave(signature);busy=false;dialog.close();}
  catch(error){status.textContent=error.message||'签名未保存，请重试';}
  finally{busy=false;input.disabled=false;save.textContent='保存签名';measure();}
 };
 return{show(){if(!dialog.open){returnFocus=document.activeElement;input.value=getSignature()||'';status.textContent='';measure();dialog.showModal();input.focus();}},get open(){return dialog.open;},close};
}
