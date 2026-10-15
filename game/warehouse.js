// warehouse.js: the IS aisle of Utensilferramenta's warehouse, where the boss fight happens. A small renderer of its
// own, without the road's data: a straight aisle ray-cast pixel by pixel (grey concrete floor with yellow safety lines
// and puddles, pallet racking on both sides with blue uprights, yellow beams and boxes on pallets, neon tubes on the
// ceiling), then the game's things drawn over it far to near, the same {z, lat, img, hm, wm?, lift?, rot?, alpha?} as
// road.js's render() (thing.screen gets the drawn box). The aisle never ends: the racking repeats, the far end is dark.
//
// World units are metres: s along the aisle, lat from its middle (+ right). The camera is CAM_H above the floor.
export function createWarehouse(canvas, opts = {}) {
  const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height, FOCAL = Math.round(W * 0.62), CAM_H = opts.camH || 3, HZ = Math.round(H * (opts.horizon || 0.4)), CX = W / 2;
  const HALF = opts.half || 2.7, FACE = HALF + 0.45, RACK = 7.2, CEIL = 9, BAY = 2.7, LV = 1.8, NEON = 6, FAR = 70;   // floor half width, the racking's face, its height, a bay, a level
  const FOG = [24, 22, 30], img = g.createImageData(W, H), buf = new Uint32Array(img.data.buffer);
  let CAMX = 0, r = 0, gr = 0, b = 0;   // the colour of the current pixel (no arrays: this runs ~70 000 times a frame)
  const hash = (a, c, d) => { let h = (a * 374761393 + c * 668265263 + d * 1274126177) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return (h ^ (h >>> 16)) >>> 0; };
  const set = (R, Gc, B) => { r = R; gr = Gc; b = B; };
  const BOXC = [[178, 132, 82], [196, 152, 98], [160, 116, 70], [204, 168, 112]], PROD = [[200, 40, 40], [40, 90, 180], [40, 140, 70], [240, 190, 30], [230, 110, 30], [70, 70, 80]];

  // the racking: u along the bay (0..BAY), h above the floor, k the bay, side -1/+1; far: fewer details (no moire)
  function rack(u, h, k, side, far) {
    if (u < 0.13) { if (u < 0.04) set(84, 112, 204); else if (!far && u > 0.07 && u < 0.1 && (h * 12 | 0) % 2) set(22, 36, 90); else set(46, 74, 170); return; }   // a blue upright with its holes
    const lv = Math.floor(h / LV), hl = h - lv * LV;
    if (hl > LV - 0.17) { if (hl > LV - 0.05) set(176, 132, 16); else if (!far && lv === 0 && u > 1.2 && u < 1.5 && hl > LV - 0.14) set(244, 244, 236); else set(246, 196, 34); return; }   // a yellow beam (a white label on the lowest)
    const slot = u < 1.4 ? 0 : 1, c = hash(k, lv * 2 + slot, side), p0 = slot ? 1.44 : 0.2, p1 = slot ? 2.62 : 1.38;
    if (c % 9 === 0 || u < p0 || u > p1) { set(30, 30, 38); return; }   // an empty place, the dark back of the racking
    if (hl < 0.14) { if (!far && ((u - p0) * 9 | 0) % 3 === 0) set(108, 76, 40); else set(156, 114, 66); return; }   // the pallet
    const lh = 0.62 + ((c >>> 4) % 5) * 0.16; if (hl > 0.14 + lh) { set(30, 30, 38); return; }
    const kind = (c >>> 8) % 6, bu = u - p0, bh = hl - 0.14, bw = kind === 4 ? 0.29 : 0.39, bt = kind === 4 ? 0.27 : 0.35, ix = bu / bw | 0, iy = bh / bt | 0, fx = bu - ix * bw, fy = bh - iy * bt;
    if (!far && (fx < 0.025 || fy < 0.025)) { set(92, 64, 40); return; }   // the edges between boxes
    if (kind === 4) { const col = PROD[hash(k, ix, iy + lv * 7) % PROD.length]; if (!far && fy > bt * 0.55 && fy < bt * 0.8 && fx > 0.05 && fx < bw - 0.05) set(240, 236, 226); else set(col[0], col[1], col[2]); return; }   // boxes of tools, a coloured brand band
    const bc = BOXC[(hash(ix, iy, c) % BOXC.length)];
    if (kind === 5) { const s = 1.12 + (fy > bt * 0.7 ? 0.1 : 0); set(Math.min(255, bc[0] * 0.5 + 110 * s), Math.min(255, bc[1] * 0.5 + 118 * s), Math.min(255, bc[2] * 0.5 + 130 * s)); return; }   // shrink-wrapped
    if (!far && Math.abs(fx - bw / 2) < 0.04) { set(214, 190, 140); return; }   // the tape
    if (!far && kind === 2 && fx > 0.06 && fx < 0.16 && fy > 0.08 && fy < 0.16) { set(244, 244, 236); return; }   // a label
    set(bc[0], bc[1], bc[2]);
  }
  // the floor: concrete in slabs, the yellow lines of the aisle, light pools under the neon, puddles (decals)
  function floor(s, lat, far, decals) {
    const n = (hash(Math.floor(s * 4), Math.floor(lat * 4), 3) & 15) - 8, a = Math.abs(lat);
    let R = 148 + n, Gc = 148 + n, B = 144 + n;
    if (a > HALF - 0.28 && a < HALF - 0.12) { R = 236; Gc = 192; B = 40; }
    else if (a > HALF) { R -= 22; Gc -= 22; B -= 20; }
    else if (!far && (s % 5 + 5) % 5 < 0.06) { R -= 26; Gc -= 26; B -= 26; }   // the slab joints
    for (const d of decals) if (s > d.s0 && s < d.s1 && lat > d.lat0 && lat < d.lat1) { const w = (hash(Math.floor(s * 3), Math.floor(lat * 6), 9) & 7); R = 96 + w * 4; Gc = 124 + w * 4; B = 156 + w * 3; if (!far && w === 7) { R = 220; Gc = 236; B = 250; } }   // wet: blue and shiny
    const dn = Math.abs(((s % NEON) + NEON) % NEON - NEON / 2), light = 0.8 + 0.32 * Math.exp(-(dn * dn + lat * lat * 0.6) / 5);
    set(Math.min(255, R * light), Math.min(255, Gc * light), Math.min(255, B * light));
  }
  function ceil(s, lat) {
    const m = ((s % NEON) + NEON) % NEON;
    if (Math.abs(lat) < 0.13 && Math.abs(m - NEON / 2) < 1.2) { set(252, 252, 236); return; }   // a neon tube
    if (Math.abs(lat) < 0.3 && Math.abs(m - NEON / 2) < 1.3) { set(120, 122, 128); return; }
    if (m < 0.25) { set(46, 48, 56); return; }   // a steel beam across
    set(70, 72, 80);
  }

  function render(pos, things = [], decals = []) {
    const dec = decals.map(d => ({ s0: d.s0, s1: d.s1, lat0: d.lat - d.w / 2, lat1: d.lat + d.w / 2 }));
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - CX, dy = y + 0.5 - HZ; let z = 1e9, what = 0;
      if (dy > 0) { z = CAM_H * FOCAL / dy; what = 1; } else if (dy < 0) { z = (CEIL - CAM_H) * FOCAL / -dy; what = 2; }
      const lat = CAMX + dx * z / FOCAL;
      if (Math.abs(lat) > FACE && dx !== 0) { const side = dx > 0 ? 1 : -1, zw = (side * FACE - CAMX) * FOCAL / dx, h = CAM_H - dy * zw / FOCAL; if (zw > 0 && h >= 0 && h <= RACK) { z = zw; what = 3;
        const sw = pos + zw, k = Math.floor(sw / BAY); rack(sw - k * BAY, h, k, side, zw > 24); } }
      if (what === 1) floor(pos + z, lat, z > 22, dec); else if (what === 2) ceil(pos + z, lat); else if (what === 0) set(FOG[0], FOG[1], FOG[2]);
      if (what === 2 && Math.abs(lat) > FACE) { r *= 0.7; gr *= 0.7; b *= 0.7; }   // above the racking, in its shade
      const f = z > 16 ? Math.min(1, ((z - 16) / (FAR - 16)) ** 0.8) : 0;
      buf[y * W + x] = 0xff000000 | ((b + (FOG[2] - b) * f) << 16) | ((gr + (FOG[1] - gr) * f) << 8) | (r + (FOG[0] - r) * f);
    }
    g.putImageData(img, 0, 0); g.imageSmoothingEnabled = false;
    // the game's things, far to near
    for (const t of [...things].sort((a, c) => c.z - a.z)) {
      if (t.z < 0.6 || t.z > FAR || !t.img) continue; const im = t.img, sc = FOCAL / t.z, x = CX + (t.lat - CAMX) * sc, y = HZ + (CAM_H - (t.lift || 0)) * sc, h = t.hm * sc, w = t.wm ? t.wm * sc : h * im.width / im.height;
      if (h < 0.6 || x + w < 0 || x - w > W || h > H * 3) continue;
      if (t.alpha != null) g.globalAlpha = t.alpha;
      if (t.rot) { g.save(); g.translate(Math.round(x), Math.round(y - h / 2)); g.rotate(t.rot); g.drawImage(im, Math.round(-w / 2), Math.round(-h / 2), Math.round(w), Math.round(h)); g.restore(); }
      else g.drawImage(im, Math.round(x - w / 2), Math.round(y - h), Math.round(w), Math.round(h));
      g.globalAlpha = 1; t.screen = { x, y, w, h };
    }
  }
  return { W, H, FOCAL, HZ, CAM_H, HALF, render, setCamX: v => { CAMX = v; } };
}
