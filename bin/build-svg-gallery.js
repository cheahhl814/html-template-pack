#!/usr/bin/env node
/**
 * build-svg-gallery.js — regenerates features/graphics/svg-library/gallery.html
 * from features/graphics/svg-library/svg/*.svg.
 *
 * The svg/*.svg files are the CANONICAL copies; gallery.html is a generated
 * preview. Run this after editing or adding any svg/*.svg file:
 *
 *     node bin/build-svg-gallery.js
 *
 * Validation (fails the build):
 *   - well-formed tags (balanced <g>), has viewBox, role="img", aria-label, <title>
 *   - no id= attributes (id collisions when several SVGs are pasted into one page)
 *   - no <defs>/<marker>/<filter> (same collision reason)
 *   - no <script>
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SVG_DIR = path.join(ROOT, 'features', 'graphics', 'svg-library', 'svg');
const OUT = path.join(ROOT, 'features', 'graphics', 'svg-library', 'gallery.html');

// One-line descriptor + "when to use" per component (kept here, mirrored in README.md)
const META = {
  'flow-pipeline': { desc: 'Horizontal multi-step process with connectors and a feedback loop', use: 'Stages of a process, delivery pipeline, analysis workflow' },
  'cycle-loop': { desc: 'Four-node circular loop with clockwise arrows back to the start', use: 'Iterative processes: plan-build-measure-learn, audit cycles, feedback loops' },
  'hub-spoke': { desc: 'Central topic connected to six satellite topics', use: 'Concept maps, ecosystems, capability overviews, research landscape' },
  'pyramid-hierarchy': { desc: 'Four-level pyramid (narrow apex to broad base) with side annotations', use: 'Strategy→task hierarchies, organisational levels, abstraction layers' },
  'venn-overlap': { desc: 'Two-way overlap with a distinct shared zone', use: 'Relationships between two disciplines, shared vs unique capabilities' },
  'quadrant-matrix': { desc: '2×2 matrix with dashed axes and four tinted quadrant cells', use: 'Prioritisation matrices (impact vs effort), risk maps, positioning' },
  'funnel-stages': { desc: 'Four-stage narrowing funnel with conversion percentages', use: 'Sales/user funnels, pipeline stages, cohort retention' },
  'roadmap-timeline': { desc: 'Horizontal spine with five milestones and alternating callout cards', use: 'Project roadmaps, phased timelines, milestone plans' },
  'fishbone-causal': { desc: 'Ishikawa skeleton: four cause categories feeding one outcome box', use: 'Root-cause analysis, drivers-of-an-outcome summaries' },
  'layer-stack': { desc: 'Four-layer vertical stack with per-layer captions', use: 'Architecture stacks, solution layers, dependency tiers' },
  'target-bullseye': { desc: 'Concentric priority rings around one goal, dart in the bullseye, labelled leaders', use: 'Goal setting, must/should/could priorities, scope focus' },
  'staircase-steps': { desc: 'Five rising steps on a shared baseline with a goal flag on top', use: 'Maturity models, capability ladders, growth stages' },
  'chevron-progression': { desc: 'Five interlocking chevron phases with durations and activities', use: 'Project phases, methodology stages, programme timelines' },
  'iceberg-depth': { desc: 'Visible tip vs larger hidden mass below a waterline, with labelled leaders', use: 'Visible symptoms vs underlying causes, hidden costs, culture models' },
  'balance-scale': { desc: 'Two-pan balance tilted toward the heavier side, factors listed under each pan', use: 'Trade-offs, pros vs cons, cost vs benefit, decision verdicts' },
  'radar-spider': { desc: 'Six-axis radar: current profile vs dashed target, with legend and takeaway', use: 'Capability assessments, maturity scoring, option profiles' },
  'journey-map': { desc: 'Five stages with touchpoints and an emotion curve through face markers', use: 'Customer/user journeys, onboarding experience, service blueprints' },
  'converging-forces': { desc: 'Four corner drivers with fat arrows converging on one central subject', use: 'External pressures, drivers of change, stakeholder influence' },
  'puzzle-pieces': { desc: '2×2 interlocking jigsaw with the final piece lifted out', use: 'Parts of a whole, integrated solutions, the missing element' },
  'gear-mechanism': { desc: 'Three meshing gears with rotation cues (driver → driven)', use: 'Interdependent parts, operating models, what drives what' },
};

function validate(name, src) {
  const errs = [];
  const balanced = (tag) => (src.match(new RegExp(`<${tag}[\\s>]`, 'g')) || []).length ===
                            (src.match(new RegExp(`</${tag}>`, 'g')) || []).length;
  if (!balanced('g')) errs.push('unbalanced <g>');
  if (!balanced('text')) errs.push('unbalanced <text>');
  if (!/viewBox=/.test(src)) errs.push('missing viewBox');
  if (!/role="img"/.test(src)) errs.push('missing role="img"');
  if (!/aria-label=/.test(src)) errs.push('missing aria-label');
  if (!/<title>/.test(src)) errs.push('missing <title>');
  if (/\bid=/.test(src)) errs.push('contains id= (collision risk — use none)');
  if (/<defs|<marker|<filter|<script/.test(src)) errs.push('contains defs/marker/filter/script');
  return errs;
}

const files = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg')).sort();
if (files.length === 0) throw new Error('no svg files found');

const cards = [];
for (const f of files) {
  const name = f.replace(/\.svg$/, '');
  const meta = META[name];
  if (!meta) throw new Error(`no META entry for ${name}`);
  let src = fs.readFileSync(path.join(SVG_DIR, f), 'utf8');
  const firstComment = src.match(/<!--([\s\S]*?)-->/);
  if (firstComment) src = src.replace(firstComment[0], '').trim(); // strip usage comment for display
  const errs = validate(name, fs.readFileSync(path.join(SVG_DIR, f), 'utf8'));
  if (errs.length) throw new Error(`${name}: ${errs.join('; ')}`);
  cards.push({ name, ...meta, raw: firstComment ? src : fs.readFileSync(path.join(SVG_DIR, f), 'utf8') });
}

function card(c, i) {
return `    <figure class="card" id="c-${c.name}">
      <figcaption>
        <span class="idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="info"><strong>${c.name}</strong><em>${c.desc}</em><span class="use">when: ${c.use}</span></span>
      </figcaption>
      <div class="stage">${c.raw}</div>
      <details><summary>source (.svg)</summary><pre class="src"></pre></details>
    </figure>`;
}

const page = `<!--
  GENERATED FILE — do not hand-edit.
  Source of truth: svg/*.svg in this directory; regenerate with:
      node bin/build-svg-gallery.js
  (html-template-pack v0.12.0 SVG diagram library)
-->
<!doctype html>
<html lang="en" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>svg-library · html-template-pack</title>
<style>
  :root {
    --bg: #f8fafc; --surface: #ffffff; --surface2: #f1f5f9; --surface3: #e2e8f0;
    --border: #e2e8f0; --border-bright: #cbd5e1;
    --text: #0f172a; --text-muted: #64748b; --text-dim: #94a3b8;
    --accent: #0d9488;
    --navy: #1a2744; --deep-blue: #2c4a7c; --teal: #0d9488;
    --coral: #ef4444; --amber: #f59e0b; --green: #10b981;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    --font-head: 'Outfit', sans-serif;
    --font-mono: ui-monospace, 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;
  }
  html[data-theme="dark"] {
    --bg: #0b0e14; --surface: #131820; --surface2: #1c2230; --surface3: #252b3d;
    --border: #232a35; --border-bright: #313a4a;
    --text: #f8fafc; --text-muted: #94a3b8; --text-dim: #64748b;
    --accent: #14b8a6;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: var(--font-sans); background: var(--bg); color: var(--text); padding: 40px clamp(20px, 5vw, 72px) 80px; }
  header { display: flex; align-items: baseline; gap: 16px; flex-wrap: wrap; margin-bottom: 28px; }
  h1 { font-family: var(--font-head); font-size: clamp(26px, 3.5vw, 38px); }
  header p { color: var(--text-muted); max-width: 62ch; }
  .toggle { margin-left: auto; background: var(--surface2); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 6px 14px; cursor: pointer; font-size: 14px; }
  .catalog { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 24px; }
  @media (max-width: 520px) { .catalog { grid-template-columns: 1fr; } }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; scroll-margin-top: 20px; }
  figcaption { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
  .idx { font-family: var(--font-mono); color: var(--accent); font-size: 13px; padding-top: 2px; }
  .info strong { font-family: var(--font-head); font-size: 16px; display: block; }
  .info em { color: var(--text-muted); font-style: normal; font-size: 13px; display: block; margin-top: 2px; }
  .use { color: var(--text-dim); font-size: 12px; display: block; margin-top: 4px; }
  .stage { border: 1px solid var(--border); border-radius: 10px; background: var(--bg); padding: 10px; }
  .stage svg { display: block; }
  details { margin-top: 12px; }
  summary { cursor: pointer; color: var(--text-muted); font-size: 13px; user-select: none; }
  .src { font-family: var(--font-mono); font-size: 11px; line-height: 1.5; color: var(--text-muted); background: var(--surface2); border: 1px solid var(--border); border-radius: 8px; padding: 12px; overflow: auto; max-height: 340px; white-space: pre; margin-top: 8px; }
  nav { margin-bottom: 24px; display: flex; flex-wrap: wrap; gap: 8px; }
  nav a { font-size: 13px; color: var(--accent); text-decoration: none; border: 1px solid var(--border); border-radius: 999px; padding: 4px 12px; }
  nav a:hover { border-color: var(--accent); }
</style>
</head>
<body>
  <header>
    <h1>svg-library</h1>
    <p>Hand-drawn SVG diagram templates for the html-template-pack templates. Every component is token-driven (adapts to each template's palette + light/dark) and id-free (safe to paste multiple). Copy-paste the inline SVG, then edit the labels. Toggle the theme to preview both palettes.</p>
    <button class="toggle" onclick="var h=document.documentElement;h.setAttribute('data-theme',h.getAttribute('data-theme')==='dark'?'light':'dark')">◐</button>
  </header>
  <nav>${cards.map(c => `<a href="#c-${c.name}">${c.name}</a>`).join('')}</nav>
  <main class="catalog">
${cards.map((c, i) => card(c, i)).join('\n')}
  </main>
<script>
  document.querySelectorAll('figure.card').forEach(function (fig) {
    var svg = fig.querySelector('.stage svg');
    if (svg) fig.querySelector('.src').textContent = svg.outerHTML;
  });
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, page);
console.log(`gallery.html written: ${cards.length} components (${files.join(', ')})`);