@echo off
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
