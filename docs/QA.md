# Current verification

The app contains one continuous 3D temple, 64 prayer mats, chibi monks, incense, palms, prostration, woodfish and flowing beads. The principal Buddha is a generated transparent image in a 3D shrine; both attendant statues use the attributed CC BY-SA museum scan. See public/assets/models/CREDITS.md.

`npm test` covers grounded animations, opposite walking limbs, prayer mat picking, world bounds, real multiplayer synchronization, mat exclusion, mutual greetings, asset geometry, eye-level cameras, mobile safe framing, zoom/orbit bounds and portrait/landscape switching.

`npm run build:pages` produces the single-player edition at `/healthy-life/` and the multiplayer edition at `/healthy-life/multiplayer/`. Both use the same optimized scene assets. The temporary `.pages-build` directory is removed after packaging.

Browser checks include desktop, 390×680 portrait, 844×390 landscape and 568×260 short landscape. Palms, bowing and incense remain above the toolbar. Rotation retains the active action; zooming and dragging preserve the visitor's full footprint. No relevant runtime console errors were observed. These are browser viewport checks, not a physical iPhone Safari network benchmark.

Multiplayer public API smoke check: `node scripts/check-cloud-room.mjs`. Backend source and migrations are in cloud-deployment/. Full 64-user load testing has not been performed.

The asset cleanup removes unused experimental models, superseded scene photographs and historical preview images. Main Buddha and pine-canopy assets use WebP with transparency. Main image dimensions remain 1024×1536; the renderer and action proportions are unchanged. Archived visuals remain recoverable through Git history.
