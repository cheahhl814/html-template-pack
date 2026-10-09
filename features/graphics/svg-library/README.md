# svg-library — hand-drawn SVG diagram templates (html-template-pack v0.14.0)

Seventy-one agent-drawable, copy-paste-ready **inline SVG diagram/infographic templates** for
explanatory and summary visuals — the complement to the pure-CSS graphics pack
(`features/graphics/graphics.css`). Where the CSS pack covers charts built from real
data (donut, gauge, heatmap, bars), the SVG library covers **concept diagrams**:
processes, loops, hierarchies, matrices, funnels, roadmaps, cause-effect maps, goals,
maturity ladders, phases, hidden-vs-visible, trade-offs, assessments, journeys,
converging forces, parts-of-a-whole, interdependencies, decisions, adoption curves,
networks, nested scopes, cause chains, comparisons and briefs.

```
features/graphics/svg-library/
├── README.md        ← you are here (conventions + catalog)
├── gallery.html     ← GENERATED preview page (open in a browser)
└── svg/*.svg        ← CANONICAL component files (edit these)
```

Regenerate the gallery after any change to `svg/*.svg`:

```
node bin/build-svg-gallery.js
```

The catalog with live previews lives in `gallery.html` — dark-first, with a ◐
theme toggle so you can eyeball each component in both palettes before copying.
Each figure card has a collapsible **source (.svg)** block copy-paste-ready.

## Catalog

| # | Component | What it shows | When to use |
|---|-----------|---------------|-------------|
| 1 | `flow-pipeline.svg` | Horizontal multi-step process with connectors and a feedback loop | Stages of a process, delivery pipeline, analysis workflow |
| 2 | `cycle-loop.svg` | Four-node circular loop with clockwise arrows back to the start | Iterative processes: plan-build-measure-learn, audit cycles |
| 3 | `hub-spoke.svg` | Central topic connected to six satellite topics | Concept maps, ecosystems, capability overviews |
| 4 | `pyramid-hierarchy.svg` | Four-level pyramid (narrow apex → broad base) + side annotations | Strategy→task hierarchies, levels of abstraction, org tiers |
| 5 | `venn-overlap.svg` | Two-way overlap with a distinct shared zone | Shared vs unique traits of two disciplines/approaches |
| 6 | `quadrant-matrix.svg` | 2×2 matrix, dashed axes, four tinted cells | Prioritisation (impact vs effort), risk maps, positioning |
| 7 | `funnel-stages.svg` | Four-stage narrowing funnel + conversion percentages | Sales/user funnels, pipeline stages, cohort retention |
| 8 | `roadmap-timeline.svg` | Horizontal spine, 5 milestones, alternating callout cards | Project roadmaps, phased timelines, milestone plans |
| 9 | `fishbone-causal.svg` | Ishikawa skeleton: 4 cause categories → 1 outcome box | Root-cause analysis, drivers-of-an-outcome summaries |
| 10 | `layer-stack.svg` | Four-layer vertical stack with per-layer captions | Architecture stacks, dependency tiers |
| 11 | `target-bullseye.svg` | Concentric priority rings around one goal, dart in the bullseye, labelled leaders | Goal setting, must/should/could priorities, scope focus |
| 12 | `staircase-steps.svg` | Five rising steps on a shared baseline with a goal flag on top | Maturity models, capability ladders, growth stages |
| 13 | `chevron-progression.svg` | Five interlocking chevron phases with durations and activities | Project phases, methodology stages, programme timelines |
| 14 | `iceberg-depth.svg` | Visible tip vs larger hidden mass below a waterline, labelled leaders | Visible symptoms vs underlying causes, hidden costs, culture models |
| 15 | `balance-scale.svg` | Two-pan balance tilted toward the heavier side, factors under each pan | Trade-offs, pros vs cons, cost vs benefit, decision verdicts |
| 16 | `radar-spider.svg` | Six-axis radar: current profile vs dashed target, legend + takeaway | Capability assessments, maturity scoring, option profiles (concept-level; real data → chartz) |
| 17 | `journey-map.svg` | Five stages with touchpoints and an emotion curve through face markers | Customer/user journeys, onboarding experience, service blueprints |
| 18 | `converging-forces.svg` | Four corner drivers with fat arrows converging on one central subject | External pressures, drivers of change, stakeholder influence |
| 19 | `puzzle-pieces.svg` | 2×2 interlocking jigsaw with the final piece lifted out | Parts of a whole, integrated solutions, the missing element |
| 20 | `gear-mechanism.svg` | Three meshing gears with rotation cues (driver → driven) | Interdependent parts, operating models, what drives what |
| 21 | `timeline-vertical.svg` | Central spine, five dated events alternating left/right | Company histories, project chronologies, release history |
| 22 | `swimlane-gantt.svg` | Four workstream lanes, bars across six quarters, today marker + milestone | Roadmaps by team, Gantt-lite plans, parallel workstreams |
| 23 | `honeycomb-cluster.svg` | Seven packed hexagons with one solid focus cell | Capability maps, building blocks, product modules |
| 24 | `dual-hub.svg` | Two hubs with three satellites each, bridged by a shared goal | Comparing two options/teams that share an objective |
| 25 | `petal-cycle.svg` | Six leaf petals around a hub with clockwise flow cues | Six-stage cycles, continuous improvement, lifecycles |
| 26 | `decision-tree.svg` | Root question → yes/no follow-ups → four outcome cards | Decision guides, triage rules, build-vs-buy logic |
| 27 | `snake-path.svg` | Winding road, seven numbered stations, U-turn + goal flag | Long processes (6–9 steps), learning paths |
| 28 | `onion-layers.svg` | Four nested half-rings (context → core) with leader descriptions | Spheres of influence, nested scopes, system boundaries |
| 29 | `pillars-foundation.svg` | Roof carried by four pillars on a foundation slab | Strategy houses, guiding principles, programme pillars |
| 30 | `versus-columns.svg` | Two option cards with VS badge, strengths/trade-offs, best-for verdict | A vs B comparisons, option appraisals |
| 31 | `lightbulb-layers.svg` | Bulb sliced into four numbered bands, each leading to a card | Idea maturation, innovation stages, layers of an insight |
| 32 | `matrix-nine-box.svg` | 3×3 matrix on graded axes, cells warming coral → green | Talent nine-box, portfolio grids, likelihood × impact |
| 33 | `s-curve-adoption.svg` | Logistic S-curve over four phases + rate bell + we-are-here marker | Technology adoption, product life-cycle, maturity curves |
| 34 | `growth-tree.svg` | Canopy of outcomes fed by labelled roots below a soil line | Roots-and-fruits, inputs vs outcomes, theory of change |
| 35 | `spiral-growth.svg` | Outward spiral through five numbered stations + legend | Compounding growth, iterative deepening |
| 36 | `domino-chain.svg` | Five growing dominoes, first tipping, chain-reaction arc | Cause chains, knock-on effects, small trigger → big outcome |
| 37 | `network-mesh.svg` | Central node, strong ties, influence-sized nodes, weak dashed ties | Stakeholder maps, ecosystems, collaboration networks |
| 38 | `merge-paths.svg` | Three input streams curving into one arrow → single outcome | Data integration, synthesis, merging workstreams |
| 39 | `five-w-agenda.svg` | Who/What/When/Where/Why tiles with answer cards + tags | Project briefs, kick-off agendas, incident summaries |
| 40 | `orbit-satellites.svg` | Core with three dashed orbits of satellites + distance legend | Stakeholder proximity, engagement tiers |
| 41 | `metro-map.svg` | Transit-map pipeline: bundled routes, tool detour, route split + re-merge, dotted optional spur, file icons, legend | Bioinformatics/data pipelines with alternative tools or routes (nf-core-style) |
| 42 | `hanging-tags.svg` | Five round step tags hanging on strings from a rail at alternating heights | Five-step processes, playful step lists, feature tags |
| 43 | `helix-ribbon-timeline.svg` | Vertical twisted ribbon with five dated events at its turning edges, alternating left/right | Company histories, growth stories, milestone timelines |
| 44 | `ring-chain.svg` | Five thick numbered rings in a zig-zag chain joined by links | Linked skills/capabilities, dependent steps, value chains |
| 45 | `semicircle-segments.svg` | Half donut split into three proportional shares with % callouts, a hub total and a legend | Survey splits, share-of-whole summaries (concept-level; real data → chartz) |
| 46 | `wavy-timeline.svg` | Hand-drawn wavy path with five pins on crests/troughs ending in a paper plane | Project phases, light-touch roadmaps, onboarding journeys |
| 47 | `pictogram-grid.svg` | 10×10 grid of person icons with N highlighted, headline and legend | "N in 100" statistics, adoption/prevalence callouts |
| 48 | `mind-map.svg` | Central idea with four curved branches to topic pills, each fanning into three sub-topics | Brainstorms, topic overviews, planning maps |
| 49 | `eight-step-ring.svg` | Eight arrow-shaped ring segments running clockwise with outside labels and a hub title | 8-step processes, DMAIC-style cycles, continuous improvement |
| 50 | `radial-bars.svg` | Four concentric 270° progress arcs with labels in the open quadrant and a takeaway card | Funnel/progress percentages, goal attainment (concept-level; real data → chartz) |
| 51 | `org-chart.svg` | Three-level org chart: one lead, three heads, two reports each, elbow connectors | Org structures, team ownership, reporting lines |
| 52 | `world-dot-map.svg` | Dot-matrix world (continent-tinted, from Natural Earth 1:110m) with four teardrop pins and callout cards | Global footprint, office/site locations, regional hubs (precise geography → chartz GeoMap) |
| 53 | `europe-tile-grid.svg` | Tile-grid map of Europe: one equal square per country (ISO alpha-2) filled by category, legend + takeaway | Country-level status/coverage across Europe where small states must stay visible |
| 54 | `warming-stripes.svg` | Warming-stripes band (one stripe per year, blue cooler to red warmer) with decade axis and key | Long-run temperature change at a glance (illustrative values; swap in HadCRUT/Berkeley Earth) |
| 55 | `climate-zones-globe.svg` | Flattened globe split into polar, temperate, dry and tropical bands, mirrored about the equator, with a key | Climate zones, latitude-driven patterns, biome overviews (schematic) |
| 56 | `sector-landscape.svg` | Landscape of four silhouette scenes (power plant, factory, traffic, farm) with each sector's share | Emissions or impacts by sector (placeholder shares) |
| 57 | `sea-level-rise.svg` | Coastal cross-section: today's sea, two dashed scenario levels reaching homes, rise arrow | Coastal exposure, flood risk, adaptation briefs (illustrative levels) |
| 58 | `carbon-cycle.svg` | Simplified carbon cycle: atmosphere, fossil emissions, plant and ocean exchange, soil storage | Explaining sources vs sinks, net-zero logic, nature-based solutions |
| 59 | `thermometer-gauge.svg` | Thermometer of warming vs pre-industrial with risk bands, today's ~1.1 °C and the Paris 1.5/2 °C lines | Climate targets, carbon-budget framing (IPCC AR6, Paris Agreement) |
| 60 | `energy-mix-icons.svg` | Five hand-drawn energy icons (solar, wind, hydro, bio, nuclear) over vertical share bars | Energy or capacity mix, technology shares (placeholder values) |
| 61 | `planet-actions.svg` | Six numbered actions staggered along a dashed spine that drops into a half-globe | Climate actions, sustainability pledges, behaviour-change tips |
| 62 | `dna-helix-steps.svg` | Horizontal DNA double helix (A-T / G-C rungs colour-coded) with six numbered callouts above and below | Sequencing or genomics workflows, six-step processes with a DNA theme |
| 63 | `central-dogma.svg` | DNA → transcription → mRNA (codons lettered) → ribosome translation → protein bead chain, plus replication | Teaching gene expression, explaining what a sequence encodes |
| 64 | `cell-to-dna-zoom.svg` | Four zoom lenses: cell, nucleus, chromosome, DNA helix, linked by dashed zoom lines with typical scales | Explaining biological scale, where DNA lives |
| 65 | `lab-glassware-steps.svg` | Five protocol steps drawn as lab equipment on a bench: tube rack, flask, cylinder, Petri dish, microscope | Lab protocols, sample-processing workflows, methods overviews |
| 66 | `cell-membrane.svg` | Fluid-mosaic membrane cross-section: phospholipid bilayer with glycoprotein, channel, cholesterol, integral and peripheral proteins, glycolipid | Teaching membrane structure, transport and signalling context |
| 67 | `punnett-square.svg` | Monohybrid cross Aa × Aa: parents, 2 × 2 Punnett square, 1:2:1 genotype and 3:1 phenotype ratios | Teaching Mendelian inheritance, explaining carrier risk |
| 68 | `mutation-types.svg` | One coding sequence shown as original, substitution (missense), insertion and deletion (frameshift) with amino acids | Teaching point mutations, explaining variant effects |
| 69 | `gel-electrophoresis.svg` | Agarose gel with wells, size ladder, five sample lanes and − / + electrodes; bands placed by log10(size) | PCR checks, methods figures, teaching how gels separate DNA |
| 70 | `well-plate-layout.svg` | 96-well plate map: standards and samples in duplicate, blanks, positive/negative controls, legend | ELISA/qPCR plate layouts, protocol planning |
| 71 | `scientific-method.svg` | Six-step scientific-method cycle around a flask: observe, question, hypothesise, experiment, analyse, conclude | Teaching the scientific method, research-process overviews |

**When to use which graphics system:**

- Real data, interactive → `chartz` skill (see `features/graphics/chartz-embed.md`)
- Charts from real data, zero deps → CSS graphics pack (`graphics.css` A-block)
- Mermaid flow/sequence/ER → Mermaid CDN (report template)
- **Concept diagrams, hand-drawn feel, themed illustration → this SVG library**
- Decorative background motifs (no labels) → hand-draw per the DNA-helix precedent
  (see the 2026-10-02 wiki observation); same conventions as below

## Conventions baked into every file (hard rules)

1. **Inline SVG only.** Paste the whole `<svg>…</svg>` into the template HTML —
   no external files, no `<img>`, no CDN. Keeps the single-file-portability invariant.
2. **No `id` attributes, no `<defs>`, `<marker>`, `<filter>`, `<mask>`, `<pattern>` or `<clipPath>`.** Several library
   SVGs may be pasted into one page; `id` collisions would break them all. Arrowheads
   are explicit `<polygon>` triangles; repeated shapes are `<line>`/`<rect>` groups; a
   "sliced" shape is pre-computed polygons (see `lightbulb-layers.svg`), not a clip. A label
   that must sit on top of lines gets a knockout halo instead:
   `paint-order:stroke;stroke:var(--surface,#ffffff);stroke-width:5px` in its `style`.
   (Exception: if a one-off effect genuinely needs `<defs>`, generate globally-unique
   ids yourself and document it.)
3. **Token-driven color.** Every color is `var(--token, #fallback)` inside an inline
   `style` attribute (var() does **not** work in SVG presentation attributes — always
   use `style="fill:…"` / `style="stroke:…"`, never `fill="--teal"`). Tints use
   `color-mix(in srgb, var(--x) N%, var(--surface))`, so each component adapts to the
   host template's palette (report blue / slide teal / bento mixed) and both themes
   with zero per-use editing. Fallbacks are the slide template's **light-mode** values
   so a bare `.svg` file opened directly still renders correctly.
   **Dark tokens + colored text:** `--navy` and `--deep-blue` stay dark in the dark
   theme of every template, so as a *stroke* or *text* they vanish on a dark surface.
   Use them (and any colored text) pulled toward `--text`:
   `color-mix(in srgb, var(--navy,#1a2744) 55%, var(--text,#0f172a))` (navy/deep-blue)
   or `… var(--amber,#f59e0b) 70%, var(--text,#0f172a))` (bright hues) — readable in
   both themes. Translucent fills use `color-mix(… N%, transparent)`, never
   `mix-blend-mode` (multiply goes black on dark surfaces).
4. **Labels are real `<text>` nodes.** Unlike background motifs, diagram components
   carry editable labels — replace the placeholder text when copying. Label text uses
   `var(--font-head, …)` 600/700 weight; captions use `var(--font-sans, …)` 400.
   Know the limits: SVG text does **not** scale with the templates' font-size toggle
   and is not selectable-by-the-annotation-engine in all cases — for body-copy-heavy
   content prefer HTML components; SVG diagrams are for *diagram-labelled* content.
5. **Accessibility.** Root carries `role="img"` + `aria-label` (one sentence, no
   "image of") and a `<title>` child. Keep both in sync with the edited labels.
   Text-on-text contrast: labels use `--text`, captions `--text-muted` (both themes
   are ≥3:1 against the tinted fills; check custom tints before retinting).
6. **Canvas is `viewBox="0 0 800 450"`.** All components share it, so they align
   when stacked in a report section. `style="width:100%;height:auto"` makes them
   responsive. Change the canvas only for special layouts (keep aspect ratio ≥ 4:3).
7. **Print-safe.** Pure vector, no JS, no animation — the templates' `@media print`
   rules pass them through untouched. If you add `class="reveal"` from the graphics
   pack, the static state must equal the final state.

## Workflow: copy → edit → paste

1. **Pick** a component from the gallery (`open features/graphics/svg-library/gallery.html`),
   or from this catalog by intent.
2. **Read** the component's `svg/<name>.svg` — the header comment lists the tokens it
   uses and what to edit.
3. **Copy the `<svg>` element only** (skip the HTML comment when pasting).
4. **Edit in place**: replace placeholder labels, adjust counts (see per-file notes),
   swap `var(--token,#hex)` for a token the host template actually defines if needed
   (report/slide/bento define: `--text --text-muted --accent --teal --coral --green
   --amber --navy --deep-blue --surface --border`; dashboard omits the accent palette —
   use `--accent` + `--text-muted` there).
5. **Verify in the browser**, light and dark: labels legible, no clipping, arrows
   still land. Print preview if the artifact will be PDF'd.

## Maps

`world-dot-map` and `europe-tile-grid` are **illustrative** maps for slides and summaries:
the dot map's land mask is rasterised from [Natural Earth](https://www.naturalearthdata.com/) 1:110m
(public domain), tinted per continent, and draws **no country borders**; the tile grid gives every
country one equal square, placed approximately. Neither is a geographic reference. For sampling sites,
coordinates, choropleths or anything where position must be exact, use the `chartz` skill's GeoMap
engine (with `geocoding` for place names). The tile set follows the EU data-visualisation guide's
Europe grid (it includes XK, Kosovo); remove or add tiles as your context requires.

## Climate & environment

Eight components (54 to 61) cover common climate-communication visuals. Treat every number in them
as a **placeholder** unless its file cites a source: the stripes are a synthetic series, sector
shares, energy shares and sea-level scenarios are illustrative. The one sourced value is the
thermometer's ≈1.1 °C (IPCC AR6 WG1, 2011 to 2020 mean) against the Paris Agreement 1.5/2 °C limits.
When you fill them with real data, put the source in the diagram's caption line. For plotted series
(temperature anomalies, emissions over time) use `chartz` instead.

## Laboratory & life science

Ten components (62 to 71) cover lab and molecular-biology visuals. Their science is meant to be
**correct as drawn**: base pairing A–T / G–C (rung colours A amber, T coral, G teal, C deep-blue),
real codons (ATG GCT TCA GAA = Met-Ala-Ser-Glu in `central-dogma` and `mutation-types`, with the
frameshifts translated), DNA migrating toward the + electrode with ladder bands spaced by log10(size),
and the membrane drawn with heads out, tails in, sugar chains on the extracellular side. If you edit a
sequence, re-translate it; if you edit a gel, recompute band positions (formula in the file header).
Gel bands, plate assignments and workflow labels are illustrative.

## Standalone use (no HTML page)

For a diagram going into PowerPoint, Word, Keynote, Figma, Inkscape/Illustrator, a poster or a
paper, export it instead of pasting it. Those tools do not resolve `var()` or `color-mix()`, so a raw
library file renders black or blank there.

```
cp features/graphics/svg-library/svg/mind-map.svg ./my-map.svg   # edit the labels
node bin/svg-export.js ./my-map.svg --out figures/               # → figures/my-map.svg
node bin/svg-export.js ./my-map.svg --theme dark --out figures/  # → figures/my-map-dark.svg
node bin/svg-export.js mind-map org-chart --out figures/         # library names work too
```

The export bakes the slide palette (light or dark) into plain hex + `fill-opacity` /
`stroke-opacity`, drops the authoring comment, and sets `width="800" height="450"`. Dark exports also
get a background rect, since light text on a transparent canvas disappears on white pages. The script
fails if any `var()` or `color-mix()` would survive. Want PNG? Render the **exported** file.

## Adding a new component

1. Hand-draw it in `svg/<kebab-name>.svg` following the conventions above — agent-drawn
   SVG is the point of the library; treat the shipped files as style reference
   (rounded rx=12 cards — 8 for bars, 4–6 for slabs, 14 for large panels; 2px primary
   strokes, 1.5px shadows/leaders, 2.5px connectors, 3px spines; dashed 1.5px leaders
   start at a 3.5px dot). **Type scale (shared by all 71):** hero 20/700 (one central
   subject or headline) · label 16/600 · annotation 13/400 muted · caption 12/400 muted ·
   eyebrow 11/700 caps with `letter-spacing="1.2"` · badge number 13/700.
   **Arrowheads:** 13×13 on connectors, 11×11 on small cue arrows, 16×16 on thick spines
   (length × base, tip exactly on the target edge).
   **Signature look:** primary shapes get a "misregistered print" offset copy drawn
   underneath — same shape + `transform="translate(4 5)"` +
   `style="fill:color-mix(in srgb, var(--x) 22%, transparent);stroke:color-mix(in srgb, var(--x) 45%, transparent);stroke-width:1.5"`.
2. Add a `META` entry to `bin/build-svg-gallery.js` (desc + when-to-use).
3. Mirror the row in the catalog table above, and in the SKILL.md section if the
   component is generally useful.
4. Run `node bin/build-svg-gallery.js` — validation must pass (no ids, balanced tags,
   role/title/viewBox present).
5. Commit.