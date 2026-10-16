import json,pathlib
from PIL import Image
root=pathlib.Path('.')
frames=json.loads((root/'demo/sanguo-guide-study/frames.json').read_text(encoding='utf-8'))
textures={item['uuid']:item['file'] for item in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if item.get('downloaded')}
missing=[]
for frame in frames:
    if frame['textureUUID'] not in textures:
        missing.append(frame['textureUUID']);continue
    texture=Image.open(textures[frame['textureUUID']]);x,y,w,h=frame['rect'];rot=frame.get('rotated',False)
    crop=texture.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
    if rot:crop=crop.rotate(90,expand=True)
    ow,oh=frame['originalSize'];ox,oy=frame.get('offset',[0,0]);image=Image.new('RGBA',(ow,oh))
    image.paste(crop,(round((ow-w)/2+ox),round((oh-h)/2-oy)));image.save(root/'demo'/frame['image'])
print(json.dumps({'frames':len(frames),'missingTextures':missing}))
if missing:raise RuntimeError('Original SGMJGuide texture missing')
