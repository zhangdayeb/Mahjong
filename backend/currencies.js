// Old columns remain available only for settling historical rounds and audits.
export const CURRENCIES=['coins'];
export const currencyForMode=()=> 'coins';
export const currencyBalance=(account,currency)=>Number(currency==='beans'?account.balance:currency==='coins'?account.coinBalance:account.diamondBalance);
export function setCurrencyBalance(account,currency,value){account[currency==='beans'?'balance':currency==='coins'?'coinBalance':'diamondBalance']=value;}
