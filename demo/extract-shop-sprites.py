import json,pathlib
from PIL import Image,ImageDraw
root=pathlib.Path('.')
frames=json.loads((root/'demo/shop-study/frames.json').read_text(encoding='utf-8'))
textures={item['uuid']:item['file'] for item in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if item.get('downloaded')}
thumbs=[]
for frame in frames:
    image=Image.open(textures[frame['textureUUID']]);x,y,w,h=frame['rect'];rot=frame.get('rotated',False)
    crop=image.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
    if rot:crop=crop.rotate(90,expand=True)
    ow,oh=frame['originalSize'];ox,oy=frame.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(crop,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/frame['image'])
    if frame.get('path','').startswith('NewSkin/shop/'):
        thumb=Image.new('RGB',(150,160),'#304a61');small=canvas.copy();small.thumbnail((140,125));thumb.paste(small,((150-small.width)//2,2),small);ImageDraw.Draw(thumb).text((5,130),str(frame['id'])+' '+frame['name'],fill='white');thumbs.append(thumb)
cols=7;sheet=Image.new('RGB',(cols*150,((len(thumbs)+cols-1)//cols)*160),'#253141')
for i,thumb in enumerate(thumbs):sheet.paste(thumb,((i%cols)*150,(i//cols)*160))
sheet.save(root/'demo/shop-study/shop-contact.jpg')
print('Extracted',len(frames),'native shop sprites')
