# 2026 최신동향

웹캠 프레임 변화량만 로컬에서 계산해, 움직임이 감지되면 업무용 리포트 화면으로 자동 전환하는 장난형 프라이버시 웹앱 MVP.

## 조사한 오픈소스 단서

- `jasonmayes/JS-Motion-Detection`: 브라우저 웹캠 + 프레임 차이 기반 모션 감지. 별도 AI 없이 가볍게 가능.
- `jimCresswell/web-cam-motion-detection`: `getUserMedia` + Canvas 기반 단순 모션 감지 예시.
- `@tensorflow-models/coco-ssd`: 사람 객체 감지가 가능하지만 초판에는 과함. 얼굴/사람 식별 느낌이 강해져 개인정보 리스크도 커짐.

## 현재 MVP 범위

- 브라우저 `getUserMedia()`로 웹캠 접근
- Canvas에 저해상도 프레임을 그려 픽셀 차이량 계산
- 감도 슬라이더
- 위장 페이지 3종
- 비상 전환 테스트 버튼
- `Ctrl + Shift + L` 단축키 전환/복귀
- 서버 업로드/저장 없음
- 외부 스크립트/CDN 없음
- 외부/GitHub 코드 반입 전 `docs/external-code-intake.md` 체크리스트로 보안 검수

## 실행

```bash
cd /Users/eung/Desktop/koodasai/latest-trends-2026
python3 -m http.server 4180 --bind 127.0.0.1
```

브라우저에서 `http://127.0.0.1:4180` 접속.

## 검증

```bash
npm test
```

카메라 권한은 브라우저에서 직접 허용해야 함.
