# 2026-06-28 LazyCodex next polish plan

## Current baseline

- Repo: `/Users/eung/Desktop/koodasai/latest-trends-2026`
- Live site: `https://2eungk.github.io/latest-trends-2026/`
- Latest shipped commit: `6b86fc8 fix: reset demo state after restore`
- Current boundary: local-only webcam privacy demo. No uploads, no backend, no face recognition, no new dependencies unless absolutely necessary.

## Goal for this pass

Use LazyCodex/Codex as implementation worker and Hermes as controller/reviewer.

Next small safe improvement: improve the deployed friend-demo readiness without changing the privacy model.

Preferred implementation target:

1. Add one small user-facing readiness cue after the show-and-tell/friend-demo path succeeds, so the user knows what to do next for a phone/friend recording.
2. Keep the cue local-only, no external calls, no new dependencies.
3. Protect it with the existing test/static contract style.
4. Keep the diff small; do not redesign the app.

If Codex finds an even smaller higher-value polish issue while inspecting the current app, it may choose that instead, but it must stay inside the same risk boundary and document the choice in its final summary.

## Execution rules

- Strict RED → GREEN → verify.
- Use Ponytail/minimal-code mode: smallest verified diff wins; no speculative abstractions, no new dependency, no broad docs churn.
- Preserve local-only/no-upload/no-face-recognition safety contract.
- Do not push or deploy. Leave that to Hermes/controller after review.
- Do not print large files or full manifests to stdout; concise paths/counts only.

## Required checks before completion

- `npm test`
- `npm run deploy:check`
- `git diff --check`
- Summarize changed files and the exact behavior added/fixed.

## Controller acceptance gates

Hermes will independently:

1. inspect `git status` and diff,
2. run checks,
3. browser-smoke the changed path against local `dist/site`,
4. commit locally only if accepted,
5. stop before push/deploy unless user explicitly approves.
