# How the repository works (since 2026-11-05)

This repository **is** the site (GitHub Pages) and **is** the source of the game. There is no separate single-file source and no build step before publishing.

## Layout
| Path | What it is |
|---|---|
| `math-quest.html` | the game: code, styles, texts, data. About 550 KB. Pictures are links to `assets/`; only pictures under 2 KB stay inside |
| `assets/<hash>.<ext>` | every picture and font (content-hashed names: the same picture always has the same name) |
| `assets.json` | the list of asset files, written by `tools/externalize.py`; the service worker caches it for offline use |
| `sw.js`, `manifest.webmanifest`, icons | offline support and home-screen install; `VERSION` in `sw.js` must equal `APP_VERSION` in the page (a test checks it) |
| `admin.html`, `firebase/` | the read-only admin page and the Firebase setup notes and rules |
| `tests/` | the Playwright test suite: `cd tests && node run.js` (about 4 minutes), one test with `node <name>.js` |
| `tools/externalize.py` | moves any picture pasted into the page out to `assets/`, deletes unused asset files, rewrites `assets.json` |
| `docs/` | `ENHANCEMENTS.md` (status and plan), privacy statement, categories, icons notes, the personal-space reference images and Gemini prompts |

The art kits (the sheets from Gemini, the cut parts, the `cut.py` / `compose.py` scripts) are NOT in this repository: they are large (about 80 MB) and are not part of the site. They live in the working folder as `reward-parts/<kind>/`. A kit's `compose.py export` produces the data that is pasted into the page; then `tools/externalize.py` turns its pictures into files.

## Making a change
1. Work on a branch (never directly on `main`): `git checkout -b <name>`.
2. Edit `math-quest.html` (and `sw.js` for a new version number).
3. If art was pasted into the page: `python3 tools/externalize.py`.
4. Run the tests: `cd tests && node run.js`.
5. Commit and push the branch; open a pull request; merging to `main` publishes the site.

## One-off checks
- The page must open from the file system too (the tests do exactly that); links to `assets/` are relative.
- The service worker pre-caches everything listed in `assets.json`, so a release that adds many pictures makes the first start after the update download them.
