"""Things on furniture, phase 3: measures where each host's top really is in its picture.

For every host (table, desk, toy boxes) the top face is cut out of the sprite (colour flood fill with outline barriers; a seed point per picture),
its convex hull gives the height z of the top plane: the face is the footprint rectangle (plus a symmetric overhang) lifted by z, so
  z = 25 * (footprint width - (a_min + a_max))   and the same with the depth, where a,b are the face's iso coordinates measured at z = 0.
The two estimates (width and depth) must agree. For the bed (5 levels) the picture's mattress (blanket + sheet masks) is matched with the lifted,
sideways-shifted footprint diamond (z, ox), and a bed cell may take a thing only if at least 60% of that cell on the top plane is blanket or sheet (and < 50% pillow):
that is the visible part of the top (frame, curtains and footboard cover the rest).

  python3 tools/surfaces.py            measure and write math-quest.html (catalog `top` of the hosts, BED_TOP)
  python3 tools/surfaces.py --check    only check that the page's numbers still match the pictures (tests/surfacegroundtest.js runs this)
"""
import re, json, sys, os
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.spatial import ConvexHull
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
HTML = ROOT + 'math-quest.html'
GU = int(re.search(r'const GU = (\d+);', open(HTML, encoding='utf-8').read()).group(1))   # grid units per old cell: catalog fw x fd are in units, the measuring is in cells
# seed (fraction of the picture width, height) inside each top face; tol = colour tolerance, grad = outline barrier (None: dark pixels only)
HOSTS = {'table': dict(seed=None, tol=28), 'desk': dict(seed=None, tol=28),
         'toybox1': dict(seed=(.49, .29), tol=22, grad=10), 'toybox2': dict(seed=(.49, .27), tol=22, grad=10), 'toybox3': dict(seed='purple', tol=30)}
TOL_Z = {'toybox3': 10}      # the strapped chest's lid is cut in pieces; its two estimates differ a little
# the bed's top plane per level (z, ox), found by matching the diamond to the mattress (see bed_fit) and checked by eye
BED_PARAMS = {1: (66, 32), 2: (64, 30), 3: (84, 18), 4: (52, 39), 5: (82, 40)}

def load():
    h = open(HTML, encoding='utf-8').read()
    cat = {}
    for m in re.finditer(r'^  (\{"id":"([a-z0-9_]+)".*\}),?$', h, re.M): cat[m.group(2)] = json.loads(m.group(1))
    seg = re.findall(r"ROOM_ART = \{bed:\[(.*?)\],\s*window", h, re.S)[0]
    arts = re.findall(r"\{src:'(assets/[^']+)',mask:'(assets/[^']+)',fp:\[(\d+),(\d+)\],r:\[([-\d.]+),([-\d.]+),([\d.]+),([\d.]+)\]\}", seg)
    return h, cat, arts

def face(c, o):
    im = np.array(Image.open(ROOT + c['src']).convert('RGBA')).astype(float); r = c['r']; S = im.shape[1] / r[2]
    al = im[..., 3] > 128; lum = im[..., :3].mean(2)
    if o['seed'] is None:
        ys, xs = np.where(al); y0 = ys.min(); sx = int(xs[ys == y0].mean()); sy = int(y0 + 14 * S * .5 + 6)
    elif o['seed'] == 'purple':
        sy, sx = int(.27 * im.shape[0]), int(.36 * im.shape[1])
    else:
        sy, sx = int(o['seed'][1] * im.shape[0]), int(o['seed'][0] * im.shape[1])
    col = im[sy-2:sy+3, sx-2:sx+3, :3].reshape(-1, 3).mean(0); d = np.abs(im[..., :3] - col).max(2)
    if o['seed'] == 'purple':   # all the lid's purple pieces in the upper half; the straps between them are covered by the hull
        m = (d < o['tol']) & al; m[int(.5 * im.shape[0]):] = False; m = nd.binary_opening(m, iterations=2)
        l, n = nd.label(m); sz = nd.sum(m, l, range(1, n + 1)); mk = np.isin(l, [j + 1 for j, s in enumerate(sz) if s > 300])
    else:
        bar = (lum < 95)
        if o.get('grad'): bar |= nd.binary_dilation(np.hypot(nd.sobel(lum, 0), nd.sobel(lum, 1)) / 8 > o['grad'], iterations=1)
        m = (d < o['tol']) & al & ~bar; l, n = nd.label(m); mk = nd.binary_closing(l == l[sy, sx], iterations=3 if o.get('grad') else 2)
    yy, xx = np.where(mk); pts = np.c_[xx, yy] / S + np.array([r[0], r[1]])
    return pts[ConvexHull(pts).vertices]

def lift_est(c, hull):
    a = (hull[:, 1] / 25 + hull[:, 0] / 50) / 2; b = (hull[:, 1] / 25 - hull[:, 0] / 50) / 2
    fw, fd = c['fw'] / GU, c['fd'] / GU
    return 25 * (fw - (a.min() + a.max())), 25 * (fd - (b.min() + b.max())), 50 * ((a.min() + a.max()) / 2 - (fw / 2 - 0))   # (z by width, z by depth, unused)

def inside(poly, p):
    return ImageDraw.Draw(Image.new('L', (1, 1))) and _pip(poly, p)
def _pip(poly, p):
    x, y = p; n = len(poly); ok = False
    for i in range(n):
        x1, y1 = poly[i]; x2, y2 = poly[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: ok = not ok
    return ok

def cell_center(c_x, c_y, z, ox): return (50 * (c_x + .5 - c_y - .5) + ox, 25 * (c_x + .5 + c_y + .5) - z)

def host_top(idn, c, cat):
    hull = face(c, HOSTS[idn]); za, zb, _ = lift_est(c, hull); z = round((za + zb) / 2)
    cx, cy, cw, cd = c['top']['c']
    bad = [(i, j) for i in range(cx, cx + cw) for j in range(cy, cy + cd) if not _pip(hull.tolist(), cell_center(i, j, z, 0))]
    return dict(z=z, za=za, zb=zb, hull=hull, bad_cells=bad)

def bed_regions(m):
    mk = np.array(Image.open(ROOT + m).convert('RGB')).astype(int); R, G, B = mk[..., 0], mk[..., 1], mk[..., 2]
    bs = ((R > 200) & (G < 80) & (B < 80)) | ((G > 200) & (R < 80) & (B < 80)); pl = (B > 200) & (R < 80) & (G < 80)
    return nd.binary_closing(bs, iterations=3), pl

def bed_cells(lv, arts):
    s, m, fw, fd, *r = arts[lv - 1]; fw, fd = int(fw), int(fd); r = [float(x) for x in r]
    bs, pl = bed_regions(m); H, W = bs.shape; S = W / r[2]; z, ox = BED_PARAMS[lv]; cells = []; cov = {}
    for cy in range(fd):
        for cx in range(fw):
            im = Image.new('L', (W, H), 0)
            ImageDraw.Draw(im).polygon([((50 * (cx + a - cy - b) + ox - r[0]) * S, (25 * (cx + a + cy + b) - z - r[1]) * S) for a, b in [(0, 0), (1, 0), (1, 1), (0, 1)]], fill=1)
            dm = np.array(im) > 0; cv = (dm & bs).sum() / dm.sum(); cp = (dm & pl).sum() / dm.sum(); cov[(cx, cy)] = (round(float(cv), 2), round(float(cp), 2))
            if cv >= .6 and cp < .5: cells.append([cx, cy])
    return z, ox, cells, cov

def main():
    check = '--check' in sys.argv
    h, cat, arts = load(); fails = []; new = {}
    for idn in HOSTS:
        c = cat[idn]; t = host_top(idn, c, cat); tol = TOL_Z.get(idn, 4)
        agree = abs(t['za'] - t['zb']) <= 2 * tol
        print(f"{idn:10s} z by width {t['za']:.1f}, by depth {t['zb']:.1f} -> {t['z']}   page has {c['top']['z']}   cells off the face: {t['bad_cells']}")
        if not agree: fails.append(f'{idn}: the two z estimates differ ({t["za"]:.1f} / {t["zb"]:.1f})')
        if abs(t['z'] - c['top']['z']) > tol: fails.append(f"{idn}: z on the page is {c['top']['z']}, the picture says {t['z']}")
        if t['bad_cells']: fails.append(f"{idn}: top cells {t['bad_cells']} are not on the top face")
        new[idn] = t['z']
    bed = {}
    for lv in range(1, 6):
        z, ox, cells, cov = bed_cells(lv, arts); bed[lv] = (z, ox, cells)
        print(f"bed {lv}: z {z} ox {ox} cells {cells}")
    page = re.search(r'const BED_TOP = (\{.*?\});', h, re.S).group(1)
    want = '{' + ', '.join(f"{lv}:{{c:[0,0,{int(arts[lv-1][2])},{int(arts[lv-1][3])}], z:{z}, ox:{ox}, cells:{json.dumps(cells, separators=(',', ':'))}}}" for lv, (z, ox, cells) in bed.items()) + '}'
    if check:
        if re.sub(r'\s+', '', page) != re.sub(r'\s+', '', want): fails.append('BED_TOP on the page differs from the measured one: run python3 tools/surfaces.py')
        print('FAIL' if fails else 'OK'); [print('  ' + f) for f in fails]; sys.exit(1 if fails else 0)
    # write: catalog tops (z) and BED_TOP
    out = []
    for line in h.split('\n'):
        m = re.match(r'^  (\{"id":"([a-z0-9_]+)".*\}),?(\s*)$', line)
        if m and m.group(2) in new:
            e = json.loads(m.group(1)); e['top']['z'] = new[m.group(2)]; line = '  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if line.rstrip().endswith(',') else '')
        out.append(line)
    h = '\n'.join(out); h = h.replace(page, want, 1)
    open(HTML, 'w', encoding='utf-8').write(h); print('written')
if __name__ == '__main__': main()
