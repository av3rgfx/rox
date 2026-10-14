// shared bits of the headless tests: Playwright from the cloud image (or $PLAYWRIGHT), the local server URL
const PW = await import(process.env.PLAYWRIGHT || '/opt/node-tools/node_modules/playwright/index.mjs');
// $CHROME: an installed Chrome instead of Playwright's own download (e.g. CHROME=/usr/bin/google-chrome-stable)
export const chromium = { launch: (o = {}) => PW.chromium.launch({ ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), ...o }) };
export const BASE = process.env.ROX_URL || 'http://127.0.0.1:8765/';
export function watch(p, errs = []) { p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); return errs; }
