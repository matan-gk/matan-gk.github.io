# Room polish plan

Goal: close the gap between the original vision of Cupcake's room (a painted, lit, dense, themed scene) and the room as built (good separate sprites in a flat, empty box), **in any colour the room is set to, rainbow included.** No lavender default.

Evidence: `room-polish/mock-stages.png` (today, then each step on the rainbow room) and `room-polish/mock-colours.png` (the same treatment on white, pink, blue, green, navy and rainbow). The mock-up is a throwaway layer drawn over the live room (`room-polish/mockup-*.js`, run with Playwright); it changed nothing in the game.

## What is required and what is optional

**Required (this is the plan):**
- **A. Atmosphere layer** (code only, no new art).
- **B. Wall decor** (wall items, using the wall mounting that already exists).
- **C. Themed furniture sets** (new art, four sheets).
- **0. One safety fix first:** an older build must not delete items it does not know (see Step 0).

**Optional (decide later, none blocks the rest):**
- **D1.** A "finish" colour for the wooden frames of the existing furniture, so old pieces match the new sets.
- **D2.** Ceiling lights (a chandelier hanging from the ceiling).
- **D3.** A balcony railing and clouds at the room's front edge.
- **D4.** One-tap room themes (a bundle of wall, floor and decor choices).

---

## Step 0: a safety fix before more art (required, small)

`spaceClean` (the sanitiser the room goes through on load and save) drops every placed thing whose item id it does not know (`.filter(t=>catOf(t.k))`). So a device still running an older build **deletes** a new item from the saved room the next time it saves. Every earlier art batch carried this risk; the plan adds roughly 50 more items.

Fix, once: keep unknown things as they are (not drawn, not counted, not editable) and write them back untouched. Then new items are safe to ship in any order. This is a normal code change on its own branch with a test (an unknown item id survives a load/save round trip; it is not drawn; it does not affect counts or prices). It needs no format bump if the kept things stay in the same `things` array; otherwise bump `CLOUD_DOC_V` once.

---

## A. Atmosphere layer (colour-agnostic)

Rendering only (`roomSVG`); nothing is saved, so **no sync format change**. It is drawn in three groups so that clicking and previews still work (every group has `pointer-events:none`):

1. **Shell dress**, inserted right after the three surfaces (walls and floor), before the window:
   - corner shadow on both walls (a horizontal gradient toward the back corner), a soft light-to-dark gradient from ceiling to floor;
   - baseboards (26 px) and crown moulding (22 px), and a lighter corner post;
   - floor sheen (one diagonal highlight) and tile bevel (the grid lines repeated in light, 1.8 px lower);
   - **colours are derived from the chosen surface colour, not fixed**: the shadow is the surface colour darkened and shifted toward blue-violet; trim is the surface colour lightened toward white. In the mock-up they were fixed violet-grey, which dirtied white walls slightly (see the white room).
2. **Light**, inserted right after the window: a soft glow around the window, a beam from the window to the floor, and a light patch on the floor. Moves with the window (`winAtFor`); not drawn if the window is stowed.
3. **Overlay** at the very end: a vignette (about 26% at the edges, lighter than the first mock-up, which greyed the rainbow) and 12 to 14 small sparkles placed at fixed positions (no animation; optional slow twinkle later).

Plus one **grade on the things**: a single filter on the group holding all floor items (not one per item), a slight cool shift and a soft violet glow, so the pieces look lit by the room.

**Rainbow and very saturated colours:** a milky layer (white, 30 to 40%) over walls and floor when the colour is rainbow or highly saturated (saturation measured from the colour), a lighter one (about 10%) otherwise. Result: rainbow reads as pastel rainbow.

**Setting:** on by default, with an "atmosphere" toggle in the room's settings (stored in the profile, the one new saved value; a tiny format addition, see "Format and rollout"). Reason: SVG filters on a weak tablet.

**Performance budget (acceptance):** room redraw under 40 ms on a mid phone profile (Playwright CPU throttle 4x), no per-item filters, one filter on one group; if the room is panned or zoomed the layers are not re-created.

**Tests (new `tests/atmotest.js`):** the three groups exist in order; they never intercept clicks (selecting, placing, the window, wall items still work); colours follow the surface colour (white, pink, navy, rainbow produce different but valid fills); toggle off removes all of it; stowed window removes the light; no page errors; existing room tests unchanged.

**Size:** about one day. Branch `room-atmosphere`.

---

## B. Wall decor (wall items, no new mechanics)

The wall mounting is built (step 40). New items are just more wall items. The vision's walls were full of shelves of sweets and crystals, so the shelves come **pre-arranged as one picture each** (a glass shelf with its things on it, drawn in the style), instead of building a shelf system where things sit on shelves. That is far cheaper, looks like the vision, and the mock-up's "upright sprites on a shelf" approximation then becomes real art.

Wall items (price in tokens; width in wall pixels, the wall is 500 wide; all new pictures flat on the wall, sheared like the clock):

| Item | Price | Width |
|---|---|---|
| Crystal shelf (glass shelf with crystals) | 4 | 260 |
| Sweets shelf (bubble teas) | 4 | 260 |
| Ice-cream shelf | 4 | 260 |
| Plushie shelf (unicorn, star) | 4 | 260 |
| Bunting (pennant string) | 3 | 440 |
| Number frames (set of 3 small frames with big digits) | 3 | 200 |
| Unicorn picture | 3 | 100 |
| Rainbow arc | 3 | 220 |
| Stained-glass panel (small, decorative, not the window) | 4 | 130 |
| Moon and stars mobile (hangs on the wall) | 3 | 130 |

One art sheet (10 items, wall pictures, no back pictures, no magenta needed) plus `tools/walls.py` (already cuts and fits wall items; extend its table). Bunting colours: baked in a mixed pastel, deliberately not recolourable.

**Needed code (small):** wall item width up to 440 (the wall clamp already works from the picture's own size); a "wall" list order so the new items sit after the clock and map. Tests: `walltest.js` extended (each new item places on both walls, never overlaps, survives reload).

**Size:** about half a day for code and cutting, plus one Gemini sheet. Branch `wall-decor`.

---

## C. Themed furniture sets (the biggest visible change)

Why it matters: after A and B the room is lit and has walls, but the pieces are still generic wood and white. The vision worked because everything belonged to one world. Four sets, nine items each (the same sheet size and method as sheets c1 to c4), each with a consistent palette and motif.

**Style bible (add to every prompt, and attach two accepted sprites from the game as style references):** same camera, outline weight and lighting as `GEMINI_PROMPTS.md`; light from the upper left; soft pastel pigments, a thin pearly highlight on top edges; gold or white trim instead of plain brown wood; one recolourable magenta part per item (as today); no floor shadow, no floor diamond. Rejection test: place the cut item in the room beside the bed and the cloud sofa; if it looks like it came from another game, redo.

### C1. Numbers set (the game's own theme; most important)
| Item | Price | Notes |
|---|---|---|
| Hopscotch number rug 0 to 9 | 4 | flat rug, as in the vision |
| Number block stack (cubes with hearts and stars) | 5 | 2x2, back picture |
| Number-candle floor lamp | 4 | 1x1 |
| Chalkboard easel with digits | 4 | back picture |
| Number abacus tower (bigger, themed abacus) | 4 | |
| Counting-bead table | 5 | holds small things on top |
| Number cushion set (3) | 3 | |
| Giant number clock stand | 4 | |
| Number mobile stand | 3 | |

### C2. Crystal set
Crystal cluster on a pedestal (4), crystal lamp (4), crystal bed-side table (4, with a top), crystal ottoman (4), amethyst vase with flowers (3), crystal tree (5), geode bowl (3), prism on a stand (3), crystal planter (3). Colour part: the pedestal or base.

### C3. Candy and sweets set
Cupcake stand (4), ice-cream cart (6, back picture), bubble-tea bar with two stools (6, back picture), candy jar tower (3), sprinkle rug (4), donut cushion (3), macaron side table (4, with a top), candy-floss lamp (4), cookie jar (3).

### C4. Cloud and unicorn set (the vision's bedroom)
Cloud armchair (5, back picture), cloud ottoman (4), unicorn standing mirror (5), rainbow curtain stand (4), unicorn rocking horse (6, back picture), heart bed-bench (5, back picture), plush unicorn throne (6, back picture), star pouf (3), cloud lamp (4).

Plus four topiary plants (cube, cone, ball, spiral; 2 to 3 tokens each) and the vision's cube planters, as a small extra sheet shared with plants.

**Per set the work is the proven pipeline:** write the sheet prompt (front and back, as in `GEMINI_PROMPTS_BATCH3.md`), you generate with Gemini, I cut with `tools/items*.py`, fit footprints, bake colour parts, measure tops with `tools/surfaces.py`, add back pictures with `tools/backart.py`, wire the catalog, add part names, update the tests' counts and price sum, docs, version. Each sheet is one branch (`room-items-5` to `room-items-8`, then topiary). Pricing stays 3 to 6; the total of everything buyable grows by about 150 tokens, so **the "max-out" cost and any progress text that quotes it must be rechecked** (tests already cover the price sum).

**Size:** the art is the bottleneck: four sheets of front art, about four of back art, plus redos. Integration is about half a day per sheet.

---

## Optional extras

- **D1. Finish colour for wood frames.** Add one more recolour channel (key `wood`) for the brown frames of bed, desk, chair, table, bookshelf and wardrobes, so an old desk can be white, gold or lilac like the new sets. The brown can be found by hue, so masks come from the existing pictures with no new art. Prototype on three pieces first; adopt only if it looks clean at the edges. Cost per extra key: 19 tokens in the max-out total, and a rise in saved format (item option). Closes most of "old pieces look like another set" without redrawing them.
- **D2. Ceiling lights.** A new placement kind that hangs from the top (the vision's number chandelier). New code (placement UI, its own draw layer), a sprite sheet of 6 lamps. About two days.
- **D3. Balcony railing and clouds.** A room-frame upgrade drawn along the two front edges, like the window levels. A small art sheet and a render group. About one day.
- **D4. One-tap room themes.** Bundles (for example "Crystal": the set's pieces and a wall colour pair) for people who do not want to arrange. Only after C.

---

## Order of work

1. **Step 0** (safety fix), `unknown-items-safe`.
2. **A** atmosphere, `room-atmosphere` (can run in parallel with art being generated).
3. **B** wall decor sheet, `wall-decor`.
4. **C1 numbers**, then **C4 cloud and unicorn**, then **C2 crystal**, then **C3 candy** (the order puts the game's own theme and the vision's bedroom first), each its own branch.
5. Optional **D1** prototype after C1 so the old furniture can be judged next to a new set.

Every branch follows the usual routine: off the latest branch, version bump, `docs/ENHANCEMENTS.md` step, tests added or updated and run, commit with a short subject and the longer detail in the body, push, you merge.

## Format and rollout

- A saves one new value (the atmosphere toggle) in the profile; if it is kept out of the room data (profile settings, not `space`) there is no format change, otherwise it is one small bump. Decide when A starts.
- Items add catalog ids only. After Step 0 an older build keeps what it cannot show instead of deleting it.
- The wall decor adds no new saved fields (it uses `wl`, format 4).
- No change to the Firebase console rules at any step.

## Decisions I need from you

1. Atmosphere on by default with a toggle (my recommendation), or always on?
2. The numbers set first (my recommendation), or the unicorn bedroom?
3. Should the shelves be pre-arranged pictures (recommended), or a real shelf where she places her own things (a much larger feature, new surfaces on walls)?
4. Optional D1 (wood finish): worth a prototype after the numbers set?
