export const MAX_SIGNATURE_LENGTH=40;
export function normalizeSignature(value){
 if(typeof value!=='string')throw Error('请输入文字签名');
 if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value))throw Error('签名包含不支持的字符');
 const text=value.normalize('NFC').replace(/\s+/gu,' ').trim();
 if(Array.from(text).length>MAX_SIGNATURE_LENGTH)throw Error(`个性签名最多${MAX_SIGNATURE_LENGTH}个字`);
 return text;
}
