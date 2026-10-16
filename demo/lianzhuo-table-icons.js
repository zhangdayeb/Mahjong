import {hallIcon} from './hall-interface-icons.js';

// The table uses the hall's line icon family, with a few game-only symbols.
const tablePaths={
 trustee:'<path d="M8 9h16a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3ZM16 9V4M3 15H1M29 15h2M10 22h12"/><circle cx="11" cy="15" r="2"/><circle cx="21" cy="15" r="2"/><circle cx="16" cy="3" r="1"/>',
 timeout:'<circle cx="16" cy="17" r="11"/><path d="M16 11v7l5 3M12 3h8M16 3v3M25 7l3-3"/>',
 exit:'<path d="M14 5H6v22h8M14 16h15M23 10l6 6-6 6M10 14v4"/>',
 chat:'<path d="M27 18c-1 5-6 8-12 7l-7 3 1-6C2 16 5 6 15 5c8-1 14 5 12 13Z"/><circle cx="11" cy="15" r="1"/><circle cx="17" cy="15" r="1"/><circle cx="23" cy="15" r="1"/>',
 ledger:'<path d="M8 6h17v22H8a4 4 0 0 1-4-4V6a3 3 0 0 1 6 0v18H5M14 11h7M14 16h7M14 21h4"/>',
 hint:'<path d="M10 21c-2-2-4-5-4-8a10 10 0 0 1 20 0c0 3-2 6-4 8l-1 4H11ZM11 25h10M13 29h6M16 3v2M3 3l3 3M26 6l3-3"/><path d="m12 13 4 4 4-4M16 17v7"/>'
};

export function tableIcon(name){
 if(!tablePaths[name])return hallIcon(name,'lianzhuo-table-icon');
 return `<svg class="hall-ui-icon lianzhuo-table-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${tablePaths[name]}</svg>`;
}

export function tableMenuButton(id,name,icon){return `<button id="${id}" class="lianzhuo-menu-item" aria-label="${name}"><span class="lianzhuo-table-medallion">${tableIcon(icon)}</span><span class="lianzhuo-menu-label">${name}</span></button>`;}

export function applyTableIcons(root){
 root.querySelectorAll('[data-table-icon]').forEach(button=>{
  button.classList.add('lianzhuo-icon-button');
  button.innerHTML=`<span class="lianzhuo-table-medallion">${tableIcon(button.dataset.tableIcon)}</span>`;
 });
}

// Also used by the teaching controller, which does not import table-controls.
if(typeof document!=='undefined')applyTableIcons(document);
