@echo off
echo ========================================
echo Starting Monolithic App - Development Mode
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Creating .env from .env.example...
    copy .env.example .env
    echo.
    echo Please edit .env file with your configuration
    echo Press any key to continue...
    pause >nul
)

echo Starting Backend Server...
start "Monolith Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend React App...
start "Monolith Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

taskkill /FI "WindowTitle eq Monolith Backend*" /T /F
taskkill /FI "WindowTitle eq Monolith Frontend*" /T /F

echo All servers stopped.
