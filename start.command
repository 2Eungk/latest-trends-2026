#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
PORT=4180
URL="http://127.0.0.1:${PORT}"

if command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python3"
elif command -v python >/dev/null 2>&1; then
  PYTHON_BIN="python"
else
  osascript -e 'display alert "Python이 필요합니다" message "python.org에서 Python을 설치한 뒤 다시 start.command를 실행하세요."' >/dev/null 2>&1 || true
  echo "Python이 필요합니다. https://www.python.org/downloads/ 설치 후 다시 실행하세요."
  read -r -p "Enter를 누르면 닫습니다..." _
  exit 1
fi

echo "2026 최신동향 로컬 프로그램을 시작합니다."
echo "브라우저가 열리면 카메라 권한을 허용하고 보호 시작을 누르세요."
echo "주소: ${URL}"

open "${URL}" >/dev/null 2>&1 || true
"${PYTHON_BIN}" -m http.server "${PORT}" --bind 127.0.0.1
