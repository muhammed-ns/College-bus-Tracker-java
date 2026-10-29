#!/bin/bash
set -e

# Select Java 21 if installed on Ubuntu
if [ -d "/usr/lib/jvm/java-21-openjdk-amd64" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
    export PATH=$JAVA_HOME/bin:$PATH
fi

# Free port 8080 if an old backend instance is already running
if fuser 8080/tcp >/dev/null 2>&1; then
    echo "-> Stopping previous backend instance on port 8080..."
    fuser -k 8080/tcp >/dev/null 2>&1 || true
    sleep 1
fi

echo "=========================================================="
echo " Starting CampusBus Spring Boot Backend"
echo " Java version: $(java -version 2>&1 | head -n 1)"
echo " Database: In-memory H2 (zero setup required)"
echo " Port: http://localhost:8080"
echo " Route: CEA Adoor – Adoor – Enathu – Kottarakkara (MC Road)"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Run Spring Boot with H2 profile
mvn spring-boot:run -Dspring-boot.run.profiles=h2 -o
