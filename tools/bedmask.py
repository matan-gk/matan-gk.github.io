#!/usr/bin/env python3
"""Fixes the part masks of the bed pictures (levels 1 to 4; run from the repository root; idempotent).
Mask colours: red = blanket, green = sheet, blue = pillow, yellow = curtain.
  - the narrow band along the blanket's top edge (the fold, between the blanket and the pillow) was green: it is blanket;
  - the small lobe left of the pillow (a bit of the sheet showing) was blue: it is sheet.
Both were marked on a screenshot by the owner (b = blanket, s = sheet, p = pillow). Level 5 (the canopy bed) has no such band or lobe."""
import re, sys, os, io, hashlib
import numpy as np
from PIL import Image
from scipy import ndimage as nd
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..') + '/'
STRIP = {1: (71, 142, 68, 113), 2: (72, 143, 68, 115), 3: (68, 139, 93, 136), 4: (107, 156, 190, 244)}   # bbox (x0, x1, y0, y1) of the band's green component
def comp(M, bbox, tol=3):
    lab, k = nd.label(M)
    for i, o in enumerate(nd.find_objects(lab), 1):
        if all(abs(a-b) <= tol for a, b in zip((o[1].start, o[1].stop, o[0].start, o[0].stop), bbox)) and (lab == i).sum() > 400: return lab == i
def main():
    p = ROOT + 'math-quest.html'; h = open(p, encoding='utf-8').read()
    seg = re.findall(r"ROOM_ART = \{bed:\[(.*?)\],\s*window", h, re.S)[0]; masks = re.findall(r"mask:'(assets/[^']+)'", seg)
    for L, m in enumerate(masks[:4], 1):
        a = np.array(Image.open(ROOT + m).convert('RGB')); on = a > 128
        R = on[..., 0] & ~on[..., 1] & ~on[..., 2]; G = on[..., 1] & ~on[..., 0] & ~on[..., 2]; B = on[..., 2] & ~on[..., 0] & ~on[..., 1]
        s = comp(G, STRIP[L]); changed = 0
        if s is not None: a[s] = (255, 0, 0); changed += int(s.sum())
        lab, k = nd.label(B)
        for i in range(1, k+1):
            q = lab == i
            if 20 < q.sum() < 300: a[q] = (0, 255, 0); changed += int(q.sum())
        if not changed: print('level', L, 'already fixed'); continue
        b = io.BytesIO(); Image.fromarray(a).save(b, 'WEBP', lossless=True); raw = b.getvalue(); nm = 'assets/' + hashlib.sha1(raw).hexdigest()[:12] + '.webp'
        open(ROOT + nm, 'wb').write(raw); h = h.replace(m, nm); print('level', L, changed, 'pixels ->', nm)
    open(p, 'w', encoding='utf-8').write(h)
if __name__ == '__main__': main()
