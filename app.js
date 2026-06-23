export function motionScore(previous, current, pixelThreshold = 28) {
  if (!previous || !current || previous.length !== current.length) return 0;
  let changed = 0;
  let sampled = 0;
  for (let i = 0; i < current.length; i += 16) {
    const diff = Math.abs(current[i] - previous[i]) + Math.abs(current[i + 1] - previous[i + 1]) + Math.abs(current[i + 2] - previous[i + 2]);
    if (diff > pixelThreshold) changed += 1;
    sampled += 1;
  }
  return sampled === 0 ? 0 : Math.round((changed / sampled) * 100);
}

export function sensitivityText(value) {
  const v = Number(value);
  if (v <= 10) return '예민한 팀장 모드';
  if (v >= 24) return '카페/복도 둔감 모드';
  return '보통 사무실 모드';
}

export function detectionLevel(score, threshold) {
  if (score >= threshold) return { label: '전환', className: 'hot', detail: '임계값 도달 · 위장 화면 준비' };
  if (score >= threshold * 0.55) return { label: '주의', className: 'warn', detail: '움직임 있음 · 감도 근접' };
  return { label: '안전', className: 'safe', detail: '조용함 · 전환 안 함' };
}

export function calibrationSummary(samples = []) {
  if (!samples.length) return { average: 0, max: 0, recommended: 16, label: '캘리브레이션 대기' };
  const numeric = samples.map(Number).filter(Number.isFinite);
  if (!numeric.length) return { average: 0, max: 0, recommended: 16, label: '캘리브레이션 대기' };
  const average = Math.round(numeric.reduce((sum, value) => sum + value, 0) / numeric.length);
  const max = Math.max(...numeric);
  const recommended = Math.min(32, Math.max(6, Math.round(Math.max(max + 4, average + 8))));
  return { average, max, recommended, label: `추천 기준값 ${recommended}%` };
}

export function shouldTriggerCover({ score, threshold, now, lastTriggerAt, cooldownMs }) {
  return score >= threshold && now - lastTriggerAt >= cooldownMs;
}

export function detectionStatusText(state, detail = '') {
  const statuses = {
    idle: '대기 중 · 카메라 접근 전',
    armed: '보호 중 · 프레임 변화 감지 시작',
    triggered: '움직임 감지됨 · 업무 리포트로 전환',
    demo: '비상 전환 테스트 · 업무 리포트로 전환',
    restored: '보호 중 · 원래 화면 복귀'
  };
  if (state === 'camera-error') return `카메라 접근 실패: ${detail}`;
  return statuses[state] || statuses.idle;
}

export function permissionHelpText(errorName = '') {
  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return '카메라 권한이 막혔어요 · 주소창 카메라 아이콘에서 허용으로 바꾼 뒤 다시 보호 시작';
  }
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return '사용 가능한 카메라를 못 찾았어요 · 노트북/웹캠 연결을 확인하세요';
  }
  return '카메라 시작 전 비상 전환 테스트로 위장 화면부터 확인하세요';
}

export function tuningTipForPreset(preset) {
  const tips = {
    full: '처음 튜닝은 전체 화면으로 점수 변화를 확인하세요',
    back: '뒤쪽 사람만 잡고 싶으면 상단/뒤쪽 배경 + 기준 16~24%부터 시작하세요',
    right: '오른쪽 통로가 문제면 오른쪽 복도 영역으로 좁혀 오작동을 줄이세요',
    left: '왼쪽 통로가 문제면 왼쪽 복도 영역으로 좁혀 오작동을 줄이세요'
  };
  return tips[preset] || tips.full;
}

export function demoCountdownText(step) {
  const steps = {
    3: '3 · 팀장 접근 감지 준비',
    2: '2 · 월급 보존 시스템 대기',
    1: '1 · 2026 최신동향 전환',
    0: '생존 성공 · 업무 화면 전환 완료'
  };
  return steps[step] || '데모 시나리오 대기';
}

export function validateExternalUrl(value) {
  const raw = String(value || '').trim();
  if (!raw.startsWith('https://')) return { ok: false, message: 'https:// 주소만 사용할 수 있어요' };
  try {
    const url = new URL(raw);
    if (!url.hostname) return { ok: false, message: '올바른 URL을 입력하세요' };
    return { ok: true, url: url.href };
  } catch {
    return { ok: false, message: '올바른 URL을 입력하세요' };
  }
}

export const SETTINGS_STORAGE_KEY = 'latest-trends-2026-settings-v1';

const DEFAULT_SETTINGS = {
  cover: 'trend',
  sensitivity: 16,
  roi: 'full',
  autoRestore: true,
  transitionMode: 'cover',
  externalUrl: 'https://github.com/trending',
  urlPreset: 'https://github.com/trending'
};

const VALID_COVERS = new Set(['trend', 'sheet', 'meeting', 'docs', 'spreadsheet', 'notion', 'calendar', 'github', 'stats', 'excel', 'paper', 'code']);
const VALID_ROIS = new Set(['full', 'left', 'right', 'back']);
const VALID_TRANSITION_MODES = new Set(['cover', 'url']);
const VALID_URL_PRESETS = new Set(['https://github.com/trending', 'https://arxiv.org/', 'https://scholar.google.com/', 'https://kosis.kr/']);

export function normalizeSettings(raw = {}) {
  const sensitivity = Number(raw.sensitivity);
  const external = validateExternalUrl(raw.externalUrl);
  const preset = validateExternalUrl(raw.urlPreset);
  return {
    cover: VALID_COVERS.has(raw.cover) ? raw.cover : DEFAULT_SETTINGS.cover,
    sensitivity: Number.isFinite(sensitivity) && sensitivity >= 6 && sensitivity <= 32 ? sensitivity : DEFAULT_SETTINGS.sensitivity,
    roi: VALID_ROIS.has(raw.roi) ? raw.roi : DEFAULT_SETTINGS.roi,
    autoRestore: typeof raw.autoRestore === 'boolean' ? raw.autoRestore : DEFAULT_SETTINGS.autoRestore,
    transitionMode: VALID_TRANSITION_MODES.has(raw.transitionMode) ? raw.transitionMode : DEFAULT_SETTINGS.transitionMode,
    externalUrl: external.ok ? external.url : DEFAULT_SETTINGS.externalUrl,
    urlPreset: preset.ok && VALID_URL_PRESETS.has(preset.url) ? preset.url : DEFAULT_SETTINGS.urlPreset
  };
}

export function roiRectForPreset(preset, width, height) {
  const w = Math.max(0, Math.floor(width));
  const h = Math.max(0, Math.floor(height));
  if (preset === 'left') return { x: 0, y: 0, width: Math.floor(w / 2), height: h };
  if (preset === 'right') return { x: Math.floor(w / 2), y: 0, width: w - Math.floor(w / 2), height: h };
  if (preset === 'back') return { x: 0, y: 0, width: w, height: Math.floor(h * 0.6) };
  return { x: 0, y: 0, width: w, height: h };
}

const templates = {
  trend: {
    title: '2026 AI 산업 최신동향 리포트',
    badge: 'Executive Brief',
    metrics: [['17.2%', '시장 CAGR'], ['42개', '도입 과제'], ['Q3', '전환 로드맵'], ['91점', '업무 적합도']],
    rows: [['생성형 AI 내재화', '업무 자동화', '상'], ['온디바이스 모델', '보안/비용 절감', '중'], ['멀티모달 분석', '콘텐츠 운영', '상']]
  },
  sheet: {
    title: '분기별 업무 KPI 점검표',
    badge: 'KPI Review',
    metrics: [['128%', '계획 대비'], ['34건', '완료 태스크'], ['8.7h', '주간 절감'], ['A-', '리스크 등급']],
    rows: [['고객 응답 SLA', '98.4%', '정상'], ['문서 자동화율', '61.8%', '개선'], ['운영 리포트', '12건', '정상']]
  },
  meeting: {
    title: '전략회의 회의록 및 액션아이템',
    badge: 'Meeting Notes',
    metrics: [['11:00', '회의 시간'], ['6개', '안건'], ['14개', '액션'], ['D-3', '마감 임박']],
    rows: [['시장 리서치', '최신동향 업데이트', '진행'], ['자료 취합', '팀별 KPI 수집', '대기'], ['리스크 검토', '법무/보안 확인', '진행']]
  }
};

export function coverTemplateHtml(kind) {
  if (kind === 'docs') {
    return `
      <div class="fake-toolbar"><span></span><span></span><span></span><strong>신사업 검토 문서</strong></div>
      <article class="doc-page">
        <h2>2026 신사업 검토 문서</h2>
        <p class="muted">작성자 전략기획팀 · 최근 수정 3분 전</p>
        <h3>1. 검토 배경</h3>
        <p>AI 기반 업무 자동화 도입률이 빠르게 증가하면서, 내부 프로세스와 외부 고객 접점을 동시에 개선할 필요가 있습니다.</p>
        <h3>2. 이번 주 액션아이템</h3>
        <ul><li>시장 데이터 업데이트</li><li>운영 리스크 체크</li><li>파일럿 범위 재정의</li></ul>
      </article>
    `;
  }
  if (kind === 'spreadsheet') {
    const rows = [['마케팅 리서치', '92%', '정상'], ['자동화 리포트', '67%', '주의'], ['문서 정리', '84%', '정상'], ['회의록 배포', '100%', '완료']];
    return `
      <div class="sheet-shell">
        <div class="sheet-title">Q3 업무 KPI 트래커</div>
        <div class="sheet-grid">
          <div class="sheet-head">업무</div><div class="sheet-head">진척</div><div class="sheet-head">상태</div>
          ${rows.map((row) => row.map((cell) => `<div>${cell}</div>`).join('')).join('')}
        </div>
      </div>
    `;
  }
  if (kind === 'notion') {
    const columns = [
      ['이번 주', ['시장 리서치 업데이트', '고객 미팅 질문 정리', 'Q3 자동화 후보 선별']],
      ['진행 중', ['운영 리포트 초안', '경쟁사 기능 맵핑', '보안 체크리스트 검토']],
      ['검토 완료', ['회의록 배포', 'KPI 테이블 정리', '주간 공유자료 업로드']]
    ];
    return `
      <section class="notion-page">
        <div class="notion-crumb">Workspace / Strategy / 2026</div>
        <h2>프로젝트 운영 보드</h2>
        <p class="muted">신사업 검토와 운영 액션아이템을 한 화면에서 관리합니다.</p>
        <div class="notion-board">
          ${columns.map(([title, cards]) => `<section><h3>${title}</h3>${cards.map((card) => `<article>${card}<small>담당 전략기획 TF</small></article>`).join('')}</section>`).join('')}
        </div>
      </section>
    `;
  }
  if (kind === 'calendar') {
    const events = [['09:30', '주간 업무 싱크', '회의실 B'], ['11:00', 'AI 도입 과제 리뷰', 'Zoom'], ['14:00', '파트너 자료 점검', '전략기획'], ['16:30', '리스크/보안 체크', '문서 검토']];
    return `
      <section class="calendar-layout">
        <aside><span class="calendar-month">2026.06</span><strong>21</strong><small>Sunday</small></aside>
        <div class="calendar-main">
          <h2>오늘의 회의 일정</h2>
          <p class="muted">우선순위 높은 회의와 액션아이템만 표시합니다.</p>
          <div class="calendar-events">${events.map(([time, title, place]) => `<div><time>${time}</time><strong>${title}</strong><span>${place}</span></div>`).join('')}</div>
        </div>
      </section>
    `;
  }
  if (kind === 'github') {
    const files = ['README.md', 'app.js', 'scripts/check-static-contract.mjs', 'docs/external-code-intake.md'];
    return `
      <section class="github-repo">
        <header><span>eung</span><strong>2026-latest-trends-shield</strong><em>Private</em></header>
        <nav><b>Code</b><span>Issues</span><span>Pull requests</span><span>Actions</span><span>Security</span></nav>
        <div class="repo-summary"><strong>Local-only webcam privacy shield</strong><p>No upload · no face recognition · browser-only motion detection</p></div>
        <div class="repo-files">${files.map((file) => `<div><span>${file}</span><small>updated just now</small></div>`).join('')}</div>
      </section>
    `;
  }
  if (kind === 'stats') {
    const cards = [['72.4%', '업무 자동화 도입률'], ['18.6%', '연간 생산성 개선'], ['4.8x', '리포트 처리 속도'], ['31개', '관찰 산업군']];
    return `
      <section class="stats-dashboard">
        <h2>산업 통계 대시보드</h2>
        <p class="muted">2026 업무 자동화/AI 생산성 지표 요약</p>
        <div class="stats-cards">${cards.map(([n, l]) => `<article><strong>${n}</strong><span>${l}</span></article>`).join('')}</div>
        <div class="stats-bars">${[64, 82, 53, 91, 76, 68].map((h) => `<i style="height:${h}%"></i>`).join('')}</div>
      </section>
    `;
  }
  if (kind === 'excel') {
    const rows = [['A', '항목', 'Q1', 'Q2', 'Q3', '상태'], ['1', '운영비', '42.1', '39.8', '37.6', '개선'], ['2', '자동화율', '51%', '64%', '72%', '상승'], ['3', '처리시간', '8.4h', '6.1h', '4.9h', '단축']];
    return `
      <section class="excel-workbook">
        <div class="excel-title">예산_운영_통계.xlsx</div>
        <div class="excel-ribbon">파일 홈 삽입 데이터 검토 보기 자동화</div>
        <div class="excel-grid">${rows.flatMap((row) => row.map((cell) => `<div>${cell}</div>`)).join('')}</div>
      </section>
    `;
  }
  if (kind === 'paper') {
    return `
      <article class="paper-viewer">
        <header><span>arXiv-style preprint review</span><strong>PDF</strong></header>
        <h2>Multimodal Workplace Automation Trends in 2026</h2>
        <p class="paper-authors">J. Kim, S. Park, and Strategy Intelligence Lab</p>
        <h3>Abstract</h3>
        <p>We analyze enterprise adoption patterns across multimodal AI workflows, focusing on privacy-preserving deployment, local inference, and productivity measurement.</p>
        <h3>Keywords</h3>
        <p>workflow automation · local-first systems · productivity analytics · privacy shield</p>
      </article>
    `;
  }
  if (kind === 'code') {
    return `
      <div class="code-editor">
        <div class="code-title">workspace/strategy-dashboard/src/analysis.ts</div>
        <pre><code><span>const trend = await loadQuarterlySignals();</span>
<span>const automationScore = trend.reduce(weightedAverage);</span>
<span>export const report = buildExecutiveSummary({</span>
<span>  year: 2026,</span>
<span>  focus: 'AI productivity',</span>
<span>  status: 'review-ready'</span>
<span>});</span></code></pre>
      </div>
    `;
  }
  const data = templates[kind] || templates.trend;
  const bars = [58, 78, 46, 88, 71, 94, 66];
  return `
    <div class="report-title">
      <div><span class="pill">${data.badge}</span><h2>${data.title}</h2></div>
      <p>작성일 2026.06.21<br/>담당 조직 전략기획 TF</p>
    </div>
    <div class="metrics">${data.metrics.map(([n, l]) => `<div class="metric"><span>${l}</span><strong>${n}</strong></div>`).join('')}</div>
    <div class="grid">
      <div class="doc-card"><h3>핵심 지표 추이</h3><div class="chart">${bars.map((h) => `<div class="bar" style="height:${h}%"></div>`).join('')}</div></div>
      <div class="doc-card"><h3>오늘의 검토 항목</h3><table><thead><tr><th>구분</th><th>내용</th><th>상태</th></tr></thead><tbody>${data.rows.map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div>
    </div>
  `;
}

function initApp() {
  const app = document.querySelector('#app');
  const startButton = document.querySelector('#startButton');
  const demoButton = document.querySelector('#demoButton');
  const scenarioDemoButton = document.querySelector('#scenarioDemoButton');
  const restoreButton = document.querySelector('#restoreButton');
  const coverExit = document.querySelector('#coverExit');
  const cover = document.querySelector('#cover');
  const coverContent = document.querySelector('#coverContent');
  const coverSelect = document.querySelector('#coverSelect');
  const statusEl = document.querySelector('#status');
  const sensitivity = document.querySelector('#sensitivity');
  const sensitivityLabel = document.querySelector('#sensitivityLabel');
  const roiSelect = document.querySelector('#roiSelect');
  const autoRestore = document.querySelector('#autoRestore');
  const transitionMode = document.querySelector('#transitionMode');
  const externalUrl = document.querySelector('#externalUrl');
  const urlPreset = document.querySelector('#urlPreset');
  const urlHelp = document.querySelector('#urlHelp');
  const urlTestButton = document.querySelector('#urlTestButton');
  const settingsStatus = document.querySelector('#settingsStatus');
  const calibrationButton = document.querySelector('#calibrationButton');
  const applyCalibrationButton = document.querySelector('#applyCalibrationButton');
  const calibrationResult = document.querySelector('#calibrationResult');
  const video = document.querySelector('#video');
  const canvas = document.querySelector('#motionCanvas');
  const motionBadge = document.querySelector('#motionBadge');
  const scoreLabel = document.querySelector('#scoreLabel');
  const scoreDetail = document.querySelector('#scoreDetail');
  const permissionHelp = document.querySelector('#permissionHelp');
  const tuningTip = document.querySelector('#tuningTip');
  const demoCountdown = document.querySelector('#demoCountdown');
  const demoResult = document.querySelector('#demoResult');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  let previousFrame = null;
  let coverVisible = false;
  let lastMotionAt = 0;
  let lastTriggerAt = 0;
  let rafId = null;
  let demoRunning = false;
  let calibrationActive = false;
  let calibrationStartedAt = 0;
  let calibrationSamples = [];
  let lastCalibration = null;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function readFormSettings() {
    return normalizeSettings({
      cover: coverSelect.value,
      sensitivity: sensitivity.value,
      roi: roiSelect.value,
      autoRestore: autoRestore.checked,
      transitionMode: transitionMode.value,
      externalUrl: externalUrl.value,
      urlPreset: urlPreset.value
    });
  }

  function applySettings(settings) {
    coverSelect.value = settings.cover;
    sensitivity.value = String(settings.sensitivity);
    sensitivityLabel.textContent = sensitivityText(settings.sensitivity);
    roiSelect.value = settings.roi;
    autoRestore.checked = settings.autoRestore;
    transitionMode.value = settings.transitionMode;
    externalUrl.value = settings.externalUrl;
    urlPreset.value = settings.urlPreset;
    const level = detectionLevel(Number(scoreDetail.dataset.score || 0), settings.sensitivity);
    scoreLabel.textContent = level.label;
    scoreLabel.className = level.className;
    scoreDetail.textContent = `점수 ${scoreDetail.dataset.score || 0}% · 기준 ${settings.sensitivity}% · ${level.detail}`;
    tuningTip.textContent = tuningTipForPreset(settings.roi);
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(readFormSettings()));
      settingsStatus.textContent = '설정은 이 브라우저에만 저장됨';
    } catch {
      settingsStatus.textContent = '설정 저장 실패 · 브라우저 저장소를 확인하세요';
    }
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return;
      applySettings(normalizeSettings(JSON.parse(raw)));
      settingsStatus.textContent = '저장된 설정 불러옴 · 이 브라우저에만 저장됨';
    } catch {
      applySettings(normalizeSettings());
      settingsStatus.textContent = '저장된 설정을 복구하지 못해 기본값 사용';
    }
  }

  loadSettings();

  function showCover(state = 'triggered') {
    coverContent.innerHTML = coverTemplateHtml(coverSelect.value);
    cover.classList.remove('hidden');
    app.setAttribute('aria-hidden', 'true');
    restoreButton.classList.remove('hidden');
    coverVisible = true;
    statusEl.textContent = detectionStatusText(state);
  }

  function hideCover() {
    cover.classList.add('hidden');
    app.removeAttribute('aria-hidden');
    coverVisible = false;
    restoreButton.classList.add('hidden');
    statusEl.textContent = detectionStatusText('restored');
  }

  function openExternalUrl() {
    const result = validateExternalUrl(externalUrl.value);
    if (!result.ok) {
      urlHelp.textContent = result.message;
      return false;
    }
    urlHelp.textContent = `이동 준비됨 · ${result.url}`;
    window.location.assign(result.url);
    return true;
  }

  function activateCover(state = 'triggered') {
    if (transitionMode.value === 'url') {
      openExternalUrl();
      return;
    }
    showCover(state);
  }

  function tick() {
    if (video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const roi = roiRectForPreset(roiSelect.value, canvas.width, canvas.height);
      const frame = ctx.getImageData(roi.x, roi.y, roi.width, roi.height).data;
      const score = motionScore(previousFrame, frame, 28);
      previousFrame = new Uint8ClampedArray(frame);
      const threshold = Number(sensitivity.value);
      const level = detectionLevel(score, threshold);
      motionBadge.textContent = `움직임 ${score}%`;
      motionBadge.className = `badge ${level.className}`;
      scoreLabel.textContent = level.label;
      scoreLabel.className = level.className;
      scoreDetail.dataset.score = String(score);
      scoreDetail.textContent = `점수 ${score}% · 기준 ${threshold}% · ${level.detail}`;
      if (calibrationActive) {
        calibrationSamples.push(score);
        const elapsed = Date.now() - calibrationStartedAt;
        calibrationResult.textContent = `캘리브레이션 중 · ${Math.min(5, Math.ceil(elapsed / 1000))}/5초 · 현재 ${score}%`;
        if (elapsed >= 5000) {
          calibrationActive = false;
          calibrationButton.disabled = false;
          lastCalibration = calibrationSummary(calibrationSamples);
          applyCalibrationButton.disabled = false;
          calibrationResult.textContent = `평균 ${lastCalibration.average}% · 최고 ${lastCalibration.max}% · ${lastCalibration.label}`;
        }
      }
      if (!calibrationActive && score >= threshold) {
        const now = Date.now();
        lastMotionAt = now;
        if (!coverVisible && shouldTriggerCover({ score, threshold, now, lastTriggerAt, cooldownMs: 1500 })) {
          lastTriggerAt = now;
          activateCover('triggered');
        }
      }
      if (coverVisible && autoRestore.checked && Date.now() - lastMotionAt > 5000) hideCover();
    }
    rafId = requestAnimationFrame(tick);
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640 }, audio: false });
      video.srcObject = stream;
      await video.play();
      statusEl.textContent = detectionStatusText('armed');
      permissionHelp.textContent = '카메라 연결됨 · 뒤에 한 번 지나가며 점수와 기준값을 맞춰보세요';
      startButton.disabled = true;
      rafId = requestAnimationFrame(tick);
    } catch (error) {
      statusEl.textContent = detectionStatusText('camera-error', error.message);
      permissionHelp.textContent = permissionHelpText(error.name);
    }
  }

  async function startDemoScenario() {
    if (demoRunning) return;
    demoRunning = true;
    scenarioDemoButton.disabled = true;
    demoResult.textContent = '';
    for (const step of [3, 2, 1]) {
      const message = demoCountdownText(step);
      demoCountdown.textContent = message;
      statusEl.textContent = message;
      await wait(1000);
    }
    activateCover('demo');
    const success = demoCountdownText(0);
    demoCountdown.textContent = success;
    demoResult.textContent = success;
    scenarioDemoButton.disabled = false;
    demoRunning = false;
  }

  function startCalibration() {
    calibrationActive = true;
    calibrationStartedAt = Date.now();
    calibrationSamples = [];
    lastCalibration = null;
    calibrationButton.disabled = true;
    applyCalibrationButton.disabled = true;
    calibrationResult.textContent = '캘리브레이션 중 · 0/5초 · 뒤에서 한 번 지나가 보세요';
  }

  function applyCalibration() {
    if (!lastCalibration) return;
    sensitivity.value = String(lastCalibration.recommended);
    sensitivity.dispatchEvent(new Event('input', { bubbles: true }));
    calibrationResult.textContent = `추천 감도 적용됨 · 기준 ${lastCalibration.recommended}%`;
  }

  sensitivity.addEventListener('input', () => {
    const threshold = Number(sensitivity.value);
    sensitivityLabel.textContent = sensitivityText(threshold);
    const currentScore = Number(scoreDetail.dataset.score || 0);
    const level = detectionLevel(currentScore, threshold);
    scoreLabel.textContent = level.label;
    scoreLabel.className = level.className;
    scoreDetail.textContent = `점수 ${currentScore}% · 기준 ${threshold}% · ${level.detail}`;
    saveSettings();
  });
  roiSelect.addEventListener('change', () => {
    previousFrame = null;
    motionBadge.textContent = `감지 영역: ${roiSelect.selectedOptions[0].textContent}`;
    tuningTip.textContent = tuningTipForPreset(roiSelect.value);
    saveSettings();
  });
  startButton.addEventListener('click', startCamera);
  demoButton.addEventListener('click', () => activateCover('demo'));
  scenarioDemoButton.addEventListener('click', startDemoScenario);
  urlPreset.addEventListener('change', () => {
    externalUrl.value = urlPreset.value;
    urlHelp.textContent = '추천 URL 적용됨 · 테스트 후 사용하세요';
    saveSettings();
  });
  externalUrl.addEventListener('input', () => {
    const result = validateExternalUrl(externalUrl.value);
    urlHelp.textContent = result.ok ? `유효한 URL · ${result.url}` : result.message;
    saveSettings();
  });
  urlTestButton.addEventListener('click', openExternalUrl);
  calibrationButton.addEventListener('click', startCalibration);
  applyCalibrationButton.addEventListener('click', applyCalibration);
  restoreButton.addEventListener('click', hideCover);
  coverExit.addEventListener('click', hideCover);
  coverSelect.addEventListener('change', () => {
    if (coverVisible) coverContent.innerHTML = coverTemplateHtml(coverSelect.value);
    saveSettings();
  });
  autoRestore.addEventListener('change', saveSettings);
  transitionMode.addEventListener('change', saveSettings);
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      coverVisible ? hideCover() : activateCover('demo');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
}

if (typeof document !== 'undefined') initApp();
