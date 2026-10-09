#!/usr/bin/env node
// Smoke-test bin/svg-export.js: every svg-library component flattens to a
// renderer-safe standalone .svg (no var()/color-mix left, fixed size) in both
// themes, and the color-mix maths matches CSS.

const fs = require('fs');
const path = require('path');
const { exportSvg, colour } = require('../bin/svg-export.js');

const DIR = path.join(__dirname, '..', 'features', 'graphics', 'svg-library', 'svg');
let pass = 0, fail = 0;
const check = (ok, msg) => { if (ok) pass++; else { fail++; console.log(`  ✗ ${msg}`); } };

// colour maths
const near = (a, b) => a.every((v, i) => Math.abs(v - b[i]) < 0.6);
check(near(colour('color-mix(in srgb, #000000 50%, #ffffff)').rgb, [127.5, 127.5, 127.5]), 'mix black/white 50%');
const t = colour('color-mix(in srgb, #0d9488 22%, transparent)');
check(near(t.rgb, [13, 148, 136]) && Math.abs(t.a - 0.22) < 1e-9, 'mix with transparent keeps hue, alpha 0.22');

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.svg'));
for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  for (const theme of ['light', 'dark']) {
    let out = '';
    try { out = exportSvg(src, theme); } catch (e) { check(false, `${f} [${theme}]: ${e.message}`); continue; }
    check(!/var\(|color-mix|<!--/.test(out), `${f} [${theme}]: leftover var()/color-mix/comment`);
    check(/<svg[^>]*width="800" height="450"/.test(out), `${f} [${theme}]: fixed width/height`);
    if (theme === 'dark') check(/<\/title>\s*<rect [^>]*fill:#131820/.test(out), `${f} [dark]: background rect`);
  }
}
console.log(`  svg-export: ${files.length} components × 2 themes`);
console.log(`  TOTAL: ${pass} passed · ${fail} failed`);
process.exit(fail ? 1 : 0);
