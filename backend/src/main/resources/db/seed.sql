-- College Bus Tracker Seed Data

USE bus_tracker;

-- Users (Default passwords: admin123, driver123, student123)
-- BCrypt hashed with cost factor 10
INSERT INTO users (id, name, email, password_hash, role, enabled, created_at) VALUES
(1, 'Campus Transit Admin', 'admin@college.edu', '$2a$10$Qk7T4jZgU6cT5Z6sNsqCkeuJbX1xYcO9W9J7/50v2m4qJzL8Y5pYm', 'ADMIN', true, CURRENT_TIMESTAMP),
(2, 'Michael Driver', 'driver@college.edu', '$2a$10$nSrvC1u5NqT2t4yP77g8eO.Lw7mQfA6cW2K1z/50y9pJuM4bL6xXa', 'DRIVER', true, CURRENT_TIMESTAMP),
(3, 'Alex Student', 'student@college.edu', '$2a$10$rN2uI0e2KkP9r7vT54w3uO.Mz8nRbB5dY1J0y/50x8qItN3cL5wWb', 'STUDENT', true, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Default Bus (College of Engineering Adoor Bus 1)
INSERT INTO bus (id, bus_number, registration_number, status, created_at, updated_at) VALUES
(1, 'CEA College Bus 1', 'KL-26-CEA-101', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE bus_number=VALUES(bus_number);

-- Default Route (CEA Campus - Adoor Transit Loop)
INSERT INTO route (id, route_name, description, active, created_at) VALUES
(1, 'CEA Campus & Adoor Town Route', 'Daily student transit route starting from College of Engineering Adoor, traveling via Manakala, Adoor Central, Parakode, Ezhamkulam, and ending at College of Engineering Adoor', true, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- Stops starting and ending at College of Engineering Adoor
INSERT INTO stop (id, route_id, stop_name, latitude, longitude, stop_order, created_at) VALUES
(1, 1, 'College of Engineering Adoor (Departure Gate)', 9.1324, 76.7182, 1, CURRENT_TIMESTAMP),
(2, 1, 'Manakala Junction', 9.1352, 76.7225, 2, CURRENT_TIMESTAMP),
(3, 1, 'Karuvatta Junction', 9.1440, 76.7310, 3, CURRENT_TIMESTAMP),
(4, 1, 'Adoor KSRTC Central Bus Stand', 9.1538, 76.7335, 4, CURRENT_TIMESTAMP),
(5, 1, 'Adoor Revenue Tower / Private Stand', 9.1560, 76.7360, 5, CURRENT_TIMESTAMP),
(6, 1, 'Parakode Junction Market', 9.1425, 76.7512, 6, CURRENT_TIMESTAMP),
(7, 1, 'Ezhamkulam Temple Junction', 9.1305, 76.7580, 7, CURRENT_TIMESTAMP),
(8, 1, 'College of Engineering Adoor (Arrival Terminal)', 9.1324, 76.7182, 8, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE stop_name=VALUES(stop_name);
