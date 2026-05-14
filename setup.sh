#!/bin/bash

# Affordmed Notification System - Setup Script
# This script installs all dependencies and sets up the project

echo ""
echo "========================================"
echo "Affordmed Notification System Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js is installed"
node --version
echo ""

# Setup logging_middleware
echo "Setting up logging middleware..."
cd logging_middleware || exit 1
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install logging_middleware dependencies"
    exit 1
fi
echo "✓ Logging middleware dependencies installed"
cd ..

echo ""

# Setup notification_app_be
echo "Setting up backend application..."
cd notification_app_be || exit 1
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
echo "✓ Backend dependencies installed"
cd ..

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Register with Affordmed API (see AFFORDMED_API_SETUP.md)"
echo "2. Update .env files with your access token"
echo "3. Start MongoDB"
echo "4. Run: cd notification_app_be && npm start"
echo ""
