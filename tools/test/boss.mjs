// the boss fight (CORRIDOIO IS) played by a bot that sees the game DELAY ms late, like a person:
// node tools/test/boss.mjs [games=6] [delay_ms=200] [OUT_DIR] [parallel=3]
// It plays at ?ts=3 (three times faster, in game time) and prints each game: won, time, rams, hits taken (and by what).
// With OUT_DIR: screenshots of the first game every 3 s (9 s of game) and of every end screen. VERBOSE=1: the state.
import { mkdirSync } from 'node:fs';
import { chromium, BASE, watch } from './lib.mjs';
const [,, games = '6', delay = '200', out = '', par = '3'] = process.argv;
if (out) mkdirSync(out, { recursive: true });
const b = await chromium.launch(), results = [], errs = [];
let next = 0;
async function worker(w) {
  const p = await b.newPage({ viewport: { width: 960, height: 540 } }); watch(p, errs);
  await p.goto(`${BASE}?ts=3`); await p.waitForFunction(() => window.__rox);
  await p.evaluate(D => { const R = window.__rox, hist = []; let now = 0;
    const snap = G => ({ L: { s: G.lift.s, lat: G.lift.lat, state: G.lift.state }, rear: G.pos + R.BZ, speed: G.speed,
      items: G.ents.filter(e => e.kind === 'item').map(e => ({ item: e.item, s: e.mode === 'arc' ? e.s1 : e.s, lat: e.mode === 'arc' ? e.lat1 : e.lat, tl: e.tl ?? e.lat, mode: e.mode, lift: e.lift })), decals: G.decals.map(d => ({ ...d })) });
    R.bot = dt => { const G = R.G, k = R.keys; if (G.phase !== 'play' || !G.lift) { k.left = k.right = false; return; }
      now += dt; hist.push({ t: now, s: snap(G) }); while (hist.length > 1 && hist[1].t <= now - D) hist.shift();
      const S = hist[0].s, me = G.lat, front = S.rear + R.LIFT_LEN; let best = me, bc = 1e9;
      for (let c = -R.LAT_MAX; c <= R.LAT_MAX + 1e-6; c += 0.25) { let cost = 0;
        for (const e of S.items) { const d = e.s - front, air = e.mode === 'arc' || e.mode === 'fall';
          if (d < -R.LIFT_LEN - 0.5 || d > 26) continue; if (e.item === 'coffee') { if (Math.abs(c - e.lat) < 1.2 && d < 14) cost -= 6; continue; } if (Math.abs(c - e.lat) < (air ? 1.4 : 1.25) || Math.abs(c - e.tl) < 1.25) cost += air ? 14 : 12 / (1 + Math.max(0, d) / 8); }
        for (const q of S.decals) if (q.s1 > S.rear && q.s0 < front + 15 && Math.abs(c - q.lat) < q.w / 2 + 0.7) cost += 3;
        cost += S.L.state === 'flat' ? Math.abs(c - S.L.lat) * 4 : Math.abs(c - me) * 0.6 + Math.abs(c - S.L.lat) * 0.2;
        if (cost < bc) { bc = cost; best = c; } }
      k.gas = true; k.left = best < me - 0.2; k.right = best > me + 0.2; };
  }, +delay / 1000);
  while (next < +games) { const n = next++;
    await p.evaluate(() => window.__rox.start('boss'));
    for (let i = 0; ; i++) { await p.waitForTimeout(1000); const st = await p.evaluate(() => { const G = window.__rox.G, L = G.lift; return { ph: G.phase, t: +G.t.toFixed(1), lat: +G.lat.toFixed(2), v: +G.speed.toFixed(1), gap: +(L.s - G.pos - window.__rox.BZ - window.__rox.LIFT_LEN).toFixed(1), L: [L.state, L.hp, +L.lat.toFixed(2)], hp: G.hp }; });
      if (process.env.VERBOSE && i % 3 === 0) console.log(w, JSON.stringify(st)); if (out && n === 0 && i % 3 === 1) await p.screenshot({ path: `${out}/boss-play-${String(i).padStart(3, '0')}.png` }); if (st.ph === 'end') break; if (st.t > 400) { console.log('stuck', JSON.stringify(st)); break; } }
    const r = await p.evaluate(() => { const G = window.__rox.G; return { won: !!G.result?.won, time: +(G.result?.time ?? G.t).toFixed(1), rams: 6 - G.lift.hp, taken: G.taken, score: G.score, by: G.hurtBy.join(',') }; });
    results.push(r); console.log(`game ${n + 1}:`, JSON.stringify(r));
    if (out) await p.screenshot({ path: `${out}/boss-end-${n + 1}.png` }); }
}
await Promise.all(Array.from({ length: +par }, (_, i) => worker(i)));
const won = results.filter(r => r.won);
console.log(`delay ${delay} ms: won ${won.length}/${results.length}, mean time ${(won.reduce((a, r) => a + r.time, 0) / Math.max(1, won.length)).toFixed(1)} s, mean hits taken ${(results.reduce((a, r) => a + r.taken, 0) / results.length).toFixed(1)}`);
console.log('errors:', errs); await b.close();
