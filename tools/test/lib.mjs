// shared bits of the headless tests: Playwright from the cloud image (or $PLAYWRIGHT), the local server URL
export const { chromium } = await import(process.env.PLAYWRIGHT || '/opt/node-tools/node_modules/playwright/index.mjs');
export const BASE = process.env.ROX_URL || 'http://127.0.0.1:8765/';
export function watch(p, errs = []) { p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); return errs; }
