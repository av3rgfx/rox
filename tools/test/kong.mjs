// ROX KONG (the boss on the shelves) played by a bot that sees the goods DELAY ms late, like a person:
// node tools/test/kong.mjs [games=6] [delay_ms=200] [OUT_DIR] [parallel=3]
// It plays at ?ts=3 (three times faster, in game time) and prints each game: won, time, the bay it got to, hits taken
// (and by what), jumps. It climbs to the nearest ladder up, jumps what rolls at it, keeps off ladders with something
// coming down and away from the marks of falling boxes, picks up the hard hat (and the coffee when it has lost a life) on its beam. Like a person it guesses
// where a rolling thing is now from where it saw it, and its jumps are off by up to ±60 ms. With OUT_DIR: screenshots of
// the first game every 3 s and of every end screen. VERBOSE=1: the state every 3 s.
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
    const snap = K => ({ items: K.items.map(it => ({ x: it.x, y: it.y, f: it.f, mode: it.mode, r: it.r, k: it.k, v: it.v, dir: K.F[it.f].dir, lx: it.lad ? it.lad.x : null, t: it.t, T: it.T, nz: it.botNz ??= Math.random() * 2 - 1 })) });
    R.bot = dt => { const G = R.G, k = R.keys, K = G.K; k.left = k.right = k.gas = k.brake = false; k.jump = false;
      if (G.phase !== 'play' || !K || K.stage !== 'play') return;
      now += dt; hist.push({ t: now, s: snap(K) }); while (hist.length > 1 && hist[1].t <= now - D) hist.shift();
      const S = hist[0].s, P = K.p, F = K.F, top = K.L.top;
      if (P.stun > 0) return;
      if (P.mode === 'climb') { const l = P.lad, yUp = F[l.f + 1].y;
        const fromAbove = S.items.some(it => it.mode === 'ladder' && it.lx === l.x && it.y > P.y && it.y - P.y < 44);
        const atExit = S.items.some(it => it.f === l.f + 1 && (it.mode === 'roll' || it.mode === 'hop') && Math.abs(it.x - l.x) < 34 && (l.x - it.x) * it.dir > -6);
        if (fromAbove && P.y > F[l.f].y + 1) k.brake = true; else if (atExit && P.y > yUp - 24) k.brake = true; else if (!(atExit && P.y > yUp - 30)) k.gas = true;
        return; }
      if (P.mode === 'air') return;
      // where to: Rox on the top beam; else the hard hat on this beam; else the nearest ladder up
      const hat = K.picks.find(pk => (pk.k === 'hat' || G.hp < R.KONG_HP) && !pk.got && pk.f === P.f), lads = K.lads.filter(l => l.f === P.f).sort((a, c) => Math.abs(a.x - P.x) - Math.abs(c.x - P.x));
      let tx = P.f === top ? K.R.x : hat ? hat.x : lads[0].x;
      // falling boxes: off the mark
      let dodge = false; for (const it of S.items) if (it.mode === 'drop' && it.f === P.f && Math.abs(it.x - P.x) < 18) { dodge = true; tx = it.x > P.x || it.x > K.F[P.f].x1 - 30 ? it.x - 24 : it.x + 24; }
      // what rolls at you on this beam: wait for it and jump it (or, with the hat, walk into it)
      let wait = false, jump = false;
      for (const it of S.items) { if (it.mode === 'drop') continue;
        const onBeam = it.f === P.f && (it.mode === 'roll' || it.mode === 'hop') || (it.mode === 'ladder' && it.y - F[P.f].y < 24 && it.y >= F[P.f].y - 1 && Math.abs(it.lx - P.x) < 40) || (it.mode === 'fall' && it.f === P.f + 1 && it.y - F[P.f].y < 30);
        if (!onBeam || K.hat > 0.5) continue; const rolls = it.mode === 'roll' || it.mode === 'hop', dx = it.x + (rolls ? it.dir * it.v * D : 0) - P.x, coming = dx * it.dir < 0 || !rolls;
        if (!coming) continue; const d = Math.abs(dx);
        if (d < 46) wait = true; if (rolls && d < it.v * (0.22 + 0.06 * it.nz) + 6 && d > 3) jump = true; }
      const ladderBusy = l => S.items.some(it => (it.mode === 'ladder' && it.lx === l.x) || (it.f === l.f + 1 && (it.mode === 'roll' || it.mode === 'hop') && Math.abs(it.x - l.x) < 26));
      if (jump) { k.jump = true; return; }
      if (!dodge && P.f !== top && !hat && Math.abs(P.x - tx) < 2.5) { if (!ladderBusy(lads[0]) && !wait) k.gas = true; return; }
      if (wait && !dodge) return;
      if (tx < P.x - 1.5) k.left = true; else if (tx > P.x + 1.5) k.right = true; };
  }, +delay / 1000);
  while (next < +games) { const n = next++;
    await p.evaluate(() => window.__rox.start('kong'));
    for (let i = 0; ; i++) { await p.waitForTimeout(1000); const st = await p.evaluate(() => { const G = window.__rox.G, K = G.K; return { ph: G.phase, t: +G.t.toFixed(1), lv: K.n + 1, f: K.p.f, x: +K.p.x.toFixed(0), mode: K.p.mode, hp: G.hp, items: K.items.length }; });
      if (process.env.VERBOSE && i % 3 === 0) console.log(w, JSON.stringify(st)); if (out && n === 0 && i % 3 === 1) await p.screenshot({ path: `${out}/kong-play-${String(i).padStart(3, '0')}.png` }); if (st.ph === 'end') break; if (st.t > 600) { console.log('stuck', JSON.stringify(st)); break; } }
    const r = await p.evaluate(() => { const G = window.__rox.G, K = G.K; return { won: !!G.result?.won, time: +(G.result?.time ?? G.t).toFixed(1), lv: G.result?.lv ?? K.n + 1, taken: G.taken, jumps: K.jumps, score: G.score, by: G.hurtBy.join(',') }; });
    results.push(r); console.log(`game ${n + 1}:`, JSON.stringify(r));
    if (out) await p.screenshot({ path: `${out}/kong-end-${n + 1}.png` }); }
}
await Promise.all(Array.from({ length: +par }, (_, i) => worker(i)));
const won = results.filter(r => r.won);
console.log(`delay ${delay} ms: won ${won.length}/${results.length}, mean time ${(won.reduce((a, r) => a + r.time, 0) / Math.max(1, won.length)).toFixed(1)} s, mean hits taken ${(results.reduce((a, r) => a + r.taken, 0) / results.length).toFixed(1)}`);
console.log('errors:', errs); await b.close();
