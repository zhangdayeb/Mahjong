from pathlib import Path
p=Path(__file__).with_name('lobby.js');s=p.read_text(encoding='utf-8-sig');a=s.index("$('.modes').innerHTML=");b=s.index('const nav=',a)
s=s[:a]+'''$('.modes').innerHTML=modes.map(([name,key,id,en,x,y,w,h,cls,tag,color])=>`<a class="mode ${cls}" href="${key==='classic'||key==='red'?`rooms.html?mode=${key}`:'#'}" ${key==='classic'||key==='red'?'':`data-info="${name}"`} aria-label="${name}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><img class="card-art" src="${asset(id)}" alt=""><img class="card-title" src="assets/lobby/title-${key}.png" alt="${name}"><img class="card-en" src="${asset(en)}" alt="">${tag?`<span class="tag ${color}">${tag}</span>`:''}</a>`).join('');
'''+s[b:];p.write_text(s,encoding='utf-8')
