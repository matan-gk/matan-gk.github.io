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
2. Rendering (host and sitters sort as one group; sitter raised by `z`, small shadow on the surface), placement UI (raised highlighted tops while placing a small thing), tap-to-select with the "switch to the furniture" button, move between floor and surfaces.
3. Calibration: `tools/surfaces.py` measures each host's top plane, the bed's visible cells and `z` from the sprites/masks; a numeric test checks a sitter's lowest pixel against the top cell centre (like groundtest).
4. Polish, messages (e.g. when a bed upgrade puts things in the inventory), docs, full suite.
