// node tools/test/fighters.mjs OUT.png [scale=2] [R|L]: a sheet of ROX KOMBAT's fighters in every pose, facing right or left (tools/test/fighters.html)
import { chromium, BASE, watch } from './lib.mjs';
const [,, out = '/tmp/fighters.png', k = '2', side = 'R'] = process.argv;
const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1200, height: 800 } }), errs = watch(p);
await p.goto(`${BASE}tools/test/fighters.html?k=${k}&side=${side}`); await p.waitForFunction(() => document.title === 'ok', null, { timeout: 15000 }).catch(() => {});
await (await p.$('#c')).screenshot({ path: out }); console.log('errors:', errs); await b.close();
