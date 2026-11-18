# Gemini prompts: 3D wall items (plan step B2): windows, the clock, hanging posters and art

Why: the windows, the clock and the map frame are drawn flat, front-on, and the game shears them onto the wall, so they look pasted on. The shelves showed the fix: draw the item **already in the room's view, as a solid object attached to the wall** (a frame with a real edge, a clock with a thick body, a sill that sticks out), and the game places it unsheared, anchored on the wall, mirrored for the left wall. Companion to `GEMINI_PROMPTS_SHELVES.md` (same camera and lessons), `GEMINI_PROMPTS.md` and `GEMINI_PROMPTS_UNICORN.md`.

## What to send
**Required** (these replace the flat pictures)
1. **Sheet W1, windows level 1 to 3** (3 in a row): attach `wallitem_template_windows_a.png`, `style-refs/windows-current.png` and `style-refs/vision-room.jpg`, then paste prompt W1.
2. **Sheet W2, windows level 4 and 5** (2 in a row): attach `wallitem_template_windows_b.png`, the same two references, and paste prompt W2.
3. **Sheet C1, the clock**: attach `wallitem_template_clock.png`, `style-refs/clock-map-current.png`, paste prompt C1.
4. **Sheet A1, six hanging pictures**: attach `wallitem_template_art_a.png` and `style-refs/vision-room.jpg`, paste prompt A1.

**Optional**
- Sheet A2, six more pictures (second theme set), attach `wallitem_template_art_b.png`, paste prompt A2.
- The treasure map frame redrawn in 3D (it is one more cell of A1 or A2 if you want it; I left it out because it is a plain frame).
- A pixel-art version of any sheet: swap the STYLE paragraph for the "style B" one at the bottom.

**Decision for you before you start (one line is enough):** smooth outlined cartoon like the present windows and furniture (style A, the default in every prompt), or pixel art like the shelves and the vision picture (style B)? Mixed rooms look odd, and the shelves are the only pixel-art wall items so far.

The right wall is enough: the game mirrors every picture for the left wall, as it already does for the shelves.

## Lessons carried over (read first)
- **A guide image beats the words of a prompt.** The templates here show only the *box* each item fills (red body, orange sill, green "up" line) and **no wall**, because Gemini draws whatever it sees (the first shelf try drew a slab of wall behind every shelf until the wall was removed from the template). Never attach a template with a wall in it.
- Attach the **current** pictures as style references: they carry the line weight, colours and finish better than any description.
- The pictures are stickers: plain white background, no wall, no floor, no shadow on a wall, no text.

## Camera (the part Gemini gets wrong most often)
- We look at the **right-hand wall** of a corner room. Everything lying in the wall plane is drawn **sheared**: every horizontal line on the front of an item runs **down to the right at exactly 26.57 degrees** (1 down for every 2 across), vertical lines stay exactly vertical, no perspective convergence. A circle on the wall becomes a slanted ellipse (its 12-to-6 line stays vertical, its 9-to-3 line slopes like the other horizontals); an arch becomes a slanted arch. **Do not draw the front straight on**: that is the flat picture we are replacing.
- The item **sticks out of the wall toward the lower left**: its depth edges run **down to the left at 26.57 degrees**. What we see of a solid item: its front face, a thin top face, and its **right end** (the end away from the corner). The left end is hidden behind the front face.
- Light from the top-left. The front face is lightest, the top face a little lighter still, the right end the darkest.
- The templates show the exact box for each item. The front face must fill the red parallelogram; depth edges follow the thin edges.

## Prompt W1: windows, levels 1 to 3 (attach `wallitem_template_windows_a.png`, `windows-current.png`, `vision-room.jpg`)

```
Draw ONE image: three wall windows in a row for a cute children's-room game, on a plain white background, one per cell, in the same order and the same relative sizes as the attached template. The first attached picture is the template: each cell shows a red box (the window's frame sticking out of the wall), an orange slab under it (the sill sticking out further), and a green line meaning "up". Use it ONLY as a guide for the camera, size and position: do NOT draw the wall, the red or orange outlines, or the green line. The second attached picture shows the three current FLAT windows (levels 1 to 3 are the first three from the left): draw the SAME three windows, with the same design, colours and sky scenes, but as solid 3D objects attached to a wall, seen like the template. The third picture (the vision room) shows the mood.

The three windows, left to right:
- Cell 1, LEVEL 1: a plain square wooden window, one big pane of pale blue glass with two diagonal highlights, a simple wooden frame, a plain wooden sill ledge under it.
- Cell 2, LEVEL 2: a double casement window with two sashes and a vertical mullion in the middle, two silver handles, small silver hinges on the right, a sky with white clouds in the glass, a thicker frame, a rounded sill.
- Cell 3, LEVEL 3: a tall window with a round arched top carved in wood, a small cloud-shaped glass panel in the arch, scrolled corner carvings inside the two lower panes, two silver handles, a blue sky with clouds; a carved arched frame and a sill.

HOW IT MUST LOOK: the window's FRONT FACE lies in the wall plane, so every horizontal line of the frame, of the sashes and of the sill runs down to the right at exactly 26.57 degrees, every vertical stays vertical (the same shear as the template's red parallelogram). The frame is a box that sticks out of the wall by the template's depth, so we see its front, its thin top face and its RIGHT end. The glass is set back a little inside the frame: along the inner right edge of the opening, a thin strip of the frame's inside is visible. The sill is a slab that sticks out toward the lower left, with its top face, its front edge and its right end visible. The glass shows a painted sky scene (opaque, nothing behind it), with its highlight lines running along the same slant.

STYLE A (match the attached current windows): smooth cartoon, one thick dark-brown outline round every shape, soft pastel colours, wood in warm tan, light from the top-left, simple glossy highlights, no pixel texture.

SIZES: keep the same size ratios as the template (the three windows are not the same size). Each window fully inside its cell with white space around it, nothing cut off.

DO NOT: draw any wall, curtain or room, text or numbers, the template's red/orange/green guide lines, a floor, a shadow on a wall, magenta, or a front-on (unsheared) window. Output one image.
```

## Prompt W2: windows, levels 4 and 5 (attach `wallitem_template_windows_b.png`, `windows-current.png`, `vision-room.jpg`)

```
Same task, camera, rules and style as the previous window sheet, but TWO windows (the 4th and 5th from the left in the second attached picture), in two cells, same sizes as the template. The template is a guide only: do not draw its red, orange or green lines or any wall.

- Cell 1, LEVEL 4: a tall window with a half-round arched top. In the arch, a pastel STAINED-GLASS fan (a half sunburst of lilac, mint, yellow, pink, blue pieces with thin dark leading). Below it, double sashes with a middle mullion and silver handles, glass showing a pastel sky with a rainbow and clouds; a thick rounded arch frame in warm wood; a sill.
- Cell 2, LEVEL 5, the grandest: the same shape but richer. A carved wooden arch with scroll ornaments and a small purple jewel at the top, side pillars with small coloured gems (pink, blue, green, lilac), a stained-glass fan in the arch, double sashes, a sky with a rainbow, clouds and two or three tiny unicorn silhouettes, and on the sill THREE small potted plants (two green, one with pink flowers) with a few white sparkles.

Everything in the first window prompt applies: the front face lies in the wall plane (horizontals slope down to the right at exactly 26.57 degrees, verticals vertical; the arches are slanted arches), the frame sticks out of the wall (front, thin top face and RIGHT end visible), the glass is set back with a thin inner edge visible on the right, the sill is a slab sticking out toward the lower left, the plants stand upright on the sill's top face. Light from the top-left. STYLE A as before. White background, nothing cut off, no wall, no text, no guide lines, no front-on window. Output one image.
```

## Prompt C1: the wall clock (attach `wallitem_template_clock.png`, `clock-map-current.png`)

```
Draw ONE image: a round wall clock for a cute children's-room game, on a plain white background, as a solid 3D object attached to a wall. The first attached picture is a guide for the camera, size and position only (a round body sticking out of the wall, with a green "up" line): do NOT draw the guide lines or any wall. The second attached picture shows the current FLAT clock (the pink one on the left): draw the SAME clock, same design and colours, now in 3D.

DESIGN: a cupcake-wrapper clock. The body is a thick round tin with a scalloped pink rim like a cupcake paper case, with the pleats visible along its side; a pastel cream face with twelve dots (NO numbers), two dark brown hands showing ten past ten, a small pink cherry on top of the rim, sticking up. The face is covered by a gently domed glass with a bright highlight (a thin white curve), and the hands are slightly raised above the face with a faint soft shadow on it. The body is about 30 wall units deep (the template's depth).

CAMERA: the face lies in the wall plane, so the circle becomes a slanted ellipse: its 12-to-6 line is vertical, its 9-to-3 line slopes down to the right at exactly 26.57 degrees (like the template). The body sticks out toward the lower left: we see the face, the pleated side on the right and the top edge, and the back is hidden. Light from the top-left; the right side of the body is the darkest.

STYLE A: smooth cartoon, thick dark-brown outline round every shape, soft pastels, glossy highlights, like the attached clock. NO text, no numbers, no wall, no shadow on a wall, no guide lines, no magenta, not a front-on clock. Centered, with white space all around, nothing cut off. Output one image.
```

## Prompt A1: six hanging pictures (attach `wallitem_template_art_a.png`, `vision-room.jpg`)

```
Draw ONE image: a 3 x 2 grid on a plain white background, ONE wall decoration per cell, for a cute children's-room game, each as a solid 3D object hanging on a wall. The attached template shows for each cell a red box (the box the item fills) and a green "up" line: use it ONLY as a guide for camera, size and position, do NOT draw the red lines, green lines or any wall. Keep each item's size ratio as in the template (they are different sizes).

The six items, in reading order (left to right, top row first):
1. LANDSCAPE FRAMED PRINT: a chunky pastel wooden frame (about 10 units deep), a white mat, and a painting of a rainbow over soft clouds and a tiny unicorn.
2. PORTRAIT FRAMED PRINT: a lilac frame with a small gold corner detail, a painting of a smiling unicorn portrait on a pastel sky.
3. STRETCHED CANVAS: a square canvas about 14 units deep, so its thick edge is clearly visible, painted with abstract pastel clouds and stars; the canvas edge has a slight fabric texture.
4. HANGING POSTER SCROLL: a tall paper poster with a wooden rod at the top and a wooden rod at the bottom with a small pompom on each end, hanging from a thin cord and a small hook; the picture is a big smiling rainbow with the digits 1 2 3 drawn large and clean (digits only, no letters).
5. BUNTING: a string hanging between two small nails across the top of the cell, with seven pastel triangle pennants (pink, mint, lilac, yellow, blue) each with a little white star; the string sags slightly; the pennants have a little paper thickness and hang straight down.
6. PHOTO STRING: a thin cord with tiny star-shaped fairy lights, and five instant-photo cards hanging from it by little wooden pegs; the photos show tiny cute pictures (a cupcake, a rainbow, a unicorn, a star, a cat), the cards have thick white borders.

CAMERA: the front of each item lies in the wall plane, so every horizontal line runs down to the right at exactly 26.57 degrees and every vertical stays vertical, like the template boxes. Each item sticks out of the wall by the template's depth, toward the lower left: we see the front face, the thin top face and the RIGHT end. Items 4 to 6 hang almost flat against the wall but still have their own thickness (rods, pennants, cards). Light from the top-left.

STYLE A: smooth cartoon, thick dark-brown outline round every shape, soft pastel colours, glossy highlights, simple shapes, like the current game furniture. NO letters or words (only the digits 1 2 3 in item 4), no wall, no shadow on a wall, no guide lines, no magenta, no front-on pictures. Each item centred in its cell with white space around it, nothing cut off. Output one image.
```

## Prompt A2 (optional): six more (attach `wallitem_template_art_b.png`, `vision-room.jpg`)

```
Same task, camera, rules and style as the previous sheet (3 x 2 grid, one solid 3D wall decoration per cell, white background, template boxes are guides only, front faces sheared with horizontals running down to the right at exactly 26.57 degrees, verticals vertical, sticking out toward the lower left, front + thin top + RIGHT end visible, light from the top-left, no letters, no wall, no guide lines, no magenta). The six items:
1. OVAL GOLD FRAME: an ornate gold-pastel oval frame with a small ribbon bow at the top, holding a painting of a unicorn in a meadow.
2. VERTICAL PENNANT BANNER: a long felt banner hanging from a wooden rod with a cord, a pointed bottom edge with a pompom, decorated with a big yellow star and a crescent moon.
3. ROUND PORTHOLE PICTURE: a round frame like a ship's porthole with chunky rivets, holding a picture of a smiling sun over the sea.
4. HEART-SHAPED FRAME: a chunky pink heart frame holding a painting of a cupcake.
5. LONG LANDSCAPE PICTURE: a mint frame holding a painting of a candy castle and rainbow.
6. WOODEN RAINBOW ARCH: a standalone wall decoration cut from thick wood, a rainbow arch (about 12 units deep) in pastel stripes with a small cloud at each end, hung flat on the wall.
STYLE A as before. Output one image.
```

## Style B (pixel art, optional): replace the STYLE paragraph with this one
```
STYLE B (pixel art, like the vision picture): a clean pixel-art look, visible square pixels, a thin darker outline on every shape, soft pastel colours with a few bright highlight pixels and small white sparkles on glass, light from the top-left. Keep line thickness the same everywhere.
```

## Check before sending me a sheet
1. Every horizontal on the front of every item runs down to the right at the same slope; no item is drawn front-on (the failure we want to avoid). The vertical lines are vertical.
2. We can see the item's thickness on the right end and its thin top face; the sill (windows) and the pleated side (clock) stick out toward the lower left.
3. Windows: same designs and relative sizes as the flat ones (the five windows must still read as upgrades of each other); the sky is painted in the glass.
4. No wall, no guide lines, no text (only the digits in item 4 of A1), nothing cut off, white background.

If the slope is wrong, ask: "Redraw it with every horizontal line of the front face at exactly 26.57 degrees going down to the right, like the red box of the attached template, and the depth edges going down to the left at the same angle."

## What I do with the pictures
Cut each item and fit it to the wall coordinates (`tools/walls.py`, the "solid wall item" mode built for the shelves: an unsheared picture anchored by its back-edge corner, mirrored for the left wall), anchor and footprint measured from the picture's pixels. **Windows** need one more step: the window is a fixed item with five levels, drawn by `windowSVG` as a flat sheared picture; it will move to the solid-item drawing, keeping the same level, place and upgrade rules (`ROOM_ART.window` gets the new pictures; the sill height and the wall footprint come from the frame's back edge). The clock and the posters are catalog wall items (`g:'wall'`) and become `solid:true` entries like the shelves; the posters join the catalog (price 3, group wall). Then tests (catalog counts, walltest/surfacetest/groundtest as for the shelves), `ENHANCEMENTS.md` and a version bump.
