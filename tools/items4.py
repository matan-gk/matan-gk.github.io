#!/usr/bin/env python3
"""Adds sheets c2 (lights and music), c3 (learning and pets) and c4 (plushes, plants, rug) with their back pictures to ROOM_CATALOG.
  python3 tools/items4.py [--preview]     (from the repository root; idempotent)
Method of tools/items3.py (cut, bake the magenta part to a default colour, fit to the footprint, fit the back picture to the same footprint). Differences:
sheets with one picture or a 3x2 layout, a sheet cut by its grid lines (c4 back), the yellow floor diamond Gemini drew under the plush backs is removed,
the elephant's mat is removed as a large enclosed white area and its thin outline by a wider opening. The two wall items of sheet c4 (clock, treasure map) are not added: the room has no
wall-hanging yet; their pictures stay in art/sheet-c4-plush-plants-wall.jpg."""
import json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as nd
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import items2
ROOT = items2.ROOT
GU = int(re.search(r'const GU = (\d+);', open(ROOT + 'math-quest.html', encoding='utf-8').read()).group(1))
A = 'art/'
# sheet name: (front file, front layout, back file, back layout); layouts: ('blobs', n) the n separate pictures, ('grid', cols, rows) equal cells
SHEETS = {
 'c2': (A+'sheet-c2-lights-music.jpg', ('blobs', 9), A+'sheet-c2-music-back.jpg', ('blobs', 1)),
 'c3': (A+'sheet-c3-learning-pets.jpg', ('blobs', 9), A+'sheet-c3-back.jpg', ('blobs', 6)),
 'c4': (A+'sheet-c4-plush-plants-wall.jpg', ('blobs', 9), A+'sheet-c4-back.jpg', ('grid', 3, 2)),
}
# id: (sheet, picture no., hebrew, price, group, fw, fd (cells), spot width, default colour, part key, back picture no. or None, flat, big, options)
S = [
 ('cuplamp',  'c2', 0, 'מנורת קאפקייק',        3, 'play', 1, 1, 64,  '#f48fd0', 'cuplamp', None, 0, 6000, ''),
 ('starlamp', 'c2', 1, 'מנורת כוכב',           3, 'play', 1, 1, 70,  None, None, None, 0, 6000, ''),
 ('lavalamp', 'c2', 2, 'מנורת לבה',            3, 'play', 1, 1, 44,  None, None, None, 0, 6000, ''),
 ('disco',    'c2', 3, 'כדור דיסקו',           4, 'play', 1, 1, 72,  None, None, None, 0, 6000, ''),
 ('lightpole','c2', 4, 'עמוד אורות',           3, 'play', 1, 1, 120, None, None, None, 0, 6000, ''),
 ('crystal',  'c2', 5, 'כדור קסמים',           4, 'play', 1, 1, 64,  None, None, None, 0, 6000, ''),
 ('musicbox', 'c2', 6, 'קופסת נגינה',          3, 'play', 1, 1, 70,  None, None, 0, 0, 6000, ''),
 ('xylo',     'c2', 7, 'קסילופון',             3, 'play', 1, 1, 92,  '#f48fd0', 'xylo', None, 0, 6000, ''),
 ('drum',     'c2', 8, 'תוף',                  3, 'play', 1, 1, 70,  '#f48fd0', 'drum', None, 0, 6000, ''),
 ('abacus',   'c3', 0, 'חשבונייה',             3, 'play', 1, 1, 66,  None, None, None, 0, 6000, ''),
 ('register', 'c3', 1, 'קופה רושמת',           3, 'play', 1, 1, 74,  '#f48fd0', 'register', 0, 0, 6000, ''),
 ('microscope','c3', 2, 'מיקרוסקופ',           4, 'play', 1, 1, 62,  None, None, 1, 0, 6000, ''),
 ('magboard', 'c3', 3, 'לוח מגנטים',           4, 'play', 2, 1, 0,   '#f48fd0', 'magboard', 2, 0, 80000, ''),
 ('marblerun','c3', 4, 'מסלול גולות',          6, 'play', 2, 2, 0,   '#f48fd0', 'marblerun', 3, 0, 400, ''),
 ('robot',    'c3', 5, 'רובוט',                4, 'play', 1, 1, 70,  '#f48fd0', 'robot', 4, 0, 6000, ''),
 ('fishbowl', 'c3', 6, 'קערת דגים',            3, 'play', 1, 1, 66,  None, None, None, 0, 6000, ''),
 ('fishtank', 'c3', 7, 'אקווריום',             8, 'play', 2, 1, 0,   '#f48fd0', 'fishtank', 5, 0, 6000, 'lilac'),
 ('hamster',  'c3', 8, 'אוגר בכדור',           4, 'play', 1, 1, 74,  None, None, None, 0, 6000, ''),
 ('elephant', 'c4', 0, 'פיל קטיפה',            3, 'play', 1, 1, 66,  None, None, 0, 0, 800, 'thin'),
 ('sleepcat', 'c4', 1, 'חתולה ישנה',           3, 'play', 1, 1, 68,  None, None, 1, 0, 6000, ''),
 ('penguin',  'c4', 2, 'פינגווין קטיפה',       3, 'play', 1, 1, 58,  None, None, 2, 0, 6000, ''),
 ('sloth',    'c4', 3, 'עצלן על מוט',          4, 'play', 1, 1, 76,  None, None, 3, 0, 6000, ''),
 ('pl21',     'c4', 4, 'חמנייה',               2, 'plants', 1, 1, 78, '#f48fd0', 'POT', None, 0, 6000, ''),
 ('pl22',     'c4', 5, 'שיח תותים',            2, 'plants', 1, 1, 100, '#f48fd0', 'POT', None, 0, 6000, ''),
 ('rug_star', 'c4', 6, 'שטיח כוכב',            4, 'rugs', 2, 2, 0,   '#f9a8d4', 'rug', None, 1, 6000, ''),
]
def cells(im, lay):
    W, H = im.size
    if lay[0] == 'grid':
        cw, ch = W / lay[1], H / lay[2]; return [(int(c*cw)+6, int(r*ch)+6, int((c+1)*cw)-6, int((r+1)*ch)-6) for r in range(lay[2]) for c in range(lay[1])]
    a = np.array(im).astype(float)
    for dil in (6, 10, 14, 20):   # stray sparkles next to a picture join it when the grow is wider
        fg = nd.binary_dilation(a.min(2) < 235, iterations=dil); lab, k = nd.label(fg)
        if k == lay[1]: break
    else: raise SystemExit('expected %d pictures, found %d' % (lay[1], k))
    sl = nd.find_objects(lab); sl.sort(key=lambda o: (o[0].start + o[0].stop))   # by height, then split into rows
    n = lay[1]; cols = 3 if n > 3 else n; out = []
    for i in range(0, n, cols): out += sorted(sl[i:i+cols], key=lambda o: o[1].start)
    return [(max(0, o[1].start-4), max(0, o[0].start-4), min(W, o[1].stop+4), min(H, o[0].stop+4)) for o in out]
def cut4(im, box, big, thin=False):
    sub = np.array(im.crop(box)).astype(float); r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]; mn = sub.min(2)
    white = (mn > 226) | ((np.abs(r-g) < 7) & (np.abs(g-b) < 7) & (mn > 165))
    yellow = (r > 235) & (g > 212) & (b > 110) & (b < 200) & (b < g-30)   # the floor diamond Gemini drew under the back pictures of sheet c4
    lab, k = nd.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = nd.sum(white, lab, range(1, k+1)); bg = np.isin(lab, list(edge) + [j+1 for j, s in enumerate(sizes) if s > big]) | nd.binary_dilation(yellow, iterations=1)
    fg = nd.binary_opening(~bg, iterations=2 if thin else 1); l2, k2 = nd.label(fg)
    if k2 > 1:
        sz = nd.sum(fg, l2, range(1, k2+1)); fg = np.isin(l2, [j+1 for j, s in enumerate(sz) if s > 0.25*sz.max()])
    al = np.clip(nd.gaussian_filter(fg.astype(float), 0.7)*1.6-0.3, 0, 1)
    out = np.dstack([sub, al*255]).astype('uint8'); ys, xs = np.where(al > 0.1)
    return Image.fromarray(out[ys.min():ys.max()+1, xs.min():xs.max()+1])
def picture(sheet, n, fw, fd, dc, big, thin=False, lilac=False):
    a = np.array(cut4(sheet[0], sheet[1][n], big, thin)).astype(float); H0, Wd = a.shape[:2]
    baked, ref, m = items2.bake(a, dc) if dc else (a, None, None)
    if dc and ref is None and lilac:   # a pale lilac part (the aquarium's cabinet) instead of pure magenta
        r_, g_, b_, al = [a[..., k] for k in range(4)]; m = nd.binary_opening((r_ > g_+35) & (b_ > g_+35) & (r_ > 170) & (b_ > 190) & (al > 200), iterations=2)
        if m.sum() > 400:
            lum = (r_+b_)/2/255; ref = float(np.percentile(lum[m], 60)); f = np.clip(lum/ref, 0, 1.6)[..., None]; baked = a.copy(); baked[m, :3] = np.clip(items2.hexrgb(dc)*f, 0, 255)[m]
    if dc and ref is None: print('no magenta found in picture', n, file=sys.stderr); dc = None
    wroom = (fw+fd)*50*0.95; sz = (max(8, round(wroom*items2.PX)), max(8, round(wroom*items2.PX*H0/Wd)))
    im = lambda x: Image.fromarray(x.astype('uint8')).resize(sz, Image.LANCZOS)
    return items2.save(im(baked)), (items2.save(im(a)) if dc else None), ref, dc
def main():
    loaded = {}
    for k, (ff, fl, bf, bl) in SHEETS.items():
        f = Image.open(ROOT+ff).convert('RGB'); b = Image.open(ROOT+bf).convert('RGB'); loaded[k] = ((f, cells(f, fl)), (b, cells(b, bl)))
    entries = []
    for (id_, sh, n, he, price, grp, fw, fd, spot, dc, pk, bn, flat, big, opt) in S:
        fr, bk = loaded[sh]
        srcp, basep, ref, dc2 = picture(fr, n, fw, fd, dc, big, 'thin' in opt, 'lilac' in opt)
        r, res = items2.fit(srcp, fw, fd, flat, spot)
        e = {'id': id_, 'n': he, 'p': price, 'g': grp, 'fw': fw*GU, 'fd': fd*GU, 'src': srcp, 'base': basep, 'r': [float(v) for v in r]}
        if flat: e['flat'] = 1
        if dc2:
            e['ref'] = round(float(ref), 4)
            if pk != 'POT': e['dc'] = dc2; e['pk'] = pk
        else: e.pop('base')
        if bn is not None:
            bs, bb, bref, bdc = picture(bk, bn, fw, fd, dc2, big, sh == 'c4')
            br, bres = items2.fit(bs, fw, fd, flat, e['r'][2] if fw*fd == 1 else 0); b = {'src': bs, 'r': [float(v) for v in br]}
            if bb: b = {'src': bs, 'base': bb, 'ref': round(float(bref), 4), 'r': b['r']}
            e['back'] = b
        entries.append(e); print('%-10s %s fp %dx%d r=%s %s%s%s' % (id_, sh, fw, fd, e['r'], 'colourable ' if 'base' in e else '', 'back ' if 'back' in e else '', 'back-colour' if e.get('back', {}).get('base') else ''), file=sys.stderr)
    if '--preview' in sys.argv:
        for nm, key in (('front', 'src'), ('back', None)):
            ims = [Image.open(ROOT + (e[key] if key else e['back']['src'])).convert('RGBA') for e in entries if key or 'back' in e]
            ids = [e['id'] for e in entries if key or 'back' in e]
            cw = 260; cols = 6; rows = (len(ims)+cols-1)//cols; sh = Image.new('RGBA', (cols*cw, rows*cw), (150, 160, 175, 255))
            for i, im in enumerate(ims):
                im.thumbnail((cw-16, cw-16)); sh.alpha_composite(im, ((i % cols)*cw+(cw-im.width)//2, (i//cols)*cw+(cw-im.height)//2))
            sh.convert('RGB').save('/tmp/prev_%s.png' % nm); print(nm, ids)
        return
    h = open(ROOT + 'math-quest.html', encoding='utf-8').read()
    i = h.index('const ROOM_CATALOG = ['); j = h.index('\n];', i); body = h[i:j]; ids = {e['id'] for e in entries}
    kept = [l for l in body.split('\n') if not any('"id":"%s"' % k in l for k in ids)]
    lines = [l.rstrip(',') for l in kept[1:] if l.strip()] + ['  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) for e in entries]
    open(ROOT + 'math-quest.html', 'w', encoding='utf-8').write(h[:i] + 'const ROOM_CATALOG = [\n' + ',\n'.join(lines) + h[j:])
    print(json.dumps({'items': len(entries), 'price_sum': sum(e['p'] for e in entries)}))
if __name__ == '__main__': main()
