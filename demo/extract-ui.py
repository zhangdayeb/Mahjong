from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parent
out=root/'assets/reference'
frames=json.loads((out/'frames.json').read_text())
index={}
for frame in frames:
    image=Image.open(root.parent/frame['texture']).convert('RGBA')
    x,y,w,h=frame['rect']
    if frame.get('rotated'):
        cropped=image.crop((x,y,x+h,y+w)).rotate(90,expand=True)
    else:
        cropped=image.crop((x,y,x+w,y+h))
    filename=frame.get('exportName',f"ui-{frame['id']}.png")
    cropped.save(out/filename)
    index[frame['path']]={'file':filename,'width':w,'height':h,'source':frame['texture'],'rect':frame['rect'],'uuid':frame['uuid']}
(out/'ui-index.json').write_text(json.dumps(index,ensure_ascii=False,indent=2),encoding='utf-8')
items=list(index.items());sheet=Image.new('RGB',(900,((len(items)+7)//8)*110),'#304943');draw=ImageDraw.Draw(sheet)
for i,(key,item) in enumerate(items):
    x=i%8*112;y=i//8*110
    image=Image.open(out/item['file']);image.thumbnail((90,74));sheet.paste(image,(x+(100-image.width)//2,y),image)
    draw.text((x+2,y+78),str(key.split('/')[-1])[:17],fill='white')
sheet.save(out/'ui-sheet.jpg')
print('Extracted',len(index),'UI sprites from original atlases.')
