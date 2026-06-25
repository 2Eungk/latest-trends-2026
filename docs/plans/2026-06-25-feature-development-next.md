# 2026 최신동향 기능개발 다음 단계 Implementation Plan

> **For Hermes:** Use test-driven-development first. Use requesting-code-review before commit/push. Do not push/deploy without explicit user approval.

**Goal:** 공개 URL로 친구에게 보여줄 수 있는 local-only 웹캠 위장 MVP를 “실사용 가능한 데모 앱”으로 한 단계 더 안정화한다.

**Architecture:** 현재 앱은 정적 HTML/CSS/ESM 단일 페이지다. 다음 개발은 서버/백엔드/외부 API 없이 `app.js`의 순수 헬퍼 + `motion.test.mjs` + `scripts/check-static-contract.mjs` + 브라우저 스모크로 보호한다. 카메라/권한/설정/데모 흐름은 사용자가 직접 누르는 명시 액션만 허용한다.

**Tech Stack:** Vanilla JS ESM, static HTML/CSS, Node `assert`, GitHub Pages static build.

---

## Dated handoff snapshot — 2026-06-25

Re-check before executing; these facts are current only at plan time.

- Repo: `/Users/eung/Desktop/koodasai/latest-trends-2026`
- Branch: `main`
- Latest commit: `5f86f4d fix: enable pages on first deploy`
- Working tree: uncommitted “보호 중지” feature exists
- Changed files now:
  - `app.js`
  - `index.html`
  - `motion.test.mjs`
  - `scripts/check-static-contract.mjs`
  - `styles.css`
- Last verified command: `npm run deploy:check` passed after the stop-camera feature.

## Approval boundaries

Stop before:

- `git push`
- GitHub Pages deploy/release operations
- adding real backend/API/webhook/secrets
- adding face/person-recognition models
- destructive cleanup or reset of user work

Commits are allowed only if the user explicitly says to commit. Otherwise keep verified changes uncommitted and report the clean state.

---

## Phase 0 — Lock the current stop-camera work before new feature work

### Task 0.1: Re-run current verification gate

**Objective:** Confirm the uncommitted stop-camera feature is still green before adding more work.

**Files:** none

**Step 1: Run aggregate checks**

```bash
npm run deploy:check
```

Expected:

```text
motion checks passed
static contract checks passed
package contract checks passed
deploy contract checks passed
Built static site dist/site -> .../dist/site
```

**Step 2: Run whitespace diff check**

```bash
git diff --check
```

Expected: no output.

**Step 3: Browser smoke**

Serve:

```bash
python3 -m http.server 4179 -d dist/site
```

Then verify:

- `보호 중지` button is visible and disabled initially.
- Mocked start enables stop.
- Stop calls every active track’s `stop()`.
- Status becomes `보호 중지 · 카메라 스트림 종료됨`.
- No visible `undefined`/`null`.
- Console errors: 0.

---

## Phase 1 — “카메라 상태 진단” feature

Why next: the app is about camera permission and motion detection. Users need immediate clarity when it will or will not work, before deeper polish.

### Task 1.1: Add pure camera support summary helper under RED

**Objective:** Centralize browser capability copy for camera support/unsupported/permission states.

**Files:**

- Modify: `motion.test.mjs`
- Modify: `app.js`

**Step 1: Write failing tests**

Add import:

```js
cameraSupportSummary
```

Add tests:

```js
assert.deepEqual(
  cameraSupportSummary({ hasMediaDevices: true, hasGetUserMedia: true, protocol: 'https:' }),
  { ok: true, label: '카메라 사용 가능', detail: '보호 시작을 누르면 브라우저 권한 요청이 열립니다' }
);
assert.deepEqual(
  cameraSupportSummary({ hasMediaDevices: false, hasGetUserMedia: false, protocol: 'https:' }),
  { ok: false, label: '카메라 API 미지원', detail: '이 브라우저에서는 웹캠 감지를 사용할 수 없어요' }
);
assert.deepEqual(
  cameraSupportSummary({ hasMediaDevices: true, hasGetUserMedia: true, protocol: 'http:' }),
  { ok: false, label: '보안 연결 필요', detail: 'https 또는 localhost에서 카메라 권한을 사용할 수 있어요' }
);
```

**Step 2: Verify RED**

```bash
npm test
```

Expected: FAIL because `cameraSupportSummary` is not exported.

**Step 3: Minimal implementation**

In `app.js`, add exported helper near permission helpers:

```js
export function cameraSupportSummary({ hasMediaDevices, hasGetUserMedia, protocol } = {}) {
  const secure = protocol === 'https:' || protocol === 'http:';
  if (!hasMediaDevices || !hasGetUserMedia) {
    return { ok: false, label: '카메라 API 미지원', detail: '이 브라우저에서는 웹캠 감지를 사용할 수 없어요' };
  }
  if (!secure) {
    return { ok: false, label: '보안 연결 필요', detail: 'https 또는 localhost에서 카메라 권한을 사용할 수 있어요' };
  }
  return { ok: true, label: '카메라 사용 가능', detail: '보호 시작을 누르면 브라우저 권한 요청이 열립니다' };
}
```

Note: refine `secure` if needed during GREEN to distinguish local `http://127.0.0.1` from ordinary HTTP.

**Step 4: Verify GREEN**

```bash
npm test
```

Expected: `motion checks passed`.

### Task 1.2: Render camera support status in UI

**Objective:** Show a stable status line before the user clicks “보호 시작”.

**Files:**

- Modify: `index.html`
- Modify: `app.js`
- Modify: `scripts/check-static-contract.mjs`

**Step 1: Static RED**

Add assertions to `scripts/check-static-contract.mjs`:

```js
assert.match(indexHtml, /cameraSupportStatus/, 'landing should include camera support status region');
assert.match(appJs, /cameraSupportSummary/, 'camera support copy should be centralized');
assert.match(appJs, /navigator\.mediaDevices/, 'camera support status should inspect browser mediaDevices support');
```

Run:

```bash
node scripts/check-static-contract.mjs
```

Expected: FAIL on missing `cameraSupportStatus`.

**Step 2: Minimal implementation**

Add in `index.html` near `permissionHelp` or hero status:

```html
<p id="cameraSupportStatus" class="status" role="status" aria-live="polite">카메라 상태 확인 중</p>
```

In `app.js`, select it and initialize:

```js
const cameraSupportStatus = document.querySelector('#cameraSupportStatus');
const support = cameraSupportSummary({
  hasMediaDevices: Boolean(navigator.mediaDevices),
  hasGetUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
  protocol: window.location.protocol
});
cameraSupportStatus.textContent = `${support.label} · ${support.detail}`;
if (!support.ok) startButton.disabled = true;
```

**Step 3: Verify GREEN**

```bash
node scripts/check-static-contract.mjs
npm run deploy:check
```

Expected: all checks pass.

**Step 4: Browser smoke**

Verify:

- Status line is visible.
- On localhost it says camera can be used or explains the actual browser support.
- No console errors.
- No `undefined`/`null`.

---

## Phase 2 — “실사용 리허설 체크리스트” feature

Why next: friend demo works, but real users need a pre-flight checklist before trusting it.

### Task 2.1: Add preflight checklist source contract

**Objective:** Add a compact checklist users can follow before real use.

**Files:**

- Modify: `index.html`
- Modify: `scripts/check-static-contract.mjs`

**Step 1: RED static assertions**

Add:

```js
assert.match(indexHtml, /실사용 전 체크/, 'landing should include a real-use preflight checklist');
assert.match(indexHtml, /카메라 권한/, 'preflight should mention camera permission');
assert.match(indexHtml, /뒤쪽 사람 감지/, 'preflight should mention rear detection rehearsal');
assert.match(indexHtml, /비상 전환 테스트/, 'preflight should mention emergency transition test');
```

Run:

```bash
node scripts/check-static-contract.mjs
```

Expected: FAIL on missing checklist title.

**Step 2: Minimal UI**

Add a small `<section class="preflight-checklist">` in the notes panel or hero below demo guide:

```html
<section class="preflight-checklist" aria-label="실사용 전 체크">
  <strong>실사용 전 체크</strong>
  <ol>
    <li>카메라 권한 허용 확인</li>
    <li>뒤쪽 사람 감지 기준값 한 번 맞추기</li>
    <li>비상 전환 테스트로 위장 화면 확인</li>
  </ol>
</section>
```

**Step 3: Verify**

```bash
node scripts/check-static-contract.mjs
npm run deploy:check
```

### Task 2.2: Make checklist visually compact

**Objective:** Checklist must not make the first viewport too long.

**Files:**

- Modify: `styles.css`
- Modify: `scripts/check-static-contract.mjs`

**Step 1: RED CSS guard**

Add:

```js
const styles = read('styles.css');
assert.match(styles, /\.preflight-checklist/, 'preflight checklist should have compact styling');
assert.match(styles, /grid-template-columns:\s*repeat\(3/, 'preflight checklist should use compact 3-column desktop layout');
```

Expected: FAIL until CSS is added.

**Step 2: Minimal CSS**

```css
.preflight-checklist { margin-top: 14px; padding: 14px 16px; border-radius: 16px; background: rgba(119,255,186,.08); border: 1px solid rgba(119,255,186,.18); }
.preflight-checklist strong { color: #77ffba; }
.preflight-checklist ol { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 10px 0 0; padding: 0; list-style: none; }
.preflight-checklist li { padding: 10px; border-radius: 12px; background: rgba(255,255,255,.07); color: #dbe7f7; }
```

Add it to the existing mobile media rule if necessary:

```css
.preflight-checklist ol { grid-template-columns: 1fr; }
```

**Step 3: Browser smoke**

Verify no horizontal overflow and primary CTA is still visible without awkward overlap.

---

## Phase 3 — “위장 화면 랜덤/즉시 미리보기” feature

Why next: the app already has many cover screens; users need to quickly preview credibility without triggering camera.

### Task 3.1: Add deterministic random cover picker

**Objective:** Provide a helper that selects a valid next cover without invalid values.

**Files:**

- Modify: `motion.test.mjs`
- Modify: `app.js`

**Step 1: RED tests**

Add helper import:

```js
nextCoverChoice
```

Tests:

```js
assert.equal(nextCoverChoice(['trend', 'github'], 0), 'trend');
assert.equal(nextCoverChoice(['trend', 'github'], 1), 'github');
assert.equal(nextCoverChoice([], 0), 'trend');
assert.equal(nextCoverChoice(['bad'], 0), 'trend');
```

Expected RED: missing export.

**Step 2: Minimal helper**

In `app.js`:

```js
export function nextCoverChoice(values = [], index = 0) {
  const safe = values.filter((value) => VALID_COVERS.has(value));
  if (!safe.length) return DEFAULT_SETTINGS.cover;
  return safe[Math.abs(Number(index) || 0) % safe.length];
}
```

**Step 3: Verify**

```bash
npm test
```

### Task 3.2: Add “위장 화면 미리보기” button

**Objective:** Let users preview the currently selected cover without camera/demo countdown.

**Files:**

- Modify: `index.html`
- Modify: `app.js`
- Modify: `scripts/check-static-contract.mjs`

**Step 1: RED static guard**

```js
assert.match(indexHtml, /위장 화면 미리보기/, 'landing should include cover preview action');
assert.match(indexHtml, /previewCoverButton/, 'cover preview action should have stable DOM anchor');
assert.match(appJs, /previewCover/, 'cover preview should be handled by a named function');
```

**Step 2: Minimal implementation**

Add button near hero actions:

```html
<button id="previewCoverButton" class="ghost" type="button">위장 화면 미리보기</button>
```

In `app.js`:

```js
function previewCover() {
  showCover('restored');
  statusEl.textContent = '위장 화면 미리보기 · 복귀 버튼으로 돌아오기';
}
previewCoverButton.addEventListener('click', previewCover);
```

**Step 3: Browser smoke**

Click preview, verify:

- Cover appears.
- Cover mode/proof safe idle labels render.
- Restore works.
- Console errors: 0.

---

## Phase 4 — Final verification before commit/push decision

### Task 4.1: Full local gate

Run:

```bash
npm run deploy:check
git diff --check
```

Expected: all pass.

### Task 4.2: Static security scan

Scan changed/runtime files for:

- hardcoded secrets
- `fetch` / `XMLHttpRequest` / `WebSocket` / `sendBeacon`
- `eval` / `Function`
- external CDN scripts
- unexpected camera/media recording APIs

Expected:

- No secrets.
- No outbound browser network APIs in app runtime.
- No dynamic execution.
- `getUserMedia` remains explicit/user-initiated.
- No `MediaRecorder`.

### Task 4.3: Browser smoke final

Serve `dist/site` and verify:

- First viewport loads.
- Stop-camera flow still works with mocked stream.
- New camera support status renders.
- New checklist renders without overflow.
- Preview cover button opens and restores.
- Friend demo still works.
- No visible `undefined`/`null`.
- Console errors: 0.

### Task 4.4: Independent review

Use `requesting-code-review` style review on the final diff. Any blocking issue must be fixed and the full gate rerun.

### Task 4.5: Stop for user approval

Report:

- changed files
- exact checks and outputs
- whether ready to commit
- whether ready to push/deploy

Do not push/deploy without explicit approval.

---

## Immediate recommended execution order

1. Finish verifying current uncommitted “보호 중지” feature.
2. Implement Phase 1 camera support status.
3. Implement Phase 2 real-use checklist.
4. Implement Phase 3 cover preview only if Phase 1–2 remain clean.
5. Run full verification and ask for commit/push decision.

## Stop conditions

- Any aggregate check fails after two focused fix attempts.
- Browser camera permission behavior cannot be reasonably mocked and needs a real manual camera permission test.
- User asks to change product direction from webcam privacy shield to a different app.
- A step requires real external deployment/push.
