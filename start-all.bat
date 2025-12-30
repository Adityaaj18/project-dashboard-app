@echo off
echo ========================================
echo Starting Microfrontend Application
echo ========================================
echo.

echo [1/4] Starting Backend API on port 5000...
start "Backend API" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak > nul

echo [2/4] Starting AuthApp on port 3005...
start "AuthApp" cmd /k "cd AuthApp && npm start"
timeout /t 2 /nobreak > nul

echo [3/4] Starting ProjectApp on port 3004...
start "ProjectApp" cmd /k "cd ProjectApp && npm start"
timeout /t 2 /nobreak > nul

echo [4/4] Starting MFApp (Host) on port 3000...
start "MFApp Host" cmd /k "cd MFApp && npm start"

echo.
echo ========================================
echo All services are starting!
echo ========================================
echo.
echo Backend API:     http://localhost:5000
echo AuthApp:         http://localhost:3005
echo ProjectApp:      http://localhost:3004
echo Main App:        http://localhost:3000
echo.
echo Press any key to open the application in your browser...
pause > nul
start http://localhost:3000
