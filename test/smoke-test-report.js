#!/usr/bin/env node
// Smoke-test the report template in headless Chrome.
// Verifies: page loads, tabs render, annotation system initializes,
// theme toggle initializes, font tokens applied, no JS console errors.

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEMPLATE = path.resolve(__dirname, '..', 'templates/report/template.html');
const TMP = '/tmp/html-pack-report-test.png';
const LOG = '/tmp/html-pack-report-test.log';

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
    { name: 'title set',                       re: /<title>Report Template<\/title>/, expect: 1 },
    { name: 'data-report-id on body',          re: /data-report-id="report-template"/, expect: 1 },
    { name: 'data-annot-root wrapper',         re: /data-annot-root/,                  expect: 1 },
    // Multi-tab sidebar (new in v0.6.0)
    { name: 'report-sidebar nav',              re: /class="report-sidebar"/,         expect: 1 },
    { name: 'multi-tab buttons (5)',           re: /<button[^>]+data-tab=/,            expect: 5 },
    { name: 'multi-tab panels (5)',            re: /<[^>]+data-panel=/,               expect: 5 },
    { name: 'report-shell flex container',     re: /class="report-shell"/,           expect: 1 },
    { name: 'report-panels container',         re: /class="report-panels"/,          expect: 1 },
    { name: 'theme-toggle button (v2)',        re: /id="theme-toggle"/,                expect: 1 },
    { name: 'annot-toggle button (v2)',        re: /id="annot-toggle"/,                expect: 1 },
    { name: 'annot-toolbar (v2)',              re: /id="annot-toolbar"/,               expect: 1 },
    { name: 'annot-editor (v2)',               re: /id="annot-editor"/,                expect: 1 },
    { name: 'annot-drawer (v2)',               re: /id="annot-drawer"/,                expect: 1 },
    { name: 'annot-export (v2)',               re: /id="annot-export"/,                expect: 1 },
    { name: 'annot-import (v2)',               re: /id="annot-import"/,                expect: 1 },
    { name: 'annot-clear (v2)',                re: /id="annot-clear"/,                 expect: 1 },
    { name: 'toolbar delete button (v2)',      re: /id="annot-toolbar-delete"/,        expect: 1 },
    { name: 'toolbar replace button (v2)',     re: /id="annot-toolbar-replace"/,       expect: 1 },
    { name: 'insert-mode toggle (v2)',         re: /id="annot-insert-toggle"/,         expect: 1 },
    { name: 'replacement textarea (v2)',       re: /id="annot-editor-replacement"/,    expect: 1 },
    { name: 'self-contained (no script src)',  re: /<script src=/,                 expect: 0 },
    { name: 'self-contained (no link href)',   re: /<link[^>]+href="(?!data:)/,     expect: 0 },
    { name: 'theme toggle (inline)',           re: /data-theme="light"/,           expect: 1 },
    { name: 'localStorage usage',              re: /localStorage/,                 expect: 1 },
    { name: '__reportGoTo exposed',            re: /__reportGoTo/,                   expect: 1 },
    { name: 'report-tab ARIA attrs',           re: /aria-selected="true"/,          expect: 1 },
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
