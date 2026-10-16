from pathlib import Path
from PIL import Image
import shutil, json

root = Path(__file__).resolve().parent
source = root.parent / 'asset-study/media'
target = root / 'assets'
(target / 'tiles').mkdir(parents=True, exist_ok=True)
(target / 'sounds').mkdir(parents=True, exist_ok=True)
atlas = Image.open(source / 'images/prefabs/3d/items/tile3DPrefabEx/mj.png').convert('RGBA')
for suit in range(3):
    for number in range(1, 10):
        atlas.crop(((number-1)*103, suit*148, number*103, (suit+1)*148)).save(target / 'tiles' / f'{suit+1}-{number}.png')
sounds = source / 'audio/audios/mjhj/audios/sound'
for name in ['select', 'outtile', 'draw', 'dingque', 'win', 'saizi']:
    shutil.copy2(sounds / 'EffectSound' / f'{name}.mp3', target / 'sounds' / f'{name}.mp3')
shutil.copy2(sounds / 'game_backMusic.mp3', target / 'sounds/music.mp3')
for suit, prefix in [(1, 'w'), (2, 's'), (3, 't')]:
    for number in range(1, 10):
        path = sounds / 'LanguageSound/SiChuanChinese/female' / f'{prefix}_{number}_1.mp3'
        if path.exists():
            shutil.copy2(path, target / 'sounds' / f'{suit}-{number}.mp3')
(target / 'sources.json').write_text(json.dumps({'origin':'https://www.zxwyouxi.com/g/100071273', 'tileAtlas':'prefabs/3d/items/tile3DPrefabEx/mj.png', 'audio':'audios/mjhj/audios/sound', 'note':'Collected client assets for local study. Geometry and demo rules are independently implemented; no original client JS runs.'}, ensure_ascii=False, indent=2), encoding='utf-8')
print('Prepared 27 tile faces and local audio assets.')
