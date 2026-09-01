# Cosmic Explorer

A canvas 2D planet-orbiting jumper. Hold to jump, swipe up for jetpack, double-tap a planet to explore.

**Play it:** [https://srephoto.github.io/Cosmic-Explorer/](https://srephoto.github.io/Cosmic-Explorer/)

GitHub Pages builds automatically from `main`.

**Login is optional.** The game always starts in a local guest session with on-device saves, so it runs with no Firebase backend at all. Firebase (configured in `firebase-applet-config.json`) only adds cloud sync, leaderboards, and online multiplayer; if it is missing or unreachable, the game falls back to guest mode automatically. `Play as Guest` never requires a network:
- Firebase available → anonymous cloud guest (sync + multiplayer).
- Firebase unavailable → local guest, everything saved to `localStorage`.

Builds: `bun run build` (standard), `bun run build:pages` (GitHub Pages bundle with `404.html`, `.nojekyll`, and `/Cosmic-Explorer/` base paths).
