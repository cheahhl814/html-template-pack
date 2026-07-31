#!/usr/bin/env node
// Master test runner for html-template-pack.
// Verifies both report and slide templates are healthy.

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

const suites = [
  { name: 'Report template (multi-tab capable, v2 annotation, theme toggle)', script: 'test/smoke-test-report.js' },
  { name: 'Slide template (5-slide deck, v1 inline annotation, theme toggle, print)', script: 'test/smoke-test-slide.js' },
  { name: 'Dashboard template (htmx panels, demo-mode mock backend, theme toggle)', script: 'test/smoke-test-dashboard.js' }
];

console.log('html-template-pack · test suite\n' + '─'.repeat(60));
let allOk = true;
for (const suite of suites) {
  console.log(`\n  ${suite.name}\n`);
  try {
    const out = execSync(`node ${suite.script}`, { encoding: 'utf8' });
    const lines = out.trim().split('\n');
    const tail = lines.slice(Math.max(0, lines.length - 35)).join('\n');
    console.log(tail);
  } catch (e) {
    console.error(e.stdout || e.message);
    allOk = false;
  }
}
console.log('\n' + '─'.repeat(60));
console.log(allOk ? '  All suites passed.' : '  Some suites failed.');
process.exit(allOk ? 0 : 1);
