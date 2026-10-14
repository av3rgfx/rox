# ROX: notes for Claude

A joke driving game in pixel art about Rox (Rossano), a colleague of the repo owner, on the real road from the Panorama
supermarket to their workplace, Utensilferramenta Pistoiese (UFP), in Pistoia. Affectionate teasing: keep the humour
cartoonish (he flies away like a skittle, no blood) and never mean beyond what the owner asks. All game text is in
Italian. Read `NEXT_SESSION.md` first: it has the state, the decisions taken with the owner and the to-do list.

## Layout

- `index.html`: screens (menu, how to play, pause, end), HTML HUD, touch controls, all CSS. Font: Press Start 2P
  (Google Fonts); it lacks Ì and À, so write "SI"/"PA-PA" style text in buttons.
- `game/main.js`: the game. State object `G`, `reset(mode)`, `step(dt)`, `bossStep`, `things()` (what to draw),
  `overlays()` (bubbles, particles, floating scores on the canvas), `hud()`, screens. Modes: `attract` (menu
  background, autopilot, silent), `investi`, `chase`. Phases: menu, countdown, play, paused, ending, end.
  `window.__rox` exposes `G`, `keys`, `CARZ`, `start` for the tests.
- `game/sprites.js`: everything not scenery is drawn by code at load: Rox (face photo on a pixel body; poses stand,
  wave, walk1/2, phone, eat, push, cart, grizzly, chase/chase2, sleep, gold*), cars, Ape, fennel, wet-floor sign,
  coffee, shadow, finish banner, UFP warehouse, speech bubbles, score text. All get a 1 px outline.
- `game/font.js`: the 5x7 pixel font extracted from road.js, plus ! ? : + *.
- `game/audio.js`: Web Audio synth (engine, sfx, tarantella loop). Settings in localStorage `rox-audio`.
- `game/road.js`, `game/layout.js`: Pixel Path's renderer (MIT, Jon Wheatley), minimally patched: `opts.camH`,
  `opts.horizon`, `opts.steer` + `setCamX()`, and `render(s, speed, things)` where a thing is
  `{z, lat, img, hm, wm?, lift?, rot?, alpha?}` drawn in painter's order; `thing.screen` gets the drawn box.
  Keep the originals in `tools/pixel-path/templates/` untouched for diffing.
- `data/`: the baked route (2246 m). `route.json` at the root is the routing input (the repo root is Pixel Path's TRIP).
- `art/`: scenery kit (`kit.json`, PNGs), `plan.json`, `codex/PROMPTS.md` + `jobs.json`. Placeholders until real art.
- `assets/rox/face.png`: Rox's face, 53x70 RGBA cut-out from the owner's photo.
- `tools/pixel-path/`: the Pixel Path skill (scripts + templates). `tools/codex-art.mjs`: free art via Codex/ChatGPT
  (`prompts`, `import`). `tools/plan-art.sh [moderate|detailed]`: the art plan with Pistoia subjects.
  `tools/test/`: headless tests (see its README).
- `.github/workflows/pages.yml`: deploys index.html, game/, data/, assets/, art/*.png + kit.json on push to main.

## Conventions

- Plain ES modules, no build, no npm dependencies for the game. Serve statically (`python3 -m http.server`).
- Dense one-line style like Pixel Path, short comments that say why. Match it.
- World units are metres: `s` along the route, `lat` from the road centre (+ right, Italy drives right),
  `q = road.roadAt(s)` gives `rw` (half asphalt width), `sw` (sidewalk), `hd` (heading). Car rear bumper at
  `G.pos + CARZ`, front at `+3.4`. Rox pictures: 40 px per metre (`PPM`).
- Careful when editing one-liners with comments: a `//` comment added mid-line swallows the code after it
  (it happened once). Use `/* */` or put code before the comment, and run
  `node --input-type=module --check < game/main.js`.

## Checking a change

1. `python3 -m http.server 8765 --bind 127.0.0.1` from the repo root.
2. `node tools/test/ui.mjs /tmp/shots` and `node tools/test/drive.mjs investi|chase /tmp/shots ...`, then look at the
   screenshots with Read. Also try a phone size (`390 844 ... mobile` and `844 390 ... mobile`).
3. Expected noise: one 404 for `art/extra-ufp.png` until the Codex warehouse exists; the AudioContext warning in
   headless runs.

## Network notes (cloud sessions)

- Overpass: `overpass-api.de` and its lz4/z mirrors returned 503, kumi/private.coffee timed out; the mail.ru mirror
  worked: `bake.mjs --trip . --overpass https://maps.mail.ru/osm/tools/overpass/api/interpreter`.
- Rebaking is only needed if the route changes (`route.mjs --out . --from ... --to ...`).
