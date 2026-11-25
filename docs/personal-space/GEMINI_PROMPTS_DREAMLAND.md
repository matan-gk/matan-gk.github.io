# Gemini prompts: dreamland set (sheet d1) and what it still needs

Companion to `GEMINI_PROMPTS_UNICORN.md` and `GEMINI_PROMPTS_WALL3D.md` (same camera, method and rules). Sheet d1 (`art/sheet-d1-dreamland.jpg`, 81 pastel pixel-art items in a loose 9 x 9 grid) gave 55 new room items (`tools/items7.py`). The 26 others were not added: duplicates of items the game has, the beds, wall pieces and hanging pieces (listed at the end).

## What is required and what is optional
**Required:** nothing. The 55 items work as they are (they turn with the mirrored look, like the other items without a back picture).

**Optional, in the order I would do them**
1. **Back pictures (prompt B1, B2):** 9 items look wrong when turned because the front is not symmetrical (the vanity, bookshelf, dresser, moon chair, sofa, bench, unicorn bean bag, moon bed, cloud desk).
2. **Bigger redo of the 2x2 items (prompt R1):** the sheet is 1024 px for 81 items, about 110 px per item, so the big pieces look soft at full size. Nine are worth redrawing larger.
3. **Wall pieces (prompt W1):** the three shelves, the heart sconce, the cloud clock, which the sheet drew in the floor view.
4. **Beds (prompt D1):** the bed has five upgrade levels; the sheet's canopy, bunk and wooden beds can be the higher levels.
5. **Nine more items for the same world (prompt M1):** things the set does not have yet.

## Check before sending me a sheet (all prompts)
1. Feet on the diamond corners, the front foot lowest; nothing cropped; plain white background; no floor diamond or shadow drawn.
2. The same pixel-art look and line weight as the attached sheet (thin dark outline, pastel colours, small sparkles, gold or pearl trim).
3. One magenta (#FF00FF family) part per item, the one named; no other magenta.

---

## B1: back pictures, first nine (attach the 9 front pictures in this order, plus `room_template.png`)
Order: 1 star vanity, 2 rainbow bookshelf, 3 star dresser, 4 moon chair, 5 rainbow sofa, 6 star bench, 7 unicorn bean bag, 8 moon bed, 9 cloud desk. The pictures are the cut-outs in the game (`assets/`, or crop them from `art/sheet-d1-dreamland.jpg`: row 2 column 2, row 2 column 3, row 2 column 4, row 9 column 1, row 9 column 9, row 9 column 5, row 9 column 4, row 1 column 5, row 2 column 1).

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the pixel-art style, the line thickness and the colours exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same corners and feet on exactly the same pixels as the reference, the same height, the same colours, plain white background, no ground shadow, no floor lines, 15% empty margin, nothing cropped. Where an item has a magenta (#FF00FF) part, keep that part magenta and use no other magenta.

Draw ONE sheet of 3 columns x 3 rows, one cell per attached picture, in the order of the attached pictures:
1 STAR VANITY: we see the back of the star mirror (a plain gold panel with a small strut) and the back of the table: the drawer side hidden, a plain back board between the legs.
2 RAINBOW BOOKSHELF: we see the plain back of the arch (a smooth pastel panel, the rainbow stripes wrapping around the edge), no books, no shelves.
3 STAR DRESSER: we see the plain back panel of the dresser, the top still magenta, no drawers.
4 MOON CHAIR: we see the outer curve of the moon, a smooth crescent back with the golden rim, the legs, and only the edge of the cushion over the top.
5 RAINBOW SOFA: we see the back of the sofa, a smooth pastel panel with the rainbow arc on top, the backs of the two scroll arms, no cushions in front.
6 STAR BENCH: we see the back of the low backrest with the star seen from behind, and the seat from the other side.
7 UNICORN BEAN BAG: we see the back of the unicorn: the rainbow mane down the back, the ears and horn from behind, a little fluffy tail; no face; the seat cushion hardly visible.
8 MOON BED: we see the outside of the crescent, a smooth golden curve, with only the top edge of the cushion visible.
9 CLOUD DESK: we see the cloud top from the other side with the drawer unit on the other side, the legs, and a plain back.
```

## R1: bigger redo of the nine 2x2 items (attach `art/sheet-d1-dreamland.jpg`, `room_template.png`)
Same items as in the sheet, drawn larger with more detail. Send it as a 3 x 3 sheet (1 item per cell, about 340 px each) so each item has three times the pixels.

```
Redraw nine items from the attached sheet, each one in its own cell of a 3 x 3 sheet on a plain white background, as large as the cell allows with 8% empty margin: row 1: the CRIB SWING WITH THE MOON (a wooden A-frame with two star finials, a crescent moon hanging in it, a crib with pink mattress and rails), the CRESCENT MOON BED (a big golden crescent bed with a yellow cushion), the CLOUD BED (a fluffy white cloud with a pink pillow). Row 2: the CLOUD DESK (a fluffy cloud top on four wooden legs with a small pink drawer unit), the MOON CHAIR (a golden crescent chair on three wooden legs with a pink cushion), the HEART POUF (a big tufted pink heart ottoman with a white ruffled skirt and small wooden feet). Row 3: the UNICORN BEAN BAG (a white plush unicorn bean bag with a golden horn, rainbow mane and a pink seat cushion), the HANGING CLOUD SWING (a cloud seat with a pink cushion hanging from two ropes), the RAINBOW SOFA (a lilac two-seat sofa with scroll arms, a rainbow arc over the back, and two pink cushions).
Keep exactly the pixel-art look of the attached sheet: visible square pixels, a thin darker outline, soft pastel colours, small sparkles, gold or pearl trim, light from the top-left; isometric 2:1 view looking down about 30 degrees, every horizontal edge at 26.57 degrees, no perspective. Keep each item's pink/magenta part (the cushion, mattress, pillow, seat, pouf top) as flat magenta (#FF00FF) with lighter and darker magenta shading, and no other magenta. No text, labels, grid lines, floor shadows or floor diamonds.
```

## W1: wall pieces (attach `wallitem_template_art_a.png`, `vision-room.jpg`, `art/sheet-d1-dreamland.jpg`)
Method and camera as in `GEMINI_PROMPTS_WALL3D.md` (read its "Camera" part first). Replace its Prompt A1 item list with these five and use "Style B" there.

```
The 5 wall items, in reading order: (1) a CLOUD WALL SHELF: a fluffy cloud with a lilac shelf board in front of it, holding a few pastel books and a small pom-pom; (2) a STAR CRYSTAL SHELF: a big gold star frame holding blue and lilac crystals on a lilac shelf; (3) a RAINBOW ICE-CREAM SHELF: a rainbow arch with a lilac shelf board holding three ice-cream cones; (4) a HEART WALL LAMP: a glowing magenta heart-shaped lamp on a short gold wall bracket; (5) a CLOUD WALL CLOCK: a white cloud with a round clock face with lilac hands and numbers 12, 3, 6, 9.
```

## D1: bed levels (attach the current bed pictures from the game, one per level, plus `art/sheet-d1-dreamland.jpg`)
Needs a decision first: which sheet beds become which level (my suggestion: level 3 the wooden heart bed, level 4 the bunk bed, level 5 the canopy bed). The bed must keep its footprint and the four colourable parts the game uses today (pillow, blanket and the others), so send me the current five bed pictures with the parts named and I will write the exact prompt.

## M1: nine more items for the same world (attach `art/sheet-d1-dreamland.jpg`, `room_template.png`)
Ideas the set does not cover yet; each has a magenta part.

```
Draw ONE sheet of 3 columns x 3 rows on a plain white background in the exact style of the attached sheet, one item per cell: (1) a UNICORN WARDROBE (two doors with a golden horn on top and a rainbow stripe), magenta door panels; (2) a CLOUD DESK CHAIR (a puffy cloud seat on a gold swivel base), magenta cushion; (3) a PLAY KITCHEN (a small pastel kitchen with a stove, a sink and a little oven), magenta counter; (4) a READING NOOK (a small canopy with a big cushion and a pile of books), magenta cushion; (5) a DOLL CRIB (a small white crib with a heart cut-out headboard), magenta mattress; (6) a PUPPET THEATRE (a small stage with striped curtains and a star on top), magenta curtains; (7) a BALL PIT (a round soft pen full of pastel balls), magenta rim; (8) a MINI TRAMPOLINE (a round pastel trampoline with a handle bar), magenta mat; (9) a SHOE RACK (a two-level lilac rack with three little pairs of shoes), magenta shelf board.
Footprints: 1 = 2x1, 2 = 1x1, 3 = 2x1, 4 = 2x2, 5 = 2x1, 6 = 2x1, 7 = 2x2, 8 = 2x2, 9 = 2x1.
```

---

## What was not taken from sheet d1
- Already in the game: grand piano, xylophone, drum, abacus, globe, easel, star rug, plush unicorn, star pouf, music box, stacking blocks, treasure chest, star lamp, light pole, three star cushions, fluffy heart cushion.
- Beds (row 1: canopy bed, bunk bed, wooden bed): kept for D1.
- Wall pieces (row 8: three shelves, cloud clock; row 3: heart sconce): kept for W1.
- Hanging pieces (row 3: rainbow, cloud mobile): the room has no ceiling to hang them from.
