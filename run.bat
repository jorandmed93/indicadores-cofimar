@echo off
cd /d "%~dp0"
echo =================================================================
echo        Iniciando Sistema de Indicadores Cofimar 2026
echo =================================================================

:: Start backend in a new command window
echo Iniciando Backend FastAPI...
start "Backend FastAPI" cmd /k ".\backend\venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000"

:: Wait a little for backend to startup
ping 127.0.0.1 -n 4 > nul

:: Start frontend in a new command window
echo Iniciando Frontend React...
start "Frontend React" cmd /k "cd frontend && npm.cmd run dev"

:: Open the browser to the frontend URL
echo Abriendo aplicacion en el navegador...
ping 127.0.0.1 -n 3 > nul
start http://localhost:5173

echo =================================================================
echo   Aplicacion lista! Backend en puerto 8000, Frontend en puerto 5173
echo =================================================================
