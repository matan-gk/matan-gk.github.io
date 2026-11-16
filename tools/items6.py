#!/usr/bin/env python3
"""Sheets u1 (the cloud and unicorn furniture, with back pictures) and u2 (topiary and planters): same method as tools/items4.py, whose cutter, colour baking and fitting it reuses.
  python3 tools/items6.py [--preview]     (from the repository root; idempotent)"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import items4
A = 'art/'
import numpy as np
from PIL import Image
from scipy import ndimage as nd
_cut4 = items4.cut4
def cut_strict(im, box, big, thin=False):
    """white things (the clouds, the pearl unicorns) are nearly white too, so the background is only what is pure white: everything that touches the edge (min channel > 242), and
    enclosed pure-white gaps (min > 250) larger than |big| pixels (the gap under a rocking horse); `big` < 0 selects this cutter"""
    if big >= 0: return _cut4(im, box, big, thin)
    nohalo = big == -7; lim = 2500 if nohalo else -big; sub = np.array(im.crop(box)).astype(float); mn = sub.min(2)
    lab, k = nd.label(mn > 242); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge)); l2, k2 = nd.label(mn > 250); sz = nd.sum(mn > 250, l2, range(1, k2+1)); bg |= np.isin(l2, [j+1 for j, s_ in enumerate(sz) if s_ > lim])
    fg = nd.binary_opening(~bg, iterations=1)
    if nohalo: fg &= nd.binary_fill_holes(nd.binary_dilation(mn < 170, iterations=2))   # the lamp's soft glow is not part of the picture: keep what lies inside the dark outlines
    l3, k3 = nd.label(fg)
    if k3 > 1: z = nd.sum(fg, l3, range(1, k3+1)); fg = np.isin(l3, [j+1 for j, s_ in enumerate(z) if s_ > 0.25*z.max()])
    al = np.clip(nd.gaussian_filter(fg.astype(float), 0.7)*1.6-0.3, 0, 1)
    out = np.dstack([sub, al*255]).astype('uint8'); ys, xs = np.where(al > 0.1)
    return Image.fromarray(out[ys.min():ys.max()+1, xs.min():xs.max()+1])
items4.cut4 = cut_strict
items4.SHEETS = {
 'u1': (A+'sheet-u1-unicorn.jpg', ('blobs', 9), A+'sheet-u1-back.jpg', ('blobs', 5)),
 'u2': (A+'sheet-u2-topiary.jpg', ('blobs', 6), A+'sheet-u2-topiary.jpg', ('blobs', 6)),
}
# id: (sheet, picture no., hebrew, price, group, fw, fd (cells), spot width, default colour, part key, back picture no. or None, flat, big, options)
items4.S = [
 ('cloudarm',  'u1', 0, 'כורסת ענן',            5, 'furniture', 2, 2, 0,   '#cdb4f5', 'cloudarm',  0, 0, -2500, ''),
 ('cloudott',  'u1', 1, 'שרפרף ענן',            4, 'furniture', 1, 1, 78,  '#cdb4f5', 'cloudott',  None, 0, -2500, ''),
 ('unimirror', 'u1', 2, 'מראה חד קרן',          5, 'furniture', 1, 1, 70,  '#e6c8ff', 'unimirror', 1, 0, -2500, ''),
 ('rbcurtain', 'u1', 3, 'וילון קשת',            4, 'furniture', 1, 1, 84,  '#f4c25b', 'rbcurtain', None, 0, -2500, ''),
 ('unihorse',  'u1', 4, 'סוס נדנדה חד קרן',     6, 'play',      2, 1, 0,   '#f48fd0', 'unihorse',  2, 0, -1000, ''),
 ('heartbench','u1', 5, 'ספסל לב',              5, 'furniture', 2, 1, 0,   '#b79af0', 'heartbench',3, 0, -2500, ''),
 ('unithrone', 'u1', 6, 'כס בובת חד קרן',       6, 'furniture', 2, 2, 0,   '#cdb4f5', 'unithrone', 4, 0, -2500, ''),
 ('starpouf',  'u1', 7, 'פוף כוכב',             3, 'furniture', 1, 1, 74,  '#f6d365', 'starpouf',  None, 0, -2500, ''),
 ('cloudlamp', 'u1', 8, 'מנורת ענן',            4, 'furniture', 1, 1, 62,  '#f4c25b', 'cloudlamp', None, 0, -7, ''),
 ('pl23', 'u2', 0, 'שיח קובייה',   3, 'plants', 1, 1, 70, '#cdb4f5', 'POT', None, 0, 6000, ''),
 ('pl24', 'u2', 1, 'שיח חרוט',     3, 'plants', 1, 1, 70, '#cdb4f5', 'POT', None, 0, 6000, ''),
 ('pl25', 'u2', 2, 'שיח כדור',     2, 'plants', 1, 1, 74, '#cdb4f5', 'POT', None, 0, 6000, ''),
 ('pl26', 'u2', 3, 'שיח ספירלה',   3, 'plants', 1, 1, 66, '#cdb4f5', 'POT', None, 0, 6000, ''),
 ('pl27', 'u2', 4, 'שיח שלושה כדורים', 3, 'plants', 1, 1, 60, '#cdb4f5', 'POT', None, 0, 6000, ''),
 ('pl28', 'u2', 5, 'ערוגת פרחים',  3, 'plants', 2, 1, 0,  '#cdb4f5', 'POT', None, 0, 6000, ''),
]
if __name__ == '__main__': items4.main()
