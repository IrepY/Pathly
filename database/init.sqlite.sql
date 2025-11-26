-- Pathly Community Route Planner - SQLite Database Schema
-- Created for development and production environments

-- ============================================
-- 1. Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

-- ============================================
-- 2. User Preferences Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  optimization_strategy TEXT DEFAULT 'balanced',
  theme TEXT DEFAULT 'light',
  max_walking_distance INTEGER DEFAULT 500,
  preferred_transit_types TEXT DEFAULT 'bus,tram,metro',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 3. Transit Stops Table
-- ============================================
CREATE TABLE IF NOT EXISTS stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stop_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  stop_code TEXT,
  location_type INTEGER,
  parent_station TEXT,
  zone_id TEXT,
  wheelchair_boarding INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Transit Routes Table
-- ============================================
CREATE TABLE IF NOT EXISTS transit_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  route_id TEXT UNIQUE NOT NULL,
  agency_id TEXT,
  route_short_name TEXT NOT NULL,
  route_long_name TEXT,
  route_desc TEXT,
  route_type INTEGER NOT NULL,
  route_url TEXT,
  route_color TEXT,
  route_text_color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Trips Table
-- ============================================
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT UNIQUE NOT NULL,
  route_id INTEGER NOT NULL,
  service_id TEXT,
  trip_headsign TEXT,
  trip_short_name TEXT,
  direction_id INTEGER,
  block_id TEXT,
  shape_id TEXT,
  wheelchair_accessible INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES transit_routes(id)
);

-- ============================================
-- 6. Stop Times Table (Schedule Data)
-- ============================================
CREATE TABLE IF NOT EXISTS stop_times (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  arrival_time TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  stop_id INTEGER NOT NULL,
  stop_sequence INTEGER NOT NULL,
  stop_headsign TEXT,
  pickup_type INTEGER,
  drop_off_type INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES stops(id)
);

-- ============================================
-- 7. Saved Routes Table
-- ============================================
CREATE TABLE IF NOT EXISTS saved_routes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  origin_lat REAL NOT NULL,
  origin_lon REAL NOT NULL,
  origin_name TEXT NOT NULL,
  destination_lat REAL NOT NULL,
  destination_lon REAL NOT NULL,
  destination_name TEXT NOT NULL,
  optimization_strategy TEXT,
  route_data TEXT,
  estimated_duration INTEGER,
  estimated_distance REAL,
  transfer_count INTEGER,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used DATETIME,
  usage_count INTEGER DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 8. Vehicle Positions Table (Real-time data)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_positions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  vehicle_id TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  bearing REAL,
  speed INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- ============================================
-- 9. Service Alerts Table
-- ============================================
CREATE TABLE IF NOT EXISTS service_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alert_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  route_id INTEGER,
  affected_stops TEXT,
  severity TEXT DEFAULT 'info',
  active_from DATETIME,
  active_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (route_id) REFERENCES transit_routes(id) ON DELETE SET NULL
);

-- ============================================
-- 10. Audit Logs Table (GDPR Compliance)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value TEXT,
  new_value TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Indexes for Performance Optimization
-- ============================================

-- User queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Stop queries
CREATE INDEX IF NOT EXISTS idx_stops_location ON stops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_stops_stop_id ON stops(stop_id);

-- Route queries
CREATE INDEX IF NOT EXISTS idx_routes_route_id ON transit_routes(route_id);
CREATE INDEX IF NOT EXISTS idx_routes_type ON transit_routes(route_type);

-- Trip queries
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_trip_id ON trips(trip_id);

-- Stop times queries
CREATE INDEX IF NOT EXISTS idx_stop_times_trip_id ON stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_stop_id ON stop_times(stop_id);

-- Saved routes queries
CREATE INDEX IF NOT EXISTS idx_saved_routes_user_id ON saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_routes_saved_at ON saved_routes(saved_at);

-- Audit logs queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- ============================================
-- Auto-Update Triggers (SQLite Syntax)
-- ============================================

-- Update user's updated_at when record changes
CREATE TRIGGER IF NOT EXISTS users_update_timestamp 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update user_preferences updated_at
CREATE TRIGGER IF NOT EXISTS user_preferences_update_timestamp 
AFTER UPDATE ON user_preferences
FOR EACH ROW
BEGIN
  UPDATE user_preferences SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update stops updated_at
CREATE TRIGGER IF NOT EXISTS stops_update_timestamp 
AFTER UPDATE ON stops
FOR EACH ROW
BEGIN
  UPDATE stops SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update transit_routes updated_at
CREATE TRIGGER IF NOT EXISTS transit_routes_update_timestamp 
AFTER UPDATE ON transit_routes
FOR EACH ROW
BEGIN
  UPDATE transit_routes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample user
INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name) 
VALUES (1, 'test@pathly.com', '$2a$10$YourHashedPasswordHere', 'Test', 'User');

-- Insert sample user preferences
INSERT OR IGNORE INTO user_preferences (user_id, optimization_strategy, theme, max_walking_distance) 
VALUES (1, 'balanced', 'light', 500);

-- Insert sample stops (Budapest example)
INSERT OR IGNORE INTO stops (stop_id, name, latitude, longitude, location_type, wheelchair_boarding) 
VALUES 
  ('BUD001', 'Deák Ferenc tér', 47.5296, 19.0405, 1, 1),
  ('BUD002', 'Astoria', 47.4990, 19.0595, 1, 1),
  ('BUD003', 'Blaha Lujza tér', 47.4916, 19.0681, 1, 1);

-- Insert sample transit route
INSERT OR IGNORE INTO transit_routes (route_id, route_short_name, route_long_name, route_type, route_color, route_text_color) 
VALUES ('M1', 'M1', 'Metro Line 1', 1, 'FF0000', 'FFFFFF');

-- ============================================
-- End of Schema
-- ============================================
