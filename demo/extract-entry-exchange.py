import json,pathlib
from PIL import Image,ImageDraw
root=pathlib.Path('.')
frames=json.loads((root/'demo/opening-study/entry-exchange/frames.json').read_text(encoding='utf-8'))
textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
thumbnails=[]
for f in frames:
 im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False);tile=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.rotate(90,expand=True)
 ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/f['image'])
 thumb=Image.new('RGB',(200,145),'#455579');small=canvas.copy();small.thumbnail((190,105));thumb.paste(small,((200-small.width)//2,4),small);ImageDraw.Draw(thumb).text((5,115),f"{f['bundle']} {f['id']} {f['name']}",fill='white');thumbnails.append(thumb)
cols=4;sheet=Image.new('RGB',(cols*200,((len(thumbnails)+cols-1)//cols)*145),'#253250')
for i,thumb in enumerate(thumbnails):sheet.paste(thumb,((i%cols)*200,(i//cols)*145))
sheet.save(root/'demo/opening-study/entry-exchange/contact.jpg');print('Extracted',len(frames),'sprites')
