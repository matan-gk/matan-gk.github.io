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

## What the sheets you sent are good for
- **Furniture sheet 1 (isometric beds, tables, desk, mirror, telescope):** the right camera. Facings differ between items (some face left); redraw with "all face front-right".
- **Furniture sheet 2 (front-on):** a different projection; usable only for wall items (windows, shelves, mirror), not for floor items.
- **Paintbrush sheet:** the color picker. 16 brushes = 16 palette colors (white, black, pink, purple, indigo, red, light blue, navy, light green, dark green, orange, yellow, brown; gold, silver and rainbow as premium colors).
- **Coin sheet:** the token icon (coin), the balance display (stack, pile, bag) and the unlock ceremony (treasure chest).

## G. Colorable beds (for the next bed pictures)
The bed parts are colored in the game by a mask. To make that exact, ask for each bed level in two versions with the same pixels: the normal one, and one where the blanket is flat magenta (#ff00ff), the sheet flat cyan (#00ffff), the pillow flat yellow (#ffff00) and the curtains flat green (#00ff00), keeping the same shading and outlines. The game then derives the masks from the difference (the same magenta trick as plants and furniture) instead of from the white areas.
