// a bot plays a mode and screenshots it: node tools/test/drive.mjs investi|chase OUT_DIR [w h times_ms mobile]
import { mkdirSync } from 'node:fs';
import { chromium, BASE, watch } from './lib.mjs';
const [,, mode = 'investi', out = '/tmp/rox-shots', w = '1280', h = '720', shots = '4000,8000,15000', mobile = ''] = process.argv;
mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h }, ...(mobile ? { hasTouch: true, isMobile: true } : {}) });
const errs = watch(p);
await p.goto(`${BASE}?mode=${mode}`);
await p.evaluate(() => { setInterval(() => { const R = window.__rox; if (!R || R.G.phase !== 'play') return; const G = R.G, f = G.pos + R.CARZ + 3.4; let tgt = null, best = 80;
  for (const e of G.ents) if ((e.kind === 'rox' && e.state === 'idle') || e.kind === 'boss') { const d = e.s - f; if (d > -1 && d < best) { best = d; tgt = e.lat; } }
  for (const e of G.ents) if ((e.kind === 'fennel' || e.kind === 'wet' || e.kind === 'car') && e.s - f > -1 && e.s - f < 28 && Math.abs(e.lat - G.lat) < 2) { tgt = G.lat + (e.lat > G.lat ? -2.5 : 2.5); break; }
  const k = R.keys; k.gas = true; k.left = tgt != null && tgt < G.lat - 0.3; k.right = tgt != null && tgt > G.lat + 0.3; }, 50); });
let t0 = 0, i = 0;
for (const t of shots.split(',').map(Number)) { await p.waitForTimeout(t - t0); t0 = t; await p.screenshot({ path: `${out}/${mode}-${w}x${h}-${i++}.png` });
  console.log(JSON.stringify(await p.evaluate(() => { const G = __rox.G; return { t: +G.t.toFixed(1), phase: G.phase, pos: Math.round(G.pos), kmh: Math.round(G.speed * 3.6), hits: G.hits, roxes: G.roxes, score: G.score, crashes: G.crashes, hp: G.boss?.hp, gap: G.boss ? Math.round(G.boss.s - G.pos) : undefined }; }))); }
console.log('errors:', errs); await b.close();
