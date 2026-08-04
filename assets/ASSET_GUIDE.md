# Asset Guide

## GIFs — `public/assets/gifs/`

- `sad.gif` — shown at streak 0
- One file per entry in `ANIMALS` in `src/config.js`, currently:
  `a b c d e f g h i j o p q r s t u v w x`

A new friend is revealed every 5 correct answers, so 20 GIFs cover a full world of 100.
After 100 the animals cycle again, but the world's colour scheme has changed.

**To add more friends:** drop the GIF in this folder and add its name to `ANIMALS` in
`src/config.js`. Nothing else needs to change — the milestone maths reads the array length.

Square GIFs work best. The current set is 200x200 and is displayed at up to 300px, so
anything from 300x300 upwards will look sharper on a projector.

## Sounds — `public/assets/sounds/`

| File | When it plays |
| --- | --- |
| `increment.mp3` | Every correct answer. Pitch rises through each block of five. |
| `celebration.mp3` | Every milestone. Plays lower, and twice, for a world unlock. |
| `reset.mp3` | When the streak is broken back to 0. |
| `background-music.mp3` | Optional loop, off until the teacher presses Play. |

Keep `increment.mp3` short (under ~200 ms) — anything longer smears during rapid fire.

## Icons — `public/assets/favicon/` and `public/manifest.json`

Standard favicon set plus the PWA manifest, so the app can be added to a phone's home screen.

## Backgrounds

No longer used. Every world's background is drawn in CSS from the palette in
`src/config.js`, so there is nothing to supply here.
