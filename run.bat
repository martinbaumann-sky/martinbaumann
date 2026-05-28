@echo off
setlocal

cd /d "%~dp0"
set "PORT=8000"

echo Revisando puerto %PORT%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  echo Liberando el puerto %PORT% ^(PID %%a^)...
  taskkill /PID %%a /F >nul 2>&1
)

echo Iniciando servidor local en http://localhost:%PORT%
start "" "http://localhost:%PORT%"

where py >nul 2>&1
if %errorlevel%==0 (
  py -3 -m http.server %PORT%
) else (
  python -m http.server %PORT%
)

pause
