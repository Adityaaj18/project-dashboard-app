@echo off
echo ========================================
echo Stopping all Microfrontend services...
echo ========================================
echo.

echo Killing processes on port 5000 (Backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do taskkill //F //PID %%a 2>nul

echo Killing processes on port 3000 (MFApp)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill //F //PID %%a 2>nul

echo Killing processes on port 3005 (AuthApp)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005 ^| findstr LISTENING') do taskkill //F //PID %%a 2>nul

echo Killing processes on port 3004 (ProjectApp)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3004 ^| findstr LISTENING') do taskkill //F //PID %%a 2>nul

echo.
echo ========================================
echo All services stopped!
echo ========================================
pause
