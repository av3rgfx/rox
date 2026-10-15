// staff.js: the fighters of ROX KOMBAT (game/kombat.js) and their pictures, drawn by code at load like Rox's.
//
// ROSTER is where UFP's colleagues go. For now, apart from Rox, they are ROLES (the warehouseman, the forklift driver,
// the salesman, accounts, the boss), never a guess at a real person: their faces are drawn by code and say so on the
// select screen. To turn one into a real colleague: set `name`, put a photo of the face cut out like Rox's (transparent
// round the head, upright, about 3:4, e.g. assets/staff/mario.png) in `photo`, and change the colours, the lines and
// the special move if you like (`special` is one of kombat.js's SPECIALS). With a photo the fighter keeps the same face
// in every pose (the grin and the "ouch" are made only for Rox's photo, whose features were measured by hand).
import { outline, rotated, tinted, prepFace, faceVar } from './sprites.js';
import { pixelText, textW } from './font.js';

const canv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const ctxOf = c => { const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return x; };
const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const shade = (c, k) => c.map(v => Math.max(0, Math.min(255, v * k)));

const SKIN = [214, 162, 138], BLACK = [30, 30, 36], KHAKI = [124, 112, 76], WORK = [44, 54, 92], GREY = [96, 98, 108], NAVY = [36, 46, 86];
export const ROSTER = [
  { id: 'rox', name: 'ROX', role: 'IL 50 NON SI TOCCA', special: 'fennel', move: 'PIOGGIA DI FINOCCHI', real: true,
    look: { shirt: BLACK, logo: true, legs: 'shorts', legCol: KHAKI, shoe: [64, 64, 72], belly: 1 },
    lines: { intro: ['IL 50 NON SI TOCCA!', 'HO MANGIATO IL FINOCCHIO: SONO CARICO!', 'TI ASPETTAVO, COLLEGA!', 'OGGI NON TIMBRO, COMBATTO!'], win: ['FINOCCHIO POWER!', 'TORNA AL PANORAMA!', 'IL 50 VINCE SEMPRE!', 'E ORA UN CAFFÈ!'], hit: ['AHIA!', 'IL MIO FINOCCHIO!', 'LO DICO AL CAPO!', 'NON VALE!', 'MAMMA MIA!'] } },
  { id: 'magazziniere', name: 'IL MAGAZZINIERE', role: 'SEGNAPOSTO: SERVE LA FOTO', special: 'tape', move: 'NASTRO ADESIVO',
    look: { shirt: BLACK, logo: true, legs: 'trousers', legCol: WORK, shoe: [34, 34, 38], toe: true, belly: 0 },
    face: { skin: [222, 172, 140], hair: [70, 48, 30], style: 'short', hat: 'hard', stubble: true },
    lines: { intro: ['TI METTO IN BOLLA!', 'OGGI TI IMBALLO!', 'MERCE IN ARRIVO!'], win: ['IMBALLATO E SPEDITO!', 'FIRMA LA BOLLA!', 'RESO NON ACCETTATO!'], hit: ['EHI, LA MERCE!', 'OCCHIO AL MAGAZZINO!', 'AHI!'] } },
  { id: 'mulettista', name: 'IL MULETTISTA', role: 'SEGNAPOSTO: SERVE LA FOTO', special: 'pallet', move: 'BANCALE DALL\'ALTO',
    look: { shirt: [70, 74, 84], vest: true, legs: 'trousers', legCol: WORK, shoe: [34, 34, 38], toe: true, belly: 1 },
    face: { skin: [206, 150, 116], hair: [40, 32, 28], style: 'short', hat: 'cap', beard: [52, 40, 32] },
    lines: { intro: ['ATTENTO, MULETTO IN MANOVRA!', 'BEEP BEEP BEEP!', 'TI CARICO SULLE FORCHE!'], win: ['CARICO SCARICATO!', 'BANCALE CONSEGNATO!', 'PARCHEGGIATO!'], hit: ['IL MIO MULETTO!', 'AHI, LE FORCHE!', 'PRECEDENZA!'] } },
  { id: 'commerciale', name: 'IL COMMERCIALE', role: 'SEGNAPOSTO: SERVE LA FOTO', special: 'catalog', move: 'CATALOGO NUOVO',
    look: { shirt: NAVY, jacket: true, tie: [190, 40, 46], legs: 'trousers', legCol: NAVY, shoe: [70, 40, 26], belly: 0, sleeve: NAVY },
    face: { skin: [226, 176, 146], hair: [36, 28, 24], style: 'slick' },
    lines: { intro: ['TI FACCIO UN PREVENTIVO!', 'HO UN\'OFFERTA PER TE!', 'PRONTO? SÌ, ARRIVO SUBITO!'], win: ['AFFARE CHIUSO!', 'FIRMA QUI, GRAZIE!', 'IL CLIENTE È SODDISFATTO!'], hit: ['TI RICHIAMO!', 'SCONTO DEL 50!', 'LA CRAVATTA NO!'] } },
  { id: 'amministrazione', name: 'L\'AMMINISTRAZIONE', role: 'SEGNAPOSTO: SERVE LA FOTO', special: 'receipt', move: 'SCONTRINO INFINITO',
    look: { shirt: [122, 70, 140], cardigan: true, legs: 'trousers', legCol: GREY, shoe: [40, 34, 40], belly: 0, sleeve: [122, 70, 140] },
    face: { skin: [232, 186, 158], hair: [150, 70, 40], style: 'long', glasses: true, lips: true },
    lines: { intro: ['LA FATTURA È SCADUTA!', 'HAI TIMBRATO?', 'TI FACCIO I CONTI IN TASCA!'], win: ['CONTI IN ORDINE!', 'PAGATO E QUIETANZATO!', 'TUTTO A BILANCIO!'], hit: ['LA CONTABILITÀ NON SI TOCCA!', 'TI TOLGO DALLA BUSTA PAGA!', 'AHI, GLI OCCHIALI!'] } },
  { id: 'capo', name: 'IL CAPO', role: 'SEGNAPOSTO: SERVE LA FOTO', special: 'office', move: 'NEL MIO UFFICIO!',
    look: { shirt: [236, 236, 230], tie: [150, 30, 36], legs: 'trousers', legCol: [52, 52, 60], shoe: [30, 26, 24], belly: 2, sleeve: [236, 236, 230] },
    face: { skin: [218, 160, 132], hair: [176, 176, 172], style: 'bald', moustache: [150, 150, 146] },
    lines: { intro: ['NEL MIO UFFICIO, SUBITO!', 'ALLE 14:30 SI LAVORA!', 'CHI HA TIMBRATO TARDI?'], win: ['E ORA AL LAVORO!', 'DOMANI TUTTI IN STRAORDINARIO!', 'RIUNIONE ALLE 8!'], hit: ['A ME?!', 'IO SONO IL CAPO!', 'TI TAGLIO LE FERIE!'] } },
];
// the last fighter of the tower when you are Rox: Rox again, in gold (like the golden Rox on the road)
export const GOLD = { id: 'oro', name: 'ROX D\'ORO', role: 'EDIZIONE LIMITATA', special: 'fennel', move: 'PIOGGIA DI FINOCCHI D\'ORO', real: true, gold: true,
  lines: { intro: ['SONO IL ROX ORIGINALE!', 'VALGO 50 FINOCCHI!', 'CHI È IL VERO ROX?'], win: ['L\'ORO VINCE SEMPRE!', 'EDIZIONE LIMITATA!', 'BRILLO!'], hit: ['MI RIGHI L\'ORO!', 'AHIA, SONO PREZIOSO!'] } };

// ------------------------------------------------------------ a face drawn by code, 38 x 44 like Rox's (faceVar's canvas)
// skin, a jaw, ears, eyes, brows, nose and mouth by expression (calm, grin, ouch); hair by style (short, slick, long, bald);
// a hard hat or a cap; glasses, beard, stubble, moustache
function drawFace(f, expr) {
  const c = canv(38, 44), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); }, P = (a, b, col) => R(a, b, 1, 1, col);
  const SK = f.skin, SKD = shade(SK, 0.84), SKL = shade(SK, 1.07), DARK = [40, 24, 22], LIP = [160, 70, 64], WHITE = [246, 242, 232], HAIR = f.hair, HAIRD = shade(HAIR, 0.72), HAIRL = shade(HAIR, 1.25);
  const hw = y => y < 10 ? 9 + (y - 5) : y < 30 ? 14 : 14 - (y - 30) * 0.58;   // half width of the head, row by row (a rounded top, a chin)
  if (f.style === 'long') for (let y = 6; y < 44; y++) { const w = Math.round(Math.min(17, hw(Math.min(y, 29)) + 3)); R(19 - w, y, w * 2, 1, y > 38 ? HAIRD : HAIR); }   // long hair behind the head
  for (let y = 5; y < 44; y++) { const w = Math.round(hw(y)); R(19 - w, y, w * 2, 1, SK); R(19 - w, y, 2, 1, SKD); R(19 + w - 1, y, 1, 1, SKD); }
  R(3, 21, 3, 8, SK); R(32, 21, 3, 8, SK); R(4, 23, 1, 4, SKD); R(33, 23, 1, 4, SKD);   // ears
  R(9, 28, 4, 2, SKL); R(25, 28, 4, 2, SKL);   // cheeks
  if (f.stubble) for (let y = 30; y < 43; y++) for (let xx = 6; xx < 33; xx++) if ((xx + y) % 2 === 0 && Math.abs(xx - 19) < hw(y) - 1.5 && (y > 37 || Math.abs(xx - 19) > 6)) P(xx, y, shade(SK, 0.86));   // a day's beard, round the mouth
  if (f.beard) for (let y = 29; y < 44; y++) { const w = Math.round(hw(y)); R(19 - w, y, w * 2, 1, f.beard); }
  // eyes and brows
  const brow = f.style === 'bald' ? shade(HAIR, 0.8) : HAIRD, eyeY = 22;
  if (expr === 'ouch') { R(10, eyeY - 1, 5, 4, WHITE); R(23, eyeY - 1, 5, 4, WHITE); R(12, eyeY, 2, 2, DARK); R(25, eyeY, 2, 2, DARK); R(10, eyeY - 5, 6, 2, brow); R(22, eyeY - 5, 6, 2, brow); }
  else { R(10, eyeY, 5, 2, WHITE); R(23, eyeY, 5, 2, WHITE); R(12, eyeY, 2, 2, DARK); R(25, eyeY, 2, 2, DARK); R(10, eyeY + 2, 5, 1, SKD); R(23, eyeY + 2, 5, 1, SKD);
    if (expr === 'grin') for (let i = 0; i < 6; i++) { P(9 + i, eyeY - 4 + (i >> 1), brow); P(9 + i, eyeY - 3 + (i >> 1), brow); P(28 - i, eyeY - 4 + (i >> 1), brow); P(28 - i, eyeY - 3 + (i >> 1), brow); }   // angry brows
    else { R(10, eyeY - 3, 6, 2, brow); R(22, eyeY - 3, 6, 2, brow); } }
  if (f.glasses) { const G2 = [60, 40, 70]; for (const gx of [9, 22]) { R(gx, eyeY - 2, 8, 1, G2); R(gx, eyeY + 3, 8, 1, G2); R(gx, eyeY - 2, 1, 6, G2); R(gx + 7, eyeY - 2, 1, 6, G2); } R(17, eyeY - 1, 5, 1, G2); R(5, eyeY - 1, 4, 1, G2); R(30, eyeY - 1, 4, 1, G2); }
  R(18, 24, 2, 6, SKD); R(17, 29, 4, 1, shade(SK, 0.7)); R(20, 25, 1, 3, SKL);   // the nose
  if (f.moustache) { R(13, 31, 12, 2, f.moustache); P(12, 32, f.moustache); P(25, 32, f.moustache); P(12, 33, f.moustache); P(25, 33, f.moustache); }
  // the mouth
  if (expr === 'ouch') { for (let y = 31; y <= 39; y++) for (let xx = 15; xx <= 23; xx++) { const e = ((xx - 19) / 3.6) ** 2 + ((y - 35) / 4.2) ** 2; if (e < 1) P(xx, y, e > 0.6 ? LIP : y > 37 ? [196, 74, 70] : [44, 14, 14]); } }
  else if (expr === 'grin') { R(12, 34, 14, 4, DARK); R(13, 35, 12, 2, WHITE); for (const xx of [15, 18, 21]) R(xx, 35, 1, 2, [180, 172, 160]); }
  else { R(14, 35, 10, 1, f.lips ? [196, 70, 80] : LIP); P(13, 34, LIP); P(24, 34, LIP); if (f.lips) R(15, 36, 8, 1, [214, 104, 110]); }
  // hair on top
  if (f.style === 'short') { for (let y = 3; y < 12; y++) { const w = Math.round(hw(Math.max(5, y)) + 1); R(19 - w, y, w * 2, 1, HAIR); } for (let xx = 6; xx < 33; xx += 3) R(xx, 12, 2, 1 + (xx % 2), HAIR); R(4, 12, 3, 9, HAIR); R(31, 12, 3, 9, HAIR); R(12, 5, 8, 1, HAIRL); }
  if (f.style === 'slick') { for (let y = 2; y < 13; y++) { const w = Math.round(hw(Math.max(5, y)) + 1); R(19 - w, y, w * 2, 1, HAIR); } R(4, 12, 3, 7, HAIR); R(31, 12, 3, 7, HAIR); R(13, 2, 1, 10, SKD); R(15, 4, 14, 1, HAIRL); R(16, 7, 12, 1, HAIRL); R(14, 12, 18, 1, HAIR); }   // a side parting, shiny
  if (f.style === 'long') { for (let y = 2; y < 13; y++) { const w = Math.round(hw(Math.max(5, y)) + 2); R(19 - w, y, w * 2, 1, HAIR); } for (let i = 0; i < 9; i++) R(8 + i * 2, 12 + (i >> 1), 3, 2, HAIR); R(3, 12, 4, 18, HAIR); R(31, 12, 4, 18, HAIR); R(14, 4, 9, 1, HAIRL); }   // a fringe swept to one side
  if (f.style === 'bald') { R(4, 13, 4, 12, HAIR); R(30, 13, 4, 12, HAIR); R(5, 11, 3, 2, HAIR); R(30, 11, 3, 2, HAIR); R(14, 7, 10, 2, SKL); }   // grey at the sides, a shiny top
  if (f.hat === 'hard') { const H = [252, 206, 30], HD = [206, 156, 14]; for (let y = 0; y < 10; y++) { const w = Math.round(Math.min(14, 7 + y * 1.3)); R(19 - w, y, w * 2, 1, H); } R(18, 0, 2, 10, HD); R(13, 2, 4, 1, [255, 240, 150]); R(2, 10, 34, 3, HD); R(2, 10, 34, 1, H); }
  if (f.hat === 'cap') { const H = [226, 100, 30], HD = shade(H, 0.75); for (let y = 1; y < 11; y++) { const w = Math.round(Math.min(15, 8 + y * 1.2)); R(19 - w, y, w * 2, 1, H); } R(18, 1, 2, 10, HD); R(5, 10, 28, 3, [40, 40, 46]); R(5, 10, 28, 1, [80, 80, 90]); pixelText(x, '50', 14, 3, '#fff4e0'); }   // UFP's "50" on the cap
  return c;
}

// ------------------------------------------------------------ the body: Rox's (40 x 92, a bobblehead) with joints, so it can fight
// Local coordinates: Rox's body box, feet on row 91, facing right (the front arm and leg are the right ones). A pose:
// dy lowers the upper body (crouching), dx leans it; arms are [elbow, hand] from the shoulders, legs [knee, foot] from the hips.
const POSES = {
  idle1: { arms: [[4, 58, 10, 47], [38, 58, 41, 46]], legs: [[11, 85, 9, 91], [30, 85, 32, 91]] },
  idle2: { dy: 1, arms: [[4, 59, 10, 48], [38, 59, 41, 47]], legs: [[11, 85, 9, 91], [30, 85, 32, 91]] },
  walk1: { arms: [[4, 58, 10, 47], [38, 58, 41, 46]], legs: [[9, 85, 5, 91], [32, 85, 36, 91]] },
  walk2: { dy: 1, arms: [[4, 59, 10, 48], [38, 59, 41, 47]], legs: [[15, 86, 16, 91], [25, 86, 24, 91]] },
  jump: { arms: [[2, 50, 6, 40], [40, 50, 44, 40]], legs: [[10, 83, 14, 88], [33, 81, 30, 88]], face: 'grin' },
  jkick: { arms: [[4, 56, 10, 47], [38, 52, 40, 44]], legs: [[11, 83, 16, 88], [42, 80, 60, 84]], face: 'grin' },
  crouch: { dy: 16, arms: [[4, 74, 10, 63], [38, 74, 41, 62]], legs: [[5, 84, 9, 91], [37, 83, 33, 91]] },
  punch: { dx: 2, arms: [[6, 58, 12, 48], [46, 47, 60, 45]], legs: [[9, 85, 5, 91], [31, 85, 35, 91]], face: 'grin' },
  kick: { dx: -2, arms: [[2, 57, -2, 64], [38, 56, 42, 47]], legs: [[13, 85, 12, 91], [41, 76, 60, 72]], face: 'grin' },
  upper: { dy: 4, arms: [[6, 62, 9, 70], [42, 36, 44, 18]], legs: [[12, 86, 10, 91], [30, 86, 31, 91]], face: 'grin' },
  sweep: { dy: 16, arms: [[3, 74, 1, 86], [36, 72, 40, 62]], legs: [[6, 84, 9, 91], [42, 90, 62, 91]], face: 'grin' },
  block: { arms: [[4, 57, 30, 47], [39, 58, 14, 46]], legs: [[11, 85, 7, 91], [30, 85, 32, 91]] },
  hit: { dx: -3, arms: [[0, 50, -3, 40], [41, 52, 47, 42]], legs: [[10, 85, 6, 91], [28, 85, 30, 91]], face: 'ouch' },
  dazed: { dx: 1, dy: 2, arms: [[5, 62, 6, 72], [36, 62, 36, 72]], legs: [[12, 85, 11, 91], [29, 85, 31, 91]], face: 'ouch' },
  win: { arms: [[3, 36, 4, 23], [38, 36, 37, 23]], legs: [[11, 85, 9, 91], [30, 85, 32, 91]], face: 'grin' },
  special: { dx: 2, arms: [[2, 56, -2, 48], [46, 42, 57, 32]], legs: [[9, 85, 5, 91], [31, 85, 35, 91]], face: 'grin' },
  flat: { arms: [[-1, 50, -4, 40], [42, 50, 46, 40]], legs: [[10, 85, 8, 91], [30, 85, 32, 91]], face: 'ouch' },   // drawn lying down ('down')
};
export const POSE_NAMES = Object.keys(POSES);
const OX = 16, OY = 6;   // where the body box sits in its 84 x 100 canvas (room for a punch, a kick, a raised fist)

// flip: facing left. Drawn mirrored shape by shape, so the "50" on the shirt still reads (and the face is not mirrored)
function body(look, faces, pose, flip) {
  const P = POSES[pose], dy = P.dy || 0, dx = P.dx || 0, c = canv(84, 100), x = ctxOf(c), CW = c.width;
  const R = (a, b, w, h, col) => { const X = Math.round(OX + a), ww = Math.round(w); x.fillStyle = rgb(col); x.fillRect(flip ? CW - X - ww : X, Math.round(OY + b), ww, Math.round(h)); };
  const text = (t, a, b, col) => pixelText(x, t, flip ? CW - (OX + a) - textW(t) : OX + a, OY + b, col, 1);
  const seg = (x0, y0, x1, y1, w, col) => { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))); for (let i = 0; i <= n; i++) R(x0 + (x1 - x0) * i / n - w / 2, y0 + (y1 - y0) * i / n - w / 2, w, w, col); };
  const skin = look.skin || SKIN, skinD = shade(skin, 0.82), shirt = look.shirt, shirtL = shade(shirt, 1.35), legC = look.legCol, legD = shade(legC, 0.78), sleeve = look.sleeve || shirt;
  // legs (back one first) and shoes, pointing the way he faces
  const hips = [[14, 79 + dy], [27, 79 + dy]];
  P.legs.forEach(([kx, ky, fx, fy], i) => { const [hx, hy] = hips[i], shorts = look.legs === 'shorts';
    if (shorts) { const mx = hx + (kx - hx) * 0.55, my = hy + (ky - hy) * 0.55; seg(hx, hy, mx, my, 8, legC); seg(mx, my, kx, ky, 6, skin); seg(kx, ky, fx, fy - 2, 6, skin); }
    else { seg(hx, hy, kx, ky, 8, legC); seg(kx, ky, fx, fy - 2, 7, legC); R(fx - 3, fy - 4, 1, 2, legD); }
    const side = Math.abs(fx - kx) > Math.abs(fy - ky) + 2;   // a kick: the shoe stands up, its sole to the front
    if (side) { R(fx - 1, fy - 6, 5, 11, look.shoe); R(fx + 4, fy - 6, 1, 11, [222, 222, 214]); if (look.toe) R(fx, fy + 2, 4, 3, [120, 122, 130]); }
    else { R(fx - 4, fy - 3, 11, 4, look.shoe); R(fx - 4, fy, 11, 1, look.toe ? [96, 96, 100] : [222, 222, 214]); if (look.toe) R(fx + 3, fy - 3, 4, 3, [120, 122, 130]); } });
  // the hips: shorts or trousers
  R(8, 67 + dy, 25, Math.min(12, 92 - 67 - dy - 4), legC); R(8, 67 + dy, 25, 2, legD); if (look.legs === 'shorts') { R(9, 71 + dy, 4, 5, legD); R(28, 71 + dy, 4, 5, legD); } else R(19, 70 + dy, 2, 6, legD);
  // the back arm, behind the body
  const sh = [[7, 48 + dy], [34, 48 + dy]], arm = (i, [ex, ey, hx, hy]) => { const [sx, sy] = sh[i], long = !!look.sleeve && look.sleeve !== shirt || look.jacket || look.cardigan;
    const mx = sx + (ex - sx) * 0.5, my = sy + (ey - sy) * 0.5; seg(sx, sy, mx, my, 7, sleeve); seg(mx, my, ex, ey, 5, long ? sleeve : skin); seg(ex, ey, hx, hy, 5, long ? sleeve : skin);
    if (long) R(hx - 3, hy - 3, 6, 2, shade(sleeve, 0.8)); R(hx - 3, hy - 3, 6, 6, skin); R(hx - 3, hy + 1, 6, 1, skinD); };
  arm(0, P.arms[0]);
  // the torso (a belly), the neck
  const bx = dx; R(bx + 7, 45 + dy, 27, 23, shirt); if (look.belly) R(bx + 5 - (look.belly - 1) * 2, 54 + dy, 31 + (look.belly - 1) * 4, 12, shirt); R(bx + 6, 52 + dy, 29, 3, shirt);
  R(bx + 9, 47 + dy, 3, 18, shirtL); R(bx + 15, 44 + dy, 11, 2, shirtL);
  if (look.logo) { text('50', bx + 18, 49 + dy, '#f4f0e6'); R(bx + 17, 57 + dy, 12, 1, [200, 40, 40]); }   // a little left of where Rox has it: the guard arm covers less
  if (look.vest) { const V = [214, 232, 40], VD = [170, 186, 30]; R(bx + 6, 46 + dy, 11, 21, V); R(bx + 24, 46 + dy, 11, 21, V); R(bx + 6, 46 + dy, 1, 21, VD);
    for (const yy of [55, 61]) { R(bx + 6, yy + dy, 11, 2, [210, 214, 220]); R(bx + 24, yy + dy, 11, 2, [210, 214, 220]); } text('50', bx + 7, 48 + dy, '#3a3c20'); }   // on the left panel: the front arm covers the right one
  if (look.jacket) { R(bx + 16, 45 + dy, 9, 12, [244, 244, 238]); R(bx + 14, 45 + dy, 3, 9, shade(shirt, 1.3)); R(bx + 24, 45 + dy, 3, 9, shade(shirt, 1.3)); for (const yy of [59, 63]) R(bx + 21, yy + dy, 2, 2, [200, 190, 150]); }
  if (look.cardigan) { R(bx + 16, 45 + dy, 9, 21, [244, 240, 236]); R(bx + 15, 45 + dy, 1, 21, shade(shirt, 0.75)); R(bx + 25, 45 + dy, 1, 21, shade(shirt, 0.75)); for (const yy of [50, 56, 62]) R(bx + 26, yy + dy, 2, 2, [230, 220, 160]); }
  if (look.tie) { R(bx + 19, 45 + dy, 3, 3, look.tie); R(bx + 19, 48 + dy, 4, 13, look.tie); R(bx + 20, 61 + dy, 2, 2, look.tie); R(bx + 19, 48 + dy, 1, 13, shade(look.tie, 0.75)); }
  R(bx + 16, 41 + dy, 9, 5, skinD);
  arm(1, P.arms[1]);
  // the head: the face, a bobblehead
  const fc = faces[P.face || 'calm']; x.drawImage(fc, flip ? CW - (OX + 1 + dx) - fc.width : OX + 1 + dx, OY + dy);
  return c;
}

// ------------------------------------------------------------ all of it
// Each fighter: R (facing right) and L (facing left) canvases for every pose, a lying one ('down'), and the face for the
// select screen. ax: where the feet are, from the left of the picture.
const loadImg = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const goldOf = im => tinted(im, (r, g, b) => { const l = (r + g + b) / 3; return [Math.min(255, 90 + l * 0.9), Math.min(255, 66 + l * 0.75), Math.max(0, l * 0.25)]; });
export async function buildFighters(ROX) {
  const out = {};
  for (const d of [...ROSTER, GOLD]) {
    let faces;
    if (d.id === 'rox' || d.gold) faces = ROX.faces;
    else if (d.photo) { const im = await loadImg(d.photo); const f = im && faceVar(prepFace(im, 34, 44), 'calm'); faces = f ? { calm: f, grin: f, ouch: f } : null; }
    if (!faces) faces = { calm: drawFace(d.face, 'calm'), grin: drawFace(d.face, 'grin'), ouch: drawFace(d.face, 'ouch') };
    const look = d.gold ? ROSTER[0].look : d.look, F = { R: {}, L: {}, def: d };
    for (const p of POSE_NAMES) for (const side of ['R', 'L']) { let im = outline(body(look, faces, p, side === 'L')); if (d.gold) im = goldOf(im); F[side][p] = im; }
    F.R.down = rotated(F.R.flat, 3); F.L.down = rotated(F.L.flat, 1);   // on his back, head away from you
    F.face = outline(d.gold ? goldOf(faces.calm) : faces.calm); F.ax = OX + 20 + 1;
    out[d.id] = F;
  }
  return out;
}
