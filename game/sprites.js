// sprites.js: every picture of the game that is not scenery, drawn by code at load time, pixel by pixel.
//
//   ROX        his real face (assets/rox/face.png, cut from a photo) on a pixel-art body: black company T-shirt
//              with the "50" logo, khaki shorts, trainers. A bobblehead on purpose: the face must read at 20 px.
//              Poses and props: standing, waving, walking, on the phone, eating a fennel, pushing a Panorama
//              trolley, pushing the Grizzly floor scrubber, riding it backwards (the chase), asleep, golden.
//   CARS       your car from behind (a boxy little Italian hatchback), traffic from behind and from the front,
//              a Piaggio Ape
//   PROPS      fennel, the "wet floor" sign, an espresso cup, the finish banner, the Utensilferramenta warehouse
//
// Every picture gets a one-pixel dark outline so it stands out from the street at any size.
import { pixelText, textW } from './font.js';

const canv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const ctxOf = c => { const x = c.getContext('2d'); x.imageSmoothingEnabled = false; return x; };
const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const shade = (c, k) => c.map(v => Math.max(0, Math.min(255, v * k)));

// a one-pixel outline around everything opaque
export function outline(src, col = [24, 18, 22]) {
  const w = src.width + 2, h = src.height + 2, c = canv(w, h), x = ctxOf(c); x.drawImage(src, 1, 1);
  const id = x.getImageData(0, 0, w, h), d = id.data, a = i => d[i * 4 + 3] > 100, add = [];
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const i = y * w + xx; if (a(i)) continue;
    if ((xx > 0 && a(i - 1)) || (xx < w - 1 && a(i + 1)) || (y > 0 && a(i - w)) || (y < h - 1 && a(i + w))) add.push(i); }
  for (const i of add) { d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255; }
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 100 ? 255 : 0;   // hard edges
  x.putImageData(id, 0, 0); return c;
}
function tinted(src, f) {   // f(r,g,b) -> [r,g,b] on every opaque pixel
  const c = canv(src.width, src.height), x = ctxOf(c); x.drawImage(src, 0, 0); const id = x.getImageData(0, 0, c.width, c.height), d = id.data;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { const o = f(d[i], d[i + 1], d[i + 2]); d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; }
  x.putImageData(id, 0, 0); return c;
}
function rotated(src, quarterTurns) {
  const odd = quarterTurns % 2, c = canv(odd ? src.height : src.width, odd ? src.width : src.height), x = ctxOf(c);
  x.translate(c.width / 2, c.height / 2); x.rotate(quarterTurns * Math.PI / 2); x.drawImage(src, -src.width / 2, -src.height / 2); return c;
}
export const flipped = src => { const c = canv(src.width, src.height), x = ctxOf(c); x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); return c; };

// ============================================================ ROX
const SKIN = [214, 162, 138], SKIN_D = [176, 124, 104], SHIRT = [30, 30, 36], SHIRT_L = [52, 52, 60], SHORTS = [124, 112, 76], SHORTS_D = [98, 88, 58];
const SHOE = [64, 64, 72], SOLE = [222, 222, 214], ORANGE = [236, 112, 34], ORANGE_D = [190, 82, 24], BLUE = [52, 74, 160], BLUE_L = [84, 108, 196];

// the face: the photo cut-out, scaled to the head box, contrast lifted a little, hard alpha
function prepFace(img, w, h) {
  const c = canv(w, h), x = c.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
  const id = x.getImageData(0, 0, w, h), d = id.data;
  for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i + 3] > 110 ? 255 : 0; for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, (d[i + k] - 128) * 1.15 + 134)); }
  x.putImageData(id, 0, 0); return c;
}

// the body, 40 x 92, head box at the top. pose: stand | wave | walk1 | walk2 | phone | eat | push | sit
function roxBody(face, pose) {
  const c = canv(40, 92), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };
  const sit = pose === 'sit';
  // legs and shoes (sitting: dangling, shorter)
  const legL = pose === 'walk1' ? -3 : 0, legR = pose === 'walk2' ? -3 : 0;
  if (!sit) {
    R(11, 79, 7, 8 + legL, SKIN); R(23, 79, 7, 8 + legR, SKIN); R(11, 79, 2, 8 + legL, SKIN_D); R(23, 79, 2, 8 + legR, SKIN_D);
    R(9, 87 + legL, 10, 4, SHOE); R(9, 90 + legL, 10, 1, SOLE); R(22, 87 + legR, 10, 4, SHOE); R(22, 90 + legR, 10, 1, SOLE);
  } else {
    R(11, 76, 7, 8, SKIN); R(23, 76, 7, 8, SKIN); R(9, 84, 10, 4, SHOE); R(9, 87, 10, 1, SOLE); R(22, 84, 10, 4, SHOE); R(22, 87, 10, 1, SOLE);
  }
  // shorts (cargo pockets)
  R(8, 67, 25, 12, SHORTS); R(19, 74, 3, 5, SHORTS_D); R(8, 67, 25, 2, SHORTS_D); R(9, 71, 4, 5, SHORTS_D); R(28, 71, 4, 5, SHORTS_D);
  // T-shirt with a belly
  R(7, 45, 27, 23, SHIRT); R(5, 55, 31, 11, SHIRT); R(6, 52, 29, 3, SHIRT); R(9, 47, 3, 18, SHIRT_L); R(15, 44, 11, 2, SHIRT_L);
  // the company logo: a white "50" on the chest
  pixelText(x, '50', 22, 49, '#f4f0e6', 1); R(21, 57, 12, 1, [200, 40, 40]);
  // neck
  R(16, 41, 9, 5, SKIN_D);
  // arms by pose
  const sleeveL = () => R(2, 46, 6, 8, SHIRT), sleeveR = () => R(33, 46, 6, 8, SHIRT);
  const armDownL = () => { sleeveL(); R(3, 54, 4, 12, SKIN); R(2, 65, 6, 4, SKIN); }, armDownR = () => { sleeveR(); R(34, 54, 4, 12, SKIN); R(33, 65, 6, 4, SKIN); };
  const armUpR = () => { R(33, 40, 6, 9, SHIRT); R(34, 26, 4, 14, SKIN); R(33, 21, 6, 6, SKIN); };
  if (pose === 'wave') { armDownL(); armUpR(); }
  else if (pose === 'phone') { armDownR(); sleeveL(); R(3, 36, 4, 18, SKIN); R(2, 28, 6, 8, SKIN); R(4, 25, 4, 10, [40, 40, 48]); R(5, 26, 2, 3, [120, 180, 230]); }
  else if (pose === 'eat') { sleeveL(); sleeveR(); R(6, 52, 6, 5, SKIN); R(29, 52, 6, 5, SKIN); R(10, 50, 22, 6, SKIN); }
  else if (pose === 'push') { sleeveL(); sleeveR(); R(4, 54, 5, 8, SKIN); R(32, 54, 5, 8, SKIN); R(6, 60, 6, 4, SKIN); R(29, 60, 6, 4, SKIN); }
  else if (sit) { armDownL(); armUpR(); }
  else { armDownL(); armDownR(); }
  // the head: his face, a bobblehead on purpose
  x.drawImage(face, 3, 0);
  return c;
}

// a fennel bulb (finocchio): white-green bulb, pale green stalks, feathery fronds
function fennel(scale = 1) {
  const c = canv(22, 26), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };
  R(9, 2, 1, 8, [96, 168, 72]); R(6, 1, 1, 6, [96, 168, 72]); R(14, 0, 1, 8, [96, 168, 72]); R(4, 0, 3, 1, [120, 190, 84]); R(13, 0, 4, 1, [120, 190, 84]); R(8, 1, 3, 1, [120, 190, 84]);
  R(8, 8, 2, 6, [178, 214, 132]); R(12, 7, 2, 7, [178, 214, 132]); R(10, 8, 2, 6, [160, 204, 120]);
  for (let yy = 0; yy < 12; yy++) { const hw = Math.round(Math.sin((yy + 1) / 13 * Math.PI) * 9); R(11 - hw, 13 + yy, hw * 2, 1, yy < 3 ? [210, 232, 176] : [240, 244, 226]); }
  R(6, 16, 2, 6, [214, 226, 196]); R(11, 15, 1, 9, [214, 226, 196]);
  if (scale === 1) return c; const c2 = canv(c.width * scale, c.height * scale), x2 = ctxOf(c2); x2.drawImage(c, 0, 0, c2.width, c2.height); return c2;
}

// the Grizzly floor scrubber, seen from the front: orange body, blue dome, blue handle
function grizzly(w = 48, h = 44) {
  const c = canv(w, h), x = ctxOf(c), R = (a, b, ww, hh, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, ww, hh); };
  const cx = w / 2;
  R(cx - 2, 0, 4, 10, BLUE); R(cx - 14, 0, 28, 3, BLUE); R(cx - 14, 0, 3, 8, BLUE); R(cx + 11, 0, 3, 8, BLUE);   // handle
  for (let yy = 8; yy < h - 6; yy++) { const t = (yy - 8) / (h - 14), hw = Math.round((w / 2 - 4) * Math.min(1, 0.65 + t * 0.6)); R(cx - hw, yy, hw * 2, 1, yy % 7 === 0 ? ORANGE_D : ORANGE); }
  for (let yy = 9; yy < 22; yy++) { const hw = Math.round(Math.sqrt(1 - ((yy - 15.5) / 7) ** 2) * (w / 2 - 9)); R(cx - hw, yy, hw * 2, 1, yy < 12 ? BLUE_L : BLUE); }   // the dome
  R(cx - (w / 2 - 4), h - 12, w - 8, 3, BLUE); R(2, h - 7, w - 4, 6, ORANGE); R(2, h - 2, w - 4, 2, ORANGE_D);   // blue band, bumper
  pixelText(x, 'GRIZZLY', Math.round(cx - textW('GRIZZLY') / 2), h - 21, rgb(ORANGE_D));
  return c;
}

// a supermarket trolley seen from the front, full of fennel
function trolley() {
  const c = canv(46, 36), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };
  const f = fennel(); x.drawImage(f, 4, 0); x.drawImage(f, 14, -2); x.drawImage(f, 24, 1);
  R(10, 3, 4, 10, [200, 40, 40]); R(30, 6, 8, 9, [232, 170, 40]);   // a red bag, a yellow box
  for (let yy = 12; yy < 30; yy++) for (let xx = 2; xx < 44; xx++) if (yy === 12 || yy === 29 || xx === 2 || xx === 43 || xx % 5 === 0 || yy % 4 === 0) R(xx, yy, 1, 1, [176, 182, 192]);
  R(2, 12, 42, 2, [214, 40, 40]);   // the red handle strip
  R(6, 30, 2, 4, [150, 150, 160]); R(38, 30, 2, 4, [150, 150, 160]); R(4, 33, 6, 3, [30, 30, 34]); R(36, 33, 6, 3, [30, 30, 34]);
  return c;
}

export function buildRox(faceImg) {
  const face = prepFace(faceImg, 34, 44), S = {};
  const body = p => roxBody(face, p);
  for (const p of ['stand', 'wave', 'walk1', 'walk2', 'phone', 'eat', 'push']) S[p] = outline(body(p));
  // eating: the fennel in his hands
  { const c = canv(40, 92), x = ctxOf(c); x.drawImage(body('eat'), 0, 0); x.drawImage(fennel(), 9, 36); S.eat = outline(c); }
  // pushing a trolley towards you
  { const c = canv(48, 98), x = ctxOf(c); x.drawImage(body('push'), 4, 0); x.drawImage(trolley(), 1, 60); S.cart = outline(c); }
  // pushing the Grizzly towards you (like the photo)
  { const c = canv(52, 104), x = ctxOf(c); x.drawImage(body('push'), 6, 0); x.drawImage(grizzly(52, 46), 0, 58); S.grizzly = outline(c); }
  // the chase: riding the Grizzly backwards, waving a fennel at you
  for (const [k, up] of [['chase', 0], ['chase2', 2]]) { const c = canv(64, 112), x = ctxOf(c), g = grizzly(64, 56); x.drawImage(g, 0, 56); x.drawImage(body('sit'), 12, 4 - up);
    x.drawImage(fennel(), 41, 4 - up * 2); S[k] = outline(c); }
  // asleep on the asphalt
  S.sleep = outline(rotated(body('stand'), 3));
  // golden Rox: worth ten
  S.gold = tinted(S.wave, (r, g, b) => { const l = (r + g + b) / 3; return [Math.min(255, 90 + l * 0.9), Math.min(255, 66 + l * 0.75), Math.max(0, l * 0.25)]; });
  S.goldWalk1 = tinted(S.walk1, (r, g, b) => { const l = (r + g + b) / 3; return [Math.min(255, 90 + l * 0.9), Math.min(255, 66 + l * 0.75), Math.max(0, l * 0.25)]; });
  S.goldWalk2 = tinted(S.walk2, (r, g, b) => { const l = (r + g + b) / 3; return [Math.min(255, 90 + l * 0.9), Math.min(255, 66 + l * 0.75), Math.max(0, l * 0.25)]; });
  S.face = outline(face);
  return S;
}

// ============================================================ CARS
// from behind: a boxy little Italian hatchback. brake: the lights on
function carRear(body, brake = false, plate = 'ROX 50') {
  const c = canv(64, 46), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); }, d = shade(body, 0.72), l = shade(body, 1.15);
  R(10, 2, 44, 3, d); R(8, 4, 48, 18, body); R(12, 6, 40, 12, [44, 60, 84]); R(14, 7, 14, 3, [96, 120, 150]);   // roof and rear window
  R(4, 20, 56, 16, body); R(4, 20, 56, 2, l); R(2, 22, 4, 6, d); R(58, 22, 4, 6, d);   // the body, mirrors
  const lc = brake ? [255, 70, 60] : [176, 30, 30]; R(5, 23, 7, 8, lc); R(52, 23, 7, 8, lc); if (brake) { R(6, 24, 5, 2, [255, 200, 190]); R(53, 24, 5, 2, [255, 200, 190]); R(27, 3, 10, 1, [255, 80, 70]); }
  const pw = textW(plate) + 6; R(32 - pw / 2 - 2, 25, pw + 2, 9, [236, 236, 228]); R(32 - pw / 2 - 2, 25, 2, 9, [40, 70, 170]); pixelText(x, plate, Math.round(32 - pw / 2 + 2), 26, '#1c1c22');   // the plate
  R(3, 35, 58, 4, [52, 52, 58]); R(4, 39, 10, 6, [24, 24, 28]); R(50, 39, 10, 6, [24, 24, 28]); R(12, 37, 6, 2, [140, 140, 150]);
  return c;
}
function carFront(body) {
  const c = canv(64, 46), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); }, d = shade(body, 0.72), l = shade(body, 1.15);
  R(10, 2, 44, 3, d); R(8, 4, 48, 16, body); R(11, 6, 42, 12, [70, 96, 128]); R(13, 7, 10, 10, [130, 160, 190]); R(20, 10, 8, 6, [40, 40, 44]);   // windscreen and a driver
  R(4, 19, 56, 17, body); R(4, 19, 56, 2, l); R(2, 21, 4, 6, d); R(58, 21, 4, 6, d);
  R(6, 23, 10, 6, [250, 246, 214]); R(48, 23, 10, 6, [250, 246, 214]); R(20, 25, 24, 7, [40, 40, 46]); for (let i = 0; i < 6; i++) R(21 + i * 4, 26, 2, 5, [90, 90, 98]);
  R(3, 35, 58, 4, [52, 52, 58]); R(4, 39, 10, 6, [24, 24, 28]); R(50, 39, 10, 6, [24, 24, 28]);
  return c;
}
// a Piaggio Ape from behind: the three-wheeled van of every Tuscan farmer
function apeRear() {
  const c = canv(40, 50), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };
  R(8, 2, 24, 14, [70, 120, 180]); R(11, 4, 18, 9, [44, 60, 84]);   // cab
  R(2, 16, 36, 22, [160, 120, 70]); for (let i = 0; i < 5; i++) R(2, 18 + i * 4, 36, 1, [120, 88, 50]);   // wooden crate
  const f = fennel(); x.drawImage(f, 4, 6); x.drawImage(f, 18, 4);   // full of fennel, of course
  R(3, 38, 34, 4, [52, 52, 58]); R(4, 41, 8, 8, [24, 24, 28]); R(28, 41, 8, 8, [24, 24, 28]); R(5, 33, 4, 4, [200, 40, 40]); R(31, 33, 4, 4, [200, 40, 40]);
  return c;
}
export const CAR_COLOURS = [[214, 48, 40], [240, 240, 232], [60, 110, 180], [40, 40, 46], [230, 196, 60], [120, 160, 90], [170, 170, 178]];
export function buildCars() {
  return {
    you: outline(carRear([206, 36, 36], false, 'UFP 50')), youBrake: outline(carRear([206, 36, 36], true, 'UFP 50')),
    rear: CAR_COLOURS.map(c => outline(carRear(c, false, ['FI 123', 'PT 666', 'LU 007', 'PO 420', 'PT 050'][(c[0] + c[1]) % 5]))),
    front: CAR_COLOURS.map(c => outline(carFront(c))), ape: outline(apeRear()),
  };
}

// ============================================================ PROPS
export function buildProps() {
  const P = {};
  P.fennel = outline(fennel());
  { const c = canv(22, 32), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };   // the yellow wet-floor A-frame
    for (let yy = 0; yy < 30; yy++) { const hw = 4 + yy * 0.22; R(Math.round(11 - hw), yy, Math.round(hw * 2), 1, [246, 206, 40]); }
    R(9, 3, 4, 4, [30, 30, 30]); R(10, 8, 2, 8, [30, 30, 30]); R(6, 10, 4, 2, [30, 30, 30]); R(12, 9, 5, 2, [30, 30, 30]); R(8, 16, 2, 6, [30, 30, 30]); R(12, 16, 5, 2, [30, 30, 30]); R(3, 24, 16, 2, [30, 30, 30]);
    R(2, 29, 4, 3, [60, 60, 60]); R(16, 29, 4, 3, [60, 60, 60]); P.wet = outline(c); }
  { const c = canv(18, 20), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };   // un caffè: turbo
    R(5, 0, 1, 4, [230, 230, 230]); R(9, 1, 1, 4, [230, 230, 230]); R(2, 7, 12, 10, [250, 250, 246]); R(3, 8, 10, 2, [110, 64, 34]); R(14, 9, 3, 5, [250, 250, 246]); R(15, 10, 1, 3, [180, 180, 180]); R(0, 17, 18, 3, [236, 236, 230]);
    P.coffee = outline(c); }
  // the shadow under things: a flat dark oval
  { const c = canv(32, 6), x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,0.38)'; x.beginPath(); x.ellipse(16, 3, 16, 3, 0, 0, 7); x.fill(); P.shadow = c; }
  // the finish: a banner over the road between two poles
  { const t = 'TIMBRA QUI', c = canv(textW(t, 2) + 40, 64), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };
    R(2, 0, 4, 64, [120, 120, 130]); R(c.width - 6, 0, 4, 64, [120, 120, 130]);
    R(6, 4, c.width - 12, 22, [200, 30, 36]); for (let i = 0; i < c.width - 12; i += 8) { R(6 + i, 4, 4, 2, [250, 250, 250]); R(10 + i, 24, 4, 2, [250, 250, 250]); }
    pixelText(x, t, 20, 8, '#fff8e8', 2); P.finish = outline(c); }
  // Utensilferramenta Pistoiese: the warehouse where it all ends
  { const c = canv(220, 96), x = ctxOf(c), R = (a, b, w, h, col) => { x.fillStyle = rgb(col); x.fillRect(a, b, w, h); };
    R(0, 14, 220, 82, [196, 198, 202]); for (let i = 0; i < 220; i += 11) R(i, 14, 1, 82, [170, 172, 178]); R(0, 10, 220, 5, [120, 124, 132]);
    R(8, 22, 204, 18, [32, 70, 150]); pixelText(x, 'UTENSILFERRAMENTA', 22, 28, '#ffffff'); x.fillStyle = '#f2c41f'; x.beginPath(); x.arc(196, 31, 8, 0, 7); x.fill(); pixelText(x, '50', 191, 28, '#203a80');
    R(20, 52, 70, 44, [242, 196, 30]); for (let i = 0; i < 11; i++) R(20, 54 + i * 4, 70, 1, [200, 160, 20]);   // the yellow roller door
    R(110, 56, 34, 40, [60, 80, 110]); R(113, 59, 28, 34, [120, 160, 200]); R(160, 50, 44, 10, [110, 160, 210]); R(160, 64, 44, 10, [110, 160, 210]);
    R(150, 3, 6, 11, [120, 124, 132]); P.ufp = outline(c); }
  return P;
}

// a speech bubble: white box, dark border, a tail pointing down, pixel text (wrapped to two lines)
export function bubble(text, accent = '#1c1c22') {
  const words = text.toUpperCase().split(' '), lines = [''];
  for (const w of words) { const l = lines[lines.length - 1]; if (l && textW(l + ' ' + w) > 96) lines.push(w); else lines[lines.length - 1] = l ? l + ' ' + w : w; }
  const tw = Math.max(...lines.map(l => textW(l))), w = tw + 8, h = lines.length * 9 + 6, c = canv(w + 2, h + 6), x = ctxOf(c);
  x.fillStyle = '#1c1c22'; x.fillRect(0, 0, w + 2, h + 2); x.fillStyle = '#fffdf4'; x.fillRect(1, 1, w, h);
  x.fillStyle = '#1c1c22'; x.fillRect(6, h + 1, 5, 2); x.fillRect(6, h + 3, 3, 2); x.fillRect(6, h + 5, 1, 1); x.fillStyle = '#fffdf4'; x.fillRect(7, h, 3, 2); x.fillRect(7, h + 2, 1, 1);
  lines.forEach((l, i) => pixelText(x, l, 5, 4 + i * 9, accent));
  return c;
}
// a floating score: pixel text with an outline
export function scoreText(text, col = '#ffe14a', k = 1) {
  const w = textW(text, k) + 4, c = canv(w, 7 * k + 4), x = ctxOf(c);
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) pixelText(x, text, 1 + dx, 1 + dy, '#1c1c22', k);
  pixelText(x, text, 2, 2, col, k); return c;
}
