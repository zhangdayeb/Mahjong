import {hallGames,hallGameHref} from './hall-game-catalog.js';

export function createHallGameCards(parent,{onPreview=()=>{}}={}){
 parent.innerHTML=`<header class="game-heading"><h1>麻将玩法</h1><span>${hallGames.length}种玩法</span></header><div class="game-track" tabindex="0" role="region" aria-label="麻将玩法，左右滑动查看">${hallGames.map((game,index)=>`<a class="hall-game-card tone-${game.tone}" href="${hallGameHref(game)}" data-game="${game.mode}" aria-label="${game.name}${game.preview?'，规则预览':''}"><span class="game-index">${String(index+1).padStart(2,'0')}</span><span class="game-status ${game.preview?'is-preview':''}">${game.preview?'规则预览':'金币场'}</span><img class="game-art" src="${game.art}" alt="" draggable="false">${game.mark?`<span class="game-mark" aria-hidden="true">${game.mark}</span>`:''}<div class="game-card-copy"><strong>${game.name}</strong><small>${game.en}</small><span class="game-card-action">${game.preview?'查看规则':'进入场次'} <b>›</b></span></div></a>`).join('')}</div><footer class="game-pager"><button type="button" class="game-prev" aria-label="上一组麻将玩法">‹</button><span class="game-scroll-hint">左右滑动，查看更多玩法</span><button type="button" class="game-next" aria-label="下一组麻将玩法">›</button></footer>`;
 const track=parent.querySelector('.game-track'),previous=parent.querySelector('.game-prev'),next=parent.querySelector('.game-next');
 const step=()=>{const cards=track.querySelectorAll('.hall-game-card');return cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:track.clientWidth;};
 const update=()=>{previous.disabled=track.scrollLeft<=1;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-1;};
 function move(direction){track.scrollBy({left:direction*step(),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 previous.onclick=()=>move(-1);next.onclick=()=>move(1);track.addEventListener('scroll',update,{passive:true});
 track.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
 let drag=null,suppressClick=false;
 track.addEventListener('dragstart',event=>event.preventDefault());
 track.addEventListener('pointerdown',event=>{if(event.pointerType==='touch'||event.button!==0)return;suppressClick=false;drag={id:event.pointerId,x:event.clientX,left:track.scrollLeft,scale:track.getBoundingClientRect().width/track.clientWidth,moved:false};});
 track.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const delta=event.clientX-drag.x;if(!drag.moved&&Math.abs(delta)<=6)return;if(!drag.moved){drag.moved=true;track.classList.add('is-dragging');track.setPointerCapture(event.pointerId);}track.scrollLeft=drag.left-delta/drag.scale;event.preventDefault();});
 track.addEventListener('pointerup',()=>{suppressClick=!!drag?.moved;drag=null;track.classList.remove('is-dragging');});
 track.addEventListener('pointercancel',()=>{drag=null;suppressClick=false;track.classList.remove('is-dragging');});
 track.addEventListener('click',event=>{if(suppressClick){suppressClick=false;event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
 for(const link of track.querySelectorAll('[data-game]')){const game=hallGames.find(game=>game.mode===link.dataset.game);if(game.preview)link.addEventListener('click',event=>{if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();onPreview(game);});}
 update();return{track,refresh:update};
}
