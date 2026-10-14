@echo off
cd /d "%~dp0"
echo Membuka preview Warga +62 3D - tanpa VPS...
start "" "http://localhost:5180"
node preview-static\serve.mjs
pause
