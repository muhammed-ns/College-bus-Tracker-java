#!/bin/bash
set -e

echo "=========================================================="
echo " Starting CampusBus React + Vite Frontend"
echo " Node version: $(node -v)"
echo " Local URL:    http://localhost:5173"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/frontend"

# Start Vite development server
npm run dev -- --host
