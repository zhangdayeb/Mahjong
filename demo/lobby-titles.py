from PIL import Image
from pathlib import Path
import json
p=Path('demo/assets/lobby');font=json.loads((p/'title-font.json').read_text(encoding='utf-8'));atlas=Image.open(p/'title-font.png').convert('RGBA')
for name,text in [('classic','血流麻将'),('sanguo','三国麻将'),('zodiac','十二生肖'),('red','血流红中'),('match','赛事中心'),('collection','玩法合集'),('fun','娱乐')]:
 glyphs=[font['fontDefDictionary'][str(ord(c))] for c in text];im=Image.new('RGBA',(sum(g['xAdvance'] for g in glyphs),font['commonHeight']))
 x=0
 for g in glyphs:
  r=g['rect'];im.alpha_composite(atlas.crop((r['x'],r['y'],r['x']+r['width'],r['y']+r['height'])),(x+g['xOffset'],g['yOffset']));x+=g['xAdvance']
 im=im.crop(im.getbbox());im.save(p/f'title-{name}.png')
