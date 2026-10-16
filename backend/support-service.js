import {randomUUID} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {parsePage} from './history-model.js';

const UUID=/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const clean=(value,max,required=false)=>{
 if(typeof value!=='string')throw Error('内容格式无效');
 const text=value.trim();if(required&&!text)throw Error('请输入具体的反馈内容');
 if(Array.from(text).length>max)throw Error('内容超过允许长度');
 if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text))throw Error('内容含无效字符');
 return text;
};
const publicFeedback=row=>row?{id:row.id,starLevel:row.starLevel,tags:row.tags,advice:row.advice,contact:row.contact,status:row.status,createdAt:row.createdAt}:null;

export function createSupportService(store,{fail,clock=Date.now}={}){
 const page=(input,prefix)=>{try{const value=parsePage(input);if(value.after&&!value.after.sortKey.startsWith(prefix+':'))throw Error('分页游标类型不匹配');return value;}catch(error){fail(400,error.message);}};
 return{
  submitFeedback:(accountId,input={})=>store.withAccount(accountId,async tx=>{
   const requestId=input.requestId;if(typeof requestId!=='string'||!UUID.test(requestId))fail(400,'反馈操作编号无效');
   if(!Number.isInteger(input.starLevel)||input.starLevel<1||input.starLevel>5)fail(400,'请选择 1 至 5 星体验评分');
   let advice,contact,tags;
   try{
    advice=clean(input.advice,200,true);contact=clean(input.contact??'',80);
    if(!Array.isArray(input.tags??[])||(input.tags??[]).length>6)throw Error('最多选择 6 个反馈方向');
    tags=Array.from(new Set((input.tags??[]).map(tag=>clean(tag,20,true))));
   }catch(error){fail(400,error.message);}
   const content={starLevel:input.starLevel,tags,advice,contact};
   const previous=await tx.getFeedbackByRequestId(requestId.toLowerCase());
   if(previous){
    if(!isDeepStrictEqual(content,{starLevel:previous.starLevel,tags:previous.tags,advice:previous.advice,contact:previous.contact}))fail(409,'该操作编号已用于另一条反馈');
    return{feedback:publicFeedback(previous),alreadySubmitted:true};
   }
   const now=clock();if(await tx.countFeedbackSince(new Date(now-86400000).toISOString())>=20)fail(429,'今天提交的反馈较多，请明天再试');
   const feedback={id:randomUUID(),requestId:requestId.toLowerCase(),...content,status:'submitted',createdAt:new Date(now).toISOString()};
   await tx.saveFeedback(feedback);
   const receipt={id:randomUUID(),category:'system',title:'反馈已收到',body:'你的意见反馈已保存。反馈编号：'+feedback.id+'。感谢你帮助我们改进联桌麻将。',createdAt:feedback.createdAt,readAt:null};
   await tx.saveMail(receipt);
   return{feedback:publicFeedback(feedback),alreadySubmitted:false,mail:receipt};
  }),
  feedbackHistory:(accountId,input={})=>store.withAccount(accountId,async tx=>{
   const result=await tx.listFeedback(page(input,'4'));return{feedback:result.records.map(publicFeedback),nextCursor:result.nextCursor};
  }),
  mail:(accountId,input={})=>store.withAccount(accountId,async tx=>{
   const category=input.category||'all';if(!['all','system','reward'].includes(category))fail(400,'邮件分类无效');
   const result=await tx.listMail(category,page(input,'3'));
   return{messages:result.records,unreadCount:await tx.unreadMailCount(),nextCursor:result.nextCursor};
  }),
  readMail:(accountId,{id,all=false}={})=>store.withAccount(accountId,async tx=>{
   if(typeof all!=='boolean'||all&&id!==undefined||!all&&(typeof id!=='string'||!UUID.test(id)))fail(400,'请选择需要读取的邮件');
   const readAt=new Date(clock()).toISOString();
   if(all){const updated=await tx.readAllMail(readAt);return{updated,unreadCount:await tx.unreadMailCount()};}
   const message=await tx.getMail(id.toLowerCase());if(!message)fail(404,'找不到这封邮件');
   const updated=message.readAt?0:await tx.readMail(message.id,readAt);
   return{message:await tx.getMail(message.id),updated,unreadCount:await tx.unreadMailCount()};
  }),
 };
}
