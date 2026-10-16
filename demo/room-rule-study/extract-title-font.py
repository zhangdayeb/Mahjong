import json,pathlib
from PIL import Image
root=pathlib.Path('.')
data=json.loads((root/'demo/room-rule-study/native-title-font.json').read_text(encoding='utf-8'));f=data['frame']
textures={x['uuid']:x['file'] for x in json.loads((root/'asset-study/collected-manifest.json').read_text(encoding='utf-8')) if x.get('downloaded')}
im=Image.open(textures[f['textureUUID']]);x,y,w,h=f['rect'];rot=f.get('rotated',False)
tile=im.crop((x,y,x+(h if rot else w),y+(w if rot else h)))
if rot:tile=tile.rotate(90,expand=True)
ow,oh=f['originalSize'];ox,oy=f.get('offset',[0,0]);canvas=Image.new('RGBA',(ow,oh));canvas.paste(tile,(round((ow-w)/2+ox),round((oh-h)/2-oy)));canvas.save(root/'demo'/f['image'])
proof=Image.new('RGBA',(171,data['commonHeight']));cursor=0
for ch in data['text']:
 g=data['glyphs'][ch];r=g['rect'];glyph=canvas.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height']));proof.alpha_composite(glyph,(cursor+g['xOffset'],g['yOffset']));cursor+=g['xAdvance']
proof.save(root/'demo/room-rule-study/title-proof.png');print('Original title atlas',canvas.size,'text extent',cursor)
