from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parent
out=root/'assets/lobby'
frames=json.loads((out/'frames.json').read_text(encoding='utf-8'))
index={}
for i,f in enumerate(frames):
 im=Image.open(root.parent/f['texture']).convert('RGBA');x,y,w,h=f['rect']
 im=im.crop((x,y,x+h,y+w)).rotate(90,expand=True) if f.get('rotated') else im.crop((x,y,x+w,y+h))
 name=f'{i}.png';im.save(out/name)
 index[f['path']]={'file':name,'width':w,'height':h,'name':f.get('name'),'source':f['texture'],'rect':f['rect']}
(out/'index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding='utf-8')
for start in range(0,len(frames),160):
 subset=frames[start:start+160];sheet=Image.new('RGB',(1200,((len(subset)+9)//10)*110),'#384565');draw=ImageDraw.Draw(sheet)
 for j,f in enumerate(subset):
  im=Image.open(out/f'{start+j}.png');im.thumbnail((110,78));x=j%10*120;y=j//10*110
  sheet.paste(im,(x+(110-im.width)//2,y),im);draw.text((x+1,y+80),f'{start+j} '+f['path'].split('/')[-1][:15],fill='white')
 sheet.save(out/f'sheet-{start}.jpg')
print(len(frames))

