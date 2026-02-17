@echo off
echo ========================================
echo Starting Code Execution Backend Server
echo ========================================
echo.
cd server
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting server on http://localhost:3001
echo.
call npm start
