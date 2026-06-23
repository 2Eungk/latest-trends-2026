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
assert.doesNotMatch(packageScript, /node_modules|\.git/, 'packager should not include development folders');
assert.match(readme, /npm run package/, 'README should document the packaging command');
assert.match(readme, /latest-trends-2026-demo\.zip/, 'README should name the generated zip artifact');

console.log('package contract checks passed');
