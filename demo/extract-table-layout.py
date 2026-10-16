from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parent.parent
study = root / 'demo/table-layout-study'
frames = json.loads((study / 'frames.json').read_text(encoding='utf-8'))
for f in frames:
    atlas = Image.open(root / f['texture']).convert('RGBA')
    x, y, w, h = f['rect']
    cut = atlas.crop((x, y, x + (h if f.get('rotated') else w), y + (w if f.get('rotated') else h)))
    if f.get('rotated'):
        cut = cut.rotate(90, expand=True)
    ow, oh = f.get('originalSize', [w, h])
    dx, dy = f.get('offset', [0, 0])
    canvas = Image.new('RGBA', (ow, oh))
    canvas.alpha_composite(cut, (round((ow - w) / 2 + dx), round((oh - h) / 2 - dy)))
    target = root / 'demo' / f['image']
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(target)
print(f'Extracted {len(frames)} original table SpriteFrames.')
