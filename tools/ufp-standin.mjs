// ufp-standin.mjs: draws Utensilferramenta with the game's own code (sprites.js, from a description of the real
// building) into art/raw/lm-ufp.png, so the landmark stands at its real place until a better picture replaces it.
// Needs the local server (python3 -m http.server 8765) and Playwright. Then: node tools/pixel-path/scripts/clean.mjs --trip .
import { writeFileSync, mkdirSync } from 'node:fs';
import { chromium, BASE } from './test/lib.mjs';
const b = await chromium.launch(), p = await b.newPage(); await p.goto(BASE + 'README.md');
const url = await p.evaluate(async () => { const S = await import('/game/sprites.js'), u = S.buildProps().ufp, c = document.createElement('canvas'); c.width = u.width * 2; c.height = u.height * 2; const x = c.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(u, 0, 0, c.width, c.height); return c.toDataURL(); });
mkdirSync('art/raw', { recursive: true }); writeFileSync('art/raw/lm-ufp.png', Buffer.from(url.split(',')[1], 'base64')); console.log('art/raw/lm-ufp.png written'); await b.close();
