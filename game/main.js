// main.js: ROX, the game. Two modes on the real road from the Panorama (Via Bure Vecchia Nord) to Utensilferramenta
// Pistoiese (Via Salvatorelli), drawn by Pixel Path's renderer (road.js) with the camera behind your car.
//
//   INVESTI ROX  lunch break is over, you must clock in by 14:00, and Rox is everywhere on the road: walking across,
//                waving, on the phone, eating fennel, pushing a trolley or the Grizzly, asleep on the asphalt,
//                sometimes golden. Run over as many as you can (combo multiplier), dodge the traffic.
//   ROX CHASE    Rox has taken the Grizzly floor scrubber and is racing to clock in before you, riding it backwards and
//                throwing fennel and wet-floor signs. Ram him five times before he gets to the warehouse.
//
// World units are metres: s is the distance along the route, lat the offset from the road centre (+ right).
// The camera sits CARZ metres behind your car's rear bumper; the car is drawn as one of the road's "things".
import { createRoad } from './road.js';
import { buildRox, buildCars, buildProps, bubble, scoreText } from './sprites.js';
import * as AU from './audio.js';

const $ = id => document.getElementById(id), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const wrapA = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const canvas = $('c'), params = new URLSearchParams(location.search);

// ------------------------------------------------------------ words (Rox talks a lot)
const SAY = {
  hit: ['AHIOOO!', 'IL MIO FINOCCHIO!', 'MA GUARDA DOVE VAI!', 'LO DICO AL CAPO!', 'OGGI NON TIMBRO!', 'MAMMA MIA!', 'CHI È STATO?!', 'ERA UN FINOCCHIO NUOVO!', 'MI SI SONO ROTTI GLI OCCHIALI!', 'TORNO AL PANORAMA!', 'VOGLIO UN AVVOCATO!', 'NON VALE!'],
  idle: ['CIAO BELLO!', 'C\'È POSTO IN MACCHINA?', 'PRENDO UN ALTRO FINOCCHIO', 'ARRIVO, ARRIVO...', 'SONO IN PAUSA!', 'HAI VISTO LE OFFERTE?', 'OGGI SI LAVORA POCO', 'CHE FAME...'],
  phone: ['PRONTO? SONO AL PANORAMA', 'SÌ CAPO, ARRIVO...', 'MAMMA, HO PRESO I FINOCCHI'],
  eat: ['GNAM! FINOCCHIO!', 'IL FINOCCHIO FA BENE', 'NE VUOI UN PO\'?'],
  cart: ['SPESA DEL GIORNO!', 'C\'ERANO I FINOCCHI IN OFFERTA', 'PERMESSO!'],
  grizzly: ['LAVO IO!', 'PAVIMENTO BAGNATO!', 'ATTENTO AL GRIZZLY!'],
  sleep: ['ZZZ...', 'ZZZ... FINOCCHI... ZZZ'],
  gold: ['ROX D\'ORO!', 'SONO PREZIOSO!'],
  miss: ['SCARSO!', 'MANCO MI HAI VISTO!', 'RITENTA!', 'GUIDI COME MIA NONNA', 'AH AH AH!'],
  horn: ['EH?!', 'CHE C\'È?!', 'CALMA!', 'NON SUONARE!'],
  chase: ['PRENDIMI SE CI RIESCI!', 'VADO A TIMBRARE!', 'IL GRIZZLY NON SI FERMA!', 'FINOCCHI PER TUTTI!', 'PAVIMENTO BAGNATO!', 'CIAO CIAO!', 'TIMBRO PRIMA IO!', 'LENTO!'],
  chaseHit: ['AHIA! IL GRIZZLY!', 'MI HAI RIGATO IL GRIZZLY!', 'NON VALE!', 'LO DICO AL CAPO!', 'BASTA!'],
  chaseHorn: ['NON MI FERMI COL CLACSON!', 'SUONA SUONA...'],
  shortcut: ['SCORCIATOIA!', 'CONOSCO LA STRADA!'],
};
const RANKS = [[0, 'Collega modello (che noia)'], [1, 'Pedone distratto'], [5, 'Apprendista cacciatore di Rox'], [10, 'Cacciatore di Rox'], [20, 'Terrore di Via Salvatorelli'], [30, 'Leggenda della Ferramenta']];

// ------------------------------------------------------------ sizes: the canvas is low-res pixel art, scaled up
const CAM_H = 2.6, HORIZON = 0.46;
const isPortrait = () => innerHeight > innerWidth;
const widthFor = () => isPortrait() ? 240 : clamp(Math.round(H * innerWidth / Math.max(1, innerHeight)), 280, 400);
let road = null, g = null, W = 0, H = 180, CARZ = 7, building = false;
async function makeRoad() {
  building = true; W = widthFor(); H = isPortrait() ? 250 : 180; document.body.classList.toggle('portrait', isPortrait());
  document.documentElement.style.setProperty('--stage-h', `${(100 * H / W).toFixed(2)}vw`);   // portrait: the picture on top, the controls below
  road = await createRoad(canvas, { width: W, height: H, camH: CAM_H, horizon: HORIZON, steer: true });
  g = canvas.getContext('2d'); g.imageSmoothingEnabled = false;
  CARZ = CAM_H * road.FOCAL / (H * 0.955 - Math.round(H * HORIZON));   // the car's rear bumper sits just above the bottom edge
  building = false;
}

// ------------------------------------------------------------ pictures
const faceImg = await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = 'assets/rox/face.png'; });
const ROX = buildRox(faceImg), CARS = buildCars(), PROPS = buildProps();
const PPM = 40;   // pixels per metre of Rox's pictures (he is 2.35 m tall: a bobblehead you can see from afar)
const hmOf = im => im.height / PPM;
const BUB = new Map(), bub = t => { if (!BUB.has(t)) BUB.set(t, bubble(t)); return BUB.get(t); };
const TXT = new Map(), txt = (t, c, k) => { const key = t + c + k; if (!TXT.has(key)) TXT.set(key, scoreText(t, c, k)); return TXT.get(key); };
$('title-face').src = 'assets/rox/face.png';

await makeRoad();
const LEN = road.LEN, FINISH = LEN - 55, BOSS_HP = 5;
const UFP_LANDMARK = road.LMS.some(l => l.qid === 'ufp' && l.art);   // the real warehouse at its real place: then no stand-in   // the clock-in banner; the warehouse stands just after it

// ------------------------------------------------------------ input
const keys = { left: false, right: false, gas: false, brake: false };
let touchMode = matchMedia('(pointer: coarse)').matches;
const KEYMAP = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'gas', w: 'gas', W: 'gas', ArrowDown: 'brake', s: 'brake', S: 'brake' };
addEventListener('keydown', e => {
  if (KEYMAP[e.key]) { keys[KEYMAP[e.key]] = true; touchMode = false; e.preventDefault(); }
  else if (e.key === ' ' || e.key === 'h' || e.key === 'H') { horn(); e.preventDefault(); }
  else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') togglePause();
  else if (e.key === 'Enter' && G.phase === 'end') start(G.mode);
});
addEventListener('keyup', e => { if (KEYMAP[e.key]) keys[KEYMAP[e.key]] = false; });
for (const b of document.querySelectorAll('[data-k]')) {
  const k = b.dataset.k, on = e => { e.preventDefault(); touchMode = true; AU.unlock(); if (k === 'horn') horn(); else keys[k] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch {} };
  const off = () => { if (k !== 'horn') keys[k] = false; b.classList.remove('on'); };
  b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
}
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (G.phase === 'play') togglePause(true); });
document.addEventListener('visibilitychange', () => { if (document.hidden && G.phase === 'play') togglePause(true); });

// ------------------------------------------------------------ the game state
const G = { mode: 'attract', phase: 'menu', live: false };
function reset(mode) {
  const q = road.roadAt(0);
  Object.assign(G, { mode, live: mode !== 'attract', pos: 0, speed: 0, lat: q.rw / 2, camX: q.rw / 2, t: 0, score: 0, combo: 0, comboT: 0, maxCombo: 0, hits: 0, roxes: 0, missed: 0,
    clock: 13 * 3600 + 58 * 60 + 15, deadline: 14 * 3600, crashes: 0, ents: [], parts: [], floats: [], shake: 0, invT: 0, slipT: 0, boostT: 0, hornT: 0, finished: false, endT: 0, result: null,
    nextRox: 70, nextTraffic: 160, nextCoffee: 380, wall: false, braking: false, sayT: 0 });
  G.ents.push({ kind: 'finish', s: FINISH, lat: 0 }, { kind: 'ufp', s: LEN - 8, lat: 0 });
  // the Panorama car park: rows of parked cars on both sides of the lane, noses and tails towards you
  for (let s = 14; s < 236; s += 5.2) for (const sg of [-1, 1]) { if (Math.random() < 0.3) continue; const q2 = road.roadAt(s), front = Math.random() < 0.5;
    G.ents.push({ kind: 'parked', s, lat: sg * (q2.rw + 2.4), img: front ? pick(CARS.front) : pick(CARS.rear) }); }
  if (mode === 'chase') G.ents.push(G.boss = { kind: 'boss', s: 75, lat: q.rw / 2, vs: 0, hp: BOSS_HP, flee: 0, inv: 0, dodgeCool: 0, turbo: 0, turboCool: 0, tgtLat: q.rw / 2, tgtT: 2, dropT: 3, sayT: 1.5, said: null, saidT: 0, lift: 0, vz: 0, rot: 0 });
  else G.boss = null;
}
const carFront = () => G.pos + CARZ + 3.4;
const toast = (t, ms = 1600) => { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('show'), ms); };
const sfx = (k, ...a) => { if (G.live) AU.sfx[k](...a); };

// ------------------------------------------------------------ spawning
function spawnRox(s, forced) {
  const q = road.roadAt(s), rw = q.rw, side = Math.random() < 0.5 ? -1 : 1;
  const type = forced || pick(['walk', 'walk', 'walk', 'wave', 'wave', 'eat', 'eat', 'phone', 'cart', 'cart', 'grizzly', 'sleep', 'sleep', ...(Math.random() < 0.35 ? ['gold'] : [])]);
  const e = { kind: 'rox', type, s, lat: rnd(-rw + 0.8, rw - 0.8), vs: 0, vlat: 0, state: 'idle', t: Math.random() * 3, lift: 0, vz: 0, rot: 0, said: null, saidT: 0, talked: false };
  if (type === 'walk' || type === 'gold' || type === 'phone') { e.lat = side * (rw + 1.6); e.cross = -side * (type === 'gold' ? 3.4 : type === 'phone' ? 1.1 : rnd(1.6, 2.4)); e.trigger = type === 'gold' ? 80 : 50; }
  if (type === 'cart') e.vs = -1.3; if (type === 'grizzly') e.vs = -2.2;
  G.ents.push(e); G.roxes++;
  return e;
}
function spawnTraffic(s) {
  const q = road.roadAt(s); if (q.rw < 3.8) return;   // a lane each way at least
  const r = Math.random();
  if (r < 0.5) G.ents.push({ kind: 'car', s, lat: q.rw / 2 + rnd(-0.3, 0.3), vs: rnd(8, 12), img: pick(CARS.rear), len: 3.8 });
  else if (r < 0.85) G.ents.push({ kind: 'car', s: s + 120, lat: -q.rw / 2 + rnd(-0.3, 0.3), vs: -rnd(10, 14), img: pick(CARS.front), len: 3.8, oncoming: true });
  else G.ents.push({ kind: 'car', s, lat: q.rw / 2, vs: rnd(5, 7), img: CARS.ape, len: 2.8, ape: true });
}
function spawns() {
  const ahead = G.pos + 190;
  if (G.mode !== 'chase') {
    while (G.nextRox < ahead && G.nextRox < FINISH - 90) { spawnRox(G.nextRox); G.nextRox += rnd(34, 70); }
    if (!G.wall && ahead > FINISH - 30) { G.wall = true; const q = road.roadAt(FINISH - 25); ['wave', 'eat', 'phone', 'wave'].forEach((t, i) => { const e = spawnRox(FINISH - 25 - (i % 2) * 3, t); e.lat = (-1.5 + i) * q.rw / 2.2; e.cross = 0; }); }
  }
  while (G.nextTraffic < ahead && G.nextTraffic < LEN - 120) { spawnTraffic(G.nextTraffic); G.nextTraffic += G.mode === 'chase' ? rnd(220, 380) : rnd(130, 240); }
  while (G.nextCoffee < ahead && G.nextCoffee < LEN - 200) { const q = road.roadAt(G.nextCoffee); G.ents.push({ kind: 'coffee', s: G.nextCoffee, lat: rnd(-q.rw + 1, q.rw - 1) }); G.nextCoffee += rnd(330, 460); }
}

// ------------------------------------------------------------ effects
function burst(sx, sy, n, cols) { for (let i = 0; i < n; i++) G.parts.push({ x: sx, y: sy, vx: rnd(-60, 60), vy: rnd(-90, -20), t: rnd(0.5, 1), c: pick(cols) }); }
function float(text, sx, sy, col = '#ffe14a', k = 1) { G.floats.push({ im: txt(text, col, k), x: sx, y: sy, t: 1.1 }); }
function screenOf(e, dy = 0.5) { const s = e.th && e.th.screen; return s ? [s.x, s.y - s.h * dy] : [W / 2, H * 0.5]; }
function say(e, list, dur = 1.6) { e.said = typeof list === 'string' ? list : pick(list); e.saidT = dur; }

function hitRox(e) {
  e.state = 'fly'; e.t = 0; e.vs = G.speed * 1.2 + 7; e.vz = 6 + G.speed * 0.18; e.vlat = (e.lat - G.lat) * 2 + rnd(-2, 2); e.rotV = (Math.random() < 0.5 ? -1 : 1) * rnd(6, 11);
  G.combo = G.comboT > 0 ? G.combo + 1 : 1; G.comboT = 3.5; G.maxCombo = Math.max(G.maxCombo, G.combo); G.hits++;
  const mult = Math.min(8, G.combo), pts = (e.type === 'gold' ? 1000 : e.type === 'grizzly' ? 250 : e.type === 'sleep' ? 150 : 100) * mult; G.score += pts;
  const [x, y] = screenOf(e); float(`+${pts}${mult > 1 ? ' X' + mult : ''}`, x - 10, y - 10, e.type === 'gold' ? '#ffd23a' : '#ffffff', mult > 3 ? 2 : 1);
  burst(x, y, e.type === 'gold' ? 30 : 16, e.type === 'gold' ? ['#ffd23a', '#fff1a0', '#c89a10'] : ['#f0f4e2', '#9ad06a', '#1e1e24', '#d8a088']);
  say(e, e.type === 'gold' ? SAY.gold : SAY.hit, 1.3); G.shake = 0.18;
  if (e.type === 'gold') sfx('gold'); else sfx('hit');
  if (G.combo >= 3 && G.live) toast(G.combo >= 6 ? `${G.combo} DI FILA! STRAGE DI ROX!` : `${G.combo} DI FILA!`, 900);
}
function crash(e) {
  G.invT = 1.6; G.shake = 0.5; G.crashes++; sfx('crash');
  if (e.oncoming || e.kind === 'parked') { G.speed = 0; } else { G.speed = Math.min(G.speed, e.vs) * 0.4; e.vs += 5; }
  G.lat += (G.lat < e.lat ? -1 : 1) * 1.2;
  if (G.mode !== 'chase') { G.clock += 5; float('+5 SEC', W / 2 - 20, H * 0.45, '#ff5a4a', 2); }
  if (G.live) toast(pick(['CHE BOTTA!', 'ASSICURAZIONE!', 'MA CHI TI HA DATO LA PATENTE?']), 1100);
}
function slip(e, wet) {
  G.slipT = 1.1; G.speed *= wet ? 0.5 : 0.6; G.invT = Math.max(G.invT, 0.6); sfx('slip'); e.gone = true;
  const [x, y] = screenOf(e); burst(x, y, 12, wet ? ['#f6ce28', '#202020'] : ['#f0f4e2', '#9ad06a']); float(wet ? 'PAVIMENTO BAGNATO!' : 'SCIVOLONE!', x - 30, y - 16, '#ffe14a');
}
function horn() {
  if (G.phase !== 'play' || G.hornT > 0) return; G.hornT = 0.6; AU.sfx.horn();
  if (G.boss) { if (G.boss.s - carFront() < 120) say(G.boss, SAY.chaseHorn, 1.4); return; }
  for (const e of G.ents) if (e.kind === 'rox' && e.state === 'idle' && e.s - carFront() < 50 && e.s > carFront()) { say(e, SAY.horn, 1); if (!e.vz) e.vz = 3.2; }
}

// ------------------------------------------------------------ one step of the world
function step(dt) {
  const live = G.live, q = road.roadAt(G.pos + CARZ), rw = q.rw, sw = q.sw || 0;
  G.t += dt; if (live && G.phase === 'play' && !G.finished) G.clock += dt;
  // controls: in attract mode a little autopilot hunts the nearest Rox
  let steer = 0, gas = 0, brake = 0;
  if (G.phase === 'play' && !G.finished) {
    steer = (keys.right ? 1 : 0) - (keys.left ? 1 : 0); brake = keys.brake ? 1 : 0; gas = keys.gas || (touchMode && !keys.brake) ? 1 : 0;
  } else if (G.mode === 'attract') {
    let tgt = rw / 2, best = 70; for (const e of G.ents) if (e.kind === 'rox' && e.state === 'idle') { const d = e.s - carFront(); if (d > 0 && d < best) { best = d; tgt = e.lat; } }
    steer = clamp((tgt - G.lat) * 0.8, -1, 1); gas = G.speed < 13 ? 1 : 0;
  } else if (G.finished) brake = 1;
  G.braking = brake > 0;
  // speed
  const off = Math.abs(G.lat) > rw + 0.4, boost = G.boostT > 0, maxV = (off ? 13 : G.mode === 'chase' ? 35 : 33) * (boost ? 1.3 : 1);
  if (brake) G.speed -= 17 * dt; else if (gas) G.speed += (boost ? 13 : 7.5) * (1 - (G.speed / maxV) ** 2) * dt; else G.speed -= (0.8 + G.speed * 0.025) * dt;
  if (G.speed > maxV) G.speed -= (off ? 18 : 8) * dt; if (G.slipT > 0) G.speed -= 6 * dt; G.speed = Math.max(0, G.speed);
  // steering, and the bends pushing you outwards
  const sr = G.slipT > 0 ? 0 : 5.6 * Math.min(1, G.speed / 9 + 0.15) * (G.speed > 0.3 ? 1 : 0);
  const h0 = road.roadAt(G.pos + CARZ).hd, h1 = road.roadAt(G.pos + CARZ + 10).hd, curv = wrapA(h1 - h0) / 10;
  G.lat += (steer * sr + curv * G.speed * G.speed * 0.13) * dt;
  if (G.slipT > 0) { G.slipT -= dt; G.lat += Math.sin(G.t * 22) * 4 * dt; }
  G.lat = clamp(G.lat, -(rw + sw + 1.2), rw + sw + 1.2);
  G.pos = Math.min(LEN - CARZ - 4, G.pos + G.speed * dt);
  G.camX += (G.lat - G.camX) * Math.min(1, dt * 7); road.setCamX(G.camX);
  G.steer = steer; G.gas = gas;
  for (const k of ['invT', 'boostT', 'hornT', 'shake', 'comboT']) G[k] = Math.max(0, G[k] - dt);
  if (G.comboT === 0) G.combo = 0;
  if (off && G.speed > 4) G.shake = Math.max(G.shake, 0.05);

  spawns();
  const front = carFront(), rear = G.pos + CARZ;
  // everything else
  for (const e of G.ents) {
    if (e.saidT > 0) e.saidT -= dt;
    if (e.kind === 'rox') {
      e.t += dt;
      if (e.state === 'idle') {
        if (e.cross != null && e.cross !== 0 && !e.go && e.s - front < e.trigger + G.speed * 0.6) e.go = true;
        if (e.go) e.lat += e.cross * dt;
        e.s += e.vs * dt;
        if (e.vz) { e.lift += e.vz * dt; e.vz -= 16 * dt; if (e.lift <= 0) { e.lift = 0; e.vz = 0; } }
        if (!e.talked && e.s - front < 38 && e.s > front) { e.talked = true; if (Math.random() < 0.55) say(e, SAY[e.type === 'walk' ? 'idle' : e.type === 'wave' ? 'idle' : e.type] || SAY.idle, 1.5); }
        const half = e.type === 'sleep' ? 1.05 : e.type === 'cart' || e.type === 'grizzly' ? 0.6 : 0.4;
        if (e.s >= rear - 0.5 && e.s <= front + 0.3 && Math.abs(e.lat - G.lat) < 0.95 + half) hitRox(e);
        else if (e.s < rear - 1 && !e.missed && Math.abs(e.lat) < rw + 0.5) { e.missed = true; G.missed++; G.combo = 0; G.comboT = 0; if (live && Math.random() < 0.6) { toast('ROX: "' + pick(SAY.miss) + '"', 1100); sfx('miss'); } }
        if (Math.abs(e.lat) > rw + sw + 7 || e.s < G.pos - 10) e.gone = true;
      } else {
        e.s += e.vs * dt; e.lat += e.vlat * dt; e.lift += e.vz * dt; e.vz -= 18 * dt; e.rot += e.rotV * dt; e.vs *= 1 - dt * 0.6;
        if (e.lift < 0) { e.lift = 0; e.vz = Math.abs(e.vz) > 3 ? -e.vz * 0.35 : 0; e.rotV *= 0.5; }
        if (e.t > 2.4) e.gone = true;
      }
    } else if (e.kind === 'parked') {
      if (G.invT <= 0 && Math.abs(e.lat - G.lat) < 1.75 && e.s < front && e.s + 3.8 > rear) crash(e);   // onto the bays: straight into a parked car
    } else if (e.kind === 'car') {
      e.s += e.vs * dt;
      if (G.invT <= 0 && Math.abs(e.lat - G.lat) < 1.75 && e.s < front && e.s + e.len > rear) crash(e);
      if (e.s < G.pos - 20 || e.s > G.pos + 1000) e.gone = true;
    } else if (e.kind === 'fennel' || e.kind === 'wet') {
      if (G.invT <= 0 && Math.abs(e.lat - G.lat) < 1.15 && e.s < front && e.s > rear - 0.5) slip(e, e.kind === 'wet');
      if (e.s < G.pos - 5) e.gone = true;
    } else if (e.kind === 'coffee') {
      if (Math.abs(e.lat - G.lat) < 1.3 && e.s < front && e.s > rear - 0.5) { e.gone = true; G.boostT = 3.5; sfx('pickup'); if (live) toast('CAFFÈ! TURBO!', 1200); const [x, y] = screenOf(e); float('TURBO!', x - 16, y - 10, '#7fe0ff', 1); }
      if (e.s < G.pos - 5) e.gone = true;
    }
  }
  if (G.boss) bossStep(G.boss, dt, rw);
  G.ents = G.ents.filter(e => !e.gone);
  for (const p of G.parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; p.t -= dt; } G.parts = G.parts.filter(p => p.t > 0);
  for (const f of G.floats) { f.y -= 22 * dt; f.t -= dt; } G.floats = G.floats.filter(f => f.t > 0);

  // the end of the road
  if (G.mode === 'attract' && G.pos > LEN - 300) reset('attract');
  if (G.mode === 'investi' && G.phase === 'play' && !G.finished && front >= FINISH) finish();
}

function bossStep(b, dt, rw) {
  const front = carFront(), gap = b.s - front;
  if (G.phase !== 'play' && !G.finished) { b.vs = 0; return; }
  if (b.hp <= 0) { b.s += b.vs * dt; b.vs *= 1 - dt * 1.5; b.lift = Math.max(0, b.lift + b.vz * dt); b.vz -= 18 * dt; b.rot += 5 * dt * (b.lift > 0 ? 1 : 0); return; }
  b.flee = Math.max(0, b.flee - dt); b.inv = Math.max(0, b.inv - dt);
  if (gap < 18 && b.turbo <= 0 && b.turboCool <= 0) { b.turbo = 1.6; b.turboCool = 4; } b.turbo -= dt; b.turboCool -= dt;   // a short burst when you get close, not always
  const want = b.flee > 0 ? 30 : gap > 120 ? 15 : b.turbo > 0 ? 27 : gap > 60 ? 21 : 23.5; b.vs += clamp(want - b.vs, -14 * dt, 7 * dt);
  b.s += b.vs * dt;
  if ((b.tgtT -= dt) <= 0) { b.tgtT = rnd(1.4, 2.8); b.tgtLat = rnd(-rw + 1.1, rw - 1.1); }
  // a side-step when you are about to ram him (not always: he is Rox)
  b.dodgeCool -= dt; if (gap < 11 && gap > 1 && b.dodgeCool <= 0) { b.dodgeCool = 1.6; if (Math.random() < 0.5) { b.tgtLat = clamp(G.lat + (b.lat > G.lat ? 2.8 : -2.8), -rw + 0.9, rw - 0.9); b.tgtT = 1.2; b.dodge = 0.8; } }
  b.dodge = Math.max(0, (b.dodge || 0) - dt); const ls = b.dodge > 0 ? 4.8 : 2.6;
  b.lat += clamp(b.tgtLat - b.lat, -ls * dt, ls * dt); b.lat = clamp(b.lat, -rw + 0.8, rw - 0.8);
  if (b.lift > 0 || b.vz) { b.lift += b.vz * dt; b.vz -= 18 * dt; if (b.lift <= 0) { b.lift = 0; b.vz = 0; } }
  // throwing things behind him
  if ((b.dropT -= dt) <= 0 && gap < 130 && gap > 8) { b.dropT = rnd(1.5, 3) + b.hp * 0.3; /* angrier with every hit */ G.ents.push({ kind: Math.random() < 0.7 ? 'fennel' : 'wet', s: b.s - 1.5, lat: b.lat + rnd(-0.6, 0.6) }); if (Math.random() < 0.4) sfx('taunt'); }
  if ((b.sayT -= dt) <= 0) { b.sayT = rnd(3, 5.5); if (gap < 100) say(b, SAY.chase, 1.8); }
  // rammed
  if (gap < 0.4 && gap > -2.5 && Math.abs(b.lat - G.lat) < 1.7 && G.invT <= 0 && b.inv <= 0) {
    b.hp--; b.flee = 3; b.inv = 3; b.vs = Math.max(b.vs, G.speed) + 6; b.vz = 4; G.speed *= 0.55; G.invT = 0.9; G.shake = 0.3; G.hits++; G.score += 1000;
    sfx('hit'); const [x, y] = screenOf(b); burst(x, y, 22, ['#ec7022', '#344aa0', '#f0f4e2', '#9ad06a']); float(b.hp > 0 ? `COLPITO! ${b.hp} ANCORA` : 'ROX FERMATO!', x - 30, y - 20, '#ffffff', b.hp > 0 ? 1 : 2);
    say(b, SAY.chaseHit, 1.4);
    if (b.hp <= 0) { b.vz = 9; b.vs = G.speed + 8; endChase(true); }
  } else if (gap < -2.5) {   // you got past him: he takes a shortcut and turns up ahead
    b.s = G.pos + CARZ + rnd(60, 90); b.lat = rnd(-rw + 1.2, rw - 1.2); say(b, SAY.shortcut, 1.6); if (G.live) toast('ROX HA PRESO UNA SCORCIATOIA!', 1300);
  }
  if (b.s >= FINISH && b.hp > 0 && G.phase === 'play') endChase(false);
}

// ------------------------------------------------------------ drawing
function roxImg(e) {
  const f = Math.floor(e.t * 4) % 2;
  switch (e.type) {
    case 'walk': return e.go ? (f ? ROX.walk1 : ROX.walk2) : ROX.stand;
    case 'gold': return e.go ? (f ? ROX.goldWalk1 : ROX.goldWalk2) : ROX.gold;
    case 'wave': return Math.floor(e.t * 2.5) % 2 ? ROX.wave : ROX.stand;
    case 'phone': return ROX.phone; case 'eat': return ROX.eat; case 'cart': return ROX.cart; case 'grizzly': return ROX.grizzly; case 'sleep': return ROX.sleep;
    default: return ROX.stand;
  }
}
function things() {
  const out = [], z0 = G.pos;
  const add = (e, img, hm, lift = 0, rot = 0, lat = e.lat, wm) => { const z = e.s - z0; if (z < 0.8 || z > 880) return null; const th = { z, lat, img, hm, lift, rot, wm }; out.push(th); return th; };
  for (const e of G.ents) {
    let th = null;
    if (e.kind === 'rox') { const im = roxImg(e); th = add(e, im, hmOf(im), e.lift, e.rot); if (e.state === 'idle' && e.lift < 0.3) add({ s: e.s + 0.05 }, PROPS.shadow, 0.16, 0, 0, e.lat, im.width / PPM * 1.1); }
    else if (e.kind === 'boss') { const im = Math.floor(G.t * 3) % 2 ? ROX.chase : ROX.chase2; th = add(e, im, hmOf(im) * 1.4, e.lift, e.rot); add({ s: e.s + 0.05 }, PROPS.shadow, 0.25, 0, 0, e.lat, 2.2); }   // the Grizzly XL
    else if (e.kind === 'car') th = add(e, e.img, e.ape ? 1.6 : 1.45);
    else if (e.kind === 'parked') th = add(e, e.img, 1.45);
    else if (e.kind === 'fennel') th = add(e, PROPS.fennel, 0.55);
    else if (e.kind === 'wet') th = add(e, PROPS.wet, 0.8);
    else if (e.kind === 'coffee') th = add(e, PROPS.coffee, 0.5, 0.25 + Math.sin(G.t * 5) * 0.12);
    else if (e.kind === 'finish') { const rw = road.roadAt(e.s).rw; th = add(e, PROPS.finish, 4.4, 0, 0, 0, rw * 2 + 3); }
    else if (e.kind === 'ufp') { if (UFP_LANDMARK) continue; const q = road.roadAt(e.s); th = add(e, PROPS.ufp, 9, 0, 0, q.rw + (q.sw || 2) + 9); }
    e.th = th;
  }
  // your car, with a little roll when you steer, and its shadow
  const car = { z: CARZ, lat: G.lat, img: G.braking ? CARS.youBrake : CARS.you, hm: 1.45, lift: Math.abs(G.shake) > 0.2 ? rnd(0, 0.06) : 0, rot: G.slipT > 0 ? Math.sin(G.t * 22) * 0.15 : G.steer * -0.02 };
  out.push({ z: CARZ + 0.05, lat: G.lat, img: PROPS.shadow, hm: 0.2, wm: 2.2 }, car); G.carTh = car;
  if (G.invT > 0 && G.invT < 1.4 && Math.floor(G.t * 16) % 2) car.alpha = 0.5;
  return out;
}
function overlays() {
  // speech bubbles: the nearest few talkers
  const talk = G.ents.filter(e => e.saidT > 0 && e.th && e.th.screen && e.th.z < 60).sort((a, b) => a.th.z - b.th.z).slice(0, 2);
  for (const e of talk) { const s = e.th.screen, im = bub(e.said); if (s.h < 8) continue; const x = clamp(Math.round(s.x - 8), 1, W - im.width - 1), y = clamp(Math.round(s.y - s.h - im.height - 2), 22, H - im.height - 30); g.drawImage(im, x, y); }
  for (const p of G.parts) { g.fillStyle = p.c; g.fillRect(Math.round(p.x), Math.round(p.y), 2, 2); }
  for (const f of G.floats) { g.globalAlpha = Math.min(1, f.t * 2); g.drawImage(f.im, Math.round(f.x), Math.round(f.y)); g.globalAlpha = 1; }
  if (G.boostT > 0) { g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + G.t * 0.7, r0 = 40 + ((G.t * 300 + i * 37) % 120); g.fillRect(Math.round(W / 2 + Math.cos(a) * r0 * 1.6), Math.round(H * 0.45 + Math.sin(a) * r0 * 0.6), 6, 1); } }
}

// ------------------------------------------------------------ the HUD (HTML, crisp text)
const fmtClock = c => { const h = Math.floor(c / 3600), m = Math.floor(c / 60) % 60, s = Math.floor(c) % 60; return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
const fmtTime = t => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
let hudT = 0;
function hud(now) {
  if (now - hudT < 90) return; hudT = now;
  $('hud').classList.toggle('show', G.live && (G.phase === 'play' || G.phase === 'countdown'));
  if (!G.live) return;
  $('h-score').textContent = String(G.score).padStart(6, '0'); $('h-combo').textContent = G.combo > 1 ? `COMBO X${Math.min(8, G.combo)}` : '';
  $('h-speed').textContent = `${Math.round(G.speed * 3.6)} KM/H`;
  if (G.mode === 'investi') { const left = G.deadline - G.clock; $('h-mid').textContent = fmtClock(G.clock); $('h-mid').classList.toggle('late', left < 0); $('h-mid').classList.toggle('hurry', left >= 0 && left < 20); $('h-sub').textContent = `ROX INVESTITI: ${G.hits}`; }
  else { $('h-mid').textContent = '❤'.repeat(Math.max(0, G.boss.hp)) + '♡'.repeat(BOSS_HP - Math.max(0, G.boss.hp)); $('h-mid').classList.remove('late', 'hurry'); $('h-sub').textContent = `DISTANZA DA ROX: ${Math.max(0, Math.round(G.boss.s - carFront()))} M`; }
  $('p-car').style.left = `${clamp(G.pos / LEN, 0, 1) * 100}%`;
  $('p-rox').style.display = G.boss ? 'block' : 'none'; if (G.boss) $('p-rox').style.left = `${clamp(G.boss.s / LEN, 0, 1) * 100}%`;
  $('btn-pause').style.display = G.phase === 'play' ? 'block' : 'none';
}

// ------------------------------------------------------------ screens
const BEST_KEY = 'rox-best-v3'; /* v3: the 2.2 km route through the Panorama car park, as the owner drives it (v2 was a 1.1 km shortcut) */ let BEST = {}; try { BEST = JSON.parse(localStorage.getItem(BEST_KEY) || '{}'); } catch {}
const saveBest = () => { try { localStorage.setItem(BEST_KEY, JSON.stringify(BEST)); } catch {} };
function showScreen(id) { for (const s of document.querySelectorAll('.screen')) s.classList.toggle('show', s.id === id); }
function menuRecords() {
  $('best-investi').textContent = BEST.investi ? `RECORD: ${BEST.investi.score} PUNTI · ${BEST.investi.hits} ROX` : 'NESSUN RECORD ANCORA';
  $('best-chase').textContent = BEST.chase ? `RECORD: ROX FERMATO IN ${fmtTime(BEST.chase.time)}` : 'NESSUN RECORD ANCORA';
}
function toMenu() { AU.engineOff(); AU.musicStop(); reset('attract'); G.phase = 'menu'; showScreen('menu'); menuRecords(); }
async function start(mode) {
  AU.unlock(); reset(mode); G.phase = 'countdown'; showScreen(null); $('controls').classList.toggle('show', true);
  $('story').innerHTML = mode === 'investi' ? 'Sono le 13:58. Alle 14:00 devi timbrare.<br>Rox è uscito dal Panorama... e si è moltiplicato.<br><b>Investine più che puoi!</b>' : 'Rox ha rubato il Grizzly e corre a timbrare prima di te.<br>Guida al contrario e lancia finocchi.<br><b>Speronalo 5 volte prima della ditta!</b>';
  $('story').classList.add('show'); AU.engineOn(); if (AU.audioState().music) AU.musicStart(mode === 'chase');
  for (const n of [3, 2, 1]) { $('count').textContent = n; $('count').classList.add('show'); AU.sfx.beep(false); await new Promise(r => setTimeout(r, 750)); if (G.mode !== mode) return; }
  $('count').textContent = 'VIA!'; AU.sfx.beep(true); G.phase = 'play'; $('story').classList.remove('show'); setTimeout(() => $('count').classList.remove('show'), 600);
}
function finish() {
  G.finished = true; G.phase = 'ending'; const onTime = G.clock <= G.deadline, left = Math.max(0, G.deadline - G.clock);
  const bonus = onTime ? 1000 + Math.round(left * 50) : 0; G.score += bonus;
  G.result = { onTime, bonus };
  setTimeout(() => endScreen(), 1700); if (onTime) AU.sfx.win(); else AU.sfx.lose();
  toast(onTime ? 'TIMBRATO IN ORARIO!' : 'TIMBRATO IN RITARDO...', 1600);
}
function endChase(won) {
  G.finished = true; G.phase = 'ending'; G.result = { won, time: G.t };
  if (won) { G.score += Math.max(0, Math.round(6000 - G.t * 30)); AU.sfx.win(); toast('ROX È STATO FERMATO!', 1600); } else { AU.sfx.lose(); toast('ROX HA TIMBRATO PRIMA DI TE!', 1600); }
  setTimeout(() => endScreen(), 1900);
}
function endScreen() {
  AU.engineOff(); AU.musicStop(); G.phase = 'end'; $('controls').classList.remove('show'); showScreen('end');
  let title, lines, rec = false;
  if (G.mode === 'investi') {
    const rank = [...RANKS].reverse().find(r => G.hits >= r[0])[1];
    title = G.result.onTime ? 'TIMBRATO!' : 'IN RITARDO!';
    lines = [`Timbrato alle <b>${fmtClock(G.clock)}</b>${G.result.onTime ? ` · bonus puntualità +${G.result.bonus}` : ' · il capo ti ha visto'}`,
      `Rox investiti: <b>${G.hits}</b> su ${G.roxes} · combo massima <b>x${Math.min(8, G.maxCombo)}</b>`,
      `Incidenti: ${G.crashes}`, `Titolo: <b>${rank}</b>`];
    if (!BEST.investi || G.score > BEST.investi.score) { BEST.investi = { score: G.score, hits: G.hits }; saveBest(); rec = true; }
    $('end-share').dataset.text = `Ho investito ${G.hits} Rox tornando dal Panorama (${G.score} punti, ${rank}). Prova tu!`;
  } else {
    title = G.result.won ? 'ROX FERMATO!' : 'ROX HA TIMBRATO!';
    lines = G.result.won ? [`L'hai fermato in <b>${fmtTime(G.result.time)}</b>`, 'Il Grizzly è sotto sequestro.', 'Rox oggi pulisce i bagni.'] : ['Rox è arrivato in ditta prima di te.', `Gli hai tolto <b>${BOSS_HP - G.boss.hp}</b> cuori su ${BOSS_HP}.`, 'Ora lo racconterà a tutti per una settimana.'];
    if (G.result.won && (!BEST.chase || G.result.time < BEST.chase.time)) { BEST.chase = { time: G.result.time }; saveBest(); rec = true; }
    $('end-share').dataset.text = G.result.won ? `Ho fermato Rox sul Grizzly in ${fmtTime(G.result.time)}! Prova tu!` : 'Rox mi ha battuto col Grizzly... vendicami!';
  }
  $('end-title').textContent = title; $('end-score').textContent = `${G.score} PUNTI${rec ? ' · NUOVO RECORD!' : ''}`; $('end-lines').innerHTML = lines.map(l => `<p>${l}</p>`).join('');
}
function togglePause(force) {
  if (G.phase === 'play' && (force === true || force === undefined)) { G.phase = 'paused'; showScreen('pause'); AU.engineOff(); }
  else if (G.phase === 'paused' && force !== true) { G.phase = 'play'; showScreen(null); AU.engineOn(); }
}
$('btn-investi').onclick = () => start('investi'); $('btn-chase').onclick = () => start('chase');
$('btn-howto').onclick = () => showScreen('howto'); $('btn-howto-back').onclick = () => showScreen('menu');
$('btn-resume').onclick = () => togglePause(); $('btn-quit').onclick = toMenu; $('btn-pause').onclick = () => togglePause();
$('end-again').onclick = () => start(G.mode); $('end-menu').onclick = toMenu;
$('end-share').onclick = async () => { const text = $('end-share').dataset.text + ' ' + location.href.split('?')[0]; try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast('COPIATO! INCOLLALO NEL GRUPPO', 1500); } } catch {} };
const syncAudioBtns = () => { const s = AU.audioState(); $('btn-sound').textContent = `SUONI: ${s.sound ? 'SI' : 'NO'}`; $('btn-music').textContent = `MUSICA: ${s.music ? 'SI' : 'NO'}`; };
$('btn-sound').onclick = () => { AU.unlock(); AU.setSound(!AU.audioState().sound); syncAudioBtns(); }; $('btn-music').onclick = () => { AU.unlock(); AU.setMusic(!AU.audioState().music); syncAudioBtns(); }; syncAudioBtns();
addEventListener('pointerdown', () => AU.unlock(), { once: true });

// credits: the data licences require them to stay visible
$('credits').innerHTML = 'Mappa © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL) · Percorso: OSRM · Altimetria: Terrain Tiles (Mapzen, AWS) · Motore: <a href="https://github.com/jonwheatley/pixel-path" target="_blank" rel="noopener">Pixel Path</a> (MIT)';

// ------------------------------------------------------------ the loop
let last = performance.now(), resizeT = null;
addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(async () => { if ((widthFor() === W && (isPortrait() ? 250 : 180) === H) || building) return; await makeRoad(); }, 300); });
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!building) {
    road.streamAround(G.pos);
    if (road.ready(G.pos)) {
      if (G.phase !== 'paused' && G.phase !== 'end') step(G.phase === 'countdown' ? 0 : dt);
      else if (G.phase === 'end') { G.t += dt; }
      if (G.phase === 'countdown') { road.setCamX(G.camX); }
      road.T.now += dt; road.render(G.pos, G.speed, things()); overlays();
      if (G.live && G.phase === 'play') AU.engineSet(G.speed, G.gas);
      canvas.style.transform = G.shake > 0 ? `translate(${rnd(-1, 1) * G.shake * 14}px, ${rnd(-1, 1) * G.shake * 10}px)` : '';
    }
  }
  hud(now);
  requestAnimationFrame(frame);
}
reset('attract'); G.phase = 'menu'; showScreen(params.get('screen') || 'menu'); menuRecords();
requestAnimationFrame(frame);
if (params.get('mode')) start(params.get('mode'));

// for tests and recordings
window.__rox = { G, get road() { return road; }, start, keys, ROX, CARS, PROPS, step, get CARZ() { return CARZ; } };
