from pathlib import Path
from PIL import Image
import json
p=Path('demo/assets/entry');frames=json.loads(Path('demo/entry-frames.json').read_text(encoding='utf-8'))
for f in frames:
 tex=p/(f['textureUUID']+('.jpg' if f['name']=='img_login_bg' else '.png'))
 if not tex.exists():continue
 im=Image.open(tex).convert('RGBA');x,y,w,h=f['rect'];im=im.crop((x,y,x+h,y+w)).rotate(90,expand=True) if f.get('rotated') else im.crop((x,y,x+w,y+h))
 im.save(p/(f['name']+'.png'))
