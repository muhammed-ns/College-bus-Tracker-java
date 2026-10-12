#!/bin/bash
set -e

# Select Java 21 if installed on Ubuntu
if [ -d "/usr/lib/jvm/java-21-openjdk-amd64" ]; then
    export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
    export PATH=$JAVA_HOME/bin:$PATH
fi

echo "=========================================================="
echo " Starting CampusBus Spring Boot Backend"
echo " Java version: $(java -version 2>&1 | head -n 1)"
echo " Database: In-memory H2 (zero setup required)"
echo " Port: http://localhost:8080"
echo " Route: College of Engineering Adoor (CEA) Loop"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/backend"

# Run Spring Boot (offline first, fallback to online)
mvn spring-boot:run -Dspring-boot.run.profiles=h2 -o || mvn spring-boot:run -Dspring-boot.run.profiles=h2
