#!/usr/bin/env python3
"""Colorable parts of the bed (step 4): builds one part-mask picture per bed level and the rainbow-unicorn pattern tile.

Run from the repository root:  python3 tools/parts.py     (then python3 tools/externalize.py is NOT needed: files are written to assets/ and assets.json updated here)
Prints the JSON that goes into ROOM_ART.bed[].mask / ROOM_PATTERNS.

Masks: a lossless picture the size of the bed picture; the colour of each pixel says which part it belongs to
  red = blanket, green = sheet, blue = pillow, yellow = curtains, black = nothing (wood, outlines, ornaments).
The parts are the connected patches of white linen in the art (the dark outlines separate them). Which patch is which part was decided by
looking at each level (the numbers below are the patch numbers of scipy.ndimage.label on the linen mask, in reading order).
Pattern: motifs cut from art/unicorn-bed-reference.png (Matan's Gemini blanket) and laid out as a seamless 280 x 280 tile on its blue.
"""
import hashlib, json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + os.sep
PART = {'blanket':(255,0,0), 'sheet':(0,255,0), 'pillow':(0,0,255), 'curtain':(255,255,0)}
# patch numbers per level (index 0 = level 1)
PATCHES = [
  {'blanket':[52], 'pillow':[39,42], 'sheet':[64]},
  {'blanket':[57], 'pillow':[45,50], 'sheet':[70]},
  {'blanket':[66], 'pillow':[56,58], 'sheet':[106,89]},
  {'blanket':[270,307], 'sheet':[285,291,314], 'pillow':[245], 'curtain':[33,30,150,210,207,142,263,272,313]},
  {'blanket':[207,200], 'sheet':[258,253,268,248], 'pillow':[158], 'curtain':[40,41,113,118,125,133,136,144,126,129,131,115,104,122,182,233,117,191]},
]
# a patch that touches another part through a thin bridge is cut apart: (level index, patch number, erosion, part for the pieces left of x_max)
# level 5: the mattress under the pillow (visible between the pillow and the blanket) was joined to the right-hand curtain; it belongs to the sheet
SPLITS = [(4, 182, 3, 'sheet', 170)]
def save_asset(img, ext='webp', **kw):
    import io
    b = io.BytesIO(); img.save(b, ext.upper(), **kw); raw = b.getvalue()
    name = hashlib.sha1(raw).hexdigest()[:12] + '.' + ext
    open(ROOT + 'assets/' + name, 'wb').write(raw); return 'assets/' + name
def masks():
    html = open(ROOT + 'math-quest.html', encoding='utf-8').read()
    seg = re.findall(r"bed:\[(.*?)\],\s*window", html, re.S)[0]
    srcs = re.findall(r"src:'(assets/[^']+)'", seg); out = []
    for lv, s in enumerate(srcs):
        a = np.array(Image.open(ROOT + s).convert('RGBA')).astype(int)
        mx = a[...,:3].max(2); mn = a[...,:3].min(2)
        lin = (a[...,3] > 128) & (mn > 170) & ((mx - mn) < 40)
        lab, n = ndi.label(lin)
        mask = np.zeros(a.shape[:2] + (3,), np.uint8); owner = np.zeros(a.shape[:2], int)   # owner: 0 none, else index+1
        names = list(PART)
        for pi, pn in enumerate(names):
            for k in PATCHES[lv].get(pn, []): owner[lab == k] = pi + 1
        for slv, k, it, part, xmax in SPLITS:
            if slv != lv: continue
            m = lab == k; core = ndi.binary_erosion(m, iterations=it); cl, cn = ndi.label(core)
            seeds = np.zeros(m.shape, int)   # 1 = the piece that changes part, 2 = the rest
            for j in range(1, cn + 1):
                xs = np.where(cl == j)[1]
                if len(xs) > 20: seeds[cl == j] = 1 if xs.mean() < xmax else 2
            _, (iy, ix) = ndi.distance_transform_edt(seeds == 0, return_indices=True)
            near = seeds[iy, ix]; owner[(m) & (owner == 0)] = 0
            owner[m & (near == 1)] = names.index(part) + 1
            for q, pn in enumerate(names):
                if pn == 'curtain': owner[m & (near == 2)] = q + 1
        light = (a[...,3] > 128) & (mn > 110)
        for _ in range(2):   # the anti-aliased rim of a patch belongs to it
            for pi in range(len(names)):
                grow = ndi.binary_dilation(owner == pi + 1) & light & (owner == 0)
                owner[grow] = pi + 1
        for pi, pn in enumerate(names): mask[owner == pi + 1] = PART[pn]
        out.append(save_asset(Image.fromarray(mask, 'RGB'), 'webp', lossless=True, quality=100))
        print('level', lv + 1, {pn: int((owner == i + 1).sum()) for i, pn in enumerate(names)}, file=sys.stderr)
    return out
def pattern():
    im = Image.open(ROOT + 'art/unicorn-bed-reference.png').convert('RGB')
    box = lambda x0,y0,x1,y1: im.crop((250 + x0//2, 380 + y0//2, 250 + x1//2, 380 + y1//2))   # coordinates of the 2x view used to pick the motifs
    bg = np.array(im.crop((470, 462, 490, 478))).reshape(-1, 3).mean(0)   # plain blue of the blanket
    def cut(b):
        c = np.array(b).astype(float); d = np.abs(c - bg).sum(2)
        m = (d > 40) & (c.sum(2) > 360);   # the dark brown of the bed frame/outline is never part of a motif
        m = ndi.binary_closing(m, iterations=2); m = ndi.binary_fill_holes(m); m = ndi.binary_dilation(m, iterations=1)
        lab, n = ndi.label(m); 
        if n > 1: sizes = ndi.sum(m, lab, range(1, n + 1)); m = lab == (1 + int(np.argmax(sizes)))
        al = ndi.gaussian_filter(m.astype(float), .7)
        rgba = np.dstack([c, al * 255]).astype(np.uint8); ys, xs = np.where(m)
        return Image.fromarray(rgba, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    motifs = {'pink':cut(box(210,142,350,220)), 'green':cut(box(455,95,590,190)), 'yellow':cut(box(120,220,235,345)),
              'rainbow':cut(box(370,210,480,300)), 'rainbow2':cut(box(270,268,385,355)), 'pink2':cut(box(535,240,695,332)),
              'green2':cut(box(410,348,565,430)), 'yellow2':cut(box(675,315,790,440))}
    T = 280; tile = Image.new('RGBA', (T, T), tuple(int(v) for v in bg) + (255,))
    layout = [('pink2',70,62),('rainbow',210,52),('yellow2',70,205),('green2',205,200),('rainbow2',140,135)]
    for k, cx, cy in layout:
        m = motifs[k]; tile.alpha_composite(m, (cx - m.width // 2, cy - m.height // 2))
    # four-point stars in the gaps
    from PIL import ImageDraw
    d = ImageDraw.Draw(tile)
    for sx, sy in [(140,25),(25,135),(255,130),(140,255),(25,255),(255,15)]:
        d.polygon([(sx,sy-6),(sx+2,sy-2),(sx+6,sy),(sx+2,sy+2),(sx,sy+6),(sx-2,sy+2),(sx-6,sy),(sx-2,sy-2)], fill=(250,250,255,255))
    return save_asset(tile.convert('RGB'), 'webp', lossless=True, quality=100), [int(v) for v in bg]
if __name__ == '__main__':
    old = re.findall(r"mask:'(assets/[^']+)'", open(ROOT + 'math-quest.html', encoding='utf-8').read())[:5]
    m = masks(); p, bg = pattern()
    h = open(ROOT + 'math-quest.html', encoding='utf-8').read()
    for o, n in zip(old, m): h = h.replace("mask:'" + o + "'", "mask:'" + n + "'", 1)
    open(ROOT + 'math-quest.html', 'w', encoding='utf-8').write(h)
    print(json.dumps({'masks': m, 'pattern': p, 'bg': bg}))
    names = sorted(f for f in os.listdir(ROOT + 'assets') if re.match(r'^[0-9a-f]{12}\.', f))
    json.dump(names, open(ROOT + 'assets.json', 'w'))
