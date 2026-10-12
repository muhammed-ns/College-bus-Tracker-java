#!/bin/bash
set -e

# Setup Java 21 if installed
if [ -d "/usr/lib/jvm/java-21-openjdk-amd64" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
    export PATH=$JAVA_HOME/bin:$PATH
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================="
echo " Starting Full-Stack College Bus Tracker"
echo " Route: College of Engineering Adoor (CEA)"
echo " Backend:  http://localhost:8080"
echo " Frontend: http://localhost:5173"
echo "=========================================================="

# Trap SIGINT and SIGTERM to kill all spawned child processes
cleanup() {
    echo ""
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null || true
    wait $(jobs -p) 2>/dev/null || true
    echo "All services stopped."
}
trap cleanup SIGINT SIGTERM EXIT

# Start Backend in background
echo "-> Starting Backend (Spring Boot 3 + H2)..."
cd "$ROOT_DIR/backend"
(mvn spring-boot:run -Dspring-boot.run.profiles=h2 -o || mvn spring-boot:run -Dspring-boot.run.profiles=h2) &
BACKEND_PID=$!

# Wait for backend port 8080 to become available
echo "-> Waiting for backend to become ready..."
for i in {1..30}; do
    if curl -s http://localhost:8080/api/bus > /dev/null 2>&1; then
        echo "-> Backend is ready at http://localhost:8080!"
        break
    fi
    sleep 1
done

# Start Frontend in background
echo "-> Starting Frontend (React + Vite + Leaflet)..."
cd "$ROOT_DIR/frontend"
npm run dev -- --host &
FRONTEND_PID=$!

echo "=========================================================="
echo " Applications Running!"
echo " -> Open: http://localhost:5173 in your browser"
echo " -> Press Ctrl+C at any time to shut down both servers"
echo "=========================================================="

# Keep script running
wait
