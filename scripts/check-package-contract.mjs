import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const packageScript = read('scripts/package-demo.mjs');
const readme = read('README.md');

assert.ok(packageJson.scripts?.package, 'package.json should expose npm run package');
assert.match(packageJson.scripts.package, /package-demo\.mjs/, 'package script should run the demo packager');
assert.match(packageScript, /latest-trends-2026-demo\.zip/, 'packager should write the expected friend-demo zip name');
assert.match(packageScript, /index\.html/, 'packager should include index.html');
assert.match(packageScript, /app\.js/, 'packager should include app.js');
assert.match(packageScript, /styles\.css/, 'packager should include styles.css');
assert.match(packageScript, /README\.md/, 'packager should include README.md');
assert.match(packageScript, /start\.command/, 'packager should include the Mac double-click launcher');
assert.match(packageScript, /start\.bat/, 'packager should include the Windows double-click launcher');
assert.doesNotMatch(packageScript, /node_modules|\.git/, 'packager should not include development folders');
assert.match(read('start.command'), /open\s+"?\$\{URL\}"?|open\s+http:\/\/127\.0\.0\.1:4180/, 'Mac launcher should open the local app URL');
assert.match(read('start.command'), /python3|python/, 'Mac launcher should try Python local server');
assert.match(read('start.bat'), /start\s+%URL%|start\s+http:\/\/127\.0\.0\.1:4180/i, 'Windows launcher should open the local app URL');
assert.match(read('start.bat'), /py -3|python/, 'Windows launcher should try Python local server');
assert.match(readme, /npm run package/, 'README should document the packaging command');
assert.match(readme, /latest-trends-2026-demo\.zip/, 'README should name the generated zip artifact');

console.log('package contract checks passed');
