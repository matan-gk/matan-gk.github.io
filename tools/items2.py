#!/usr/bin/env python3
"""Adds the second batch of floor items (sheet A: furniture, rugs, instruments, board games; sheet B: toys) to ROOM_CATALOG in math-quest.html.
Run from the repository root: python3 tools/items2.py   (idempotent: items already in the catalog are replaced)
Cutting: tools/sheetcut.py. Baking: the magenta surface is repainted with the item's default color (`dc`) and the pot-style light level (`ref`) is stored so
the surface can be recolored later (paintItem). Placement on the floor: tools/ground.py's fit (spot items stand on their cell, solid items are fitted to their
footprint by their outline, flat items such as rugs are fitted to the footprint diamond exactly)."""
import hashlib, io, json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, '..') + os.sep
sys.path.insert(0, HERE)
import sheetcut
src_g = open(HERE + '/ground.py').read().split("report=[]")[0].replace("import os,sys", "import os,sys\nimport re,json\nfrom PIL import Image\nfrom scipy import ndimage as nd2", 1)
g = {'__file__': HERE + '/ground.py', 'np': np}; exec(src_g, g)
# id: (hebrew, price, group, fw, fd, width in room units (spot items only), default color or None, flat, part key)
S = {
'dollhouse':('בית בובות',8,'furniture',2,2,0,'#ef8a93',0,'dollhouse'),
'wardrobe':('ארון בגדים',6,'furniture',2,1,0,'#9ad0f5',0,'wardrobe'),
'wardrobe2':('ארון גדול',8,'furniture',2,1,0,'#b9a1e8',0,'wardrobe'),
'chair':('כיסא',3,'furniture',2,2,0,'#8fd3f4',0,'chair'),
'slide':('מגלשה',8,'play',1,3,0,'#ffcc5c',0,'slide'),
'slide3':('מגלשה נמוכה',6,'play',3,1,0,'#6db3f2',0,'slide'),
'track':('מסלול רכבת קטן',4,'play',1,1,100,'#e85d5d',0,'track'),
'track2':('מסלול רכבת עגול',4,'play',1,1,100,'#5aa9e6',0,'track'),
'trainset':('רכבת עץ',8,'play',1,1,112,'#e85d5d',0,'track'),
'table':('שולחן נמוך',5,'furniture',2,2,0,None,0,None),
'rug_sq':('שטיח מרובע קטן',3,'rugs',2,2,0,'#9fd8c8',1,'rug'),
'rug_sq2':('שטיח מרובע גדול',5,'rugs',3,3,0,'#f4b6c8',1,'rug'),
'rug_rd':('שטיח עגול קטן',3,'rugs',2,2,0,'#bfa8f0',1,'rug'),
'rug_rd2':('שטיח עגול גדול',5,'rugs',3,3,0,'#ffe08a',1,'rug'),
'rug_fluffy':('שטיח פרוותי',5,'rugs',2,2,0,'#ffc6dc',1,'rug'),
'globe':('גלובוס',4,'play',1,1,62,None,0,None),
'guitar':('גיטרה',5,'play',1,1,60,'#d9893b',0,'guitar'),
'guitar2':('גיטרה קלאסית',5,'play',1,1,60,'#8a4b2a',0,'guitar'),
'sax':('סקסופון',5,'play',1,1,62,None,0,None),
'mat':('דף ציור וטושים',2,'play',2,2,0,None,1,None),
'tictac':('איקס עיגול',3,'play',1,1,96,None,0,None),
'chess':('שחמט',4,'play',1,1,96,None,0,None),
'blocks':('קוביות בנייה',3,'play',1,1,84,None,0,None),
'soccer':('כדורגל',2,'play',1,1,60,None,0,None),
'basketball':('כדורסל',2,'play',1,1,60,None,0,None),
'car':('מכונית עם נהג',4,'play',1,1,92,'#6fb8f2',0,'car'),
'car2':('מכונית צעצוע',3,'play',1,1,92,'#ff7b7b',0,'car'),
'books':('ערימת ספרים',2,'play',1,1,70,None,0,None),
'books2':('ערימת ספרי קסם',2,'play',1,1,72,None,0,None),
'bookshelf':('ספרייה',6,'furniture',2,1,0,None,0,None),
'dressbox':('ארגז תחפושות',4,'play',2,2,0,'#c3a2f5',0,'dressbox'),
'easel':('כן ציור גדול',5,'play',1,1,96,None,0,None),
'easel2':('כן ציור',4,'play',1,1,92,None,0,None),
'puzzle':('פאזל חד קרן',3,'play',1,1,96,None,0,None),
'puzzle2':('פאזל קשת',3,'play',1,1,96,None,0,None),
'laptop':('מחשב נייד',4,'play',1,1,80,'#7fd0e8',0,'laptop'),
'laptop2':('מחשב נייד (שני)',4,'play',1,1,80,'#c8a2f0',0,'laptop'),
'lego':('לגו קשת',3,'play',1,1,100,None,0,None),
'monkey':('קוף',3,'play',1,1,74,'#b9824f',0,'monkey'),
'ladybug':('פרת משה רבנו',3,'play',1,1,76,'#e8473f',0,'ladybug'),
'bunny':('ארנב',3,'play',1,1,66,'#bcd7f5',0,'bunny'),
'bunny2':('ארנב פרווה',3,'play',1,1,62,'#ffd0e0',0,'bunny'),
}
PX = 1.5
def hexrgb(h): return np.array([int(h[i:i+2], 16) for i in (1,3,5)], float)
def bake(a, default):
    r,gg,b,al = [a[...,k] for k in range(4)]
    mn = np.minimum(r,b); mx = a[...,:3].max(2); sat = (mx-a[...,:3].min(2))/np.maximum(mx,1)
    core = (gg<0.5*mn)&(mn>120)&(al>200)
    loose = (gg<0.74*mn)&(mn>140)&(sat>0.28)&(al>0)
    l,n = nd.label(loose); keep = np.unique(l[core]); keep = keep[keep>0]
    m = np.isin(l,keep)&loose
    m = nd.binary_dilation(m,iterations=2)&(sat>0.12)&(r>gg+10)&(b>gg+10)&(al>0)
    if m.sum() < 40: return a, None, m
    lum = (r+b)/2/255; ref = float(np.percentile(lum[m],60)); f = np.clip(lum/ref,0,1.6)[...,None]
    o = a.copy(); o[m,:3] = np.clip(hexrgb(default)*f,0,255)[m]
    return o, ref, m
def save(img):
    b = io.BytesIO(); img.save(b, 'WEBP', quality=88, method=6); raw = b.getvalue()
    nm = hashlib.sha1(raw).hexdigest()[:12] + '.webp'; open(ROOT+'assets/'+nm, 'wb').write(raw); return 'assets/'+nm
def fit(path, fw, fd, flat, spot_w):
    a = Image.open(ROOT+path).convert('RGBA'); W, H = a.size; arr = np.array(a)[...,3] > 128; ys, xs = np.where(arr)
    if fw*fd == 1 and not flat:    # a spot item stands on the middle of its cell, 12 units below its centre
        w = spot_w; h = round(H*w/W, 1); return [round(-w/2,1), round(37-h,1), w, h], 0
    g2s = g['g2s']
    if flat:                        # fitted to the footprint diamond: its left, right, top and bottom points on the diamond's corners
        P = {'left':(xs.min(), ys[xs==xs.min()].mean()), 'right':(xs.max()+1, ys[xs==xs.max()].mean()), 'front':(xs[ys==ys.max()].mean(), ys.max()+1), 'back':(xs[ys==ys.min()].mean(), ys.min())}
        sx, sy, tx, ty, res = g['wfit'](P, fw, fd, .08, {})
        return [round(tx-500,1), round(ty-400,1), round(W*sx,1), round(H*sy,1)], max(res.values())
    P, sl = g['sil_pts'](path); a_, cols, bot = g['sil'](path); xmin, xmax = cols[0], cols[-1]+1
    sx = (fw+fd)*50*0.92/(xmax-xmin); ratio = min(1.2, max(0.8, 0.5/((abs(sl[0])+abs(sl[1]))/2))); sy = sx*ratio
    ctr = g2s(fw/2, fd/2); fr = g2s(fw-.04, fd-.04); tx = ctr[0]-sx*(xmin+xmax)/2; ty = fr[1]-sy*P['front'][1]
    return [round(tx-500,1), round(ty-400,1), round(W*sx,1), round(H*sy,1)], 0
def main():
    entries = []
    for n, sheet, box in sheetcut.ITEMS:
        name, price, grp, fw, fd, W0, dc, flat, pk = S[n]
        a = np.array(sheetcut.cut_soft(sheetcut.A, box) if n in ('track','track2','chair','chair2') else sheetcut.cut(sheetcut.A if sheet=='A' else sheetcut.B, box, n in sheetcut.HOLLOW, 0.25 if sheet=='A' else 0.015)).astype(float)
        H0, Wd = a.shape[:2]
        baked, ref, m = bake(a, dc) if dc else (a, None, None)
        if dc and ref is None: print('no magenta found in', n, '- not colorable', file=sys.stderr); dc = None
        wroom = W0 if W0 else (fw+fd)*50*0.95
        sz = (max(8, round(wroom*PX)), max(8, round(wroom*PX*H0/Wd)))
        im = lambda x: Image.fromarray(x.astype('uint8')).resize(sz, Image.LANCZOS)
        srcp = save(im(baked)); basep = save(im(a)) if dc else None
        r, res = fit(srcp, fw, fd, flat, W0)
        e = {'id':n, 'n':name, 'p':price, 'g':grp, 'fw':fw, 'fd':fd, 'src':srcp, 'base':basep, 'r':r}
        if flat: e['flat'] = 1
        if dc: e['dc'] = dc; e['ref'] = round(ref, 4)
        if pk: e['pk'] = pk
        entries.append(e); print(n, fw, fd, 'flat' if flat else '', r, 'fit' if res < 1 else 'res %.1f' % res, 'colorable' if dc else '', file=sys.stderr)
    # the telescope (from the furniture sheet, cut earlier) is a 2x2 piece now
    ta = np.array(Image.open(ROOT+'art/telescope-source.png').convert('RGBA')).astype(float); H0, Wd = ta.shape[:2]
    wroom = (2+2)*50*0.95; sz = (round(wroom*PX), round(wroom*PX*H0/Wd))
    sp = save(Image.fromarray(ta.astype('uint8')).resize(sz, Image.LANCZOS)); r, res = fit(sp, 2, 2, 0, 0)
    entries.append({'id':'telescope', 'n':'טלסקופ', 'p':4, 'g':'play', 'fw':2, 'fd':2, 'src':sp, 'base':None, 'r':r}); print('telescope 2x2', r, file=sys.stderr)
    h = open(ROOT+'math-quest.html', encoding='utf-8').read()
    i = h.index('const ROOM_CATALOG = ['); j = h.index('\n];', i); body = h[i:j]
    old = [x for x in re.findall(r'"id":"([a-z0-9_]+)"', body)]
    new_ids = {e['id'] for e in entries}
    kept = [l for l in body.split('\n') if not any('"id":"%s"' % k in l or ('id:"%s"' % k) in l for k in new_ids)]
    lines = [l.rstrip(',') for l in kept[1:] if l.strip()]
    lines += ['  ' + json.dumps(e, ensure_ascii=False, separators=(',',':')) for e in entries]
    h = h[:i] + 'const ROOM_CATALOG = [\n' + ',\n'.join(lines) + h[j:]
    open(ROOT+'math-quest.html', 'w', encoding='utf-8').write(h)
    print(json.dumps({'items': len(entries), 'price_sum': sum(e['p'] for e in entries)}))
if __name__ == '__main__': main()
