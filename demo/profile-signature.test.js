import test from 'node:test';
import assert from 'node:assert/strict';
import {createTablePanels} from './table-panels.js';
import {practiceProfiles} from './player-display.js';
test('every demo seat has its own signature and player profiles render user signatures as plain text',()=>{
 assert.equal(new Set(practiceProfiles.slice(1).map(p=>p.signature)).size,3);assert.ok(practiceProfiles.slice(1).every(p=>p.signature.length));
 const previous=globalThis.document;
 class Element{constructor(tag){this.tag=tag;this.children=[];this.style={};this.classList={toggle(){}};}append(...nodes){this.children.push(...nodes);}replaceChildren(...nodes){this.children=nodes;}setAttribute(){}addEventListener(){}focus(){document.activeElement=this;}}
 globalThis.document={activeElement:null,createElement:tag=>new Element(tag)};
 try{const parent=new Element('main'),panels=createTablePanels(parent),text='<img src=x onerror=alert(1)>',panel=panels.profile({name:'游客',signature:text},{scores:[0,0,0,0]},0),box=panel.children.find(n=>n.className==='table-profile-signature'),p=box.children[1];assert.equal(p.tag,'p');assert.equal(p.textContent,text);assert.equal(p.children.length,0);assert.equal(panel.style.height,'550px');}finally{globalThis.document=previous;}
});
