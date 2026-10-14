// rebase.mjs: after a rebake that changes the route, moves everything placed by metres along the old route onto the
// new one, through the real place on the map: art/buildings-custom.json "fronts" (matched again to the new bake's
// fronts: the same building, same side, nearest centre) and art/landmarks-custom.json "s"/"side".
//   git show HEAD:data/c0000.json > /tmp/old.json; (rebake); node tools/rebase.mjs --old /tmp/old.json [--dry]
// "add" and "land" entries are by hand (they are not on the map); they are listed, not moved.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, readJSON } from './pixel-path/scripts/lib.mjs';
const A = args(), ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
if (!A.old) { console.error('usage: node tools/rebase.mjs --old OLD_c0000.json [--dry]'); process.exit(1); }
const OLD = readJSON(A.old), NEW = readJSON(join(ROOT, 'data/c0000.json'));
const K = o => 111320 * Math.cos(o[1] * Math.PI / 180);
// metres in a chunk's frame <-> lon/lat
const toLL = (c, [x, y]) => [c.origin[0] + x / K(c.origin), c.origin[1] + y / 111320], fromLL = (c, [lon, lat]) => [(lon - c.origin[0]) * K(c.origin), (lat - c.origin[1]) * 111320];
// the point `side` metres right of the route at s
function at(c, s, side = 0) { const st = c.step || 10, i = Math.max(0, Math.min(c.xy.length - 2, Math.floor(s / st))), f = s / st - i, a = c.xy[i], b = c.xy[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  return [a[0] + dx * f + dy / L * side, a[1] + dy * f - dx / L * side]; }
function project(c, [x, y]) { let best = [1e9, 0, 0]; const st = c.step || 10;
  for (let i = 0; i + 1 < c.xy.length; i++) { const [ax, ay] = c.xy[i], [bx, by] = c.xy[i + 1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2)), px = ax + t * dx, py = ay + t * dy, d = Math.hypot(x - px, y - py);
    if (d < best[0]) best = [d, (i + t) * st, (dx * (y - ay) - dy * (x - ax)) < 0 ? d : -d]; }
  return { s: best[1], side: best[2] }; }
const move = p => fromLL(NEW, toLL(OLD, p));
const centre = (c, f) => at(c, f[0] + f[1] / 2, f[2]);
const log = [], extra = [];
const B = JSON.parse(readFileSync(join(ROOT, 'art/buildings-custom.json'), 'utf8'));
for (const b of B) {
  if (b.add || b.land) { log.push(`by hand: ${b.note || JSON.stringify(b.add || b.land)}`); continue; }
  if (!b.fronts) continue;
  b.fronts = b.fronts.map(([fs, sg]) => {
    const f = OLD.fronts.filter(f => Math.sign(f[2]) === sg && Math.abs(f[0] - fs) <= 6).sort((p, q) => Math.abs(p[0] - fs) - Math.abs(q[0] - fs))[0];
    if (!f) { const p = project(NEW, move(at(OLD, fs, sg * 10))); log.push(`${b.pic}: no old front at ${fs}; projected to ${Math.round(p.s)}`); return [Math.round(p.s), sg]; }
    const c = move(centre(OLD, f)), n = NEW.fronts.filter(g => Math.sign(g[2]) === sg).map(g => [Math.hypot(...centre(NEW, g).map((v, i) => v - c[i])), g]).sort((p, q) => p[0] - q[0])[0];
    if (n && n[0] < 15) { log.push(`${b.pic}: ${fs} -> ${n[1][0]} (${n[0].toFixed(1)} m)`); return [n[1][0], sg]; }
    // the building was cut or merged differently: the new front that covers the same stretch, at about the same distance
    const p = project(NEW, c), a0 = p.s - f[1] / 2, a1 = p.s + f[1] / 2, over = g => Math.min(a1, g[0] + g[1]) - Math.max(a0, g[0]),
      o = NEW.fronts.filter(g => Math.sign(g[2]) === sg && over(g) > f[1] * 0.4 && Math.abs(Math.abs(g[2]) - Math.abs(f[2])) < 10).sort((p, q) => over(q) - over(p))[0];
    if (o) { log.push(`${b.pic}: ${fs} -> ${o[0]} (same stretch)`); return [o[0], sg]; }
    // not a front any more (the bake drops a building that seems to straddle the road): stand it there by hand
    extra.push({ pic: b.pic, add: { s: Math.round(a0), len: f[1], side: Math.round(f[2]) }, hgt: b.hgt, ...(b.tile ? { tile: b.tile } : {}), note: `${b.note || b.pic} (not a front in the bake: added at its old place)` });
    log.push(`${b.pic}: ${fs} -> added at ${Math.round(a0)} (no front in the new bake)`); return null; }).filter(Boolean);
}
B.push(...extra); for (let i = B.length - 1; i >= 0; i--) if (B[i].fronts && !B[i].fronts.length) B.splice(i, 1);
const L = JSON.parse(readFileSync(join(ROOT, 'art/landmarks-custom.json'), 'utf8'));
for (const lm of L) { const p = project(NEW, move(at(OLD, lm.s, lm.side))); log.push(`${lm.qid}: s ${lm.s} -> ${Math.round(p.s)}, side ${lm.side} -> ${Math.round(p.side)}`); lm.s = Math.round(p.s); lm.side = Math.round(p.side); }
console.log(log.join('\n'));
if (!A.dry) {
  writeFileSync(join(ROOT, 'art/buildings-custom.json'), '[\n' + B.map(b => '  ' + JSON.stringify(b).replace(/","/g, '", "').replace(/":/g, '": ').replace(/,"/g, ', "')).join(',\n') + '\n]\n');
  writeFileSync(join(ROOT, 'art/landmarks-custom.json'), '[\n' + L.map(l => '  ' + JSON.stringify(l).replace(/,"/g, ', "').replace(/":/g, '": ')).join(',\n') + '\n]\n');
  console.log('art/buildings-custom.json and art/landmarks-custom.json rewritten; now: node tools/landmarks.mjs && node tools/buildings.mjs');
}
