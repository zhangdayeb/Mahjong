from pathlib import Path
p=Path(__file__).with_name('table-controls.js');s=p.read_text(encoding='utf-8');s=s.replace("$('#set-speed').onchange=e=>speed=Number(e.target.value);", "$('#set-speed').onchange=e=>speed=Number(e.target.value);const fast=document.createElement('button');fast.textContent='快速演示';fast.onclick=()=>{speed=120;seconds=5;dialog.close();setAuto(true);};body.append(fast);")
p.write_text(s,encoding='utf-8')
