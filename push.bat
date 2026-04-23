@echo off
echo.
echo ========================================
echo   MarocMiam - Push to GitHub
echo ========================================
echo.

cd /d C:\Users\black\marocmiam

echo [1/3] Adding all changes...
git add .

echo [2/3] Committing...
set /p msg="Commit message (or press Enter for 'update'): "
if "%msg%"=="" set msg=update
git commit -m "%msg%"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   Done! Now run deploy.sh on server
echo ========================================
pause
