import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const packageJson = JSON.parse(read('package.json'));
const indexHtml = read('index.html');
const readme = read('README.md');
const appJs = read('app.js');

assert.ok(packageJson.scripts?.check, 'package.json should expose npm run check');
assert.ok(packageJson.scripts.check.includes('check-static-contract'), 'check script should include static contract guard');

for (const [name, source] of [['README.md', readme], ['index.html', indexHtml]]) {
  assert.match(source, /로컬|Local-only|local-only/i, `${name} should state local-only operation`);
  assert.match(source, /업로드 없음|서버 업로드 없음|서버 업로드\/저장 없음|no upload/i, `${name} should state no-upload privacy boundary`);
}

assert.doesNotMatch(indexHtml, /<script[^>]+src=["']https?:\/\//i, 'index.html should not load external scripts');
assert.doesNotMatch(appJs, /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/, 'app should not contain outbound network APIs');
assert.doesNotMatch(appJs, /\b(eval|Function)\s*\(/, 'app should not use eval or dynamic Function');
assert.match(appJs, /getUserMedia/, 'camera access should remain explicit and auditable');
assert.match(appJs, /coverTemplateHtml/, 'cover templates should remain internally generated');
assert.match(indexHtml, /월급 보존 중/, 'landing should include the viral salary-preservation hook');
assert.match(indexHtml, /팀장 접근 대비/, 'landing should make the boss-detection joke obvious');
assert.match(indexHtml, /업무 화면 준비 완료/, 'landing should communicate cover-screen readiness');
assert.match(indexHtml, /주소창 카메라 아이콘/, 'landing should explain how to recover from blocked camera permission');
assert.match(indexHtml, /상단\/뒤쪽 배경/, 'landing should guide users toward rear-background tuning');
assert.match(indexHtml, /데모 시나리오 시작/, 'landing should include a showable demo scenario button');
assert.match(indexHtml, /demoCountdown/, 'landing should include a countdown display region');
assert.match(appJs, /permissionHelpText/, 'camera permission recovery copy should be centralized');
assert.match(appJs, /tuningTipForPreset/, 'ROI tuning help should be centralized');
assert.match(appJs, /demoCountdownText/, 'demo countdown copy should be centralized');

console.log('static contract checks passed');
