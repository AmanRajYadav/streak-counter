# 🎮 Streak Counter — Interactive Learning Game

A classroom streak counter for rapid-fire questioning. Put it on the projector, hold a
presentation remote, and click forward for every correct answer. The number climbs, a new
animal friend is revealed every 5, and a new world opens every 100 — all the way to 1000.

Live: [amanrajyadav.github.io/streak-counter](https://amanrajyadav.github.io/streak-counter)

## How the climb works

| Every… | What happens |
| --- | --- |
| 1 answer | Counter ticks up, chime rises in pitch through the block of five |
| 5 answers | **New animal friend revealed** + fireworks + celebration sound |
| 25 answers | Bigger celebration, deeper sound, more fireworks |
| 100 answers | **New world unlocked** — the whole colour scheme changes |
| 1000 answers | A ⭐ is banked and the journey starts over, counting on past 1000 |

There are 20 animals and 10 worlds (Meadow → Ocean → Desert → Volcano → Glacier → Jungle →
Sunset → Thunder → Aurora → Cosmos), so the run to 1000 never shows the same
animal-in-that-world twice.

Under the number: five dots showing how close the next friend is, and a thin bar showing
progress to 1000. The best streak ever reached is remembered on that device and shown top-left;
beating it lights up a **NEW RECORD** badge.

## Controls

| Action | Keys |
| --- | --- |
| Next (correct answer) | → ↓ PageDown Space Enter N — or click/tap anywhere |
| Reset to 0 | ← ↑ PageUp Backspace Esc P |
| Undo one (misfire) | Z − |
| Fullscreen | F |
| Clean view (hide all chrome) | M, or the on-screen button |

Every input goes through a single 90 ms gate, so one press is always exactly one point —
whether it comes from a remote, a keyboard, a mouse or a phone tap. Held-down buttons and
auto-repeat are ignored.

On phones and tablets a bottom bar appears with big **−**, **+** and **↻** buttons, and the
settings collapse behind a ☰ menu.

## Tuning it for your class

Everything adjustable lives in [`src/config.js`](src/config.js):

- `ANIMALS` — the reveal order. **Drop a new GIF into `public/assets/gifs/` and add its name
  here; the app stretches to fit automatically.** With 40 animals the run to 1000 shows
  40 distinct friends per world instead of 20.
- `STREAK_PER_ANIMAL` — how many correct answers per reveal (default 5).
- `WORLDS` — names, badges and colour palettes.
- `SMALL_CHEERS` / `BIG_CHEERS` — the praise text.
- `INPUT_COOLDOWN_MS` — raise it if a remote ever double-fires; lower it for faster rapid fire.

## Assets

```
public/assets/
  gifs/     sad.gif + one GIF per name in ANIMALS (200x200 works, square is best)
  sounds/   background-music.mp3, celebration.mp3, increment.mp3, reset.mp3
  favicon/  icons + PWA files
```

All 21 GIFs are preloaded in the background after the page settles, so a reveal never stalls
on the projector.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build into dist/
npm run deploy     # build + publish dist/ to the gh-pages branch
```

## Performance

If the classroom machine is old, open the menu and switch **Effects: Full** to **Lite** —
that drops the fireflies and thins the rain and dust. The setting is remembered.

## Remote compatibility

Tested with Logitech R400/R700/R800, Kensington remotes, generic clickers and PowerPoint
presenters. Both modern `event.code` values and legacy `keyCode` values are handled.

## Tech

React 18 + Vite, plain CSS animations, deployed to GitHub Pages. No tracking, no backend —
the only thing stored is the best streak and the volume settings, in `localStorage`.

## License

MIT — free to use in your classroom.

---

Made with ❤️ for educators and students. Powered by Fluence.ac
