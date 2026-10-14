// codex-art.mjs: the scenery art for free, drawn by Codex (or ChatGPT) instead of RetroDiffusion.
//
//   node tools/codex-art.mjs prompts     writes art/codex/PROMPTS.md and art/codex/jobs.json from art/plan.json:
//                                       one ready-to-paste prompt per picture, with the file name to save it as
//     [--only a,b --out art/codex/PROMPTS-NUOVE.md]   just some pictures, in a file of their own
//   node tools/codex-art.mjs import      reads every art/codex/in/<name>.png (any size, as the image model made it),
//                                       turns it into real pixel art at the size the game needs and writes
//                                       art/raw/<name>.png; then run Pixel Path's cleanup:
//                                       node tools/pixel-path/scripts/clean.mjs --trip .
//     [--only a,b] [--no-palette] [--colours 48] [--src DIR (default art/codex/in)]
//
// Turning a big generated picture into pixel art: the white backdrop is keyed out first (so edges do not blend into
// white), the subject is cropped to its outline, box-averaged down to the plan's size (each output pixel is the mean
// of the opaque pixels under it, opaque when more than half are), then every colour is snapped to the shared palette
// (templates/palette.png, the one Pixel Path gives RetroDiffusion) extended with the picture's own most common
// colours, so a whole street reads as one kit without losing the ochre plaster or the green shutters.
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, readJSON, writeJSON, readPNG, writePNG } from './pixel-path/scripts/lib.mjs';

const A = args(), cmd = process.argv[2], ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), ART = join(ROOT, 'art'), CODEX = join(ART, 'codex');
const plan = readJSON(join(ART, 'plan.json')); if (!plan) { console.error('no art/plan.json: run plan-art.mjs first (see README)'); process.exit(1); }

// pictures the game uses beyond Pixel Path's kit (none now: the UFP warehouse is a landmark, lm-ufp, at its real place)
const EXTRA = [];

const REFLINE = 'Make it a faithful pixel-art front elevation of the building in the reference photo(s): same shape, proportions, number of floors, colours, materials, windows, doors and signs; straighten it to a flat front view.';
const SHAPE = (w, h) => w / h > 1.2 ? { size: '1536x1024', word: 'landscape' } : w / h < 0.83 ? { size: '1024x1536', word: 'portrait' } : { size: '1024x1024', word: 'square' };
const STYLE = 'True 16-bit pixel art game asset: big clearly visible square pixels, crisp hard edges, no anti-aliasing, no blur, no gradients, a limited palette of flat colours, soft afternoon light from the left. Isolated on a plain pure white (#FFFFFF) background, no ground, no shadow on the ground, no sky, no scenery, no frame, no text except what is asked. The whole subject is inside the picture with a white margin on every side, nothing cut off.';
function codexPrompt(j) {
  // Pixel Path's prompts end with its own style words for RetroDiffusion; keep the subject, restate the style for a general image model
  const subject = j.prompt.replace(/, pixel art game asset.*$/, '').replace(/, isolated on a plain white background.*$/, '');
  const view = j.kind === 'facade' || j.kind === 'landmark' || j.role === 'extra' ? ' Orthographic, perfectly straight-on front view: no perspective, no side walls visible, the building\'s base is a straight horizontal line.' : '';
  const place = j.role === 'landmark' ? '' : ' Setting: the modern outskirts of Pistoia today (suburban and industrial zone), not a historic town centre and not a postcard village.';
  return `${subject[0].toUpperCase()}${subject.slice(1)}.${view}${place} ${STYLE}`;
}

if (cmd === 'prompts') {
  const only = A.only ? new Set(A.only.split(',')) : null, all = [...plan.jobs, ...EXTRA].filter(j => !only || only.has(j.name));
  const REF = join(CODEX, 'ref'), refs = existsSync(REF) ? readdirSync(REF).filter(f => /\.(jpe?g|png|webp)$/i.test(f)) : [];
  const jobs = all.map(j => ({ name: j.name, refs: refs.filter(f => f.startsWith(j.name + '-') || f.startsWith(j.name + '.')).map(f => `art/codex/ref/${f}`), file: `art/codex/in/${j.name}.png`, size: SHAPE(j.width, j.height).size, shape: SHAPE(j.width, j.height).word, target: [j.width, j.height], prompt: codexPrompt(j) }));
  mkdirSync(join(CODEX, 'in'), { recursive: true }); if (!only) writeJSON(join(CODEX, 'jobs.json'), jobs, true);
  const md = [`# ${only ? 'Immagini nuove' : 'Immagini'} per ROX (${jobs.length})`, '',
    ...(only ? ['Solo le immagini nuove: quelle già fatte con gli altri nomi restano valide.', ''] : []),
    'Ogni immagine: genera con il prompt qui sotto, nel formato indicato, e salvala **esattamente** con il nome indicato in `art/codex/in/`.',
    'Poi: `node tools/codex-art.mjs import` e `node tools/pixel-path/scripts/clean.mjs --trip .` (vedi README).', '',
    ...jobs.flatMap((j, i) => [`## ${i + 1}. ${j.name}`, '', `- Salva come: \`${j.file}\``, `- Formato: ${j.size} (${j.shape})`,
      j.refs.length ? `- Foto di riferimento: ${j.refs.map(r => `\`${r}\``).join(', ')}: usale come immagini di riferimento e aggiungi al prompt "${REFLINE}"` : `- Foto di riferimento: nessuna (se ne aggiungi in \`art/codex/ref/${j.name}-1.jpg\` rilancia \`node tools/codex-art.mjs prompts\`)`,
      '', '```', j.prompt, '```', ''])].join('\n');
  const out = A.out ? join(ROOT, A.out) : join(CODEX, 'PROMPTS.md'); writeFileSync(out, md);
  console.log(`${out.slice(ROOT.length + 1)}: ${jobs.length} prompts${only ? '' : ` (${plan.jobs.length} scenery from the plan + ${EXTRA.length} extra)`}`);
}
else if (cmd === 'import') {
  const only = A.only ? new Set(A.only.split(',')) : null, IN = A.src ? resolve(ROOT, A.src) : join(CODEX, 'in'), jobs = [...plan.jobs, ...EXTRA];   // --src art/raw: redo pictures imported before the margin fix
  const pal = A['no-palette'] ? [] : (() => { const p = readPNG(join(ROOT, 'tools/pixel-path/templates/palette.png')), out = []; for (let i = 0; i < p.width * p.height; i++) if (p.data[i * 4 + 3] > 0) out.push([p.data[i * 4], p.data[i * 4 + 1], p.data[i * 4 + 2]]); return out; })();
  const extra = A.colours ? +A.colours : 40;
  const present = existsSync(IN) ? new Set(readdirSync(IN).filter(f => f.endsWith('.png')).map(f => f.slice(0, -4))) : new Set();
  let n = 0;
  for (const j of jobs) {
    if (only && !only.has(j.name)) continue; if (!present.has(j.name)) continue;
    const src = readPNG(join(IN, j.name + '.png')), out = pixelate(src, j.width, j.height, pal, extra);
    const dst = j.role === 'extra' ? join(ART, j.name + '.png') : join(ART, 'raw', j.name + '.png');
    writePNG(dst, out); n++; console.log(`  ${j.name.padEnd(22)} ${src.width}x${src.height} -> ${out.width}x${out.height}${j.role === 'extra' ? '  (used by the game directly)' : ''}`);
  }
  const missing = jobs.filter(j => !present.has(j.name)).map(j => j.name);
  console.log(`imported ${n} picture${n === 1 ? '' : 's'}${missing.length ? `; still missing: ${missing.join(', ')}` : ''}`);
  console.log('Next: node tools/pixel-path/scripts/clean.mjs --trip .   then look at art/contact.png');
}
else { console.error('usage: node tools/codex-art.mjs prompts | import [--only a,b] [--no-palette] [--colours N]'); process.exit(1); }

function pixelate(img, tw, th, pal, extraN) {
  const { width: w, height: h, data: d } = img, bg = new Uint8Array(w * h);
  // 1. key out the backdrop: white-ish (or already transparent) pixels connected to the border
  const isBg = i => d[i * 4 + 3] < 40 || (d[i * 4] > 232 && d[i * 4 + 1] > 232 && d[i * 4 + 2] > 232);
  const st = []; for (let x = 0; x < w; x++) st.push(x, (h - 1) * w + x); for (let y = 0; y < h; y++) st.push(y * w, y * w + w - 1);
  while (st.length) { const i = st.pop(); if (bg[i] || !isBg(i)) continue; bg[i] = 1; const x = i % w; if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (i >= w) st.push(i - w); if (i < w * (h - 1)) st.push(i + w); }
  // 2. crop to the subject
  let x0 = w, y0 = h, x1 = -1, y1 = -1; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!bg[y * w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return { width: 1, height: 1, data: new Uint8Array(4) };
  // fitted inside a margin, centred and standing on the bottom margin, on a canvas of the plan's size: like RetroDiffusion's
  // pictures. (Cropped flush to the subject, clean.mjs would read the edges as a cut-off subject and drop the picture.)
  const m = Math.max(2, Math.round(Math.min(tw, th) * 0.04)), cw = x1 - x0 + 1, ch = y1 - y0 + 1, k = Math.min((tw - 2 * m) / cw, (th - 2 * m) / ch), ow = Math.max(1, Math.round(cw * k)), oh = Math.max(1, Math.round(ch * k));
  // 3. box-average down, alpha by coverage
  const out = new Uint8Array(ow * oh * 4), cols = new Map();
  for (let Y = 0; Y < oh; Y++) for (let X = 0; X < ow; X++) {
    const sx0 = x0 + Math.floor(X * cw / ow), sx1 = x0 + Math.max(Math.floor(X * cw / ow) + 1, Math.floor((X + 1) * cw / ow)), sy0 = y0 + Math.floor(Y * ch / oh), sy1 = y0 + Math.max(Math.floor(Y * ch / oh) + 1, Math.floor((Y + 1) * ch / oh));
    let r = 0, g = 0, b = 0, c = 0, all = 0; for (let y = sy0; y < sy1; y++) for (let x = sx0; x < sx1; x++) { all++; const i = y * w + x; if (bg[i]) continue; r += d[i * 4]; g += d[i * 4 + 1]; b += d[i * 4 + 2]; c++; }
    const o = (Y * ow + X) * 4; if (c * 2 < all) continue; out[o] = r / c; out[o + 1] = g / c; out[o + 2] = b / c; out[o + 3] = 255;
    const key = (out[o] >> 3) << 10 | (out[o + 1] >> 3) << 5 | (out[o + 2] >> 3); cols.set(key, (cols.get(key) || 0) + 1);
  }
  // 4. snap to a palette: the shared one plus this picture's own most common colours (merged when close)
  const own = []; for (const [key] of [...cols].sort((a, b) => b[1] - a[1])) { const c = [((key >> 10) & 31) * 8 + 4, ((key >> 5) & 31) * 8 + 4, (key & 31) * 8 + 4]; if (own.every(o => dist(o, c) > 300)) own.push(c); if (own.length >= extraN) break; }
  const P = [...pal, ...own];
  if (P.length) for (let i = 0; i < ow * oh; i++) if (out[i * 4 + 3]) { const c = [out[i * 4], out[i * 4 + 1], out[i * 4 + 2]]; let best = P[0], bd = Infinity; for (const p of P) { const dd = dist(p, c); if (dd < bd) { bd = dd; best = p; } } out[i * 4] = best[0]; out[i * 4 + 1] = best[1]; out[i * 4 + 2] = best[2]; }
  const full = new Uint8Array(tw * th * 4), ox = Math.floor((tw - ow) / 2), oy = th - m - oh;
  for (let y = 0; y < oh; y++) full.set(out.subarray(y * ow * 4, (y + 1) * ow * 4), ((oy + y) * tw + ox) * 4);
  return { width: tw, height: th, data: full };
}
function dist(a, b) { const r = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]; return (2 + r / 256) * dr * dr + 4 * dg * dg + (2 + (255 - r) / 256) * db * db; }   // a cheap perceptual distance
