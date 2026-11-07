# Why the bed and big items floated, and the permanent fix

## Findings (measured on the sprite pixels, not on screenshots)
1. **Wrong contact points.** The old bed feet were found as the lowest opaque pixel in each third of the picture. On the left third that was the footboard rail, not the leg, so the "feet" were in the wrong place.
2. **The bottom of the picture is not a footprint corner.** The lowest pixel of a sprite is one leg or the front edge; the floor block's corners are further left, right and back.
3. **The art is not drawn at 2:1 isometric.** Edge slopes measure 0.57-0.72 instead of 0.5, so one uniform scale can never put all contact points on the diamond. Width and height need separate scales (the vertical one is 0.77-0.92 of the horizontal).
4. **Bed levels 4 and 5 are drawn almost square**, so they fit a 3 x 3 block, not 3 x 4.
5. **Hand offsets.** A single offset (`BED_AT`, `+4`) was tuned for one level and one item; any other sprite inherited the error. Transparent padding differs per picture.

The suggestion to scale by `widthTiles` and anchor the bottom of the image to the floor does not solve this: it assumes the image bottom is the footprint corner (finding 2) and the art is 2:1 (finding 3).

## The method
For each sprite: find its contact points (leg tips as peaks of the bottom outline, else the left, front and right corners of the silhouette), then fit a horizontal scale, a vertical scale and a shift by least squares to the footprint's inset corners (front corner weighted most). Store `r = [dx,dy,w,h]` relative to the back corner of the footprint. Drawing is one function (`spriteSVG`) for everything. `tools/ground.py` holds the fitting code that produced the numbers (written against the earlier metadata, so it documents the method rather than re-running as is).

## Guard
`tests/groundtest.js` re-measures every picture from its actual pixels (lowest point, leftmost and rightmost point), maps them through `r` and requires the lowest point within 12 units of the footprint's front corner and the sides within 30 (60 for the canopy beds). Small 1 x 1 items must stand on their cell's centre line, no more than 18 units below its centre. Measured today: bed levels within 5 units at the front, furniture within 5 (toy boxes, couches, piano within 2), everything inside the tolerance.

## Limits
Soft round items (toy boxes, couches) have no single corner, so the check is on the lowest point and the width, not the corners. Colored versions (step 4) reuse the same `r`.
