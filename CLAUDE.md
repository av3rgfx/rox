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
- `data/`: the baked route, 2173 m, the way the owner drives it (checked on a Street View walk-through they recorded):
  up the car park lane along the Panorama's west side (the Panorama on the right), straight to the small roundabout,
  Via Pietro Gherardini, Via Ginetta Chirici, Via Ubaldo Fantacci, Via Bure Vecchia Nord, Via Enrico Fermi, Via Dino
  Buzzati, Via Luigi Salvatorelli past Utensilferramenta (on the right). `route.json` at the root is the routing input
  (the repo root is Pixel Path's TRIP): `route.mjs --out . --from "43.937618,10.938431" --via "43.938660,10.938543"
  --to "43.930355,10.945292"` (south end of the lane, its north end, 70 m past UFP's door), then set the `from`/`to`
  names in route.json before baking. After a rebake that moves the route, `git show HEAD:data/c0000.json > old.json`
  and `node tools/rebase.mjs --old old.json` moves the real buildings and landmarks to the new metres (by their place
  on the map); "add"/"land" entries and main.js's car park are by hand. Rejected: a 1.1 km shortcut down Via Bure
  Vecchia Nord (not their road), OSRM's loop through the car park aisles (not their road either).
- `art/`: scenery kit (`kit.json`, PNGs), `plan.json`, `raw/` (pixelated inputs of clean.mjs), `codex/` (prompts,
  `REFERENCE.md` with the real road, `ref/` reference photos, `MESSAGGIO-CODEX.md`). All 14 `pistoia-*` and both
  landmarks are real Codex pictures (two rounds; the second came as PR #4, imported by hand and closed because it was
  based on an old branch). The Panorama's `b-panorama-bay` (four pilaster bays, repeats) and `b-panorama-entrance` were
  cut from Codex's whole-facade `lm-panorama` (no longer used). `tools/ufp-standin.mjs` (the code-drawn `lm-ufp`) is
  only a fallback now. Codex's first, invented warehouse (`extra-ufp`) is gone.
- Real buildings: `art/buildings-custom.json` gives mapped buildings their own picture (matched by [s, side] within
  6 m), adds ones the map lacks (`add`: the Panorama, 170 m of facade along the car park lane, a pattern of `pics`
  repeated every `tile` metres; the pictures of one pattern share one pixel scale, so one without the roof sign stands lower) and fixes land (`land`: the car park is `lot`). `node tools/buildings.mjs` (run by
  plan-art.sh) writes `data/buildings.json` (road.js loads it as `env.buildings`, layout.js applies it) and adds role
  `custom` jobs to plan.json, never used by the generic kit. Placeholders are ignored, so a building keeps its generic
  look until its picture is real. `node tools/standins.mjs` draws code stand-ins for the Panorama and UFP's second
  warehouse into art/raw. main.js's `spawnParked` lays out parked cars (solid) as the road ahead is built: in the car park bays (`q.bays`)
  and at the kerb where a stretch has `park` (vans where it has `trucks`).
- Landmarks: `art/landmarks-custom.json` (Ex Mensa Sant'Agostino, UFP, placed from their OSM footprints)
  is merged into `data/landmarks.json` by `node tools/landmarks.mjs` (plan-art.sh runs it; run it after any rebake).
  A landmark with a real picture replaces the frontage at its real place (layout.js); placeholders are never shown.
  OSM/OSRM give where buildings are and their size and type, never their look: faithful pictures need photos.
- The road itself: `node tools/realroad.mjs` (run after any rebake; `--cache` reuses `.cache/realroad.json`) reads OSM
  along the route (traffic signals: none on this road; STOP and give-way on our road; marked crossings; roundabouts)
  and merges `art/road-custom.json` (hand fixes from the owner's video: dropped signs, each roundabout island's look,
  `stretches` with width, sidewalks, one-way carriageways with a median (`dual`), the car park bays (`lot`), hedges,
  walls, reeds, kerb parking, tree rows, `open` streets, `roles` for generic pictures; `props` like the mast, the
  rubbish heap, the bollards; `noTowers`) into `data/road.json`. road.js loads it as `env.road`; layout.js marks
  segments (`q.ring`, `q.isl`, `q.dual`, `q.bays`, `q.mark`, `q.park`...) and road.js's `groundCol` paints them.
  Without data/road.json the game falls back to Pixel Path's rule (a signal and a crosswalk at every town junction).
  `buildings-custom.json` entries with `"hide": true` keep a mapped building from showing.
- `assets/rox/face.png`: Rox's face, 53x70 RGBA cut-out from the owner's photo.
- `tools/pixel-path/`: the Pixel Path skill (scripts + templates). `tools/codex-art.mjs`: free art via Codex/ChatGPT
  (`prompts`, `import`). `tools/plan-art.sh [moderate|detailed]`: the art plan with Pistoia subjects.
  `tools/test/`: headless tests (see its README).
- `.github/workflows/pages.yml`: deploys index.html, game/, data/, assets/, art/*.png + kit.json on push to main.

## Known gaps from the real road (see NEXT_SESSION.md)

- Roundabouts: the road does not curve round the island as tightly as the real ring (headings are smoothed over
  ±60 m); the island is an oval on the left.
- Hedges, walls and reeds are code-drawn pieces facing the camera: blocky up close.
- Most `b-*` buildings still wait for their Codex pictures (generic look until then).

## Conventions

- Plain ES modules, no build, no npm dependencies for the game. Serve statically (`python3 -m http.server`).
- Dense one-line style like Pixel Path, short comments that say why. Match it.
- World units are metres: `s` along the route, `lat` from the road centre (+ right, Italy drives right),
  `q = road.roadAt(s)` gives `rw` (half asphalt width), `sw` (sidewalk), `hd` (heading). Car rear bumper at
  `G.pos + CARZ`, front at `+3.4`. Rox pictures: 40 px per metre (`PPM`).
- Careful when editing one-liners with comments: a `//` comment added mid-line swallows the code after it
  (it happened once). Use `/* */` or put code before the comment, and run
  `node --input-type=module --check < game/main.js`. The check does not catch it when the swallowed code is a whole
  statement (it happened twice): load the page and look for `pageerror`.

## Checking a change

1. `python3 -m http.server 8765 --bind 127.0.0.1` from the repo root.
2. `node tools/test/ui.mjs /tmp/shots` and `node tools/test/drive.mjs investi|chase /tmp/shots ...`, then look at the
   screenshots with Read. Also try a phone size (`390 844 ... mobile` and `844 390 ... mobile`). For the scenery,
   `node tools/test/at.mjs /tmp/at 0,500,1000` shoots the empty road at given metres. Outside the cloud image:
   Playwright in a scratch folder (`PLAYWRIGHT=<dir>/node_modules/playwright/index.mjs`) and `CHROME=<installed chrome>`.
3. Expected noise: the AudioContext warning in headless runs.
4. After importing art, check `clean.mjs`'s output: `cut` / `boxed` pictures are dropped. `codex-art.mjs import` pads
   each picture to the plan size with a margin; pictures imported before that fix were re-padded with
   `import --src art/raw`.

## Network notes (cloud sessions)

- Overpass: in the cloud `overpass-api.de` and its lz4/z mirrors returned 503 and kumi/private.coffee timed out, the
  mail.ru mirror worked (`bake.mjs --trip . --overpass https://maps.mail.ru/osm/tools/overpass/api/interpreter`). On the
  owner's PC `overpass-api.de` works but answers 406 without a User-Agent: set `PIXEL_PATH_USER_AGENT` (realroad.mjs
  sends one by default) and expect an occasional 504 (it retries mirrors).
- Rebaking is only needed if the route changes. After a rebake run `sh tools/plan-art.sh` (the kit's roles follow the
  frontage) and diff the job names with the old plan: new names need new pictures
  (`node tools/codex-art.mjs prompts --only a,b --out art/codex/PROMPTS-NUOVE.md`).
- Git on the owner's PC has no identity configured: commit with `git -c user.name=av3rgfx -c user.email=av3rgfx@gmail.com
  commit ...` (do not change the global config). Playwright is not installed there either: see "Checking a change".
