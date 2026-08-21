@echo off
TITLE Sports Talent AI - GitHub Push Helper
COLOR 0B

echo ================================================================================
echo          PUSHING PROJECT TO GITHUB (sports-athlete-iq)
echo ================================================================================
echo.

git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ================================================================================
    echo    [SUCCESS] Project uploaded to https://github.com/himanshu-panwar22/sports-athlete-iq
    echo ================================================================================
) else (
    echo.
    echo [NOTE] If this is a new repository, please make sure you have created the empty
    echo repository on GitHub first at: https://github.com/new with name 'sports-athlete-iq'
)

echo.
pause
