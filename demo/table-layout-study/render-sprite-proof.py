"""Compare padded-PNG drawing with the native cc.Sprite trimmed rectangle."""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[2]
study = root / 'demo/table-layout-study'
source = json.loads((study / 'source.json').read_text(encoding='utf-8'))
frames = {f['key']: f for f in json.loads((study / 'frames.json').read_text(encoding='utf-8'))}
board = Image.new('RGBA', (840, 720), '#0e4945')
draw = ImageDraw.Draw(board)
draw.text((25, 15), 'Before: originalSize / atlas offset kept', fill='white')
draw.text((450, 15), 'After: native TRIMMED / rect centered', fill='white')

def sprite(key, trimmed):
    f = frames[key]
    image = Image.open(root / 'demo' / f['image']).convert('RGBA')
    if trimmed:
        _, _, w, h = f['rect']
        ow, oh = f.get('originalSize', [w, h])
        dx, dy = f.get('offset', [0, 0])
        x, y = round((ow - w) / 2 + dx), round((oh - h) / 2 - dy)
        image = image.crop((x, y, x + w, y + h))
    return image

def paint(image, x, y, sx, sy, skew=(0, 0)):
    a, d = sx, sy
    b, c = -d * math.tan(math.radians(skew[1])), -a * math.tan(math.radians(skew[0]))
    det = a * d - b * c
    ia, ib, ic, id_ = d / det, -c / det, -b / det, a / det
    coeff = (ia, ib, image.width / 2 - ia * x - ib * y,
             ic, id_, image.height / 2 - ic * x - id_ * y)
    board.alpha_composite(image.transform(board.size, Image.Transform.AFFINE, coeff, resample=Image.Resampling.BICUBIC))

for seat, cfg in enumerate(source['seats']):
    discard = cfg['discard']
    row = source['rows'][discard['rowPrefabs'][0]]
    param = row['params'][0]
    sx, sy = [n * discard['rowScaleStep'] * 2.7 for n in discard['scale']]
    cy = 125 + seat * 165
    draw.text((12, cy - 55), cfg['name'], fill='#b5e7dd')
    for column, trimmed in enumerate([False, True]):
        cx = 235 + column * 405
        paint(sprite(param['body'], trimmed), cx, cy, sx, sy)
        px, py = param['colorPos']
        fx, fy = cx + px * sx, cy - py * sy
        csx, csy = param['colorScale']
        paint(sprite(row['faces']['19'], trimmed), fx, fy, sx * csx, sy * csy, param['colorSkew'])
        draw.ellipse((fx - 2, fy - 2, fx + 2, fy + 2), fill='#ffc847')

draw.text((16, 700), 'Yellow dot: native color node center. Same body, position, scale, skew, and frame in both columns.', fill='#cae9e3')
board.convert('RGB').save(study / 'sprite-trim-proof.jpg', quality=95)
print('Saved sprite-trim-proof.jpg')
