"""The five windows (sheets w1 + w2): drawn in the room's own view, sticking out of the wall, like the shelves (not sheared); the left wall mirrors them.
Anchor = the middle of the sill's back edge on the wall (the front-bottom corner of the sill is the lowest pixel, the sill's depth is how far its right tip lies beyond it).
Level order (3 and 4 swapped on purpose: the carved arch is the better 4th): 1 square, 2 casement, 3 plain half-round arch, 4 carved arch, 5 ornate stained glass.
Prints and patches ROOM_ART.window = {src, w, h, ax, ay (the wall rectangle: width, height, anchor from its left / top: ay = h, the sill is at WIN_SILL), im (the picture relative to the anchor), sill (sill length in grid units, its top above the wall's sill line)}.
Run `python3 tools/windows.py` from the repo root (idempotent)."""
import sys, re, json
import numpy as np, scipy.ndimage as nd
sys.path.insert(0, 'tools')
from PIL import Image
import items2, items4, shelves
ROOT = items4.ROOT
UNIT = 25      # wall pixels per grid unit
ORDER = [('sheet-w2-windows-b.jpg', 0, 200), ('sheet-w2-windows-b.jpg', 1, 200), ('sheet-w1-windows-a.jpg', 0, 200), ('sheet-w2-windows-b.jpg', 2, 200), ('sheet-w1-windows-a.jpg', 1, 250)]   # sheet, picture no. (left to right), wall width of the back edge
def blobs(f):
    a = np.array(f).astype(float); W, H = f.size
    lab, k = nd.label(nd.binary_dilation(a.min(2) < 235, iterations=10)); sl = sorted(nd.find_objects(lab), key=lambda o: o[1].start)
    return [(max(0, o[1].start-4), max(0, o[0].start-4), min(W, o[1].stop+4), min(H, o[0].stop+4)) for o in sl]
def main():
    sheets = {}; out = []
    for fn, n, WW in ORDER:
        if fn not in sheets: f = Image.open(ROOT + 'art/' + fn).convert('RGB'); sheets[fn] = (f, blobs(f))
        f, boxes = sheets[fn]; im = shelves.cut(f, boxes[n]); al = np.array(im)[..., 3] > 128; Hp, Wp = al.shape
        low = np.where(al.any(1))[0].max(); lx = np.where(al[low-2:low+1].any(0))[0].mean()
        x0 = np.where(al.any(0))[0].min(); x1 = np.where(al[max(0, low-55):].any(0))[0].max()   # the sill's front-left tip and its back-right tip
        d = x1 - lx; Lb = x1 - x0 - d; sc = WW/Lb
        ybr = low - d/2                                  # the back edge's right end (its bottom)
        a0 = x0 + d; mx = (a0 + x1)/2; my = ybr - 0.25*Lb
        xs = np.arange(Wp); top = np.array([np.where(al[:, x])[0].min() if al[:, x].any() else 10**6 for x in xs]); yback = ybr - 0.5*(x1 - xs)
        sel = (xs >= a0) & (xs <= x1); up = float((yback[sel] - top[sel]).max())
        sz = (round(Wp*sc*items2.PX*2/1.5), round(Hp*sc*items2.PX*2/1.5)); src = items2.save(im.resize(sz, Image.LANCZOS))
        h = round(float(up*sc), 1); lu = WW//UNIT
        e = {'src': src, 'w': float(WW), 'h': h, 'ax': WW/2, 'ay': h, 'im': [round(float(-mx*sc), 1), round(float(-my*sc), 1), round(Wp*sc, 1), round(Hp*sc, 1)], 'sill': lu}
        out.append(e); print(fn, n, 'd', round(d,1), 'Lb', round(Lb,1), 'sc', round(sc,3), e)
    if '--preview' in sys.argv: return
    p = ROOT + 'math-quest.html'; t = open(p, encoding='utf-8').read()
    js = 'window:[' + ','.join('{' + ','.join("%s:%s" % (k, ("'%s'" % v) if isinstance(v, str) else json.dumps(v, separators=(',', ':'))) for k, v in e.items()) + '}' for e in out) + ']'
    t2 = re.sub(r"window:\[\{src:'assets/[^\]]*\}\]", lambda m: js, t, count=1); assert t2 != t or js in t
    open(p, 'w', encoding='utf-8').write(t2)
if __name__ == '__main__': main()
