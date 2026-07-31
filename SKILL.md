---
name: html-template-pack
description: Three self-contained HTML templates — report (left-side sticky sidebar with 5 icon+label tabs, theme toggle, offset-anchored annotations, JSON export), slide deck (prev/next nav, theme toggle, inline annotations, JSON export), and htmx dashboard (topbar, KPI row, sparkline, activity feed, sortable table, demo-mode mock backend). Pick report for ≥3 long sections, slide for ≤12 visual beats, dashboard for live/polling data. Invoke for "HTML report", "HTML deck", "HTML page", "annotated report", "review-ready HTML", "slide deck", "HTML dashboard", "htmx dashboard", "ops dashboard", "admin panel", or MD/DOCX/PDF → HTML conversion. Report and slide ship the v2 annotation system; dashboard intentionally omits annotations (live data is not a stable anchor target).
version: 0.6.0
license: MIT
---

# html-template-pack

Three production-grade HTML templates, each self-contained (no external CDN dependencies beyond Google Fonts / htmx when used). The report and slide templates carry the v2 review/annotation system and the light/dark theme toggle; the dashboard template carries the theme toggle plus an htmx-driven live-data shell. The report and slide templates were battle-tested on the Tengah Islands Conservation gap-report (Sultan Iskandar Marine Park, Johor, Malaysia) in 2026.

## When to invoke

**Invoke `html-template-pack` whenever** the user asks for an HTML artifact that is meant to be **read and reviewed by a human**, not just rendered for screen-sharing or embedding. Concrete triggers:

- "Build me an HTML report from `<path/to/file.md>`"
- "Make this Markdown into a reviewable HTML page"
- "Create a slide deck about X"
- "Convert this DOCX / PDF to a deck"
- "I need a single-file HTML the team can comment on"
- "Generate the grant submission recap as HTML"
- "Make a reading version of my manuscript"

**Do not invoke** for:

- Web apps (form handlers, login pages) → use `frontend-create` / `pi-frontend-create`
- One-shot visual diagrams (no review needed) → use `lumen-mermaid`
- Slide decks for live presentation / screen sharing only (no review) → use `lumen-slides`

Interactive data dashboards now live in **this** skill (the dashboard template) rather than being routed elsewhere — see the table below. Still route to `lumen-diagram` / `lumen-chart` if the user wants a diagram/chart *embedded inside* the report template, not a standalone dashboard page.

## Which template to use

| If the content has…                                                      | Use                                                                               | Why                                                                                                                                                                                 |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥3 long sections, lots of prose, charts, references, appendices          | **report template** (`templates/report/template.html`)                            | Multi-tab lumen-guide pattern handles 20+ sections cleanly. Tab navigation + Mermaid diagrams work together. Reviewer can switch tabs, leave comments per tab, export one JSON.     |
| ≤12 discrete visual beats, one idea per slide, mostly bullets + headings | **slide template** (`templates/slide/slide-template.html`)                        | Single-page deck with prev/next nav, fullscreen mode, slide-per-page print. Reviewer scrolls through slides linearly.                                                               |
| Live/polling data — KPIs, status tables, ops metrics, admin views        | **dashboard template** (`templates/dashboard/dashboard-template.html`)            | htmx-driven shell (topbar, stat row, sparkline chart, activity feed, sortable/filterable table) wired to `/api/*` endpoints. Not for review/annotation — for monitoring live state. |
| Mixed: both a long-form report AND a summary deck                        | **report template as the canonical**, link to the deck as a downloadable artifact | Don't ship two HTMLs. The report template is the review surface; if the user also wants a separate deck, build that as a second file in the same project directory.                 |

### Decision rubric (use this in your first response)

1. **Count the sections in the source content.** If ≥3 sections each > 1 page, → **report template**.
2. **If mostly bullets + headings + one idea per slide**, → **slide template**.
3. **If the user wants live/polling data — metrics, status, KPIs, an admin/ops view backed by a server**, → **dashboard template**.
4. **If user says "report" or "manuscript reading version" or "review page"**, → **report template**.
5. **If user says "deck" or "slides" or "presentation"**, → **slide template** (unless they say "review deck", which means a long-form reading artifact — use the report template).
6. **If user says "dashboard", "admin panel", "ops view", "htmx dashboard", or wants filtering/sorting/polling against live data**, → **dashboard template**.
7. **When in doubt, ask the user** with `ask_user_question` offering the template options.

## Files in this skill

```
~/.pi/agent/skills/html-template-pack/
├── SKILL.md                                    ← you are here
├── AGENTS.md                                   ← how the agent should auto-apply this skill
├── templates/
│   ├── report/
│   │   └── template.html                       ← finalized report template (812 lines)
│   ├── slide/
│   │   └── slide-template.html                 ← finalized slide template (817 lines)
│   └── dashboard/
│       └── dashboard-template.html              ← finalized dashboard template (htmx + demo-mode mock backend)
├── features/
│   ├── report/
│   │   ├── highlight-annotate.js               ← v2 offset-anchored annotations (602 lines)
│   │   ├── annotate.css                        ← annotation styles (216 lines)
│   │   ├── theme-toggle.js                     ← light/dark toggle (66 lines)
│   │   └── theme-toggle.css                    ← toggle styles (16 lines)
│   ├── slide/
│   │   ├── highlight-annotate.js               ← same v2 engine, available as upgrade
│   │   ├── annotate.css                        ← same v2 styles
│   │   ├── theme-toggle.js                     ← same toggle
│   │   └── theme-toggle.css                    ← same styles
│   └── dashboard/
│       ├── theme-toggle.js                     ← same toggle engine (no fixed positioning; lives in the topbar)
│       └── theme-toggle.css                    ← same toggle styles, unpositioned
└── test/
    ├── smoke-test-report.js
    ├── smoke-test-slide.js
    ├── smoke-test-dashboard.js
    └── run-all.js
```

## The three templates at a glance

### Report template (`templates/report/template.html`)

**Pattern**: left-side sticky sidebar (240px, 5 tabs: Summary / Metrics / Methodology / Findings / Annotations) with icon + label per tab; collapses to horizontal strip on screens `<720px`. Each tab maps to a `<section data-panel="..." id="panel-...">` panel in the content area. Active tab gets a coloured left border (`--accent`) and dimmed background (`--accent-dim`).

**Annotation system**: **v2** (offset-anchored, multi-tab aware, JSON import+export, orphaned-state detection, **4 annotation types**: comment / delete / insert / replace). The UI uses `mark.annot` / `#annot-toggle` / `.annot-drawer` / `.annot-toolbar` / `#annot-editor`. Panel uses `data-annot-storage` to namespace by report. Types: comment, delete, insert, replace — delete/replace strike the original inline and show the suggested replacement; insert drops a caret marker with the proposed text. The v2 engine's `jumpTo` activates the correct tab/panel via `[data-tab]` buttons before scrolling — seamless cross-tab navigation from the annotation drawer.

**Component library**: shared with the slide template (token-driven, so the same markup works in either template's brand palette): `.card` (with `.highlight`/`.warning`/`.success`/`.info` variants), `.badge` (with `.green`/`.teal`/`.amber`/`.blue` variants), `.stat-card` + `.stat-grid` for KPI blocks, `table` with navy header strip and slate borders, `.layer-stack` (with `.layer-1`..`.layer-5` color variants) for multi-stage processes, `.chain-step` + `.chain-arrow` for causal narratives, `.grid-2` / `.grid-3` for card layouts, `.eyebrow` (with `.eyebrow-teal`/`.coral`/`.amber`/`.green`/`.navy` variants) for section labels, `.badge-line` for above-title pills, `.meta-card` + `.meta-grid` for project/event metadata, Mermaid diagrams (Mermaid 10+ via CDN), theme toggle button.

**Print**: `@media print` hides sidebar, shows all panels sequentially with page breaks. `beforeprint` event re-renders Mermaid. Tested with `google-chrome --headless --print-to-pdf`.

**Self-contained**: All CSS inline, scripts are local (in `features/report/`), Mermaid via CDN. Single-file output when you copy the CSS/JS in.

**Best for**: long-form research reports, grant progress reports, manuscript reading versions, gap analyses, EOI drafts.

### Slide template (`templates/slide/slide-template.html`)

**Pattern**: single-page prev/next deck with dots, counter, fullscreen, home button, slide-per-page print.

**Annotation system**: **v2** (offset-anchored, 4 types: comment/delete/insert/replace, JSON import+export, orphaned-state detection, per-slide `data-panel` for cross-slide navigation). Inline CSS + JS (inlined from `features/slide/{annotate.css,highlight-annotate.js}`). The UI uses `mark.annot` / `.annot-toggle` / `.annot-toolbar` / `.annot-editor` / `.annot-drawer` / `.annot-insert-toggle`. Panel uses localStorage key `annotations:slide-template` (set via `data-annot-storage` on `<body>`; change the body attribute to namespace per deck). A small inline adapter wraps `__deckGoTo` so clicking a drawer item switches slides first, then scrollIntoView fires.

**Component library**: tokens (slate-50 to slate-900 + brand teal/coral/amber/navy), `.card.highlight/warning/success/info`, `.badge-*`, `.stat-card`, `.layer-stack`, `.chain-step`, `+ 2 component reference slides` showing every reusable block.

**Print**: `@media print` hides UI chrome and forces `slide { position: static; page-break-after: always; height: 100vh; }` — one slide per page PDF.

**Self-contained**: All CSS inline, all JS inline. No external dependencies. Drop the file anywhere.

**Best for**: pitch decks, conference talks, lightning talks, research summary decks, internal readouts (≤12 slides).

### Dashboard template (`templates/dashboard/dashboard-template.html`)

**Pattern**: fixed topbar + sidebar nav + content grid — KPI stat row, a sparkline chart panel, a recent-activity feed, and a sortable/filterable/searchable data table. Everything is wired with **htmx** (`hx-get` + `hx-trigger="load, every Ns"` for polling, `hx-trigger="keyup changed delay:300ms"` for debounced search, `hx-vals` for carrying sort state) instead of a JS framework.

**Backend contract**: the four endpoints (`/api/stats`, `/api/chart`, `/api/activity`, `/api/table`) must return **HTML fragments**, not JSON — htmx swaps whatever comes back straight into the target element. `/api/chart` returns a ready-to-swap `<svg>`; the others return markup matching the structure already inside their target (stat cards, `<li>` feed items, `<tr>` table rows).

**Demo mode (ships on by default)**: the template is *not* wired to a real server out of the box. A `data-demo-mode` attribute on `<body>` plus a small `XMLHttpRequest` shim (marked with `« BEGIN/END DEMO MODE »` banners near the end of `<body>`) intercepts every request to `/api/*` and answers it from an embedded mock dataset (`DASHBOARD_MOCK`), so the file opens in a browser and is fully interactive — filtering, sorting, polling, pause/resume — before any backend exists. **Delete the demo-mode block and the `data-demo-mode` attribute once a real backend is wired**; every `hx-get`/`hx-trigger`/`hx-vals` attribute in the markup is already what you'd point at production routes and does not change.

**Component library**: same design tokens as the report/slide templates (`--bg`, `--surface`, `--accent`, etc.) plus dashboard-only additions: `.stat-card`, `.panel`, `.chart-wrap` (inline SVG sparkline), `.feed` (activity list), `.badge.success/warning/error/info`, sortable `<th data-sort-key>`.

**Annotation system**: **none, intentionally**. Live/polling data is not a stable annotation target — highlighted text would shift underneath its anchor on every refresh. If the user needs reviewer comments on a snapshot of dashboard data, export a static report instead (report template), don't annotate this page.

**Theme toggle**: same engine as the other two templates, but unpositioned (`position: fixed` removed) since it sits inline in the topbar rather than floating over content.

**Self-contained**: all CSS/JS inline or local (`features/dashboard/`) except the htmx CDN script, which is pinned to `htmx.org@2.0.4/dist/htmx.min.js` with a verified SRI `integrity` hash — the one external dependency, same precedent as Mermaid for the report template. Never drop the `integrity`/`crossorigin` attributes when bumping the version; recompute the hash (`curl` the exact file, `openssl dgst -sha384 -binary | openssl base64 -A`) and update both.

**Best for**: ops dashboards, admin panels, status pages, internal metrics views — anything meant to be watched/interacted with live, not read and annotated.

## Pipeline (Decide → Copy → Adapt → Render → Wire annotation / backend)

1. **Decide** — apply the decision rubric above. If unsure, ask the user.
2. **Copy** — copy `templates/<report|slide|dashboard>/*.html` to the project's working directory. Set the `<title>` and the `data-report-id` (report) / `DECK_CONFIG` (slide) / topbar title + `data-report-id` (dashboard) at the top.
3. **Adapt**:
   - Report: replace each `<main class="content" data-annot-root data-panel="...">` with the section content.
   - Slide: replace each `<section class="slide slide-title active" id="...">` with the slide content. The reference slides can be deleted after the user has copied the components they need.
   - Dashboard: adjust the sidebar nav links, stat/table/chart column meaning to match the real data, and — once a backend exists — replace `DASHBOARD_MOCK`'s four routes with real server routes returning the same fragment shapes.
4. **Render** — open the HTML in a browser. Check that the theme toggle works; for report/slide, that the annotation drawer opens and keyboard nav works (slides) and print preview looks clean; for dashboard, that the KPI row/chart/feed/table populate and that search/sort/filter/pause-resume all work.
5. **Wire annotation / backend**:
   - Report: verify the storage key is unique (don't reuse keys from other reports); set `data-annot-storage="my-report-2026-q3"` on `<body>`.
   - Slide: set `DECK_CONFIG.storageKey` in the inline script.
   - Dashboard: once a real backend serves `/api/stats|chart|activity|table`, delete the `« BEGIN/END DEMO MODE »` script block and the `data-demo-mode` attribute on `<body>`. Nothing else in the markup changes.

## Annotation system — what ships in the box

The report and slide templates ship with a full annotation system; the dashboard template intentionally ships **none** (see its section above for why).

| Feature                                               | Report template (v2)     | Slide template (v2)               |
| ----------------------------------------------------- | ------------------------ | --------------------------------- |
| Select text → floating comment pill                   | ✓ (3-button toolbar)     | ✓ (3-button toolbar)              |
| Side drawer with list of annotations                  | ✓ (right-side drawer)    | ✓ (right-side drawer)             |
| Click highlight to jump to drawer entry               | ✓                        | ✓ (with slide-jump adapter)       |
| Edit + delete existing annotations                    | ✓                        | ✓                                 |
| Export JSON                                           | ✓ (download + clipboard) | ✓ (download + clipboard)          |
| Import JSON (merge by id)                             | ✓                        | ✓                                 |
| Orphaned-state detection                              | ✓ (red border + warning) | ✓ (red border + warning)          |
| Multi-tab panel activation on jump                    | ✓ (uses `[data-tab]`)    | ✓ (uses `[data-panel]` per slide) |
| Anchor on offsets (survives Mermaid re-render)        | ✓                        | ✓                                 |
| Annotation types: comment / delete / insert / replace | ✓                        | ✓                                 |
| localStorage namespace                                | `annotations:<id>`       | `annotations:slide-template`      |

**Both report and slide templates ship the v2 annotation engine as of v0.4.0.** The slide template's inline CSS+JS are kept in sync with `features/slide/{annotate.css,highlight-annotate.js}` (the two `features/*` copies are also byte-identical to the report's `features/report/*` — see the invariant below). If you want a different annotation UI surface (e.g. a tooltip instead of a drawer, or a comment-only single-button toolbar), edit one place: the inline block in `templates/slide/slide-template.html`.

## Theme toggle

All three templates have a `◐ dark` / `◑ light` button. Report and dashboard templates use `features/*/theme-toggle.js`. Slide template uses an inline equivalent (4 lines). All of them:

- Persist to localStorage (dashboard uses its own key, `dashboard-theme`, so it doesn't collide with a report/slide open in the same origin)
- Honour `prefers-color-scheme` on first visit
- Switch every component (cards, badges, stats, Mermaid, dashboard panels) via `[data-theme]` attribute on `<html>`
- Hidden in print

Positioning differs: report/slide float the button `position: fixed` top-right; the dashboard places it inline in the topbar (no `position: fixed`), since the topbar is already a persistent chrome element.

## Hard invariants (do not lower)

- **All UI must remain reachable**: theme toggle (◐), annotation panel (💬, report/slide only), navigation (slide template: prev/next/dots, report template: tab strip, dashboard: sidebar + table toolbar). Never hide these without a visible alternative.
- **Annotations must persist across reloads** (report/slide). localStorage must remain valid JSON at all times. If parsing fails, start fresh — never crash the page.
- **Print must work cleanly** (report/slide; dashboard hides topbar/sidebar/table actions in `@media print` but is not designed as a primary print artifact — recommend the report template for anything that must be printed/PDF'd).
- **Single-file portability**: when a user copies the HTML to a new project, all CSS/JS must work without external CDN (Google Fonts and the pinned htmx CDN script with SRI are the only allowed exceptions; everything else must be inlined or local).
- **Dashboard demo mode must never silently ship to production**: when adapting the dashboard template for a real deployment, always confirm the `« BEGIN/END DEMO MODE »` block and `data-demo-mode` attribute were removed once real `/api/*` routes exist — a demo mock left in place will mask a missing/broken backend.

## Sources

- `template.html` and `slide-template.html` (Dr. Cheah Hong Leong, Tengah Islands gap-report, 2026-07) — battle-tested templates
- `dashboard-template.html` (added 2026-07-11) — htmx dashboard shell, new template family for live/polling data views
- v2 annotation engine + theme toggle (`features/{report,slide}/highlight-annotate.js`, `annotate.css`, `theme-toggle.js`, `theme-toggle.css`) — extracted from the original template on 2026-07-10 (renamed to `html-template-pack` from its previous internal codename; see the 2026-07-10 wiki entry on the v1→v2 offset-anchored annotation upgrade for the rename history)
- v2 tracked-changes annotation types — `comment` / `delete` / `insert` / `replace` added 2026-07-30 to the report template (see `docs/specs/2026-07-30-tracked-changes-annotations-design.md` + `docs/plans/2026-07-30-tracked-changes-annotations.md`); selection-based delete/replace reuse the floating-pill flow, insert is caret-based via an `Insert here` arm/click toggle. The `replacement` field carries suggested new text for insert/replace; exported JSON includes `type` + `replacement` per annotation so a downstream (human or AI) revision agent can apply the changes without parsing free-text intent. The same v2 engine + tracked-changes types were ported into the slide template on 2026-07-30 (v0.4.0), with a small per-slide adapter: each `<section class="slide">` gets `data-panel="<id>"`; the inline adapter switches slides (`__deckGoTo`) before the engine's scrollIntoView when a drawer item is clicked.
- Shared component library — `.card` / `.badge` / `.stat-card` / table / `.layer-stack` / `.chain-step` / `.grid-2` / `.eyebrow` / `.badge-line` / `.meta-card` originated in the slide template (extracted from the Tengah Islands gap-report on 2026-07). In v0.5.0 the same component CSS was pasted into the report template with a shared token palette (10-step `--slate-*` neutral scale + `--teal`/`--coral`/`--green`/`--amber`/`--deep-blue`/`--navy`/`--white` accent colors) so the same markup renders correctly in either template. The slide template's brand colors (teal/coral/green) and the report's blue/neutral palette both work; the components are token-driven, not template-specific.
- `htmx` (BSD-2-Clause) — the hypermedia library driving the dashboard template's polling, debounced search, and partial swaps
- `lumen-guide` — the multi-tab pattern used by the report template
- `zarazhangrui/beautiful-html-templates` (MIT) — color token inspiration for the report template
