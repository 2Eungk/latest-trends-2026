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

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
      if (score >= threshold) {
        const now = Date.now();
        lastMotionAt = now;
        if (!coverVisible && shouldTriggerCover({ score, threshold, now, lastTriggerAt, cooldownMs: 1500 })) {
          lastTriggerAt = now;
          showCover('triggered');
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
    showCover('demo');
    const success = demoCountdownText(0);
    demoCountdown.textContent = success;
    demoResult.textContent = success;
    scenarioDemoButton.disabled = false;
    demoRunning = false;
  }

  sensitivity.addEventListener('input', () => {
    const threshold = Number(sensitivity.value);
    sensitivityLabel.textContent = sensitivityText(threshold);
    const currentScore = Number(scoreDetail.dataset.score || 0);
    const level = detectionLevel(currentScore, threshold);
    scoreLabel.textContent = level.label;
    scoreLabel.className = level.className;
    scoreDetail.textContent = `점수 ${currentScore}% · 기준 ${threshold}% · ${level.detail}`;
  });
  roiSelect.addEventListener('change', () => {
    previousFrame = null;
    motionBadge.textContent = `감지 영역: ${roiSelect.selectedOptions[0].textContent}`;
    tuningTip.textContent = tuningTipForPreset(roiSelect.value);
  });
  startButton.addEventListener('click', startCamera);
  demoButton.addEventListener('click', () => showCover('demo'));
  scenarioDemoButton.addEventListener('click', startDemoScenario);
  restoreButton.addEventListener('click', hideCover);
  coverExit.addEventListener('click', hideCover);
  coverSelect.addEventListener('change', () => {
    if (coverVisible) coverContent.innerHTML = coverTemplateHtml(coverSelect.value);
  });
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      coverVisible ? hideCover() : showCover('demo');
    }
  });

  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
}

if (typeof document !== 'undefined') initApp();
