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
// the boss fight from the menu: won by force (his battery flat, him right in front of you)
await p.click('#end-menu'); await p.waitForTimeout(300); await p.screenshot({ path: `${out}/ui-menu-3.png` });
await p.click('#btn-boss'); await p.waitForTimeout(3600); await p.screenshot({ path: `${out}/ui-boss.png` }); console.log('boss:', await p.evaluate(() => __rox.G.phase + ' ' + __rox.G.mode));
await p.evaluate(() => { const G = __rox.G, L = G.lift; L.hp = 1; L.state = 'flat'; L.stT = 9; L.vs = 0; L.s = G.pos + __rox.BZ + __rox.LIFT_LEN + 1.5; L.lat = G.lat; });
await p.keyboard.down('ArrowUp'); await p.waitForTimeout(2000); await p.screenshot({ path: `${out}/ui-boss-climb.png` }); await p.keyboard.up('ArrowUp');
await p.waitForTimeout(3500); await p.screenshot({ path: `${out}/ui-boss-end.png` });
console.log('boss end:', await p.evaluate(() => __rox.G.phase + ' ' + document.getElementById('end-title').textContent));
// INVESTI on time, then on to the aisle with the score carried over
await p.click('#end-menu'); await p.click('#btn-investi'); await p.waitForTimeout(3500);
await p.evaluate(() => { const G = __rox.G; G.pos = __rox.road.LEN - 70 - __rox.CARZ; G.ents = G.ents.filter(e => e.kind !== 'rox'); G.score = 4242; G.speed = 20; });
await p.keyboard.down('ArrowUp'); await p.waitForTimeout(3500); await p.keyboard.up('ArrowUp'); await p.screenshot({ path: `${out}/ui-bossintro.png` });
console.log('after investi:', await p.evaluate(() => __rox.G.phase));
await p.click('#bi-go'); await p.waitForTimeout(3600); console.log('carried:', await p.evaluate(() => __rox.G.mode + ' ' + __rox.G.phase + ' score ' + __rox.G.score + ' carry ' + !!__rox.G.carry));
console.log('errors:', errs); await b.close();
