"""The wall clock (sheet c1): one solid wall item drawn in the room's view, like the shelves and the art. Same maths as tools/artwall.py (depth d, wall plane = picture minus the depth strip, anchor = its centre).
Replaces the picture and rectangle of the catalog item `wallclock` (same id, so saved rooms keep their clock). Run `python3 tools/clock3d.py` from the repo root (idempotent)."""
import sys, re, math
import numpy as np
sys.path.insert(0, 'tools')
from PIL import Image
import items2, items4, shelves
ROOT = items4.ROOT; D = 110; WW = 150
def main():
    f = Image.open(ROOT + 'art/sheet-c1-clock.jpg').convert('RGB'); W, H = f.size
    im = shelves.cut(f, (0, 0, W, H)); al = np.array(im)[..., 3] > 128; Hp, Wp = al.shape
    ys = np.where(al.any(1))[0]; xs = np.where(al.any(0))[0]; x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    Lw = x1 - x0 - D; sc = WW/Lw; Hw = (y1 - y0 - D/2) - 0.5*Lw; mx = (x0 + D + x1)/2; my = (y0 + y1 - D/2)/2
    src = items2.save(im.resize((round(Wp*sc*items2.PX*2/1.5), round(Hp*sc*items2.PX*2/1.5)), Image.LANCZOS)); Hf = float(max(25, math.ceil(Hw*sc/25)*25))
    r = [round(-WW/2, 1), round(-Hf/2, 1), float(WW), Hf]; imx = [round(float(-mx*sc), 1), round(float(-my*sc), 1), round(float(Wp*sc), 1), round(float(Hp*sc), 1)]
    print(src, r, imx)
    p = ROOT + 'math-quest.html'; t = open(p, encoding='utf-8').read()
    t2 = re.sub(r'\{"id":"wallclock",[^\n]*\}', lambda m: '{"id":"wallclock","n":"שעון קיר","p":3,"g":"wall","wall":1,"solid":1,"src":"%s","r":%s,"im":%s}' % (src, str(r).replace(' ', ''), str(imx).replace(' ', '')), t, count=1)
    open(p, 'w', encoding='utf-8').write(t2)
if __name__ == '__main__': main()
