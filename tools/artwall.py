"""Wall art (sheets a1 + a2): twelve pieces drawn in the room's own view, sticking out of the wall like the shelves (not sheared); the left wall mirrors them.
Per piece: the sheet, its place on it (reading order, 2 x 3), its depth d (how far it sticks out, in sheet pixels; 0 = hangs flat) and the wall width it should get.
The wall plane's rectangle is what the picture covers minus the depth strip: x from X0+d to X1, y from the top to the bottom - d/2; its centre is the anchor (the wall point the room puts at the item's place).
Writes the catalog lines (src, r = the wall rectangle around the anchor, im = where the picture goes relative to it). Run `python3 tools/artwall.py` from the repo root (idempotent)."""
import json, sys, math
import numpy as np, scipy.ndimage as nd
sys.path.insert(0, 'tools')
from PIL import Image
import items2, items4, shelves
ROOT = items4.ROOT
A = [  # id, sheet, no., hebrew, depth d, wall width
 ('art_rainbow',  'sheet-a1-art.jpg', 0, 'תמונה בשחור עץ: קשת וחד קרן', 30, 150), ('art_unicorn', 'sheet-a1-art.jpg', 1, 'תמונת חד קרן סגולה', 30, 100),
 ('art_canvas',   'sheet-a1-art.jpg', 2, 'קנבס ענני פסטל', 45, 125),   ('art_scroll123', 'sheet-a1-art.jpg', 3, 'גליל קשת 1 2 3', 0, 100),
 ('art_bunting',  'sheet-a1-art.jpg', 4, 'שרשרת דגלונים', 0, 175),      ('art_photos', 'sheet-a1-art.jpg', 5, 'חבל תמונות', 0, 150),
 ('art_oval',     'sheet-a2-art.jpg', 0, 'מסגרת זהב עם פפיון', 35, 100), ('art_banner', 'sheet-a2-art.jpg', 1, 'דגל כוכב וירח', 0, 100),
 ('art_porthole', 'sheet-a2-art.jpg', 2, 'חלון ים עם שמש', 45, 100),    ('art_heart', 'sheet-a2-art.jpg', 3, 'מסגרת לב וקאפקייק', 45, 100),
 ('art_castle',   'sheet-a2-art.jpg', 4, 'מסגרת טירת ממתקים', 30, 150),  ('art_rainbowarch', 'sheet-a2-art.jpg', 5, 'קשת עץ וענני צמר', 55, 150)]
def six(f):
    a = np.array(f).astype(float); W, H = f.size
    for dil in (8, 12, 16, 22, 30):
        lab, k = nd.label(nd.binary_dilation(a.min(2) < 235, iterations=dil))
        if k == 6: break
    else: raise SystemExit('expected 6 pictures, found %d' % k)
    sl = nd.find_objects(lab); key = lambda o: (((o[0].start+o[0].stop)/2 > H/2)*3 + min(2, int(((o[1].start+o[1].stop)/2)/(W/3))))
    sl.sort(key=key); assert [key(o) for o in sl] == [0, 1, 2, 3, 4, 5], 'pictures do not fill the 2 x 3 grid'
    return [(max(0, o[1].start-4), max(0, o[0].start-4), min(W, o[1].stop+4), min(H, o[0].stop+4)) for o in sl]
def main():
    sheets = {}; out = []
    for id_, fn, n, he, d, WW in A:
        if fn not in sheets: f = Image.open(ROOT + 'art/' + fn).convert('RGB'); sheets[fn] = (f, six(f))
        f, boxes = sheets[fn]; im = shelves.cut(f, boxes[n]); al = np.array(im)[..., 3] > 128; Hp, Wp = al.shape
        ys = np.where(al.any(1))[0]; xs = np.where(al.any(0))[0]; x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        Lw = x1 - x0 - d; sc = WW/Lw; Hb = (y1 - y0 - d/2); Hw = Hb - 0.5*Lw     # the wall plane's width, and its height (the slope eats half the width)
        mx = (x0 + d + x1)/2; my = (y0 + y1 - d/2)/2
        sz = (round(Wp*sc*items2.PX*2/1.5), round(Hp*sc*items2.PX*2/1.5)); src = items2.save(im.resize(sz, Image.LANCZOS))
        Hf = max(25.0, float(math.ceil(Hw*sc/25)*25))
        e = {'id': id_, 'n': he, 'p': 3, 'g': 'wall', 'wall': 1, 'solid': 1, 'src': src, 'r': [round(-WW/2, 1), round(-Hf/2, 1), float(WW), Hf],
             'im': [round(float(-mx*sc), 1), round(float(-my*sc), 1), round(Wp*sc, 1), round(Hp*sc, 1)]}
        out.append(e); print(id_, src, 'Hw', round(Hw*sc), e['r'], e['im'])
    if '--preview' in sys.argv: return
    p = ROOT + 'math-quest.html'; t = open(p, encoding='utf-8').read(); i = t.index('const ROOM_CATALOG = ['); j = t.index('\n];', i)
    body = [l for l in t[i:j].split('\n')[1:] if l.strip() and not any('"id":"%s"' % e['id'] in l for e in out)]
    lines = [l.rstrip(',') for l in body] + ['  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) for e in out]
    open(p, 'w', encoding='utf-8').write(t[:i] + 'const ROOM_CATALOG = [\n' + ',\n'.join(lines) + t[j:])
if __name__ == '__main__': main()
