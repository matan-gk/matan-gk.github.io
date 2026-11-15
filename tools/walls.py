"""Wall items (sheet c4: the clock and the treasure map): cut out of the front sheet, scaled to a width in wall pixels (the room's wall is 500 wide) and saved as assets.
Prints the catalog lines' src and r (the picture rectangle around its centre, in wall pixels: it is drawn flat on the wall and sheared with it). Run `python3 tools/walls.py`; then paste or let it patch math-quest.html."""
import json, sys
sys.path.insert(0, 'tools')
from PIL import Image
import items2, items4
ROOT = items4.ROOT
W = {'wallclock': (7, 'שעון קיר', 3, 120), 'treasuremap': (8, 'מפת אוצר', 3, 150)}   # id: (picture no. on sheet c4, name, price, width in wall pixels)
def main():
    f = Image.open(ROOT + 'art/sheet-c4-plush-plants-wall.jpg').convert('RGB'); boxes = items4.cells(f, ('blobs', 9)); out = []
    for id_, (n, he, price, width) in W.items():
        im = items4.cut4(f, boxes[n], 10**9); h = round(width*im.height/im.width, 1)
        sz = (round(width*items2.PX*2), round(width*items2.PX*2*im.height/im.width))
        src = items2.save(im.resize(sz, Image.LANCZOS))
        out.append({'id': id_, 'n': he, 'p': price, 'g': 'wall', 'wall': 1, 'src': src, 'r': [-width/2, -h/2, float(width), h]}); print(id_, src, out[-1]['r'])
    if '--preview' in sys.argv: return
    p = ROOT + 'math-quest.html'; t = open(p, encoding='utf-8').read(); i = t.index('const ROOM_CATALOG = ['); j = t.index('\n];', i)
    body = [l for l in t[i:j].split('\n')[1:] if l.strip() and not any('"id":"%s"' % e['id'] in l for e in out)]
    lines = [l.rstrip(',') for l in body] + ['  ' + json.dumps(e, ensure_ascii=False, separators=(',', ':')) for e in out]
    open(p, 'w', encoding='utf-8').write(t[:i] + 'const ROOM_CATALOG = [\n' + ',\n'.join(lines) + t[j:])
if __name__ == '__main__': main()
