const fs = require('fs');
const path = require('path');

const startBat = `@echo off
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
`;

const stopBat = `@echo off
TITLE Stop Sports Talent AI Services
COLOR 0C

echo ================================================================================
echo              STOPPING ALL SPORTS TALENT AI SERVICES
echo ================================================================================
echo.

echo Terminating active Node.js and Python service processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 :4000 :5000 :8000"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [SUCCESS] All Sports Talent AI services stopped cleanly.
echo.
pause
`;

const testBat = `@echo off
TITLE Sports Talent AI - Full Test Suite Runner
COLOR 0B

echo ================================================================================
echo            RUNNING FULL INTEGRATION ^& KINEMATICS TEST SUITES
echo ================================================================================
echo.

echo [1/4] Checking System Environment...
call node scripts/verify_environment.js
if %errorlevel% neq 0 goto error

echo.
echo [2/4] Running Backend API ^& DPDP Compliance Tests...
call node backend/tests/api.test.js
if %errorlevel% neq 0 goto error

echo.
echo [3/4] Running AI Computer Vision Kinematics Tests...
call python ai-service/tests/test_kinematics.py
if %errorlevel% neq 0 goto error

echo.
echo [4/4] Running Frontend ^& Service Audit Analysis...
call python scripts/audit_analysis.py
if %errorlevel% neq 0 goto error

echo.
echo ================================================================================
echo                    ALL SYSTEM TESTS PASSED SUCCESSFULLY!
echo ================================================================================
echo.
pause
exit /b 0

:error
echo.
echo [FAIL] One or more tests failed. Please review output above.
echo.
pause
exit /b 1
`;

fs.writeFileSync(path.join(__dirname, '../start.bat'), startBat, 'utf8');
fs.writeFileSync(path.join(__dirname, '../stop.bat'), stopBat, 'utf8');
fs.writeFileSync(path.join(__dirname, '../test.bat'), testBat, 'utf8');
console.log('[SUCCESS] Created start.bat, stop.bat, and test.bat in the project root.');
