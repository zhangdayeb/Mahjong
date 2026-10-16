import json
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent.parent
frames=json.loads((root/'demo/sanguo-table-study/play-frames.json').read_text(encoding='utf-8'))
created=0
for frame in frames:
    if not frame['image'].startswith('sanguo-table-study/assets/play-'):
        continue
    texture=Image.open(root/frame['texture']).convert('RGBA')
    x,y,w,h=frame['rect'];rotated=frame.get('rotated',False)
    cut=texture.crop((x,y,x+(h if rotated else w),y+(w if rotated else h)))
    if rotated:cut=cut.rotate(90,expand=True)
    ow,oh=frame['originalSize'];dx,dy=frame.get('offset',[0,0])
    image=Image.new('RGBA',(ow,oh));image.alpha_composite(cut,(round((ow-w)/2+dx),round((oh-h)/2-dy)))
    image.save(root/'demo'/frame['image']);created+=1
print(json.dumps({'frames':len(frames),'newNativePNGs':created}))
