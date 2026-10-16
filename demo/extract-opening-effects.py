import json,pathlib,plistlib,shutil
from PIL import Image,ImageDraw
root=pathlib.Path('.')
frames=json.loads((root/'demo/opening-study/kaiju/frames.json').read_text(encoding='utf-8'))
textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
thumbs=[]
for f in frames:
 im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False);tile=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.rotate(90,expand=True)
 ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/f['image'])
 thumb=Image.new('RGB',(180,145),'#263647');small=canvas.copy();small.thumbnail((170,107));thumb.paste(small,((180-small.width)//2,4),small);ImageDraw.Draw(thumb).text((5,115),f"{f['id']} {f['name']}",fill='white');thumbs.append(thumb)
cols=5;sheet=Image.new('RGB',(cols*180,((len(thumbs)+cols-1)//cols)*145),'#253250')
for i,t in enumerate(thumbs):sheet.paste(t,((i%cols)*180,(i//cols)*145))
sheet.save(root/'demo/opening-study/kaiju/contact.jpg');print('Extracted',len(frames),'sprites')
native=root/'demo/control-study/raw/kaiju_lizi.plist'
if native.exists():
 shutil.copyfile(native,root/'demo/opening-study/kaiju/raw/kaiju_lizi.plist')
 data=plistlib.loads(native.read_bytes())
 (root/'demo/opening-study/kaiju/particle-native.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
