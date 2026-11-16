"""Wall shelves (sheets shelves and shelf-stacks): glass shelves drawn in the room's isometric view, sticking out of the wall, with their things on them.
Unlike the flat wall items (clock, map) they are NOT sheared: the picture is drawn as it is, anchored at the middle of the shelf's back edge on the wall; the left wall mirrors it.
Prints and patches the catalog lines: src, r (the wall rectangle in wall pixels around the anchor: width = the back edge, up = the highest point above the back edge, down = what hangs below it)
and im (where the picture goes, relative to the anchor). Run `python3 tools/shelves.py` from the repo root (idempotent)."""
import json, sys
import numpy as np, scipy.ndimage as nd
sys.path.insert(0, 'tools')
from PIL import Image
import items2, items4
ROOT = items4.ROOT
L_WALL = 180.0      # the back edge of every shelf, in wall pixels (the wall is 500 wide); one scale for all, from the single shelves
DEPTH = 0.075       # the slab's depth along the picture, as a share of its width (measured on the sheets)
S = [  # id, sheet file, picture no., hebrew, price
 ('shelf_crystal', 'sheet-shelves.jpg', 0, 'מדף קריסטלים', 4), ('shelf_tea', 'sheet-shelves.jpg', 1, 'מדף משקאות בועות', 4),
 ('shelf_ice', 'sheet-shelves.jpg', 2, 'מדף גלידות', 4), ('shelf_plush', 'sheet-shelves.jpg', 3, 'מדף בובות', 4),
 ('stack_tea', 'sheet-shelf-stacks.jpg', 0, 'מגדל משקאות בועות', 6), ('stack_ice', 'sheet-shelf-stacks.jpg', 1, 'מגדל גלידות', 6),
 ('stack_crystal', 'sheet-shelf-stacks.jpg', 2, 'מגדל קריסטלים וכוכבים', 6), ('stack_sweets', 'sheet-shelf-stacks.jpg', 3, 'מגדל ממתקים', 6)]
def quads(f):
    """the four pictures as boxes, in reading order (2 x 2): the separate blobs, each assigned to a quadrant by its centre"""
    a = np.array(f).astype(float); W, H = f.size
    for dil in (6, 10, 14, 20):
        fg = nd.binary_dilation(a.min(2) < 235, iterations=dil); lab, k = nd.label(fg)
        if k == 4: break
    else: raise SystemExit('expected 4 pictures, found %d' % k)
    sl = nd.find_objects(lab); key = lambda o: (((o[0].start+o[0].stop)/2 > H/2)*2 + ((o[1].start+o[1].stop)/2 > W/2))
    sl.sort(key=key); assert [key(o) for o in sl] == [0, 1, 2, 3], 'pictures do not fill the 2 x 2 quadrants'
    return [(max(0, o[1].start-4), max(0, o[0].start-4), min(W, o[1].stop+4), min(H, o[0].stop+4)) for o in sl]
def cut(im, box):
    sub = np.array(im.crop(box)).astype(float); mn = sub.min(2)
    white = mn > 243; lab, k = nd.label(white); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge)); fg = ~bg; l2, k2 = nd.label(fg)
    if k2 > 1: sz = nd.sum(fg, l2, range(1, k2+1)); fg = np.isin(l2, [j+1 for j, s in enumerate(sz) if s > 0.05*sz.max()])
    fg = nd.binary_opening(fg, iterations=1)
    al = np.clip(nd.gaussian_filter(fg.astype(float), 0.7)*1.6-0.3, 0, 1)
    out = np.dstack([sub, al*255]).astype('uint8'); ys, xs = np.where(al > 0.1)
    return Image.fromarray(out[ys.min():ys.max()+1, xs.min():xs.max()+1])
def geometry(im):
    """the back edge's two ends in picture pixels: the slab is thin and its left tip is the leftmost point; the depth runs up and to the right at 1:2"""
    al = np.array(im)[..., 3] > 128; H, W = al.shape; d = DEPTH*W
    col = np.where(al[:, :3].any(0))[0][0]; ys = np.where(al[:, col:col+3].any(1))[0]; yb0 = ys.min()   # the left tip of the slab
    a0 = (col + d, yb0 - d/2); a1x = np.where(al.any(0))[0][-1]; return a0, a1x
def main():
    sheets = {}; out = []; sc = None
    for id_, fn, n, he, price in S:
        if fn not in sheets: f = Image.open(ROOT + 'art/' + fn).convert('RGB'); sheets[fn] = (f, quads(f))
        f, boxes = sheets[fn]; im = cut(f, boxes[n]); (ax0, ay0), ax1 = geometry(im); Lp = ax1 - ax0
        if sc is None: sc = L_WALL/Lp   # the first shelf sets the scale for all (they are drawn at one size on the sheets)
        Wp, Hp = im.size; mid = (ax0 + ax1)/2; ymid = ay0 + 0.5*(mid - ax0)
        al = np.array(im)[..., 3] > 128; xs = np.arange(Wp); top = np.array([np.where(al[:, x])[0].min() if al[:, x].any() else 10**6 for x in xs]); bot = np.array([np.where(al[:, x])[0].max() if al[:, x].any() else -10**6 for x in xs])
        yback = ay0 + 0.5*(xs - ax0); sel = (xs >= ax0) & (xs <= ax1)
        up = float((yback[sel] - top[sel]).max()); down = float((bot[sel] - yback[sel]).max()); mid, ymid = float(mid), float(ymid)
        sz = (round(Wp*sc*items2.PX*2/1.5), round(Hp*sc*items2.PX*2/1.5)); src = items2.save(im.resize(sz, Image.LANCZOS))
        Hw = (up+down)*sc; cy = (down-up)/2*sc   # the wall rectangle is centred on the anchor like every wall item's (placement and overlap code assume it); the picture is moved to match
        e = {'id': id_, 'n': he, 'p': price, 'g': 'wall', 'wall': 1, 'solid': 1, 'src': src, 'r': [round(-L_WALL/2, 1), round(-Hw/2, 1), L_WALL, round(Hw, 1)],
             'im': [round(-mid*sc, 1), round(-ymid*sc - cy, 1), round(Wp*sc, 1), round(Hp*sc, 1)]}
        out.append(e); print(id_, src, e['r'], e['im'])
    if '--preview' in sys.argv: return
    p = ROOT + 'math-quest.html'; t = open(p, encoding='utf-8').read(); i = t.index('const ROOM_CATALOG = ['); j = t.index('\n];', i)
    body = [l for l in t[i:j].split('\n')[1:] if l.strip() and not any('"id":"%s"' % e['id'] in l for e in out)]
    lines = [l.rstrip(',') for l in body] + ['  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) for e in out]
    open(p, 'w', encoding='utf-8').write(t[:i] + 'const ROOM_CATALOG = [\n' + ',\n'.join(lines) + t[j:])
if __name__ == '__main__': main()
