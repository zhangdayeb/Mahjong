@echo off
cd /d "%~dp0.."
if not exist "creator\build\web-mobile\index.html" (
  echo Build the Cocos Creator project first: npm run build:web
  pause
  exit /b 1
)
echo Lianzhuo Mahjong Cocos client: http://127.0.0.1:8780
start "" http://127.0.0.1:8780
node creator\tools\serve.mjs
pause
