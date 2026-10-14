// landmarks.mjs: the real buildings of this road that OpenStreetMap does not mark as landmarks (no Wikidata id), added
// to the baked data/landmarks.json so Pixel Path stands each one's own picture at its real place (layout.js: within
// 60 m of the road a landmark replaces the frontage). Run after every bake:  node tools/landmarks.mjs
// Positions come from the OSM footprints: s = metres along the route, side = metres from the road (+ right).
// "kind" only picks the picture's shape in plan-art.mjs (station = wide, chapel = square). On the long route
// (through the Panorama car park) the roadside chapel of Via Bure Vecchia Nord is 72 m off the road: left out.
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJSON, writeJSON } from './pixel-path/scripts/lib.mjs';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..'), custom = readJSON(join(ROOT, 'art/landmarks-custom.json'), []);
const baked = readJSON(join(ROOT, 'data/landmarks.json'), []).filter(l => !l.custom && !custom.some(c => c.qid === l.qid));   // re-runs replace the custom ones
writeJSON(join(ROOT, 'data/landmarks.json'), [...custom.map(c => ({ ...c, custom: true })), ...baked], true);
console.log(`data/landmarks.json: ${custom.length} custom + ${baked.length} from the bake`);
