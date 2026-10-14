// standins.mjs: stand-in pictures drawn by code, from the descriptions in art/buildings-custom.json, for the buildings
// that matter most (the Panorama, Utensilferramenta's second warehouse), so they stand at their real size before
// Codex draws them properly. Writes art/raw/<name>.png only where no picture exists yet (or with --force);
// then: node tools/pixel-path/scripts/clean.mjs --trip .
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, newImage, fillRect, drawText, writePNG } from './pixel-path/scripts/lib.mjs';
const A = args(), RAW = join(dirname(fileURLToPath(import.meta.url)), '..', 'art', 'raw');
const blank = (w, h) => { const im = newImage(w, h); im.data.fill(0); return im; };
const R = (im, x, y, w, h, c) => fillRect(im, Math.round(x), Math.round(y), Math.round(w), Math.round(h), c);
const P = {};
// the Panorama: cream wall, terracotta pilasters joined by a pergola cornice, glass between them, cypresses in front
function panoramaBay(entrance) {
  const W = 194, H = 96, im = blank(W, H), cream = [236, 228, 210], red = [176, 84, 56], redD = [140, 62, 42], glass = [92, 120, 140], glassL = [140, 168, 184];
  R(im, 0, 22, W, 74, cream);
  for (let x = 0; x < W; x += 4) R(im, x, 14, 2, 8, red); R(im, 0, 12, W, 3, redD); R(im, 0, 20, W, 3, redD);   // pergola cornice
  for (const px of [0, W - 16]) { R(im, px, 10, 16, 86, red); R(im, px + 12, 10, 4, 86, redD); }   // pilasters
  if (entrance) {
    R(im, 40, 40, 114, 56, [70, 74, 80]); R(im, 44, 44, 106, 52, glass); for (let x = 44; x < 150; x += 18) R(im, x, 44, 2, 52, [196, 40, 40]); R(im, 36, 36, 122, 5, [220, 220, 214]);
    R(im, 34, 0, 126, 12, [214, 34, 34]); drawText(im, 50, 2, 'PANORAMA', [255, 255, 255], 2);   // the red roof sign
  } else {
    R(im, 24, 34, W - 48, 40, glass); for (let x = 24; x < W - 24; x += 12) R(im, x, 34, 1, 40, [60, 70, 80]); R(im, 24, 40, W - 48, 3, glassL);
    for (const cx of [34, 70, 124, 160]) { for (let y = 40; y < 96; y++) { const hw = Math.round(Math.sin((y - 40) / 56 * Math.PI) * 5) + 1; R(im, cx - hw, y, hw * 2, 1, [52 + (y % 3) * 6, 96, 52]); } }   // cypresses
  }
  return im;
}
P['b-panorama-bay'] = () => panoramaBay(false);
P['b-panorama-entrance'] = () => panoramaBay(true);
// Utensilferramenta's other warehouse: ribbed sandy concrete, rain streaks, no sign
P['b-ufp-side'] = () => { const W = 192, H = 88, im = blank(W, H); R(im, 0, 0, W, H, [208, 184, 132]); for (let x = 0; x < W; x += 9) { R(im, x, 0, 2, H, [184, 160, 112]); R(im, x + 2, 0, 1, H, [222, 200, 150]); } for (let x = 3; x < W; x += 13) R(im, x, 10 + (x * 7) % 23, 2, 14 + (x * 5) % 17, [150, 140, 116]); R(im, 0, 0, W, 3, [150, 132, 96]); return im; };
// a transparent margin all round: a picture touching its edges reads as cut off to clean.mjs, which drops it
const pad = (im, m = 4) => { const out = blank(im.width + 2 * m, im.height + 2 * m); for (let y = 0; y < im.height; y++) out.data.set(im.data.subarray(y * im.width * 4, (y + 1) * im.width * 4), ((y + m) * out.width + m) * 4); return out; };
let n = 0; for (const [name, draw] of Object.entries(P)) { const f = join(RAW, name + '.png'); if (existsSync(f) && !A.force) continue; writePNG(f, pad(draw())); n++; console.log('  ' + name); }
console.log(`${n} stand-in pictures written to art/raw/`);
