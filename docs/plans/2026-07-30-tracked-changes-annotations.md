# Tracked-Changes Annotation Types Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `delete` / `insert` / `replace` annotation types (alongside the existing `comment` type) to the v2 annotation engine, so reviewers can propose structured, mechanically-applicable text edits instead of writing "delete this" / "replace with ..." in free-text comments.

**Architecture:** Extend the existing offset-anchored annotation schema with `type` + `replacement` fields (default `type: "comment"`, fully backward compatible). Selection-based delete/replace reuse the existing floating-pill → editor → drawer flow; insert is caret-based via a new arm/click "Insert here" mode. Rendering adds strikethrough (`mark.annot.annot-delete` / `.annot-replace`) and an inline `<ins class="annot-insert-text">` for proposed new text, plus a thin `.annot-caret` marker for insert points.

**Tech Stack:** Vanilla JS (ES5-style, IIFE, no build step), vanilla CSS with custom-property tokens, no test framework beyond the repo's existing headless-Chrome `--dump-dom` smoke tests (`test/smoke-test-*.js`).

## Global Constraints

- No external dependencies may be added — self-contained JS/CSS only (per SKILL.md "Single-file portability" invariant).
- `type` must default to `"comment"` wherever absent (loaded from localStorage or imported JSON) — existing annotations/exports must keep working unmodified.
- `features/report/highlight-annotate.js` and `features/slide/highlight-annotate.js` must stay byte-identical after this change (same for the two `annotate.css` files) — this mirrors their current state in the repo.
- `templates/slide/slide-template.html` (v1 inline annotation system) is explicitly **out of scope** — do not touch it.
- All new UI (toolbar buttons, insert toggle, editor fields, drawer badges) must remain reachable/visible per the existing "All UI must remain reachable" hard invariant, and must be hidden under `@media print` exactly like the existing annotation UI chrome.

---

### Task 1: Schema, resolution, and persistence — `features/report/highlight-annotate.js`

**Files:**
- Modify: `features/report/highlight-annotate.js`

**Interfaces:**
- Produces: annotation objects now carry `type` (`"comment"|"delete"|"insert"|"replace"`, default `"comment"`) and `replacement` (string, used by `"insert"`/`"replace"`).
- Produces: `resolve(a, ft)` now handles `a.type === 'insert'` (collapsed `{start,end}` where `start === end`) in addition to the existing quote-based resolution.

- [ ] **Step 1: Normalize `type` on load**

Modify `load()` (around line 123-131):

```js
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      annotations = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(annotations)) annotations = [];
    } catch (e) {
      annotations = [];
    }
    annotations.forEach(function (a) { if (!a.type) a.type = 'comment'; });
  }
```

- [ ] **Step 2: Add insert-aware resolution**

Replace `resolve()` (around line 252-262):

```js
  // Resolve an annotation to its current {start,end} or null.
  function resolve(a, ft) {
    if (a.type === 'insert') {
      var iprobe = (a.prefix || '') + (a.suffix || '');
      var ii = ft.indexOf(iprobe);
      if (ii < 0) return null;
      var at = ii + (a.prefix || '').length;
      return { start: at, end: at };
    }
    var start = a.start, end = a.end;
    if (typeof start !== 'number' || typeof end !== 'number' || ft.slice(start, end) !== a.quote) {
      var probe = (a.prefix || '') + a.quote + (a.suffix || '');
      var i = ft.indexOf(probe);
      if (i >= 0) { start = i + (a.prefix || '').length; end = start + a.quote.length; }
      else { i = ft.indexOf(a.quote); if (i < 0) return null; start = i; end = i + a.quote.length; }
    }
    return { start: start, end: end };
  }
```

- [ ] **Step 3: Exclude injected markup from the text walker**

Modify `makeWalker()`'s `acceptNode` (around line 143-153) so `fullText()`/`offsetOf()`/`buildRange()` never count text we injected (the `<ins>` replacement preview or caret marker):

```js
  function makeWalker() {
    return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.length) return NodeFilter.FILTER_REJECT;
        var p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest('.mermaid, svg, script, style, .annot-insert-text, [data-annot-skip]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
  }
```

- [ ] **Step 4: Manual check**

No standalone way to run this file outside a page yet — proceed to Task 2/3 before checking in-browser (Task 7 does the full manual pass). Just re-read the diffed functions to confirm no syntax errors (balanced braces/parens).

- [ ] **Step 5: Commit**

```bash
git -C /home/cheahhl814/.pi/agent/skills/html-template-pack add features/report/highlight-annotate.js 2>/dev/null || true
```
(This directory is not a git repo — skip commit if `git` reports so; otherwise commit with message `feat: add type-aware schema and insert resolution to v2 annotation engine`.)

---

### Task 2: Rendering — `features/report/highlight-annotate.js`

**Files:**
- Modify: `features/report/highlight-annotate.js`

**Interfaces:**
- Consumes: `resolve()` from Task 1 (returns `{start,end}` with `start===end` for `insert`).
- Produces: `wrapRange(range, id, extraClass)` now returns the last `<mark>` element created (so callers can insert a sibling `<ins>` right after it). `applyHighlights()` renders `delete` (strikethrough), `replace` (strikethrough + `<ins>`), and `insert` (`.annot-caret` + `<ins>`).

- [ ] **Step 1: Extend `unwrapAll()` to also strip injected nodes**

Replace `unwrapAll()` (around line 214-222):

```js
  function unwrapAll() {
    var marks = root.querySelectorAll('mark.annot');
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i], parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    }
    var extras = root.querySelectorAll('.annot-caret, ins.annot-insert-text');
    for (var j = 0; j < extras.length; j++) {
      extras[j].parentNode.removeChild(extras[j]);
    }
  }
```

- [ ] **Step 2: Make `wrapRange()` accept an extra class and return the last mark**

Replace `wrapRange()` (around line 223-251):

```js
  function wrapRange(range, id, extraClass) {
    var nodes = [], ca = range.commonAncestorContainer;
    if (ca.nodeType === Node.TEXT_NODE) {
      nodes.push(ca);
    } else {
      var w = document.createTreeWalker(ca, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          if (!n.nodeValue.length) return NodeFilter.FILTER_REJECT;
          if (n.parentElement && n.parentElement.closest('.mermaid, svg, script, style')) return NodeFilter.FILTER_REJECT;
          return range.intersectsNode(n) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }
      });
      var n; while ((n = w.nextNode())) nodes.push(n);
    }
    var lastMark = null;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var s = (node === range.startContainer) ? range.startOffset : 0;
      var e = (node === range.endContainer) ? range.endOffset : node.nodeValue.length;
      if (e <= s) continue;
      var target = node;
      if (e < node.nodeValue.length) target.splitText(e);
      if (s > 0) target = target.splitText(s);
      var mark = document.createElement('mark');
      mark.className = 'annot' + (extraClass ? ' ' + extraClass : '');
      mark.setAttribute('data-annot-id', id);
      target.parentNode.insertBefore(mark, target);
      mark.appendChild(target);
      lastMark = mark;
    }
    return lastMark;
  }
```

- [ ] **Step 3: Rewrite `applyHighlights()` to branch on type**

Replace `applyHighlights()` (around line 263-279):

```js
  function makeInsertNode(id, text) {
    var ins = document.createElement('ins');
    ins.className = 'annot-insert-text';
    ins.setAttribute('data-annot-id', id);
    ins.textContent = text || '';
    return ins;
  }
  function applyHighlights() {
    unwrapAll();
    var ft = fullText();
    for (var i = 0; i < annotations.length; i++) {
      var a = annotations[i];
      var pos = resolve(a, ft);
      a._orphan = !pos;
      if (!pos) continue;
      if (a.type === 'insert') {
        var iRange = buildRange(pos.start, pos.start);
        if (!iRange) { a._orphan = true; continue; }
        try {
          var caret = document.createElement('span');
          caret.className = 'annot-caret';
          caret.setAttribute('data-annot-id', a.id);
          var frag = document.createDocumentFragment();
          frag.appendChild(caret);
          frag.appendChild(makeInsertNode(a.id, a.replacement));
          iRange.insertNode(frag);
        } catch (e) { a._orphan = true; }
        continue;
      }
      var range = buildRange(pos.start, pos.end);
      if (!range) { a._orphan = true; continue; }
      try {
        var extraClass = a.type === 'delete' ? 'annot-delete' : a.type === 'replace' ? 'annot-replace' : '';
        var mark = wrapRange(range, a.id, extraClass);
        if (a.type === 'replace' && mark) {
          mark.parentNode.insertBefore(makeInsertNode(a.id, a.replacement), mark.nextSibling);
        }
      } catch (e) { a._orphan = true; }
    }
  }
```

- [ ] **Step 4: Extend focus/click/jump handling to the new elements**

Modify `setFocus()` (around line 422-432) — change the marks query:

```js
  function setFocus(id) {
    focusedId = id;
    var marks = root.querySelectorAll('mark.annot, .annot-caret, ins.annot-insert-text');
    for (var i = 0; i < marks.length; i++) {
      marks[i].classList.toggle('annot-focus', marks[i].getAttribute('data-annot-id') === id);
    }
    var items = els.list.querySelectorAll('.annot-item');
    for (var j = 0; j < items.length; j++) {
      items[j].classList.toggle('annot-focus', items[j].getAttribute('data-id') === id);
    }
  }
```

Modify `jumpTo()` (around line 433-448) — change the mark lookup:

```js
  function jumpTo(id) {
    var a = annotations.find(function (x) { return x.id === id; });
    if (!a) return;
    if (a.panel) {
      var tabBtn = document.querySelector('[data-tab="' + a.panel + '"]');
      if (tabBtn && !tabBtn.classList.contains('active')) tabBtn.click();
    }
    setTimeout(function () {
      var mark = root.querySelector('mark.annot[data-annot-id="' + id + '"], .annot-caret[data-annot-id="' + id + '"]');
      if (mark) {
        mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setFocus(id);
      }
    }, 60);
  }
```

Modify the highlight click delegate (around line 514-522):

```js
  root.addEventListener('click', function (e) {
    var mark = e.target.closest ? e.target.closest('mark.annot, .annot-caret, ins.annot-insert-text') : null;
    if (!mark) return;
    var id = mark.getAttribute('data-annot-id');
    if (els.drawer.hidden) openDrawer();
    setFocus(id);
    var item = els.list.querySelector('.annot-item[data-id="' + id + '"]');
    if (item) item.scrollIntoView({ block: 'nearest' });
  });
```

- [ ] **Step 5: Commit**

Commit message (if repo were git-tracked): `feat: render delete/replace/insert annotation types with strikethrough and inline insertion markers`.

---

### Task 3: Interaction — toolbar, insert mode, editor, and DOM refs — `features/report/highlight-annotate.js` + `templates/report/template.html`

**Files:**
- Modify: `features/report/highlight-annotate.js`
- Modify: `templates/report/template.html`

**Interfaces:**
- Consumes: `pending` object shape from `readSelection()` (unchanged: `{start,end,quote,prefix,suffix,panel,heading,rect}`).
- Produces: module-level `editingType` (`"comment"|"delete"|"insert"|"replace"|null`) tracked alongside existing `editingId`/`pending`. New DOM ids consumed by the JS: `annot-toolbar-comment`, `annot-toolbar-delete`, `annot-toolbar-replace`, `annot-insert-toggle`, `annot-editor-replacement`.

- [ ] **Step 1: Update the toolbar markup in `templates/report/template.html`**

Find (around line 248):

```html
  <button class="annot-toolbar" id="annot-toolbar" hidden>💬 Comment</button>
```

Replace with:

```html
  <div class="annot-toolbar" id="annot-toolbar" hidden>
    <button type="button" class="annot-toolbar-btn" id="annot-toolbar-comment">💬 Comment</button>
    <button type="button" class="annot-toolbar-btn" id="annot-toolbar-delete">✂ Delete</button>
    <button type="button" class="annot-toolbar-btn" id="annot-toolbar-replace">✎ Replace</button>
  </div>
```

- [ ] **Step 2: Add the Insert-mode toggle next to the Notes toggle**

Find (around line 244-246):

```html
  <button class="annot-toggle" id="annot-toggle" aria-label="Open annotations panel">
    💬 Notes <span class="annot-count" id="annot-count" hidden>0</span>
  </button>
```

Replace with:

```html
  <button class="annot-toggle" id="annot-toggle" aria-label="Open annotations panel">
    💬 Notes <span class="annot-count" id="annot-count" hidden>0</span>
  </button>
  <button class="annot-toggle" id="annot-insert-toggle" aria-label="Insert text at a point" aria-pressed="false">➕ Insert</button>
```

- [ ] **Step 3: Add the replacement textarea to the editor**

Find (around line 250-253):

```html
  <div class="annot-editor" id="annot-editor" hidden role="dialog" aria-label="Add comment">
    <div class="annot-quote" id="annot-editor-quote"></div>
    <textarea id="annot-editor-text" placeholder="Write a comment…" aria-label="Comment text"></textarea>
```

Replace with:

```html
  <div class="annot-editor" id="annot-editor" hidden role="dialog" aria-label="Add annotation">
    <div class="annot-quote" id="annot-editor-quote"></div>
    <textarea id="annot-editor-replacement" class="annot-editor-replacement" placeholder="Replacement text…" aria-label="Replacement text" hidden></textarea>
    <textarea id="annot-editor-text" placeholder="Write a comment…" aria-label="Comment text"></textarea>
```

- [ ] **Step 4: Wire the new DOM refs in the JS `els` object**

In `features/report/highlight-annotate.js`, modify the `els` object (around line 64-82):

```js
  var els = {
    toggle:        document.getElementById('annot-toggle'),
    insertToggle:  document.getElementById('annot-insert-toggle'),
    count:         document.getElementById('annot-count'),
    toolbar:       document.getElementById('annot-toolbar'),
    toolbarComment: document.getElementById('annot-toolbar-comment'),
    toolbarDelete:  document.getElementById('annot-toolbar-delete'),
    toolbarReplace: document.getElementById('annot-toolbar-replace'),
    editor:        document.getElementById('annot-editor'),
    editorQuote:   document.getElementById('annot-editor-quote'),
    editorReplacement: document.getElementById('annot-editor-replacement'),
    editorText:    document.getElementById('annot-editor-text'),
    editorSave:    document.getElementById('annot-editor-save'),
    editorCancel:  document.getElementById('annot-editor-cancel'),
    backdrop:      document.getElementById('annot-backdrop'),
    drawer:        document.getElementById('annot-drawer'),
    drawerClose:   document.getElementById('annot-drawer-close'),
    list:          document.getElementById('annot-list'),
    exportBtn:     document.getElementById('annot-export'),
    importBtn:     document.getElementById('annot-import'),
    clearBtn:      document.getElementById('annot-clear'),
    file:          document.getElementById('annot-file'),
    themeBtn:      document.getElementById('theme-toggle')
  };
```

- [ ] **Step 5: Add `editingType` state and rewrite the toolbar click handling**

Add near the other state vars (around line 115-120):

```js
  var annotations = [];
  var pending = null;
  var editingId = null;
  var editingType = null;   // "comment" | "delete" | "insert" | "replace" | null
  var focusedId = null;
  var clearArmed = false;
  var insertArmed = false;
```

Replace the single toolbar click handler (around line 343-349):

```js
  els.toolbar.addEventListener('mousedown', function (e) { e.preventDefault(); });
  function startNewAnnotation(type) {
    if (!pending) return;
    hideToolbar();
    editingId = null;
    editingType = type;
    openEditor(pending.quote, '', '', pending.rect);
  }
  if (els.toolbarComment) els.toolbarComment.addEventListener('click', function () { startNewAnnotation('comment'); });
  if (els.toolbarDelete)  els.toolbarDelete.addEventListener('click',  function () { startNewAnnotation('delete'); });
  if (els.toolbarReplace) els.toolbarReplace.addEventListener('click', function () { startNewAnnotation('replace'); });
```

- [ ] **Step 6: Add caret-range helper and insert-mode arming**

Add near `readSelection()` (before it, around line 302):

```js
  function caretRangeAt(x, y) {
    if (document.caretRangeFromPoint) return document.caretRangeFromPoint(x, y);
    if (document.caretPositionFromPoint) {
      var pos = document.caretPositionFromPoint(x, y);
      if (!pos || !pos.offsetNode) return null;
      var r = document.createRange();
      r.setStart(pos.offsetNode, pos.offset);
      r.collapse(true);
      return r;
    }
    return null;
  }
```

Add insert-mode wiring right after the existing `mousedown`/`mouseup` selection listeners (around line 338-341):

```js
  if (els.insertToggle) {
    els.insertToggle.addEventListener('click', function () {
      insertArmed = !insertArmed;
      body.classList.toggle('annot-insert-armed', insertArmed);
      els.insertToggle.textContent = insertArmed ? '➕ Click a point…' : '➕ Insert';
      els.insertToggle.setAttribute('aria-pressed', insertArmed ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!insertArmed) return;
      if (els.editor.contains(e.target) || els.toolbar.contains(e.target) || els.insertToggle.contains(e.target)) return;
      if (!root.contains(e.target)) return;
      var range = caretRangeAt(e.clientX, e.clientY);
      if (!range) return;
      insertArmed = false;
      body.classList.remove('annot-insert-armed');
      els.insertToggle.textContent = '➕ Insert';
      els.insertToggle.setAttribute('aria-pressed', 'false');
      var at = offsetOf(range.startContainer, range.startOffset);
      var ft = fullText();
      var ctx = contextOf(range.startContainer);
      pending = {
        start: at, end: at, quote: '',
        prefix: ft.slice(Math.max(0, at - 48), at),
        suffix: ft.slice(at, Math.min(ft.length, at + 48)),
        panel: ctx.panel, heading: ctx.heading,
        rect: (range.getClientRects()[0] || { left: e.clientX, top: e.clientY, width: 0, bottom: e.clientY })
      };
      editingId = null;
      editingType = 'insert';
      openEditor('', '', '', pending.rect);
    });
  }
```

- [ ] **Step 7: Rewrite `openEditor`/`closeEditor` to toggle the replacement field**

Replace `openEditor()` and `closeEditor()` (around line 352-367):

```js
  function openEditor(quote, comment, replacement, rect, centered) {
    var type = editingId
      ? ((annotations.find(function (x) { return x.id === editingId; }) || {}).type || 'comment')
      : (editingType || 'comment');
    els.editorQuote.textContent = type === 'insert' ? '(insertion point)' : quote;
    var needsReplacement = (type === 'replace' || type === 'insert');
    if (els.editorReplacement) {
      els.editorReplacement.hidden = !needsReplacement;
      els.editorReplacement.value = replacement || '';
      els.editorReplacement.placeholder = type === 'insert' ? 'Text to insert…' : 'Replacement text…';
    }
    els.editorText.value = comment || '';
    els.editorSave.textContent = type === 'delete' ? 'Confirm delete' : 'Save';
    els.editor.hidden = false;
    if (centered || !rect) {
      els.editor.style.left = '50%';
      els.editor.style.top = (window.scrollY + Math.max(80, window.innerHeight / 2 - 120)) + 'px';
    } else {
      var left = window.scrollX + rect.left + rect.width / 2;
      left = Math.max(window.scrollX + 170, Math.min(left, window.scrollX + document.documentElement.clientWidth - 170));
      els.editor.style.left = left + 'px';
      els.editor.style.top  = (window.scrollY + rect.bottom + 10) + 'px';
    }
    setTimeout(function () {
      (needsReplacement && els.editorReplacement ? els.editorReplacement : els.editorText).focus();
    }, 0);
  }
  function closeEditor() {
    els.editor.hidden = true;
    editingId = null;
    editingType = null;
  }
```

- [ ] **Step 8: Rewrite the save handler with per-type validation**

Replace the `els.editorSave` click handler (around line 369-392):

```js
  els.editorSave.addEventListener('click', function () {
    var text = els.editorText.value.trim();
    var replacement = els.editorReplacement ? els.editorReplacement.value : '';
    var existing = editingId ? annotations.find(function (x) { return x.id === editingId; }) : null;
    var type = existing ? (existing.type || 'comment') : (editingType || 'comment');
    if (type === 'comment' && !text) { els.editorText.focus(); return; }
    if ((type === 'replace' || type === 'insert') && !replacement.trim()) {
      if (els.editorReplacement) els.editorReplacement.focus();
      return;
    }
    var now = new Date().toISOString();
    if (existing) {
      existing.comment = text;
      if (type === 'replace' || type === 'insert') existing.replacement = replacement;
      existing.updatedAt = now;
    } else if (pending) {
      annotations.push({
        id: uid(), quote: pending.quote, comment: text,
        type: type, replacement: (type === 'replace' || type === 'insert') ? replacement : '',
        start: pending.start, end: pending.end,
        prefix: pending.prefix, suffix: pending.suffix,
        panel: pending.panel, heading: pending.heading,
        createdAt: now, updatedAt: now
      });
    }
    persist();
    applyHighlights();
    renderList();
    updateCount();
    closeEditor();
    window.getSelection().removeAllRanges();
    pending = null;
  });
```

- [ ] **Step 9: Update the drawer's "Edit" button to pass type/replacement through**

In `renderList()`, replace the `edit` button handler (around line 490-493):

```js
      var edit = document.createElement('button');
      edit.className = 'annot-btn';
      edit.textContent = 'Edit';
      edit.addEventListener('click', function () {
        editingId = a.id;
        pending = null;
        editingType = a.type || 'comment';
        openEditor(a.quote, a.comment, a.replacement, null, true);
      });
```

- [ ] **Step 10: Manual check**

Open `templates/report/template.html` directly in a browser (`file://` URL). Select some text → confirm three pills appear (Comment/Delete/Replace) and each opens the editor with the right fields shown/hidden. Click "➕ Insert", then click a point in the prose → confirm the editor opens with the replacement field required. Leave this open — Task 5/6 add the matching CSS and Task 7 does the full end-to-end pass.

- [ ] **Step 11: Commit**

Commit message (if repo were git-tracked): `feat: wire delete/replace toolbar buttons and caret-based insert mode into the annotation editor`.

---

### Task 4: Export/import + drawer badges — `features/report/highlight-annotate.js`

**Files:**
- Modify: `features/report/highlight-annotate.js`

**Interfaces:**
- Produces: exported JSON annotations now include `type` and `replacement`. Imported annotations without `type` default to `"comment"`.

- [ ] **Step 1: Add a type badge and replacement preview to each drawer item**

In `renderList()`, after the existing `li.className = ...` / `data-id` setup and before the quote element (around line 458-463), insert:

```js
      var badgeLabel = { comment: 'Comment', delete: 'Delete', insert: 'Insert', replace: 'Replace' }[a.type || 'comment'];
      var badge = document.createElement('span');
      badge.className = 'annot-type-badge annot-type-' + (a.type || 'comment');
      badge.textContent = badgeLabel;
      li.appendChild(badge);
```

After the existing comment `<div>` (around line 478-481), insert:

```js
      if (a.type === 'replace' || a.type === 'insert') {
        var repl = document.createElement('div');
        repl.className = 'annot-item-replacement';
        repl.textContent = '→ ' + (a.replacement || '');
        li.appendChild(repl);
      }
```

- [ ] **Step 2: Include `type`/`replacement` in the export payload**

Modify the `exportBtn` click handler's `.map()` (around line 530-538):

```js
      annotations: annotations.map(function (a) {
        return {
          id: a.id, quote: a.quote, comment: a.comment,
          type: a.type || 'comment', replacement: a.replacement || '',
          panel: a.panel, sectionHeading: a.heading,
          prefix: a.prefix, suffix: a.suffix,
          start: a.start, end: a.end,
          createdAt: a.createdAt, updatedAt: a.updatedAt
        };
      })
```

- [ ] **Step 3: Default `type`/`replacement` on import**

Modify the import reconstruction inside `els.file.addEventListener('change', ...)` (around line 564-572):

```js
          var a = {
            id: raw.id || uid(), quote: raw.quote, comment: raw.comment || '',
            type: raw.type || 'comment', replacement: raw.replacement || '',
            start: typeof raw.start === 'number' ? raw.start : 0,
            end: typeof raw.end === 'number' ? raw.end : 0,
            prefix: raw.prefix || '', suffix: raw.suffix || '',
            panel: raw.panel || null, heading: raw.sectionHeading || raw.heading || '',
            createdAt: raw.createdAt || new Date().toISOString(),
            updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString()
          };
```

- [ ] **Step 4: Update the schema docblock at the top of the file**

Replace the "Schema" comment block (around line 22-30):

```js
     Schema (matches gap-report & eDNA-Darwin-EOI conventions)
     ---------------------------------------------------------
     {
       id, quote, comment, prefix, suffix,         // anchoring
       start, end,                                  // optional offsets (kept for migration)
       type,                                         // "comment" | "delete" | "insert" | "replace" (default "comment")
       replacement,                                  // suggested new text for "insert"/"replace" (unused otherwise)
       panel, sectionHeading,                       // multi-tab navigation
       createdAt, updatedAt,                        // ISO 8601
       orphaned                                      // true if re-anchor failed
     }
```

- [ ] **Step 5: Commit**

Commit message (if repo were git-tracked): `feat: include annotation type/replacement in export, import, and drawer list`.

---

### Task 5: CSS — `features/report/annotate.css`

**Files:**
- Modify: `features/report/annotate.css`

**Interfaces:**
- Consumes: `--error` token (existing).
- Produces: new tokens `--annot-delete`, `--annot-insert`; new classes `.annot-delete`, `.annot-replace`, `.annot-insert-text`, `.annot-caret`, `.annot-toolbar-btn`, `.annot-editor-replacement`, `.annot-insert-armed`, `.annot-type-badge` (+ per-type variants), `.annot-item-replacement`.

- [ ] **Step 1: Add the new tokens**

Modify the `:root` block (around line 21-39) — add after `--ann-highlight: var(--accent);`:

```css
  --annot-delete: var(--error);
  --annot-insert: #3fb950;
```

Modify the `[data-theme="light"]` block (around line 40-53) — add:

```css
  --annot-insert: #1a7f37;
```

- [ ] **Step 2: Style delete/replace/insert marks**

After the existing `mark.annot:hover, mark.annot.annot-focus` rule (around line 65-68), add:

```css
mark.annot.annot-delete,
mark.annot.annot-replace {
  background: rgba(248, 113, 113, 0.12);
  border-bottom-color: var(--annot-delete);
  text-decoration: line-through;
  text-decoration-color: var(--annot-delete);
}
ins.annot-insert-text {
  background: rgba(63, 185, 80, 0.14);
  color: var(--annot-insert);
  text-decoration: none;
  border-bottom: 2px solid var(--annot-insert);
  border-radius: 2px;
  padding: 0.05em 0.05em;
  cursor: pointer;
  font-style: normal;
}
ins.annot-insert-text:hover,
ins.annot-insert-text.annot-focus { background: rgba(63, 185, 80, 0.26); }
.annot-caret {
  display: inline-block; width: 2px; height: 1em; vertical-align: text-bottom;
  background: var(--annot-insert); margin: 0 1px; cursor: pointer;
}
.annot-caret.annot-focus { width: 3px; }
body.annot-insert-armed [data-annot-root],
body.annot-insert-armed main.content { cursor: text; }
```

- [ ] **Step 3: Style the toolbar button group**

Replace the `.annot-toolbar` rule and its `::after` pseudo-element (around line 88-102):

```css
.annot-toolbar {
  position: absolute; z-index: 70; transform: translate(-50%, -100%);
  margin-top: -0.5rem; display: flex; gap: 0.3rem;
}
.annot-toolbar[hidden] { display: none; }
.annot-toolbar-btn {
  background: var(--text); color: var(--bg); border: none; border-radius: var(--radius);
  padding: 0.35rem 0.6rem; font-family: var(--font-sans); font-size: 0.85rem; font-weight: 600;
  cursor: pointer; white-space: nowrap; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}
.annot-toolbar-btn:hover { filter: brightness(1.15); }
```

(This drops the speech-bubble `::after` triangle since the toolbar is now a multi-button row rather than a single pill — acceptable visual simplification, still clearly anchored via the fixed position under the selection.)

- [ ] **Step 4: Style the replacement textarea**

After the existing `.annot-editor textarea:focus` rule (around line 125), add:

```css
.annot-editor-replacement {
  width: 100%; min-height: 3rem; resize: vertical; margin-bottom: 0.5rem;
  font-family: var(--font-sans); font-size: 0.9rem; line-height: 1.5;
  background: var(--bg); color: var(--annot-insert);
  border: 1px solid var(--annot-insert); border-radius: var(--radius-sm);
  padding: 0.5rem; box-sizing: border-box;
}
.annot-editor-replacement[hidden] { display: none; }
```

- [ ] **Step 5: Style the drawer's type badge and replacement preview**

After the existing `.annot-item .annot-item-quote` rules (around line 181-186), add:

```css
.annot-item .annot-type-badge {
  display: inline-block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.03em; padding: 0.1rem 0.4rem; border-radius: 999px; margin-bottom: 0.4rem;
}
.annot-item .annot-type-comment { background: var(--accent-dim); color: var(--accent); }
.annot-item .annot-type-delete,
.annot-item .annot-type-replace { background: rgba(248, 113, 113, 0.15); color: var(--annot-delete); }
.annot-item .annot-type-insert { background: rgba(63, 185, 80, 0.15); color: var(--annot-insert); }
.annot-item .annot-item-replacement {
  font-size: 0.85rem; color: var(--annot-insert); margin: 0.2rem 0 0.5rem;
  white-space: pre-wrap; word-break: break-word;
}
```

- [ ] **Step 6: Print styles for the new marks**

Modify the `@media print` block (around line 204-211) — add after the existing `mark.annot { ... }` rule:

```css
  mark.annot.annot-delete, mark.annot.annot-replace {
    background: transparent; text-decoration: line-through; border-bottom: none;
  }
  ins.annot-insert-text { background: transparent; text-decoration: underline; border-bottom: none; }
  .annot-caret { background: #000; }
```

- [ ] **Step 7: Commit**

Commit message (if repo were git-tracked): `style: add delete/replace/insert annotation styling and toolbar button group`.

---

### Task 6: Mirror `features/report/*` into `templates/report/template.html`'s inline copies

**Files:**
- Modify: `templates/report/template.html`

**Interfaces:**
- Consumes: the exact JS/CSS logic finalized in Tasks 1-5 (this task ports the same diffs into the file's inline `<style>` and `<script>` blocks, which are a near-identical duplicate of `features/report/{annotate.css,highlight-annotate.js}`).

- [ ] **Step 1: Port the CSS diffs**

Apply the same six CSS additions from Task 5 (Steps 1-6) to `templates/report/template.html`'s inline `<style>` block, at the equivalent existing rules (the `:root`/`[data-theme="light"]` token blocks around lines 35-67, `mark.annot` around line 95-104, `.annot-toolbar` around lines 125-140, `.annot-editor textarea` around line 154-161, `.annot-item` rules around lines 206-219, and the `@media print` block around line 226-227). Confirm afterward with:

```bash
grep -c "annot-delete\|annot-insert\|annot-toolbar-btn\|annot-type-badge" /home/cheahhl814/.pi/agent/skills/html-template-pack/templates/report/template.html
```

Expected: a positive count (each class appears at least once).

- [ ] **Step 2: Port the HTML markup diffs**

Apply the same three markup changes from Task 3 (Steps 1-3) to `templates/report/template.html` at the line ranges already identified there (~lines 244-253).

- [ ] **Step 3: Port the JS diffs**

Apply the same diffs from Task 1 (Steps 1-3), Task 2 (Steps 1-4), Task 3 (Steps 4-9), and Task 4 (Steps 1-4) to `templates/report/template.html`'s inline `<script>` block for the annotation feature (starting ~line 327). The inline copy's variable names match the `features/report/highlight-annotate.js` file (same authorship), so the same before/after snippets apply verbatim — locate each anchor snippet inside the inline `<script>` block rather than the external file.

- [ ] **Step 4: Verify no syntax errors**

```bash
node --check <(sed -n '/<script>/,/<\/script>/p' /home/cheahhl814/.pi/agent/skills/html-template-pack/templates/report/template.html | sed '1d;$d') 2>&1 | head -20
```
This is a rough syntax sanity check (it may false-positive on multiple concatenated `<script>` blocks); the authoritative check is Task 7's browser load with no console errors.

- [ ] **Step 5: Commit**

Commit message (if repo were git-tracked): `feat: port tracked-changes annotation types into the report template's inline copy`.

---

### Task 7: Sync to `features/slide/*`, update smoke tests, update SKILL.md

**Files:**
- Modify: `features/slide/highlight-annotate.js`
- Modify: `features/slide/annotate.css`
- Modify: `test/smoke-test-report.js`
- Modify: `test/smoke-test-slide.js`
- Modify: `SKILL.md`

**Interfaces:**
- Consumes: the finalized `features/report/highlight-annotate.js` and `features/report/annotate.css` from Tasks 1-5.

- [ ] **Step 1: Copy the finalized report files over the slide copies**

```bash
cd /home/cheahhl814/.pi/agent/skills/html-template-pack
cp features/report/highlight-annotate.js features/slide/highlight-annotate.js
cp features/report/annotate.css features/slide/annotate.css
diff features/report/highlight-annotate.js features/slide/highlight-annotate.js
diff features/report/annotate.css features/slide/annotate.css
```
Expected: both `diff` calls produce no output (files identical), matching their pre-existing state in this repo.

- [ ] **Step 2: Add structural checks to `test/smoke-test-report.js`**

In the `checks` array (around line 31-51 of `test/smoke-test-report.js`), add after the existing `annot-clear (v2)` entry:

```js
    { name: 'toolbar delete button (v2)',      re: /id="annot-toolbar-delete"/,        expect: 1 },
    { name: 'toolbar replace button (v2)',     re: /id="annot-toolbar-replace"/,       expect: 1 },
    { name: 'insert-mode toggle (v2)',         re: /id="annot-insert-toggle"/,         expect: 1 },
    { name: 'replacement textarea (v2)',       re: /id="annot-editor-replacement"/,    expect: 1 },
```

- [ ] **Step 3: Confirm the report smoke test passes**

```bash
cd /home/cheahhl814/.pi/agent/skills/html-template-pack
node test/smoke-test-report.js
```
Expected: all checks pass, `0 failed`, and "No JS console errors" passes.

- [ ] **Step 4: Check whether `test/smoke-test-slide.js` targets the v1 or v2 slide markup**

```bash
grep -n "annot-toggle\|annot-toolbar\|ann-highlight\|v1\|v2" /home/cheahhl814/.pi/agent/skills/html-template-pack/test/smoke-test-slide.js | head -20
```
The default `templates/slide/slide-template.html` ships v1 (out of scope per the Global Constraints). If `smoke-test-slide.js` only asserts v1 markers (e.g. `.ann-highlight`, `#ann-panel`), leave it untouched — there is nothing v2-shaped in the default slide template to check yet. If it already asserts v2 markers (meaning a prior session upgraded the shipped slide template to v2), add the same four checks as Step 2 using that file's actual v2 element ids.

- [ ] **Step 5: Update `SKILL.md`'s annotation comparison table**

In the "Annotation system — what ships in the box" table (around SKILL.md lines 151-162), add a row:

```markdown
| Annotation types: comment / delete / insert / replace | ✓ (v2 only)              | ✗ (comment only)                |
```

- [ ] **Step 6: Update the "Report template" and "Slide template" description paragraphs**

In the "Report template" section's **Annotation system** line (SKILL.md line 91), append: `Types: comment, delete, insert, replace — delete/replace strike the original inline and show the suggested replacement; insert drops a caret marker with the proposed text.`

- [ ] **Step 7: Run the full test suite**

```bash
cd /home/cheahhl814/.pi/agent/skills/html-template-pack
node test/run-all.js
```
Expected: `All suites passed.`

- [ ] **Step 8: Commit**

Commit message (if repo were git-tracked): `chore: sync v2 annotation engine to slide features, extend smoke tests, document tracked-changes types in SKILL.md`.

---

### Task 8: Manual browser verification

**Files:** none (verification only)

- [ ] **Step 1: Open the report template in a browser**

```bash
google-chrome /home/cheahhl814/.pi/agent/skills/html-template-pack/templates/report/template.html
```

- [ ] **Step 2: Exercise each annotation type**

- Select a sentence → click **✂ Delete** → confirm the editor shows "Confirm delete", save it, confirm the text renders struck-through in red and is clickable.
- Select another sentence → click **✎ Replace** → type replacement text → save → confirm the original is struck-through and the green replacement text appears right after it inline.
- Click **➕ Insert** → click a point mid-paragraph → type text to insert → save → confirm a thin caret marker plus the green inserted text appear at that point.
- Select a third sentence → click **💬 Comment** → confirm unchanged behavior (yellow/accent highlight, comment-only).
- Open the **💬 Notes** drawer → confirm all four entries show a type badge and (for replace/insert) the `→ replacement text` line.
- Click **⬇ Export** → open the downloaded JSON → confirm each annotation object has `type` and (where relevant) a non-empty `replacement` field.
- Reload the page → confirm all four annotations re-render identically from localStorage (persistence).
- Toggle dark/light theme → confirm the new colors (red delete/replace, green insert) remain legible in both themes.
- Open print preview (`Ctrl/Cmd+P`) → confirm the delete/replace strikethrough and insert underline still show, and confirm the toolbar/editor/drawer/insert-toggle are hidden.

- [ ] **Step 2: Report results**

If any check fails, note which one and stop — do not mark the plan complete until every check above passes.
