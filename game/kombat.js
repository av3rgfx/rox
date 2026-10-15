// kombat.js: ROX KOMBAT, a fighting game like the arcade ones. You pick a fighter (Rox or one of UFP's colleagues,
// game/staff.js) and climb a short tower: two colleagues, then Rox (Rox d'oro if you are Rox), best of three rounds each,
// in three places of his road: the Panorama's car park, in front of UFP, the IS aisle. Nobody bleeds: a knockout sends
// you spinning like a skittle, and the round that wins a match ends with "FINISCILO!": press SPECIALE and the loser
// disappears under a rain of fennel (the FINOCCHIALITY). main.js runs it: reset(pick), step(dt), render(g); the HUD is
// drawn here, on the canvas. Units are canvas pixels: x along the arena (0..AW), y up from the floor.
import { ROSTER, GOLD } from './staff.js';
import { pixelText, textW, miniText, miniW } from './font.js';
import { outline, tinted } from './sprites.js';

const DOWN_Y = 66, AW = 420, FLOOR = 16, HW = 12, SEP = 30, WALK = 72, BACK = 56, JUMP_V = 340, JUMP_X = 92, GRAV = 1050, ROUND_T = 60, HP = 100, WINS = 2;
const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)], clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// the normal moves. start/act/rec: seconds before the blow lands, while it can land, after; x0..x1 its reach in front of
// the fighter's middle, y0..y1 its height over his feet; kb: knockback; launch: up in the air; trip: off his feet
const MOVES = {
  punch: { pose: 'punch', start: 0.06, act: 0.08, rec: 0.14, dmg: 6, x0: 8, x1: 44, y0: 38, y1: 56, kb: 70, stun: 0.3, snd: 'punch' },
  kick: { pose: 'kick', start: 0.1, act: 0.1, rec: 0.22, dmg: 9, x0: 8, x1: 48, y0: 14, y1: 32, kb: 110, stun: 0.36, snd: 'kick' },
  upper: { pose: 'upper', start: 0.09, act: 0.12, rec: 0.34, dmg: 13, x0: 2, x1: 34, y0: 30, y1: 100, kb: 70, launch: true, snd: 'upper' },
  sweep: { pose: 'sweep', start: 0.11, act: 0.12, rec: 0.3, dmg: 8, x0: 8, x1: 50, y0: 0, y1: 10, kb: 40, trip: true, snd: 'kick' },
  jkick: { pose: 'jkick', start: 0.04, act: 0.4, rec: 0, dmg: 10, x0: 4, x1: 44, y0: 2, y1: 34, kb: 100, stun: 0.36, snd: 'kick', air: true },
};
// the special moves (a full SPECIALE bar), one per fighter (staff.js's `special`)
export const SPECIALS = {
  fennel: 'tre finocchi lanciati ad arco',
  tape: 'un rotolo di nastro rotola a terra e impacchetta (saltalo)',
  pallet: 'un bancale cade dall\'alto dove sei (l\'ombra avvisa)',
  catalog: 'il catalogo vola dritto all\'altezza della testa (abbassati)',
  receipt: 'uno scontrino lunghissimo che ti tira vicino',
  office: '"NEL MIO UFFICIO!": se ti prende resti immobile',
};
// the tower: where you fight, and how good the computer is (seconds between its choices, how often it blocks, attacks, jumps in)
const ARENAS = [{ id: 'panorama', name: 'PARCHEGGIO DEL PANORAMA' }, { id: 'ufp', name: 'DAVANTI A UFP' }, { id: 'is', name: 'CORRIDOIO IS' }];
// dmg: how hard its blows land (playtest: at full strength a bot that sees 200 ms late won half the rounds, and nobody climbed the tower)
const LEVELS = [{ think: [0.4, 0.62], block: 0.14, agg: 0.4, jump: 0.04, spec: 0.4, dmg: 0.65 }, { think: [0.3, 0.48], block: 0.26, agg: 0.5, jump: 0.06, spec: 0.6, dmg: 0.8 }, { think: [0.27, 0.42], block: 0.3, agg: 0.55, jump: 0.07, spec: 0.75, dmg: 0.85 }];

export function createKombat(o) {
  const { G, keys, FT, PROPS, KS, CARS, sfx, float, burst, toast, end } = o;
  let K = null, camX = 0, GY = 0, W = 0, H = 0;
  const IMG = {}; for (const n of ['b-panorama-bay', 'b-panorama-entrance', 'lm-ufp']) { const i = new Image(); i.src = `art/${n}.png`; IMG[n] = i; }
  const bgs = new Map(), ART = art();
  // the specials' things: UFP's catalogue (a fat book), a pallet of boxes, a golden fennel
  function art() {
    const mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); f((a, b, ww, hh, col) => { x.fillStyle = col; x.fillRect(a, b, ww, hh); }, x); return outline(c); };
    const catalog = mk(22, 16, (R, x) => { R(0, 0, 22, 16, '#c8282c'); R(0, 13, 22, 3, '#f4f2e8'); R(0, 15, 22, 1, '#b8b4a8'); R(0, 0, 2, 16, '#8a1c1c'); miniText(x, 'UFP', 6, 2, '#fff8e8'); R(5, 8, 13, 1, '#ffd23a'); R(5, 10, 9, 1, '#ffd23a'); });
    const pallet = mk(48, 40, (R, x) => { R(0, 33, 48, 7, '#9c7242'); for (let i = 0; i < 4; i++) R(2 + i * 14, 35, 6, 5, '#6c4c28'); R(0, 33, 48, 1, '#be9660');
      for (const [bx, by, bw, bh, col] of [[2, 15, 22, 18, '#b88c58'], [24, 17, 22, 16, '#c49860'], [6, 0, 20, 15, '#a87848'], [26, 3, 18, 14, '#cca870']]) { R(bx, by, bw, bh, col); R(bx, by, bw, 1, '#d8b888'); R(bx + bw / 2 - 1, by, 2, bh, '#dcc49a'); }
      R(4, 20, 18, 7, '#f4f2e8'); miniText(x, 'VITI', 6, 21, '#26262c'); });
    const goldFennel = tinted(PROPS.fennel, (r, g, b) => { const l = (r + g + b) / 3; return [Math.min(255, 90 + l * 0.9), Math.min(255, 66 + l * 0.75), Math.max(0, l * 0.25)]; });
    return { catalog, pallet, goldFennel };
  }
  const scr = (x, y) => [Math.round(x - camX), Math.round(GY - y)];

  // ------------------------------------------------------------ a match, a round
  function fighter(id, side) {
    const d = FT[id].def;
    return { id, d, side, x: 0, y: 0, vx: 0, vy: 0, face: side ? -1 : 1, hp: HP, shown: HP, meter: 0, wins: 0, st: 'idle', t: 0, atk: null, stunT: 0, downT: 0, inv: 0, rot: 0, combo: 0, comboT: 0,
      said: null, saidT: 0, th: null, wrap: 0, frozen: 0, ai: side ? { t: 0.8, inp: {} } : null, dmgDone: 0 };
  }
  // pick: your fighter; from: the match to start at (a retry after losing), opps: the tower's opponents, score: carried over
  function reset(pickId = 'rox', from = 0, opps = null, score = 0) {
    if (!opps) { const others = ROSTER.filter(d => d.id !== pickId && d.id !== 'rox').map(d => d.id).sort(() => Math.random() - 0.5); opps = [others[0], others[1], pickId === 'rox' ? GOLD.id : 'rox']; }
    K = G.F = { pick: pickId, opps, n: from, startScore: score, t: 0, fin: 0, perfects: 0, matchesWon: from, roundsWon: 0, roundsLost: 0, bigT: 0, big: null, proj: [] };
    G.score = score; match(from);
  }
  function match(n) {
    K.n = n; K.arena = ARENAS[n]; K.lv = LEVELS[n]; K.round = 0;
    K.P = fighter(K.pick, 0); K.C = fighter(K.opps[n], 1); G.ents = [K.P, K.C];
    newRound(); K.stage = 'vs'; K.stT = 0; K.vsLine = pick(K.C.d.lines.intro);
  }
  function newRound() {
    K.round++; K.time = ROUND_T; K.proj = []; K.stage = 'round'; K.stT = 0; K.hitP = false;
    for (const F of [K.P, K.C]) Object.assign(F, { x: AW / 2 + (F.side ? 46 : -46), y: 0, vx: 0, vy: 0, face: F.side ? -1 : 1, hp: HP, shown: HP, st: 'idle', t: 0, atk: null, stunT: 0, downT: 0, inv: 0, rot: 0, wrap: 0, frozen: 0, combo: 0 });
    K.P.meter = Math.min(K.P.meter, 60); K.C.meter = Math.min(K.C.meter, 60);
    big(`ROUND ${K.round}`, 1.3, '#ffe14a');
  }
  const big = (t, dur, col = '#ffe14a') => { K.big = t; K.bigT = dur; K.bigCol = col; };
  const other = F => F === K.P ? K.C : K.P;
  const nameOf = F => F.d.name;
  const say = (F, list, dur) => { if (F === K.P || F === K.C) other(F).saidT = 0; o.say(F, list, dur); };   // one bubble at a time: two would overlap

  // ------------------------------------------------------------ input: yours from the keys, the computer's from its head
  function playerInput() {
    const i = { left: keys.left, right: keys.right, up: keys.gas, down: keys.brake, punch: !!keys.punchTap, kick: !!keys.kickTap, special: !!keys.specialTap };
    keys.punchTap = keys.kickTap = keys.specialTap = false; return i;
  }
  function threatened(F) {   // something of the other's coming: then holding back is a block
    const O = other(F); if (O.st === 'attack' && O.atk.t < O.atk.m.start + O.atk.m.act + 0.05 && Math.abs(O.x - F.x) < 90) return true;
    if (O.st === 'special' && Math.abs(O.x - F.x) < 160) return true;
    return K.proj.some(p => p.owner === O && !p.gone && Math.sign(F.x - p.x) === Math.sign(p.vx || 1) && Math.abs(F.x - p.x) < 130);
  }
  function aiInput(F, dt) {
    const A = F.ai, O = other(F), L = K.lv, inp = A.inp; inp.punch = inp.kick = inp.special = false;
    if ((A.t -= dt) > 0 || K.stage !== 'fight') { inp.up = false; if (K.stage !== 'fight') inp.left = inp.right = inp.down = false; return inp; }   // a jump is one press
    A.t = rnd(...L.think); inp.left = inp.right = inp.up = inp.down = false;
    const d = Math.abs(O.x - F.x), fw = O.x > F.x ? 'right' : 'left', away = fw === 'right' ? 'left' : 'right', r = Math.random();
    const incoming = K.proj.find(p => p.owner === O && !p.gone && Math.sign(F.x - p.x) === Math.sign(p.vx || 1) && Math.abs(F.x - p.x) < 120);
    if (incoming && r < L.block + 0.25) { if (incoming.low) inp.up = true; else if (incoming.high && Math.random() < 0.6) inp.down = true; else inp[away] = true; if (!incoming.low) A.t = 0.4; return inp; }
    if (threatened(F) && r < L.block) { inp[away] = true; if (Math.random() < 0.3) inp.down = true; A.t = 0.35; return inp; }
    if (O.st === 'down' || O.st === 'getup' || O.st === 'fall') { if (d < 50) inp[away] = true; return inp; }
    if (F.meter >= 100 && Math.random() < L.spec * 0.5 && specialOk(F, d)) { inp.special = true; return inp; }
    if (O.y > 24 && d < 64 && Math.random() < 0.55) { inp.down = true; inp.punch = true; return inp; }   // against a jump: an uppercut
    if (d > 58) { inp[fw] = true; if (Math.random() < L.jump) inp.up = true; A.t = rnd(0.12, 0.3); return inp; }
    if (r < L.agg) { const q = Math.random(); if (q < 0.42) inp.punch = true; else if (q < 0.74) inp.kick = true; else if (q < 0.87) { inp.down = true; inp.punch = true; } else { inp.down = true; inp.kick = true; } }
    else if (r < L.agg + 0.16) { inp[away] = true; A.t = 0.25; }
    else if (r < L.agg + 0.22) { inp.up = true; inp[fw] = true; }
    return inp;
  }
  const specialOk = (F, d) => ({ fennel: d > 60, tape: d > 50, pallet: true, catalog: d > 60, receipt: d < 140, office: d > 50 })[F.d.special];

  // ------------------------------------------------------------ a fighter's step
  const busy = F => ['attack', 'special', 'hit', 'stun', 'fall', 'down', 'getup', 'ko', 'win', 'dazed', 'buried', 'lose'].includes(F.st);
  function control(F, inp) {
    const O = other(F); F.blocking = false; F.crouch = false;
    if (F.y > 0) { if ((inp.kick || inp.punch) && F.st === 'jump' && !F.airAtk) { F.airAtk = true; attack(F, 'jkick'); } return; }
    if (busy(F)) return;
    F.face = O.x >= F.x ? 1 : -1;
    const back = F.face > 0 ? inp.left : inp.right, fwd = F.face > 0 ? inp.right : inp.left;
    if (inp.special && F.meter >= 100) return special(F);
    if (inp.punch) return attack(F, inp.down ? 'upper' : 'punch');
    if (inp.kick) return attack(F, inp.down ? 'sweep' : 'kick');
    if (inp.up) { F.st = 'jump'; F.t = 0; F.vy = JUMP_V; F.vx = (fwd ? 1 : back ? -1 : 0) * F.face * JUMP_X; F.airAtk = false; sfx('jump'); return; }
    if (inp.down) { F.crouch = true; F.blocking = back && threatened(F); F.st = 'crouch'; return; }
    if (back && threatened(F)) { F.blocking = true; F.st = 'block'; return; }
    if (back || fwd) { F.st = 'walk'; F.x += (fwd ? WALK : -BACK) * F.face * K.dt; return; }
    F.st = 'idle';
  }
  function attack(F, k) { const m = MOVES[k]; F.st = 'attack'; F.atk = { k, m, t: 0, hit: false }; if (!m.air) F.vx = 0; sfx('whoosh'); }
  function special(F) {
    F.meter = 0; F.st = 'special'; F.t = 0; F.spDone = false; sfx('special');
    say(F, F.d.move + '!', 1.2);
  }
  function fireSpecial(F) {   // the moment the special leaves his hands
    const O = other(F), f = F.face, kind = F.d.special;
    if (kind === 'fennel') for (const [vx, vy] of [[150, 230], [195, 250], [240, 200]]) K.proj.push({ kind: 'fennel', owner: F, x: F.x + f * 20, y: 64, vx: f * vx, vy, grav: 620, w: 7, h: 9, dmg: 5, kb: 60, stun: 0.25, rot: 0, gold: F.d.gold });
    else if (kind === 'tape') K.proj.push({ kind: 'tape', owner: F, x: F.x + f * 22, y: 0, vx: f * 175, vy: 0, w: 5, h: 9, dmg: 7, low: true, wrap: 1.5, rot: 0 });
    else if (kind === 'catalog') K.proj.push({ kind: 'catalog', owner: F, x: F.x + f * 24, y: 80, vx: f * 230, vy: 0, w: 7, h: 6, dmg: 13, kb: 150, stun: 0.42, high: true, rot: 0 });
    else if (kind === 'office') K.proj.push({ kind: 'office', owner: F, x: F.x + f * 30, y: 80, vx: f * 125, vy: 0, w: 14, h: 8, dmg: 6, freeze: 1.6, high: true, im: o.bub('NEL MIO UFFICIO!') });
    else if (kind === 'pallet') { K.proj.push({ kind: 'pallet', owner: F, x: clamp(O.x, 30, AW - 30), y: 150, t: 0, T: 0.8, vx: 0, w: 22, h: 30, dmg: 16, trip: true, unblockable: true }); sfx('taunt'); }
    else if (kind === 'receipt') K.proj.push({ kind: 'receipt', owner: F, x: F.x, y: 44, t: 0, vx: 0, len: 0, dmg: 11, pull: true });
  }
  function stepFighter(F, dt) {
    F.t += dt; F.inv = Math.max(0, F.inv - dt); if (F.saidT > 0) F.saidT -= dt; F.comboT = Math.max(0, F.comboT - dt); if (!F.comboT) F.combo = 0;
    F.shown += (F.hp - F.shown) * Math.min(1, dt * 3);   // the bar's damage trail
    if (K.stage === 'fight') F.meter = Math.min(100, F.meter + 2 * dt);
    if (F.st === 'attack') { const a = F.atk; a.t += dt; if (a.t >= a.m.start + a.m.act + a.m.rec && !a.m.air) { F.st = 'idle'; F.atk = null; } }
    else if (F.st === 'special') { if (!F.spDone && F.t > 0.2) { F.spDone = true; fireSpecial(F); } if (F.t > (F.d.special === 'receipt' ? 0.75 : 0.55)) F.st = 'idle'; }
    else if (F.st === 'hit') { if ((F.stunT -= dt) <= 0) F.st = 'idle'; }
    else if (F.st === 'stun') { if ((F.stunT -= dt) <= 0) { F.st = 'idle'; F.wrap = 0; F.frozen = 0; } }
    else if (F.st === 'down') { if ((F.downT -= dt) <= 0) { F.st = 'getup'; F.t = 0; F.inv = 0.4; } }
    else if (F.st === 'getup') { if (F.t > 0.3) F.st = 'idle'; }
    // in the air, on the floor
    if (F.y > 0 || F.vy > 0) { F.vy -= GRAV * dt; F.y += F.vy * dt; F.x += F.vx * dt; if (F.st === 'fall' || F.st === 'ko') F.rot += F.face * -8 * dt;
      if (F.y <= 0) { F.y = 0; F.vy = 0; F.rot = 0;
        if (F.st === 'fall') { F.st = 'down'; F.downT = 0.7; F.inv = 1; sfx('thud'); G.shake = Math.max(G.shake, 0.12); }
        else if (F.st === 'ko') { if (!F.bounced) { F.bounced = true; F.vy = 120; F.vx *= 0.5; sfx('thud'); G.shake = 0.3; } else F.st = 'lose'; }
        else if (F.st === 'jump' || (F.st === 'attack' && F.atk.m.air)) { F.st = 'idle'; F.atk = null; F.vx = 0; } } }
    else { F.x += F.vx * dt; F.vx -= Math.sign(F.vx) * Math.min(Math.abs(F.vx), 520 * dt); }
  }
  // ------------------------------------------------------------ blows landing
  function boxOf(F) { const crouch = F.st === 'crouch' || (F.st === 'attack' && (F.atk.k === 'sweep' || F.atk.k === 'upper' && F.atk.t < F.atk.m.start)); return { x0: F.x - HW, x1: F.x + HW, y0: F.y, y1: F.y + (crouch ? 74 : F.st === 'down' ? 18 : 90) }; }
  const overlap = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  function vulnerable(D) { return !(D.inv > 0 || ['down', 'getup', 'ko', 'lose', 'buried', 'win'].includes(D.st)); }
  function land(A, D, m, from) {   // m: the blow (a move, or a projectile); from: where it came from (x)
    if (!vulnerable(D)) return false;
    const front = Math.sign(from - D.x) === D.face || from === D.x, blocked = D.blocking && front && D.y === 0 && !m.unblockable;
    const [sx, sy] = scr(D.x - Math.sign(D.x - from || 1) * 8, D.y + ((m.y0 + m.y1) / 2 || 50));
    if (blocked) { D.blocks = (D.blocks || 0) + 1; /* blocks and log: counted for tools/test/kombat.mjs */ const chip = Math.ceil(m.dmg * (m.chipK || 0.12)); D.hp = Math.max(1, D.hp - chip); D.vx = -D.face * 70; A.meter = Math.min(100, A.meter + 4); sfx('block'); burst(sx, sy, 5, ['#ffffff', '#7fe0ff']); return true; }
    const chained = ['hit', 'stun', 'fall'].includes(D.st), dmg = Math.round(m.dmg * (A === K.C ? K.lv.dmg : 1)); D.hp -= dmg; A.dmgDone += dmg; (A.log ||= {})[m.kind || m.pose] = ((A.log[m.kind || m.pose]) || 0) + 1; A.meter = Math.min(100, A.meter + 10); D.meter = Math.min(100, D.meter + 6);
    if (A === K.P) G.score += dmg * 10; else K.hitP = true;
    A.combo = chained ? A.combo + 1 : 1; A.comboT = 1.2; /* a combo: blows landing while he is still reeling */ if (A.combo >= 3 && A === K.P) { const [x, y] = scr(D.x, D.y + 96); float(`COMBO ${A.combo}!`, x - 20, y, '#7fe0ff'); G.score += 100 * A.combo; }
    sfx(m.snd || 'punch'); burst(sx, sy, 10, ['#ffffff', '#ffe14a', '#ff8a3a']); G.shake = Math.max(G.shake, dmg > 10 ? 0.22 : 0.1);
    D.atk = null; D.blocking = false; const dir = Math.sign(D.x - from) || -D.face;
    if (D.hp <= 0) { D.hp = 0; ko(A, D, dir); return true; }
    if (Math.random() < 0.3) say(D, D.d.lines.hit, 1.1);
    if (m.wrap) { D.st = 'stun'; D.stunT = m.wrap; D.wrap = 1; say(D, 'IMBALLATO!', 1.2); }
    else if (m.freeze) { D.st = 'stun'; D.stunT = m.freeze; D.frozen = 1; say(D, pick(['SÌ CAPO...', 'ARRIVO...', 'MA COSA HO FATTO?']), 1.4); }
    else if (m.pull) { D.st = 'stun'; D.stunT = 0.55; D.x = A.x + A.face * 36; say(D, 'LA FATTURA!', 1); }
    else if (m.launch) { D.st = 'fall'; D.vy = 330; D.vx = dir * 80; D.y = Math.max(D.y, 1); }
    else if (m.trip) { if (D.y > 0) { D.st = 'fall'; D.vx = dir * 60; } else { D.st = 'fall'; D.vy = 120; D.y = 1; D.vx = dir * 40; } }
    else if (D.y > 0) { D.st = 'fall'; D.vx = dir * 90; D.vy = Math.max(D.vy, 80); }
    else { D.st = 'hit'; D.stunT = m.stun || 0.3; D.vx = dir * (m.kb || 80); }
    return true;
  }
  function ko(A, D, dir) {
    // the round that wins the match for you: not a knockout yet, FINISCILO!
    if (A === K.P && A.wins + 1 >= WINS) { D.st = 'dazed'; D.t = 0; D.vx = 0; D.vy = 0; D.y = 0; K.stage = 'finish'; K.stT = 0; big('FINISCILO!', 3.2, '#ff5a4a'); sfx('flat'); say(D, pick(['NO... ASPETTA...', 'MI ARRENDO!', 'PIETÀ, HO UNA FAMIGLIA DI FINOCCHI!']), 2); return; }
    knock(D, dir); K.stage = 'ko'; K.stT = 0; big('K.O.!', 2, '#ff5a4a'); sfx('ko');
  }
  function knock(D, dir) { D.st = 'ko'; D.vy = 360; D.vx = dir * 150; D.y = Math.max(1, D.y); D.bounced = false; D.inv = 9; say(D, D.d.lines.hit, 1.6); }   // off like a skittle
  function hits() {
    for (const A of [K.P, K.C]) { const a = A.atk; if (!a || a.hit || A.st !== 'attack' || a.t < a.m.start || a.t > a.m.start + a.m.act) continue;
      const D = other(A), m = a.m, x0 = A.x + A.face * m.x0, x1 = A.x + A.face * m.x1, hb = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0: A.y + m.y0, y1: A.y + m.y1 };
      if (overlap(hb, boxOf(D)) && (D.st !== 'dazed')) { if (land(A, D, m, A.x)) a.hit = true; }
      else if (D.st === 'dazed' && overlap(hb, boxOf(D)) && A === K.P) { a.hit = true; finishPlain(D); } }
  }
  function projStep(dt) {
    const live = K.stage === 'fight';   // after a knockout what is still flying lands on nobody
    for (const p of K.proj) {
      const D = other(p.owner); p.t = (p.t || 0) + dt;
      if (p.kind === 'pallet') { if (p.t >= p.T) { const u = Math.min(1, (p.t - p.T) / 0.3); p.y = 150 * (1 - u * u);
          if (u >= 1) { p.gone = true; sfx('thud'); G.shake = 0.3; const [x, y] = scr(p.x, 4); burst(x, y, 16, ['#c89a50', '#7c5a34', '#ffffff']); if (live && Math.abs(D.x - p.x) < p.w + HW && D.y < 30) land(p.owner, D, p, p.x); } }
        continue; }
      if (p.kind === 'receipt') { const A = p.owner; p.x = A.x; p.len = p.t < 0.25 ? p.t / 0.25 * 130 : p.t < 0.45 ? 130 : Math.max(0, 130 - (p.t - 0.45) / 0.15 * 130);
        if (live && !p.hit && p.t > 0.08 && p.t < 0.45) { const x0 = A.x + A.face * 12, x1 = A.x + A.face * (12 + p.len), hb = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0: A.y + 38, y1: A.y + 52 };
          if (overlap(hb, boxOf(D))) { p.hit = true; land(A, D, { ...p, y0: 38, y1: 52 }, A.x); } }
        if (p.t > 0.6 || A.st === 'hit' || A.st === 'fall' || A.st === 'ko') p.gone = true; continue; }
      p.x += p.vx * dt; if (p.grav) { p.vy -= p.grav * dt; p.y += p.vy * dt; } p.rot += (p.vx > 0 ? 1 : -1) * dt * (p.kind === 'tape' ? 14 : 9);
      if (p.y <= 0 && p.grav) { p.gone = true; const [x, y] = scr(p.x, 2); burst(x, y, 4, ['#f0f4e2', '#9ad06a']); continue; }
      if (p.x < -20 || p.x > AW + 20) { p.gone = true; continue; }
      const hb = { x0: p.x - p.w, x1: p.x + p.w, y0: p.y, y1: p.y + p.h * 2 };
      if (live && overlap(hb, boxOf(D))) { if (land(p.owner, D, { ...p, y0: p.y, y1: p.y + p.h * 2, snd: p.kind === 'catalog' ? 'kick' : 'punch' }, p.x - p.vx * 0.05)) p.gone = true; }
    }
    // two projectiles meeting cancel out
    for (const a of K.proj) for (const b of K.proj) if (a !== b && a.owner !== b.owner && !a.gone && !b.gone && a.vx && b.vx && Math.abs(a.x - b.x) < a.w + b.w && Math.abs(a.y - b.y) < 16) { a.gone = b.gone = true; const [x, y] = scr(a.x, a.y + 6); burst(x, y, 10, ['#ffffff', '#ffe14a']); sfx('block'); }
    K.proj = K.proj.filter(p => !p.gone);
  }

  // ------------------------------------------------------------ the end of a round, of a match: FINISCILO! and the FINOCCHIALITY
  function finishPlain(D) { knock(D, Math.sign(D.x - K.P.x) || 1); K.stage = 'ko'; K.stT = 0; big('K.O.!', 1.8, '#ff5a4a'); sfx('ko'); }
  function finocchiality(D) {
    D.st = 'buried'; D.t = 0; K.stage = 'fatal'; K.stT = 0; K.fin++; G.score += 5000; big('FINOCCHIALITY!', 3.4, '#9ad06a'); sfx('gold');
    K.pile = { x: D.x, h: 0, n: 0, drops: [] }; say(K.P, pick(['UN FINOCCHIO AL GIORNO...', 'BUON APPETITO!', 'FRESCHI DI PANORAMA!']), 2);
  }
  function roundOver() {   // whoever is standing wins the round (on time: whoever has more energy; a draw goes to you)
    const P = K.P, C = K.C, pw = P.st !== 'lose' && P.st !== 'ko' && (C.st === 'lose' || C.st === 'ko' || C.st === 'buried' || C.hp <= 0 || P.hp >= C.hp);
    const Wn = pw ? P : C, Ls = pw ? C : P; Wn.wins++; Wn.st = 'win'; Wn.t = 0; say(Wn, Wn.d.lines.win, 2);
    if (pw) { K.roundsWon++; const bonus = 1000 + Math.round(K.time) * 20 + (!K.hitP ? 2000 : 0); G.score += bonus; if (!K.hitP) { K.perfects++; big('ROUND PERFETTO!', 2, '#7fe0ff'); } else big(`${nameOf(P)} VINCE`, 2, '#ffe14a'); }
    else { K.roundsLost++; big(`${nameOf(C)} VINCE`, 2, '#ff8a3a'); }
    if (Ls.st !== 'lose' && Ls.st !== 'buried' && Ls.st !== 'ko') { Ls.st = 'lose'; }
    K.stage = 'over'; K.stT = 0; pw ? sfx('win') : sfx('lose');
  }
  function afterRound() {
    const P = K.P, C = K.C; K.stage = 'done';   // once: the end screen comes a moment later
    if (P.wins >= WINS) { K.matchesWon++; G.score += 3000 * (K.n + 1);
      if (K.n + 1 < K.opps.length) { match(K.n + 1); sfx('charge'); }
      else { G.finished = true; G.phase = 'ending'; G.result = { won: true, time: G.t }; toast('CAMPIONE DI UFP!', 2200); setTimeout(() => { if (G.F === K && G.phase === 'ending') end(); }, 1600); } }
    else if (C.wins >= WINS) { G.finished = true; G.phase = 'ending'; G.result = { won: false, time: G.t, by: C.d.name }; setTimeout(() => { if (G.F === K && G.phase === 'ending') end(); }, 600); }
    else newRound();
  }

  // ------------------------------------------------------------ one step
  function step(dt) {
    W = o.canvas.width; H = o.canvas.height; GY = H - FLOOR;
    const play = G.phase === 'play' && !G.finished; G.t += dt; K.t += dt; K.stT += dt; K.bigT = Math.max(0, K.bigT - dt);
    G.shake = Math.max(0, G.shake - dt);
    const slow = K.stage === 'ko' && K.stT < 0.7 ? 0.35 : 1; dt *= slow; K.dt = dt;   // the knockout in slow motion
    const P = K.P, C = K.C;
    if (K.stage === 'vs') { if (K.stT > 2.8) { K.stage = 'round'; K.stT = 0; big(`ROUND ${K.round}`, 1.3); } }
    else if (K.stage === 'round') { if (K.stT > 1.3 && K.big !== 'COMBATTI!') { big('COMBATTI!', 0.8, '#ff5a4a'); sfx('beep', true); } if (K.stT > 1.9) { K.stage = 'fight'; K.stT = 0; } }
    else if (K.stage === 'fight' && play) { K.time = Math.max(0, K.time - dt); if (K.time <= 0) { if (P.hp >= C.hp && P.wins + 1 >= WINS) { C.st = 'dazed'; C.t = 0; K.stage = 'finish'; K.stT = 0; big('FINISCILO!', 3.2, '#ff5a4a'); } else { big('TEMPO!', 1.2); roundOver(); } } }
    else if (K.stage === 'finish') { if (keys.specialTap) { keys.specialTap = false; finocchiality(C); } else if (K.stT > 3.4) { C.st = 'ko'; knock(C, Math.sign(C.x - P.x) || 1); K.stage = 'ko'; K.stT = 0; } }
    else if (K.stage === 'ko') { if (K.stT > 2.2) roundOver(); }
    else if (K.stage === 'fatal') { pileStep(dt); if (K.stT > 3.6) roundOver(); }
    else if (K.stage === 'over') { if (K.stT > 2.4) afterRound(); }
    // the fighters
    const fight = K.stage === 'fight' && play, pi = fight || K.stage === 'finish' ? playerInput() : (keys.punchTap = keys.kickTap = keys.specialTap = false, {}), ci = fight ? aiInput(C, dt) : {};
    if (fight) { control(P, pi); control(C, ci); }
    else if (K.stage === 'finish') { control(P, { ...pi, special: false }); C.face = P.x > C.x ? 1 : -1; }
    else for (const F of [P, C]) if (!busy(F) && F.y === 0) { F.st = 'idle'; F.face = other(F).x >= F.x ? 1 : -1; }
    stepFighter(P, dt); stepFighter(C, dt);
    // keep them apart, in the arena and on the same screen
    if (P.y < 50 && C.y < 50 && !['ko', 'lose', 'buried'].includes(P.st) && !['ko', 'lose', 'buried'].includes(C.st)) { const d = C.x - P.x; if (Math.abs(d) < SEP) { const push = (SEP - Math.abs(d)) / 2 * (Math.sign(d) || 1); P.x -= push; C.x += push; } }
    const maxD = W - 44; for (const F of [P, C]) { F.x = clamp(F.x, 16, AW - 16); const O = other(F); if (F.st !== 'ko' && O.st !== 'ko') F.x = clamp(F.x, O.x - maxD, O.x + maxD); }
    if (fight || K.stage === 'finish') hits();
    projStep(dt);
    // the camera: between the two
    const tgt = clamp((P.x + C.x) / 2 - W / 2, 0, Math.max(0, AW - W)); camX += (tgt - camX) * Math.min(1, dt * 6 / slow);
    for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; p.t -= dt; } G.parts = G.parts.filter(p => p.t > 0);
    for (const f of G.floats) { f.y -= 22 * dt; f.t -= dt; } G.floats = G.floats.filter(f => f.t > 0);
  }
  function pileStep(dt) {   // fennel raining onto the loser, the pile growing until only his head shows
    const pl = K.pile; if (K.stT < 2.6 && Math.random() < dt * 18) pl.drops.push({ x: pl.x + rnd(-24, 24), y: H, vy: -rnd(40, 120), rot: rnd(0, 6) });
    for (const d of pl.drops) { if (d.done) continue; d.vy -= 600 * dt; d.y += d.vy * dt; d.rot += dt * 6; const top = pl.h * (1 - Math.abs(d.x - pl.x) / 40); if (d.y <= top) { d.y = top; d.done = true; pl.n++; pl.h = Math.min(62, 6 + pl.n * 1.6); if (pl.n % 3 === 0) sfx('bonk'); } }
    if (pl.n > 30 && !pl.said) { pl.said = true; say(K.C, pick(['SOTTO I FINOCCHI...', 'ALMENO SONO FRESCHI...', 'QUALCUNO MI TIRI FUORI!']), 2.4); }
  }

  // ------------------------------------------------------------ drawing
  function poseOf(F) {
    if (F.st === 'attack') return F.atk.m.pose; if (F.st === 'special') return 'special';
    if (F.st === 'hit' || F.st === 'fall' || F.st === 'ko' || (F.st === 'stun' && !F.frozen)) return 'hit';
    if (F.st === 'stun') return 'dazed'; if (F.st === 'down' || F.st === 'lose' || F.st === 'buried') return 'down'; if (F.st === 'getup') return 'crouch';
    if (F.st === 'dazed') return Math.floor(K.t * 3) % 2 ? 'dazed' : 'hit';
    if (F.st === 'win') return Math.floor(F.t * 3) % 2 ? 'win' : 'idle1';
    if (F.st === 'jump') return 'jump'; if (F.st === 'crouch') return 'crouch'; if (F.st === 'block') return 'block';
    if (F.st === 'walk') return Math.floor(K.t * 7) % 2 ? 'walk1' : 'walk2';
    return Math.floor(K.t * 2.2 + F.side) % 2 ? 'idle1' : 'idle2';
  }
  function drawFighter(g, F) {
    const set = FT[F.id], pose = poseOf(F), im = (F.face > 0 ? set.R : set.L)[pose], [x, y] = scr(F.x, F.y);
    const ax = pose === 'down' ? im.width / 2 : F.face > 0 ? set.ax : im.width - set.ax;
    if (pose !== 'down') { const w = 40 - Math.min(20, F.y / 4); g.drawImage(PROPS.shadow, Math.round(x - w / 2), GY - 2, w, 5); }
    const blink = F.inv > 0 && F.st === 'getup' && Math.floor(K.t * 16) % 2; if (blink) g.globalAlpha = 0.5;
    if (F.rot) { g.save(); g.translate(x, y - 46); g.rotate(F.rot); g.drawImage(im, -ax, -im.height + 46 + 1); g.restore(); }
    else g.drawImage(im, Math.round(x - ax), Math.round(y - (pose === 'down' ? DOWN_Y : im.height - 2)));   // lying: the torso on the floor, an arm in front
    g.globalAlpha = 1;
    if (F.wrap) { g.fillStyle = 'rgba(214,180,110,0.85)'; for (let i = 0; i < 4; i++) g.fillRect(x - 15, y - 20 - i * 14, 30, 4); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 4; i++) g.fillRect(x - 15, y - 20 - i * 14, 30, 1); }   // packing tape round him
    if (F.frozen || F.st === 'dazed') for (let i = 0; i < 3; i++) { const a = K.t * 5 + i * 2.1; g.fillStyle = '#ffe14a'; g.fillRect(Math.round(x + Math.cos(a) * 16), Math.round(y - 96 + Math.sin(a) * 3), 2, 2); }   // seeing stars
    F.th = { z: 10, screen: { x: x - 10, y: y - 86, w: 30, h: 8 } };   // main.js's overlays() puts the speech bubble over this box
  }
  function drawProj(g, p) {
    const [x, y] = scr(p.x, p.y), GD = KS.goods;
    const spin = (im, cx, cy, rot, sc = 1) => { g.save(); g.translate(cx, cy); g.rotate(rot); g.drawImage(im, -im.width * sc / 2, -im.height * sc / 2, im.width * sc, im.height * sc); g.restore(); };
    if (p.kind === 'fennel') spin(p.gold ? ART.goldFennel : PROPS.fennel, x, y - 9, p.rot, 0.7);
    else if (p.kind === 'tape') spin(GD.tape, x, y - 6, p.rot, 1.4);
    else if (p.kind === 'catalog') { spin(ART.catalog, x, y - 8, Math.sin(p.rot) * 0.2); }
    else if (p.kind === 'office') g.drawImage(p.im, Math.round(x - p.im.width / 2), Math.round(y - p.im.height));
    else if (p.kind === 'pallet') { const u = Math.min(1, p.t / p.T); g.fillStyle = `rgba(0,0,0,${0.2 + u * 0.3})`; g.fillRect(Math.round(x - 10 - u * 14), GY - 2, Math.round(20 + u * 28), 4); if (p.t >= p.T) g.drawImage(ART.pallet, Math.round(x - ART.pallet.width / 2), Math.round(y - ART.pallet.height)); }
    else if (p.kind === 'receipt') { const A = p.owner, len = Math.round(p.len), x0 = A.face > 0 ? x + 12 : x - 12 - len, ry = y - 6;   // a long white till roll, with lines and a total
      g.fillStyle = '#f8f6ee'; g.fillRect(Math.round(x0), ry, len, 7); g.fillStyle = '#b8b4a8'; for (let i = 2; i < len - 4; i += 5) g.fillRect(Math.round(x0 + i), ry + 2, 3, 1); for (let i = 4; i < len - 4; i += 7) g.fillRect(Math.round(x0 + i), ry + 4, 2, 1);
      if (len > 40) miniText(g, 'TOT 50,00', Math.round(A.face > 0 ? x0 + len - 38 : x0 + 2), ry + 1, '#c02a2a'); g.fillStyle = '#1c1c22'; g.fillRect(Math.round(x0), ry - 1, len, 1); g.fillRect(Math.round(x0), ry + 7, len, 1); }
  }
  // ---- the arenas, drawn once per size: a far layer (moves at half the camera's pace) and the floor
  function bgOf(id) {
    const key = `${id}:${W}x${H}`; if (bgs.has(key)) return bgs.get(key);
    const BW = Math.round(W + (AW - W) * 0.5) + 2, c = document.createElement('canvas'); c.width = BW; c.height = H; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    const R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); }, gy = H - FLOOR;
    const sky = () => { const gr = x.createLinearGradient(0, 0, 0, gy); gr.addColorStop(0, '#5a8ed8'); gr.addColorStop(1, '#bcd8f0'); x.fillStyle = gr; x.fillRect(0, 0, BW, gy);
      for (let i = 0; i < 5; i++) { const cx = (i * 97 + 30) % BW, cy = 14 + (i * 37) % 40; R(cx, cy, 34, 6, '#f4f8fc'); R(cx + 6, cy - 4, 20, 4, '#f4f8fc'); } };
    if (id === 'panorama') { sky(); const bay = IMG['b-panorama-bay'], ent = IMG['b-panorama-entrance'], top = gy - 40;
      if (bay.complete && bay.naturalWidth) { for (let bx = -40; bx < BW; bx += bay.width) x.drawImage(bay, bx, top - bay.height + 12); }
      if (ent.complete && ent.naturalWidth) x.drawImage(ent, Math.round(BW / 2 - ent.width / 2), top - ent.height + 12);
      R(0, top + 12, BW, 28, '#6c6c70'); R(0, top + 12, BW, 2, '#9a9a9e');   // the pavement in front of it, then the car park
      const cars = [...CARS.front, CARS.rox]; for (let i = 0, cx = 6; cx < BW - 30; i++, cx += 46) { const im = i === 3 ? CARS.rox : cars[i % (cars.length - 1)]; const s = 0.55; x.drawImage(im, cx, top + 38 - im.height * s, im.width * s, im.height * s); }
    } else if (id === 'ufp') { sky(); const u = IMG['lm-ufp'];
      R(0, gy - 52, BW, 52, '#8a8f80'); for (let i = 0; i < BW; i += 18) R(i, gy - 60 + (i * 7) % 9, 14, 12, '#5e7a48');   // a hedge, a field behind
      if (u.complete && u.naturalWidth) x.drawImage(u, Math.round(BW / 2 - u.width / 2), gy - 24 - u.height);
      R(0, gy - 24, BW, 24, '#7c7c80'); R(0, gy - 24, BW, 2, '#a4a4a8'); for (let i = 12; i < BW; i += 40) { R(i, gy - 34, 3, 10, '#ec7822'); R(i, gy - 30, 3, 2, '#f4f4f0'); }   // the orange bollards along UFP
      if (PROPS.finish) { const f = PROPS.finish, s = 0.6; x.drawImage(f, 8, gy - 24 - f.height * s, f.width * s, f.height * s); }
    } else {   // the IS aisle: the racking behind, the banner, the sign
      R(0, 0, BW, gy, '#24222e'); for (let i = 0; i < BW; i += 24) R(i, 0, 1, gy, '#2c2a38'); for (let i = 20; i < BW; i += 90) { R(i, 8, 34, 3, '#f4f4e6'); R(i - 2, 11, 38, 1, '#6a6a74'); }
      const BX = ['#b88c58', '#c49860', '#a87848', '#cca870'], PROD = ['#c03030', '#2c5ab0', '#2c8c48', '#e8b420', '#e06c20', '#4a4a56'], labels = ['SILICONE', 'VITI', 'NASTRO', 'SCARPE S3', 'TASSELLI', 'GUANTI', 'SCHIUMA', 'COLLA'];
      const beams = []; for (let yy = gy - 4; yy > 30; yy -= 46) beams.push(yy);
      beams.forEach((by, i) => { for (let b = 0; b * 60 < BW; b++) { const px = b * 60 + 6, h = 14 + ((b * 7 + i * 5) % 4) * 6; if ((b + i) % 5 === 3) continue; const k = (b + i * 3) % 3;
        R(px, by - 3, 50, 3, '#7c5a34'); if (k === 0) { for (let j = 0; j < 8; j++) R(px + j * 6, by - 3 - h, 5, h, PROD[(j + b) % PROD.length]); R(px, by - h, 50, 2, '#e8e4d8'); }
        else { R(px, by - 3 - h, 50, h, BX[(b + i) % 4]); R(px, by - 3 - h, 50, 1, '#d8b888'); const t = labels[(b * 3 + i) % labels.length]; R(px + 25 - miniW(t) / 2 - 2, by - h, miniW(t) + 4, 7, '#f4f2e8'); miniText(x, t, Math.round(px + 25 - miniW(t) / 2), by - h + 1, '#26262c'); } }
        R(0, by, BW, 4, '#f6c41e'); R(0, by, BW, 1, '#ffe27a'); R(0, by + 3, BW, 1, '#b08410'); });
      for (let b = 0; b * 60 <= BW; b++) { R(b * 60 - 2, 0, 4, gy, '#2e4aa8'); R(b * 60 - 2, 0, 1, gy, '#5a78d4'); }
      x.fillStyle = 'rgba(14,12,20,0.42)'; x.fillRect(0, 0, BW, gy);   // dimmed: the fighters must stand out from the racking
      { const t = 'AL SERVIZIO DEL PROFESSIONISTA DAL 1974', w = miniW(t) + 8, bx = Math.round(BW / 2 - w / 2), by = Math.max(46, gy - 132); R(bx, by, w, 9, '#c8282c'); R(bx, by, w, 1, '#e85048'); miniText(x, t, bx + 4, by + 2, '#fff8e8'); }
      { const t = 'CORRIDOIO IS', w = textW(t) + 10, bx = 20, by = Math.max(58, gy - 100); R(bx, by, w, 12, '#24469a'); R(bx + 1, by + 1, w - 2, 1, '#5a7ed2'); pixelText(x, t, bx + 5, by + 3, '#fff8e8'); }
    }
    bgs.set(key, c); return c;
  }
  function floor(g, id) {
    const col = id === 'is' ? ['#8a8a88', '#b4b4b0', '#727270'] : ['#5c5c62', '#76767c', '#4a4a50'];
    g.fillStyle = col[0]; g.fillRect(0, GY, W, FLOOR); g.fillStyle = col[1]; g.fillRect(0, GY, W, 1);
    g.fillStyle = id === 'is' ? '#e8c028' : '#e8e4d8'; for (let wx = Math.floor(camX / 64) * 64; wx < camX + W + 64; wx += 64) { g.fillRect(Math.round(wx - camX), GY + 6, id === 'is' ? 64 : 30, 2); }
    g.fillStyle = col[2]; for (let wx = Math.floor(camX / 37) * 37; wx < camX + W; wx += 37) g.fillRect(Math.round(wx - camX), GY + 9, 1, FLOOR - 9);
  }
  // ---- the HUD on the canvas: energy bars, names, rounds won, the clock, the SPECIALE bars
  const outlined = (g, t, x, y, col, k = 1) => { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) pixelText(g, t, x + dx * k, y + dy * k, '#1c1c22', k); pixelText(g, t, x, y, col, k); };
  function hudDraw(g) {
    const P = K.P, C = K.C, bw = Math.round(W / 2 - 24), top = 6;
    g.fillStyle = 'rgba(10,8,14,0.35)'; g.fillRect(0, 0, W, top + 34);   // a shade behind the HUD: the arena's signs are busy
    const bar = (F, x0, flip) => { g.fillStyle = '#1c1c22'; g.fillRect(x0 - 1, top - 1, bw + 2, 9); g.fillStyle = '#8a1c1c'; g.fillRect(x0, top, bw, 7);
      const w1 = Math.round(bw * Math.max(0, F.shown) / HP), w2 = Math.round(bw * Math.max(0, F.hp) / HP);
      g.fillStyle = '#ffffff'; g.fillRect(flip ? x0 + bw - w1 : x0, top, w1, 7); g.fillStyle = F.hp > 30 ? '#ffd23a' : '#ff8a3a'; g.fillRect(flip ? x0 + bw - w2 : x0, top, w2, 7); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(flip ? x0 + bw - w2 : x0, top, w2, 2);
      const nm = nameOf(F), small = textW(nm) > bw - 22, nw = small ? miniW(nm) : textW(nm);   // a long name in the small font
      if (small) { const nx = flip ? x0 + bw - nw : x0; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) miniText(g, nm, nx + dx, top + 12 + dy, '#1c1c22'); miniText(g, nm, nx, top + 12, '#fff8e8'); }
      else outlined(g, nm, flip ? x0 + bw - nw : x0, top + 11, '#fff8e8');
      for (let i = 0; i < WINS; i++) { const px = flip ? x0 + bw - nw - 10 - i * 8 : x0 + nw + 5 + i * 8; g.fillStyle = '#1c1c22'; g.fillRect(px - 1, top + 11, 7, 7); g.fillStyle = i < F.wins ? '#ffd23a' : '#4a4652'; g.fillRect(px, top + 12, 5, 5); } };
    bar(P, 8, false); bar(C, W - 8 - bw, true);
    const t = String(Math.ceil(K.time)).padStart(2, '0'); outlined(g, t, Math.round(W / 2 - textW(t, 2) / 2), top, K.time < 10 && K.stage === 'fight' ? '#ff5a4a' : '#fff8e8', 2);
    const sc = String(G.score).padStart(6, '0'); outlined(g, sc, Math.round(W / 2 - textW(sc) / 2), top + 18, '#ffd23a');
    // SPECIALE bars, under the fighters' feet
    const mb = Math.min(70, Math.round(W / 4)), my = top + 28;   // up here: the credits line covers the bottom of the picture
    const meter = (F, x0, flip) => { const full = F.meter >= 100, w = Math.round(mb * F.meter / 100); g.fillStyle = '#1c1c22'; g.fillRect(x0 - 1, my - 1, mb + 2, 5); g.fillStyle = '#2c2838'; g.fillRect(x0, my, mb, 3);
      g.fillStyle = full ? (Math.floor(K.t * 6) % 2 ? '#9ad06a' : '#ffffff') : '#5aa040'; g.fillRect(flip ? x0 + mb - w : x0, my, w, 3);
      if (full && F === K.P) outlined(g, 'SPECIALE!', flip ? x0 + mb - textW('SPECIALE!') : x0, my + 6, '#9ad06a'); };
    meter(P, 8, false); meter(C, W - 8 - mb, true);
  }
  function render(g) {
    W = g.canvas.width; H = g.canvas.height; GY = H - FLOOR; g.imageSmoothingEnabled = false;
    const id = K.arena.id, bg = bgOf(id); g.drawImage(bg, -Math.round(camX * 0.5), 0); floor(g, id);
    if (K.stage === 'vs') return vsDraw(g);
    for (const p of K.proj) if (p.kind === 'pallet') drawProj(g, p);
    const order = [K.P, K.C].sort((a, b) => (a.st === 'attack' || a.st === 'special' ? 1 : 0) - (b.st === 'attack' || b.st === 'special' ? 1 : 0));   // the one hitting in front
    for (const F of order) { if (F.st === 'buried') drawBuried(g, F); else drawFighter(g, F); }
    for (const p of K.proj) if (p.kind !== 'pallet') drawProj(g, p);
    hudDraw(g);
    if (K.bigT > 0 && K.big) { const k = K.big.length > 10 ? 2 : 3, t = K.big, w = textW(t, k), kk = w > W - 10 ? 1 : k, w2 = textW(t, kk); outlined(g, t, Math.round(W / 2 - w2 / 2), Math.round(H * 0.36), K.bigCol, kk); }
    if (K.stage === 'finish' && K.P) { const t = 'PREMI SPECIALE!'; if (Math.floor(K.t * 4) % 2) outlined(g, t, Math.round(W / 2 - textW(t) / 2), Math.round(H * 0.36) + 30, '#9ad06a'); }
  }
  function drawBuried(g, F) {   // the pile of fennel, his head poking out at the end
    const pl = K.pile, [x, y] = scr(pl.x, 0), set = FT[F.id], fen = PROPS.fennel;
    if (pl.h < 50) drawFighter(g, F); else { const f = set.face; g.drawImage(f, Math.round(x - f.width / 2), Math.round(y - pl.h - f.height + 14)); F.th = { z: 10, screen: { x: x - 10, y: y - pl.h - 22, w: 30, h: 8 } }; }
    for (let i = 0; i < pl.n; i++) { const a = (i * 2.399) % 6.28, rr = (i * 7) % 26, px = x + Math.cos(a) * rr * 1.3, py = y - Math.min(pl.h, 8 + (i / pl.n) * pl.h) * (1 - Math.abs(Math.cos(a) * rr) / 60); g.save(); g.translate(Math.round(px), Math.round(py)); g.rotate(i * 1.7); g.drawImage(fen, -fen.width / 2, -fen.height / 2); g.restore(); }
    for (const d of pl.drops) if (!d.done) { const [dx, dy] = scr(d.x, d.y); g.save(); g.translate(dx, dy); g.rotate(d.rot); g.drawImage(fen, -fen.width / 2, -fen.height / 2); g.restore(); }
  }
  function vsDraw(g) {   // the match card: the two faces, VS, where
    const P = K.P, C = K.C, u = Math.min(1, K.stT / 0.4), fp = FT[P.id].face, fc = FT[C.id].face, k = H > 220 ? 3 : 2;
    g.fillStyle = 'rgba(10,8,14,0.55)'; g.fillRect(0, 0, W, H);
    const cy = Math.round(H * 0.42), lx = Math.round(W * 0.25 - fp.width * k / 2 - (1 - u) * W * 0.4), rx = Math.round(W * 0.75 - fc.width * k / 2 + (1 - u) * W * 0.4);
    g.drawImage(fp, lx, cy - fp.height * k / 2, fp.width * k, fp.height * k); g.drawImage(fc, rx, cy - fc.height * k / 2, fc.width * k, fc.height * k);
    C.th = P.th = null;
    outlined(g, 'VS', Math.round(W / 2 - textW('VS', 3) / 2), cy - 10, '#ff5a4a', 3);
    const n1 = nameOf(P), n2 = nameOf(C), ny = cy + Math.round(fp.height * k / 2) + 6;
    outlined(g, n1, clamp(Math.round(W * 0.25 - textW(n1) / 2), 4, W / 2 - textW(n1) - 4), ny, '#ffe14a'); outlined(g, n2, clamp(Math.round(W * 0.75 - textW(n2) / 2), W / 2 + 4, W - textW(n2) - 4), ny, '#ff8a3a');
    const t1 = `INCONTRO ${K.n + 1}/${K.opps.length}`, t2 = K.arena.name; outlined(g, t1, Math.round(W / 2 - textW(t1) / 2), 10, '#fff8e8'); outlined(g, t2, Math.round(W / 2 - textW(t2) / 2), 22, '#7fe0ff');
    if (K.stT > 0.5) { const t = `"${K.vsLine}"`; outlined(g, t, Math.round(W / 2 - textW(t) / 2), ny + 13, '#fff8e8'); }   // the opponent's greeting
    if (K.n === K.opps.length - 1) { const t = 'ULTIMO INCONTRO!'; if (Math.floor(K.t * 4) % 2) outlined(g, t, Math.round(W / 2 - textW(t) / 2), ny + 26, '#ff5a4a'); }
  }

  return { reset, step, render, get K() { return K; }, AW, MOVES, ARENAS };
}
