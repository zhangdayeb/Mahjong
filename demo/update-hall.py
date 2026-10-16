from pathlib import Path
p=Path('demo/hall.html');s=p.read_text(encoding='utf-8-sig').replace('href="lobby.css"','href="lobby.css"><link rel="stylesheet" href="hall-match.css"').replace('<div id="lobby">','<div id="lobby" class="hall-match">').replace('src="assets/lobby/631.png" alt="本地示例头像"','src="assets/lobby/user-reference.png" alt="参考头像"').replace('80.6万','57万').replace('assets/lobby/293.png','assets/lobby/160.png').replace('血流红中 雀王场','血流红中 新手场').replace('1440 × 720','1080 × 542').replace('头像使用游戏自带示例头像','头像取自用户提供的参考截图')
p.write_text(s,encoding='utf-8')
for file in ['rooms.html','reference.html']:
 p=Path('demo')/file;s=p.read_text(encoding='utf-8-sig').replace('href="/"','href="hall.html"');p.write_text(s,encoding='utf-8')
p=Path('demo/table-controls.js');s=p.read_text(encoding='utf-8-sig').replace("location.href='/'", "location.href='hall.html'");p.write_text(s,encoding='utf-8')
