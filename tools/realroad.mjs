// realroad.mjs: the road furniture that is really there, from OpenStreetMap, instead of Pixel Path's rule of a traffic
// signal and a crosswalk at every junction in a built-up stretch. Along the baked route it finds traffic signals,
// STOP and give-way signs on our road, marked crossings and the roundabouts the route goes round, merges the hand
// fixes of art/road-custom.json (stretches with their own width, lanes, kerbs; signs and crossings seen on the
// owner's Street View walk-through but missing on the map) and writes data/road.json (road.js loads it as env.road).
//   node tools/realroad.mjs [--overpass URL] [--cache]      (--cache: reuse .cache/realroad.json, no download)
// Run it after any rebake. Positions: s metres along the route, side + right / - left.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { args, readJSON } from './pixel-path/scripts/lib.mjs';
const A = args(), ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), IDX = readJSON(join(ROOT, 'data/index.json'));
const C = Array.from({ length: IDX.count }, (_, i) => readJSON(join(ROOT, `data/c${String(i).padStart(4, '0')}.json`)));
const K = o => 111320 * Math.cos(o[1] * Math.PI / 180);
// the whole route as [lon, lat] every step metres, with its s
const R = C.flatMap(c => c.xy.map(([x, y], i) => ({ s: c.s0 + i * (c.step || 10), ll: [c.origin[0] + x / K(c.origin), c.origin[1] + y / 111320] })));
const o0 = R[0].ll, XY = ll => [(ll[0] - o0[0]) * K(o0), (ll[1] - o0[1]) * 111320], P = R.map(r => XY(r.ll));
function project([x, y]) { let best = { d: 1e9 };
  for (let i = 0; i + 1 < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2)), px = ax + t * dx, py = ay + t * dy, d = Math.hypot(x - px, y - py);
    if (d < best.d) best = { d, s: R[i].s + t * (R[i + 1].s - R[i].s), side: (dx * (y - ay) - dy * (x - ax)) < 0 ? d : -d, hd: Math.atan2(dy, dx) }; }
  return best; }
// download (or reuse) the map features around the route
const lats = R.map(r => r.ll[1]), lons = R.map(r => r.ll[0]), bb = [Math.min(...lats) - 0.0005, Math.min(...lons) - 0.0007, Math.max(...lats) + 0.0005, Math.max(...lons) + 0.0007].map(v => v.toFixed(5)).join(',');
const CACHE = join(ROOT, '.cache/realroad.json'); let osm;
if (A.cache && existsSync(CACHE)) osm = JSON.parse(readFileSync(CACHE, 'utf8'));
else {
  const q = `[out:json][timeout:60];(node[highway~"^(traffic_signals|stop|give_way|crossing|mini_roundabout)$"](${bb});node[crossing](${bb});way[junction~"^(roundabout|circular)$"](${bb}););out body geom;`;
  for (const u of [A.overpass, 'https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass.private.coffee/api/interpreter'].filter(Boolean)) {
    try { const r = await fetch(u, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'User-Agent': process.env.PIXEL_PATH_USER_AGENT || 'rox-game/1.0 (personal project)', 'Content-Type': 'application/x-www-form-urlencoded' } });
      if (r.ok) { osm = await r.json(); break; } console.warn(`${u}: HTTP ${r.status}`); } catch (e) { console.warn(`${u}: ${e.message}`); } }
  if (!osm) { console.error('Overpass did not answer: try --overpass URL, or --cache'); process.exit(1); }
  mkdirSync(dirname(CACHE), { recursive: true }); writeFileSync(CACHE, JSON.stringify(osm));
}
const out = { signals: [], signs: [], zebras: [], roundabouts: [], stretches: [] };
const ON = 4.5;   // a node this close to the route line is on our road (a side street's sign stands further off)
for (const e of osm.elements) {
  if (e.type !== 'node') continue; const t = e.tags || {}, p = project(XY([e.lon, e.lat])); if (p.d > ON || p.s < 2 || p.s > IDX.total - 2) continue; const s = Math.round(p.s);
  if (t.highway === 'traffic_signals' || t.crossing === 'traffic_signals') out.signals.push(s);
  else if (t.highway === 'stop') out.signs.push([s, 'stop']);
  else if (t.highway === 'give_way') out.signs.push([s, 'yield']);
  else if (t.highway === 'crossing' || t.crossing) { if (!/^(no|unmarked|informal)$/.test(t.crossing || '')) out.zebras.push(s); }
}
// a sign is for whoever drives towards it: OSM puts it on the node of the junction, so it stands a few metres before
// (and a give-way on a roundabout's own ring is for the cars entering from the side: not ours)
for (const e of osm.elements) {
  if (e.type !== 'way') continue; const g = e.geometry.map(n => XY([n.lon, n.lat])), cx = g.reduce((a, p) => a + p[0], 0) / g.length, cy = g.reduce((a, p) => a + p[1], 0) / g.length, r = g.reduce((a, p) => a + Math.hypot(p[0] - cx, p[1] - cy), 0) / g.length;
  const inside = R.map((q, i) => [q.s, Math.hypot(P[i][0] - cx, P[i][1] - cy)]).filter(([, d]) => d < r + 3); if (!inside.length) continue;
  const c = project([cx, cy]), s0 = inside[0][0], s1 = inside.at(-1)[0];
  out.roundabouts.push({ s0, s1, r: Math.round(r), at: Math.round(c.s), side: Math.round(c.side), osm: e.id });
  out.signs = out.signs.filter(([s, k]) => !(k === 'yield' && s > s0 + 3 && s < s1 - 3));
}
out.roundabouts.sort((a, b) => a.s0 - b.s0);
// every roundabout entry gives way (Italian law), mapped or not
for (const rb of out.roundabouts) if (!out.signs.some(([s]) => Math.abs(s - rb.s0) < 15)) out.signs.push([Math.max(2, rb.s0 - 2), 'yield']);
// the hand fixes
const H = readJSON(join(ROOT, 'art/road-custom.json'), {});
for (const k of ['signs', 'zebras', 'signals']) { if (H.drop?.[k]) out[k] = out[k].filter(v => !H.drop[k].some(d => Math.abs((Array.isArray(v) ? v[0] : v) - d) < 8)); if (H.add?.[k]) out[k].push(...H.add[k]); }
out.stretches = H.stretches || []; if (H.roundabouts) for (const rb of out.roundabouts) Object.assign(rb, H.roundabouts[rb.osm] || {});
out.signs.sort((a, b) => a[0] - b[0]); out.zebras = [...new Set(out.zebras)].sort((a, b) => a - b); out.signals.sort((a, b) => a - b);
writeFileSync(join(ROOT, 'data/road.json'), '{\n' + Object.entries(out).map(([k, v]) => ` "${k}": ${JSON.stringify(v)}`).join(',\n') + '\n}\n');
console.log(`data/road.json: ${out.signals.length} signals, ${out.signs.length} signs (${out.signs.map(([s, k]) => `${k} ${s}`).join(', ')}), ${out.zebras.length} crossings (${out.zebras.join(', ')}), ${out.roundabouts.length} roundabouts (${out.roundabouts.map(r => `${r.s0}-${r.s1} r${r.r}`).join(', ')}), ${out.stretches.length} stretches by hand`);
