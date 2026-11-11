# Gemini prompts for Cupcake's personal space

Attach `room_template.png` (this folder) to every request that draws furniture, and say "use the attached grid as the camera angle and scale reference".

## Camera, scale and style (the same for every prompt)
- Isometric 2:1 ("dimetric") view, looking down about 30 degrees; floor tiles are diamonds exactly twice as wide as tall. The template room is a 10 x 10 floor (one tile = 100 x 50 px on the 1024 px template image); the game rescales, only the proportions matter.
- Light from the top-left; the right side of every object is a little darker than the left, the top is lightest.
- Same cute sticker style as the reward sheets: thick dark-brown outline, soft pastel fills, glossy highlights, no background texture, plain white background, no shadows on the ground (the game adds them).
- One facing only: every object faces front-right (towards the viewer, to the right). The game mirrors it for the other facing, so no text, no logos, no one-sided details that look wrong when mirrored.
- Scale by footprint (tiles of the 10 x 10 floor), as the game uses them today: plant or small toy 1x1, toy box, armchair and couch 2x2, desk 2x4 (and turned 4x2), piano 4 long, bed 3x4 at EVERY level (the canopy bed too: only its height grows, never its floor size). An object's base must sit exactly on its footprint diamond on the template; taller parts rise straight up.
- **Exact perspective (measured, because earlier sheets drifted):** the game fits each picture to its floor diamond by its contact points, and earlier art was not true 2:1 (edges had slopes of 0.57-0.72 instead of 0.5, and the 'square' bed levels were drawn almost square). So ask for: every horizontal edge at exactly 26.57 degrees (rise 1 for every 2 across), no perspective convergence, no fisheye, no rounded-corner cheating on the base; left and right base edges are mirror images of each other.
- **Feet on the corners:** legs, feet or the lowest corners of the base touch the floor at the corners of the footprint diamond (left, front, right, and the hidden back one), and the front leg is the lowest point of the picture. Nothing hangs below the floor line and nothing (rails, skirts, cloth) is lower than the legs. Soft items (couch, cloud, bean bag) have a flat base that fills its diamond, with the widest points at the left and right corners.
- **One item per cell, uncropped, with margin:** 3 tiles = 300 px wide diamond etc.; leave at least 20 px of white on all sides; do not let a canopy, curtain or glitter spill outside the item's own cell.

## A. Floor furniture and decorations (catalog picture and placed picture are the SAME image)
"Draw a sheet of 3 columns x 3 rows. Each cell holds ONE piece of children's-room furniture, centered, in isometric 2:1 view as in the attached grid. Items: [list, with footprints, e.g. single bed 4x4, rug 4x4 flat, potted plant 1x1, toy box 2x2, desk 2x4, round cloud armchair 2x2, telescope on tripod 1x1, bookcase 2x1 tall, standing mirror 1x1]. Follow the camera, light, scale and style rules: [paste the rules above]. White background, no ground shadows, nothing cut off at the cell edge, about 15% empty margin around each item."

## B. Upgrade levels of one item (a row = one item)
"Draw ONE item in 3 levels side by side on one row, same camera, same footprint (3x4 for a bed) and the same position of the base in each cell: the four feet stand on the same pixels in every level, so the levels can be switched without the item moving. Level 1: simple and plain. Level 2: nicer, more details, a few pastel colors. Levels 3-5: more magical and rich (rainbow, stars, clouds, glitter, then a canopy). The base never gets bigger or squarer than the footprint, and a canopy must not widen the picture beyond the feet: only height and decoration grow. [the rules above]."

## C. Colorable parts (one trick, so the game can recolor the item)
Add to prompts A and B: "Paint the part that should be recolorable (for a bed: the blanket; for a plant: the pot; for a chair: the cushion) in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta. Every other part keeps its normal colors. Do not use magenta anywhere else." The game cuts the magenta part out and recolors it in any palette color.

## D. Wall items (window, mirror, shelf, poster, balcony door)
Wall items are drawn FRONT-ON (flat, like looking straight at a wall), not isometric; the game skews them onto the left or right wall. "Draw each item straight from the front, flat, no perspective, centered, same style. Sizes in wall units (1 unit = 50 px wide and 50 px tall on the template; walls are 12 units high, 600 px): window 4 x 4, shelf 2 x 1, mirror 2 x 3, poster 2 x 2 ..." The ceiling chandelier is also drawn front-on, hanging from a point at the top center.

## E. Surfaces (no art needed)
Walls and floor are drawn by the game (colors from the paintbrush palette; patterns are generated: stripes, dots, stars, checks, clouds, hearts). If you want hand-drawn patterns, ask for "a seamless tile, 256 x 256, pastel, flat, no outline".

## F. Check before sending a sheet to the game
1. Overlay the template's footprint diamond on each item: the feet must be on its corners (left, front, right) and the front foot the lowest point.
2. Check the base edges: a base 3x4 should be exactly wider than 3x3 by one half-tile on each side; a 'square' item must not be passed off as 3x4.
3. Levels of one item must keep the same feet pixels; check by flicking between them.
4. Ask Gemini to also send a second version of the sheet with the footprint diamond drawn in cyan under each item: it helps to see its drift, and the game ignores it.
The game's `groundtest` re-measures every picture from its pixels, so art that drifts is caught when it is added.

## G. Back views, for turning items (see `docs/ROTATION_PLAN.md`)
The game mirrors every picture for the second facing; for turning an item all the way round it also needs the BACK view: the same object turned 180 degrees about its vertical axis (the game mirrors that for the fourth facing). Attach, per request, the current pictures of the items (one reference image per item, each cut from the game, front-right facing) and the `room_template.png`.

Prompt (fill in the item list, one batch per request; sheet of 3 columns x N rows, in the order of the attached reference images):

"I attach reference pictures of children's-room items, each drawn facing front-right, and the isometric grid template. For EACH reference picture draw the SAME object turned 180 degrees around its vertical axis, so that I see it from the opposite side: what was its front is now facing away from the viewer, and I see its back and the opposite sides. Keep everything else identical to its reference: the same camera (isometric 2:1, every horizontal edge at exactly 26.57 degrees, no perspective convergence), the same scale, the same footprint diamond with the same four feet/corners on the same pixels (so the back view can replace the front view without the item moving), the same height, the same colours, outline thickness, sticker style, soft lighting from the top-left, the right side a little darker than the left, plain white background, no ground shadow, 15% empty margin, nothing cropped. Do not add or remove parts that exist on both sides (legs, handles, lids); show what the back really looks like (a plain back panel, the back of the backrest, the other end of a slide, the back of a laptop screen, the reverse of the frame and so on); keep the back simple and symmetric, with no text, no logos, no one-sided details. Parts that are painted flat magenta (#FF00FF) in the reference stay flat magenta with their shading in lighter and darker magenta; linen that is plain white in the reference stays plain white; do not use magenta anywhere else. One item per cell, centred on its diamond, in the same order as the references. Also send the same sheet again with each footprint diamond drawn in cyan under the item (for my checking only)."

Batches (each item's footprint in tiles of the template's 10 x 10 floor, as the game uses it):
- A, furniture (14): chair 2x2, armchair 2x2, cloud sofa 2x2, writing desk 2x4, wardrobe 2x1, big wardrobe 2x1, bookshelf 2x1, piano 4x2, dollhouse 2x2, standing mirror 1x1, toy box 2x2 (three versions), costume box 2x2.
- B, bed levels 1-5 (5): all 3x4 (level 4: 3x3), the four feet on the same pixels as the front view of the same level; the blanket, sheet, pillow and curtains stay plain white linen (the game cuts the masks from it), the pillow end is now toward the viewer.
- C, play items (14): slide 1x3, low slide 1x3, big easel 1x1, easel 1x1, telescope on tripod 2x2, two laptops 1x1, drawing tablet 1x1, toy car with driver 1x1, toy car 1x1, two guitars 1x1, saxophone 1x1, magic diary 1x1.
- D, characters (6): monkey, two bunnies, teddy, unicorn doll, ladybug (all 1x1): the back of the character, no face.
Ask for 4 to 6 items per sheet (for example batch A as three sheets) so the pictures stay large; the order of the cells must follow the order of the attached references.

### G.1 Corrections after the first back-view sheet (9 items: chair, cloud sofa, desk, wardrobe, big wardrobe, bookshelf, piano, dollhouse, mirror)
Good and in the game: wardrobe, big wardrobe, bookshelf, piano, dollhouse, mirror, and the cloud sofa from the sheet with the cyan diamonds. What to ask again:
- **Chair.** Both versions show the backrest BEHIND the seat, seen from the front, so it is the front view again (or its mirror). A back view is the chair turned half way round: the backrest is the nearest part, in front of the seat and hiding part of it, we see the BACK of the backrest, the seat's top beyond it, and the four legs. Prompt: "Draw this exact chair turned 180 degrees about its vertical axis, same camera, same size, same colours. We now see it from behind: the back of the backrest in the foreground (a plain flat panel, no cushion), the seat's top visible beyond it, the legs. The four feet stand on the same four points as in the reference. White background, no ground lines."
- **Cloud sofa.** The sheet with the cyan footprints is right (a smooth back, a fold at the side). The clean sheet still shows the seat dent, which is the front.
- **Desk.** Not needed: the desk is the same from both ends.
- **Dollhouse.** Usable. Its back is about 12% lower than the front (the roof peak) and the left face is narrower than the right although the footprint is square. If it looks off when turning, ask for the same house with the roof peak as high as the reference.
- **Both sheets in one go:** please send the clean version only (a footprint drawn in the picture has to be cut out afterwards); if a footprint is wanted, ask for it as a separate copy.

## What the sheets you sent are good for
- **Furniture sheet 1 (isometric beds, tables, desk, mirror, telescope):** the right camera. Facings differ between items (some face left); redraw with "all face front-right".
- **Furniture sheet 2 (front-on):** a different projection; usable only for wall items (windows, shelves, mirror), not for floor items.
- **Paintbrush sheet:** the color picker. 16 brushes = 16 palette colors (white, black, pink, purple, indigo, red, light blue, navy, light green, dark green, orange, yellow, brown; gold, silver and rainbow as premium colors).
- **Coin sheet:** the token icon (coin), the balance display (stack, pile, bag) and the unlock ceremony (treasure chest).

## G. Colorable beds (for the next bed pictures)
The bed parts are colored in the game by a mask. To make that exact, ask for each bed level in two versions with the same pixels: the normal one, and one where the blanket is flat magenta (#ff00ff), the sheet flat cyan (#00ffff), the pillow flat yellow (#ffff00) and the curtains flat green (#00ff00), keeping the same shading and outlines. The game then derives the masks from the difference (the same magenta trick as plants and furniture) instead of from the white areas.
