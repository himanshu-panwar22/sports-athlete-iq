@echo off
TITLE Sports Talent AI Platform - Master Launcher
COLOR 0A

echo ================================================================================
echo          SPORTS TALENT AI PLATFORM - ONE-CLICK LAUNCHER
echo ================================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Verifying environment and schemas...
call node scripts/verify_environment.js

echo.
echo [2/3] Starting All 4 Microservices:
echo   - [Port 4000] Core Backend REST API (Express + SQLite + DPDP Auth)
echo   - [Port 3000] Scout Pro Discovery Dashboard (SAI & Khelo India)
echo   - [Port 5000] Athlete Pro Mobile Portal (Standardized Tests & Passes)
echo   - [Port 8000] AI Computer Vision Microservice (Kinematics & Pose Engine)
echo.

:: Launch default browser tabs automatically after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000 && start http://localhost:5000"

echo [3/3] Opening Scout Dashboard (http://localhost:3000) and Mobile App (http://localhost:5000)...
echo.
echo ================================================================================
echo    SERVICES RUNNING. Leave this window open. Press Ctrl+C to terminate.
echo ================================================================================
echo.

node scripts/start_all.js

pause
