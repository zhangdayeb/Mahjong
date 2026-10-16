"""Read native sprites and renderer geometry; write static QA previews only."""
from pathlib import Path
import json,math
from PIL import Image,ImageDraw,ImageChops
root=Path(__file__).resolve().parents[2]
study=root/'demo/meld-study'
frames={f['uuid']:f for f in json.loads((study/'frames.json').read_text(encoding='utf-8'))}
index=json.loads((root/'demo/assets/reference/ui-index.json').read_text(encoding='utf-8'))
layout=json.loads((root/'demo/assets/reference/layout.json').read_text(encoding='utf-8'))
data=json.loads((study/'preview-geometry.json').read_text(encoding='utf-8'))
boundary_clips=[]
def native(uuid): return Image.open(root/'demo'/frames[uuid]['image']).convert('RGBA')
def sprite(key): return Image.open(root/'demo/assets/reference'/index[key]['file']).convert('RGBA')
def check_bounds(bounds,canvas):
    if bounds[0]<0 or bounds[1]<0 or bounds[2]>canvas.width or bounds[3]>canvas.height:
        boundary_clips.append({'scenario':scenario['count'],'seat':p,'bounds':bounds})

def paint(canvas,image,x,y,a=1,b=0,c=0,d=1):
    det=a*d-b*c
    if abs(det)<1e-7: return
    ia,ib,ic,id=d/det,-c/det,-b/det,a/det
    coeff=(ia,ib,image.width/2-ia*x-ib*y,ic,id,image.height/2-ic*x-id*y)
    bbox=image.getbbox()
    if bbox:
        points=[(x+a*(ix-image.width/2)+c*(iy-image.height/2),y+b*(ix-image.width/2)+d*(iy-image.height/2)) for ix in (bbox[0],bbox[2]) for iy in (bbox[1],bbox[3])]
        bounds=[min(p[0] for p in points),min(p[1] for p in points),max(p[0] for p in points),max(p[1] for p in points)]
        check_bounds(bounds,canvas)
    layer=image.transform(canvas.size,Image.Transform.AFFINE,coeff,resample=Image.Resampling.BICUBIC)
    canvas.alpha_composite(layer)
    return layer
collisions=[]
for scenario in data:
    board=Image.open(root/'demo/assets/reference/desk.jpg').convert('RGBA').resize((1280,640))
    draw=ImageDraw.Draw(board)
    draw.text((430,250),f"{scenario['count']} MELD GROUP(S) PER SEAT",fill='white')
    draw.text((425,275),'Native bodies/faces; stacked kongs; hand follows CPG edge',fill='white')
    meld_masks=[Image.new('RGBA',(1280,640)) for _ in range(4)]
    hand_masks=[Image.new('RGBA',(1280,640)) for _ in range(4)]
    for p,seat in enumerate(scenario['seats']):
        ox,oy=seat['anchor']
        for t in seat['placements']:
            nsx,nsy=t['nodeScale'];sx=nsx*t['tileScale'];sy=nsy*t['tileScale']
            x=ox+t['pos'][0]*nsx;y=oy-t['pos'][1]*nsy
            layer=paint(board,native(t['body']),x,y,sx,0,0,sy)
            meld_masks[p].alpha_composite(layer)
            if t['face']:
                fx=x+t['colorPos'][0]*sx;fy=y-t['colorPos'][1]*sy
                a=sx*t['colorScale'][0];d=sy*t['colorScale'][1]
                b=-d*math.tan(math.radians(t['colorSkew'][1]));c=-a*math.tan(math.radians(t['colorSkew'][0]))
                paint(board,native(t['face']),fx,fy,a,b,c,d)
        hx,hy=seat['handStart'];step=seat['step']
        if p:
            direction={1:3,2:2,3:1}[p]
            for i in range(seat['remaining']):
                im=sprite(layout['hands'][str(direction)]['frames'][min(i,12)])
                scale=.85 if p==2 else 1.1
                layer=paint(board,im,hx+i*step[0],hy+i*step[1],-scale if p==1 else scale,0,0,scale)
                hand_masks[p].alpha_composite(layer)
        else:
            for i in range(seat['remaining']):
                x=hx-30.5+i*62
                body=sprite('hand/img_normal_card').resize((61,101))
                check_bounds([round(x),535,round(x)+body.width,535+body.height],board)
                board.alpha_composite(body,(round(x),535))
                hand_masks[p].alpha_composite(body,(round(x),535))
                face=sprite(f'hand/img_tile_1_{i%9+1}');face.thumbnail((47,75))
                fx=round(x+7+(47-face.width)/2);fy=round(547+(75-face.height)/2)
                check_bounds([fx,fy,fx+face.width,fy+face.height],board)
                board.alpha_composite(face,(fx,fy))
        draw.ellipse((hx-3,hy-3,hx+3,hy+3),fill='#ffdf28')
    suffix=scenario.get('suffix','')
    board.convert('RGB').save(study/f"preview-{scenario['count']}-groups{suffix}.jpg",quality=94)
    for h in range(4):
        for m in range(4):
            overlap=ImageChops.multiply(hand_masks[h].getchannel('A'),meld_masks[m].getchannel('A'))
            bbox=overlap.getbbox()
            if bbox:
                pixels=sum(v for i,v in enumerate(overlap.histogram()) if i>0)
                collisions.append({'scenario':scenario['count'],'handSeat':h,'meldSeat':m,'opaqueOverlapPixels':pixels,'bbox':bbox})
(study/'preview-collisions.json').write_text(json.dumps(collisions,indent=2),encoding='utf-8')
(study/'preview-boundary-clips.json').write_text(json.dumps(boundary_clips,indent=2),encoding='utf-8')
print('Static all-seat meld and concealed-hand previews saved.')
