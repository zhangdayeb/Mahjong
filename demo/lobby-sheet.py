from pathlib import Path
from PIL import Image,ImageDraw
import json
p=Path('demo/assets/lobby');f=json.loads((p/'frames.json').read_text(encoding='utf-8'))
items=[(i,x) for i,x in enumerate(f) if 'MainEntry' in x['path'] or ('bg' in x['path'].lower() and x['rect'][2]>700) or ('entry' in x['path'].lower())]
sheet=Image.new('RGB',(1200,((len(items)+7)//8)*140),'#374668');d=ImageDraw.Draw(sheet)
for j,(i,x) in enumerate(items):
 im=Image.open(p/f'{i}.png');im.thumbnail((142,105));a=j%8*150;b=j//8*140;sheet.paste(im,(a,b),im);d.text((a,b+106),str(i)+' '+x['path'].split('/')[-1][:20],fill='white')
sheet.save(p/'selected.jpg')
