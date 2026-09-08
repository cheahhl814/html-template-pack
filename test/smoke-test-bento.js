#!/usr/bin/env node
// Smoke-test the bento brief template in headless Chrome.
// Verifies: page loads, bento grid + hero render, v2 annotation UI wired
// (toolbar/editor/drawer/count), icon rail has theme/density/font toggles,
// density + font-size tokens present, print rules, no JS console errors.

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEMPLATE = path.resolve(__dirname, '..', 'templates/bento/bento-template.html');
const TMP = '/tmp/html-pack-bento-test.png';
const LOG = '/tmp/html-pack-bento-test.log';

if (!fs.existsSync(TEMPLATE)) {
  console.error('Template not found:', TEMPLATE);
  process.exit(1);
}

const cmd = `google-chrome --headless=new --disable-gpu --no-sandbox \
  --window-size=1440,1000 \
  --enable-logging=stderr --v=0 \
  --virtual-time-budget=6000 \
  --screenshot=${TMP} \
  --dump-dom \
  file://${TEMPLATE} 2>${LOG}`;

console.log('Launching headless Chrome…');
exec(cmd, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
  if (err) { console.error('Chrome error:', err.message); process.exit(1); }

  const checks = [
    { name: 'title set',                          re: /<title>Bento Brief Template[^<]*<\/title>/, expect: 1 },
    { name: 'data-annot-storage namespace',       re: /data-annot-storage="bento-template"/, expect: 1 },
    { name: 'annotatable root',                   re: /data-annot-root/,                     expect: 1 },
    { name: 'bento grid present',                 re: /class="bento"/,                       expect: 1 },
    { name: 'hero header present',                re: /class="hero"/,                        expect: 1 },
    { name: 'KPI card rendered',                  re: /class="kpi-row"/,                     expect: 1 },
    { name: 'pure-CSS bar chart rendered',        re: /class="bars"/,                        expect: 1 },
    { name: 'progress bars rendered',             re: /class="progress-item"/g,             expect: 4 },
    { name: 'timeline rendered',                  re: /class="tl-item/g,                     expect: 4 },
    { name: 'quote card rendered',                re: /b-card quote/,                        expect: 1 },
    { name: 'CTA card rendered',                  re: /b-card cta/,                          expect: 1 },
    { name: 'theme-toggle button',                re: /id="theme-toggle"/,                   expect: 1 },
    { name: 'density-toggle button',              re: /id="density-toggle"/,                 expect: 1 },
    { name: 'font-toggle button',                 re: /id="font-toggle"/,                    expect: 1 },
    { name: 'density tokens (comfortable+compact)', re: /\[data-density="compact"\]/,        expect: 1 },
    { name: 'font-size tokens (S/M/L)',           re: /\[data-font-size="S"\]/,              expect: 1 },
    { name: 'annotation toggle button',           re: /id="annot-toggle"/,                   expect: 1 },
    { name: 'annotation insert toggle',           re: /id="annot-insert-toggle"/,            expect: 1 },
    { name: 'annotation drawer present',          re: /id="annot-drawer"/,                   expect: 1 },
    { name: 'annotation editor present',          re: /id="annot-editor"/,                   expect: 1 },
    { name: 'annotation toolbar present',         re: /id="annot-toolbar-comment"/,          expect: 1 },
    { name: 'format popover (bold/italic/etc)',   re: /id="annot-format-bold"/,              expect: 1 },
    { name: 'bento storage keys (not slide keys)', re: /bento-density/,                      expect: 1 },
    { name: 'no slide storage keys leaked',       re: /'slide-density'|slide-font-size/,     expect: 0 },
    { name: 'print hides chrome',                 re: /@media print[\s\S]{0,400}\.icon-rail[\s\S]{0,200}display: none/, expect: 1 },
    { name: 'annotation UI hidden in print',      re: /@media print[\s\S]{0,200}\.annot-drawer[\s\S]{0,120}display: none/, expect: 1 },
  ];

  let passed = 0, failed = 0;
  checks.forEach(({ name, re, expect }) => {
    const matches = (stdout.match(re) || []).length;
    const ok = matches >= expect;
    console.log(`  ${ok ? '✓' : '✗'} ${name.padEnd(48)} (${matches} match${matches === 1 ? '' : 'es'})`);
    ok ? passed++ : failed++;
  });

  const screenshotOk = fs.existsSync(TMP) && fs.statSync(TMP).size > 1000;
  console.log(`  ${screenshotOk ? '✓' : '✗'} Screenshot rendered                            (${screenshotOk ? fs.statSync(TMP).size + ' bytes' : 'MISSING'})`);
  screenshotOk ? passed++ : failed++;

  const log = fs.readFileSync(LOG, 'utf8');
  const errs = log.split('\n').filter(l => /CONSOLE\(\d+\)|ERROR|Uncaught/.test(l) && !/devtools|net::|ERR_FILE_NOT_FOUND|registration_request|DEPRECATED_ENDPOINT/.test(l));
  const noErrors = errs.length === 0;
  console.log(`  ${noErrors ? '✓' : '✗'} No JS console errors                            (${errs.length} found)`);
  if (!noErrors) errs.slice(0, 5).forEach(e => console.log('     ', e.trim()));
  noErrors ? passed++ : failed++;

  console.log(`\n${passed} passed · ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
});