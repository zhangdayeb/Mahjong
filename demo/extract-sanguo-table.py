import json,pathlib
from PIL import Image
root=pathlib.Path('.')
frames=json.loads((root/'demo/sanguo-table-study/frames.json').read_text(encoding='utf-8'))
for frame in frames:
    texture=Image.open(root/frame['texture']).convert('RGBA')
    x,y,w,h=frame['rect'];rotated=frame.get('rotated',False)
    crop=texture.crop((x,y,x+(h if rotated else w),y+(w if rotated else h)))
    if rotated:crop=crop.rotate(90,expand=True)
    ow,oh=frame['originalSize'];ox,oy=frame.get('offset',[0,0])
    image=Image.new('RGBA',(ow,oh))
    image.paste(crop,(round((ow-w)/2+ox),round((oh-h)/2-oy)))
    image.save(root/'demo'/frame['image'])
print(json.dumps({'originalFrames':len(frames),'output':'demo/sanguo-table-study/assets'}))
