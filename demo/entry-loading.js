import {hallGames} from './hall-game-catalog.js';
const imageIds=[1548,391,944,1680,1863,1955,1499,1602,160];
export const entryResources=Object.freeze([
 {src:'assets/entry/lianzhuo-loading-bg-v1.png',type:'image'},
 {src:'assets/lobby/lianzhuo-hall-bg-v1.png',type:'image'},
 ...imageIds.map(id=>({src:`assets/lobby/${id}.png`,type:'image'})),
 ...[...new Set(hallGames.map(game=>game.art))].map(src=>({src,type:'image'})),
 {src:'assets/lobby/user-reference.png',type:'image'},
 ...['hall.html','lobby.js','lobby.css','hall-match.css','hall-panels.css','lianzhuo-hall.css','hall-game-cards.css','hall-game-cards.js','hall-game-catalog.js'].map(src=>({src,type:'file'}))
]);
export async function loadEntryResource(resource){
 if(resource.type==='image')return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>reject(Error('图片加载失败'));image.src=resource.src;});
 const response=await fetch(resource.src);if(!response.ok)throw Error(`资源加载失败：${response.status}`);await response.arrayBuffer();
}
export async function preloadEntryResources(resources=entryResources,{load=loadEntryResource,onProgress=()=>{}}={}){
 let loaded=0;const failed=[];onProgress({loaded,total:resources.length,percent:resources.length?0:100});
 await Promise.all(resources.map(async resource=>{try{await load(resource);loaded++;onProgress({loaded,total:resources.length,percent:loaded/resources.length*100});}catch{failed.push(resource.src);}}));
 return{loaded,total:resources.length,percent:resources.length?loaded/resources.length*100:100,failed,ready:failed.length===0};
}
