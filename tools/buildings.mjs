// buildings.mjs: the real look of each mapped building. art/buildings-custom.json lists, for buildings Pixel Path found
// on the map (matched by where they stand: [metres along the route, side +1 right / -1 left]) or ones the map lacks
// ("add", like the Panorama along the car park lane), the picture that shows what really stands there, its height and,
// for a long building, the length of one picture (tile) repeated along it. Descriptions come from the owner's Street
// View walk-through, written in words (Street View images are never used as references).
// Writes data/buildings.json for layout.js and adds one job per picture to art/plan.json (role "custom", so the kit
// never uses them anywhere else). Run after plan-art.mjs: sh tools/plan-art.sh does.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readJSON, writeJSON } from './pixel-path/scripts/lib.mjs';
import { RECIPE, STYLE } from './pixel-path/scripts/kit.mjs';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), list = readJSON(join(ROOT, 'art/buildings-custom.json'), []), plan = readJSON(join(ROOT, 'art/plan.json'));
if (!plan) { console.error('no art/plan.json: run plan-art first'); process.exit(1); }
writeJSON(join(ROOT, 'data/buildings.json'), list.map(({ subject, subjects, note, ...b }) => b), true);
const seedOf = name => parseInt(createHash('sha1').update(name).digest('hex').slice(0, 7), 16);
const size = a => a >= 1 ? [192, Math.max(64, Math.round(192 / Math.min(a, 3)))] : [Math.max(96, Math.round(192 * a)), 192];   // the picture's shape follows the building's
plan.jobs = plan.jobs.filter(j => j.role !== 'custom');
for (const b of list.filter(b => b.pic || b.pics)) for (const pic of new Set(b.pics || [b.pic])) {
  const len = b.tile || (b.add ? b.add.len : 14), [w, h] = size(len / b.hgt), subject = (b.subjects || {})[pic] || b.subject;
  plan.jobs.push({ name: pic, style: STYLE, remove_bg: true, seed: seedOf(pic), role: 'custom', theme: plan.themes[0].id, kind: 'facade', width: w, height: h, hm: b.hgt, prompt: RECIPE.facade(subject) });
}
writeJSON(join(ROOT, 'art/plan.json'), plan, true);
console.log(`data/buildings.json: ${list.length} real buildings; art/plan.json: ${plan.jobs.filter(j => j.role === 'custom').length} building pictures added`);
