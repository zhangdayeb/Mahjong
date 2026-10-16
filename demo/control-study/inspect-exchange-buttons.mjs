import fs from 'node:fs';
import{lookup,expandUUID}from'../inspect-assets.mjs';
import{decodeCompiled}from'../meld-study/decode-compiled.mjs';
const raw=lookup('prefabs',3840),instances=decodeCompiled(structuredClone(raw)).instances;
const geometry=n=>({name:n._name,parent:n._parent?._name,position:n._trs?.slice(0,2)??[0,0],scale:n._trs?.slice(7,9)??[1,1],size:n._contentSize??[0,0],anchor:n._anchorPoint??[.5,.5],active:n._active!==false,opacity:n._opacity??255,color:n._color?.[0]??0xffffffff});
const nodes=instances.filter(n=>n?.class==='cc.Node').map(n=>({...geometry(n),components:(n._components||[]).filter(c=>['cc.Button','cc.Label','cc.Sprite','cc.Widget'].includes(c.class)).map(c=>Object.fromEntries(Object.entries(c).filter(([k,v])=>k!=='node'&&(v===null||typeof v!=='object'||(Array.isArray(v)&&v.every(x=>x===null||typeof x!=='object'))))))}));
fs.writeFileSync('demo/control-study/raw/hsz-panel-3840.json',JSON.stringify(raw,null,2));fs.writeFileSync('demo/control-study/exchange-button-source.json',JSON.stringify({prefab:{bundle:'prefabs',id:3840},nodes},null,2));
for(const n of nodes)if(n.components.length||/normal|Tip|tip|pannel|HSZ/.test(n.name))console.log(JSON.stringify(n));
