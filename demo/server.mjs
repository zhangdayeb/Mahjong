import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {createFileStore} from '../backend/file-store.js';
import {createWalletService} from '../backend/wallet-service.js';
import {createWalletApi} from '../backend/http-api.js';
const root=fileURLToPath(new URL('.',import.meta.url));
const walletStore=await createFileStore(fileURLToPath(new URL('../.local/practice-wallet.json',import.meta.url)));
const walletApi=createWalletApi(createWalletService(walletStore));
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.json':'application/json'};
http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(pathname.startsWith('/demo-api/')){await walletApi(req,res);return;}
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root)){res.writeHead(403).end();return;}
    const info=await stat(file);if(!info.isFile()){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-cache');
    const match=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let start=0,end=info.size-1;
    if(match){start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;if(start>end){res.writeHead(416).end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${info.size}`,'Content-Length':end-start+1,'Accept-Ranges':'bytes'});}else res.writeHead(200,{'Content-Length':info.size,'Accept-Ranges':'bytes'});
    createReadStream(file,{start,end}).pipe(res);
  }catch{res.writeHead(404).end('Not found');}
}).listen(8770,'127.0.0.1',()=>console.log('Mahjong demo: http://127.0.0.1:8770'));
