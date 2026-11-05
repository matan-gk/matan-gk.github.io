#!/usr/bin/env python3
"""Keeps the game's pictures and fonts as files in assets/ instead of embedded in math-quest.html.

Run it after any change that pastes new art into the page (for example a reward kit's export):

    python3 tools/externalize.py            # from the repository root

What it does (safe to run any number of times):
  1. every embedded picture or font (a data: URI) of at least MIN_BYTES (default 0: all of them) is written to assets/<sha1-12>.<ext>
     and replaced in the page by that relative path (the same content always gets the same name);
  2. asset files that the page (or another page of the repository) no longer mentions are deleted;
  3. assets.json (the list the service worker caches for offline use) is rewritten.
Prints a JSON summary. Nothing else in the page is touched.
"""
import base64, hashlib, json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
PAGE = os.path.join(ROOT, 'math-quest.html')
ASSETS = os.path.join(ROOT, 'assets')
MIN_BYTES = int(os.environ.get('MIN_BYTES', '0'))      # 0 = every picture and font becomes a file (the rule on main too)
EXT = {'webp':'webp','png':'png','jpeg':'jpg','jpg':'jpg','gif':'gif','svg+xml':'svg','woff2':'woff2','woff':'woff'}
RX = re.compile(r'data:(image|font)/([a-z0-9+.-]+);base64,([A-Za-z0-9+/=]+)')

def main():
    os.makedirs(ASSETS, exist_ok=True)
    html = open(PAGE, encoding='utf-8').read()
    made = {}
    def sub(m):
        ext = EXT.get(m.group(2))
        if not ext: return m.group(0)
        raw = base64.b64decode(m.group(3))
        if len(raw) < MIN_BYTES: return m.group(0)
        name = hashlib.sha1(raw).hexdigest()[:12] + '.' + ext
        path = os.path.join(ASSETS, name)
        if not os.path.exists(path): open(path, 'wb').write(raw)
        made[name] = len(raw)
        return 'assets/' + name
    page = RX.sub(sub, html)
    if page != html: open(PAGE, 'w', encoding='utf-8').write(page)
    # which asset files are still used by any page of the repository
    used = set(re.findall(r'assets/([0-9a-f]{12}\.[a-z0-9]+)', page))
    for f in os.listdir(ROOT):
        if f.endswith('.html') and f != 'math-quest.html':
            used |= set(re.findall(r'assets/([0-9a-f]{12}\.[a-z0-9]+)', open(os.path.join(ROOT, f), encoding='utf-8').read()))
    present = {f for f in os.listdir(ASSETS) if re.fullmatch(r'[0-9a-f]{12}\.[a-z0-9]+', f)}
    stale = sorted(present - used)
    for f in stale: os.remove(os.path.join(ASSETS, f))
    kept = sorted(present - set(stale))
    json.dump(kept, open(os.path.join(ROOT, 'assets.json'), 'w'))
    print(json.dumps({'page_bytes': len(page.encode()), 'new_files': len([n for n in made if n not in present]), 'assets': len(kept), 'asset_bytes': sum(os.path.getsize(os.path.join(ASSETS, f)) for f in kept), 'removed_stale': len(stale)}))

if __name__ == '__main__': main()
