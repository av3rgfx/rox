// clicks through the screens like a person: node tools/test/ui.mjs OUT_DIR (menu, how to play, pause, chase won, the
// aisle won, on to the shelves and ROX KONG won, ROX KONG from the menu, INVESTI on time and on to the aisle, ROX KOMBAT)
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
await p.waitForTimeout(3500); await p.screenshot({ path: `${out}/ui-kongintro.png` });
console.log('after the aisle:', await p.evaluate(() => __rox.G.phase + ' ' + document.getElementById('bi-title').textContent + ' / ' + document.getElementById('bi-go').textContent));
// on to the shelves, the score carried on; won by force (the third bay, you next to Rox)
await p.click('#bi-go'); await p.waitForTimeout(4200); await p.screenshot({ path: `${out}/ui-kong.png` });
console.log('kong:', await p.evaluate(() => __rox.G.mode + ' ' + __rox.G.phase + ' score ' + __rox.G.score + ' carry ' + JSON.stringify(__rox.G.carry)));
await p.evaluate(() => { const K = __rox.G.K; K.n = 1; K.p.stun = 0; }); await p.evaluate(() => { const G = __rox.G, K = G.K; K.R.mode = 'climb'; K.stage = 'clear'; K.stT = 2.7; });
await p.waitForTimeout(600); await p.evaluate(() => { const K = __rox.G.K; Object.assign(K.p, { f: K.L.top, lastF: K.L.top, y: K.F[K.L.top].y, x: 60, mode: 'walk' }); K.items = []; K.look = 0; });
await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(900); await p.keyboard.up('ArrowLeft'); await p.waitForTimeout(800); await p.screenshot({ path: `${out}/ui-kong-slip.png` });
await p.waitForTimeout(1700); await p.screenshot({ path: `${out}/ui-kong-parcel.png` }); await p.waitForTimeout(2600); await p.screenshot({ path: `${out}/ui-kong-end.png` });
console.log('kong end:', await p.evaluate(() => __rox.G.phase + ' ' + document.getElementById('end-title').textContent + ' | ' + document.getElementById('end-lines').textContent));
await p.click('#end-again'); await p.waitForTimeout(3600); console.log('again starts:', await p.evaluate(() => __rox.G.mode)); await p.keyboard.press('p'); await p.click('#btn-quit');
// ROX KONG from the menu
await p.click('#btn-kong'); await p.waitForTimeout(5200); await p.screenshot({ path: `${out}/ui-kong-menu.png` }); console.log('kong from the menu:', await p.evaluate(() => __rox.G.mode + ' ' + __rox.G.phase + ' bay ' + (__rox.G.K.n + 1)));
await p.keyboard.press('p'); await p.click('#btn-quit'); await p.waitForTimeout(300);
// INVESTI on time, then on to the aisle with the score carried over
await p.click('#btn-investi'); await p.waitForTimeout(3500);
await p.evaluate(() => { const G = __rox.G; G.pos = __rox.road.LEN - 70 - __rox.CARZ; G.ents = G.ents.filter(e => e.kind !== 'rox'); G.score = 4242; G.speed = 20; });
await p.keyboard.down('ArrowUp'); await p.waitForTimeout(3500); await p.keyboard.up('ArrowUp'); await p.screenshot({ path: `${out}/ui-bossintro.png` });
console.log('after investi:', await p.evaluate(() => __rox.G.phase));
await p.click('#bi-go'); await p.waitForTimeout(3600); console.log('carried:', await p.evaluate(() => __rox.G.mode + ' ' + __rox.G.phase + ' score ' + __rox.G.score + ' carry ' + !!__rox.G.carry));
// ROX KOMBAT from the menu: the select screen, a fighter, the match card, a fight won by force up to FINISCILO! and the
// FINOCCHIALITY, then a lost one (RIPROVA starts that match again)
await p.click('#btn-quit').catch(() => {}); await p.evaluate(() => document.querySelector('#pause.show') && document.getElementById('btn-quit').click()); await p.waitForTimeout(300);
await p.evaluate(() => { if (document.querySelector('#bossintro.show')) document.getElementById('bi-stop').click(); }); await p.waitForTimeout(300); await p.evaluate(() => { if (document.querySelector('#end.show')) document.getElementById('end-menu').click(); });
await p.click('#btn-kombat'); await p.waitForTimeout(300); await p.screenshot({ path: `${out}/ui-kombat-select.png` });
await p.click('.fighter[data-id="magazziniere"]'); await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/ui-kombat-vs.png` });
await p.waitForFunction(() => __rox.G.F.stage === 'fight', null, { timeout: 15000 }); await p.keyboard.press('z'); await p.keyboard.press('x'); await p.waitForTimeout(800); await p.screenshot({ path: `${out}/ui-kombat-fight.png` });
console.log('kombat:', await p.evaluate(() => { const F = __rox.G.F; return `${__rox.G.mode} ${F.stage} ${F.P.id} vs ${F.C.id} at ${F.arena.name}`; }));
await p.evaluate(() => { const F = __rox.G.F; F.n = 2; F.P.wins = 1; F.C.hp = 1; F.C.x = F.P.x + 40; F.C.inv = 0; });
for (let i = 0; i < 30 && await p.evaluate(() => __rox.G.F.stage) !== 'finish'; i++) { await p.evaluate(() => { const F = __rox.G.F; F.C.x = F.P.x + 40; }); await p.keyboard.press('z'); await p.waitForTimeout(120); }
await p.waitForTimeout(400); await p.screenshot({ path: `${out}/ui-kombat-finish.png` }); await p.keyboard.press(' '); await p.waitForTimeout(2500); await p.screenshot({ path: `${out}/ui-kombat-fatal.png` });
await p.waitForFunction(() => __rox.G.phase === 'end', null, { timeout: 15000 }); await p.screenshot({ path: `${out}/ui-kombat-end.png` });
console.log('kombat end:', await p.evaluate(() => __rox.G.phase + ' ' + document.getElementById('end-title').textContent + ' | ' + document.getElementById('end-again').textContent + ' | ' + document.getElementById('end-lines').textContent));
await p.click('#end-again'); await p.waitForTimeout(500); console.log('again:', await p.evaluate(() => `${__rox.G.mode} match ${__rox.G.F.n + 1} ${__rox.G.F.stage}`));
await p.evaluate(() => { const F = __rox.G.F; F.stage = 'fight'; F.C.wins = 1; F.P.hp = 1; F.P.inv = 0; F.C.x = F.P.x + 40; F.C.st = 'idle'; });
await p.waitForFunction(() => __rox.G.phase === 'end', null, { timeout: 40000 }).catch(() => {}); await p.screenshot({ path: `${out}/ui-kombat-lost.png` });
console.log('kombat lost:', await p.evaluate(() => __rox.G.phase + ' ' + document.getElementById('end-title').textContent + ' | ' + document.getElementById('end-again').textContent));
await p.click('#end-again'); await p.waitForTimeout(500); console.log('retry:', await p.evaluate(() => `${__rox.G.F.P.id} match ${__rox.G.F.n + 1} vs ${__rox.G.F.C.id}`));
await p.keyboard.press('p'); await p.waitForTimeout(200); console.log('paused:', await p.evaluate(() => __rox.G.phase)); await p.click('#btn-quit'); await p.waitForTimeout(300);
console.log('menu:', await p.evaluate(() => __rox.G.phase + ' ' + document.getElementById('best-kombat').textContent));
console.log('errors:', errs); await b.close();
