@echo off
color 0A
echo ==============================================
echo    Starting Elevate Business Website...
echo ==============================================
echo.

echo [1/3] Starting Backend API Server...
start "Backend Server" cmd /k "cd server && node index.js"

echo [2/3] Starting Frontend React Server...
start "Frontend Server" cmd /k "npm run dev"

echo [3/3] Opening Website and Admin Dashboard...
timeout /t 4 /nobreak > nul
start http://localhost:5173/
start http://localhost:5173/admin

echo.
echo ==============================================
echo    SUCCESS! Both servers are running.
echo    You can now safely close this window.
echo ==============================================
timeout /t 5 > nul
exit
