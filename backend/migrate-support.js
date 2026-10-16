// Additive, retry-safe migration. Existing accounts, sessions, balances, games,
// ledger records and operation history are never rewritten.
import mysql from 'mysql2/promise';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

export class SupportSchemaNotReadyError extends Error{constructor(message){super(message);this.name='SupportSchemaNotReadyError';}}
export function supportMigrationExitCode(error,checkOnly){return checkOnly&&error instanceof SupportSchemaNotReadyError?2:1;}

async function accountIdColumn(conn){
 const[accountColumns]=await conn.execute("SELECT DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,CHARACTER_SET_NAME,COLLATION_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='demo_accounts' AND COLUMN_NAME='id'");
 const column=accountColumns[0];
 if(!column||column.DATA_TYPE!=='char'||Number(column.CHARACTER_MAXIMUM_LENGTH)!==36)throw Error('请先创建现有 demo_accounts 表；账户 id 必须是 CHAR(36)。');
 if(!/^[A-Za-z0-9_]+$/.test(column.CHARACTER_SET_NAME)||!/^[A-Za-z0-9_]+$/.test(column.COLLATION_NAME))throw Error('账户 id 字符集无效。');
 return column;
}

export async function checkSupportSchema(conn){
 const account=await accountIdColumn(conn);
 const[columns]=await conn.execute("SELECT TABLE_NAME,COLUMN_NAME,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH,CHARACTER_SET_NAME,COLLATION_NAME,IS_NULLABLE,DATETIME_PRECISION FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('demo_feedback','demo_mail')");
 const required={
  demo_feedback:{id:['char',36],account_id:['char',36],request_id:['char',36],star_level:['tinyint'],tags:['json','longtext'],advice:['varchar',200],contact:['varchar',80],status:['varchar',16],created_at:['timestamp','datetime']},
  demo_mail:{id:['char',36],account_id:['char',36],category:['varchar',12],title:['varchar',120],body:['text','mediumtext','longtext'],created_at:['timestamp','datetime'],read_at:['timestamp','datetime']},
 };
 for(const[table,fields]of Object.entries(required))for(const[name,types]of Object.entries(fields)){
  const column=columns.find(value=>value.TABLE_NAME===table&&value.COLUMN_NAME===name);
  if(!column)throw new SupportSchemaNotReadyError('后台结构缺少列：'+table+'.'+name);
  const acceptedTypes=types.filter(type=>typeof type==='string');
  if(!acceptedTypes.includes(column.DATA_TYPE)||types.some(type=>typeof type==='number'&&Number(column.CHARACTER_MAXIMUM_LENGTH)<type))throw new SupportSchemaNotReadyError('后台列类型不兼容：'+table+'.'+name);
  if(column.IS_NULLABLE!==(name==='read_at'?'YES':'NO'))throw new SupportSchemaNotReadyError('后台列空值约束不兼容：'+table+'.'+name);
  if(['timestamp','datetime'].includes(column.DATA_TYPE)&&Number(column.DATETIME_PRECISION)<3)throw new SupportSchemaNotReadyError('后台时间列精度不足：'+table+'.'+name);
  if(['advice','contact','title','body'].includes(name)&&column.CHARACTER_SET_NAME!=='utf8mb4')throw new SupportSchemaNotReadyError('后台文本列须支持 UTF-8：'+table+'.'+name);
  if(name==='account_id'&&(column.CHARACTER_SET_NAME!==account.CHARACTER_SET_NAME||column.COLLATION_NAME!==account.COLLATION_NAME))throw new SupportSchemaNotReadyError('后台账户列字符集不匹配：'+table+'.'+name);
 }
 const[indexRows]=await conn.execute("SELECT TABLE_NAME,INDEX_NAME,COLUMN_NAME,SEQ_IN_INDEX,NON_UNIQUE,INDEX_TYPE FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('demo_feedback','demo_mail','demo_ledger')");
 const indexes=new Map();for(const row of indexRows){const key=row.TABLE_NAME+'/'+row.INDEX_NAME;if(!indexes.has(key))indexes.set(key,[]);indexes.get(key).push(row);}
 const indexFor=(table,names,unique=false)=>Array.from(indexes.values()).find(rows=>rows[0].TABLE_NAME===table&&(!unique||Number(rows[0].NON_UNIQUE)===0)&&rows[0].INDEX_TYPE==='BTREE'&&rows.slice().sort((a,b)=>Number(a.SEQ_IN_INDEX)-Number(b.SEQ_IN_INDEX)).map(row=>row.COLUMN_NAME).join(',')===names.join(','));
 for(const[table,names,unique]of [
  ['demo_feedback',['id'],true],['demo_feedback',['account_id','request_id'],true],['demo_feedback',['account_id','created_at','id'],false],
  ['demo_mail',['id'],true],['demo_mail',['account_id','created_at','id'],false],['demo_mail',['account_id','read_at'],false],
 ])if(!indexFor(table,names,unique))throw new SupportSchemaNotReadyError('后台结构缺少索引：'+table+'('+names.join(',')+')');
 const ledger=indexFor('demo_ledger',['account_id','currency','created_at','id']);
 if(!ledger)throw new SupportSchemaNotReadyError('后台结构缺少金币历史索引。');
 const[foreignKeys]=await conn.execute("SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('demo_feedback','demo_mail') AND REFERENCED_TABLE_NAME IS NOT NULL");
 for(const table of Object.keys(required))if(!foreignKeys.some(row=>row.TABLE_NAME===table&&row.COLUMN_NAME==='account_id'&&row.REFERENCED_TABLE_NAME==='demo_accounts'&&row.REFERENCED_COLUMN_NAME==='id'))throw new SupportSchemaNotReadyError('后台结构缺少账户外键：'+table);
 return{ok:true,tables:Object.keys(required),ledgerHistoryIndex:ledger[0].INDEX_NAME};
}

export async function migrateSupportSchema(conn){
 const column=await accountIdColumn(conn);
 let sql=await readFile(new URL('./support-schema.sql',import.meta.url),'utf8');
 // Foreign key character sets must match even if the database default changed
 // after the original accounts table was created.
 sql=sql.replaceAll('account_id CHAR(36) NOT NULL',`account_id CHAR(36) CHARACTER SET ${column.CHARACTER_SET_NAME} COLLATE ${column.COLLATION_NAME} NOT NULL`);
 for(const statement of sql.split(';').map(value=>value.trim()).filter(Boolean))await conn.query(statement);
 const[indexes]=await conn.execute("SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='demo_ledger' AND INDEX_NAME='idx_demo_ledger_history'");
 if(!indexes.length)await conn.query('ALTER TABLE demo_ledger ADD INDEX idx_demo_ledger_history(account_id,currency,created_at,id)');
 return checkSupportSchema(conn);
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const checkOnly=process.argv.includes('--check');let conn;
 try{
  conn=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.MIGRATION_DB_USER||process.env.DB_USER,password:process.env.MIGRATION_DB_PASSWORD||process.env.DB_PASSWORD,database:process.env.DB_NAME||'majong_demo'});
  const result=checkOnly?await checkSupportSchema(conn):await migrateSupportSchema(conn);console.log(JSON.stringify({...result,readOnly:checkOnly}));
 }catch(error){
  process.exitCode=supportMigrationExitCode(error,checkOnly);
  console.error(error instanceof SupportSchemaNotReadyError?error.message:'Backend schema check failed: '+(error.code||error.name));
 }finally{await conn?.end();}
}
