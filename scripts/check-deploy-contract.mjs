import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const indexHtml = read('index.html');
const readme = read('README.md');
const appJs = read('app.js');
const workflowPath = new URL('.github/workflows/pages.yml', root);
const builderPath = new URL('scripts/build-static-site.mjs', root);

assert.ok(packageJson.scripts?.['build:site'], 'package.json should expose npm run build:site for URL deployment');
assert.ok(packageJson.scripts?.['deploy:check'], 'package.json should expose npm run deploy:check');
assert.ok(packageJson.scripts.check.includes('check-deploy-contract'), 'npm run check should guard URL deployment safety');
assert.ok(existsSync(builderPath), 'static site builder should exist');
assert.ok(existsSync(workflowPath), 'GitHub Pages workflow should exist');

const workflow = read('.github/workflows/pages.yml');
const builder = read('scripts/build-static-site.mjs');

assert.match(workflow, /actions\/configure-pages@v5/, 'workflow should configure GitHub Pages');
assert.match(workflow, /actions\/upload-pages-artifact@v3/, 'workflow should upload a Pages artifact');
assert.match(workflow, /actions\/deploy-pages@v4/, 'workflow should deploy via official Pages action');
assert.match(workflow, /npm run check/, 'workflow should run full safety checks before deploy');
assert.match(workflow, /npm run build:site/, 'workflow should build a static site artifact');
assert.match(workflow, /path: dist\/site/, 'workflow should upload only the built static site folder');
assert.doesNotMatch(workflow, /secrets\./, 'static Pages deploy should not require custom secrets');

for (const file of ['index.html', 'styles.css', 'app.js', 'README.md', 'QUICKSTART.md']) {
  assert.match(builder, new RegExp(file.replace('.', '\\.')), `static site builder should copy ${file}`);
}
assert.match(builder, /dist\/site/, 'static site builder should write to dist/site');
assert.doesNotMatch(builder, /node_modules|\.git/, 'static site builder should not copy development folders');

assert.match(readme, /URL로 보여주기/, 'README should document URL sharing mode');
assert.match(readme, /GitHub Pages/, 'README should name GitHub Pages as the static URL deployment path');
assert.match(readme, /npm run build:site/, 'README should document the static site build command');
assert.match(readme, /서버 업로드 없음/, 'README should preserve no-upload privacy copy for URL mode');
assert.match(indexHtml, /서버 업로드 없음/, 'first viewport should keep no-upload copy even when hosted by URL');
assert.doesNotMatch(appJs, /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/, 'URL deployment must still avoid outbound browser APIs');

console.log('deploy contract checks passed');
