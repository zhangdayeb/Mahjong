const lessons=[
 ['welcome','玩法指引',777,'欢迎来到玩法指引，我们一起来学习血流红中的基础知识吧！','继续'],
 ['explainPai','用牌说明',782,'血流红中主要用牌包含万、条、筒及红中。','开始对局'],
 ['HSZ','换三张',425,'选择三张筒牌，与其他一家交换。','确认换三张'],
 ['dingQue','定缺',131,'请选择花色最少的牌定为缺牌，没有该花色才能胡牌。这里选择缺条。','选择缺条'],
 ['doPai','做牌',763,'有缺牌不能胡牌，需要先打出缺门牌。','继续'],
 ['chuPai','出牌',280,'选择手中的3条，点击出牌。','出牌'],
 ['peng','碰',777,'其他家打出与手牌中“对子”相同的牌，可“碰”组成刻子。','碰'],
 ['peng_out','碰后出牌',280,'碰完后需要对应再打出1张牌，选择9条。','出牌'],
 ['tingTip','听牌',798,'已经听牌啦，只差所需要的一张牌就能胡牌啦。','查看听牌'],
 ['gang','杠',777,'4张同样的牌可以组成杠。','暗杠'],
 ['hu','胡牌',410,'手牌已经符合胡牌要求，点击胡牌吧。','胡牌'],
 ['huOther','继续血流',410,'血流红中玩法中可以多次胡牌，直到牌摸完等结束条件成立。','演示再次胡牌'],
 ['end','完成教学',777,'恭喜您完成新手教学，点击返回大厅。','返回场次']
];
const $=s=>document.querySelector(s);
export function guideControls({render,animate,sound,toast,effect}){
 let index=0,selection=new Set(),r,frames=[],history=[];const card=document.createElement('section');card.className='guide-panel';card.setAttribute('aria-label','玩法指引');$('#ui-layer').append(card);
 const progress=document.createElement('div');progress.className='guide-steps';$('#ui-layer').append(progress);const finger=document.createElement('img');finger.className='guide-finger';finger.src='guide-study/assets/game-952-pic_08.png';card.append(finger);
 const actions=document.createElement('div');actions.className='round-actions';$('.action-area').replaceChildren(actions);
 $('#menu-panel').innerHTML='<button id="guide-restart">重新学习</button><button id="guide-exit">返回场次</button><button id="menu-inspect">查看界面实现</button><button id="menu-close">收起菜单</button>';
 function back(){effect.clear();location.href='rooms.html?mode=red'}$('#guide-exit').onclick=back;$('#guide-restart').onclick=reset;$('#reset-ref').onclick=reset;
 $('#recorder').onclick=()=>toast('教学用固定手牌，可在“用牌说明”步骤查看牌组');$('#ledger').onclick=()=>toast('这是分步教学，动作语音和特效可重播');$('#hint-ref').onclick=()=>toast('请按步骤进入“听牌”指引');$('#chat').onclick=()=>toast('玩法指引中暂停聊天');
 fetch('guide-study/frames.json').then(x=>x.json()).then(x=>{frames=x;show()});
 function image(id){return frames.find(x=>x.bundle==='game'&&x.id===id)?.image}
 function show(){if(!r)return;const [key,title,banner,text,label]=lessons[index];r.phase='play';r.turn=0;render(r,selection);$('#tile-count').textContent=r.wall.length;$('#countdown').textContent='教学';$('.table-text span').textContent='玩法指引 · 866 教学脚本';progress.textContent=`玩法指引　${index+1} / ${lessons.length}　${title}`;card.replaceChildren();const titleImg=document.createElement('img');titleImg.className='guide-title';titleImg.src=image(banner)||'guide-study/assets/game-777-pic_15.png';titleImg.alt='血流红中：'+title;card.append(titleImg);const p=document.createElement('p');p.textContent=text;card.append(p);if(index===1){const row=document.createElement('div');row.className='guide-sample';for(const code of ['1_1','2_1','3_1','5_1']){const im=document.createElement('img');im.src='rule-study/assets/img_tile_'+code+'.png';im.alt='教学用牌';row.append(im)}card.append(row)}const note=document.createElement('small');note.textContent='本地教学 · 原图与步骤来自原版，奖励不连接线上账户';card.append(note);const nav=document.createElement('div');nav.className='guide-nav';for(const [text,fn,disabled]of [['上一步',()=>{effect.clear();index--;r=JSON.parse(JSON.stringify(history[index]));selection.clear();show()},index===0],['重播本步',()=>{effect.clear();replay()},false],['跳过引导',back,false]]){const b=document.createElement('button');b.textContent=text;b.disabled=disabled;b.onclick=fn;nav.append(b)}card.append(nav);if([2,5,7].includes(index))card.append(finger);actions.replaceChildren();const b=document.createElement('button');b.textContent=label;b.onclick=advance;actions.append(b);for(const [seat,selector]of [[0,'.profile-mine'],[1,'.profile-right'],[2,'.profile-top'],[3,'.profile-left']]){const el=$(selector);el.querySelector('.que').textContent=r.missing[seat]?['','万','条','筒'][r.missing[seat]]:'?';el.querySelector('.profile-info').textContent=['你','雀神丶望','失乐园','虚伪的表情'][seat];}}
 function replay(){if(index===6)effect.play('peng');else if(index===9)effect.play('gang');else if(index===10||index===11)effect.play('hu');else toast('请选择对应手牌或点击下方按钮继续')}
 function advance(){effect.clear();if(index===2){if(selection.size!==3||[...selection].some(i=>Math.floor(r.hands[0][i]/10)!==3)){toast('请选择三张筒牌');return}r.hands[0]=[51,51,11,11,11,12,12,12,13,13,31,31,23,29];}if(index===3)r.missing=[2,1,2,3];if(index===5||index===7){const expected=index===5?23:29;const at=[...selection][0];if(selection.size!==1||r.hands[0][at]!==expected){toast(index===5?'请先选择3条':'请先选择9条');return}r.hands[0].splice(at,1);r.discards[0].push(expected);animate(expected,0,r.discards[0].length-1);sound('outtile')}if(index===6){r.discards[2]=[];r.hands[0]=r.hands[0].filter(v=>v!==13);r.melds[0].push({type:'peng',value:13,from:2});effect.play('peng')}if(index===8){r.hands[0].push(11);toast('摸到第四张1万，可以暗杠');}if(index===9){r.hands[0]=[51,51,12,12,12,31,31,14];r.melds[0].push({type:'dark',value:11,from:0});effect.play('gang')}if(index===10||index===11)effect.play('hu');if(index===12){localStorage.setItem('MAHJONG_GUIDE_COMPLETE','true');back();return}index++;if(index===6)r.discards[2]=[13];history[index]=JSON.parse(JSON.stringify(r));selection.clear();show();}
 function reset(){effect.clear();index=0;selection.clear();r={wall:Array(52).fill(0),hands:[[51,51,11,11,11,12,12,12,13,13,31,33,35,38],[],[],[]],melds:[[],[],[],[]],discards:[[],[],[],[]],missing:[0,0,0,0],scores:[0,0,0,0],phase:'play',turn:0};history=[JSON.parse(JSON.stringify(r))];show()}
 return{reset,get round(){return r},get selection(){return selection},get canSelect(){return [2,5,7].includes(index)},select(i){if(!this.canSelect)return;if(index===2){if(selection.has(i))selection.delete(i);else if(selection.size<3)selection.add(i)}else selection=new Set([i]);sound('select');show()},syncSound(value){effect.syncSound(value)}};
}
