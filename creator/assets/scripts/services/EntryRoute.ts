export interface EntryRoute {
  page:'entry'|'hall'|'rooms';
  mode:string;
  room:string;
  confirmGame:boolean;
  notice:string|null;
  source:string;
}

const modes=['classic','red','exchange','six','sixFixed','crazy','eightFixed'];
const rooms=['beginner','primary','advanced','expert'];
const hallPages=['hall.html','collections.html','collection.html','entertainment.html','games.html','hall-games-preview.html'];
const tablePages=['reference.html','table.html','playable.html','table-backup.html'];

/** Read legacy entry URLs without navigation, API calls, or automatically creating a game. */
export function readEntryRoute(href:string):EntryRoute {
  let url:URL;
  try { url=new URL(href,'http://localhost/'); }
  catch { url=new URL('http://localhost/'); }
  const source=url.pathname.split('/').filter(Boolean).pop()||'index.html';
  const requestedMode=url.searchParams.get('mode')||'classic';
  const requestedRoom=url.searchParams.get('room')||'beginner';
  const mode=modes.includes(requestedMode)?requestedMode:'classic';
  const room=rooms.includes(requestedRoom)?requestedRoom:'beginner';
  const route:EntryRoute={page:'entry',mode,room,confirmGame:false,notice:null,source};
  if(requestedMode==='sanguo'||requestedMode==='zodiac'||source==='sanguo-table.html') {
    route.page='hall';route.notice='该旧玩法入口已关闭，请在大厅选择现有麻将玩法。';return route;
  }
  const view=url.searchParams.get('view');
  if(view==='entry'||view==='hall'||view==='rooms')route.page=view;
  else if(view==='table') {
    route.page='rooms';route.confirmGame=true;
    route.notice='已找到原链接中的场次，请点击“进入此场次”开始新的对局。';
  } else if(hallPages.includes(source))route.page='hall';
  else if(source==='rooms.html')route.page='rooms';
  else if(tablePages.includes(source)) {
    route.page='rooms';route.confirmGame=true;
    route.notice='已找到原链接中的场次，请点击“进入此场次”开始新的对局。';
  } else if(!['index.html','entry.html','loading.html'].includes(source))route.page='hall';
  if(!modes.includes(requestedMode))route.notice='原链接中的玩法不存在，已选择血流麻将。';
  return route;
}
