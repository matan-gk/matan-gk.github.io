# Cupcake Quest: tests

One command runs every check on the game (`math-quest.html`) and the admin page (`admin.html`).

## Run

```
cd tests
npm install          # once: installs Playwright
npx playwright install chromium   # once, if you have no Chromium (skip when CHROMIUM is set)
node run.js          # everything (about 1.5 minutes)
node run.js --quick  # skips the two slow tests (about 40 seconds)
node run.js --only famtest,sections
node run.js --list
```
The folder is expected to sit next to the game, so `../math-quest.html` and `../admin.html` are found. To test another copy: `GAME=/path/to/math-quest.html ADMIN=/path/to/admin.html node run.js`. To use your own browser: `CHROMIUM=/path/to/chromium`.

Output is one line per test (`PASS` / `FAIL` with the first reason) and a final summary; the exit code is 1 when anything fails. Each test's full log and its screenshots are in `_out/<test>/`. A test passes only when it exits cleanly, prints no `FAIL`, and shows no page errors.

## What is covered
Run `node run.js --list` for the current list. In groups:
- **Questions:** every generator gives a valid question with an answer among distinct choices (`ut`, `newtypes`, `nt2test`, `shoptest`, `shapetest`, `clocktest`, `pairtest`); sections, areas and bonus pools are consistent (`sections`); difficulty ratings and coverage (`difftest`, `settingtest`); help pages (`helptest`).
- **Layout and wording:** no broken images, shapes never split across lines, level buttons fit from 320 to 1280 px (`sprtest`, `grptest`, `lvtest`, `it`, `ft`); boys and neutral profiles never see girl-form wording (`gtest`).
- **Split build:** the small page plus assets folder loads every picture and icon like the single file (`splittest`).
- **Layered rewards:** item format, one-time migration, rarity, remembered merges and looks, all 780 cupcake combinations fit (`layerstest`).
- **Selection screen and locations:** home shows only the game buttons; opening a game shows its backdrop, location title and a back button; themes without backdrops get a neutral background (`loctest`).
- **Progress and saving:** stats engine and storage (`engtest`, `st`), save codes (`codectest`, `sct`), merging and unmerging (`unmtest`).
- **Parent area:** top menu and navigation (`menutest`), full-screen layout, tabs and shared controls on phone and desktop (`admintest`).
- **Cloud:** sync planner (`plantest`), Google-account sync with two devices, conflicts, offline and the daily write budget (`cloudtest`), and the family model: anonymous backup, family codes, joining, moving from the old structure (`famtest`). These run against a fake Firebase (`cloud/mock_init.js`), so no network or account is used. The Firestore **rules** are not covered here; check them in the Rules playground as described in `firebase/SETUP.md`.
- **Space stories:** every question type in both themes (no sweets wording in space, no space wording in sweets), item pools, the phrase map, help examples, praise, wrong-answer, bonus and party wording (`storytest`).
- **Space collectibles:** 14 + 14 pictures and Hebrew names, the equipment-store and upgrade wording, the bonus trophy, extra mascot poses, the sweets theme unchanged (`rewardtest`).
- **Space sections:** the 8 section pictures and names, the gendered first name, hidden sections, the parent area keeping the default names (`leveltest`).
- **Space mascot:** all 8 moods show different robot pictures at the same height, the puzzled reaction after a wrong answer (space only), worn looks, no broken picture when switching theme (`mascottest`).
- **Themes:** the theme is per profile and saved, light and dark space palettes with contrast checks, the parent area keeps the default palette, picture lookup falls back to the default, the settings card and coverage report (`themetest`).
- **Warm-up first:** the first 5 questions of a session come from "solid" types, then normal; no solid type means normal; bonus untouched; a new session warms up again; per profile, saved (`warmtest`). Also covered: the top-right menu has only the profile switcher and the parent-area item (`menutest`).
- **Focus on weak spots:** the 4-in-10 share, "needs practice" then "on the way" fallback, no data means normal, stays inside the section and hidden types, bonus untouched, per profile, saved (`focustest`).
- **Question matrix:** the simple level switches behave as before, cells and hidden types change what is drawn (also in the mix), sections leave the child's menu, per profile, saved, an empty game is refused (`mxtest`).
- **Wrong-answer labels:** the kinds of mistake (off by one, off by ten, swapped digits, sign flip, double/half, tens or ones digit) and when the Progress tab shows them (`labeltest`).
- **Home screen and offline:** manifest and icons, service worker, offline reload, update notice, iPhone instructions, installed state (`pwatest`; starts its own local web server).
- **Admin page:** read-only, loading on request, filters, export, no write controls (`adminpage`).

## Keeping it current
- Pure logic (stats engine, save-code codec, sync planner) is read from the game file at run time, so those tests never test a stale copy.
- Every change to the game or admin page should come with a new or updated test, and the whole suite should pass before publishing.
- To add a test: put `my.js` here, start it with `const T=require('./lib.js');`, open the game with `T.URL` and launch the browser with `chromium.launch(T.launchOpts)`. Print `FAIL ...` lines (or exit 1) when a check fails and `ALL PASS` at the end. Then add one line to the `TESTS` list in `run.js`.
- Known note: at 320 px wide a few answer choices can be wider than the screen; `grptest` reports it but does not fail on it.
