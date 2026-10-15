// kong.js: ROX KONG, the second boss (after CORRIDOIO IS, or from the menu). Rox has jumped off his forklift and climbed
// the racking of UFP's warehouse: a side view, like Donkey Kong. He stands on the top beam and rolls UFP's own goods
// down at you (silicone cartridges, cans of foam, rolls of tape, castor wheels, safety shoes, fennel), and in the later
// bays boxes of screws fall from the top shelves (their mark blinks on the beam first). You climb the ladders beam by
// beam and jump what rolls; a hard hat lets you smash it for a while; a coffee gives a life back. Three bays, one
// department of UFP's catalogue each (art/codex/UFP-PRODOTTI.md); in the third he slips on his own fennel and lands in
// the returns box, wrapped in stretch film. main.js runs it: reset(), step(dt), render(g); the HUD and screens are there.
//
// Units are the canvas's pixels: x from the left end of the racking (0..LW), y up from the warehouse floor; a thing's
// y is its bottom. Beam i's walking surface is at y = i * FH.
import { miniText, miniW } from './font.js';

const LW = 240, FH = 46, GROUND = 14, WALK = 50, CLIMB = 38, JUMP = 140, GRAV = 490, HAT_T = 8, ROX_X = 24, MAX_ITEMS = 9;
export const KONG_HP = 5;
const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)], clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RAD = { cart: 3, foam: 3, tape: 4, wheel: 4, fennel: 4, shoe: 4 };   // half the height of what rolls (its hit box; the picture is a little bigger)
// the three bays. top: Rox's beam; lad[i]: the x of the ladders from beam i to beam i+1; items: what he rolls; every:
// seconds between throws; v: their speed; down: the chance they take a ladder down; falls: seconds between boxes falling
// (like the arcade: you start by the returns box and the way up is always at the other end of the beam, so what rolls
// comes at you head on; a second ladder in the middle is a shortcut, but goods come down ladders too)
// from the top shelves; hat, coffee: [beam, x]; labels: the words on the boxes at the back
export const LEVELS = [
  { name: 'SIGILLANTI E SCHIUME', top: 4, lad: [[34, 130], [204], [36, 150], [170]], items: ['cart', 'cart', 'foam', 'foam', 'fennel'], every: [1.5, 2.3], v: 42, down: 0.3, hat: [2, 110], coffee: [3, 90],
    labels: ['SILICONE', 'SCHIUMA', 'SOUDAL', 'AREXONS', 'SIGILLANTE', 'HENKEL', 'RESINA', 'COLLA', 'WD-40', '3M', 'PU', 'MS'] },
  { name: 'VITERIA E NASTRI', top: 5, lad: [[206, 100], [34], [206, 120], [34], [170]], items: ['tape', 'tape', 'wheel', 'wheel', 'cart', 'fennel'], every: [1.3, 2], v: 48, down: 0.35, falls: [3.5, 5], fall: 'boxViti', hat: [1, 130], coffee: [3, 160],
    labels: ['TASSELLI', 'RIVETTI', 'FISCHER', 'BULLONI', 'NASTRO', 'MUSTAD', 'FRIULSIDER', 'VITI', 'SPAX', 'DADI', 'M8', '5X50'] },
  { name: 'ANTINFORTUNISTICA', top: 5, lad: [[206], [34, 130], [206], [34, 110], [170, 90]], items: ['shoe', 'shoe', 'tape', 'wheel', 'foam', 'fennel'], every: [1.15, 1.8], v: 53, down: 0.4, falls: [2.8, 4.2], fall: 'boxChiodi', hat: [2, 100], coffee: [4, 140],
    labels: ['SCARPE S3', 'U-POWER', 'DIADORA', 'STANLEY', 'DEWALT', 'MILWAUKEE', 'GUANTI', 'CASCHI', 'BETA', 'TUTE', 'S3', 'FFP2'] },
];
// the beams: the top one is Rox's, open at its right end; below it they alternate, each open at the end its goods roll
// towards, so they drop onto the next beam down and roll back the other way; the floor runs the whole width
const floorsOf = L => Array.from({ length: L.top + 1 }, (_, i) => { const dir = (L.top - i) % 2 ? -1 : 1;
  return { y: i * FH, dir, x0: i > 0 && i < L.top && dir < 0 ? 24 : 0, x1: i === 0 ? LW : i === L.top ? 180 : dir > 0 ? LW - 24 : LW }; });
const HEAD = 84, levelTop = L => L.top * FH + HEAD;   // room over Rox's beam: him, his speech bubble, the HUD

export function createKong(o) {
  const { G, keys, ROXK, KS, sfx, say, SAY, float, burst, toast, end } = o, GD = KS.goods;
  let K = null, bg = null, bgKey = '', ox = 0, base = 0;
  const scr = (x, y) => [ox + x, Math.round(base - (y - K.camY))];   // world to canvas

  function level(n) {
    const L = LEVELS[n], F = floorsOf(L);
    Object.assign(K, { n, L, F, lads: L.lad.flatMap((xs, f) => xs.map(x => ({ x, f }))), items: [], picks: [{ k: 'hat', f: L.hat[0], x: L.hat[1] }, { k: 'coffee', f: L.coffee[0], x: L.coffee[1] }],
      hat: 0, bonus: 5000, bonusT: 0, throwT: 2.4, look: 1.6, fallT: L.falls ? rnd(...L.falls) : 1e9, stage: 'play', stT: 0, camY: -1, near: false, fade: 0, resi: F[0].dir > 0 ? LW - 15 : 15 });
    K.p = { x: F[0].dir > 0 ? LW - 36 : 36, y: 0, vx: 0, vy: 0, f: 0, lastF: 0, mode: 'walk', lad: null, face: F[0].dir > 0 ? -1 : 1, anim: 0, stun: 0 };
    K.R = { kind: 'rox', x: ROX_X, y: F[L.top].y, mode: 'idle', t: 0, hold: null, holdT: 0, sayT: 2.5, laughT: 0, said: null, saidT: 0, vx: 0, vy: 0, rot: 0 };
    G.ents = [K.R];   // main.js's overlays() draws his speech bubbles from here
  }
  function reset() { K = G.K = { t: 0, jumps: 0, smashed: 0, bonuses: 0, jumpHeld: false, jumpQ: 0 }; level(0); }

  // ------------------------------------------------------------ you
  function movePlayer(dt, lr, up, down) {
    const P = K.p, F = K.F; P.stun = Math.max(0, P.stun - dt); K.hat = Math.max(0, K.hat - dt);
    if (P.stun > 0) { if (P.mode === 'air') fall(P, dt); return; }
    if (P.mode === 'climb') {
      const l = P.lad, v = (up ? 1 : 0) - (down ? 1 : 0); P.y += v * CLIMB * dt;
      if (v) { P.anim += dt; if ((K.rungT = (K.rungT || 0) - dt) <= 0) { K.rungT = 0.24; sfx('rung'); } }
      if (P.y >= F[l.f + 1].y) { P.y = F[l.f + 1].y; P.mode = 'walk'; P.f = P.lastF = l.f + 1; }
      else if (P.y <= F[l.f].y) { P.y = F[l.f].y; P.mode = 'walk'; P.f = P.lastF = l.f; }
      return;
    }
    if (P.mode === 'walk') {
      const near = f => K.lads.find(l => l.f === f && Math.abs(l.x - P.x) < 6);
      if (up && near(P.f)) { P.lad = near(P.f); P.mode = 'climb'; P.x = P.lad.x; P.y += 0.5; return; }
      if (down && P.f > 0 && near(P.f - 1)) { P.lad = near(P.f - 1); P.mode = 'climb'; P.x = P.lad.x; P.y -= 0.5; return; }
      if (K.jumpQ > 0) { K.jumpQ = 0; P.mode = 'air'; P.vy = JUMP; sfx('jump'); }
    }
    P.vx = lr * WALK; if (lr) P.face = lr; P.x = clamp(P.x + P.vx * dt, 4, LW - 4);
    if (P.mode === 'walk') { if (lr) P.anim += dt; const fl = F[P.f]; if (P.x < fl.x0 - 2 || P.x > fl.x1 + 2) { P.mode = 'air'; P.vy = 0; } }   // off the end of the beam
    if (P.mode === 'air') fall(P, dt);
  }
  function fall(P, dt) {   // in the air: down onto the first beam under you (you go up through them, like in the arcade)
    const y0 = P.y; P.vy -= GRAV * dt; P.y += P.vy * dt; if (P.vy > 0) return;
    for (let i = K.F.length - 1; i >= 0; i--) { const fl = K.F[i]; if (fl.y <= y0 + 0.01 && fl.y >= P.y && P.x >= fl.x0 - 2 && P.x <= fl.x1 + 2) {
      if (i < P.lastF) { const [x, y] = scr(P.x, P.y + 20); float('OPS!', x - 8, y - 8, '#ffffff'); }
      P.y = fl.y; P.vy = 0; P.mode = 'walk'; P.f = P.lastF = i; return; } }
  }
  function hurt(it) {
    const P = K.p; if (G.invT > 0 || G.finished) return;
    G.hp--; G.taken++; G.hurtBy.push(it ? it.k : '?'); G.invT = 2.2; P.stun = 0.7; G.shake = 0.3; sfx('crash');
    if (it) { it.gone = true; const [x, y] = scr(it.x, it.y + 5); burst(x, y, 10, ['#f0f4e2', '#c89a50', '#202020']); }
    K.R.laughT = 1.2; say(K.R, SAY.kongLaugh, 1.3);
    if (G.hp <= 0) { G.finished = true; G.phase = 'ending'; G.result = { won: false, time: G.t, lv: K.n + 1 }; K.stage = 'lost'; say(K.R, SAY.kongWin, 2.4); sfx('lose'); toast('SOMMERSO DALLA MERCE!', 1800); const k0 = K; setTimeout(() => { if (K === k0 && G.phase === 'ending') end(); }, 2400); }
  }

  // ------------------------------------------------------------ Rox and what he throws
  function throwItem(k) {
    const L = K.L, top = K.F[L.top];
    K.items.push({ k, x: K.R.x + 10, y: top.y, f: L.top, v: L.v * (k === 'wheel' ? 1.15 : k === 'shoe' ? 1.05 : 1), mode: k === 'shoe' ? 'hop' : 'roll', rot: 0, r: RAD[k], ph: 0, seen: [] });
    sfx('taunt');
  }
  function drop() {   // he shakes the racking: a box falls from the top shelves onto your beam, its mark blinks first
    const P = K.p, fl = K.F[P.f], x = clamp(P.x, fl.x0 + 8, fl.x1 - 8);
    const y0 = Math.max(fl.y + 60, K.camY + o.canvas.height); K.items.push({ k: K.L.fall, mode: 'drop', x, f: P.f, y: y0, y0, t: 0, T: 1.1, r: 6, rot: 0 });   // from the top of the screen
    G.shake = Math.max(G.shake, 0.08); if (Math.random() < 0.5) say(K.R, SAY.kongShake, 1.4);
  }
  function roxStep(dt, play) {
    const R = K.R, L = K.L; R.t += dt; R.laughT = Math.max(0, R.laughT - dt); if (R.saidT > 0) R.saidT -= dt;
    if (R.mode === 'idle' || R.mode === 'lift') {
      if (!play || K.stage !== 'play') return;
      if (R.mode === 'lift') { if ((R.holdT -= dt) <= 0) { throwItem(R.hold); R.mode = 'idle'; R.hold = null; } }
      else if ((K.throwT -= dt) <= 0 && K.items.length < MAX_ITEMS) { K.throwT = rnd(...L.every); R.mode = 'lift'; R.hold = pick(L.items); R.holdT = 0.55; if (Math.random() < 0.3) say(R, SAY.kongThrow, 1.5); }
      if (L.falls && (K.fallT -= dt) <= 0) { K.fallT = rnd(...L.falls); if (K.p.mode === 'walk' && K.p.f < L.top) drop(); }
      if ((R.sayT -= dt) <= 0) { R.sayT = rnd(4, 7); if (R.saidT <= 0) say(R, SAY.kongIdle, 1.8); }
      if (!K.near && K.p.f >= L.top - 1 && K.p.mode === 'walk') { K.near = true; say(R, SAY.kongNear, 1.8); }
    } else if (R.mode === 'climb') R.y += 30 * dt;   // up his ladder, out of reach (for now)
    else if (R.mode === 'slip') { if (R.t > 0.7) { if (!R.flying) { R.flying = true; const y0 = R.y, g = GRAV * 0.8, T = (140 + Math.sqrt(140 * 140 + 2 * g * y0)) / g; R.vy = 140; R.vx = (K.resi - R.x) / T; sfx('slip'); }
        R.vy -= GRAV * 0.8 * dt; R.y += R.vy * dt; R.x += R.vx * dt; R.rot += 7 * dt;
        if (R.y <= 2) { R.y = 0; R.x = K.resi; R.mode = 'parcel'; R.rot = 0; G.shake = 0.35; sfx('thud'); sfx('wrap'); const [x, y] = scr(R.x, 14); burst(x, y, 26, ['#d6e8f6', '#ffffff', '#c89a50']);
          toast('ROX IMBALLATO!', 2200); say(R, SAY.kongWrapped, 2.4); const k0 = K; setTimeout(() => { if (K === k0 && G.phase === 'ending') end(); }, 3000); } } }
  }
  // you got to him: in the first two bays he climbs higher, in the third he backs onto his own fennel
  function reached() {
    const R = K.R, pts = 2000 + K.bonus; K.stage = 'clear'; K.stT = 0; G.score += pts; K.bonuses += pts; G.invT = 0;
    for (const it of K.items) { const [x, y] = scr(it.x, it.y + 4); burst(x, y, 5, ['#ffffff', '#c89a50']); } K.items = [];
    const [x, y] = scr(R.x, R.y + 50); float(`PRESO! +${pts}`, x - 10, y, '#ffffff', 1);
    if (K.n < LEVELS.length - 1) { R.mode = 'climb'; R.t = 0; say(R, SAY.kongUp, 2); AU_win(); toast(`ROX SALE ANCORA! ${pick(['INSEGUILO!', 'NON MOLLARE!'])}`, 1800); }
    else { R.mode = 'slip'; R.t = 0; say(R, 'IL MIO FINOCCHIO!', 1.6); G.finished = true; G.phase = 'ending'; const bonus = G.hp * 800; G.score += bonus; G.result = { won: true, time: G.t, bonus: K.bonuses + bonus }; AU_win(); }
  }
  const AU_win = () => sfx('win');

  // ------------------------------------------------------------ what rolls, hops, drops
  function itemsStep(dt, play) {
    const P = K.p, hb = K.hat > 0 ? 5 : 2;   // your half width: a forgiving hit box (playtest: at 3 the jump had to be timed within 70 ms)
    for (const it of K.items) {
      const fl = K.F[it.f];
      if (it.mode === 'roll' || it.mode === 'hop') {
        it.x += it.v * fl.dir * dt; it.rot += it.v * fl.dir * dt / (it.k === 'cart' || it.k === 'foam' ? it.r * 3 : it.r);
        if (it.mode === 'hop') { const s0 = Math.sin(it.ph); it.ph += it.v * dt / 44 * Math.PI; it.y = fl.y + Math.abs(Math.sin(it.ph)) * 9; if (Math.sign(Math.sin(it.ph)) !== Math.sign(s0)) sfx('hop'); }
        if (it.mode === 'roll' && it.f > 0) for (const l of K.lads) if (l.f === it.f - 1 && !it.seen.includes(l) && Math.abs(l.x - it.x) < 2) {   // a ladder going down: sometimes it takes it, more often when you are below
          it.seen.push(l); if (Math.random() < K.L.down + (P.f < it.f && Math.abs(P.x - l.x) < 60 ? 0.18 : 0)) { it.mode = 'ladder'; it.x = l.x; it.lad = l; } }
        if (it.f === 0 && (fl.dir > 0 ? it.x > K.resi - 4 : it.x < K.resi + 4)) { it.gone = true; const [x, y] = scr(K.resi, 18); burst(x, y, 4, ['#c89a50', '#ffffff']); }   // into the returns box
        else if (it.x < fl.x0 - 2 || it.x > fl.x1 + 2) { it.vy = it.mode === 'hop' ? 40 : 0; it.mode = 'fall'; it.dir = fl.dir; }
      } else if (it.mode === 'ladder') { it.y -= 48 * dt; if (it.y <= K.F[it.lad.f].y) { it.y = K.F[it.lad.f].y; it.f = it.lad.f; it.mode = it.k === 'shoe' ? 'hop' : 'roll'; it.ph = 0; } }
      else if (it.mode === 'fall') { it.vy -= GRAV * dt; it.y += it.vy * dt; it.x += it.dir * it.v * 0.35 * dt; it.rot += it.dir * dt * 4;
        const below = K.F[it.f - 1]; if (it.y <= below.y) { it.y = below.y; it.f--; it.mode = it.k === 'shoe' ? 'hop' : 'roll'; it.ph = 0; sfx('bonk'); } }
      else if (it.mode === 'drop') { it.t += dt; const u = Math.min(1, it.t / it.T); it.y = fl.y + (it.y0 - fl.y) * (1 - u * u); it.rot = u * 0.5;
        if (u >= 1) { it.gone = true; sfx('thud'); G.shake = Math.max(G.shake, 0.15); const [x, y] = scr(it.x, fl.y + 4); burst(x, y, 14, ['#c0c4cc', '#8a8e96', '#c89a50']);
          if (play && Math.abs(P.x - it.x) < 9 + hb && P.y < fl.y + 16 && P.y > fl.y - 22) { if (K.hat > 0) smash(it); else hurt(it); } }
        continue; }
      if (!play || K.stage !== 'play') continue;
      // touching you: a smash with the hard hat, otherwise a hit; over you in a jump: points
      if (Math.abs(it.x - P.x) < hb + it.r - 1 && it.y + 2 * it.r - 1 > P.y + 1 && it.y + 1 < P.y + 18) { if (K.hat > 0) smash(it); else hurt(it); }
      else if (P.mode === 'air' && !it.over && Math.abs(it.x - P.x) < 5 && P.y >= it.y + 2 * it.r - 2 && P.y - it.y < 34 && it.f === P.lastF) {
        it.over = true; K.jumps++; G.score += 100; const [x, y] = scr(P.x, P.y + 24); float('+100', x - 8, y - 6, '#ffe14a'); if (Math.random() < 0.15) say(K.R, SAY.kongJumped, 1.4); }
    }
    K.items = K.items.filter(it => !it.gone);
  }
  function smash(it) { it.gone = true; K.smashed++; G.score += 300; sfx('smash'); const [x, y] = scr(it.x, it.y + 5); burst(x, y, 14, ['#ffd23a', '#ffffff', '#c89a50']); float('CRACK! +300', x - 20, y - 12, '#ffd23a'); }
  function pickups() {
    const P = K.p;
    for (const pk of K.picks) if (!pk.got && P.f === pk.f && P.mode !== 'climb' && Math.abs(P.x - pk.x) < 8) {
      pk.got = true; sfx('pickup'); const [x, y] = scr(pk.x, pk.f * FH + 14);
      if (pk.k === 'hat') { K.hat = HAT_T; toast('CASCO! ROMPI TUTTO!', 1500); say(K.R, SAY.kongHat, 1.6); float('CASCO!', x - 12, y - 8, '#ffd23a'); }
      else if (G.hp < KONG_HP) { G.hp++; float('+1 VITA', x - 14, y - 8, '#7fe0ff'); } else { G.score += 500; float('+500', x - 10, y - 8, '#7fe0ff'); }
    }
  }

  // ------------------------------------------------------------ one step
  function step(dt) {
    const play = G.phase === 'play' && !G.finished, P = K.p, L = K.L; G.t += dt; K.t += dt;
    for (const k of ['invT', 'shake']) G[k] = Math.max(0, G[k] - dt);
    const jp = !!keys.jump; if ((jp && !K.jumpHeld) || keys.jumpTap) K.jumpQ = 0.15; K.jumpHeld = jp; keys.jumpTap = false; K.jumpQ = play ? Math.max(0, K.jumpQ - dt) : 0;   // a press (or a tap shorter than a frame), kept a moment: pressed just before landing it still jumps
    if (play && K.stage === 'play') {
      if ((K.bonusT += dt) >= 2) { K.bonusT -= 2; K.bonus = Math.max(0, K.bonus - 100); }
      movePlayer(dt, (keys.right ? 1 : 0) - (keys.left ? 1 : 0), !!keys.gas, !!keys.brake); pickups();
      if (P.mode === 'walk' && P.f === L.top && Math.abs(P.x - K.R.x) < 20) reached();
    }
    roxStep(dt, play); itemsStep(dt, play);
    if (K.stage === 'clear' && K.R.mode === 'climb') { K.stT += dt; K.fade = clamp((K.stT - 2.2) / 0.5, 0, 1);
      if (K.stT > 2.8) { level(K.n + 1); K.fade = 1; toast(`SCAFFALE ${K.n + 1}: ${K.L.name}`, 2000); sfx('charge'); } }
    else K.fade = Math.max(0, K.fade - dt * 2.5);
    // the camera: up and down with you (with Rox when he climbs or falls)
    const H = o.canvas.height, R = K.R, top = Math.max(0, levelTop(L) - (H - GROUND)); K.look = Math.max(0, K.look - dt);
    const tgt = clamp((K.stage === 'play' || K.stage === 'lost') && K.look <= 0 ? P.y - 26 : R.y + 20 - (H - GROUND) * 0.42, 0, top);   // you low on the screen (the goods come from above); at the start of a bay a look at Rox up there first
    if (K.camY < 0) K.camY = top; K.camY += (tgt - K.camY) * Math.min(1, dt * (R.mode === 'slip' ? 7 : K.look > 0 ? 6 : 2.6));
    for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; p.t -= dt; } G.parts = G.parts.filter(p => p.t > 0);
    for (const f of G.floats) { f.y -= 22 * dt; f.t -= dt; } G.floats = G.floats.filter(f => f.t > 0);
  }

  // ------------------------------------------------------------ drawing
  // the still part of a bay, drawn once: the warehouse wall, the racking (blue uprights, yellow beams, goods at the
  // back with words on them), the ladders, Rox's pile, the returns box. Row r is world y = top - r.
  function drawBg(W, L) {
    const top = levelTop(L), F = floorsOf(L), c = document.createElement('canvas'); c.width = W; c.height = top + GROUND;
    const x = c.getContext('2d'), R = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h)); }, row = y => top - y;
    const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
    x.fillStyle = '#24222e'; x.fillRect(0, 0, W, c.height); for (let i = 0; i < W; i += 24) R(i, 0, 1, c.height, '#2c2a38');   // the wall, its panels
    for (let i = 30; i < W; i += 90) { R(i, 16, 30, 3, '#f4f4e6'); R(i - 2, 19, 34, 1, '#6a6a74'); }   // neon tubes
    // the racking, beyond the bays too (dimmed after): goods at the back of each level, then the uprights and the beams
    const BX = ['#b88c58', '#c49860', '#a87848', '#cca870'], PROD = ['#c03030', '#2c5ab0', '#2c8c48', '#e8b420', '#e06c20', '#4a4a56'];
    for (let i = 0; i <= L.top; i++) { const y0 = F[i].y, y1 = i < L.top ? F[i + 1].y - 4 : y0 + 30;
      for (let b = -Math.ceil(ox / 60) - 1; b * 60 < W - ox; b++) { const wide = hash(i, b + 7) % 3 === 0;   // a bay: one wide load (room for a long word) or two
        for (const [dx, pw] of wide ? [[6, 51]] : [[6, 24], [33, 24]]) { const hh = hash(i * 31 + dx, b + 99), px = ox + b * 60 + dx;
        if (hh % 7 === 0 || (i === L.top && b === 0)) continue;   // an empty place; Rox's spot
        R(px, row(y0) - 3, pw, 3, '#7c5a34'); const h = Math.min(y1 - y0 - 6, 10 + (hh >>> 4) % 14), kind = (hh >>> 9) % 4;   // the pallet, then the load
        if (kind === 3) { for (let k = 0; k < pw / 6 - 0.5; k++) R(px + k * 6, row(y0) - 3 - h, 5, h, PROD[hash(k, hh) % PROD.length]); R(px, row(y0) - 3 - h + 3, pw, 2, '#e8e4d8'); }   // boxes of tools, a white band
        else { R(px, row(y0) - 3 - h, pw, h, BX[hh % 4]); R(px, row(y0) - 3 - h, pw, 1, '#d8b888'); R(px + Math.floor(pw / 2) - 1, row(y0) - 3 - h, 2, h, '#dcc49a');
          const fit = L.labels.filter(t => miniW(t) + 4 <= pw), t = fit[(hh >>> 13) % fit.length];   // a word that fits on it
          if (t && h >= 9 && b >= 0 && b * 60 < LW) { const lw = miniW(t) + 4, lx = Math.round(px + pw / 2 - lw / 2); R(lx, row(y0) - 3 - h + 2, lw, 7, '#f4f2e8'); miniText(x, t, lx + 2, row(y0) - 3 - h + 3, '#26262c'); } } } } }
    const up = L.top * FH + 30;
    for (let b = -Math.ceil(ox / 60) - 1; b * 60 <= W - ox; b++) { const ux = ox + b * 60 - 2; R(ux, row(up), 4, up, '#2e4aa8'); R(ux, row(up), 1, up, '#5a78d4'); for (let y = 3; y < up; y += 4) R(ux + 2, row(y), 1, 1, '#16245a'); }
    for (let i = 1; i <= L.top; i++) { const fl = F[i], r0 = row(fl.y);
      const beam = (a, b) => { R(a, r0, b - a, 4, '#f6c41e'); R(a, r0, b - a, 1, '#ffe27a'); R(a, r0 + 3, b - a, 1, '#b08410'); };
      beam(0, ox + fl.x0); beam(ox + fl.x1, W); beam(ox + fl.x0, ox + fl.x1);
      R(ox + (fl.x0 > 0 ? fl.x0 : fl.x1) - 2, r0 - 1, 4, 6, '#4a4a52'); }   // the beam's loose end, where the goods drop
    { const t = 'AL SERVIZIO DEL PROFESSIONISTA DAL 1974', w = miniW(t) + 8, bx = Math.round(ox + LW / 2 - w / 2), by = row(FH - 6); for (const cx of [bx + 6, bx + w - 7]) R(cx, by - 3, 1, 3, '#9a9aa4');   // their slogan (as text), hung from the first beam
      R(bx, by, w, 9, '#c8282c'); R(bx, by, w, 1, '#e85048'); miniText(x, t, bx + 4, by + 2, '#fff8e8'); }
    { const t = 'CORRIDOIO IS', w = miniW(t) + 8, bx = ox + LW - w - 2, by = row(F[L.top].y) + 6; for (const cx of [bx + 4, bx + w - 5]) R(cx, by - 2, 1, 2, '#9a9aa4');   // the aisle's sign, under the end of Rox's beam
      R(bx, by, w, 9, '#24469a'); R(bx + 1, by + 1, w - 2, 1, '#5a7ed2'); miniText(x, t, bx + 4, by + 3, '#fff8e8'); }
    R(0, row(0), W, GROUND, '#8a8a88'); R(0, row(0), W, 1, '#b4b4b0'); R(0, row(0) + 3, W, 2, '#e8c028'); for (let i = 0; i < W; i += 37) R(i, row(0) + 6, 1, GROUND - 6, '#727270');   // the floor
    x.fillStyle = 'rgba(14,12,20,0.6)'; x.fillRect(0, 0, ox, c.height - GROUND); x.fillRect(ox + LW, 0, W - ox - LW, c.height - GROUND);   // beyond the bays: dimmed, not for walking
    // the ladders (aluminium, they stick out over the beam above), Rox's own up to the ceiling
    const ladder = (lx, y0, y1) => { R(ox + lx - 4, row(y1), 1, y1 - y0, '#c4cad4'); R(ox + lx + 3, row(y1), 1, y1 - y0, '#c4cad4'); R(ox + lx - 3, row(y1), 1, y1 - y0, '#7c828c'); for (let y = y0 + 4; y < y1; y += 5) R(ox + lx - 3, row(y), 6, 1, '#a8aeb8'); };
    for (const l of L.lad.flatMap((xs, f) => xs.map(lx => ({ lx, f })))) ladder(l.lx, F[l.f].y, F[l.f + 1].y + 8);
    ladder(ROX_X, F[L.top].y, top);
    { const py = row(F[L.top].y); R(ox + 1, py - 3, 14, 3, '#7c5a34'); for (let k = 0; k < 3; k++) { R(ox + 2, py - 9 - k * 6, 12, 6, BX[k]); R(ox + 2, py - 9 - k * 6, 12, 1, '#d8b888'); } x.drawImage(GD.fennel, ox + 3, py - 30); }   // his pile: what he throws
    x.drawImage(GD.resi, ox + Math.round(F[0].dir > 0 ? LW - 30 : 0), row(0) - 22);
    return c;
  }
  const at = (g, im, x, y, rot = 0) => { if (rot) { g.save(); g.translate(Math.round(x), Math.round(y - im.height / 2)); g.rotate(rot); g.drawImage(im, -Math.round(im.width / 2), -Math.round(im.height / 2)); g.restore(); } else g.drawImage(im, Math.round(x - im.width / 2), Math.round(y - im.height)); };   // bottom centre at (x, y)
  function roxImg(R) {
    if (R.mode === 'parcel') return ROXK.parcel; if (R.mode === 'slip') return R.flying ? ROXK.hit : ROXK.ouch;
    if (R.mode === 'climb') return Math.floor(R.t * 5) % 2 ? ROXK.climb1 : ROXK.climb2;
    if (R.mode === 'lift') return ROXK.throw; if (K.stage === 'lost' || R.laughT > 0) return Math.floor(R.t * 6) % 2 ? ROXK.wave : ROXK.grin;
    return Math.floor(R.t * 1.6) % 3 === 2 ? ROXK.wave : Math.floor(R.t * 1.6) % 2 ? ROXK.grin : ROXK.stand;
  }
  function render(g) {
    const W = g.canvas.width, H = g.canvas.height, L = K.L; ox = Math.round((W - LW) / 2); base = H - GROUND;
    const key = `${W}x${H}:${K.n}`; if (key !== bgKey) { bg = drawBg(W, L); bgKey = key; }
    g.imageSmoothingEnabled = false; g.fillStyle = '#24222e'; g.fillRect(0, 0, W, H); g.drawImage(bg, 0, Math.round(base - levelTop(L) + K.camY));
    const blink = Math.floor(K.t * 8) % 2;
    for (const pk of K.picks) if (!pk.got) { const [x, y] = scr(pk.x, pk.f * FH + 2 + Math.abs(Math.sin(K.t * 3)) * 3); at(g, GD[pk.k], x, y); }
    for (const it of K.items) if (it.mode === 'drop') { const [x, y] = scr(it.x, K.F[it.f].y), u = Math.min(1, it.t / it.T);   // its mark on the beam, then the box
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x - 3 - u * 5, y - 2, 6 + u * 10, 2); if (blink) { g.fillStyle = '#ff4a3a'; g.fillRect(x - 1, y - 18, 2, 7); g.fillRect(x - 1, y - 9, 2, 2); } }
    for (const it of K.items) { const im = GD[it.k], [x, y] = scr(it.x, it.y);
      if (it.mode === 'drop') at(g, im, x, y, it.rot); else if (it.k === 'shoe') at(g, im, x, y + 1, it.mode === 'hop' ? Math.sin(it.ph * 2) * 0.25 : it.rot);
      else { g.save(); g.translate(x, y - Math.max(it.r, im.height / 2 - 1)); g.rotate(it.rot); g.drawImage(im, -Math.round(im.width / 2), -Math.round(im.height / 2)); g.restore(); } }
    // Rox (and what he is about to throw, over his head)
    const R = K.R, rim = roxImg(R), [rx, ry] = scr(R.x, R.y);
    if (R.mode === 'slip' && R.flying) at(g, rim, rx, ry, R.rot); else if (R.mode === 'parcel') { at(g, rim, rx, ry - 6); at(g, GD.resi, rx, ry); } else at(g, rim, rx, ry);
    if (R.mode === 'slip' && !R.flying) g.drawImage(GD.fennel, rx + 4, ry - 12);
    if (R.mode === 'lift' && R.hold) { const im = GD[R.hold]; g.drawImage(im, Math.round(rx - im.width / 2), Math.round(ry - rim.height - im.height + 4)); }
    R.th = { z: 10, screen: { x: rx + 18, y: ry - 22, w: rim.width, h: 10 } };   // his speech bubble beside his head, not over it (overlays() puts it over a box h high)
    // you
    const P = K.p, set = K.hat > 0 && !(K.hat < 2 && blink) ? KS.hat : KS.me, L2 = P.face < 0 ? 'L' : '';
    const pose = P.mode === 'climb' ? (Math.floor(P.y / 5) % 2 ? 'climb1' : 'climb2') : P.stun > 0 ? 'ouch' + L2 : P.mode === 'air' ? 'jump' + L2 : P.vx ? (Math.floor(P.anim * 8) % 2 ? 'walk1' : 'walk2') + L2 : 'stand' + L2;
    const [px, py] = scr(P.x, P.y); if (G.invT > 0 && G.invT < 2 && Math.floor(K.t * 16) % 2) g.globalAlpha = 0.45; at(g, set[pose], px, py + 1); g.globalAlpha = 1;
    if (P.stun > 0) for (let i = 0; i < 3; i++) { const a = K.t * 6 + i * 2.1; g.fillStyle = '#ffe14a'; g.fillRect(Math.round(px + Math.cos(a) * 7), Math.round(py - 26 + Math.sin(a) * 2), 2, 2); }   // seeing stars
    if (K.fade > 0) { g.fillStyle = `rgba(10,8,14,${K.fade})`; g.fillRect(0, 0, W, H); }
  }

  return { reset, step, render, get K() { return K; }, LEVELS, LW, FH };
}
