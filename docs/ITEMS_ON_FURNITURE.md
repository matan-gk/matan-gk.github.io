# Things on furniture

Small things can stand on tables, desks, toy boxes and the visible part of the bed. Built in phases; this file is the design and its status.

## Decisions (Matan, 2026-11-07)
- Tapping a thing that stands on furniture selects that thing, and the drawer offers a simple button to switch to the furniture under it. (Phase 2.)
- The surface grid may become finer later (a 2x2 sub-grid per cell, so a pile of books and a jar of crayons can differ in size). Phase 1 is built so that this is a constant change: see "Surface units".
- The bed only takes things on the visible part of its top (not where the frame, curtains or footboard cover it).
- Plants may stand on furniture.
- Deleting furniture puts everything on it into the inventory. The delete button says so, only when there is something on it.

## Data
- Every thing has an id `u` (unique, `/^[a-z0-9]{4,12}$/`; old saves get them in `spaceClean`).
- A thing standing on furniture has `on: {h, dx, dy}`: `h` = the host's `u`, or `'bed'`; `dx,dy` = its place on the host's top in surface units from the top's back corner. Its `x,y` are the world cell that holds it (kept in step by `settleSurfaces`); a thing in the inventory has `x,y = -1` and no `on`.
- Hosts: catalog `top: {c:[dx,dy,w,d], z}` (cells inside the host's footprint, and the height above the floor in room units): low table, desk, turned desk, 3 toy boxes. The bed: `BED_TOP[level]`. `z` values are estimates until phase 3.
- Who may sit: `canSit(c)`: one-cell solid things not taller than `SIT_MAX_H` (160, so plants yes, easels no); `c.sm = 1/0` forces yes/no. No rugs, no 2x2 things, nothing on a sitter, a host cannot sit.

## Rules (`surfFree`, `settleSurfaces`, `spaceClean`)
- One thing per surface cell (per surface unit, with `c.ss` as the size in units, default one cell).
- A sitter does not count as a floor thing (`footFree`, `stowBlocked`); the host blocks the floor under it as before.
- `settleSurfaces()` runs after a move, a delete (put away) and a bed level change: sitters follow their host; those with no valid place on it go to the inventory.
- `spaceClean` validates a save in two passes (floor things first, so order in the list does not matter) with the same `surfFree`. A malformed `on` is ignored; a well-formed one that fails sends the thing to the inventory, never to the floor.

## Surface units (sub-grid later)
`SURF_SUB = 1` surface unit per cell. To get a finer grid: raise `SURF_SUB` (e.g. 2), give items that are bigger than one unit `ss`, and saved `dx,dy` are multiplied by `SURF_SUB / space.sub` on load (`space.sub` records the unit a save was made in). A thing's own `x,y` stay whole cells. Not built yet: rendering/tapping at sub-cell positions and per-item sizes.

## Phases
1. **Data, rules, save cleaning, tests, delete note** (this branch, `items-on-furniture-p1`). Nothing is drawn or tappable yet.
2. **Rendering and interaction** (branch `items-on-furniture-p2`, done): a host and its sitters are drawn as one group (sitters right after the host, lifted by the top's `z`, with their small shadow on the surface; things on the bed right after the bed). While a small thing is being placed or moved, the free cells of every top are lit (`.rmtop`, dashed white diamonds at the surface height); tapping one chooses it (`topCellAt`: the pointer is brought back down to the floor plane per host, the front-most top wins), tapping the floor chooses the floor. A sitter's drawer has move, delete and a button "select the table / the bed" (`data-host`). Moving a sitter can end on the floor or on another top; moving a host shows its things in the preview and they follow it. `z` values are still estimates, so things look a little too high or low until phase 3.
3. **Calibration** (branch `items-on-furniture-p3`, done): `tools/surfaces.py` measures each host's top from its picture and writes the numbers into the page: the top face is cut out of the sprite (colour flood fill with outline barriers) and the height `z` comes from the face's extents (`z = 25 * (footprint width - (a_min + a_max))`, same for depth; the two must agree within 4). Measured: low table 27, desk and turned desk 110, toy boxes 53 / 56 / 53 (the strapped chest is cut in pieces, tolerance 10). The bed's picture is not a pure extrusion of its footprint, so each level has a measured height and a sideways shift `ox` (the mattress sits about 30 room units to the right of the footprint diamond), and the visible cells are those where at least 60% of the lifted cell lies on blanket or sheet and under 50% on the pillow: levels 1-3 take the nine cells behind the pillow (rows 1-3), level 4 four cells, level 5 three. `top.ox` and `top.cells` are in the catalog / `BED_TOP`; `topOf`, `surfFree`, drawing and tapping honour them. `python3 tools/surfaces.py --check` (run by `tests/surfacegroundtest.js`) fails if the page's numbers stop matching the pictures. Beds 4 and 5 have a looser fit than 1-3 (canopy and curtains hide most of the mattress).
4. **Polish and messages** (branch `items-on-furniture-p4`, done): a bed level preview draws the sitters on that level and hides those that would not fit; the preview drawer and a one-time notice after switching or buying a level say how many things go to the inventory; save and reload test.
