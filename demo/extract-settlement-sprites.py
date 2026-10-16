import json,pathlib
from PIL import Image,ImageDraw,ImageOps
root=pathlib.Path('.')
frames=json.loads((root/'demo/settlement-study/frames.json').read_text(encoding='utf-8'))
textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
thumbnails=[]
for f in frames:
 im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False)
 tile=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.rotate(90,expand=True)
 ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/f['image'])
 thumb=Image.new('RGB',(240,160),'#455579');tile=canvas.copy();tile.thumbnail((230,120));thumb.paste(tile,((240-tile.width)//2,5),tile);ImageDraw.Draw(thumb).text((7,130),f"{f['bundle']} {f['id']} {f['name']}",fill='white');thumbnails.append(thumb)
cols=4;sheet=Image.new('RGB',(cols*240,((len(thumbnails)+cols-1)//cols)*160),'#253250')
for i,thumb in enumerate(thumbnails):sheet.paste(thumb,((i%cols)*240,(i//cols)*160))
sheet.save(root/'demo/settlement-study/contact.jpg')
print('Extracted',len(frames),'sprites')
