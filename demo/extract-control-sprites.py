import json,pathlib
from PIL import Image,ImageDraw
root=pathlib.Path('.')
frames=json.loads((root/'demo/control-study/frames.json').read_text(encoding='utf-8'))
exchange=root/'demo/control-study/exchange-frames.json'
if exchange.exists():frames+=json.loads(exchange.read_text(encoding='utf-8'))
textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
thumbs=[]
for f in frames:
 im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False);tile=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
 if rot:tile=tile.rotate(90,expand=True)
 ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/f['image'])
 thumb=Image.new('RGB',(180,145),'#455579');small=canvas.copy();small.thumbnail((170,107));thumb.paste(small,((180-small.width)//2,4),small);ImageDraw.Draw(thumb).text((5,115),f"{f['bundle']} {f['id']} {f['name']}",fill='white');thumbs.append(thumb)
cols=4;sheet=Image.new('RGB',(cols*180,((len(thumbs)+cols-1)//cols)*145),'#253250')
for i,t in enumerate(thumbs):sheet.paste(t,((i%cols)*180,(i//cols)*145))
sheet.save(root/'demo/control-study/contact.jpg');print('Extracted',len(frames),'sprites')
import shutil
aliases={'btn-hu.png':'game-422-hu.png','btn-peng.png':'game-141-peng.png','btn-gang.png':'game-1345-gang.png','btn-ting.png':'game-257-ting.png','btn-zimo.png':'game-876-zimo.png','btn-pass.png':'game-985-guo.png','btn-pass-legacy.png':'game-736-Btn_Guo.png','diamond.png':'resources-1897-zhizhen.png','diamond-ring.png':'resources-2101-ring_0421.png','diamond-glow.png':'resources-1532-a_point201a.png','diamond-spark.png':'resources-9-zhizhen_lizi.png','new-player-gift.png':'common-326-bag_icon.png'}
for target,source in aliases.items():shutil.copyfile(root/'demo/control-study/assets'/source,root/'demo/control-study'/target)
config=root/'demo/control-study/exchange-controls.json'
if config.exists():
 data=json.loads(config.read_text(encoding='utf-8'))
 shutil.copyfile(root/'demo'/data['images']['button'],root/'demo/control-study/btn-exchange.png')
 shutil.copyfile(root/'demo'/data['images']['background'],root/'demo/control-study/exchange-tip-bg.png')
