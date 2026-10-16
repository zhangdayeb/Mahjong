import json
from pathlib import Path
from PIL import Image

root=Path('.')
frames=json.loads((root/'demo/zodiac-guide-study/frames.json').read_text(encoding='utf-8'))
textures={item['uuid']:item['file'] for item in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if item.get('downloaded')}
missing=[]
for frame in frames:
    if frame['textureUUID'] not in textures:
        missing.append(frame['textureUUID'])
        continue
    texture=Image.open(textures[frame['textureUUID']]).convert('RGBA')
    x,y,width,height=frame['rect']
    rotated=frame.get('rotated',False)
    crop=texture.crop((x,y,x+(height if rotated else width),y+(width if rotated else height)))
    if rotated:
        crop=crop.rotate(90,expand=True)
    original_width,original_height=frame['originalSize']
    offset_x,offset_y=frame.get('offset',[0,0])
    image=Image.new('RGBA',(original_width,original_height))
    image.paste(crop,(round((original_width-width)/2+offset_x),round((original_height-height)/2-offset_y)))
    image.save(root/'demo'/frame['image'])
print(json.dumps({'frames':len(frames),'missingTextures':missing}))
if missing:
    raise RuntimeError('Original zodiac guide textures missing')
