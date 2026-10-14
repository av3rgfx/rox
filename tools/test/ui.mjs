// clicks through the screens like a person: node tools/test/ui.mjs OUT_DIR
import { mkdirSync } from 'node:fs';
import { chromium, BASE, watch } from './lib.mjs';
const out = process.argv[2] || '/tmp/rox-shots'; mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } }); const errs = watch(p);
await p.goto(BASE); await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/ui-menu.png` });
await p.click('#btn-howto'); await p.waitForTimeout(300); await p.screenshot({ path: `${out}/ui-howto.png` }); await p.click('#btn-howto-back');
await p.click('#btn-investi'); await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/ui-story.png` }); await p.waitForTimeout(2500);
await p.keyboard.down('ArrowUp'); await p.waitForTimeout(3000); await p.keyboard.press('p'); await p.waitForTimeout(300); await p.screenshot({ path: `${out}/ui-pause.png` });
console.log('paused:', await p.evaluate(() => __rox.G.phase)); await p.click('#btn-quit'); await p.waitForTimeout(300);
console.log('after quit:', await p.evaluate(() => __rox.G.phase + ' ' + __rox.G.mode));
await p.click('#btn-chase'); await p.waitForTimeout(7500); console.log('chase:', await p.evaluate(() => __rox.G.phase));
await p.keyboard.up('ArrowUp'); await p.evaluate(() => { const G = __rox.G; G.boss.hp = 1; G.boss.s = G.pos + __rox.CARZ + 3.5; G.boss.lat = G.lat; G.boss.inv = 0; });
await p.waitForTimeout(3500); await p.screenshot({ path: `${out}/ui-chase-end.png` });
console.log('end:', await p.evaluate(() => __rox.G.phase + ' ' + document.getElementById('end-title').textContent));
console.log('errors:', errs); await b.close();
