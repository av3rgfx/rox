// one sheet with every sprite: node tools/test/sprites.mjs OUT.png
import { writeFileSync } from 'node:fs';
import { chromium, BASE, watch } from './lib.mjs';
const b = await chromium.launch(); const p = await b.newPage(); const errs = watch(p);
await p.goto(BASE + 'README.md');
const url = await p.evaluate(async () => {
  const S = await import('/game/sprites.js'), img = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = '/assets/rox/face.png'; });
  const R = S.buildRox(img), C = S.buildCars(), P = S.buildProps();
  const list = [...Object.values(R), C.you, C.youBrake, ...C.rear.slice(0, 3), ...C.front.slice(0, 2), C.ape, ...Object.values(P), S.bubble('Il mio finocchio! Lo dico al capo'), S.scoreText('+200 x3')];
  const c = document.createElement('canvas'); c.width = 1400; c.height = 560; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.fillStyle = '#7a8a70'; x.fillRect(0, 0, c.width, c.height);
  let cx = 4, cy = 4, rowH = 0; for (const im of list) { const k = 2; if (cx + im.width * k > c.width) { cx = 4; cy += rowH + 6; rowH = 0; } x.drawImage(im, cx, cy, im.width * k, im.height * k); cx += im.width * k + 6; rowH = Math.max(rowH, im.height * k); }
  return c.toDataURL();
});
writeFileSync(process.argv[2] || '/tmp/rox-sprites.png', Buffer.from(url.split(',')[1], 'base64')); console.log('errors:', errs); await b.close();
