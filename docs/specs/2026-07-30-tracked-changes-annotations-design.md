# Tracked-changes annotation types (design)

Date: 2026-07-30
Status: approved by user, ready for implementation plan

## Problem

The v2 annotation engine (`features/{report,slide}/highlight-annotate.js`) only
supports one annotation kind: a free-text comment attached to a highlighted
span. To ask for a deletion or a text swap, the reviewer has to write it out
in prose ("delete this" / "replace with ..."), and downstream (an AI doing the
revision) has to parse that prose to figure out the intended edit. This is
extra friction on both ends and is not mechanically reliable.

## Goal

Add three new annotation types — `delete`, `insert`, `replace` — alongside
the existing `comment` type, each carrying **structured** edit intent
(what to remove / what to add) instead of relying on free text. Exported JSON
carries this structure so a human or AI applying the changes doesn't need to
infer intent from prose.

## Scope

Applies to the v2 annotation engine only:
- `features/report/highlight-annotate.js` + `features/report/annotate.css`
- `features/slide/highlight-annotate.js` + `features/slide/annotate.css`
- The inline copy of this engine wired into `templates/report/template.html`
- `test/smoke-test-report.js`, `test/smoke-test-slide.js`
- `SKILL.md` (annotation feature table + schema docblock)

Out of scope: the slide template's default v1 inline annotation system is
untouched. If a user upgrades a given slide deck to v2 (already a documented
path in SKILL.md), it picks up these types for free since it's the same
engine files.

## Data model

Each annotation gains two fields:

```
{
  id, quote, comment, prefix, suffix,   // unchanged anchoring fields
  start, end,                            // unchanged offset fields
  panel, sectionHeading,
  createdAt, updatedAt, orphaned,

  type,          // "comment" | "delete" | "insert" | "replace"  (default: "comment")
  replacement    // string — suggested new text for "insert"/"replace"; unused for "comment"/"delete"
}
```

- `comment` is still allowed on every type as an optional rationale note
  (e.g. a `replace` can carry both `replacement` and a `comment` explaining
  why).
- Missing/absent `type` on load or import is treated as `"comment"` — fully
  backward compatible with existing exported JSON and existing localStorage
  data. No migration step needed.
- `insert` anchors to a **collapsed** point: `start === end`, `quote: ""`.
  Resolution for insert can't match on `quote` (it's empty), so `resolve()`
  falls back to locating the concatenated `prefix + suffix` in the current
  full text and using the offset right after `prefix`'s length as the
  insertion point.

## Interaction flow

**Selection-based (delete / replace / comment):**
The existing single `💬 Comment` floating pill becomes a 3-button group:
`💬 Comment`, `✂ Delete`, `✎ Replace`. Clicking one opens the editor
pre-configured for that type:
- Comment: textarea only (unchanged from today).
- Delete: shows the struck-through preview of the selected quote, an
  optional comment field, and a "Confirm delete" save action. No
  `replacement` is collected.
- Replace: shows the struck-through original quote, a required
  "Replacement text" textarea, and an optional comment field.

**Caret-based (insert):**
Selection pills don't apply when nothing is selected. A new `➕ Insert here`
toggle button sits next to the existing `💬 Notes` toggle. Clicking it arms
insert-mode (a status hint appears: "Click a point in the text to insert").
The next click inside the annotation root captures the caret offset via the
existing `offsetOf()` helper, disarms insert-mode, and opens the editor with
a required "Text to insert" textarea.

**Editing:** Reopening an existing annotation from the drawer reuses the
same type-specific editor. The `type` itself is fixed after creation —
if the reviewer picked the wrong type, they delete and recreate rather than
converting in place. Keeps the editor logic simple (no dynamic re-anchoring
between quote-based and caret-based types).

## Rendering

| Type | Markup | Style |
|---|---|---|
| `comment` | `mark.annot` (unchanged) | existing accent highlight + underline |
| `delete` | `mark.annot.annot-delete` | `text-decoration: line-through`, tinted with `--annot-delete` (red-family) |
| `replace` | `mark.annot.annot-replace` immediately followed by `<ins class="annot-insert-text">` | original struck-through in `--annot-delete`; `<ins>` shows `replacement` in `--annot-insert` (green-family) |
| `insert` | `<span class="annot-caret" data-annot-id="...">` immediately followed by `<ins class="annot-insert-text">` | thin caret marker at the collapsed offset; `<ins>` shows `replacement` in `--annot-insert` |

All four remain clickable → jump-to-drawer-entry, same as today's
`mark.annot` behavior (the click handler's `closest('mark.annot')` selector
gets extended to also match `.annot-caret`).

New CSS custom properties (with fallbacks, matching the existing
token-with-fallback pattern in `annotate.css`):
- `--annot-delete` (defaults to the existing `--error` token)
- `--annot-insert` (new green: `#3fb950` dark theme fallback / `#1a7f37`
  light theme fallback)

Drawer list items gain a small type badge (`Comment` / `Delete` / `Insert` /
`Replace`) next to the quote preview, and show `replacement` text
(struck original → new, or just new for `insert`) in place of / alongside
the free-text comment.

## Export / import

- Export JSON includes `type` and `replacement` per annotation (empty/omitted
  for `comment`). Existing fields (`quote`, `comment`, `prefix`, `suffix`,
  `start`, `end`, timestamps) are unchanged, so any existing external
  consumer of the export still works.
- Import merge-by-`id` logic is unchanged; any incoming annotation without
  `type` defaults to `"comment"`.

## Testing

`test/smoke-test-report.js` and `test/smoke-test-slide.js` (v2-upgraded
case) get new assertions:
- Create one annotation of each type (comment, delete, insert, replace).
- Reload the page from localStorage and confirm each re-renders with the
  correct class/marker and `replacement` text.
- Export and confirm the JSON payload contains `type` + `replacement` per
  the schema above.
- Import a hand-written JSON fixture missing `type` on one entry and confirm
  it defaults to `comment` without throwing.

## Documentation

`SKILL.md`:
- Annotation feature comparison table gets a note that v2 supports 4 types
  (comment/delete/insert/replace) vs. v1's comment-only.
- The schema docblock comment at the top of `highlight-annotate.js` is
  updated to include `type` and `replacement`.
