# Turning items: plan (branch `rotate-plan`)

**Status:** phase 1 is built (branch `rotate-mirror`, ENHANCEMENTS Step 20). Differences from the plan: the old turned pictures were not kept as the `o: 1` art (the mirror is used for all, they differ by about 2%), so the four duplicates are simply removed and migrated; the turn button is in the thing's drawer, the placing drawer and the bed's drawer.

Goal: any placed item, and the bed, can be turned (a turn button in its drawer and while placing). The table and bed are the first cases; everything directional should work.

## What I found (facts, not guesses)
- The game already uses one facing per picture and a mirror for the other: `GEMINI_PROMPTS.md` says "the game mirrors it for the other facing". The three existing "turned" catalog entries (`desk_turn`, `chair2`, `slide2`) are almost exact mirrors of their originals (measured: mean pixel difference desk 5/255 against 76/255 unmirrored). So **two of the four facings need no new art**.
- Only 15 places read an item's footprint (`fwOf`/`fdOf`), so footprint-by-orientation is a small change.
- Mirroring can be done at draw time (SVG flip about the footprint diamond's vertical centre line; the diamond of W x D maps exactly onto the diamond of D x W), so no new asset files, masks or recoloured copies are needed for the mirrored view. The bed's masks and the magenta recolouring are applied before drawing, so they flip with the picture.
- 83 catalog items: 46 look the same from every side (21 plants, rugs, balls, small desk toys, cushions, table, track pieces, globe, blocks...), 3 are the already-turned duplicates, 34 are directional, plus the bed (5 levels).

## The model
- A placed thing gets `o` (0-3, default 0, saved). `o` is a number of 90-degree turns: 0 = the picture as drawn (faces front-right), 1 = mirrored picture (faces front-left), 2 = back view (faces away, upper-left), 3 = mirrored back view (upper-right). Odd `o` swaps the footprint (fw x fd -> fd x fw).
- Items without back art (all of them at first) toggle 0 <-> 1 only. Items with back art cycle 0-1-2-3.
- Items that are symmetric (`sym`) get no turn button. A square footprint that is symmetric (plants, balls, round rugs) never needs one.
- The bed: `space.fix.bed = {x, y, o}`; the same states. `bedFp` and `BED_TOP[level].cells` swap/reflect for odd `o`; the bed's masks flip with the picture.

## Geometry rules
- Turning pivots on the footprint's centre: the box W x D at (x, y) becomes D x W centred on the same point (the differences are all even in units, so no rounding).
- It must fit: inside the room, not on another floor thing or the bed, rugs only against flat things. If it does not fit where it is, try the nearest fitting shift up to 2 units; if none, a short notice ("no room to turn here") and nothing changes.
- A host turns rigidly with what is on it: each sitter's `on.dx,dy` is transformed with the same box rule and the sitter's own `o` goes up by the same step, so a teddy on a turning table turns too. Sitters are always 1x1 or 2x2 units, so they always still fit. The host's top box (`top.c`, `BED_TOP.c`) is transformed the same way; `z` is unchanged. `settleSurfaces` re-validates as usual.
- The room page's depth order, hit areas, selection outline and the placing ghost all use the thing's oriented footprint (one helper, `footOf(t)`).
- Catalog entries `desk_turn`, `chair2`, `slide2` (and `soccer2`, a ball) fold into the original item with `o: 1` (the old pictures are kept as that item's art for `o: 1` so nothing changes visibly). Saves that contain them are migrated in `spaceClean` (`chair2` keeps its pink through the thing's own colour `c`). The catalog shows one card per item.

## Phases (each its own branch; each ends with tests, docs and a version bump)
1. **`rotate-mirror` (no new art).** `o` and `footOf`, draw-time mirroring (art `r` reflected about the diamond's centre line), the turn button (thing drawer and placing drawer), fit/shift rules, sitters turning with the host, bed and its sitters, the migration, hide the button on `sym` items, notice texts. Tests: footprint swap, mirrored `r` lands on the swapped diamond's corners (numeric, like `groundtest`), tops reflect correctly (host with items on it, `tools/surfaces.py` stays valid because the pictures are unchanged), turn blocked by a neighbour and by the wall, migration of the three turned items and a save round trip, the bed turn with things on it, `gridtest`/`surfaceuitest` still pass.
2. **`rotate-back-1` (art batch A+B: the furniture and the bed).** Back views (`o` 2 and 3) for chair, armchair, cloud sofa, desk, wardrobes, bookshelf, piano, dollhouse, mirror, toy boxes, costume box, and the five bed levels. Per picture: `tools/ground.py` fit (its own `r`), `tools/surfaces.py` for hosts (desk, toy boxes: top face seen from the other side), `tools/parts.py` for the bed masks, `back`/`backBase` added to the catalog entry, `groundtest` and `surfacegroundtest` cover them.
3. **`rotate-back-2` (batches C and D).** Slides, easels, telescope, laptops, tablet, cars, guitars, sax, book, and the characters (monkey, bunnies, teddy, unicorn doll, ladybug). Characters are the lowest value; they can wait.

## Decisions I made (say if you want any of them different)
1. Pivot on the centre, not the back corner.
2. Items with no back art toggle between two facings (no "facing away" until its art exists).
3. Sitters turn with the host (rigidly) instead of staying put.
4. The turned duplicates disappear from the catalog (their saves are migrated).
5. Mirrored views keep the picture's light direction mirrored too (light from the top-right). The art rule "light from the top-left" is already broken by the game's mirroring today.

## Known limits
- A mirrored picture mirrors any one-sided detail (the art prompts already say none). The back views are new pictures, so those details can differ.
- Drag-to-turn and free-angle rotation are not planned; this is 90-degree steps only.
- Wall items (the window) are not turned (they already pick a wall).

## Art for phase 2 and 3
See `docs/personal-space/GEMINI_PROMPTS.md`, section G. Total 39 pictures: batch A (14 furniture), B (5 bed levels), C (14 play items), D (6 characters).
