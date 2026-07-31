# html-template-pack

Three self-contained HTML templates — **report** (left-side sticky sidebar with 5 icon+label tabs, v2 offset-anchored annotations, theme toggle), **slide deck** (prev/next nav, inline v2 annotations, theme toggle), and **htmx dashboard** (topbar, KPI row, sparkline chart, activity feed, sortable table, demo-mode mock backend). All three are single-file, review-ready HTML with no external CDN dependencies beyond Google Fonts (report/slide) and pinned htmx with SRI (dashboard).

> **Repository**: https://github.com/cheahhl814/html-template-pack

## Quick start

```bash
# Copy a template to your project
cp ~/.pi/agent/skills/html-template-pack/templates/report/template.html ./my-report.html
# Edit the title, data-report-id, and replace the demo content
# Open in browser — theme toggle, annotations, print all work out of the box
```

## When to use which template

| Content shape | Template | Why |
|---------------|----------|-----|
| ≥3 long sections, prose, charts, references, appendices | **Report** | Multi-tab sidebar handles 20+ sections; reviewer switches tabs, leaves comments per tab, exports one JSON |
| ≤12 visual beats, bullets + headings, one idea per slide | **Slide** | Single-page deck, prev/next nav, fullscreen, slide-per-page PDF |
| Live/polling data — KPIs, status tables, ops metrics | **Dashboard** | htmx-driven shell wired to `/api/*` endpoints; demo-mode works instantly |

**Decision**: if ≥3 sections > 1 page each → **report**; if bullets + one idea per slide → **slide**; if "dashboard", "admin panel", "live metrics" → **dashboard**.

## Cross-skill routing

| User asks for… | Route to… |
|----------------|-----------|
| Web app (forms, login, interactivity) | [`pi-frontend-create`](https://github.com/cheahhl814/pi-frontend-create) |
| One-shot diagram (no review) | [`lumen-mermaid`](https://github.com/the-forge-flow/lumen) |
| Live presentation only (no review) | [`lumen-slides`](https://github.com/the-forge-flow/lumen) |
| Diagram/chart *embedded* in report | [`lumen-diagram`](https://github.com/the-forge-flow/lumen) / [`lumen-chart`](https://github.com/the-forge-flow/lumen) |

## Report template details

- **Sidebar**: 240px sticky left, 5 tabs (Summary / Metrics / Methodology / Findings / Annotations), collapses to horizontal strip <720px
- **Panels**: `<section data-panel="..." id="panel-...">` inside `.report-panels`
- **Annotations**: v2 (offset-anchored, multi-tab aware, 4 types: comment/delete/insert/replace, JSON import/export)
- **Components** (shared with slide): `.card`, `.badge`, `.stat-card`, `table`, `.layer-stack`, `.chain-step`, `.grid-2/3`, `.eyebrow`, `.badge-line`, `.meta-card`, Mermaid
- **Print**: sidebar hidden, all panels sequential with page breaks
- **Best for**: research reports, grant progress, manuscript reading versions, gap analyses, EOI drafts

## Slide template details

- **Pattern**: single-page prev/next deck with dots, counter, fullscreen, home button
- **Annotations**: v2 with per-slide `data-panel` for cross-slide navigation
- **Components**: same tokens + 2 reference slides showing every reusable block
- **Print**: one slide per page PDF
- **Best for**: pitch decks, conference talks, lightning talks, summary decks (≤12 slides)

## Dashboard template details

- **Pattern**: fixed topbar + sidebar + content grid (KPI row, sparkline, feed, sortable table)
- **htmx wiring**: `hx-get` + `hx-trigger="load, every Ns"` (polling), `hx-trigger="keyup changed delay:300ms"` (debounced search), `hx-vals` (sort state)
- **Backend contract**: `/api/stats|chart|activity|table` return **HTML fragments**, not JSON
- **Demo mode**: ships on by default — works instantly without a backend; delete `data-demo-mode` and the `« BEGIN/END DEMO MODE »` block once real endpoints exist
- **Annotations**: intentionally none (live data shifts under anchors)
- **Best for**: ops dashboards, admin panels, status pages, internal metrics

## Files

```
html-template-pack/
├── SKILL.md                         ← agent instructions (this skill)
├── AGENTS.md                        ← human wiring guide
├── templates/
│   ├── report/template.html         ← report template (~812 lines)
│   ├── slide/slide-template.html    ← slide template (~817 lines)
│   └── dashboard/dashboard-template.html ← dashboard template
├── features/
│   ├── report/                      ← v2 annotation engine + theme toggle
│   ├── slide/                       ← same v2 engine (kept in sync)
│   └── dashboard/                   ← theme toggle only (no fixed positioning)
└── test/
    ├── smoke-test-report.js
    ├── smoke-test-slide.js
    ├── smoke-test-dashboard.js
    └── run-all.js
```

## Pipeline

1. **Decide** — apply decision rubric (see SKILL.md)
2. **Copy** — `cp templates/<type>/*.html` to project; set `<title>` + `data-report-id` / `DECK_CONFIG` / topbar title
3. **Adapt** — replace demo content with real content
4. **Render** — open in browser; verify theme toggle, annotations, print
5. **Wire** — unique `data-annot-storage` (report), `DECK_CONFIG.storageKey` (slide), remove demo-mode + connect real `/api/*` (dashboard)

## Annotation system (report + slide)

| Feature | Report | Slide |
|---------|--------|-------|
| Select → floating pill (comment/delete/insert/replace) | ✓ | ✓ |
| Right-side drawer with list | ✓ | ✓ |
| Click highlight → jump to drawer | ✓ | ✓ (slide-jump adapter) |
| Edit/delete existing | ✓ | ✓ |
| Export JSON (download + clipboard) | ✓ | ✓ |
| Import JSON (merge by id) | ✓ | ✓ |
| Orphaned-state detection | ✓ | ✓ |
| Multi-tab/slide activation on jump | ✓ (`[data-tab]`) | ✓ (`[data-panel]`) |
| Offset anchors (survive Mermaid re-render) | ✓ | ✓ |
| localStorage namespace | `annotations:<id>` | `annotations:slide-template` |

## Theme toggle

All three: `◐`/`◑` button, persists to localStorage, honours `prefers-color-scheme`, switches via `[data-theme]` on `<html>`, hidden in print. Report/slide: fixed top-right; dashboard: inline in topbar.

## Hard invariants

- UI always reachable (theme, annotations, navigation)
- Annotations persist across reloads (valid JSON or fresh start)
- Print works cleanly (report/slide primary; dashboard secondary)
- Single-file portable (only Google Fonts + pinned htmx SRI allowed external)
- Dashboard demo-mode never ships to production

## Related skills

- [`pi-frontend-create`](https://github.com/cheahhl814/pi-frontend-create) — production-grade web components/apps
- [`lumen-mermaid`](https://github.com/the-forge-flow/lumen) — one-shot Mermaid diagrams
- [`lumen-slides`](https://github.com/the-forge-flow/lumen) — presentation-only slide decks
- [`lumen-diagram`](https://github.com/the-forge-flow/lumen) — architecture/flow/sequence diagrams
- [`lumen-chart`](https://github.com/the-forge-flow/lumen) — data charts (bar/pie/line/table)
- [`lumen-guide`](https://github.com/the-forge-flow/lumen) — multi-tab guides (pattern used by report template)

## Sources

- `template.html` + `slide-template.html` (Tengah Islands gap-report, 2026-07) — battle-tested
- `dashboard-template.html` (2026-07-11) — htmx dashboard shell
- v2 annotation engine + theme toggle (`features/{report,slide}/*`) — extracted 2026-07-10
- v2 tracked-changes types (comment/delete/insert/replace) — added 2026-07-30 to report, ported to slide 2026-07-30 (v0.4.0)
- Shared component library — originated in slide (2026-07), pasted to report v0.5.0 with shared token palette
- `htmx` (BSD-2-Clause) — hypermedia library for dashboard
- `lumen-guide` — multi-tab pattern for report
- `zarazhangrui/beautiful-html-templates` (MIT) — color token inspiration