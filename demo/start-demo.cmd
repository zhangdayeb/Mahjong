@echo off
cd /d "%~dp0"
echo Mahjong demo: http://127.0.0.1:8770
start "" http://127.0.0.1:8770
node server.mjs
pause
