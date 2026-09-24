# pack-dg B3–B7 — findings from local measurement/QA pass

Verified vs the shipped v0.12.0 review: two items below match the adjustments the
review already applied (cycle selectors, `--font-head`); the rest are genuine
issues I found and fixed in my `/tmp/pack-dg-new.css` deliverable during
layout measurement. Final state passes 121/121 geometry assertions at both
900px and 360px viewport widths.

## Genuine issues found & fixed locally

1. **Cycle grid placement broken by descendant selector** — `.cyc-step .c1`
   matches a *descendant* of `.cyc-step`; the step elements carry both classes
   on the same node, so `grid-area` never applied and Deploy/Test fell into the
   wrong corners (auto-placement). Applied at `.cyc-step.c1` etc. (matches the
   review's compound-selector adjustment #1).
   Fix: compound selectors `.cyc-step.c1 { grid-area: 1/1; }` … `c4`.

2. **Funnel clipped on narrow stages** — original design made the bar itself
   (`li`, `width: var(--w)`) the shrinking element; at 360px the 30% bar is
   ~83px while its label+value needs ~150px, so text spilled past the bar edge.
   Fix: rows stay full-width; the funnel shape moves to a `::before` fill bar
   sized by `--w` (`width: var(--w,92%); height:2.35rem`), with text lifted
   above it (`position:relative; z-index:1`). No clipping at either width.

3. **Venn 2-way tag overlap at ≤360px** — tag positions are % (scale with the
   container) but pill widths are fixed, so the "Sales" pill clipped the
   intersection pill by ~0.3px at 360px. Fix: `.v-tag.a { left: 19% → 15% }`
   (outer shoulder; still inside circle A across the range).

4. **Org tree blew out the page at narrow widths** — at 360px the tree's
   natural width (~441px) caused 122px of page-level horizontal scroll.
   Fix: `.otree { overflow-x: auto; }` so wide trees scroll inside their panel.

## Cosmetic / non-defects (checked, no change needed)

- `--font-head` in `.swot-q h4` — matches existing B1/B2 usage
  (`var(--font-head)`); host templates already define it. Review's `inherit`
  fallback is a harmless hardening.
- Funnel first-row `scrollWidth` reports +2px over clientWidth — subpixel
  artifact of the 1px-left/right-filled bar vs client width; invisible.

## Final verification

- 900px & 360px: 121/121 assertions pass (panel containment, funnel fill
  descent + no text clip, venn circles overlap ~30–60px, all tags inside &
  pairwise disjoint for 2w and 3w, SWOT 2×2 equal columns, otree nodes+contain,
  cycle Deploy-below-Build / Test-under-Plan / no 360px clip).
- Screenshot rendered with the brief's headless-Chrome command; page has no
  horizontal overflow at either width.