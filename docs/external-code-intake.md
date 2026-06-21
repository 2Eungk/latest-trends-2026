# External Code Intake Checklist

Use this before copying or adapting any code from GitHub, blogs, gists, npm snippets, or model answers.

## Current status for this MVP

- No external repository code has been copied into the app.
- GitHub results were used only as implementation references for the general pattern: browser `getUserMedia` + Canvas frame differencing.
- No CDN script tags, external packages, network calls, analytics, uploads, or model weights are present.

## Required checks before using external code

1. **Provenance**
   - Record repo URL, license, last update, stars/issues if relevant.
   - Prefer small readable snippets over whole-file copy.

2. **Security scan**
   - Search for `eval`, `new Function`, dynamic script injection, unexpected network calls, cookies, localStorage/token access, obfuscated strings, and dependency install scripts.
   - Check whether camera/video frames are uploaded, recorded, or sent to third parties.

3. **Privacy boundary**
   - For this app, reject code that adds identity/face recognition, recording, uploads, analytics, or background persistence without explicit approval.
   - Keep `getUserMedia` user-initiated and local-only.

4. **Dependency risk**
   - Avoid adding packages for frame differencing unless native APIs are insufficient.
   - Treat TensorFlow/coco-ssd as a separate optional spike, not default MVP code.

5. **Adaptation rule**
   - Re-implement the minimal needed behavior in our own small helpers.
   - Add RED tests before integrating.
   - Run `npm test`, static grep scan, and browser console smoke after integration.

## Quick scan command

```bash
grep -RInE "(eval\\(|new Function\\(|innerHTML\\s*=|localStorage|sessionStorage|fetch\\(|XMLHttpRequest|WebSocket|sendBeacon|getUserMedia|script src=|api[_-]?key|secret|token|password|document\\.cookie|https?://|import\\(|child_process|exec\\(|spawn\\()" . --exclude-dir=.git
```

Expected for the current MVP:

- `getUserMedia`: allowed, user-initiated camera access.
- `innerHTML`: allowed only for static internally-generated cover templates; do not feed user input into it.
- `http://127.0.0.1`: allowed local preview docs.
