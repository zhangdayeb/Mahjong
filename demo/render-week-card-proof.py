"""Offline visual check of the same source model; the browser fixture is authoritative."""
from pathlib import Path
import json,math
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parent.parent
for variant in ['new','old']:
    model=json.loads((root/f'demo/week-card-study/{variant}-preview.json').read_text(encoding='utf-8'))
    w,h=model['width'],model['height'];s=model['scale']
    atlas=Image.open(root/'demo/assets/lobby/660.png').convert('RGBA');bw=round(atlas.width*h/atlas.height)
    bg=atlas.resize((bw,h));image=Image.new('RGBA',(w,h));image.alpha_composite(bg,(round((w-bw)/2),0));image.alpha_composite(Image.new('RGBA',(w,h),(0,0,0,200)))
    for node in model['records']:
        if not node['active'] or not node['opacity']:continue
        a,b,c,d,tx,ty=node['world']
        sx,sy=math.hypot(a,b)*s,math.hypot(c,d)*s;cx,cy=w/2+tx*s,h/2-ty*s
        overlay=Image.new('RGBA',(w,h));sp=node.get('sprite');label=node.get('label')
        if sp and sp.get('frame') and not sp['frame'].get('missing'):
            source=Image.open(root/'demo'/sp['frame']['image']).convert('RGBA');args=node['drawArgs'];rx,ry,rw,rh,dx,dy,dw,dh=args
            piece=source.crop((rx,ry,rx+rw,ry+rh)).resize((max(1,round(abs(dw*sx))),max(1,round(abs(dh*sy)))),Image.Resampling.LANCZOS)
            piece.putalpha(piece.getchannel('A').point(lambda alpha:round(alpha*node['opacity']/255)))
            localx,localy=dx+dw/2,dy+dh/2
            pcx,pcy=cx+(a*localx-c*localy)*s,cy+(-b*localx+d*localy)*s
            angle=math.degrees(math.atan2(b,a))
            if abs(angle)>1e-5:piece=piece.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC)
            overlay.alpha_composite(piece,(round(pcx-piece.width/2),round(pcy-piece.height/2)))
        if label:
            size=max(1,round(label['fontSize']*sy));font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',size)
            color=node['color'];fill=(color&255,(color>>8)&255,(color>>16)&255,round(node['opacity']))
            align=label['align'];x=cx if align==1 else cx-node['size'][0]*node['anchor'][0]*sx if align==0 else cx+node['size'][0]*(1-node['anchor'][0])*sx
            draw=ImageDraw.Draw(overlay);draw.text((x,cy),node['text'],font=font,fill=fill,anchor=['lm','mm','rm'][align])
        clip=node.get('clip')
        if clip:
            clipped=Image.new('RGBA',(w,h));box=(round(clip['x']),round(clip['y']),round(clip['x']+clip['width']),round(clip['y']+clip['height']))
            clipped.paste(overlay.crop(box),(box[0],box[1]));overlay=clipped
        image.alpha_composite(overlay)
    image.convert('RGB').save(root/f'demo/week-card-study/{variant}-proof.png')
    print(f'{variant} original prefab proof rendered.')
