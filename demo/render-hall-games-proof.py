"""Offline source layout check; actual browser screenshots remain authoritative."""
from pathlib import Path
import json,math
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parent.parent
for mode in ['match','fun','collection','sanguo','zodiac']:
    model=json.loads((root/f'demo/hall-games-study/{mode}-preview.json').read_text(encoding='utf-8'))
    w,h=model['width'],model['height'];s=model['scale'];image=Image.new('RGBA',(w,h),'#3a59ac')
    for node in model['records']:
        if not node['active'] or not node['opacity']:continue
        a,b,c,d,tx,ty=node['world'];sx,sy=math.hypot(a,b)*s,math.hypot(c,d)*s;cx,cy=w/2+tx*s,h/2-ty*s
        overlay=Image.new('RGBA',(w,h));sp=node.get('sprite');label=node.get('label')
        if sp and sp.get('frame') and not sp['frame'].get('missing'):
            source=Image.open(root/'demo'/sp['frame']['image']).convert('RGBA')
            for rx,ry,rw,rh,dx,dy,dw,dh in node['drawPatches']:
                if rw<=0 or rh<=0 or dw<=0 or dh<=0:continue
                piece=source.crop((rx,ry,rx+rw,ry+rh)).resize((max(1,round(abs(dw*sx))),max(1,round(abs(dh*sy)))),Image.Resampling.LANCZOS)
                piece.putalpha(piece.getchannel('A').point(lambda alpha:round(alpha*node['opacity']/255)))
                lx,ly=dx+dw/2,dy+dh/2;pcx,pcy=cx+(a*lx-c*ly)*s,cy+(-b*lx+d*ly)*s
                angle=math.degrees(math.atan2(b,a))
                if abs(angle)>1e-5:piece=piece.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC)
                overlay.alpha_composite(piece,(round(pcx-piece.width/2),round(pcy-piece.height/2)))
        if label:
            color=node['color'];fill=(color&255,(color>>8)&255,(color>>16)&255,round(node['opacity']));font=label.get('font');draw=ImageDraw.Draw(overlay)
            if font and font.get('config') and font.get('frame'):
                atlas=Image.open(root/'demo'/font['frame']['image']).convert('RGBA');config=font['config'];scale=label['fontSize']/font['size'];text=node['text'];glyphs=[config['fontDefDictionary'].get(str(ord(ch))) for ch in text];total=sum((glyph['xAdvance'] if glyph else font['size']/2)+label['spacing'] for glyph in glyphs)*scale
                cursor=-total/2 if label['align']==1 else node['size'][0]*(1-node['anchor'][0])-total if label['align']==2 else -node['size'][0]*node['anchor'][0];top=-config['commonHeight']*scale/2
                for char,glyph in zip(text,glyphs):
                    if glyph:
                        rect=glyph['rect'];gw,gh=rect['width'],rect['height']
                        if gw and gh:
                            piece=atlas.crop((rect['x'],rect['y'],rect['x']+gw,rect['y']+gh)).resize((max(1,round(gw*scale*sx)),max(1,round(gh*scale*sy))),Image.Resampling.LANCZOS)
                            overlay.alpha_composite(piece,(round(cx+(cursor+glyph['xOffset']*scale)*sx),round(cy+(top+glyph['yOffset']*scale)*sy)))
                    else:
                        fallback=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',max(1,round(label['fontSize']*sy)));draw.text((cx+cursor*sx,cy),char,font=fallback,fill=fill,anchor='lm')
                    cursor+=((glyph['xAdvance'] if glyph else font['size']/2)+label['spacing'])*scale
            else:
                size=max(1,round(label['fontSize']*sy));font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',size);align=label['align'];x=cx if align==1 else cx-node['size'][0]*node['anchor'][0]*sx if align==0 else cx+node['size'][0]*(1-node['anchor'][0])*sx
                draw.text((x,cy),node['text'],font=font,fill=fill,anchor=['lm','mm','rm'][align])
        clip=node.get('clip')
        if clip:
            clipped=Image.new('RGBA',(w,h));box=(round(clip['x']),round(clip['y']),round(clip['x']+clip['width']),round(clip['y']+clip['height']));clipped.paste(overlay.crop(box),(box[0],box[1]));overlay=clipped
        image.alpha_composite(overlay)
    image.convert('RGB').save(root/f'demo/hall-games-study/{mode}-proof.png')
    print(f'{mode} native layout proof rendered.')
