// Run once as a database administrator before switching to the new service.
// Every step can be retried without overwriting already separated balances.
import mysql from 'mysql2/promise';
import {readFile} from 'node:fs/promises';
const conn=await mysql.createConnection({host:process.env.DB_HOST||'127.0.0.1',port:Number(process.env.DB_PORT||3306),user:process.env.MIGRATION_DB_USER||process.env.DB_USER,password:process.env.MIGRATION_DB_PASSWORD||process.env.DB_PASSWORD,database:process.env.DB_NAME||'majong_demo',multipleStatements:true});
try{
 await conn.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));
 async function column(table,name){const[rows]=await conn.execute('SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?',[table,name]);return rows[0];}
 let info=await column('demo_accounts','coin_balance');
 if(!info){await conn.query('ALTER TABLE demo_accounts ADD COLUMN coin_balance BIGINT UNSIGNED NULL');info={IS_NULLABLE:'YES'};}
 if(info.IS_NULLABLE==='YES'){await conn.query('UPDATE demo_accounts SET coin_balance=balance WHERE coin_balance IS NULL');await conn.query('ALTER TABLE demo_accounts MODIFY COLUMN coin_balance BIGINT UNSIGNED NOT NULL DEFAULT 30000');}
 if(!await column('demo_accounts','diamond_balance'))await conn.query('ALTER TABLE demo_accounts ADD COLUMN diamond_balance BIGINT UNSIGNED NOT NULL DEFAULT 0');
 info=await column('demo_rounds','currency');
 if(!info){await conn.query('ALTER TABLE demo_rounds ADD COLUMN currency VARCHAR(12) NULL');info={IS_NULLABLE:'YES'};}
 if(info.IS_NULLABLE==='YES'){await conn.query("UPDATE demo_rounds SET currency=IF(mode='sanguo','coins','beans') WHERE currency IS NULL");await conn.query("ALTER TABLE demo_rounds MODIFY COLUMN currency VARCHAR(12) NOT NULL DEFAULT 'beans'");}
 if(!await column('demo_ledger','currency'))await conn.query("ALTER TABLE demo_ledger ADD COLUMN currency VARCHAR(12) NOT NULL DEFAULT 'shared'");
 info=await column('demo_ledger','balance_before');
 if(!info){await conn.query('ALTER TABLE demo_ledger ADD COLUMN balance_before BIGINT UNSIGNED NULL');info={IS_NULLABLE:'YES'};}
 if(info.IS_NULLABLE==='YES'){await conn.query('UPDATE demo_ledger SET balance_before=balance_after-amount WHERE balance_before IS NULL');await conn.query('ALTER TABLE demo_ledger MODIFY COLUMN balance_before BIGINT UNSIGNED NOT NULL DEFAULT 0');}
 console.log('Independent currencies and operation history schema are ready.');
}finally{await conn.end();}
