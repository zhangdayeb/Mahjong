import json,pathlib
from PIL import Image,ImageDraw

root=pathlib.Path('.')
frames=json.loads((root/'demo/desk-preview-study/frames.json').read_text(encoding='utf-8'))
textures={item['uuid']:item['file'] for item in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if item.get('downloaded')}
for frame in frames:
    image=Image.open(textures[frame['textureUUID']]);x,y,w,h=frame['rect'];rot=frame.get('rotated',False)
    crop=image.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
    if rot:crop=crop.rotate(90,expand=True)
    ow,oh=frame['originalSize'];ox,oy=frame.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh))
    canvas.paste(crop,(round((ow-w)/2+ox),round((oh-h)/2-oy)))
    canvas.save(root/'demo'/frame['image'])
metadata=json.loads((root/'demo/desk-preview-study/preview.json').read_text(encoding='utf-8'))
contact=Image.new('RGB',(800,3*380),'#182530')
for index,table in enumerate(metadata['tables']):
    frame=next(f for f in frames if f['uuid']==table['tree']['sprite']['frame'])
    image=Image.open(root/'demo'/frame['image']);image.thumbnail((800,360))
    contact.paste(image,((800-image.width)//2,index*380),image)
    ImageDraw.Draw(contact).text((8,index*380+361),str(table['config']['id'])+' '+table['config']['PrefabName'],fill='white')
contact.save(root/'demo/desk-preview-study/full-art-contact.png')
print('Extracted',len(frames),'original desk preview sprites')
