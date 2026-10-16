import json,pathlib
from PIL import Image,ImageDraw
root=pathlib.Path('.')
frames=json.loads((root/'demo/action-result-study/frames.json').read_text(encoding='utf-8'))
textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
thumbs=[]
for frame in frames:
 image=Image.open(textures[frame['textureUUID']]);x,y,w,h=frame['rect'];rot=frame.get('rotated',False)
 tile=image.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.rotate(90,expand=True)
 ow,oh=frame['originalSize'];ox,oy=frame.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh))
 canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)))
 canvas.save(root/'demo'/frame['image'])
 thumb=Image.new('RGB',(210,160),'#204642');small=canvas.copy();small.thumbnail((200,120));thumb.paste(small,((210-small.width)//2,2),small)
 ImageDraw.Draw(thumb).text((5,130),f"{frame['bundle']} {frame['id']} {frame['name']}",fill='white');thumbs.append(thumb)
cols=5;sheet=Image.new('RGB',(cols*210,((len(thumbs)+cols-1)//cols)*160),'#16342e')
for i,thumb in enumerate(thumbs):sheet.paste(thumb,((i%cols)*210,(i//cols)*160))
sheet.save(root/'demo/action-result-study/contact.jpg')
print('Extracted',len(frames),'native result sprites')
