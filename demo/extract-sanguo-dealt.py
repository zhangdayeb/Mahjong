import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
study = root / 'demo/sanguo-table-study'
frames = json.loads((study / 'dealt-frames.json').read_text(encoding='utf-8'))
for frame in frames:
    texture = Image.open(root / frame['texture']).convert('RGBA')
    x, y, w, h = frame['rect']
    rotated = frame.get('rotated', False)
    cut = texture.crop((x, y, x + (h if rotated else w), y + (w if rotated else h)))
    if rotated:
        cut = cut.rotate(90, expand=True)
    ow, oh = frame['originalSize']
    dx, dy = frame.get('offset', [0, 0])
    image = Image.new('RGBA', (ow, oh))
    image.alpha_composite(cut, (round((ow-w)/2+dx), round((oh-h)/2-dy)))
    image.save(root / 'demo' / frame['image'])

target = Path('C:/Users/iphon/AppData/Local/Temp/codex-clipboard-48c3eeab-b2b4-47ad-b164-22958ed59e2b.png')
before = Path('C:/Users/iphon/AppData/Local/Temp/codex-clipboard-512d0e61-f791-4809-ad6c-45d8fd3a153e.png')
Image.open(target).save(study / 'references/dealt-target.png')
Image.open(before).save(study / 'references/dealt-before.png')
# Account pictures only; all map, tiles and controls come from native assets.
source = Image.open(target).convert('RGBA')
for name, bounds in [('front', (691, 36, 750, 95)), ('right', (875, 167, 935, 227))]:
    source.crop(bounds).save(study / f'assets/dealt-avatar-{name}.png')
print(json.dumps({'frames': len(frames), 'targetSize': source.size}))
