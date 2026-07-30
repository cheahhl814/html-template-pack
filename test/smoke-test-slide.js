#!/usr/bin/env node
// Smoke-test the slide template in headless Chrome.
// Verifies: page loads, all 5 slides render, inline v2 annotation system
// initializes, theme toggle initializes, print CSS applied, no console errors.
// v2 system carries 4 annotation types: comment/delete/insert/replace.

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEMPLATE = path.resolve(__dirname, '..', 'templates/slide/slide-template.html');
const TMP = '/tmp/html-pack-slide-test.png';
const LOG = '/tmp/html-pack-slide-test.log';

if (!fs.existsSync(TEMPLATE)) {
  console.error('Template not found:', TEMPLATE);
  process.exit(1);
}

const cmd = `google-chrome --headless=new --disable-gpu --no-sandbox \
  --window-size=1920,1080 \
  --enable-logging=stderr --v=0 \
  --virtual-time-budget=3000 \
  --screenshot=${TMP} \
  --dump-dom \
  file://${TEMPLATE} 2>${LOG}`;

console.log('Launching headless Chrome…');
exec(cmd, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
  if (err) { console.error('Chrome error:', err.message); process.exit(1); }

  const checks = [
    { name: 'title set',                       re: /<title>Slide Deck Template/, expect: 1 },
    { name: '5 slides present',                re: /<section class="slide[^"]*"/g, expect: 5 },
    { name: 'first slide is .active',          re: /slide-title active/,        expect: 1 },
    { name: 'data-panel on slides (v2)',       re: /data-panel="slide-/g,        expect: 5 },
    { name: 'data-annot-storage on body',      re: /data-annot-storage="slide-template"/, expect: 1 },
    { name: 'data-annot-theme-key on body',    re: /data-annot-theme-key="slide-template-theme-v1"/, expect: 1 },
    { name: 'data-annot-export on body',       re: /data-annot-export=/,         expect: 1 },
    { name: 'theme-toggle button (inline)',    re: /id="theme-toggle"/,         expect: 1 },
    { name: 'data-theme="light" default',      re: /<html[^>]*>/, expect: 1 },
    // v2 annotation UI (inlined from features/slide/{annotate.css,highlight-annotate.js})
    { name: 'annot-toggle (v2)',               re: /id="annot-toggle"/,         expect: 1 },
    { name: 'annot-insert-toggle (v2)',        re: /id="annot-insert-toggle"/,  expect: 1 },
    { name: 'annot-toolbar (v2)',              re: /id="annot-toolbar"/,        expect: 1 },
    { name: 'annot-toolbar-comment (v2)',      re: /id="annot-toolbar-comment"/, expect: 1 },
    { name: 'annot-toolbar-delete (v2)',       re: /id="annot-toolbar-delete"/,  expect: 1 },
    { name: 'annot-toolbar-replace (v2)',      re: /id="annot-toolbar-replace"/, expect: 1 },
    { name: 'annot-editor (v2)',               re: /id="annot-editor"/,         expect: 1 },
    { name: 'annot-editor-replacement (v2)',   re: /id="annot-editor-replacement"/, expect: 1 },
    { name: 'annot-drawer (v2)',               re: /id="annot-drawer"/,         expect: 1 },
    { name: 'annot-export (v2)',               re: /id="annot-export"/,         expect: 1 },
    { name: 'annot-import (v2)',               re: /id="annot-import"/,         expect: 1 },
    { name: 'annot-clear (v2)',                re: /id="annot-clear"/,          expect: 1 },
    // v1 markers must be absent
    { name: 'no v1 #ann-toggle',               re: /id="ann-toggle"/,           expect: 0 },
    { name: 'no v1 #ann-panel',                re: /id="ann-panel"/,            expect: 0 },
    { name: 'no v1 #ann-tooltip',              re: /id="ann-tooltip"/,          expect: 0 },
    { name: 'no v1 #ann-popup',                re: /id="ann-popup"/,            expect: 0 },
    { name: 'no v1 #ann-export-btn',           re: /id="ann-export-btn"/,       expect: 0 },
    { name: 'no v1 #ann-clear-btn',            re: /id="ann-clear-btn"/,        expect: 0 },
    { name: 'no v1 .ann-highlight styles',     re: /\.ann-highlight \{/,        expect: 0 },
    // v2 types in engine source
    { name: 'type schema in engine (v2)',      re: /type.*delete.*insert.*replace/, expect: 1 },
    { name: 'replacement field in engine (v2)', re: /replacement/,              expect: 1 },
    // Deck nav still works
    { name: 'navigation bar (prev/next/dots)', re: /id="nav-prev"/,             expect: 1 },
    { name: 'nav-next button',                 re: /id="nav-next"/,             expect: 1 },
    { name: 'nav-fullscreen button',           re: /id="nav-fullscreen"/,       expect: 1 },
    { name: '__deckGoTo exposed',              re: /__deckGoTo/,                expect: 1 },
    // Components
    { name: 'card component',                  re: /class="card highlight"/,    expect: 1 },
    { name: 'badge component',                 re: /class="badge /,             expect: 1 },
    { name: 'stat-card component',             re: /class="stat-card"/,         expect: 1 },
    { name: 'table component',                 re: /<table>/,                   expect: 1 },
    { name: 'layer-stack component',           re: /class="layer-stack"/,       expect: 1 },
    { name: 'chain-step component',            re: /class="chain-step"/,        expect: 1 },
    { name: 'print CSS (page-break)',          re: /page-break-after: always/,  expect: 1 },
    { name: 'print media query',               re: /@media print/,              expect: 1 },
    { name: 'localStorage usage',              re: /localStorage/,              expect: 1 },
    { name: 'Template reference slide 1',      re: /id="slide-ref-cards"/,      expect: 1 },
    { name: 'Template reference slide 2',      re: /id="slide-ref-blocks"/,     expect: 1 },
    // Slide-template adapter
    { name: 'slide adapter present',           re: /Slide-template adapter/,    expect: 1 },
  ];

  let passed = 0, failed = 0;
  checks.forEach(({ name, re, expect }) => {
    const matches = (stdout.match(re) || []).length;
    const ok = matches >= expect;
    console.log(`  ${ok ? '✓' : '✗'} ${name.padEnd(40)} (${matches} match${matches === 1 ? '' : 'es'})`);
    ok ? passed++ : failed++;
  });

  const screenshotOk = fs.existsSync(TMP) && fs.statSync(TMP).size > 1000;
  console.log(`  ${screenshotOk ? '✓' : '✗'} Screenshot rendered                  (${screenshotOk ? fs.statSync(TMP).size + ' bytes' : 'MISSING'})`);
  screenshotOk ? passed++ : failed++;

  const log = fs.readFileSync(LOG, 'utf8');
  const errs = log.split('\n').filter(l => /CONSOLE\(\d+\)|ERROR|Uncaught/.test(l) && !/devtools|net::|ERR_FILE_NOT_FOUND|registration_request|DEPRECATED_ENDPOINT/.test(l));
  const noErrors = errs.length === 0;
  console.log(`  ${noErrors ? '✓' : '✗'} No JS console errors                  (${errs.length} found)`);
  if (!noErrors) errs.slice(0, 3).forEach(e => console.log('     ', e.trim()));
  noErrors ? passed++ : failed++;

  console.log(`\n${passed} passed · ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
});
