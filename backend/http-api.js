import {createHash,randomBytes} from 'node:crypto';
import {WalletError} from './wallet-service.js';
const tokenHash=token=>createHash('sha256').update(token).digest('hex');
export function createWalletApi(service,{origin='http://127.0.0.1:8770',secure=false}={}){
 return async function handle(req,res){
  const url=new URL(req.url,'http://localhost'),path=url.pathname.replace(/^\/demo-api/,'');
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(body));};
  try{
   if(req.method==='GET'&&path==='/health'){await service.health();send(200,{ok:true,storage:service.storageName||'persistent',payments:false});return;}
   const allowed=req.method==='GET'&&['/me','/balance/history','/rewards','/feedback','/mail'].includes(path)||req.method==='POST'&&['/profile/signature','/balance/reset','/balance/refresh','/round/start','/round/sync','/round/leave','/rewards/daily','/ads/start','/ads/progress','/ads/complete','/ads/cancel','/feedback','/mail/read'].includes(path);
   if(!allowed){send(404,{error:'接口不存在'});return;}
   if(req.method==='POST'&&req.headers.origin!==origin)throw new WalletError(403,'请求来源无效');
   let token=req.headers.cookie?.split(';').map(item=>item.trim()).find(item=>item.startsWith('mahjong_demo_session='))?.split('=')[1];
   let accountId=/^[a-f0-9]{64}$/.test(token||'')?await service.findSession(tokenHash(token)):null;
   if(!accountId){token=randomBytes(32).toString('hex');accountId=await service.createSession(tokenHash(token));res.setHeader('Set-Cookie',`mahjong_demo_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure?'; Secure':''}`);}
   if(req.method==='GET'){
    const page={limit:url.searchParams.get('limit')??30,cursor:url.searchParams.get('cursor')??undefined};
    const data=path==='/me'?await service.me(accountId):path==='/rewards'?await service.rewardStatus(accountId):path==='/feedback'?await service.feedbackHistory(accountId,page):path==='/mail'?await service.mail(accountId,{...page,category:url.searchParams.get('category')||'all'}):await service.history(accountId,url.searchParams.get('currency')||'coins',page);
    send(200,data);return;
   }
   if(!/^application\/json\b/.test(req.headers['content-type']||''))throw new WalletError(415,'请使用 JSON 请求');
   const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>512000)throw new WalletError(413,'请求过大');chunks.push(chunk);}const text=Buffer.concat(chunks).toString('utf8');
   let body;try{body=JSON.parse(text);}catch{throw new WalletError(400,'JSON 参数无效');}
   if(!body||typeof body!=='object'||Array.isArray(body))throw new WalletError(400,'请求参数无效');
   const methods={'/profile/signature':'updateSignature','/balance/reset':'reset','/balance/refresh':'refresh','/round/leave':'leave','/round/start':'start','/round/sync':'sync','/rewards/daily':'claimDaily','/ads/start':'startAd','/ads/progress':'progressAd','/ads/complete':'completeAd','/ads/cancel':'cancelAd','/feedback':'submitFeedback','/mail/read':'readMail'};
   const data=await service[methods[path]](accountId,body);
   send(200,data);
  }catch(error){if(!error.status)console.error('Wallet backend error:',error.code||error.name);send(error.status||503,{error:error.status?error.message:'余额服务暂时不可用，请稍后重试'});}
 };
}
