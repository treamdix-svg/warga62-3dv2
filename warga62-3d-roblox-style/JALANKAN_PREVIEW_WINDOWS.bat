@echo off
cd /d "%~dp0"
echo Membuka Warga +62 3D (lokal, tanpa VPS)...
start "" "http://localhost:5180"
node tools\serve.mjs
pause
