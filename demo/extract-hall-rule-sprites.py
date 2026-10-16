import json,pathlib
from PIL import Image
root=pathlib.Path('.')
frames=json.loads((root/'demo/hall-rule-study/frames.json').read_text(encoding='utf-8'))
textures={item['uuid']:item['file'] for item in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if item.get('downloaded')}
for frame in frames:
    image=Image.open(textures[frame['textureUUID']]);x,y,w,h=frame['rect'];rot=frame.get('rotated',False)
    crop=image.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
    if rot:crop=crop.rotate(90,expand=True)
    ow,oh=frame['originalSize'];ox,oy=frame.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh))
    canvas.paste(crop,(round((ow-w)/2+ox),round((oh-h)/2-oy)))
    canvas.save(root/'demo'/frame['image'])
print('Extracted',len(frames),'original hall rule sprites')
