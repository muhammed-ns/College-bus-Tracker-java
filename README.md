# 🚌 CampusBus LIVE - Real-Time College Bus Tracking System

A complete, production-ready, real-time college bus tracking web application designed for a single bus and single driver, serving students and administrators with live telemetry, interactive map tracking, and transit management.

---

## 📋 Table of Contents

1. [Architecture & System Design](#architecture--system-design)
2. [Tech Stack](#tech-stack)
3. [Database Schema](#database-schema)
4. [Default Credentials](#default-credentials)
5. [Local Setup Guide](#local-setup-guide)
   - [Prerequisites](#prerequisites)
   - [MySQL Database Setup](#1-mysql-database-setup)
   - [Backend Setup (Spring Boot)](#2-backend-setup-spring-boot)
   - [Frontend Setup (React + Vite)](#3-frontend-setup-react--vite)
6. [API Specification](#api-specification)
7. [WebSocket & STOMP Protocol](#websocket--stomp-protocol)
8. [End-to-End Demo Walkthrough](#end-to-end-demo-walkthrough)
9. [Project Structure](#project-structure)

---

## 🏗 Architecture & System Design

```
                     +---------------------------------------+
                     |          React 18 + Vite (TS)         |
                     |   Leaflet Map / Real-Time Dashboard   |
                     +---------------------------------------+
                            |                         ^
        REST HTTP (JWT)     |                         | WebSocket (STOMP)
     Location / Trips / Auth|                         | Live Coordinates Topic
                            v                         |
                     +---------------------------------------+
                     |         Spring Boot 3 Backend         |
                     |  - Spring Security + JWT Filter       |
                     |  - REST Controllers (Role Protected)  |
                     |  - SimpMessagingTemplate (STOMP)      |
                     |  - Data JPA / Hibernate Layer         |
                     +---------------------------------------+
                            |                         |
                            v                         v
                     +--------------+         +--------------+
                     | MySQL 8 DBMS |         | Memory Cache |
                     | (Persistent) |         | (Live State) |
                     +--------------+         +--------------+
```

### Real-Time Flow
1. **Driver Device**: Sends current GPS coordinates via `POST /api/driver/location` every 5 seconds.
2. **Backend**:
   - Authenticates driver with JWT.
   - Verifies there is an active `RUNNING` trip assigned to this driver.
   - Validates coordinates (`-90 <= lat <= 90`, `-180 <= lon <= 180`).
   - Persists point to the `bus_location` table.
   - Caches the latest coordinate and evaluates status (`LIVE` if `< 30s`, `STALE` if `> 30s`).
   - Broadcasts the payload to STOMP topic `/topic/bus/1/location`.
3. **Student UI**: Subscribed to `/topic/bus/1/location` via STOMP over SockJS. Receives instant coordinate packets and smoothly animates the bus pin across the Leaflet map without page reloads.

---

## 🛠 Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.2.5** (Web, Security, Data JPA, WebSocket)
- **Spring Security 6** with stateless **JWT** (JJWT 0.11.5)
- **WebSocket / STOMP** (In-memory message broker with `/topic` destination)
- **MySQL 8** (Hibernate 6 dialect)
- **Maven** build tool

### Frontend
- **React 18** with **TypeScript**
- **Vite** build tool and local dev server (with built-in API proxy)
- **Leaflet & react-leaflet** (OpenStreetMap tiles, 100% free with no API keys needed)
- **@stomp/stompjs & sockjs-client** for real-time STOMP messaging
- **Tailwind CSS** for modern, responsive UI
- **Lucide React** icons

---

## 🗄 Database Schema

The application uses 6 tables with relational integrity:

| Table | Purpose |
|---|---|
| `users` | User credentials, roles (`ADMIN`, `DRIVER`, `STUDENT`), and active status |
| `bus` | Bus metadata (`bus_number`, `registration_number`, `status`) |
| `route` | Route metadata (`route_name`, `description`, `active`) |
| `stop` | Ordered transit stops with coordinates (`latitude`, `longitude`, `stop_order`) |
| `trip` | Transit runs (`status`: `NOT_STARTED`, `RUNNING`, `COMPLETED`), start and end times |
| `bus_location` | Historical GPS telemetry log (`latitude`, `longitude`, `speed`, `recorded_at`) |

---

## 🔑 Default Credentials

The system comes pre-seeded with sample accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@college.edu` | `admin123` | Full access to bus, stops, driver management, and trips |
| **Driver** | `driver@college.edu` | `driver123` | Start/end trips, share device GPS or simulate route |
| **Student** | `student@college.edu` | `student123` | Live map tracking, stop viewing, trip status |

*(Guest access is also permitted directly on the Live Map without signing in!)*

---

## 🚀 Quick Start (One Command)

The project includes an all-in-one runner script that automatically starts both the backend and frontend:

```bash
# In the root folder:
./start-all.sh
```

- **Live Map (Student / Guest)**: [http://localhost:5173/student](http://localhost:5173/student)
- **Login / Driver / Admin**: [http://localhost:5173/login](http://localhost:5173/login)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **H2 Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:bus_tracker`, user: `sa`, password: empty)

---

## 📍 Route: College of Engineering Adoor (CEA)

The default transit route is centered on **College of Engineering Adoor (CEA)** in Manakala, Adoor, Kerala:
- **Terminal & Depo**: College of Engineering Adoor (`9.1324° N, 76.7182° E`)
- **Stops (Ordered Loop)**:
  1. College of Engineering Adoor (Departure Gate) `[9.1324, 76.7182]`
  2. Manakala Junction `[9.1352, 76.7225]`
  3. Karuvatta Junction `[9.1440, 76.7310]`
  4. Adoor KSRTC Central Bus Stand `[9.1538, 76.7335]`
  5. Adoor Revenue Tower / Private Stand `[9.1560, 76.7360]`
  6. Parakode Junction Market `[9.1425, 76.7512]`
  7. Ezhamkulam Temple Junction `[9.1305, 76.7580]`
  8. College of Engineering Adoor (Arrival Terminal) `[9.1324, 76.7182]`

---

## 🚀 Manual Local Setup Guide

### Prerequisites
- **Java 21 or 17** (`java -version`)
- **Maven 3.8+** (`mvn -version`)
- **Node.js 18+** & **npm** (`node -v`, `npm -v`)

### Option A: Zero-Setup In-Memory Database (Default)

The backend defaults to an embedded in-memory H2 database with MySQL compatibility mode. It automatically seeds users, bus, route, and stops on startup with zero external database configuration required!

1. **Start Backend**:
   ```bash
   ./start-backend.sh
   # Or manually:
   cd backend && mvn spring-boot:run
   ```

2. **Start Frontend**:
   ```bash
   ./start-frontend.sh
   # Or manually:
   cd frontend && npm run dev
   ```

### Option B: Using MySQL Database

If you have MySQL 8 installed and running locally on port 3306:

1. Create database:
   ```sql
   CREATE DATABASE bus_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Set environment variables and run:
   ```bash
   export SPRING_PROFILES_ACTIVE=mysql
   export DB_URL="jdbc:mysql://localhost:3306/bus_tracker?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
   export DB_USER="root"
   export DB_PASSWORD="your_password"
   cd backend && mvn spring-boot:run
   ```
4. Open your browser at **`http://localhost:5173`**.

---

## 📡 API Specification

### Authentication
- `POST /api/auth/login`
  - Body: `{ "email": "admin@college.edu", "password": "admin123" }`
  - Response: `{ "token": "...", "role": "ADMIN", "name": "...", "email": "..." }`

### Bus Management
- `GET /api/bus` *(Public)*
  - Returns: `{ "id": 1, "busNumber": "College Bus 1", "registrationNumber": "CB-2026-X1", "status": "ACTIVE" }`
- `PUT /api/admin/bus` *(ADMIN only)*
  - Body: `{ "busNumber": "College Bus 1", "registrationNumber": "CB-2026-X1", "status": "ACTIVE" }`

### Route & Stops
- `GET /api/route` *(Public)*
  - Returns route info and array of ordered stops.
- `POST /api/admin/stops` *(ADMIN only)*
  - Body: `{ "stopName": "Library Gate", "latitude": 12.935, "longitude": 77.625, "stopOrder": 6 }`
- `PUT /api/admin/stops/{id}` *(ADMIN only)*
  - Body: `{ "stopName": "Updated Stop", "latitude": 12.936, "longitude": 77.626, "stopOrder": 6 }`
- `DELETE /api/admin/stops/{id}` *(ADMIN only)*
  - Deletes stop with given ID.

### Trip Management
- `GET /api/trip/active` *(Public)*
  - Returns current running trip details or last known run.
- `POST /api/driver/trip/start` *(DRIVER only)*
  - Starts a trip, sets status to `RUNNING` and timestamps `startedAt`.
  - Enforces rule: Only one active running trip allowed at a time.
- `POST /api/driver/trip/end` *(DRIVER or ADMIN)*
  - Concludes the active run, setting status to `COMPLETED` and timestamping `endedAt`.

### Driver Telemetry & Location
- `POST /api/driver/location` *(DRIVER only)*
  - Body:
    ```json
    {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "speed": 28.5
    }
    ```
  - Validates active trip and driver identity, logs GPS record, caches latest coordinate, and emits STOMP packet to `/topic/bus/1/location`.
- `GET /api/bus/location/latest` *(Public)*
  - Response:
    ```json
    {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "speed": 28.5,
      "recordedAt": "2026-10-07T16:20:00Z",
      "status": "LIVE"
    }
    ```
  - `status` returns `LIVE` if pinged within 30 seconds, `STALE` if older than 30 seconds, or `UNAVAILABLE` if no active trip.

### Admin Driver Management
- `GET /api/admin/driver` *(ADMIN only)* - Gets current driver summary.
- `POST /api/admin/driver` *(ADMIN only)* - Creates new driver account with name, email, and password.
- `PATCH /api/admin/driver/{id}/status?enabled={true|false}` *(ADMIN only)* - Enables or disables driver account.

---

## ⚡ WebSocket & STOMP Protocol

- **STOMP Endpoint**: `http://localhost:8080/ws-bus` (Supports native WebSocket and SockJS fallback).
- **Destination Topic**: `/topic/bus/1/location`
- **Message Payload**:
  ```json
  {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "speed": 28.5,
    "recordedAt": "2026-10-07T16:20:00Z",
    "status": "LIVE"
  }
  ```

---

## 🎬 End-to-End Demo Walkthrough

Try the complete 3-role live demo locally:

### Step 1: Open 2 Browser Windows / Tabs
- **Window 1 (Student View)**: Open `http://localhost:5173/student`.
  - Notice the map displaying the 8 pre-seeded stops connected by the route polyline.
  - Notice status is `NOT STARTED` and location is `UNAVAILABLE`.
- **Window 2 (Driver / Admin)**: Open `http://localhost:5173/login`.

### Step 2: Test Admin Panel
1. Click the **Admin** demo card on the login screen (`admin@college.edu` / `admin123`) and submit.
2. In the Admin Console:
   - Edit the bus label or registration number and click **Save**.
   - Click **Add Stop**, enter a stop name, latitude, longitude, and order, then click **Save Stop**.
   - View the Driver Account card and test the **Enable/Disable** toggle.
3. Logout via the top navbar.

### Step 3: Start Trip & Broadcast as Driver
1. On the login screen, click the **Driver** demo card (`driver@college.edu` / `driver123`) and submit.
2. Click **Start Trip** (Trip status updates to `RUNNING`).
3. Click either:
   - **Share Device GPS**: Uses your real browser coordinates via `navigator.geolocation.watchPosition`.
   - **Simulate Route GPS**: *(Recommended for desktop testing)* Automatically steps through the route stops every 5 seconds with realistic speed variations!
4. Notice the **Live Telemetry Output** card updating every 5 seconds with lat/lng, speed, and ping time.

### Step 4: Verify Live Movement on Student Map
1. Switch back to **Window 1 (Student Map)**.
2. Observe:
   - The status badge changes to **`TRIP RUNNING`** and **`LIVE`** (pulsing green indicator).
   - The bus marker moves smoothly along the route every 5 seconds.
   - Click the bus marker to inspect real-time speed, last ping time, and registration plate.
   - Click **Auto-Pan On** to have the camera follow the bus automatically!

### Step 5: Conclude Trip
1. Return to the Driver Console and click **End Trip**.
2. Location sharing terminates automatically and the student map reflects the completed run.

---

## 📁 Project Structure

```
collegeBustracker/
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/college/bus/tracker/
│       │   ├── BusTrackerApplication.java
│       │   ├── config/              # Security, WebSocket, CORS, DataInitializer
│       │   ├── controller/          # REST Endpoints (Auth, Bus, Route, Trip, Location, Admin)
│       │   ├── dto/                 # Request & Response Data Transfer Objects
│       │   ├── entity/              # JPA Entities (User, Bus, Route, Stop, Trip, BusLocation)
│       │   ├── exception/           # Global Exception Handler & Custom Errors
│       │   ├── repository/          # Spring Data JPA Repositories
│       │   ├── security/            # JWT Token Provider, Auth Filter, UserPrincipal
│       │   ├── service/             # Business Logic & Validation Services
│       │   └── util/                # Constants
│       └── resources/
│           ├── application.yml      # DB & JWT Configuration
│           └── db/
│               ├── schema.sql       # MySQL 8 DDL Script
│               └── seed.sql         # Seed Data Script
├── frontend/
│   ├── package.json
│   ├── vite.config.ts               # Vite configuration with dev proxy
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/              # Map, BusMarker, StopMarker, StatusBadge, Navbar
│   │   ├── hooks/                   # useAuth, useBusLocation (STOMP hook)
│   │   ├── pages/                   # Login, StudentMap, DriverDashboard, AdminDashboard
│   │   ├── services/                # Axios API, Auth Service, STOMP WebSocket
│   │   ├── types/                   # TypeScript interfaces and types
│   │   ├── App.tsx                  # Routing and Protected Routes
│   │   └── main.tsx
└── README.md
```
