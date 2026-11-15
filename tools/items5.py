#!/usr/bin/env python3
"""Two single-picture updates to sheet-c1 items (run from the repository root; idempotent):
  ktable: the kids' table is now a 4-chair picture (art/ktable-4chairs.png), the same from every side, so it has no turn button (NO_TURN) and no back;
  rhorse: gets a back picture (art/rhorse-back.png), the horse turned half way round.
Same method as tools/items3.py (cut, bake the magenta part to the default colour, fit to the footprint); the pictures are cut as one blob each."""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import items2, items3
ROOT = items3.ROOT
items3.cell = lambda im, n: (0, 0, im.width, im.height)   # one picture per image
ROWS = {r[0]: r for r in items3.S}
def entry(h, id_):
    i = h.index('const ROOM_CATALOG = ['); j = h.index('\n];', i)
    for l in h[i:j].split('\n'):
        if '"id":"%s"' % id_ in l: return json.loads(l.strip().rstrip(','))
def main():
    h = open(ROOT + 'math-quest.html', encoding='utf-8').read(); out = {}
    # the table: 3x3 cells, magenta seats -> light blue
    id_, he, price, grp, fw, fd, spot, dc, pk, _ = ROWS['ktable']; fw = fd = 3
    im = Image.open(ROOT + 'art/ktable-4chairs.png').convert('RGB')
    srcp, basep, ref, dc2 = items3.picture(im, 0, fw, fd, dc, 200); r, res = items2.fit(srcp, fw, fd, 0, 0)
    e = entry(h, 'ktable'); e.update({'fw': fw*items3.GU, 'fd': fw*items3.GU, 'src': srcp, 'base': basep, 'r': [float(v) for v in r], 'dc': dc2, 'ref': round(float(ref), 4), 'pk': pk}); e['top'] = {'c': [0, 0, 3, 3], 'z': 45}; out['ktable'] = e   # a first guess: tools/surfaces.py measures the real one
    print('ktable', r, res, file=sys.stderr)
    # the horse's back
    id_, he, price, grp, fw, fd, spot, dc, pk, _ = ROWS['rhorse']
    bim = Image.open(ROOT + 'art/rhorse-back.png').convert('RGB')
    bs, bb, bref, bdc = items3.picture(bim, 0, fw, fd, dc, 1000); br, bres = items2.fit(bs, fw, fd, 0, 0)
    e = entry(h, 'rhorse'); e['back'] = {'src': bs, 'base': bb, 'ref': round(float(bref), 4), 'r': [float(v) for v in br]}; out['rhorse'] = e
    print('rhorse back', br, bres, file=sys.stderr)
    i = h.index('const ROOM_CATALOG = ['); j = h.index('\n];', i)
    lines = []
    for l in h[i:j].split('\n')[1:]:
        if not l.strip(): continue
        d = json.loads(l.strip().rstrip(','))
        lines.append(('  ' + json.dumps(out[d['id']], ensure_ascii=False, separators=(',', ':'))) if d['id'] in out else l.rstrip(','))
    open(ROOT + 'math-quest.html', 'w', encoding='utf-8').write(h[:i] + 'const ROOM_CATALOG = [\n' + ',\n'.join(lines) + h[j:])
if __name__ == '__main__': main()
