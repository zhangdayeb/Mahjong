import json,pathlib
from PIL import Image
root=pathlib.Path('.')
frames=json.loads((root/'demo/hall-activity-study/frames.json').read_text(encoding='utf-8'))
textures={item['uuid']:item['file'] for item in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if item.get('downloaded')}
missing=[]
for f in frames:
    if f['textureUUID'] not in textures:missing.append([f['uuid'],f['textureUUID']]);continue
    source=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False);crop=source.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
    if rot:crop=crop.rotate(90,expand=True)
    ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);out=Image.new('RGBA',(ow,oh));out.paste(crop,(round((ow-w)/2+ox),round((oh-h)/2-oy)));out.save(root/'demo'/f['image'])
print(json.dumps({'sprites':len(frames),'missingTextures':missing}))
