# Gemini prompts: the cloud and unicorn set (plan step C-unicorn, first themed set)

Companion to `GEMINI_PROMPTS.md` and `GEMINI_PROMPTS_BATCH3.md` (same camera, method and rules). The set is taken from the vision room: cloud armchairs, the unicorn standing mirror, the rainbow curtains, heart and star cushions, the topiary trees. Each prompt below can be pasted as it is.

## What is required and what is optional
**Required**
1. Front sheet U1 (9 items, 3 x 3): attach `room_template.png`, `style-refs/ref-cloud-sofa.png`, `style-refs/ref-rocking-horse.png` and `style-refs/vision-room.jpg`, then paste the U1 front prompt.
2. Back sheet U1 (5 items: armchair, mirror, rocking horse, bench, throne): after the front sheet is accepted, attach those 5 pictures in the order listed plus `room_template.png`, and paste the U1 back prompt.

**Optional**
- Sheet U2: six topiary and planter plants (the vision's green trees in lilac pots). They need no back pictures.
- Redo prompts for single items that come out wrong (the single-item back prompt in `GEMINI_PROMPTS_BATCH3.md` also works here).

## Lessons from the shelves, applied here
- A guide image beats the words of a prompt: Gemini draws whatever the template shows. `room_template.png` is only the floor diamond grid (good, we want feet on the diamonds); never attach a template that contains a wall, a slab or labels.
- Attach the two game sprites: they carry the line weight, size and shading better than any description.

## Check before sending me a sheet
1. Feet on the diamond corners, the front foot lowest; nothing cropped; plain white background; no floor diamond or shadow drawn.
2. One magenta part per item (the one named), no other magenta.
3. The same outline weight and pastel look as the attached game sprites; if one item looks like it came from another game (flat colours, no pearly top edge), ask for that item again.

---

## Sheet U1: cloud and unicorn furniture (file `sheet-u1-unicorn`)

| Cell | Item | Footprint | Price | Back picture |
|---|---|---|---|---|
| 1,1 | cloud armchair | 2x2 | 5 | yes |
| 1,2 | cloud ottoman | 1x1 | 4 | no (round) |
| 1,3 | unicorn standing mirror | 1x1 | 5 | yes |
| 2,1 | rainbow curtain stand | 1x1 | 4 | no |
| 2,2 | unicorn rocking horse | 2x1 | 6 | yes |
| 2,3 | heart bed-bench | 2x1 | 5 | yes |
| 3,1 | plush unicorn throne | 2x2 | 6 | yes |
| 3,2 | star pouf | 1x1 | 3 | no |
| 3,3 | cloud lamp | 1x1 | 4 | no |

### Front prompt (attach `room_template.png`, the two sprites and the vision room)

```
Draw ONE sheet of 3 columns x 3 rows on a plain white background. Each cell holds ONE item for a cute children's-room game, centered. All nine belong to one dreamy cloud-and-unicorn world (see the attached vision room for the mood). The 9 items, in reading order:
- Row 1, column 1: CLOUD ARMCHAIR, footprint 2x2. A big puffy armchair made of white fluffy clouds: a thick rounded back and two plump rounded arms, with a soft lilac seat cushion that has a small star-shaped button in its middle. Tiny pearly sparkles on the clouds. RECOLORABLE: the seat cushion (magenta); the clouds stay white.
- Row 1, column 2: CLOUD OTTOMAN, footprint 1x1. A small round puffy cloud pouf, a few cloud lobes around a flat soft top cushion. RECOLORABLE: the top cushion (magenta).
- Row 1, column 3: UNICORN STANDING MIRROR, footprint 1x1. A tall arched standing mirror in a pearly white frame with gold edges, two small curved feet, a pale reflective glass with a soft diagonal shine, and a tiny pastel unicorn sticker in the lower corner of the glass. RECOLORABLE: the frame (magenta).
- Row 2, column 1: RAINBOW CURTAIN STAND, footprint 1x1. A freestanding gold arch (a slim post with a curved top bar on a round base) from which hangs a pair of rainbow-striped curtains (pastel red, orange, yellow, green, blue, violet stripes), drawn back and tied with a gold tassel in the middle so the opening is a tall arch. RECOLORABLE: the tie-back band (magenta); the stripes stay rainbow.
- Row 2, column 2: UNICORN ROCKING HORSE, footprint 2x1. A pearly white rocking horse with a golden spiral horn, a pastel rainbow mane and tail, small ears, a friendly simple face in three-quarter view, and curved wooden-gold rocker runners. Floor contact is the two runners' ends, on the left and right corners of the footprint. RECOLORABLE: the saddle blanket (magenta).
- Row 2, column 3: HEART BED-BENCH, footprint 2x1. A soft padded bench for the foot of a bed: a long cushioned seat with a heart-shaped quilted button pattern, a low curved backrest with a heart cut-out, four slim gold legs. RECOLORABLE: the seat cushion (magenta).
- Row 3, column 1: PLUSH UNICORN THRONE, footprint 2x2. A big armchair shaped like a sitting plush unicorn: the backrest is the unicorn's head and neck seen from the front-right with a golden horn, ears and closed sleepy eyes, a rainbow mane running down the back, a round plush seat, two plush arm rests like front legs. RECOLORABLE: the seat cushion (magenta).
- Row 3, column 2: STAR POUF, footprint 1x1. A thick five-pointed star-shaped floor pouf with a soft quilted top and a button in the middle. RECOLORABLE: the whole star (magenta).
- Row 3, column 3: CLOUD LAMP, footprint 1x1. A small floor lamp: a glowing white cloud with a soft warm yellow light at its bottom and one tiny star charm, standing on a short slim gold stem and a round base. RECOLORABLE: the round base (magenta).

STYLE AND CAMERA (follow exactly). Use the attached grid template as the camera angle and scale reference. Isometric 2:1 view looking down about 30 degrees; every horizontal edge at exactly 26.57 degrees (rise 1 for every 2 across), no perspective convergence, no fisheye, no rounded-corner cheating on the base; the left and right base edges are mirror images of each other. Light from the top-left.

LOOK (this matters most): match the two attached game sprites (the cloud sofa and the rocking horse) and the attached vision room: soft pastel pigments (lilac, powder blue, blush pink, mint, butter yellow, pearl white), a thin darker-tone outline, a thin pearly highlight line along every top edge, tiny white sparkle glints on shiny parts, and GOLD or PEARL-WHITE trim and legs instead of plain brown wood. The same pixel-art detail level as the attached sprites. Everything belongs to one dreamy cloud-and-unicorn world.

RECOLORABLE PART: paint the part named for each item in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta; every other part keeps its normal colours; do not use magenta anywhere else.

Do not add any text, labels, numbers, cell borders, grid lines, floor shadows or floor diamonds to the picture. Nothing may be cut off at a cell edge. Draw only the items on a plain white background. Output the sheet as one image.
```

### Back prompt (5 items; attach the 5 front pictures in this order, plus `room_template.png`)
Order: 1 cloud armchair, 2 unicorn standing mirror, 3 unicorn rocking horse, 4 heart bed-bench, 5 plush unicorn throne.

```
The attached pictures show items as seen by a fixed isometric camera, looking from above and from the lower front, each facing front-right. Keep the camera, the scale, the line thickness, the colours and the sticker style exactly as they are. Do not move the camera. Instead turn each item itself 180 degrees about its vertical axis, so that what was facing the camera now faces away from it, and what was at the back is now nearest to us. We must see the item's back and the opposite sides, NOT the front again and NOT a mirror image. Keep the same footprint diamond with the same four feet/corners on exactly the same pixels as the reference (so the back view can replace the front view without the item moving), the same height, the same colours, plain white background, no ground shadow, no floor lines, no sparkles or shadows added, 15% empty margin, nothing cropped. If an item has a magenta (#FF00FF) part, keep that same part magenta in the back view and use no other magenta.

Draw ONE sheet of 3 columns x 2 rows (the sixth cell stays empty), one cell per attached picture, in the same order as the attached pictures:
- Picture 1, CLOUD ARMCHAIR: Turn it 180 degrees: now we see the smooth puffy back of the chair, the outer sides of the arms and no seat cushion in front; the seat cushion is only partly visible over the top of the back.
- Picture 2, UNICORN STANDING MIRROR: Turn it 180 degrees: now we see the back of the frame, a plain pearly panel with a small gold hanging ring and the stand's strut, no glass and no unicorn sticker.
- Picture 3, UNICORN ROCKING HORSE: Turn it 180 degrees: now we see the horse from behind and its other side: the rump, the rainbow tail, the back of the saddle blanket, the runners; the face is hidden.
- Picture 4, HEART BED-BENCH: Turn it 180 degrees: now we see the back of the low backrest (the heart cut-out seen from behind) and the seat from the other side.
- Picture 5, PLUSH UNICORN THRONE: Turn it 180 degrees: now we see the back of the unicorn: the rainbow mane flowing down the back of the chair, the back of the head, the ears and the horn from behind, and a little fluffy tail at the bottom; no face.
Keep each magenta part magenta.
```

---

## Sheet U2 (optional): topiary trees and planters (file `sheet-u2-topiary`)

| Cell | Item | Footprint | Price |
|---|---|---|---|
| 1,1 | cube topiary | 1x1 | 3 |
| 1,2 | cone topiary | 1x1 | 3 |
| 1,3 | ball topiary | 1x1 | 2 |
| 2,1 | spiral topiary | 1x1 | 3 |
| 2,2 | triple-ball topiary | 1x1 | 3 |
| 2,3 | cube planter with flowers | 1x1 | 2 |

```
Draw ONE sheet of 3 columns x 2 rows on a plain white background. Each cell holds ONE potted plant for a cute children's-room game, centered. All six belong to one dreamy pastel world (see the attached vision room: the clipped green trees in lilac and pearl pots). The 6 items, in reading order:
- Row 1, column 1: CUBE TOPIARY. A perfectly clipped bright-green cube of leaves (with tiny leaf texture) on a short brown trunk in a square pot. RECOLORABLE: the pot (magenta).
- Row 1, column 2: CONE TOPIARY. A clipped green cone (a tall pointed tree) on a short trunk in a square pot. RECOLORABLE: the pot (magenta).
- Row 1, column 3: BALL TOPIARY. A clipped green ball on a short trunk in a round pot. RECOLORABLE: the pot (magenta).
- Row 2, column 1: SPIRAL TOPIARY. A tall green spiral-shaped clipped tree on a short trunk in a round pot. RECOLORABLE: the pot (magenta).
- Row 2, column 2: TRIPLE-BALL TOPIARY. Three clipped green balls of decreasing size stacked on a thin trunk in a square pot. RECOLORABLE: the pot (magenta).
- Row 2, column 3: CUBE PLANTER WITH FLOWERS. A square pastel planter box full of small pink, white and lilac flowers and green leaves, flat on top. RECOLORABLE: the planter (magenta).
Footprint of each: 1x1; they look the same from every side.

STYLE AND CAMERA (follow exactly). Use the attached grid template as the camera angle and scale reference. Isometric 2:1 view looking down about 30 degrees; every horizontal edge at exactly 26.57 degrees (rise 1 for every 2 across), no perspective convergence, no fisheye, no rounded-corner cheating on the base; the left and right base edges are mirror images of each other. Light from the top-left.

LOOK (this matters most): match the two attached game sprites (the cloud sofa and the rocking horse) and the attached vision room: soft pastel pigments (lilac, powder blue, blush pink, mint, butter yellow, pearl white), a thin darker-tone outline, a thin pearly highlight line along every top edge, tiny white sparkle glints on shiny parts, and GOLD or PEARL-WHITE trim and legs instead of plain brown wood. The same pixel-art detail level as the attached sprites. Everything belongs to one dreamy cloud-and-unicorn world.

RECOLORABLE PART: paint the part named for each item in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta; every other part keeps its normal colours; do not use magenta anywhere else.

Do not add any text, labels, numbers, cell borders, grid lines, floor shadows or floor diamonds to the picture. Nothing may be cut off at a cell edge. Draw only the items on a plain white background. Output the sheet as one image.
```

## What I do with the pictures
Cut, fit and bake the colour parts (`tools/items2.py` / `items4.py` pattern: a new `tools/items6.py`), measure the tops (the bench and the ottoman get a sitting top where the art allows), add the back pictures (`tools/backart.py`), wire the catalog (group furniture, plants for U2), part names, tests' counts and the max-out price, docs, version. Branch `room-items-5`.

---

## Back pictures, second try: keep them pixel art like the fronts

**Required only if you want the backs to match the fronts** (the game works with the first-try backs, which are in the game now). **Optional** otherwise.

What went wrong the first time: the back prompt had no picture of the front sheet attached, so Gemini drew the backs as smooth vector cartoons (see `style-refs/u1-back-first-try-smooth.jpg`), while the fronts are pixel art. The fix is to attach the **front sheet itself** (`art/sheet-u1-unicorn.jpg`) so the style is copied from real pixels, and to say in words what "pixel art" means here.

### Sheet prompt (attach `art/sheet-u1-unicorn.jpg`, then `room_template.png`)

```
The attached sheet shows nine pieces of furniture in a cute pixel-art game style. Draw the BACK VIEW of five of them, in exactly the same pixel-art style as the attached sheet: the same chunky visible pixels, the same 1-2 pixel dark outline, the same limited pastel palette with a few shade steps per colour (no smooth gradients, no vector look, no soft airbrush), the same tiny white sparkle pixels, the same lighting from the top-left, the same camera (isometric 2:1) and the same size as in the attached sheet. Each piece is turned 180 degrees about its vertical axis, so we see it from behind, and nothing else about it changes: same colours, same proportions, same trim. Keep the pure magenta (#FF00FF) parts magenta wherever they are still visible.

Draw ONE image with 3 columns x 2 rows on a plain white background (the sixth cell stays empty), one piece per cell, centered, nothing cut off, no text, no cell borders, no floor or shadow:
1. The CLOUD ARMCHAIR (row 1 of the attached sheet, first piece) seen from behind: the smooth puffy back and the outer sides of the arms; the magenta seat cushion peeks out only over the top.
2. The UNICORN STANDING MIRROR (row 1, third piece) seen from behind: a plain pearly panel with a small gold hanging ring and the leaning support strut; no glass, no unicorn sticker.
3. The UNICORN ROCKING HORSE (row 2, middle piece) seen from behind: the rump, the rainbow tail, the back of the magenta saddle, the runners; the face is hidden.
4. The HEART BED-BENCH (row 2, right piece) seen from behind: the back of the low backrest with the heart cut-out, and the magenta seat from the other side.
5. The PLUSH UNICORN THRONE (row 3, left piece) seen from behind: the rainbow mane flowing down the back, the back of the head, ears and horn, a little fluffy tail; no face.
```

### If a piece still comes out smooth: one at a time
Attach the front sheet and **only that piece cropped**, and use:

```
The attached picture is a piece of furniture in pixel art. Draw the same piece turned 180 degrees about its vertical axis, so we see it from behind, in exactly the same pixel-art style: chunky visible pixels, a 1-2 pixel dark outline, flat pastel colours with a few shade steps, no gradients, no vector look, the same size and camera. Keep the pure magenta (#FF00FF) parts magenta. Plain white background, nothing else, no text.
```

### What the game does with them
The game already corrects the turn order for the standing mirror and the bench, whose backs were drawn the other way round (flag `bsw`). If the new backs are drawn the usual way (a true 180 degree turn), tell me and I will clear that flag.
