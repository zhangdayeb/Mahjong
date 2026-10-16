const UUID='[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}';
const SORT_KEY=new RegExp('^(?:2:[0-9]{20}|[134]:'+UUID+')$');
export const HISTORY_EPOCH='1970-01-01T00:00:00.000Z';

export function parsePage({limit=30,cursor}={}){
 if(typeof limit==='string'){if(!/^[0-9]{1,2}$/.test(limit))throw Error('分页数量无效');limit=Number(limit);}
 if(!Number.isInteger(limit)||limit<1||limit>50)throw Error('每页数量须为 1 至 50');
 if(cursor===undefined||cursor===null||cursor==='')return{limit,after:null};
 if(typeof cursor!=='string'||cursor.length>200||!/^[A-Za-z0-9_-]+$/.test(cursor))throw Error('分页游标无效');
 let after;try{const decoded=Buffer.from(cursor,'base64url');if(decoded.toString('base64url')!==cursor)throw Error();after=JSON.parse(decoded.toString('utf8'));}catch{throw Error('分页游标无效');}
 if(!after||typeof after.createdAt!=='string'||typeof after.sortKey!=='string'||Object.keys(after).length!==2||!SORT_KEY.test(after.sortKey))throw Error('分页游标无效');
 const date=new Date(after.createdAt);
 if(!Number.isFinite(date.getTime())||date.toISOString()!==after.createdAt)throw Error('分页日期无效');
 return{limit,after};
}
export function sortRows(rows){return rows.sort((a,b)=>b.sortTime.localeCompare(a.sortTime)||b.sortKey.localeCompare(a.sortKey));}
export function pageRows(rows,page){
 const sorted=sortRows(rows).filter(row=>!page.after||row.sortTime<page.after.createdAt||row.sortTime===page.after.createdAt&&row.sortKey<page.after.sortKey);
 return finishPage(sorted.slice(0,page.limit+1),page.limit);
}
export function finishPage(rows,limit){
 const hasMore=rows.length>limit,selected=rows.slice(0,limit),last=selected.at(-1);
 const nextCursor=hasMore&&last?Buffer.from(JSON.stringify({createdAt:last.sortTime,sortKey:last.sortKey})).toString('base64url'):null;
 return{records:selected.map(({sortTime,sortKey,...record})=>record),nextCursor};
}
export function fileHistoryRows(data,accountId,currency){
 const ledger=data.ledger.map((row,index)=>({...row,id:row.id??index+1})).filter(row=>row.accountId===accountId&&row.currency===currency).map(row=>({
  id:'ledger:'+row.id,kind:row.type,currency,before:row.before,after:row.balance,amount:row.amount,
  roundId:row.roundId??null,mode:data.games[row.roundId]?.accountId===accountId?data.games[row.roundId].mode:null,
  room:data.games[row.roundId]?.accountId===accountId?data.games[row.roundId].room:null,
  createdAt:row.createdAt??null,sortTime:row.createdAt??HISTORY_EPOCH,sortKey:'2:'+String(row.id).padStart(20,'0'),
 }));
 // Monetary grants are represented by their authoritative ledger entries.
 const operations=data.operations.filter(row=>row.accountId===accountId&&row.currency===currency&&!['daily_grant','ad_grant'].includes(row.kind)).map(row=>({
  id:'operation:'+row.id,kind:row.kind,currency,before:row.before,after:row.after,amount:row.after-row.before,
  roundId:null,mode:null,room:null,createdAt:row.createdAt,sortTime:row.createdAt,sortKey:'1:'+row.id.toLowerCase(),
 }));
 return[...ledger,...operations];
}
