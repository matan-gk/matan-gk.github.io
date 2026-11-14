# Gemini prompts for the next 36 room items (4 sheets of 9)

For Cupcake's room. Companion to `GEMINI_PROMPTS.md` (same camera, style and rules; they are repeated inside every prompt below, so each prompt can be pasted as it is). Prices are in tokens (current items cost 1 to 8).

## How to use
1. **Front sheet.** Open a new Gemini image request, attach `room_template.png` (this folder) and paste the sheet's front prompt. One request per sheet. If Gemini mixes up the projections on sheet 4, ask for the two wall items as a separate image.
2. **Check** (section F of `GEMINI_PROMPTS.md`): feet on the diamond corners, front foot lowest, nothing cropped. You can ask for a second copy with the footprint diamond in cyan under each item to see drift; send me the clean one.
3. **Back sheet.** Only for items that look different from behind. After the front sheet is accepted, cut each item from it (or send me the sheet and I cut them), attach the single pictures in the order of the list plus `room_template.png`, and paste the sheet's back prompt. If an item comes back as a front view again, use the single-item prompt at the end of this file.
4. Save as `art/<sheet name>.png` and `art/<sheet name>-back.png`. I then cut, fit (`tools/items2.py`, `tools/backart.py`), wire the catalog entries, colour parts, tests and docs.

Sheet 1 has 9 back pictures, so its back prompt is split in two (5 + 4) to keep them large.

Items that look the same from every side (round lamps, bowls, plants, rugs, abacus, drum, xylophone, hamster dome) need no back picture; the game just mirrors them. Wall items (clock, map frame) do not turn.

---

## Sheet 1: Big furniture and play structures (file `sheet-c1-furniture`)

| Cell | Item | Footprint | Price | Back picture |
|---|---|---|---|---|
| 1,1 | bean bag | 2x2 | 4 | yes |
| 1,2 | teepee reading tent | 3x3 | 8 | yes |
| 1,3 | hammock chair | 2x2 | 6 | yes |
| 2,1 | kids table with two small chairs | 3x2 | 6 | yes |
| 2,2 | nightstand with a drawer | 1x1 | 3 | yes |
| 2,3 | toy shelf with cubby boxes | 2x1 | 5 | yes |
| 3,1 | rocking horse | 2x1 | 5 | yes |
| 3,2 | little swing set | 3x2 | 8 | yes |
| 3,3 | cupcake shop counter | 3x1 | 7 | yes |

### Front prompt (attach `room_template.png`)

```
Draw ONE sheet of 3 columns x 3 rows on a plain white background. Each cell holds ONE item for a cute children's-room game, centered. The 9 items, in reading order:
- Row 1, column 1: BEAN BAG, footprint 2x2. Round soft bean bag chair, slumped, with a dent in the seat on the front side, a little carry handle loop on the back top, and a stitched seam. RECOLORABLE: the whole bag body (magenta); the handle and the stitches stay brown.
- Row 1, column 2: TEEPEE READING TENT, footprint 3x3. A children’s fabric teepee tent: four wooden poles whose tips cross at the top, fabric panels with a scalloped bottom edge, an open door flap tied back on the front side, a small pennant flag on the top, one plump cushion peeking inside the door. RECOLORABLE: the fabric panels (magenta); poles, flag and cushion keep their own colours.
- Row 1, column 3: HAMMOCK CHAIR, footprint 2x2. A hammock chair hanging from a freestanding wooden arched stand (an A-frame with a curved top arm), the round hammock seat of woven rope with a soft cushion, hanging a little above the floor; the stand’s feet stand on the diamond corners. RECOLORABLE: the cushion (magenta).
- Row 2, column 1: KIDS TABLE WITH TWO SMALL CHAIRS, footprint 3x2. A low round-cornered kids’ table with a flat top, and two small chairs, one on each long side, tucked a little under the table. The table top is empty and clean so that toys can be placed on it. RECOLORABLE: the two chair seats (magenta).
- Row 2, column 2: NIGHTSTAND WITH A DRAWER, footprint 1x1. A small cute bedside table: one drawer with a round knob on its front face, four short legs, a flat empty top so that things can be placed on it. RECOLORABLE: the drawer front (magenta).
- Row 2, column 3: TOY SHELF WITH CUBBY BOXES, footprint 2x1. A low wide shelf unit, two rows of three open cubbies, each cubby holding a fabric storage bin (some bins pulled out slightly), flat empty top, standing on four small feet. RECOLORABLE: the storage bins (magenta).
- Row 3, column 1: ROCKING HORSE, footprint 2x1. A wooden rocking horse with curved rocker runners, a soft mane and tail, a saddle blanket, a friendly simple face seen in three-quarter view. Floor contact is the two runners’ ends, on the left and right corners of the footprint. RECOLORABLE: the saddle blanket (magenta).
- Row 3, column 2: LITTLE SWING SET, footprint 3x2. A small children’s swing set: two A-frame side supports with one top beam, two swings with rope hangers and seats, hanging a little above the floor and NOT swinging (straight down). The four A-frame feet stand on the four footprint corners. RECOLORABLE: the two swing seats (magenta).
- Row 3, column 3: CUPCAKE SHOP COUNTER, footprint 3x1. A cute toy shop counter shaped like a long low cabinet, with a striped awning edge along the top front, a glass display case on the counter with three frosted cupcakes inside, and a little bell. The counter top is mostly flat and empty beside the display so that things can stand on it. RECOLORABLE: the awning stripes (magenta).

STYLE AND CAMERA (follow exactly). Use the attached grid template as the camera angle and scale reference. Isometric 2:1 view looking down about 30 degrees; every horizontal edge at exactly 26.57 degrees (rise 1 for every 2 across), no perspective convergence, no fisheye, no rounded-corner cheating on the base; the left and right base edges are mirror images of each other. Light from the top-left: the right side of every object is a little darker than the left, the top is lightest. Cute sticker style: thick dark-brown outline, soft pastel fills, glossy highlights. Plain white background, no ground shadow, no floor lines, no texture, no glitter or sparkles spilling outside the object. Every object faces front-right (towards the viewer, to the right). No text, no logos and no one-sided details that would look wrong when mirrored. FEET ON THE CORNERS: the legs, feet or lowest corners of each object's base touch the floor at the corners of its footprint diamond (left, front, right and the hidden back one); the front foot is the lowest point of the picture; nothing (cloth, rails, skirts, cords) hangs lower than the feet. Soft items have a flat base that fills the diamond, widest at the left and right corners. SCALE BY FOOTPRINT on the template's 10 x 10 floor (one tile is a diamond 100 px wide and 50 px tall on the template): a plant or small toy is 1x1, an armchair or toy box 2x2, a bed 3x4; an object's base sits exactly on its footprint diamond and taller parts rise straight up. ONE ITEM PER CELL: centered, uncropped, at least 15% of empty white margin on every side, nothing spilling into the neighbouring cell.

RECOLORABLE PART: paint the part named for each item in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta; every other part keeps its normal colours; do not use magenta anywhere else.

Do not add any text, labels, numbers, cell borders or grid lines to the picture. Nothing may be cut off at a cell edge. Output the sheet as one image.
```
### Back prompt part A (5 items; attach the 5 front pictures in this order, plus `room_template.png`)

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the line thickness, the colours and the sticker style exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it, and what was at the back is now nearest to us. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same four feet/corners on exactly the same pixels as the reference (so the back view can replace the front view without the item moving), the same height, the same colours, plain white background, no ground shadow, no floor lines, no sparkles or shadows added, 15% empty margin, nothing cropped. If an item has a magenta (#FF00FF) part, keep that same part magenta in the back view and use no other magenta.

Draw ONE sheet of 3 columns x 2 rows, one cell per attached picture, in the same order as the attached pictures:
- Picture 1, BEAN BAG: Turn it 180 degrees: now we see the plain smooth back of the bag, the carry handle loop and the seam; the seat dent is on the far side, mostly hidden.
- Picture 2, TEEPEE READING TENT: Turn it 180 degrees: now the door opening faces away from us; we see the closed fabric panels, the crossing poles and the flag. No door in the nearest face.
- Picture 3, HAMMOCK CHAIR: Turn it 180 degrees: now we see the outer back of the woven hammock seat with the cushion hidden in front of it, and the stand’s arched arm and rope hanger from the other side.
- Picture 4, KIDS TABLE WITH TWO SMALL CHAIRS: Turn it 180 degrees: the two chairs swap sides (the one that was nearest is now farthest); the table is the same.
- Picture 5, NIGHTSTAND WITH A DRAWER: Turn it 180 degrees: now we see its plain back panel with no drawer and no knob; the top and the four legs are the same.

Plain white background; nothing cut off at a cell edge; no text, labels or grid lines.
```
### Back prompt part B (4 items; attach the 4 front pictures in this order, plus `room_template.png`)

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the line thickness, the colours and the sticker style exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it, and what was at the back is now nearest to us. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same four feet/corners on exactly the same pixels as the reference (so the back view can replace the front view without the item moving), the same height, the same colours, plain white background, no ground shadow, no floor lines, no sparkles or shadows added, 15% empty margin, nothing cropped. If an item has a magenta (#FF00FF) part, keep that same part magenta in the back view and use no other magenta.

Draw ONE sheet of 3 columns x 2 rows, one cell per attached picture, in the same order as the attached pictures:
- Picture 1, TOY SHELF WITH CUBBY BOXES: Turn it 180 degrees: now we see its plain flat back panel, the cubbies are not visible; the top and the feet are the same.
- Picture 2, ROCKING HORSE: Turn it 180 degrees: the horse now faces away; we see its tail, its rump and the other side of the saddle blanket; the runners stay on the same corners.
- Picture 3, LITTLE SWING SET: Turn it 180 degrees: the swings are seen from the other side, the seats’ backs nearest; the frame and feet are on the same corners.
- Picture 4, CUPCAKE SHOP COUNTER: Turn it 180 degrees: now we see the staff side of the counter: a plain cabinet back with a small shelf holding a basket and a stack of cupcake boxes, the awning seen from behind; the display case is seen from its back.

Plain white background; nothing cut off at a cell edge; no text, labels or grid lines.
```

---

## Sheet 2: Lights, decorations and music (file `sheet-c2-lights-music`)

| Cell | Item | Footprint | Price | Back picture |
|---|---|---|---|---|
| 1,1 | cupcake lamp | 1x1 | 3 | no (same from every side) |
| 1,2 | floor lamp with a star | 1x1 | 3 | no (same from every side) |
| 1,3 | lava lamp | 1x1 | 3 | no (same from every side) |
| 2,1 | disco ball on a stand | 1x1 | 4 | no (same from every side) |
| 2,2 | string lights on a pole | 1x1 | 3 | no (same from every side) |
| 2,3 | crystal ball | 1x1 | 4 | no (same from every side) |
| 3,1 | music box | 1x1 | 3 | yes |
| 3,2 | xylophone | 1x1 | 3 | no (same from every side) |
| 3,3 | drum | 1x1 | 3 | no (same from every side) |

### Front prompt (attach `room_template.png`)

```
Draw ONE sheet of 3 columns x 3 rows on a plain white background. Each cell holds ONE item for a cute children's-room game, centered. The 9 items, in reading order:
- Row 1, column 1: CUPCAKE LAMP, footprint 1x1. A table lamp shaped like a big cupcake: the shade is the frosting swirl with a cherry on top, the base is the cupcake wrapper, glowing softly warm. RECOLORABLE: the frosting shade (magenta). Round, so it looks the same from every side.
- Row 1, column 2: FLOOR LAMP WITH A STAR, footprint 1x1. A slim floor lamp with a round base, a thin pole and a glowing yellow star at the top (a flat, thick five-pointed star with softly rounded points, facing the viewer, not a sphere).
- Row 1, column 3: LAVA LAMP, footprint 1x1. A classic lava lamp: a tapered glass bottle with floating pastel blobs inside, a metal cap and a round base, soft glow. Round, so it looks the same from every side.
- Row 2, column 1: DISCO BALL ON A STAND, footprint 1x1. A small mirror disco ball hanging from a short curved stand arm with a round base, tiny pastel mirror tiles, small highlights (no sparkles outside the ball).
- Row 2, column 2: STRING LIGHTS ON A POLE, footprint 1x1. A free-standing pole with a round base and a little crossbar at the top, from which two soft garlands of tiny bulbs in pastel colours droop in gentle curves; the garlands stay within the 1x1 width.
- Row 2, column 3: CRYSTAL BALL, footprint 1x1. A crystal ball on a small ornate golden stand with three curled feet, a swirl of purple mist and a tiny star inside, a glossy highlight. Round, so it looks the same from every side.
- Row 3, column 1: MUSIC BOX, footprint 1x1. A small wooden music box with a domed lid slightly open (hinged at the back), a tiny ballerina unicorn on a spring inside, and a little winding key on the right side. Flat square base.
- Row 3, column 2: XYLOPHONE, footprint 1x1. A children’s xylophone: a trapezoid wooden frame with eight coloured bars from long to short, two mallets resting across it, four little feet. RECOLORABLE: the frame (magenta); the bars keep their rainbow colours. Looks the same from the front and the back.
- Row 3, column 3: DRUM, footprint 1x1. A little toy drum: a cylinder body with zig-zag colour stripes and tension ropes, two drumsticks crossed on the skin, standing on its flat base. Round, so it looks the same from every side. RECOLORABLE: the body between the ropes (magenta).

STYLE AND CAMERA (follow exactly). Use the attached grid template as the camera angle and scale reference. Isometric 2:1 view looking down about 30 degrees; every horizontal edge at exactly 26.57 degrees (rise 1 for every 2 across), no perspective convergence, no fisheye, no rounded-corner cheating on the base; the left and right base edges are mirror images of each other. Light from the top-left: the right side of every object is a little darker than the left, the top is lightest. Cute sticker style: thick dark-brown outline, soft pastel fills, glossy highlights. Plain white background, no ground shadow, no floor lines, no texture, no glitter or sparkles spilling outside the object. Every object faces front-right (towards the viewer, to the right). No text, no logos and no one-sided details that would look wrong when mirrored. FEET ON THE CORNERS: the legs, feet or lowest corners of each object's base touch the floor at the corners of its footprint diamond (left, front, right and the hidden back one); the front foot is the lowest point of the picture; nothing (cloth, rails, skirts, cords) hangs lower than the feet. Soft items have a flat base that fills the diamond, widest at the left and right corners. SCALE BY FOOTPRINT on the template's 10 x 10 floor (one tile is a diamond 100 px wide and 50 px tall on the template): a plant or small toy is 1x1, an armchair or toy box 2x2, a bed 3x4; an object's base sits exactly on its footprint diamond and taller parts rise straight up. ONE ITEM PER CELL: centered, uncropped, at least 15% of empty white margin on every side, nothing spilling into the neighbouring cell.

RECOLORABLE PART: paint the part named for each item in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta; every other part keeps its normal colours; do not use magenta anywhere else.

Do not add any text, labels, numbers, cell borders or grid lines to the picture. Nothing may be cut off at a cell edge. Output the sheet as one image.
```
### Back prompt (1 item; attach the 1 front picture in this order, plus `room_template.png`)

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the line thickness, the colours and the sticker style exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it, and what was at the back is now nearest to us. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same four feet/corners on exactly the same pixels as the reference (so the back view can replace the front view without the item moving), the same height, the same colours, plain white background, no ground shadow, no floor lines, no sparkles or shadows added, 15% empty margin, nothing cropped. If an item has a magenta (#FF00FF) part, keep that same part magenta in the back view and use no other magenta.

Draw ONE sheet of 1 column x 1 row, one cell per attached picture, in the same order as the attached pictures:
- Picture 1, MUSIC BOX: Turn it 180 degrees: now we see the back of the box with the lid’s hinge nearest and the winding key on the LEFT; the dancing unicorn is seen from behind through the opened lid.

Plain white background; nothing cut off at a cell edge; no text, labels or grid lines.
```

---

## Sheet 3: Learning, games, pets and things to explore (file `sheet-c3-learning-pets`)

| Cell | Item | Footprint | Price | Back picture |
|---|---|---|---|---|
| 1,1 | abacus | 1x1 | 3 | no (same from every side) |
| 1,2 | toy cash register | 1x1 | 3 | yes |
| 1,3 | microscope | 1x1 | 4 | yes |
| 2,1 | magnetic letters board | 2x1 | 4 | yes |
| 2,2 | wooden marble run | 2x2 | 6 | yes |
| 2,3 | toy robot | 1x1 | 4 | yes |
| 3,1 | goldfish bowl | 1x1 | 3 | no (same from every side) |
| 3,2 | large fish tank | 2x1 | 8 | yes |
| 3,3 | hamster with a wheel | 1x1 | 4 | no (same from every side) |

### Front prompt (attach `room_template.png`)

```
Draw ONE sheet of 3 columns x 3 rows on a plain white background. Each cell holds ONE item for a cute children's-room game, centered. The 9 items, in reading order:
- Row 1, column 1: ABACUS, footprint 1x1. A small wooden abacus: a rectangular frame with five rails of colourful sliding beads, standing on two little feet at each end. Looks the same from the front and the back.
- Row 1, column 2: TOY CASH REGISTER, footprint 1x1. A toy cash register: a boxy body with a row of big candy-coloured buttons on a slanted front, a small display screen with no text (just a coloured bar), an open drawer with two coins, and a little bell on top. RECOLORABLE: the body (magenta).
- Row 1, column 3: MICROSCOPE, footprint 1x1. A children’s microscope: a round base, a curved arm, a tube with an eyepiece at the top, a small stage with a glass slide, a mirror below. The eyepiece leans towards the viewer on the right.
- Row 2, column 1: MAGNETIC LETTERS BOARD, footprint 2x1. A freestanding magnetic board on a wooden A-frame easel, the board facing the viewer with colourful chunky magnet blobs in abstract rounded shapes (NO readable letters), a little tray at the bottom holding a few magnets. RECOLORABLE: the frame (magenta).
- Row 2, column 2: WOODEN MARBLE RUN, footprint 2x2. A toy marble run tower: a square wooden base, a few coloured wooden posts and slanted tracks zig-zagging down with three colourful marbles on them, a funnel at the top. Compact, fits inside the diamond. RECOLORABLE: the base (magenta).
- Row 2, column 3: TOY ROBOT, footprint 1x1. A cute round-cornered toy robot with a square head, antennas, two big friendly eyes, a chest panel with three coloured buttons, stubby arms and feet. RECOLORABLE: the body (magenta).
- Row 3, column 1: GOLDFISH BOWL, footprint 1x1. A round glass fishbowl on a small stand ring, water with a cheerful orange goldfish, a little green plant and a few pebbles, a glossy highlight. Round, so it looks the same from every side.
- Row 3, column 2: LARGE FISH TANK, footprint 2x1. A big glass aquarium on a low wooden cabinet: water, several cute colourful fish, a pink coral, a small treasure chest, bubbles from an air stone, a thin hood light on top. The glass is clear light blue; the cabinet carries the footprint. The picture must not get wider than the footprint. RECOLORABLE: the cabinet (magenta).
- Row 3, column 3: HAMSTER WITH A WHEEL, footprint 1x1. A small round plastic base with a clear half-dome, inside it a cute round hamster next to a coloured running wheel and a tiny water bottle. Looks the same from every side except that the hamster faces front-right.

STYLE AND CAMERA (follow exactly). Use the attached grid template as the camera angle and scale reference. Isometric 2:1 view looking down about 30 degrees; every horizontal edge at exactly 26.57 degrees (rise 1 for every 2 across), no perspective convergence, no fisheye, no rounded-corner cheating on the base; the left and right base edges are mirror images of each other. Light from the top-left: the right side of every object is a little darker than the left, the top is lightest. Cute sticker style: thick dark-brown outline, soft pastel fills, glossy highlights. Plain white background, no ground shadow, no floor lines, no texture, no glitter or sparkles spilling outside the object. Every object faces front-right (towards the viewer, to the right). No text, no logos and no one-sided details that would look wrong when mirrored. FEET ON THE CORNERS: the legs, feet or lowest corners of each object's base touch the floor at the corners of its footprint diamond (left, front, right and the hidden back one); the front foot is the lowest point of the picture; nothing (cloth, rails, skirts, cords) hangs lower than the feet. Soft items have a flat base that fills the diamond, widest at the left and right corners. SCALE BY FOOTPRINT on the template's 10 x 10 floor (one tile is a diamond 100 px wide and 50 px tall on the template): a plant or small toy is 1x1, an armchair or toy box 2x2, a bed 3x4; an object's base sits exactly on its footprint diamond and taller parts rise straight up. ONE ITEM PER CELL: centered, uncropped, at least 15% of empty white margin on every side, nothing spilling into the neighbouring cell.

RECOLORABLE PART: paint the part named for each item in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta; every other part keeps its normal colours; do not use magenta anywhere else.

Do not add any text, labels, numbers, cell borders or grid lines to the picture. Nothing may be cut off at a cell edge. Output the sheet as one image.
```
### Back prompt (6 items; attach the 6 front pictures in this order, plus `room_template.png`)

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the line thickness, the colours and the sticker style exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it, and what was at the back is now nearest to us. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same four feet/corners on exactly the same pixels as the reference (so the back view can replace the front view without the item moving), the same height, the same colours, plain white background, no ground shadow, no floor lines, no sparkles or shadows added, 15% empty margin, nothing cropped. If an item has a magenta (#FF00FF) part, keep that same part magenta in the back view and use no other magenta.

Draw ONE sheet of 3 columns x 2 rows, one cell per attached picture, in the same order as the attached pictures:
- Picture 1, TOY CASH REGISTER: Turn it 180 degrees: now we see its plain back with a cable and the back of the display; the buttons are on the far side.
- Picture 2, MICROSCOPE: Turn it 180 degrees: the eyepiece now leans away from us; we see the back of the arm, the stage from behind and the mirror from the other side.
- Picture 3, MAGNETIC LETTERS BOARD: Turn it 180 degrees: now we see the plain back of the board and the A-frame’s back legs; no magnets visible.
- Picture 4, WOODEN MARBLE RUN: Turn it 180 degrees: the tracks and marbles are seen from the other side (the funnel is on the other end).
- Picture 5, TOY ROBOT: Turn it 180 degrees: now we see the robot from behind: a back panel with a small wind-up key and two round vents, the antennas, no face.
- Picture 6, LARGE FISH TANK: Turn it 180 degrees: now we see the tank from behind: the back glass with the plants and fish seen from behind, the filter box and a coiled cord, the plain back of the cabinet.

Plain white background; nothing cut off at a cell edge; no text, labels or grid lines.
```

---

## Sheet 4: Plushies, plants, a rug and two wall items (file `sheet-c4-plush-plants-wall`)

| Cell | Item | Footprint | Price | Back picture |
|---|---|---|---|---|
| 1,1 | elephant plush | 1x1 | 3 | yes |
| 1,2 | sleepy cat | 1x1 | 3 | yes |
| 1,3 | penguin plush | 1x1 | 3 | yes |
| 2,1 | sloth hanging on a stand | 1x1 | 4 | yes |
| 2,2 | sunflower pot | 1x1 | 2 | no (same from every side) |
| 2,3 | strawberry plant | 1x1 | 2 | no (same from every side) |
| 3,1 | star-shaped rug | 2x2 | 4 | no (same from every side) |
| 3,2 | WALL ITEM: round wall clock | wall 3x3 | 3 | no (wall item) |
| 3,3 | WALL ITEM: treasure map frame | wall 3x2 | 2 | no (wall item) |

### Front prompt (attach `room_template.png`)

```
Draw ONE sheet of 3 columns x 3 rows on a plain white background. Each cell holds ONE item for a cute children's-room game, centered. The 9 items, in reading order:
- Row 1, column 1: ELEPHANT PLUSH, footprint 1x1. A cute sitting baby elephant plush, round, with big floppy ears, a short trunk, tiny tusks, a bow on its ear. Seated, flat base.
- Row 1, column 2: SLEEPY CAT, footprint 1x1. A cute curled-up sleeping cat plush with a tail around its body, closed smiling eyes, a tiny pink nose.
- Row 1, column 3: PENGUIN PLUSH, footprint 1x1. A cute sitting penguin plush with a scarf, a little orange beak and feet, a round white belly.
- Row 2, column 1: SLOTH HANGING ON A STAND, footprint 1x1. A cute smiling sloth plush hanging by its arms from a short wooden horizontal bar held by two posts (a small free-standing perch with a round base).
- Row 2, column 2: SUNFLOWER POT, footprint 1x1. A single big sunflower (no face) with a thick green stem and two leaves in a small round pot. RECOLORABLE: the pot (magenta).
- Row 2, column 3: STRAWBERRY PLANT, footprint 1x1. A strawberry plant in a small round pot: green leaves, white flowers and three ripe red strawberries hanging over the rim. RECOLORABLE: the pot (magenta).
- Row 3, column 1: STAR-SHAPED RUG, footprint 2x2. A FLAT rug seen from above in the same isometric camera: a plump five-pointed star with rounded points, a thick border and a soft fluffy texture suggested by small curved lines; it lies flat on the floor, no thickness, its outline fits inside the 2x2 diamond. RECOLORABLE: the whole rug (magenta).
- Row 3, column 2: WALL ITEM: ROUND WALL CLOCK, footprint wall 3x3. DRAWN STRAIGHT FROM THE FRONT, flat, NO isometric perspective (the game skews it onto the wall): a round clock with a scalloped cupcake-wrapper rim, a pastel face with twelve dots (NO numbers, no text), a short hour hand and a long minute hand drawn as two separate thin dark-brown shapes pointing at 10 and 2 (so the game can later turn them), a tiny cherry at the top.
- Row 3, column 3: WALL ITEM: TREASURE MAP FRAME, footprint wall 3x2. DRAWN STRAIGHT FROM THE FRONT, flat, NO isometric perspective: a wooden picture frame holding a rolled-edge parchment treasure map with a dotted path, an X mark, a small island, a palm tree and waves, NO text or letters.

STYLE AND CAMERA (follow exactly). Use the attached grid template as the camera angle and scale reference. Isometric 2:1 view looking down about 30 degrees; every horizontal edge at exactly 26.57 degrees (rise 1 for every 2 across), no perspective convergence, no fisheye, no rounded-corner cheating on the base; the left and right base edges are mirror images of each other. Light from the top-left: the right side of every object is a little darker than the left, the top is lightest. Cute sticker style: thick dark-brown outline, soft pastel fills, glossy highlights. Plain white background, no ground shadow, no floor lines, no texture, no glitter or sparkles spilling outside the object. Every object faces front-right (towards the viewer, to the right). No text, no logos and no one-sided details that would look wrong when mirrored. FEET ON THE CORNERS: the legs, feet or lowest corners of each object's base touch the floor at the corners of its footprint diamond (left, front, right and the hidden back one); the front foot is the lowest point of the picture; nothing (cloth, rails, skirts, cords) hangs lower than the feet. Soft items have a flat base that fills the diamond, widest at the left and right corners. SCALE BY FOOTPRINT on the template's 10 x 10 floor (one tile is a diamond 100 px wide and 50 px tall on the template): a plant or small toy is 1x1, an armchair or toy box 2x2, a bed 3x4; an object's base sits exactly on its footprint diamond and taller parts rise straight up. ONE ITEM PER CELL: centered, uncropped, at least 15% of empty white margin on every side, nothing spilling into the neighbouring cell. Exception: the two cells marked WALL ITEM are drawn straight from the front, flat, with no isometric perspective and no footprint; they are the only cells that break the isometric rule. The star-shaped rug is a flat floor item seen in the isometric camera.

RECOLORABLE PART: paint the part named for each item in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta; every other part keeps its normal colours; do not use magenta anywhere else.

Do not add any text, labels, numbers, cell borders or grid lines to the picture. Nothing may be cut off at a cell edge. Output the sheet as one image.
```
### Back prompt (4 items; attach the 4 front pictures in this order, plus `room_template.png`)

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the line thickness, the colours and the sticker style exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it, and what was at the back is now nearest to us. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same four feet/corners on exactly the same pixels as the reference (so the back view can replace the front view without the item moving), the same height, the same colours, plain white background, no ground shadow, no floor lines, no sparkles or shadows added, 15% empty margin, nothing cropped. If an item has a magenta (#FF00FF) part, keep that same part magenta in the back view and use no other magenta.

Draw ONE sheet of 3 columns x 2 rows, one cell per attached picture, in the same order as the attached pictures:
- Picture 1, ELEPHANT PLUSH: The back of the plush: no face, the back of the ears, the tail and the round rump.
- Picture 2, SLEEPY CAT: The other side of the curled cat: the back of the head, the tail wrapped round, no face.
- Picture 3, PENGUIN PLUSH: The back of the penguin: the black back, the scarf knot, the little tail, no face.
- Picture 4, SLOTH HANGING ON A STAND: The back of the sloth on the perch: its back and its long arms, no face; the posts are the same.

Plain white background; nothing cut off at a cell edge; no text, labels or grid lines.
```

---

## Single-item back prompt (fallback when a sheet gives front views again)

Send ONE item per image, with its front picture attached:

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the line thickness, the colours and the sticker style exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it, and what was at the back is now nearest to us. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same four feet/corners on exactly the same pixels as the reference (so the back view can replace the front view without the item moving), the same height, the same colours, plain white background, no ground shadow, no floor lines, no sparkles or shadows added, 15% empty margin, nothing cropped. If an item has a magenta (#FF00FF) part, keep that same part magenta in the back view and use no other magenta.

Turn the attached item 180 degrees about its vertical axis. [Item-specific line from the back lists above.] If the nearest part in your drawing is the same part that was nearest in the attached picture, it is wrong: redo it so that the part that was FARTHEST is now NEAREST. Output one item, centered, on white.
```

If it still comes back as a front view, ask for the item "seen from directly behind in the same isometric camera" and name the nearest and the farthest part in words. As a last resort a mirror image works as the mirrored look and needs no new art.

## What I do when the sheets arrive
Cut and fit with `tools/items2.py` (front) and `tools/backart.py` (back), measure the tops of hosts (kids' table, nightstand, toy shelf, shop counter, marble run base) with `tools/surfaces.py`, add the colourable parts to `tools/parts.py`, set the prices above, update `catalogtest`, `spacetest`, `groundtest`, `colortest` and `backtest`, and add a step to `docs/ENHANCEMENTS.md`. Two sheets per branch keeps them reviewable.
