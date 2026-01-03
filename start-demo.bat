@echo off
echo ============================================
echo MEDIPULSE AI
echo ============================================
echo.

echo Step 1: Starting MongoDB...
echo Note: Make sure MongoDB is installed and accessible
echo If using MongoDB Atlas, update backend/.env with your connection string
echo.

echo Step 2: Starting ML Service...
start cmd /k "cd ml-service && python app.py"

timeout /t 3 /nobreak > nul

echo Step 3: Starting Backend API...
start cmd /k "cd backend && npm start"

timeout /t 3 /nobreak > nul

echo Step 4: Starting Frontend Dashboard...
start cmd /k "cd frontend && npm start"

echo.
echo ============================================
echo All services starting...
echo.
echo Frontend Dashboard: http://localhost:3000
echo Backend API: http://localhost:3001
echo ML Service: http://localhost:5000
echo.
echo Press any key to close this window...
pause > nul