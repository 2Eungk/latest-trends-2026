# 2026 최신동향 MVP Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Turn the current browser-only motion-detection prototype into a shareable, funny, privacy-safe “auto-cover screen” webapp MVP.

**Architecture:** Keep the app static and dependency-light: native browser `getUserMedia`, Canvas frame differencing, pure helper functions covered by Node tests, and a polished HTML/CSS cover-screen experience. Avoid person/face recognition for v0; if needed later, add it only as an optional mode with explicit privacy copy.

**Tech Stack:** Static HTML/CSS/ES modules, Node built-in `assert` tests, Python `http.server` for local preview.

---

## Dated Handoff Snapshot — 2026-06-21

- Project path: `/Users/eung/Desktop/koodasai/latest-trends-2026`
- Current files: `index.html`, `styles.css`, `app.js`, `motion.test.mjs`, `README.md`, `package.json`
- Current local preview port verified: `http://127.0.0.1:4180`
- Current test command verified: `npm test` → `motion checks passed`
- Browser smoke verified: app title `2026 최신동향 리포트`, emergency cover test shows `2026 AI 산업 최신동향 리포트`, console has no JS errors.
- Re-check before continuing: run `git status` if repo is initialized, `npm test`, and a fresh browser smoke on the actual running port.

---

## Product Guardrails

- Do not add face recognition, identity recognition, recording, uploads, or server storage in MVP.
- Position public copy as `공용공간 화면 프라이버시 보호 / 로컬 웹캠 기반 자동 전환`.
- Keep viral/internal copy funny, but do not make the UI look like spyware.
- Default to local-only static hosting; no accounts, no backend, no analytics until explicitly approved.
- Use TDD for every behavior change: RED test/check → GREEN implementation → full `npm test` → browser smoke.
- Before copying/adapting any GitHub or external code, run the intake checklist in `docs/external-code-intake.md` and record whether code was copied or only referenced.

---

## Phase 1 — Make Detection Feel Usable

### Task 1: Add motion trigger cooldown helper

**Objective:** Prevent repeated cover toggles from flickering when a moving person stays in frame.

**Files:**
- Modify: `app.js`
- Modify: `motion.test.mjs`

**Step 1: Write failing test**

Add tests for a pure helper such as:

```js
import { shouldTriggerCover } from './app.js';

assert.equal(shouldTriggerCover({ score: 20, threshold: 16, now: 1000, lastTriggerAt: 0, cooldownMs: 1500 }), false);
assert.equal(shouldTriggerCover({ score: 20, threshold: 16, now: 2000, lastTriggerAt: 0, cooldownMs: 1500 }), true);
assert.equal(shouldTriggerCover({ score: 10, threshold: 16, now: 3000, lastTriggerAt: 0, cooldownMs: 1500 }), false);
```

**Step 2: Verify RED**

Run:

```bash
npm test
```

Expected: FAIL because `shouldTriggerCover` is not exported.

**Step 3: Implement minimal helper and use it**

Add:

```js
export function shouldTriggerCover({ score, threshold, now, lastTriggerAt, cooldownMs }) {
  return score >= threshold && now - lastTriggerAt >= cooldownMs;
}
```

In `tick()`, keep `lastMotionAt` for auto-restore, add `lastTriggerAt`, and call `showCover()` only if the helper returns true.

**Step 4: Verify GREEN**

Run:

```bash
npm test
```

Expected: PASS.

**Step 5: Browser smoke**

Run local server, open app, click `비상 전환 테스트`, verify cover appears and console has no JS errors.

---

### Task 2: Add recoverable detection status copy

**Objective:** Make the user understand whether detection is armed, warming up, triggered, or restoring.

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `motion.test.mjs`

**Step 1: Write failing test**

Add a pure helper `detectionStatusText(state)` with expected Korean strings:

```js
assert.equal(detectionStatusText('idle'), '대기 중 · 카메라 접근 전');
assert.equal(detectionStatusText('armed'), '보호 중 · 프레임 변화 감지 시작');
assert.equal(detectionStatusText('triggered'), '움직임 감지됨 · 업무 리포트로 전환');
assert.equal(detectionStatusText('restored'), '보호 중 · 원래 화면 복귀');
```

**Step 2:** Run `npm test`, confirm RED.

**Step 3:** Export helper and replace duplicated literal status strings.

**Step 4:** Run `npm test`, confirm GREEN.

**Step 5:** Browser smoke status text after initial load, start failure/success if camera available, demo trigger, restore.

---

### Task 3: Add region-of-interest presets without complex drawing UI

**Objective:** Let users choose whether to watch the full frame, left/right side, or upper background area.

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `motion.test.mjs`

**Step 1: Write failing test**

Add `roiRectForPreset(preset, width, height)` tests:

```js
assert.deepEqual(roiRectForPreset('full', 160, 90), { x: 0, y: 0, width: 160, height: 90 });
assert.deepEqual(roiRectForPreset('left', 160, 90), { x: 0, y: 0, width: 80, height: 90 });
assert.deepEqual(roiRectForPreset('right', 160, 90), { x: 80, y: 0, width: 80, height: 90 });
assert.deepEqual(roiRectForPreset('back', 160, 90), { x: 0, y: 0, width: 160, height: 54 });
```

**Step 2:** Run `npm test`, confirm RED.

**Step 3:** Add select control and crop the sampled image data by ROI before scoring.

**Step 4:** Run `npm test`, confirm GREEN.

**Step 5:** Browser smoke select exists, changing it does not throw console errors.

---

## Phase 2 — Make the Cover Screens Convincing

### Task 4: Add Google Docs / spreadsheet / code-editor visual skins

**Objective:** Make cover screens believable enough for the joke to land.

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `styles.css`
- Modify: `motion.test.mjs`

**Test first:** Add source/HTML helper assertions that each skin renders a distinct title, at least one table/code/doc block, and no `undefined`.

**Implementation:** Extend `templates` with `docs`, `spreadsheet`, `code` or make existing three templates visually distinct.

**Verification:** `npm test`, browser smoke each select option and emergency test.

---

### Task 5: Add “boss sensitivity calibration” demo mode

**Objective:** Let the user tune sensitivity without relying on an actual person passing behind them.

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `motion.test.mjs`

**Test first:** Pure helper maps numeric score and threshold to labels: `안전`, `주의`, `전환`.

**Implementation:** Show current score, threshold, and a small live label. Keep it local-only.

**Verification:** `npm test`, browser smoke with demo button and slider.

---

## Phase 3 — Package for Friends/Beta

### Task 6: Add static-hosting safety check

**Objective:** Make the app easy to share as a static page while keeping the privacy promise visible.

**Files:**
- Create: `scripts/check-static-contract.mjs`
- Modify: `package.json`
- Modify: `README.md`

**Test first:** Script asserts README and `index.html` contain local-only/no-upload copy, and `package.json` has `check` command.

**Implementation:** Add `npm run check` that runs `npm test` plus static contract script.

**Verification:** `npm run check`.

---

### Task 7: Add install/run docs and browser permission troubleshooting

**Objective:** Reduce friction for first testers.

**Files:**
- Modify: `README.md`

**Implementation:** Document Chrome/Safari camera permission, localhost requirement, port collision note, and privacy boundaries.

**Verification:** Follow README from a clean terminal, confirm correct app title via `curl`.

---

## Phase 4 — Optional Later Experiments

### Task 8: Optional person-detection mode research spike only

**Objective:** Evaluate whether `@tensorflow-models/coco-ssd` adds enough value to justify bundle/privacy cost.

**Rules:** Do not ship by default. Create a separate branch/spike. Measure load time, false positives, and copy/privacy impact.

**Stop condition:** If native frame differencing is good enough, skip AI detection.

---

## Immediate Next Batch

1. Fix README port mismatch from `4177` to the verified free port pattern / current `4180` note.
2. Execute Phase 1 Task 1: cooldown helper under TDD.
3. Run `npm test` and browser smoke on `http://127.0.0.1:4180` or the next free port.
