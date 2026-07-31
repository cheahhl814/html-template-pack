# html-template-pack

Three self-contained HTML templates — **report** (left-side sticky sidebar with 5 icon+label tabs, v2 offset-anchored annotations, theme toggle), **slide deck** (prev/next nav, inline v2 annotations, theme toggle), and **htmx dashboard** (topbar, KPI row, sparkline chart, activity feed, sortable table, demo-mode mock backend). All three are single-file, review-ready HTML with no external CDN dependencies beyond Google Fonts (report/slide) and pinned htmx with SRI (dashboard).

> **Repository**: https://github.com/cheahhl814/html-template-pack

## Installation (for the agent/harness)

This is an **agent skill**, not a user-facing library. The skill is loaded by the pi coding agent harness at `~/.pi/agent/skills/html-template-pack/`.

**For the agent/harness to discover this skill:**

1. Provide the repo URL to the agent harness (e.g. via skill configuration or AGENTS.md routing).
2. The harness clones the repo into its skills directory and picks up `SKILL.md` at startup.

Once installed, the skill is **auto-invoked**: when a user asks the agent for an HTML report, slide deck, or dashboard, the global `AGENTS.md` routes the request here automatically. No manual `cp` needed — the agent copies the appropriate template, fills in the content, and hands the user a ready-to-review `.html` file.

## What this skill does

### Report template (`templates/report/template.html`)

- **Sidebar**: 240px sticky left, 5 tabs (Summary / Metrics / Methodology / Findings / Annotations), collapses to horizontal strip <720px
- **Panels**: `<section data-panel="..." id="panel-...">` inside `.report-panels`
- **Annotations**: v2 (offset-anchored, multi-tab aware, 4 types: comment/delete/insert/replace, JSON import/export)
- **Components** (shared with slide): `.card`, `.badge`, `.stat-card`, `table`, `.layer-stack`, `.chain-step`, `.grid-2/3`, `.eyebrow`, `.badge-line`, `.meta-card`, Mermaid
- **Print**: sidebar hidden, all panels sequential with page breaks
- **Best for**: research reports, grant progress, manuscript reading versions, gap analyses, EOI drafts

### Slide template (`templates/slide/slide-template.html`)

- **Pattern**: single-page prev/next deck with dots, counter, fullscreen, home button
- **Annotations**: v2 with per-slide `data-panel` for cross-slide navigation
- **Components**: same tokens + 2 reference slides showing every reusable block
- **Print**: one slide per page PDF
- **Best for**: pitch decks, conference talks, lightning talks, summary decks (≤12 slides)

### Dashboard template (`templates/dashboard/dashboard-template.html`)

- **Pattern**: fixed topbar + sidebar + content grid (KPI row, sparkline, feed, sortable table)
- **htmx wiring**: `hx-get` + `hx-trigger="load, every Ns"` (polling), `hx-trigger="keyup changed delay:300ms"` (debounced search), `hx-vals` (sort state)
- **Backend contract**: `/api/stats|chart|activity|table` return **HTML fragments**, not JSON
- **Demo mode**: ships on by default — works instantly without a backend; delete `data-demo-mode` and the `« BEGIN/END DEMO MODE »` block once real endpoints exist
- **Annotations**: intentionally none (live data shifts under anchors)
- **Best for**: ops dashboards, admin panels, status pages, internal metrics

## When to use which template

| Content shape | Template | Why |
|---------------|----------|-----|
| ≥3 long sections, prose, charts, references, appendices | **Report** | Multi-tab sidebar handles 20+ sections; reviewer switches tabs, leaves comments per tab, exports one JSON |
| ≤12 visual beats, bullets + headings, one idea per slide | **Slide** | Single-page deck, prev/next nav, fullscreen, slide-per-page PDF |
| Live/polling data — KPIs, status tables, ops metrics | **Dashboard** | htmx-driven shell wired to `/api/*` endpoints; demo-mode works instantly |

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

## Pipeline (what the agent does)

1. **Decide** — apply decision rubric (see SKILL.md)
2. **Copy** — `cp templates/<type>/*.html` to project; set `<title>` + `data-report-id` / `DECK_CONFIG` / topbar title
3. **Adapt** — replace demo content with real content
4. **Render** — open in browser; verify theme toggle, annotations, print
5. **Wire** — unique `data-annot-storage` (report), `DECK_CONFIG.storageKey` (slide), remove demo-mode + connect real `/api/*` (dashboard)

## Annotation system (report + slide)

> **Audience: human reviewers.** The other sections of this README document what
> the agent/harness should do. This section is for the *human* who opens the
> rendered HTML in a browser and wants to leave review notes. The agent does
> not interact with the annotation UI directly.

Reviewers can leave tracked-changes-style notes on any text in the rendered HTML. Annotations persist to localStorage and can be exported as JSON for downstream revision.

### How to leave an annotation

1. **Select text** in any panel/slide. A floating toolbar appears with 4 pills:
   - 💬 **Comment** — leave a note on the selected text
   - ✂ **Delete** — strike the text, optionally provide a comment explaining why
   - ➕ **Insert** — click the `Insert` button (top-right), then click any point to drop a caret marker with proposed new text
   - ✎ **Replace** — strike the text and show a suggested replacement

2. **Open the Notes panel** (top-right `💬 Notes` button) to see all annotations. The drawer shows a sorted list with quotes, types, and headings.

3. **Click a drawer entry** to jump back to the highlighted text in the document. In the report template, this also activates the correct tab if the annotation is in a different panel.

4. **Edit or delete** any annotation from the drawer entry.

### Exporting and importing

- **Export**: `Notes panel → 💾 Export` downloads `annotations-<id>.json` (or copies to clipboard). The JSON includes `type`, `quote`, `prefix`, `suffix`, `heading`, `panel`, plus `replacement` for insert/replace.
- **Hand-off to AI**: Once you have the exported JSON, **pass it to your AI coding agent/harness** along with the HTML file. The agent will read the JSON, apply each annotation (`comment` / `delete` / `insert` / `replace`) to the source content, and produce a revised HTML file. Each annotation's `replacement` field carries the suggested new text for insert/replace — the agent does not need to parse free-text intent.
- **Import**: `Notes panel → ⬆ Import` merges by annotation id. Useful for syncing review state across machines, or for re-loading annotations after the HTML has been revised.
- **Orphaned annotations** (text changed and offsets no longer resolve) show with a red border + warning in the drawer.

### Storage and namespaces

- Report: `localStorage["annotations:<id>"]` where `<id>` is the value of `<body data-annot-storage>` (default `report-template`)
- Slide: `localStorage["annotations:slide-template"]` (set via `DECK_CONFIG.storageKey`)
- Set a unique `<body data-annot-storage="my-report-2026-q3">` per project so reviews don't collide

### Feature matrix

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

## Theme toggle

All three: `◐`/`◑` button, persists to localStorage, honours `prefers-color-scheme`, switches via `[data-theme]` on `<html>`, hidden in print. Report/slide: fixed top-right; dashboard: inline in topbar.

## Density and font-size toggles (report only)

Two optional toggles in the report template's top-right cluster, independent of the theme toggle:

| Toggle | Cycles | Storage key | Affects |
|--------|--------|-------------|---------|
| `▤` / `▥` | `comfortable` ↔ `compact` | `report-density` | Spacing tokens (`--pad-card`, `--pad-cell`, `--gap-grid`) for data-heavy reports |
| `S` / `M` / `L` | `S` → `M` → `L` → `S` | `report-font-size` | Root `font-size` (14 / 16 / 18px) — all `rem` text scales proportionally |

Both persist to `localStorage` independently of the theme and reset to defaults on print for predictable layout.

## Hard invariants

- UI always reachable (theme, annotations, navigation)
- Annotations persist across reloads (valid JSON or fresh start)
- Print works cleanly (report/slide primary; dashboard secondary)
- Single-file portable (only Google Fonts + pinned htmx SRI allowed external)
- Dashboard demo-mode never ships to production