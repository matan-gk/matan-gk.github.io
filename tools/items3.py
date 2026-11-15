#!/usr/bin/env python3
"""Adds the third batch of floor items (sheet c1: furniture and play structures) with their back views to ROOM_CATALOG in math-quest.html.
  python3 tools/items3.py        (run from the repository root; idempotent: items already in the catalog are replaced)
art/sheet-c1-furniture.jpg = the 9 front pictures, art/sheet-c1-back.jpg = the same 9 turned half way round (same cell order, None = not usable).
Same method as tools/items2.py (bake the magenta part to its default colour, fit to the footprint) and tools/backart.py (the back picture is fitted to the same
footprint as the front). Footprints below are in cells; the catalog stores units (x GU). See docs/personal-space/GEMINI_PROMPTS_BATCH3.md."""
import json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import items2
ROOT = items2.ROOT
GU = int(re.search(r'const GU = (\d+);', open(ROOT + 'math-quest.html', encoding='utf-8').read()).group(1))
# id: (hebrew, price, group, fw, fd (cells), spot width (1x1 items only), default colour, part key, has a usable back picture)
S = [
 ('beanbag',   'פוף',                    4, 'furniture', 2, 2, 0,  '#ff9ec7', 'beanbag',   1),
 ('tent',      'אוהל קריאה',             8, 'furniture', 3, 3, 0,  '#f48fd0', 'tent',      1),
 ('hammock',   'כיסא ערסל',              6, 'furniture', 2, 2, 0,  '#b9a1e8', 'hammock',   1),
 ('ktable',    'שולחן ילדים עם כיסאות',  6, 'furniture', 3, 2, 0,  '#6db3f2', 'kidchair',   0),   # the sheet's back picture has 2 chairs, the front has 3
 ('nstand',    'שידת לילה',              3, 'furniture', 1, 1, 84, '#ffcc5c', 'nstand',    1),
 ('toyshelf',  'מדף צעצועים',            5, 'furniture', 2, 1, 0,  '#9ad0f5', 'bins',      1),
 ('rhorse',    'סוס נדנדה',              5, 'play',      2, 1, 0,  '#ef8a93', 'horse',     0),   # the sheet's back picture is the front again
 ('swingset',  'נדנדות',                 8, 'play',      3, 2, 0,  '#ffcc5c', 'swing',     1),
 ('shopcounter','דוכן קאפקייקס',         7, 'furniture', 3, 1, 0,  '#ef8a93', 'awning',    1),
]
def cell(im, n):
    """the n-th picture's box (row by row): the 9 separate blobs on the white sheet"""
    a = np.array(im).astype(float); fg = nd.binary_dilation(a.min(2) < 235, iterations=6); lab, k = nd.label(fg)
    if k != 9: raise SystemExit('expected 9 pictures on the sheet, found %d' % k)
    sl = sorted(nd.find_objects(lab), key=lambda o: (min(2, int((o[0].start + o[0].stop) / 2 / (im.height / 3))), o[1].start)); o = sl[n]
    return (max(0, o[1].start-4), max(0, o[0].start-4), min(im.width, o[1].stop+4), min(im.height, o[0].stop+4))
def cut3(im, box, big=6000):
    """sheetcut.cut without filling holes: a white area closed inside the picture stays part of it (stripes, eyes) unless it is large (the gap in a frame)"""
    sub = np.array(im.crop(box)).astype(float); mn = sub.min(2)
    white = (mn > 226) | ((np.abs(sub[..., 0]-sub[..., 1]) < 7) & (np.abs(sub[..., 1]-sub[..., 2]) < 7) & (mn > 165))
    lab, k = nd.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = nd.sum(white, lab, range(1, k+1)); bg = np.isin(lab, list(edge) + [j+1 for j, s in enumerate(sizes) if s > big])
    fg = nd.binary_opening(~bg, iterations=1); l2, k2 = nd.label(fg)
    if k2 > 1:
        sz = nd.sum(fg, l2, range(1, k2+1)); fg = np.isin(l2, [j+1 for j, s in enumerate(sz) if s > 0.25*sz.max()])
    al = np.clip(nd.gaussian_filter(fg.astype(float), 0.7)*1.6-0.3, 0, 1)
    out = np.dstack([sub, al*255]).astype('uint8'); ys, xs = np.where(al > 0.1)
    return Image.fromarray(out[ys.min():ys.max()+1, xs.min():xs.max()+1])
# enclosed white areas bigger than this are air (gaps in a frame, a loop), smaller ones stay (stripes, eyes); per picture, measured on the sheets
BIG = {'beanbag': 100, 'hammock': 900, 'ktable': 200, 'rhorse': 1000, 'swingset': 300}
def picture(sheet, n, fw, fd, dc, big=6000):
    a = np.array(cut3(sheet, cell(sheet, n), big)).astype(float); H0, Wd = a.shape[:2]
    baked, ref, m = items2.bake(a, dc) if dc else (a, None, None)
    if dc and ref is None: print('no magenta found in picture', n, file=sys.stderr); dc = None
    wroom = (fw+fd)*50*0.95; sz = (max(8, round(wroom*items2.PX)), max(8, round(wroom*items2.PX*H0/Wd)))
    im = lambda x: Image.fromarray(x.astype('uint8')).resize(sz, Image.LANCZOS)
    return items2.save(im(baked)), (items2.save(im(a)) if dc else None), ref, dc
def main():
    front = Image.open(ROOT + 'art/sheet-c1-furniture.jpg').convert('RGB'); back = Image.open(ROOT + 'art/sheet-c1-back.jpg').convert('RGB')
    entries = []
    for n, (id_, he, price, grp, fw, fd, spot, dc, pk, hasback) in enumerate(S):
        srcp, basep, ref, dc2 = picture(front, n, fw, fd, dc, BIG.get(id_, 6000))
        r, res = items2.fit(srcp, fw, fd, 0, spot)
        e = {'id': id_, 'n': he, 'p': price, 'g': grp, 'fw': fw*GU, 'fd': fd*GU, 'src': srcp, 'base': basep, 'r': [float(v) for v in r]}
        if dc2: e['dc'] = dc2; e['ref'] = round(float(ref), 4); e['pk'] = pk
        if hasback:
            bs, bb, bref, bdc = picture(back, n, fw, fd, dc2, BIG.get(id_, 6000))
            br, bres = items2.fit(bs, fw, fd, 0, e['r'][2] if fw*fd == 1 else 0); b = {'src': bs, 'r': [float(v) for v in br]}
            if bb: b = {'src': bs, 'base': bb, 'ref': round(float(bref), 4), 'r': b['r']}
            e['back'] = b
        entries.append(e); print(id_, fw, fd, e['r'], 'fit' if res < 1 else 'res %.1f' % res, 'colourable' if dc2 else '', 'back' if hasback else '', file=sys.stderr)
    h = open(ROOT + 'math-quest.html', encoding='utf-8').read()
    i = h.index('const ROOM_CATALOG = ['); j = h.index('\n];', i); body = h[i:j]
    ids = {e['id'] for e in entries}
    kept = [l for l in body.split('\n') if not any('"id":"%s"' % k in l for k in ids)]
    lines = [l.rstrip(',') for l in kept[1:] if l.strip()] + ['  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) for e in entries]
    h = h[:i] + 'const ROOM_CATALOG = [\n' + ',\n'.join(lines) + h[j:]
    open(ROOT + 'math-quest.html', 'w', encoding='utf-8').write(h)
    print(json.dumps({'items': len(entries), 'price_sum': sum(e['p'] for e in entries)}))
if __name__ == '__main__': main()
