import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {randomUUID} from 'node:crypto';
import {readFile,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createFileStore} from './file-store.js';
import {createWalletService} from './wallet-service.js';
import {createWalletApi} from './http-api.js';
async function setup(file){const store=await createFileStore(file),service=createWalletService(store),id=await service.createSession('a'.repeat(64)),other=await service.createSession('b'.repeat(64));return{store,service,id,other};}
test('each account edits only its own signature; changing or clearing it leaves the active game and coins intact',async()=>{
 const {service,id,other}=await setup(),round=(await service.start(id,{mode:'classic',room:'beginner',rulesVersion:2})).round;
 assert.equal((await service.me(id)).signature,'');const edited=await service.updateSignature(id,{signature:'  牌桌相逢，\n开心就好。  ',accountId:other,balance:999999});assert.equal(edited.signature,'牌桌相逢， 开心就好。');assert.equal(edited.balance,30000);assert.equal((await service.me(id)).activeRound,round.id);assert.equal((await service.me(other)).signature,'');
 await service.updateSignature(other,{signature:'一起享受每一局'});assert.equal((await service.me(id)).signature,edited.signature);
 await service.claimDaily(id,{requestId:randomUUID()});assert.equal((await service.leave(id)).signature,edited.signature);assert.equal((await service.me(id)).balance,60000);assert.equal((await service.updateSignature(id,{signature:''})).signature,'');assert.equal((await service.me(other)).signature,'一起享受每一局');
});
test('forty Unicode characters including emoji are accepted; invalid edits never overwrite the saved signature',async()=>{
 const {service,id}=await setup(),text='🀄'.repeat(40);assert.equal((await service.updateSignature(id,{signature:text})).signature,text);
 for(const signature of ['字'.repeat(41),'🀄'.repeat(41),null,{},['字'],'含\0控制符'])await assert.rejects(service.updateSignature(id,{signature}),e=>e.status===400);
 assert.equal((await service.me(id)).signature,text);assert.equal((await service.me(id)).balance,30000);
 assert.equal((await service.updateSignature(id,{signature:'e\u0301'})).signature,'é');
});
test('signature is persisted across store restart as literal text alongside unchanged balances and ledger',async()=>{
 const file=fileURLToPath(new URL('../.local/signature-test-'+randomUUID()+'.json',import.meta.url)),{service,id}=await setup(file),text='<img src=x onerror=alert(1)>';
 try{await service.claimDaily(id,{requestId:randomUUID()});await service.updateSignature(id,{signature:text});const reopened=createWalletService(await createFileStore(file));assert.equal((await reopened.me(id)).signature,text);assert.equal((await reopened.me(id)).balance,60000);const saved=JSON.parse(await readFile(file,'utf8'));assert.equal(saved.accounts[id].signature,text);assert.equal(saved.ledger.length,1);assert.equal(saved.ledger[0].type,'daily_grant');}finally{await unlink(file);}
});
test('HTTP uses the authenticated guest account, rejects another origin and exposes the saved signature on reload',async()=>{
 const {service}=await setup(),server=http.createServer(createWalletApi(service,{origin:'http://signature.test'}));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{const base='http://127.0.0.1:'+server.address().port+'/demo-api',first=await fetch(base+'/me'),cookie=first.headers.get('set-cookie').split(';')[0],guest=await first.json(),second=await fetch(base+'/me'),otherCookie=second.headers.get('set-cookie').split(';')[0],other=await second.json();
 const call=(origin,body)=>fetch(base+'/profile/signature',{method:'POST',headers:{Cookie:cookie,Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await call('https://another.test',{signature:'不得写入'})).status,403);
 const updated=await call('http://signature.test',{signature:'联桌相逢 🀄',accountId:other.id});assert.equal(updated.status,200);assert.equal((await updated.json()).id,guest.id);
 const raw=Buffer.from(JSON.stringify({signature:'联桌相逢 🀄'})),cut=raw.indexOf(Buffer.from('桌'))+1;
 const fragmented=await new Promise((resolve,reject)=>{const request=http.request(base+'/profile/signature',{method:'POST',headers:{Cookie:cookie,Origin:'http://signature.test','Content-Type':'application/json'}},response=>{const parts=[];response.on('data',p=>parts.push(p));response.on('end',()=>resolve({status:response.statusCode,data:JSON.parse(Buffer.concat(parts))}));});request.on('error',reject);request.write(raw.subarray(0,cut));setTimeout(()=>request.end(raw.subarray(cut)),10);});assert.equal(fragmented.status,200);assert.equal(fragmented.data.signature,'联桌相逢 🀄','Split UTF-8 bytes must never corrupt a signature');
 assert.equal((await(await fetch(base+'/me',{headers:{Cookie:cookie}})).json()).signature,'联桌相逢 🀄');assert.equal((await(await fetch(base+'/me',{headers:{Cookie:otherCookie}})).json()).signature,'');
 }finally{await new Promise(resolve=>server.close(resolve));}
});
