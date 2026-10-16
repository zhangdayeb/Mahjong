import json,pathlib,sys
from PIL import Image
root=pathlib.Path('.');textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
frames=json.loads(pathlib.Path(sys.argv[1]).read_text(encoding='utf-8'))
for f in frames:
 im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False);t=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:t=t.rotate(90,expand=True)
 ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(t,(round((ow-w)/2+ox),round((oh-h)/2-oy)));target=root/'demo'/f['image'];target.parent.mkdir(parents=True,exist_ok=True);canvas.save(target)
print('Extracted',len(frames),'sprites')
