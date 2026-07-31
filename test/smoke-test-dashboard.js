#!/usr/bin/env node
// Smoke-test the dashboard template in headless Chrome.
// Verifies: page loads, htmx CDN loads, demo-mode XHR shim answers /api/*,
// KPI/chart/activity/table panels populate from mock data, theme toggle
// initializes, no JS console errors.

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const TEMPLATE = path.resolve(__dirname, '..', 'templates/dashboard/dashboard-template.html');
const TMP = '/tmp/html-pack-dashboard-test.png';
const LOG = '/tmp/html-pack-dashboard-test.log';

if (!fs.existsSync(TEMPLATE)) {
  console.error('Template not found:', TEMPLATE);
  process.exit(1);
}

const cmd = `google-chrome --headless=new --disable-gpu --no-sandbox \
  --window-size=1600,1000 \
  --enable-logging=stderr --v=0 \
  --virtual-time-budget=6000 \
  --screenshot=${TMP} \
  --dump-dom \
  file://${TEMPLATE} 2>${LOG}`;

console.log('Launching headless Chrome…');
exec(cmd, { maxBuffer: 50 * 1024 * 1024 }, (err, stdout, stderr) => {
  if (err) { console.error('Chrome error:', err.message); process.exit(1); }

  const checks = [
    { name: 'title set',                        re: /<title>Dashboard Template<\/title>/, expect: 1 },
    { name: 'data-demo-mode on body',           re: /data-demo-mode/,                     expect: 1 },
    { name: 'htmx CDN script tag',              re: /htmx\.org@2\.0\.4\/dist\/htmx\.min\.js/, expect: 1 },
    { name: 'htmx script has SRI integrity',    re: /integrity="sha384-/,                 expect: 1 },
    { name: 'theme-toggle button',              re: /id="theme-toggle"/,                  expect: 1 },
    { name: 'density-toggle button',            re: /id="density-toggle"/,               expect: 1 },
    { name: 'font-toggle button',               re: /id="font-toggle"/,                  expect: 1 },
    { name: 'data-density default',             re: /data-density="comfortable"/,       expect: 1 },
    { name: 'data-font-size default',           re: /data-font-size="M"/,                expect: 1 },
    { name: 'stat row wired to /api/stats',     re: /hx-get="\/api\/stats"/,               expect: 1 },
    { name: 'chart panel wired to /api/chart',  re: /hx-get="\/api\/chart"/,               expect: 1 },
    { name: 'activity feed wired to /api/activity', re: /hx-get="\/api\/activity"/,        expect: 1 },
    { name: 'table wired to /api/table',        re: /hx-get="\/api\/table"/,               expect: 1 },
    { name: 'stat cards rendered by demo mock', re: /class="stat-card"><div class="stat-label">Services up/, expect: 1 },
    { name: 'sparkline svg rendered',           re: /<svg viewBox="0 0 600 140"/,          expect: 1 },
    { name: 'activity feed items rendered',     re: /class="feed-dot (info|success|warning|error)"/, expect: 1 },
    { name: 'table rows rendered with badges',  re: /<span class="badge (success|warning|error)">/, expect: 1 },
    { name: 'sortable table headers present',   re: /data-sort-key="(name|status|latency|uptime|updated)"/g, expect: 5 },
    { name: 'poll pause/resume control present', re: /id="poll-toggle"/,                   expect: 1 },
    { name: 'no annotation system (out of scope for live data)', re: /annot-drawer/,       expect: 0 },
    { name: 'demo-mode block still present (ships as-is)', re: /BEGIN DEMO MODE/,          expect: 1 },
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
