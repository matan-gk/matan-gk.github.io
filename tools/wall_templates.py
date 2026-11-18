#!/usr/bin/env python3
"""Guide pictures for the Gemini sheets of 3D wall items (windows, clock, art).
Same idea as docs/personal-space/shelf_template.png: NO wall is drawn (Gemini copies whatever it sees), only the box the item
occupies, seen the way the game sees the RIGHT-hand wall: back edge running down to the right at 26.57 degrees (rise 1 per 2 across),
the item sticking out of the wall toward the lower left, vertical lines vertical. Red = the item's body, orange = a sill or a ledge,
green = "up". Sizes are in the game's wall pixels (the catalog's r), times S.
Run: python3 tools/wall_templates.py   -> docs/personal-space/wallitem_template_*.png"""
import math, os
from PIL import Image, ImageDraw
OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'personal-space')
S = 2.0                      # template pixels per wall pixel
RED, ORG, GRN = (230, 40, 40), (240, 150, 30), (80, 180, 80)
FILL, FILL2 = (255, 225, 225), (255, 238, 210)

def P(o, u, v, d=0):         # point of the wall plane: u along the wall (down-right), v up, d out of the wall (down-left)
    return (o[0] + (u - d) * S, o[1] + (u * 0.5 + d * 0.5 - v) * S)

def box(dr, o, u0, u1, v0, v1, d, col, fill):
    """the three faces you can see: front, top and the RIGHT end (the end away from the corner; the left end is hidden behind the front)"""
    f = lambda u, v, dd: P(o, u, v, dd)
    for poly in ([f(u1,v0,0), f(u1,v1,0), f(u1,v1,d), f(u1,v0,d)],          # right end
                 [f(u0,v1,0), f(u1,v1,0), f(u1,v1,d), f(u0,v1,d)],          # top
                 [f(u0,v0,d), f(u1,v0,d), f(u1,v1,d), f(u0,v1,d)]):         # front
        dr.polygon(poly, fill=fill, outline=col)

def disc(dr, o, cx, cy, r, d, col, fill):
    """a round body on the wall: the circle is sheared with the wall, so its 12-6 line stays vertical and its 9-3 line slopes"""
    def ring(dd): return [P(o, cx + r*math.cos(t), cy + r*math.sin(t), dd) for t in [i*math.pi/60 for i in range(120)]]
    a, b = ring(0), ring(d)
    pts = a + b; pts.sort(); hull = []
    for seq in (pts, pts[::-1]):
        h = []
        for p in seq:
            while len(h) >= 2 and (h[-1][0]-h[-2][0])*(p[1]-h[-2][1]) - (h[-1][1]-h[-2][1])*(p[0]-h[-2][0]) <= 0: h.pop()
            h.append(p)
        hull += h[:-1]
    dr.polygon(hull, fill=fill, outline=col); dr.polygon(b, fill=(255, 240, 240), outline=col)

def extent(items, pad=0):
    xs, ys = [], []
    for (u0, u1, v0, v1, d) in items:
        for u in (u0, u1):
            for v in (v0, v1):
                for dd in (0, d):
                    x, y = P((0, 0), u, v, dd); xs.append(x); ys.append(y)
    return min(xs), max(xs), min(ys), max(ys)

def sheet(name, size, cols, rows, cells):
    im = Image.new('RGB', size, 'white'); dr = ImageDraw.Draw(im)
    cw, ch = size[0] / cols, size[1] / rows
    for i, cell in enumerate(cells):
        cx, cy = (i % cols) * cw, (i // cols) * ch
        shapes = cell['shapes']
        x0, x1, y0, y1 = extent([s[1:6] for s in shapes if s[0] == 'box'] + [(s[1]-s[3], s[1]+s[3], s[2]-s[3], s[2]+s[3], s[4]) for s in shapes if s[0] == 'disc'])
        o = (cx + (cw - (x1 - x0)) / 2 - x0, cy + (ch - (y1 - y0)) / 2 - y0)
        for s in shapes:
            if s[0] == 'box': box(dr, o, *s[1:6], ORG if s[6] == 'o' else RED, FILL2 if s[6] == 'o' else FILL)
            else: disc(dr, o, s[1], s[2], s[3], s[4], RED, FILL)
        gx, gy = P(o, 0, 0, 0)
        dr.line([(gx - 14, gy), (gx - 14, gy - 60 * S)], fill=GRN, width=2)       # "up", beside the left edge
    im.save(os.path.join(OUT, name)); print('wrote', name)

# windows: front face sizes in wall pixels (the catalogue's picture sizes); frame sticks out 14, the sill 28 and a little wider
def win(w, h): return {'shapes': [('box', 0, w, 0, h, 14, 'r'), ('box', -8, w + 8, -12, 0, 28, 'o')]}
W = [(211, 215), (226, 229), (218, 270), (226, 295), (253, 311)]
sheet('wallitem_template_windows_a.png', (1920, 1080), 3, 1, [win(*W[0]), win(*W[1]), win(*W[2])])
sheet('wallitem_template_windows_b.png', (1920, 1080), 2, 1, [win(*W[3]), win(*W[4])])
# the clock: a round body 120 wide, 30 deep
sheet('wallitem_template_clock.png', (1080, 1080), 1, 1, [{'shapes': [('disc', 60, 64, 60, 30)]}])
# art, 3 x 2: landscape frame, portrait frame, canvas, hanging scroll, bunting, photo string (width, height, depth)
def art(w, h, d): return {'shapes': [('box', 0, w, 0, h, d, 'r')]}
sheet('wallitem_template_art_a.png', (1920, 1080), 3, 2, [art(150, 110, 10), art(90, 130, 10), art(110, 110, 14), art(80, 140, 6), art(200, 60, 8), art(190, 80, 8)])
sheet('wallitem_template_art_b.png', (1920, 1080), 3, 2, [art(110, 130, 12), art(80, 150, 6), art(120, 120, 10), art(110, 110, 12), art(130, 90, 10), art(150, 100, 12)])
