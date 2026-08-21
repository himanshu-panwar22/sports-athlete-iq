@echo off
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
