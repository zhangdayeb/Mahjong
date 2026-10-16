import {buildSanguoDealtModel} from './sanguo-dealt-model.js';
import {findSanguoNode} from './sanguo-table-model.js';
import {computeTableLayout,concealedHandPlacements,discardTilePlacements,huTilePlacements,tablePainterOrder,TABLE_SOURCE} from './table-layout.js';
import {meldPlacements} from './meld-study/placements.js';
const uuid=key=>key?.replace(/^(?:table|meld)\//,'');
const scoreText=value=>{const absolute=Math.abs(value),text=absolute>=100000000?Number((absolute/100000000).toFixed(1))+'亿':absolute>=10000?Number((absolute/10000).toFixed(1))+'万':String(absolute);return(value<0?'-':value>0?'+':'')+text+'分';};
export function sanguoTileLayers(tile,play){
 const root=tile.sprite?.uuid,face=play.atlasFaces[root]?.faces[tile.value],scale=tile.bodyScale||tile.scale;
 const layers=[{frame:uuid(tile.body),x:tile.x,y:tile.y,scale,style:tile.sprite?.body}];
 if(!face||tile.concealed)return layers;
 const offset=tile.param?.colorPos||[0,...(tile.faceOffset||[0,0])],faceScale=tile.param?.colorScale||[0,...(tile.faceScale||[1,1])],skew=tile.param?.colorSkew||[0,0,0];
 layers.push({frame:face,x:tile.x+offset[1]*scale[0],y:tile.y-offset[2]*scale[1],scale:[faceScale[1]*scale[0],faceScale[2]*scale[1]],skew:[skew[1],skew[2]],style:tile.sprite?.face});return layers;
}
export function buildSanguoPlayModel(data,dealt,play,profiles,round,room,{width=986,height=504,selected=-1,remaining=20,clockDisplay='',practiceBalance=null}={}){
 const fixture={title:'三国麻将',maxFan:round.cap,players:profiles.map(player=>({...player,displayName:['你','阿唐','林先生','小苏'][player.seat],balanceText:player.seat===0&&Number.isFinite(practiceBalance)?scoreText(Math.max(0,practiceBalance+round.scores[0])).replace(/^\+/,'').replace(/分$/,''):scoreText(round.scores[player.seat]),ready:false})),hand:round.hands[0],opponentHandCounts:round.hands.map(hand=>hand.length),readySourceSeats:[],clockDisplay,dealerSourceSeatIndex:[0,3,2,1][round.dealer],remaining:round.wall.length,networkLatency:null};
 const model=buildSanguoDealtModel(data,dealt,fixture,room,{width,height}),table=computeTableLayout(width,height),meldLayout=play.meldLayout;
 model.phase=round.phase;model.ready=[];model.layout=table;model.publicTiles=[];
 const timer=findSanguoNode(model.tree,'fnt_countDown');timer.active=round.phase!=='end';timer.label._string=String(remaining);
 findSanguoNode(model.header,'WifiIcon').active=false;findSanguoNode(model.header,'NetWorkMsLabel').active=false;
 const hand=concealedHandPlacements(round.hands[0].length,0,table,round.melds[0],meldLayout,{drawnCount:round.lastDraw?.player===0?1:0});
 model.hand=hand.map((tile,index)=>({...tile,value:round.hands[0][index],body:uuid(tile.body),seat:0,y:tile.y-(index===selected?28*model.scale:0)}));
 model.handButtons=model.hand.map(tile=>({index:tile.index,x:tile.x-91*model.scale/2,y:tile.y-134*model.scale/2,width:91*model.scale,height:134*model.scale}));
 const records=[];for(let seat=0;seat<4;seat++){
  if(seat!==0)records.push(...concealedHandPlacements(round.hands[seat].length,seat,table,round.melds[seat],meldLayout).map(tile=>({...tile,seat,kind:'hand'})));
  records.push(...discardTilePlacements(round.discards[seat],seat,table).map(tile=>({...tile,seat,kind:'discard'})));
  records.push(...huTilePlacements(round.huEvents.filter(event=>event.seat===seat).map(event=>event.tile),seat,table).map(tile=>({...tile,seat,kind:'hu'})));
  for(const tile of meldPlacements(round.melds[seat],seat,meldLayout)){
   const cfg=table.seats[seat].meld,scale=cfg.scale.map(value=>value*tile.tileScale),sprite=TABLE_SOURCE.tileSprites[meldLayout.seats[seat].tilePrefab.uuid];
   records.push({...tile,seat,kind:'meld',body:uuid(tile.body),x:cfg.origin[0]+tile.pos[0]*cfg.scale[0],y:cfg.origin[1]-tile.pos[1]*cfg.scale[1],bodyScale:scale,sprite,param:{colorPos:[0,...tile.colorPos],colorScale:[0,...tile.colorScale],colorSkew:[0,...tile.colorSkew]},concealed:round.melds[seat][tile.group]?.type==='dark'&&tile.index<3});
  }
 }
 model.concealed=[];model.publicTiles=tablePainterOrder(records).map(tile=>({...tile,body:uuid(tile.body)}));
 model.turn=round.turn;model.mapCount=round.unlocks[0].length;model.fixture=fixture;return model;
}
