# Temple visual assets

## Current principal Buddha image
- Asset: `../shakyamuni-gold-hd.png`, generated for this project with the built-in imagegen tool.
- Fixed transparent image in a physical 3D shrine; it is not a 3D museum scan or a photograph of an actual temple statue.
- Prompt: `../shakyamuni-gold-hd.prompt.txt`.
- The current image contains complete face, hands, robe and lotus throne.

# Archived principal scans and active attendant scans

Scanning authors: **Miguel Bandera** (archived 3D study) and **Minneapolis Institute of Art (artsmia)** (attendants).

## Tian Tan Buddha, Hong Kong — archived 3D study (not currently rendered)
- Model: `tiantan-buddha.glb`
- Scan author: **Miguel Bandera** (https://sketchfab.com/miguelbandera).
- Original title: **Tian Tan Buddha videogrammetry scan**.
- Original: https://sketchfab.com/3d-models/tian-tan-buddha-videogrammetry-scan-3e7bf4482e28420fbb2ca71c90dfaf23
- Download mirror: https://www.artheonmuseum.org/artwork/tian-tan-buddha-videogrammetry-scan-3e7bf4
- License: **CC BY 4.0**, https://creativecommons.org/licenses/by/4.0/
- Adaptation: extracted the Shakyamuni figure and lotus-seat portion from the surrounding landscape/platform, smoothed coarse facets with two Loop subdivision passes, normalized scale and placement, and applied a soft gold finish. Face and both hands come from the full original figure; there are no replacement hand/arm meshes. Original photographic texture supplies restrained local surface detail. Runtime material suppresses broad baked illumination/patina, with extra local relief retained around the face and hands; warm fill lighting and soft physical-gold reflections are used.
- Processing: `scripts/extract-tiantan-buddha.mjs` and `scripts/subdivide-scan.mjs`.
- Model is an adaptation of a public sculpture scan; no endorsement by the sculptor, scanning author, or Po Lin Monastery is implied.

## Earlier Tang seated-Buddha study
- Archived model: `tang-buddha.glb` (not loaded by the current scene).
- Scan: Daniel Pett, CC0 1.0. Original: https://sketchfab.com/3d-models/seated-figure-of-buddha-a4d22eb6d3c44848bd49b89fb4c28759
- The former replacement-hand code has been removed from the current scene.

## Earlier Tibetan Amoghasiddhi study
- Archived model: `tibetan-buddha.glb` (not loaded by the current scene)
- Original: https://sketchfab.com/3d-models/tibetan-amoghasiddhi-buddha-13th-c-ce-a2c46e73a9294f32ab12520c6b87a079
- Author: Minneapolis Institute of Art. License: **CC0 1.0**.

## Earlier Chinese Amoghasiddhi study
- Archived model: `amoghasiddhi.glb` (not loaded by the current scene)
- Original: https://sketchfab.com/3d-models/chinese-amoghasiddhi-buddha-1403-1424-ce-33699be99fd64375bf0371c0e0c12f70
- License: **CC0 1.0**, https://creativecommons.org/publicdomain/zero/1.0/

## Bodhisattva, one of a pair, 18th century
- Model: `bodhisattva.glb` (instanced twice in the sanctuary)
- Original: https://sketchfab.com/3d-models/bodhisattva-one-of-a-pair-18th-c-ce-f7c224270f5144a99c40d6955218bac5
- Download mirror: https://www.artheonmuseum.org/artwork/bodhisattva-one-of-a-pair-18th-c-ce-f7c224
- License: **CC BY-SA 4.0**, https://creativecommons.org/licenses/by-sa/4.0/
- The adapted model is distributed under the same **CC BY-SA 4.0** license. This license applies to the model adaptation, not the unrelated application code.

## Adaptations
Original scanned geometry and proportions retained. Original painted color textures removed; gold-leaf PBR material substituted. Original normal and ambient-occlusion textures retained where available. Scene placement, uniform scaling and orientation applied at runtime. Processing script: `scripts/prepare-statue-scans.py`. No institution endorsement is implied.

### Web delivery optimization

`bodhisattva-compact.glb` is the same attributed CC BY-SA 4.0 Bodhisattva scan, encoded with glTF Transform 4.5.1: Meshopt geometry compression (16-bit positions, 12-bit normals) and WebP textures at quality 95. Original detailed geometry and attribution retained; file reduced from 12,214,492 to approximately 2,340,000 bytes. This derivative remains CC BY-SA 4.0.
