import json,pathlib
from PIL import Image
root=pathlib.Path('.');frames=json.loads((root/'demo/guide-study/frames.json').read_text(encoding='utf-8'));textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
for f in frames:
 im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False);tile=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.rotate(90,expand=True)
 ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/f['image'])
print('Extracted',len(frames),'sprites')
