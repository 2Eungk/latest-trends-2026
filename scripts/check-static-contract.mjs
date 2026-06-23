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
assert.match(indexHtml, /Notion 프로젝트 보드/, 'cover selector should include a Notion-style board');
assert.match(indexHtml, /캘린더\/회의 일정/, 'cover selector should include a calendar-style schedule');
assert.match(indexHtml, /GitHub 저장소 화면/, 'cover selector should include a GitHub-style repo screen');
assert.match(indexHtml, /통계자료 대시보드/, 'cover selector should include a statistics dashboard screen');
assert.match(indexHtml, /Excel 통계 시트/, 'cover selector should include an Excel-style sheet screen');
assert.match(indexHtml, /영어 논문 PDF/, 'cover selector should include an English paper screen');
assert.match(indexHtml, /데모 찍는 법/, 'landing should include a short demo-filming guide');
assert.match(indexHtml, /친구에게 보여줄 때/, 'landing should include friend-beta sharing copy');
assert.match(indexHtml, /지정 URL 열기/, 'landing should include custom external URL mode');
assert.match(indexHtml, /https:\/\/github.com\/trending/, 'landing should include safe default external URL examples');
assert.match(indexHtml, /urlMode/, 'landing should expose an explicit URL transition mode control');
assert.match(indexHtml, /이 브라우저에만 저장됨/, 'landing should explain local-only settings persistence');
assert.match(appJs, /localStorage/, 'app should persist settings in browser localStorage');
assert.match(appJs, /SETTINGS_STORAGE_KEY/, 'app should use a named settings storage key');
assert.match(readme, /친구에게 보내는 사용법/, 'README should include friend-beta instructions');
assert.match(readme, /로컬 서버만 켜서 보여주기/, 'README should avoid implying public deployment by default');
assert.match(readme, /실제 자료 URL 모드/, 'README should document the external URL mode');
assert.match(readme, /https:\/\//, 'README should document HTTPS-only URL safety');
assert.match(appJs, /permissionHelpText/, 'camera permission recovery copy should be centralized');
assert.match(appJs, /tuningTipForPreset/, 'ROI tuning help should be centralized');
assert.match(appJs, /demoCountdownText/, 'demo countdown copy should be centralized');

console.log('static contract checks passed');
