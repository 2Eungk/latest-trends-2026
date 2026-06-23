import assert from 'node:assert/strict';
import { calibrationSummary, coverTemplateHtml, demoCountdownText, detectionLevel, detectionStatusText, motionScore, normalizeSettings, permissionHelpText, roiRectForPreset, sensitivityText, SETTINGS_STORAGE_KEY, tuningTipForPreset, validateExternalUrl, shouldTriggerCover } from './app.js';

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
assert.deepEqual(calibrationSummary([3, 6, 9, 12]), { average: 8, max: 12, recommended: 16, label: '추천 기준값 16%' });
assert.deepEqual(calibrationSummary([18, 22, 31]), { average: 24, max: 31, recommended: 32, label: '추천 기준값 32%' });
assert.deepEqual(calibrationSummary([]), { average: 0, max: 0, recommended: 16, label: '캘리브레이션 대기' });

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
assert.equal(permissionHelpText('NotAllowedError'), '카메라 권한이 막혔어요 · 주소창 카메라 아이콘에서 허용으로 바꾼 뒤 다시 보호 시작');
assert.equal(permissionHelpText('NotFoundError'), '사용 가능한 카메라를 못 찾았어요 · 노트북/웹캠 연결을 확인하세요');
assert.equal(permissionHelpText('OtherError'), '카메라 시작 전 비상 전환 테스트로 위장 화면부터 확인하세요');

assert.equal(tuningTipForPreset('full'), '처음 튜닝은 전체 화면으로 점수 변화를 확인하세요');
assert.equal(tuningTipForPreset('back'), '뒤쪽 사람만 잡고 싶으면 상단/뒤쪽 배경 + 기준 16~24%부터 시작하세요');
assert.equal(tuningTipForPreset('right'), '오른쪽 통로가 문제면 오른쪽 복도 영역으로 좁혀 오작동을 줄이세요');
assert.equal(tuningTipForPreset('left'), '왼쪽 통로가 문제면 왼쪽 복도 영역으로 좁혀 오작동을 줄이세요');
assert.equal(tuningTipForPreset('unknown'), '처음 튜닝은 전체 화면으로 점수 변화를 확인하세요');

assert.equal(demoCountdownText(3), '3 · 팀장 접근 감지 준비');
assert.equal(demoCountdownText(2), '2 · 월급 보존 시스템 대기');
assert.equal(demoCountdownText(1), '1 · 2026 최신동향 전환');
assert.equal(demoCountdownText(0), '생존 성공 · 업무 화면 전환 완료');
assert.equal(demoCountdownText(99), '데모 시나리오 대기');

assert.deepEqual(validateExternalUrl('https://github.com/trending'), { ok: true, url: 'https://github.com/trending' });
assert.deepEqual(validateExternalUrl('  https://arxiv.org/  '), { ok: true, url: 'https://arxiv.org/' });
assert.deepEqual(validateExternalUrl('http://example.com'), { ok: false, message: 'https:// 주소만 사용할 수 있어요' });
assert.deepEqual(validateExternalUrl('javascript:alert(1)'), { ok: false, message: 'https:// 주소만 사용할 수 있어요' });
assert.deepEqual(validateExternalUrl('https://'), { ok: false, message: '올바른 URL을 입력하세요' });

assert.equal(SETTINGS_STORAGE_KEY, 'latest-trends-2026-settings-v1');
assert.deepEqual(
  normalizeSettings({ cover: 'paper', sensitivity: '24', roi: 'back', autoRestore: false, transitionMode: 'url', externalUrl: 'https://arxiv.org/', urlPreset: 'https://arxiv.org/' }),
  { cover: 'paper', sensitivity: 24, roi: 'back', autoRestore: false, transitionMode: 'url', externalUrl: 'https://arxiv.org/', urlPreset: 'https://arxiv.org/' },
  'valid saved settings should normalize into app state'
);
assert.deepEqual(
  normalizeSettings({ cover: 'bad', sensitivity: '99', roi: 'bad', autoRestore: 'nope', transitionMode: 'bad', externalUrl: 'javascript:alert(1)', urlPreset: 'ftp://bad' }),
  { cover: 'trend', sensitivity: 16, roi: 'full', autoRestore: true, transitionMode: 'cover', externalUrl: 'https://github.com/trending', urlPreset: 'https://github.com/trending' },
  'invalid saved settings should fall back safely'
);

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

const notionCover = coverTemplateHtml('notion');
assert.ok(notionCover.includes('프로젝트 운영 보드'), 'notion cover should render a project board title');
assert.ok(notionCover.includes('class="notion-board"'), 'notion cover should render board columns');
assert.ok(!notionCover.includes('undefined'), 'notion cover should not leak undefined');

const calendarCover = coverTemplateHtml('calendar');
assert.ok(calendarCover.includes('오늘의 회의 일정'), 'calendar cover should render a meeting schedule title');
assert.ok(calendarCover.includes('class="calendar-layout"'), 'calendar cover should render a calendar surface');
assert.ok(!calendarCover.includes('undefined'), 'calendar cover should not leak undefined');

const githubCover = coverTemplateHtml('github');
assert.ok(githubCover.includes('2026-latest-trends-shield'), 'github cover should render a repository name');
assert.ok(githubCover.includes('class="github-repo"'), 'github cover should render a GitHub-style repo surface');
assert.ok(!githubCover.includes('undefined'), 'github cover should not leak undefined');

const statsCover = coverTemplateHtml('stats');
assert.ok(statsCover.includes('산업 통계 대시보드'), 'stats cover should render a statistics dashboard title');
assert.ok(statsCover.includes('class="stats-dashboard"'), 'stats cover should render dashboard cards');
assert.ok(!statsCover.includes('undefined'), 'stats cover should not leak undefined');

const excelCover = coverTemplateHtml('excel');
assert.ok(excelCover.includes('예산_운영_통계.xlsx'), 'excel cover should render an Excel-like file name');
assert.ok(excelCover.includes('class="excel-workbook"'), 'excel cover should render workbook grid');
assert.ok(!excelCover.includes('undefined'), 'excel cover should not leak undefined');

const paperCover = coverTemplateHtml('paper');
assert.ok(paperCover.includes('Multimodal Workplace Automation Trends'), 'paper cover should render an English paper title');
assert.ok(paperCover.includes('class="paper-viewer"'), 'paper cover should render a paper viewer surface');
assert.ok(!paperCover.includes('undefined'), 'paper cover should not leak undefined');

console.log('motion checks passed');
