# Gemini prompts for Cupcake's personal space

Attach `room_template.png` (this folder) to every request that draws furniture, and say "use the attached grid as the camera angle and scale reference".

## Camera, scale and style (the same for every prompt)
- Isometric 2:1 ("dimetric") view, looking down about 30 degrees; floor tiles are diamonds exactly twice as wide as tall. The template room is a 10 x 10 floor (one tile = 100 x 50 px on the 1024 px template image); the game rescales, only the proportions matter.
- Light from the top-left; the right side of every object is a little darker than the left, the top is lightest.
- Same cute sticker style as the reward sheets: thick dark-brown outline, soft pastel fills, glossy highlights, no background texture, plain white background, no shadows on the ground (the game adds them).
- One facing only: every object faces front-right (towards the viewer, to the right). The game mirrors it for the other facing, so no text, no logos, no one-sided details that look wrong when mirrored.
- Scale by footprint (tiles of the 10 x 10 floor): plant or stool 1x1 (or 2x2 for a big one), armchair or toy box 2x2, desk 2x4, sofa 3x2, rug 4x4, bed 4x4 (a canopy bed 5x5). An object's base must sit exactly inside its footprint rectangle on the template; taller parts rise straight up.

## A. Floor furniture and decorations (catalog picture and placed picture are the SAME image)
"Draw a sheet of 3 columns x 3 rows. Each cell holds ONE piece of children's-room furniture, centered, in isometric 2:1 view as in the attached grid. Items: [list, with footprints, e.g. single bed 4x4, rug 4x4 flat, potted plant 1x1, toy box 2x2, desk 2x4, round cloud armchair 2x2, telescope on tripod 1x1, bookcase 2x1 tall, standing mirror 1x1]. Follow the camera, light, scale and style rules: [paste the rules above]. White background, no ground shadows, nothing cut off at the cell edge, about 15% empty margin around each item."

## B. Upgrade levels of one item (a row = one item)
"Draw ONE item in 3 levels side by side on one row, same camera, same footprint (4x4) and the same position of the base in each cell. Level 1: simple and plain. Level 2: nicer, more details, a few pastel colors. Level 3: magical and rich (rainbow, stars, clouds, glitter). The silhouette base never gets bigger than the footprint; only height and decoration grow. [the rules above]."

## C. Colorable parts (one trick, so the game can recolor the item)
Add to prompts A and B: "Paint the part that should be recolorable (for a bed: the blanket; for a plant: the pot; for a chair: the cushion) in flat pure magenta (#FF00FF), with its shading as lighter and darker magenta. Every other part keeps its normal colors. Do not use magenta anywhere else." The game cuts the magenta part out and recolors it in any palette color.

## D. Wall items (window, mirror, shelf, poster, balcony door)
Wall items are drawn FRONT-ON (flat, like looking straight at a wall), not isometric; the game skews them onto the left or right wall. "Draw each item straight from the front, flat, no perspective, centered, same style. Sizes in wall units (1 unit = 50 px wide and 50 px tall on the template; walls are 8 units high): window 4 x 4, shelf 2 x 1, mirror 2 x 3, poster 2 x 2 ..." The ceiling chandelier is also drawn front-on, hanging from a point at the top center.

## E. Surfaces (no art needed)
Walls and floor are drawn by the game (colors from the paintbrush palette; patterns are generated: stripes, dots, stars, checks, clouds, hearts). If you want hand-drawn patterns, ask for "a seamless tile, 256 x 256, pastel, flat, no outline".

## What the sheets you sent are good for
- **Furniture sheet 1 (isometric beds, tables, desk, mirror, telescope):** the right camera. Facings differ between items (some face left); redraw with "all face front-right".
- **Furniture sheet 2 (front-on):** a different projection; usable only for wall items (windows, shelves, mirror), not for floor items.
- **Paintbrush sheet:** the color picker. 16 brushes = 16 palette colors (white, black, pink, purple, indigo, red, light blue, navy, light green, dark green, orange, yellow, brown; gold, silver and rainbow as premium colors).
- **Coin sheet:** the token icon (coin), the balance display (stack, pile, bag) and the unlock ceremony (treasure chest).
