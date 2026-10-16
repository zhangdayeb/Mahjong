import mysql from 'mysql2/promise';
import {randomUUID} from 'node:crypto';
export function createMysqlStore(config){
 const pool=mysql.createPool({...config,timezone:'Z',connectionLimit:5,supportBigNumbers:true,bigNumberStrings:true});
 const json=value=>typeof value==='string'?JSON.parse(value):value;
 const game=row=>row?{id:row.id,accountId:row.account_id,seed:Number(row.seed),mode:row.mode,room:row.room,currency:row.currency,startBalance:Number(row.start_balance),rulesVersion:Number(row.rules_version||1),rulesData:json(row.rules_data)||null,resultData:json(row.result_data)||null,actions:typeof row.actions==='string'?JSON.parse(row.actions):row.actions,status:row.status,delta:Number(row.delta)}:null;
 const operation=row=>row?{id:row.id,kind:row.kind,currency:row.currency,before:Number(row.balance_before),after:Number(row.balance_after),createdAt:new Date(row.created_at).toISOString()}:null;
 const adSession=row=>row?(typeof row.data==='string'?JSON.parse(row.data):row.data):null;
 return{
  async health(){await pool.query('SELECT 1');},
  async close(){await pool.end();},
  async createSession(hash,balance){const conn=await pool.getConnection();try{await conn.beginTransaction();const id=randomUUID();await conn.execute('INSERT INTO demo_accounts(id,name,balance,coin_balance,diamond_balance) VALUES(?,?,?,?,0)',[id,'游客'+id.slice(0,6),0,balance]);await conn.execute('INSERT INTO demo_sessions(token_hash,account_id,expires_at) VALUES(?,?,DATE_ADD(NOW(),INTERVAL 30 DAY))',[hash,id]);await conn.commit();return id;}catch(error){await conn.rollback();throw error;}finally{conn.release();}},
  async findSession(hash){const [rows]=await pool.execute('SELECT account_id FROM demo_sessions WHERE token_hash=? AND expires_at>NOW()',[hash]);return rows[0]?.account_id??null;},
  async withAccount(id,callback){const conn=await pool.getConnection();try{
   await conn.beginTransaction();const [rows]=await conn.execute('SELECT id,name,signature,balance,coin_balance,diamond_balance FROM demo_accounts WHERE id=? FOR UPDATE',[id]);const account=rows[0];if(!account)throw Error('Missing account');account.balance=Number(account.balance);account.coinBalance=Number(account.coin_balance);account.diamondBalance=Number(account.diamond_balance);
   const tx={
    async activeGame(){const [rows]=await conn.execute("SELECT * FROM demo_rounds WHERE account_id=? AND status='active' ORDER BY created_at DESC LIMIT 1",[id]);return game(rows[0]);},
    async latestGameForMode(mode){const [rows]=await conn.execute('SELECT * FROM demo_rounds WHERE account_id=? AND mode=? ORDER BY round_order DESC LIMIT 1',[id,mode]);return game(rows[0]);},
    async getGame(roundId){const [rows]=await conn.execute('SELECT * FROM demo_rounds WHERE id=? AND account_id=?',[roundId,id]);return game(rows[0]);},
    async saveGame(value){await conn.execute('INSERT INTO demo_rounds(id,account_id,seed,mode,room,currency,start_balance,rules_version,rules_data,result_data,actions,status,delta) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE actions=VALUES(actions),status=VALUES(status),delta=VALUES(delta),result_data=VALUES(result_data)',[value.id,id,value.seed,value.mode,value.room,value.currency||(value.mode==='sanguo'?'coins':'beans'),value.startBalance,value.rulesVersion||1,JSON.stringify(value.rulesData||null),JSON.stringify(value.resultData||null),JSON.stringify(value.actions),value.status,value.delta]);},
    async saveAccount(value){await conn.execute('UPDATE demo_accounts SET balance=?,coin_balance=?,diamond_balance=?,signature=? WHERE id=?',[value.balance,value.coinBalance,value.diamondBalance,value.signature||'',id]);},
    async addLedger(value){await conn.execute('INSERT INTO demo_ledger(account_id,type,round_id,currency,balance_before,amount,balance_after) VALUES(?,?,?,?,?,?,?)',[id,value.type,value.roundId??null,value.currency,value.before,value.amount,value.balance]);},
    async getOperation(requestId){const [rows]=await conn.execute('SELECT * FROM demo_balance_operations WHERE id=? AND account_id=?',[requestId,id]);return operation(rows[0]);},
    async addOperation(value){await conn.execute('INSERT INTO demo_balance_operations(id,account_id,kind,currency,balance_before,balance_after,created_at) VALUES(?,?,?,?,?,?,?)',[value.id,id,value.kind,value.currency,value.before,value.after,new Date(value.createdAt)]);},
    async listOperations(currency){const [rows]=await conn.execute('SELECT * FROM demo_balance_operations WHERE account_id=? AND currency=? ORDER BY created_at DESC,id DESC LIMIT 50',[id,currency]);return rows.map(operation);},
    async getDailyReward(day){const [rows]=await conn.execute('SELECT operation_id FROM demo_daily_rewards WHERE account_id=? AND reward_day=?',[id,day]);return rows[0]?{day,operationId:rows[0].operation_id}:null;},
    async saveDailyReward(value){await conn.execute('INSERT INTO demo_daily_rewards(account_id,reward_day,operation_id,created_at) VALUES(?,?,?,?)',[id,value.day,value.operationId,new Date(value.createdAt)]);},
    async getAdSession(adId){const [rows]=await conn.execute('SELECT data FROM demo_ad_sessions WHERE id=? AND account_id=?',[adId,id]);return adSession(rows[0]);},
    async getAdByRequestId(requestId){const [rows]=await conn.execute('SELECT data FROM demo_ad_sessions WHERE request_id=? AND account_id=?',[requestId,id]);return adSession(rows[0]);},
    async activeAd(now){const [rows]=await conn.execute("SELECT data FROM demo_ad_sessions WHERE account_id=? AND expires_at>? AND JSON_UNQUOTE(JSON_EXTRACT(data,'$.status'))='watching' ORDER BY created_at DESC LIMIT 1",[id,new Date(now)]);return adSession(rows[0]);},
    async saveAdSession(value){await conn.execute('INSERT INTO demo_ad_sessions(id,account_id,request_id,data,expires_at) VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data)',[value.id,id,value.requestId,JSON.stringify(value),new Date(value.expires)]);}
   };
   const result=await callback(tx,account);await conn.commit();return result;
  }catch(error){await conn.rollback();throw error;}finally{conn.release();}}
 };
}
