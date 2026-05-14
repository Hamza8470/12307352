@echo off
REM Affordmed Notification System - Setup Script
REM This script installs all dependencies and sets up the project

echo.
echo ========================================
echo Affordmed Notification System Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed
echo.

REM Setup logging_middleware
echo Setting up logging middleware...
cd logging_middleware
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install logging_middleware dependencies
    pause
    exit /b 1
)
echo ✓ Logging middleware dependencies installed
cd ..

echo.

REM Setup notification_app_be
echo Setting up backend application...
cd notification_app_be
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Register with Affordmed API (see AFFORDMED_API_SETUP.md)
echo 2. Update .env files with your access token
echo 3. Start MongoDB
echo 4. Run: cd notification_app_be && npm start
echo.
pause
