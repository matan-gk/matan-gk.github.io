#!/usr/bin/env python3
"""Cuts a generated sheet of sprites on a white background into separate transparent webp files.

    python3 tools/slice_sheet.py SHEET.jpg ROWS COLS OUT_DIR name1 name2 ...   [--size 256]

Each sprite is found as a connected blob of non-white pixels (so parts that spill into a neighbouring cell, such as braids, stay with
their own sprite); the white background becomes transparent (soft edge), and the result is cropped, centred in a square and resized.
Sprites are numbered row-major and take the names given, in that order.
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    size = 256
    if '--size' in sys.argv: size = int(sys.argv[sys.argv.index('--size')+1]); a = [x for x in a if x != str(size)]
    sheet, rows, cols, out = a[0], int(a[1]), int(a[2]), a[3]; names = a[4:]
    im = Image.open(sheet).convert('RGB'); arr = np.asarray(im).astype(np.int16)
    dist = 255 - arr.min(axis=2)                       # 0 = white
    solid = dist > 28
    lab, n = ndi.label(ndi.binary_dilation(solid, iterations=6))
    sizes = ndi.sum(solid, lab, range(1, n+1))
    keep = [i+1 for i, s in enumerate(sizes) if s > 2500]
    assert len(keep) == rows*cols == len(names), (len(keep), rows*cols, len(names))
    boxes = []
    for i in keep:
        ys, xs = np.where((lab == i) & solid)
        boxes.append((ys.min(), ys.max(), xs.min(), xs.max(), i))
    H, W = solid.shape
    boxes.sort(key=lambda b: ((b[0]+b[1])/2))          # rows by vertical centre
    ordered = []
    for r in range(rows):
        row = sorted(boxes[r*cols:(r+1)*cols], key=lambda b: (b[2]+b[3])/2); ordered += row
    os.makedirs(out, exist_ok=True)
    for name, (y0, y1, x0, x1, i) in zip(names, ordered):
        m = (lab == i)
        # background = white pixels connected to the outside of this sprite's blob; enclosed whites (eyes, teeth) stay opaque
        pad = 4; y0 -= pad; x0 -= pad; y1 += pad; x1 += pad
        y0 = max(y0, 0); x0 = max(x0, 0); y1 = min(y1, H-1); x1 = min(x1, W-1)
        crop = arr[y0:y1+1, x0:x1+1]
        d = dist[y0:y1+1, x0:x1+1]
        other = solid[y0:y1+1, x0:x1+1] & ~m[y0:y1+1, x0:x1+1]   # neighbour fragments inside the box
        bgcand = d <= 28
        bl, bn = ndi.label(bgcand)
        edge = set(np.unique(np.concatenate([bl[0], bl[-1], bl[:, 0], bl[:, -1]]))) - {0}
        bg = np.isin(bl, list(edge)) | other
        alpha = np.where(bg, 0, 255).astype(np.uint8)
        # soft edge: pixels touching the background fade by how white they are
        edgepx = ndi.binary_dilation(bg, iterations=1) & ~bg
        soft = np.clip(d * 255 // 60, 0, 255).astype(np.uint8)
        alpha = np.where(edgepx, np.minimum(alpha, np.maximum(soft, 90)), alpha)
        rgba = np.dstack([crop.astype(np.uint8), alpha])
        sp = Image.fromarray(rgba, 'RGBA')
        s = max(sp.size); sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(sp, ((s-sp.width)//2, (s-sp.height)//2))
        sq = sq.resize((size, size), Image.LANCZOS)
        sq.save(os.path.join(out, name + '.webp'), 'WEBP', quality=88, method=6)
        print(name, sq.size, os.path.getsize(os.path.join(out, name + '.webp')))
main()
