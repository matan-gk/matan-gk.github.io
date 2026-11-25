#!/usr/bin/env python3
"""Sheet d1 (dreamland: 81 pastel items in a 9 x 9 grid, 55 of them added): same method as tools/items6.py (cutter for near-white things, colour baking, fitting), no back pictures.
  python3 tools/items7.py [--preview]     (from the repository root; idempotent)
Not used from the sheet: duplicates of items the game has (piano, xylophone, drum, abacus, globe, easel, star rug, plush unicorn, star pouf, music box, blocks, treasure chest, star lamp, light pole),
the three beds that would compete with the player's bed levels, the wall pieces (three shelves, sconce, clock) and the hanging pieces (mobile, rainbow); see docs/personal-space/GEMINI_PROMPTS_DREAMLAND.md."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import items6, items4
A = 'art/'
import numpy as np
from PIL import Image
_fit = items4.items2.fit
def fit_safe(path, fw, fd, flat, spot_w):
    """items2.fit measures the slopes of the picture's base edges; a picture with no straight base (an arch, a cloud) makes that fail: then the picture's width is fitted to the footprint's width and its lowest point stands on the footprint's front corner"""
    try:
        r_, res_ = _fit(path, fw, fd, flat, spot_w)
        if not flat or res_ <= 10: return r_, res_   # a rug that is not a diamond (a heart, a rainbow arc, hopscotch) does not fit the diamond well: use the bounding fit below
    except Exception: pass
    if True:
        a = np.array(Image.open(items4.ROOT+path).convert('RGBA')); H, W = a.shape[:2]; ys, xs = np.where(a[..., 3] > 128)
        sx = (fw+fd)*50*0.92/(xs.max()+1-xs.min()); ctr = items4.items2.g['g2s'](fw/2, fd/2); fr = items4.items2.g['g2s'](fw-.04, fd-.04)
        tx = ctr[0]-sx*(xs.min()+xs.max()+1)/2; ty = fr[1]-sx*(ys.max()+1)
        return [round(tx-500, 1), round(ty-400, 1), round(W*sx, 1), round(H*sx, 1)], 0
items4.items2.fit = fit_safe
OVERRIDE = {(0, 7): (799, 35, 906, 145)}   # the cloud bed touches the wooden bed (not used) and would be cut at the wrong place by its blob
_strict = items4.cut4
def cut_sealed(im, box, big, thin=False):
    """big == -9: a white cloud whose outline has gaps: the outline is thickened (2 px) before the white that touches the edge is taken as background"""
    if big != -9: return _strict(im, box, big, thin)
    sub = np.array(im.crop(box)).astype(float); mn = sub.min(2); sealed = items4.nd.binary_dilation(mn < 215, iterations=2)
    lab, k = items4.nd.label((mn > 236) & ~sealed); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    fg = ~np.isin(lab, list(edge)); fg = items4.nd.binary_opening(fg, iterations=1); l3, k3 = items4.nd.label(fg)
    if k3 > 1: z = items4.nd.sum(fg, l3, range(1, k3+1)); fg = np.isin(l3, [j+1 for j, s_ in enumerate(z) if s_ > 0.25*z.max()])
    fg = items4.nd.binary_fill_holes(fg); al = np.clip(items4.nd.gaussian_filter(fg.astype(float), 0.7)*1.6-0.3, 0, 1)
    out = np.dstack([sub, al*255]).astype('uint8'); ys, xs = np.where(al > 0.1)
    return Image.fromarray(out[ys.min():ys.max()+1, xs.min():xs.max()+1])
items4.cut4 = cut_sealed
_cells = items4.cells
def cells(im, lay):
    """('cellblobs', cols, rows): the sheet is a loose grid (pictures drift off their cells), so the separate blobs are grouped by the grid cell their centre falls in and each group's bounding box is the picture's crop"""
    if lay[0] != 'cellblobs': return _cells(im, lay)
    W, H = im.size; a = np.array(im).astype(float); lab, k = items4.nd.label(items4.nd.binary_dilation(a.min(2) < 245, iterations=1)); out = {}
    for j, o in enumerate(items4.nd.find_objects(lab)):
        cy = (o[0].start + o[0].stop) / 2; cx = (o[1].start + o[1].stop) / 2; key = (int(cy / (H / lay[2])), int(cx / (W / lay[1]))); b = out.get(key)
        out[key] = (min(b[0], o[1].start), min(b[1], o[0].start), max(b[2], o[1].stop), max(b[3], o[0].stop)) if b else (o[1].start, o[0].start, o[1].stop, o[0].stop)
    out.update(OVERRIDE)
    miss = [(r, c) for r in range(lay[2]) for c in range(lay[1]) if (r, c) not in out]
    if miss: raise SystemExit('empty cells: %s' % miss)
    return [(max(0, b[0]-4), max(0, b[1]-4), min(W, b[2]+4), min(H, b[3]+4)) for r in range(lay[2]) for c in range(lay[1]) for b in [out[(r, c)]]]
items4.cells = cells
items4.SHEETS = {'d1': (A+'sheet-d1-dreamland.jpg', ('cellblobs', 9, 9), A+'sheet-d1-dreamland.jpg', ('cellblobs', 9, 9))}
P = '#cdb4f5'; Y = '#f6d365'; K = '#f48fd0'
def g(r, c): return (r-1)*9 + (c-1)    # picture number from row and column (1-based)
# id, sheet, picture no., hebrew, price, group, fw, fd (cells), spot width, default colour, part key, back, flat, big, options
items4.S = [
 ('dl_moonswing', 'd1', g(1,3), 'עריסת ירח',            5, 'furniture', 2, 2, 0,  K, 'dl_moonswing', None, 0, -2500, ''),
 ('dl_moonbed',   'd1', g(1,5), 'מיטת ירח',             5, 'furniture', 2, 2, 0,  Y, 'dl_moonbed',   None, 0, -2500, ''),
 ('dl_drapetent', 'd1', g(1,6), 'אוהל וילונות',         4, 'furniture', 1, 1, 84, None, None,        None, 0, -2500, ''),
 ('dl_cloudbed',  'd1', g(1,8), 'מיטת ענן קטנה',        4, 'furniture', 2, 2, 0,  K, 'dl_cloudbed',  None, 0, -9, ''),
 ('dl_sleepbag',  'd1', g(1,9), 'שק שינה חד קרן',       4, 'play',      2, 1, 0,  K, 'dl_sleepbag',  None, 0, -2500, ''),
 ('dl_clouddesk', 'd1', g(2,1), 'שולחן ענן',            6, 'furniture', 2, 2, 0,  K, 'dl_clouddesk', None, 0, -2500, ''),
 ('dl_vanity',    'd1', g(2,2), 'שולחן איפור כוכב',     6, 'furniture', 2, 1, 0,  K, 'dl_vanity',    None, 0, -2500, ''),
 ('dl_rbshelf',   'd1', g(2,3), 'ספרייה קשת',           6, 'furniture', 2, 1, 0,  K, 'dl_rbshelf',   None, 0, -2500, ''),
 ('dl_dresser',   'd1', g(2,4), 'שידת כוכבים',          5, 'furniture', 2, 1, 0,  K, 'dl_dresser',   None, 0, -2500, ''),
 ('dl_moonstand', 'd1', g(2,5), 'שידת ירח',             4, 'furniture', 1, 1, 74, K, 'dl_moonstand', None, 0, -2500, ''),
 ('dl_heartstand','d1', g(2,7), 'שידת לב',              3, 'furniture', 1, 1, 66, K, 'dl_heartstand',None, 0, -2500, ''),
 ('dl_glasstable','d1', g(2,8), 'שולחן זכוכית וענן',    5, 'furniture', 2, 2, 0,  K, 'dl_glasstable',None, 0, -2500, ''),
 ('dl_starstool', 'd1', g(2,9), 'שרפרף כוכב',           3, 'furniture', 1, 1, 70, K, 'dl_starstool', None, 0, -2500, ''),
 ('dl_moonlamp',  'd1', g(3,1), 'מנורת ירח',            3, 'play',      1, 1, 62, K, 'dl_moonlamp',  None, 0, -7,    ''),
 ('dl_unibust',   'd1', g(3,5), 'פסל חד קרן',           4, 'play',      1, 1, 60, K, 'dl_unibust',   None, 0, -2500, ''),
 ('dl_lantern',   'd1', g(3,7), 'פנס עם ציצית',         3, 'play',      1, 1, 58, K, 'dl_lantern',   None, 0, -7,    ''),
 ('dl_sunlamp',   'd1', g(3,8), 'מנורת שמש',            4, 'play',      1, 1, 64, K, 'dl_sunlamp',   None, 0, -7,    ''),
 ('dl_rug_cloud', 'd1', g(4,1), 'שטיח ענן סגלגל',       4, 'rugs',      2, 2, 0,  '#f9a8d4', 'rug', None, 1, -2500, ''),
 ('dl_rug_rainbow','d1',g(4,3), 'שטיח קשת',             4, 'rugs',      2, 2, 0,  None, None,        None, 1, -2500, ''),
 ('dl_rug_heart', 'd1', g(4,4), 'שטיח לב',              4, 'rugs',      2, 2, 0,  '#f9a8d4', 'rug', None, 1, -2500, ''),
 ('dl_rug_moon',  'd1', g(4,5), 'שטיח ירח',             4, 'rugs',      2, 2, 0,  '#f9a8d4', 'rug', None, 1, -2500, ''),
 ('dl_rug_hop',   'd1', g(4,6), 'משחק קלאס',            4, 'rugs',      2, 2, 0,  None, None,        None, 1, -2500, ''),
 ('dl_rug_uni',   'd1', g(4,7), 'שטיח ראש חד קרן',      5, 'rugs',      2, 2, 0,  None, None,        None, 1, -2500, ''),
 ('dl_rug_floral','d1', g(4,8), 'שטיח פרחים עגול',      4, 'rugs',      2, 2, 0,  None, None,        None, 1, -2500, ''),
 ('dl_rug_sky',   'd1', g(4,9), 'שטיח שמיים',           4, 'rugs',      2, 2, 0,  None, None,        None, 1, -2500, ''),
 ('dl_fairyhouse','d1', g(5,4), 'בית פיות',             5, 'play',      1, 1, 76, None, None,        None, 0, -2500, ''),
 ('dl_teaset',    'd1', g(5,6), 'מגש תה',               3, 'play',      1, 1, 78, None, None,        None, 0, -2500, ''),
 ('dl_cloudpillow','d1',g(5,7), 'כרית ענן',             2, 'play',      1, 1, 70, K, 'dl_cloudpillow',None,0, -2500, ''),
 ('dl_rings',     'd1', g(5,9), 'מגדל טבעות',           2, 'play',      1, 1, 56, None, None,        None, 0, -2500, ''),
 ('dl_toybag',    'd1', g(6,1), 'שק צעצועים',           3, 'play',      1, 1, 64, K, 'dl_toybag',    None, 0, -2500, ''),
 ('dl_magrack',   'd1', g(6,2), 'מעמד מגזינים',         3, 'play',      1, 1, 72, K, 'dl_magrack',   None, 0, -2500, ''),
 ('dl_jewelbox',  'd1', g(6,3), 'קופסת תכשיטים',        4, 'play',      1, 1, 74, K, 'dl_jewelbox',  None, 0, -2500, ''),
 ('dl_umbrella',  'd1', g(6,5), 'מעמד מטריות קשת',      3, 'play',      1, 1, 60, None, None,        None, 0, -2500, ''),
 ('dl_heartbin',  'd1', g(6,6), 'פח לבבות',             2, 'play',      1, 1, 62, K, 'dl_heartbin',  None, 0, -2500, ''),
 ('dl_coatrack',  'd1', g(6,7), 'קולב ענן',             3, 'play',      1, 1, 56, K, 'dl_coatrack',  None, 0, -2500, ''),
 ('dl_piggy',     'd1', g(6,8), 'קופת חיסכון חד קרן',   3, 'play',      1, 1, 72, None, None,        None, 0, -2500, ''),
 ('dl_trophy',    'd1', g(6,9), 'גביע כוכב',            4, 'play',      1, 1, 56, None, None,        None, 0, -2500, ''),
 ('dl_harp',      'd1', g(7,2), 'נבל חד קרן',           5, 'play',      1, 1, 70, None, None,        None, 0, -2500, ''),
 ('dl_cradle',    'd1', g(7,5), 'עריסת ענן נדנדה',      5, 'play',      2, 1, 0,  K, 'dl_cradle',    None, 0, -2500, ''),
 ('dl_teepee',    'd1', g(7,7), 'אוהל קשת',             6, 'play',      2, 2, 0,  None, None,        None, 0, -2500, ''),
 ('dl_beam',      'd1', g(7,8), 'קורת שיווי משקל',      4, 'play',      2, 1, 0,  K, 'dl_beam',      None, 0, -2500, ''),
 ('dl_snowglobe', 'd1', g(8,4), 'כדור שלג חד קרן',      4, 'play',      1, 1, 62, K, 'dl_snowglobe', None, 0, -2500, ''),
 ('dl_terrarium', 'd1', g(8,5), 'טרריום קריסטלים',      5, 'play',      1, 1, 70, None, None,        None, 0, -2500, ''),
 ('dl_hourglass', 'd1', g(8,6), 'שעון חול',             3, 'play',      1, 1, 52, None, None,        None, 0, -2500, ''),
 ('dl_calendar',  'd1', g(8,8), 'לוח שנה קשת',          3, 'play',      1, 1, 70, K, 'dl_calendar',  None, 0, -2500, ''),
 ('dl_heartmirror','d1',g(8,9), 'מראה לב שולחנית',      3, 'play',      1, 1, 64, None, None,        None, 0, -2500, ''),
 ('dl_moonchair', 'd1', g(9,1), 'כיסא ירח',             5, 'furniture', 2, 2, 0,  K, 'dl_moonchair', None, 0, -2500, ''),
 ('dl_rbstool',   'd1', g(9,2), 'שרפרף קשת',            3, 'furniture', 1, 1, 70, None, None,        None, 0, -2500, ''),
 ('dl_heartpouf', 'd1', g(9,3), 'פוף לב מרופד',         5, 'furniture', 2, 2, 0,  K, 'dl_heartpouf', None, 0, -2500, ''),
 ('dl_unibean',   'd1', g(9,4), 'פוף חד קרן',           5, 'furniture', 2, 2, 0,  K, 'dl_unibean',   None, 0, -2500, ''),
 ('dl_starbench', 'd1', g(9,5), 'ספסל כוכב',            5, 'furniture', 2, 1, 0,  K, 'dl_starbench', None, 0, -2500, ''),
 ('dl_cloudswing','d1', g(9,6), 'נדנדת ענן תלויה',      6, 'furniture', 2, 2, 0,  K, 'dl_cloudswing',None, 0, -2500, ''),
 ('dl_stepstool', 'd1', g(9,7), 'שרפרף סולם',           3, 'furniture', 1, 1, 70, None, None,        None, 0, -2500, ''),
 ('dl_crownpillow','d1',g(9,8), 'כרית כתר',             3, 'furniture', 1, 1, 78, K, 'dl_crownpillow',None,0, -2500, ''),
 ('dl_rbsofa',    'd1', g(9,9), 'ספת קשת',              6, 'furniture', 2, 2, 0,  K, 'dl_rbsofa',    None, 0, -2500, ''),
]
if __name__ == '__main__': items4.main()
