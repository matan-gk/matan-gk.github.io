# Gemini prompts: wall shelves in perspective (plan step B)

Why a new kind of picture: the clock and the map are drawn flat and sheared onto the wall, which is right for a flat picture but wrong for a shelf, which sticks out into the room. A shelf is therefore drawn **already in the room's isometric view, as a solid object attached to the wall** (like a piece of furniture whose back edge is on the wall). The game will draw it unsheared, anchored on the wall at its back edge.

Companion to `GEMINI_PROMPTS.md` and `GEMINI_PROMPTS_BATCH3.md` (same camera and style; repeated inside the prompt so it can be pasted as it is).

## Lesson from the first try (read this first)
Gemini kept drawing a slab of wall behind each shelf, however firmly the prompt said not to, **because the template showed a grey wall plane**. The edited `shelf_template.png` (now in this folder) has **no wall**, only the red slab and the green "up" lines, and with it Gemini drew clean shelves (sheets `art/sheet-shelves.jpg` and `art/sheet-shelf-stacks.jpg`). Keep the wall out of any template; a picture-guide wins over the words of a prompt.

## What to send
**Required**
- Sheet S1 (4 shelves, 2x2): attach `shelf_template.png` (this folder) and the vision image (`fully_upgraded_room_example.jpg`) as a style reference, then paste the S1 prompt.
- Left-wall versions: the game mirrors the right-wall pictures for the left wall (as it already does for turned furniture), so **no second sheet is needed**.

**Optional**
- Sheet S2 (4 taller stacks with 2 or 3 tiers each), same way, after S1 is accepted. Stacks like the ones on the left of the vision.
- A separate try of the same S1 with the light from the top-right, if the mirrored light on the left wall looks wrong in the game.

## Camera for a wall shelf (the part Gemini gets wrong most often)
- The picture is of a shelf on the **right-hand wall** of a corner room. The wall plane runs from upper-left to lower-right, every horizontal wall line at exactly 26.57 degrees (rise 1 for every 2 across); vertical lines are vertical. No perspective convergence.
- The shelf slab sticks out of the wall toward the lower-left, 2 grid units deep: its **top face is a thin parallelogram**, its long back edge flush against the wall (invisible wall, no wall drawn), its long front edge parallel to the back edge, and its short side edges running toward the lower-left at 26.57 degrees.
- We see the slab from above: the top face, the front edge (thick, slightly lighter), and the left short end. Thin supports (two small brackets or a glass edge) under it.
- Things on the shelf **stand upright** on the top face, each one drawn in the same isometric view, standing in a row along the long edge, with their bases on the top face and a little overlap/depth variation allowed, and never leaning over the front edge.
- The picture is a sticker: transparent or plain white background, no wall, no floor, no shadow on a wall, no text. Only a soft contact shadow of each item on the slab itself is fine.

## Prompt S1: four single shelves (attach `shelf_template.png` and the vision image)

```
Draw ONE image: a 2 x 2 grid, on a plain white background. Each cell holds ONE wall shelf for a cute children's-room pixel-art game, with the things standing on it. The attached template shows, in every cell, the grey wall plane, the red slab top where the shelf goes, and green lines marking "up". The template is only a guide for the camera and the size: do NOT draw the wall, the red slab outline, the green lines or any grid; draw only the shelf and its things.

The 4 shelves, in reading order:
- Cell 1: CRYSTAL SHELF. A thin glass shelf with a pearly pastel edge and two small silver brackets under it. On it: five crystal clusters in pastel pink, mint, lavender and sky blue, in different heights, one small pyramid crystal, and one green crystal. Tallest item about 3 times the slab depth.
- Cell 2: BUBBLE TEA SHELF. The same glass shelf. On it: five bubble tea cups with domed lids, straws and pearls, in different pastel drinks (strawberry pink, taro lilac, matcha green, milk tea beige, brown sugar).
- Cell 3: ICE CREAM SHELF. The same glass shelf. On it: five ice creams standing upright (waffle cones with pastel swirls in mint, strawberry, lilac, vanilla and a rainbow swirl), each with a small sprinkle or cherry.
- Cell 4: PLUSHIE SHELF. The same glass shelf. On it: a small unicorn plush, a yellow star plush, a heart cushion, a tiny cupcake and a small rainbow cloud.

SHELF SHAPE (all four identical): top face a parallelogram, 8 grid units long and 2 units deep, thin; the front edge about 14 pixels thick on a 1400 px sheet; it must look like it sticks out from a wall to the lower left, the long edges at exactly 26.57 degrees going down to the right, the short edges going down to the left at 26.57 degrees.

THINGS ON IT: upright, standing on the top face with their bottoms on it, drawn in the same isometric view, a gentle row along the long edge with small gaps; nothing hangs over the front edge; nothing floats; each thing has its own soft contact shadow on the slab.

STYLE (follow the vision image attached): the same pixel-art look, the same line thickness, soft pastel colours, a thin darker outline on everything, light from the top-left, a small white sparkle highlight on glass and crystals. The shelf glass is pale lilac-white, slightly see-through, with a bright edge line.

DO NOT: draw any wall or floor, text or numbers, a cell border, magenta anywhere, any shadow on a wall, or anything cut off at a cell edge. Keep each shelf in its own cell, centred, with white space around it. Output one image.
```

## Check before sending me the sheet
1. Back edge of every slab runs down to the right, front edge parallel to it, nothing is drawn from the front on (no flat front-on shelf, which is the failure we want to avoid).
2. Items stand on the slab, bases on the top face, none floating or hanging over the edge.
3. All four shelves have the same length, depth and angle (so they hang the same way in the game).
4. Nothing cut off; background white or transparent.

If the angle is wrong, ask: "Redraw it with the long edge of the shelf at exactly 26.57 degrees, like the lower-left to upper-right edge of the attached template, and the shelf sticking out toward the lower left."

## Prompt S2 (optional): taller stacks (attach `shelf_template.png` and the vision image)

```
Same camera, style and rules as the previous image (isometric wall shelves on the right-hand wall, sticking out toward the lower left, things standing upright on them, no wall drawn, no text, no magenta, white background). Draw a 2 x 2 grid, one STACK per cell. A stack is 3 glass shelves one above the other, 6 grid units long and 2 units deep, about 5 grid units of height apart, hanging from the wall edge (draw only the shelves and a thin pair of silver brackets):
- Cell 1: BUBBLE TEA STACK: 3 shelves with 4 bubble tea cups each.
- Cell 2: ICE CREAM STACK: 3 shelves with 4 ice creams each, in mint, strawberry, vanilla, lilac.
- Cell 3: CRYSTAL AND STAR STACK: 2 shelves, crystals on the upper one, pastel stars and a pyramid on the lower one.
- Cell 4: SWEETS STACK: 3 shelves with cupcakes, donuts and macarons.
Each stack fully inside its cell, nothing cut off.
```

## What I do with the pictures
Cut each shelf, fit it to the wall coordinates (`tools/walls.py`, new "solid wall item" mode: an unsheared picture anchored by its back-edge corner, mirrored for the left wall), add the catalog entries (price 4, group wall), then tests and docs. Shelves count as wall items, so they use the existing wall placement and overlap rules; their footprint on the wall is the picture's back edge and height.
