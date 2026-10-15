// ROX KOMBAT (the fighting game) played by a bot that sees the computer's moves DELAY ms late, like a person:
// node tools/test/kombat.mjs [games=6] [delay_ms=200] [OUT_DIR] [parallel=3] [fighter=random]
// It plays at ?ts=3 (three times faster, in game time) and prints each tower: won, the match it got to, rounds won and
// lost, finocchiality, score. It walks in, punches and kicks in range, holds back to block what it saw coming, jumps the
// tape, ducks the catalogue and the boss's shout, steps away from a pallet's shadow, uppercuts a jump, fires its special
// when the bar is full, and presses SPECIALE at "FINISCILO!" (most of the time). With OUT_DIR: screenshots of the first
// tower every 4 s and of every end screen. VERBOSE=1: the state every 4 s.
import { mkdirSync } from 'node:fs';
import { chromium, BASE, watch } from './lib.mjs';
const [,, games = '6', delay = '200', out = '', par = '3', who = ''] = process.argv;
if (out) mkdirSync(out, { recursive: true });
const IDS = ['rox', 'magazziniere', 'mulettista', 'commerciale', 'amministrazione', 'capo'];
const b = await chromium.launch(), results = [], errs = [];
let next = 0;
async function worker(w) {
  const p = await b.newPage({ viewport: { width: 960, height: 540 } }); watch(p, errs);
  await p.goto(`${BASE}?ts=3`); await p.waitForFunction(() => window.__rox);
  await p.evaluate(D => { const R = window.__rox, hist = []; let now = 0, fin = 0;
    const snap = F => ({ C: { x: F.C.x, y: F.C.y, st: F.C.st, atk: F.C.atk && { k: F.C.atk.k, t: F.C.atk.t } }, proj: F.proj.filter(q => q.owner === F.C).map(q => ({ kind: q.kind, x: q.x, vx: q.vx, t: q.t, T: q.T, low: q.low, high: q.high })) });
    R.bot = dt => { const G = R.G, k = R.keys, F = G.F; k.left = k.right = k.gas = k.brake = false;
      if (G.mode !== 'kombat' || G.phase !== 'play' || !F) return;
      now += dt; hist.push({ t: now, s: snap(F) }); while (hist.length > 1 && hist[1].t <= now - D) hist.shift();
      if (F.stage === 'finish') { if ((fin += dt) > 0.6 && Math.random() < 0.85) k.specialTap = true; return; } fin = 0;
      if (F.stage !== 'fight') return;
      const S = hist[0].s, P = F.P, C = S.C, d = Math.abs(C.x - P.x), fw = C.x > P.x ? 'right' : 'left', back = fw === 'right' ? 'left' : 'right';
      if (P.y > 0) { if (d < 50 && Math.random() < 6 * dt) k.kickTap = true; return; }
      // what it saw coming
      for (const q of S.proj) { const dist = Math.abs(q.x - P.x), coming = Math.sign(P.x - q.x) === Math.sign(q.vx || 1);
        if (q.kind === 'pallet') { if (Math.abs(q.x - P.x) < 40) { k[q.x > P.x ? 'left' : 'right'] = true; return; } continue; }
        if (!coming || dist > 110) continue; if (q.low) { if (dist < 70) k.gas = true; return; } if (q.high && dist < 90) { k.brake = true; return; } k[back] = true; return; }
      if ((C.st === 'attack' || C.st === 'special') && d < 70) { k[back] = true; return; }
      if (C.y > 20 && d < 60) { k.brake = true; k.punchTap = true; return; }   // an uppercut against a jump
      if (P.meter >= 100 && d > 60) { k.specialTap = true; return; }
      if (d > 54) { k[fw] = true; return; }
      if (P.st === 'idle' || P.st === 'walk' || P.st === 'block') { const r = Math.random() / dt; if (r < 1.3) k.punchTap = true; else if (r < 2.4) k.kickTap = true; else if (r < 2.8) { k.brake = true; k.kickTap = true; } }   // about 3 blows a second, like a person pressing fast
    };
  }, +delay / 1000);
  while (next < +games) { const n = next++, id = who || IDS[n % IDS.length];
    await p.evaluate(([id, from]) => window.__rox.kombat(id, from), [id, +(process.env.FROM || 0)]);
    for (let i = 0; ; i++) { await p.waitForTimeout(1000); const st = await p.evaluate(() => { const G = window.__rox.G, F = G.F; return { ph: G.phase, t: +G.t.toFixed(1), n: F.n, stage: F.stage, P: [F.P.st, F.P.hp, F.P.wins], C: [F.C.id, F.C.st, F.C.hp, F.C.wins] }; });
      if (process.env.VERBOSE && i % 4 === 0) console.log(w, JSON.stringify(st)); if (out && n === 0 && i % 4 === 1) await p.screenshot({ path: `${out}/kombat-play-${String(i).padStart(3, '0')}.png` }); if (st.ph === 'end') break; if (st.t > 1200) { console.log('stuck', JSON.stringify(st)); break; } }
    const r = await p.evaluate(id => { const G = window.__rox.G, F = G.F; return { id, won: !!G.result?.won, match: F.n + 1, rw: F.roundsWon, rl: F.roundsLost, perfect: F.perfects, fin: F.fin, score: G.score, time: +G.t.toFixed(0), lostTo: G.result?.won ? '' : F.C.id, me: F.P.log, cpu: F.C.log, blocks: [F.P.blocks || 0, F.C.blocks || 0] }; }, id);
    results.push(r); console.log(`tower ${n + 1}:`, JSON.stringify(r));
    if (out) await p.screenshot({ path: `${out}/kombat-end-${n + 1}.png` }); }
}
await Promise.all(Array.from({ length: +par }, (_, i) => worker(i)));
const won = results.filter(r => r.won);
console.log(`delay ${delay} ms: towers won ${won.length}/${results.length}, rounds won ${results.reduce((a, r) => a + r.rw, 0)} lost ${results.reduce((a, r) => a + r.rl, 0)}, mean time ${(results.reduce((a, r) => a + r.time, 0) / results.length).toFixed(0)} s, finocchiality ${results.reduce((a, r) => a + r.fin, 0)}`);
console.log('errors:', errs); await b.close();
