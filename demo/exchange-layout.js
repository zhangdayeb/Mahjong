// GDPlayerHSZView.updateAllPlayerNodeLayout, ordinary table (not spectator).
// Source seat order is mine/left/front/right; local order is clockwise.
export const EXCHANGE_PACK_SOURCE=[
 {position:[0,-145],scale:[1,1],angle:0,tiles:[[-52,0,59,77],[-2,0,58,77],[48,0,56,77]]},
 {position:[275,25],scale:[-1,1],angle:-3,tiles:[[1.9,48.8,80,59],[-5.8,8.7,81,60],[-13.8,-31.8,82,61]]},
 {position:[0,220],scale:[.8,.8],angle:0,tiles:[[-48,0,59,77],[2.5,0,58,77],[53,0,56,77]]},
 {position:[-271,25],scale:[1,1],angle:3,tiles:[[-4,52.8,80,59],[-11.8,11.8,81,60],[-19.5,-29.4,82,61]]},
];
export function exchangePackLayout(width=1280,height=640){
 const scale=Math.min(width/1280,height/720);
 return EXCHANGE_PACK_SOURCE.map(source=>({...source,center:[width/2+source.position[0]*scale,height/2-source.position[1]*scale],stageScale:scale}));
}
