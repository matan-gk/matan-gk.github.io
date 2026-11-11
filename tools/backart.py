#!/usr/bin/env python3
"""Adds the BACK views (the look of a floor item turned half way round: `back` in its catalog entry) from a 3x3 sheet of back views.
  python3 tools/backart.py            (run from the repository root; idempotent)
The sheet (art/back-views-a.jpg) has the items in the order of BACK_A below, white background, each drawn from the same camera as its front picture.
A back picture is cut, its magenta surface baked to the item's default colour like items2.py (so it can be recoloured), and fitted to the same footprint
as the front one (items2.fit; the desk, which stands on legs, by its leg tips like ground.py). The result is `"back":{"src","base","ref","r","top"}` in the catalog entry.
In the room a turn cycles: as drawn -> mirrored -> back -> mirrored back (o = 0..3); the mirrors are made at draw time. See docs/ROTATION_PLAN.md."""
import json, os, re, sys
import numpy as np
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import items2, sheetcut
ROOT = items2.ROOT; g = items2.g
# the sheet, row by row. None = no usable picture yet (see docs/personal-space/GEMINI_PROMPTS.md, section G)
BACK_A = [None, 'cloud', 'desk', 'wardrobe', 'wardrobe2', 'bookshelf', 'piano', 'dollhouse', 'mirror']
# the second sheet (art/back-views-b.jpg): three toy boxes, the costume box, five beds. Only the toy boxes are usable (the costume box and the two canopy beds are front views; the beds are not catalog items)
# the pictures of sheet B touch each other below the first row, so the usable ones are cut by their boxes (x0, y0, x1, y1)
# the chair is on a 2x2 retry sheet (art/back-views-c-retry.jpg, bottom right): a true back view, the backrest nearest
BOX_B = {'chair': (619, 549, 922, 990), 'toybox3': (19, 0, 324, 321), 'toybox1': (355, 0, 669, 321), 'toybox2': (701, 4, 1006, 321)}
BACK_C = [None, None, None, 'chair']
BACK_B = ['toybox3', 'toybox1', 'toybox2', 'dressbox', 'bed1', 'bed2', 'bed3', 'bed4', 'bed5']
SKIP = set(a for a in os.environ.get('BACK_SKIP', 'desk,dressbox,bed1,bed2,bed3,bed4,bed5').split(',') if a)
def cell(im, n):
    """the box of the n-th picture (row by row): each picture's own bounds, found as the 9 separate blobs on the white sheet (the pictures overlap the 3x3 grid lines a little)"""
    from scipy import ndimage as nd
    a = np.array(im).astype(float); fg = nd.binary_dilation(a.min(2) < 235, iterations=6); lab, k = nd.label(fg)
    objs = nd.find_objects(lab); sl = sorted(objs, key=lambda o: (min(2, int((o[0].start + o[0].stop) / 2 / (im.height / 3))), o[1].start))
    if len(sl) != 9: raise SystemExit('expected 9 pictures on the sheet, found %d' % len(sl))
    o = sl[n]; return (max(0, o[1].start-4), max(0, o[0].start-4), min(im.width, o[1].stop+4), min(im.height, o[0].stop+4))
def cell_grid(im, n):   # the footprint sheet: its diamonds touch, so the pictures are not separate blobs; the cloud (row 0) is inside its third
    W, H = im.size; r, c = divmod(n, 3); return (c*W//3, max(0, r*H//3-20), (c+1)*W//3, (r+1)*H//3)
# the cloud sofa's back view is only right on the second sheet (the one with the cyan footprint diamonds drawn in); the diamond is keyed out
FOOTPRINT_SHEET = {'cloud'}
def key_out_cyan(im):
    a = np.array(im).astype(float); r, gg, b = a[..., 0], a[..., 1], a[..., 2]
    m = (r < 150) & (gg > 175) & (b > 175) & (np.abs(gg-b) < 45) & (gg-r > 60)
    from scipy import ndimage as nd
    m = nd.binary_dilation(m, iterations=3) & (gg-r > 25) & (b-r > 25) & (r < 215)
    a[m] = 255; return Image.fromarray(a.astype('uint8'))
def main():
    sheets = [(Image.open(ROOT + 'art/back-views-a.jpg').convert('RGB'), BACK_A), (Image.open(ROOT + 'art/back-views-b.jpg').convert('RGB'), BACK_B), (Image.open(ROOT + 'art/back-views-c-retry.jpg').convert('RGB'), BACK_C)]
    sheet2 = key_out_cyan(Image.open(ROOT + 'art/back-views-a-footprints.jpg').convert('RGB'))
    h = open(ROOT + 'math-quest.html', encoding='utf-8').read()
    i = h.index('const ROOM_CATALOG = ['); j = h.index('\n];', i); lines = h[i:j].split('\n')
    cat = {}
    for k, l in enumerate(lines):
        m = re.match(r'^  (\{"id":"([a-z0-9_]+)".*\}),?$', l)
        if m: cat[m.group(2)] = (k, json.loads(m.group(1)))
    out = {}
    for sheet, order in sheets:
      for n, id_ in enumerate(order):
          if id_ is None or id_ in SKIP: continue
          k, e = cat[id_]; fw, fd = e['fw']/items2.GU if hasattr(items2,'GU') else e['fw']/2, e['fd']/2
          src_im = sheet2 if id_ in FOOTPRINT_SHEET else sheet
          a = np.array(sheetcut.cut(src_im, BOX_B[id_] if id_ in BOX_B else (cell_grid if id_ in FOOTPRINT_SHEET else cell)(src_im, n), False, 0.25)).astype(float); H0, Wd = a.shape[:2]
          dc = e.get('dc'); baked, ref, m = items2.bake(a, dc) if dc else (a, None, None)
          if dc and ref is None: dc = None   # no magenta on this side: nothing to recolour
          wroom = (fw+fd)*50*0.95; sz = (max(8, round(wroom*items2.PX)), max(8, round(wroom*items2.PX*H0/Wd)))
          im = lambda x: Image.fromarray(x.astype('uint8')).resize(sz, Image.LANCZOS)
          srcp = items2.save(im(baked)); basep = items2.save(im(a)) if dc else None
          if id_ == 'desk':   # on legs: fitted by the leg tips (as ground.py does)
              L, F, R = g['legs'](srcp, 10, 6); P = {'left': L, 'front': F, 'right': R, 'back': (L[0]+R[0]-F[0], L[1]+R[1]-F[1])}
              sx, sy, tx, ty, res = g['wfit'](P, fw, fd, .12, {'front': 3}); r = g['rect'](srcp, sx, sy, tx, ty); how = 'legs ' + str({q: round(v, 1) for q, v in res.items()})
          else:
              r, res = items2.fit(srcp, fw, fd, 0, e['r'][2] if fw*fd == 1 else 0); how = 'silhouette'
          r = [float(v) for v in r]; b = {'src': srcp, 'r': r}
          if basep: b = {'src': srcp, 'base': basep, 'ref': round(float(ref), 4), 'r': r}
          out[id_] = b; print(id_, how, 'front r', e['r'], 'back r', r, 'colourable' if basep else '', file=sys.stderr)
    for id_, b in out.items():
        k, e = cat[id_]; (e.get('back') or {}).get('top') and b.update(top=e['back']['top']); e['back'] = b; lines[k] = '  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) + (',' if lines[k].rstrip().endswith(',') else '')
    h = h[:i] + '\n'.join(lines) + h[j:]
    open(ROOT + 'math-quest.html', 'w', encoding='utf-8').write(h); print(json.dumps({'back': sorted(out)}))
if __name__ == '__main__': main()
