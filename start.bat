@echo off
setlocal
cd /d "%~dp0"
set PORT=4180
set URL=http://127.0.0.1:%PORT%

where py >nul 2>nul
if %ERRORLEVEL%==0 (
  set PYTHON_CMD=py -3
) else (
  where python >nul 2>nul
  if %ERRORLEVEL%==0 (
    set PYTHON_CMD=python
  ) else (
    echo Python이 필요합니다. https://www.python.org/downloads/ 설치 후 다시 start.bat을 실행하세요.
    pause
    exit /b 1
  )
)

echo 2026 최신동향 로컬 프로그램을 시작합니다.
echo 브라우저가 열리면 카메라 권한을 허용하고 보호 시작을 누르세요.
echo 주소: %URL%
start %URL%
%PYTHON_CMD% -m http.server %PORT% --bind 127.0.0.1
pause
