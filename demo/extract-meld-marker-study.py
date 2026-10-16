import json,pathlib
from PIL import Image,ImageDraw
root=pathlib.Path('.')
frames=json.loads((root/'demo/meld-marker-study/frames.json').read_text(encoding='utf-8'))
textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
sheet=Image.new('RGB',(800,((len(frames)+3)//4)*140),'#32444e')
for i,f in enumerate(frames):
 im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False)
 tile=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.rotate(90,expand=True)
 ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/f['image'])
 thumb=Image.new('RGB',(200,140),'#32444e');canvas.thumbnail((185,100));thumb.paste(canvas,((200-canvas.width)//2,4),canvas);ImageDraw.Draw(thumb).text((5,110),f"{f['bundle']} {f['id']} {f['name']}",fill='white');sheet.paste(thumb,((i%4)*200,(i//4)*140))
sheet.save(root/'demo/meld-marker-study/contact.jpg');print('Extracted',len(frames),'native meld markers')
