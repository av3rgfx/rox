// the road at given metres, empty (no Rox, no traffic), to compare with the real one:
// node tools/test/at.mjs OUT_DIR 0,50,100 [w h]   ->  OUT_DIR/at-0000.png ...
import { mkdirSync } from 'node:fs';
import { chromium, BASE, watch } from './lib.mjs';
const [,, out = '/tmp/rox-at', list = '0,100,200', w = '960', h = '540'] = process.argv;
mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } }); const errs = watch(p);
await p.goto(`${BASE}?mode=investi`);
await p.waitForFunction(() => window.__rox?.G.phase === 'play', null, { timeout: 20000 });
for (const s of list.split(',').map(Number)) {
  await p.evaluate(s => { const G = __rox.G; G.ents = []; G.pos = s; G.speed = 0; G.lat = 1.5; G.clock = 0; }, s);   // clock = 0: it never runs out mid-tour
  await p.waitForTimeout(250); await p.evaluate(() => { __rox.G.ents = []; });
  await p.waitForTimeout(120); await p.screenshot({ path: `${out}/at-${String(s).padStart(4, '0')}.png` });
}
console.log('errors:', errs); await b.close();
