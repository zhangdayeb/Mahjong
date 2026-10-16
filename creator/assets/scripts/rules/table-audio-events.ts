// @ts-nocheck
// Generated pure exports from demo/table-controls.js; do not edit.
export function snapshotTableAudio(round){return {phase:round.phase,wallCount:round.wall.length,lastDraw:round.lastDraw,revealed:round.revealed?.slice()||[false,false,false,false]};}
export function tableAudioEvents(before,round,result){
 const draw=round.lastDraw;
 return {huCue:result.huEvents.length>0,draw:before.phase!=='exchange'&&before.phase!=='choose'&&round.phase==='play'&&round.wall.length<before.wallCount&&!!draw&&draw!==before.lastDraw&&!draw.initial&&draw.kongBatch==null&&!result.actions.some(event=>event.action==='gang'),revealSeats:(round.revealed||[]).flatMap((value,seat)=>value&&!before.revealed[seat]?[seat]:[])};
}
// A paused/hidden second is consumed silently. Resume never replays missed
// seconds, and repeated 200 ms timer ticks cannot produce duplicate beeps.
export function createCountdownCue(){let lastKey='';return ({active,deadline,remaining})=>{const key=deadline+':'+remaining;if(key===lastKey)return false;lastKey=key;return !!active&&remaining>0&&remaining<=3;};}
