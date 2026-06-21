import assert from 'node:assert/strict';
import { coverTemplateHtml, detectionLevel, detectionStatusText, motionScore, roiRectForPreset, sensitivityText, shouldTriggerCover } from './app.js';

const stillA = new Uint8ClampedArray([10, 10, 10, 255, 20, 20, 20, 255, 30, 30, 30, 255, 40, 40, 40, 255]);
const stillB = new Uint8ClampedArray(stillA);
assert.equal(motionScore(stillA, stillB), 0, 'identical frames should score 0');

const moved = new Uint8ClampedArray([250, 250, 250, 255, 20, 20, 20, 255, 30, 30, 30, 255, 40, 40, 40, 255]);
assert.equal(motionScore(stillA, moved), 100, 'sampled changed pixel should trigger motion');

assert.equal(motionScore(null, moved), 0, 'missing previous frame should be safe');
assert.equal(sensitivityText(6), '예민한 팀장 모드');
assert.equal(sensitivityText(16), '보통 사무실 모드');
assert.equal(sensitivityText(30), '카페/복도 둔감 모드');
assert.deepEqual(detectionLevel(0, 16), { label: '안전', className: 'safe', detail: '조용함 · 전환 안 함' });
assert.deepEqual(detectionLevel(10, 16), { label: '주의', className: 'warn', detail: '움직임 있음 · 감도 근접' });
assert.deepEqual(detectionLevel(16, 16), { label: '전환', className: 'hot', detail: '임계값 도달 · 위장 화면 준비' });

assert.equal(
  shouldTriggerCover({ score: 20, threshold: 16, now: 1000, lastTriggerAt: 0, cooldownMs: 1500 }),
  false,
  'motion inside cooldown should not retrigger the cover'
);
assert.equal(
  shouldTriggerCover({ score: 20, threshold: 16, now: 2000, lastTriggerAt: 0, cooldownMs: 1500 }),
  true,
  'motion after cooldown should trigger the cover'
);
assert.equal(
  shouldTriggerCover({ score: 10, threshold: 16, now: 3000, lastTriggerAt: 0, cooldownMs: 1500 }),
  false,
  'motion below threshold should not trigger the cover'
);

assert.equal(detectionStatusText('idle'), '대기 중 · 카메라 접근 전');
assert.equal(detectionStatusText('armed'), '보호 중 · 프레임 변화 감지 시작');
assert.equal(detectionStatusText('triggered'), '움직임 감지됨 · 업무 리포트로 전환');
assert.equal(detectionStatusText('demo'), '비상 전환 테스트 · 업무 리포트로 전환');
assert.equal(detectionStatusText('restored'), '보호 중 · 원래 화면 복귀');
assert.equal(detectionStatusText('camera-error', 'Permission denied'), '카메라 접근 실패: Permission denied');
assert.equal(detectionStatusText('unknown'), '대기 중 · 카메라 접근 전');

assert.deepEqual(roiRectForPreset('full', 160, 90), { x: 0, y: 0, width: 160, height: 90 });
assert.deepEqual(roiRectForPreset('left', 160, 90), { x: 0, y: 0, width: 80, height: 90 });
assert.deepEqual(roiRectForPreset('right', 160, 90), { x: 80, y: 0, width: 80, height: 90 });
assert.deepEqual(roiRectForPreset('back', 160, 90), { x: 0, y: 0, width: 160, height: 54 });
assert.deepEqual(roiRectForPreset('unknown', 160, 90), { x: 0, y: 0, width: 160, height: 90 });

const trendCover = coverTemplateHtml('trend');
assert.ok(trendCover.includes('2026 AI 산업 최신동향 리포트'), 'trend cover should keep the executive report title');
assert.ok(trendCover.includes('class="chart"'), 'trend cover should render chart-like business content');
assert.ok(!trendCover.includes('undefined'), 'trend cover should not leak undefined');

const docsCover = coverTemplateHtml('docs');
assert.ok(docsCover.includes('신사업 검토 문서'), 'docs cover should render a document title');
assert.ok(docsCover.includes('class="doc-page"'), 'docs cover should render a document page surface');
assert.ok(!docsCover.includes('undefined'), 'docs cover should not leak undefined');

const spreadsheetCover = coverTemplateHtml('spreadsheet');
assert.ok(spreadsheetCover.includes('Q3 업무 KPI 트래커'), 'spreadsheet cover should render a spreadsheet title');
assert.ok(spreadsheetCover.includes('class="sheet-grid"'), 'spreadsheet cover should render a sheet grid');
assert.ok(!spreadsheetCover.includes('undefined'), 'spreadsheet cover should not leak undefined');

const codeCover = coverTemplateHtml('code');
assert.ok(codeCover.includes('workspace/strategy-dashboard'), 'code cover should render an editor path');
assert.ok(codeCover.includes('class="code-editor"'), 'code cover should render a code editor surface');
assert.ok(!codeCover.includes('undefined'), 'code cover should not leak undefined');

console.log('motion checks passed');
