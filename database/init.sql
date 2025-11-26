-- Pathly Database Schema
-- PostgreSQL initialization script

-- Create database (run this separately if needed)
-- CREATE DATABASE pathly;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP
);

-- Stops table (megállók)
CREATE TABLE IF NOT EXISTS stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gtfs_stop_id VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table (járatok útvonala)
CREATE TABLE IF NOT EXISTS transit_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gtfs_route_id VARCHAR(255) UNIQUE,
    route_short_name VARCHAR(50),
    route_long_name VARCHAR(255),
    route_type INTEGER, -- 0=tram, 1=subway, 2=rail, 3=bus, 4=ferry, etc.
    route_color VARCHAR(6),
    route_text_color VARCHAR(6),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table (járatok - konkrét járatok a napon belül)
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gtfs_trip_id VARCHAR(255) UNIQUE,
    route_id UUID REFERENCES transit_routes(id),
    service_id VARCHAR(255), -- a GTFS service calendar referenciája
    trip_headsign VARCHAR(255),
    direction_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stop Times table (megállók időpontjai a járatonként)
CREATE TABLE IF NOT EXISTS stop_times (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
    stop_id UUID REFERENCES stops(id),
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    stop_sequence INTEGER NOT NULL,
    UNIQUE(trip_id, stop_id, stop_sequence)
);

-- Saved Routes table (felhasználók mentett útvonalai)
CREATE TABLE IF NOT EXISTS saved_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    origin_name VARCHAR(255) NOT NULL,
    origin_lat DECIMAL(10, 8) NOT NULL,
    origin_lon DECIMAL(11, 8) NOT NULL,
    destination_name VARCHAR(255) NOT NULL,
    destination_lat DECIMAL(10, 8) NOT NULL,
    destination_lon DECIMAL(11, 8) NOT NULL,
    label VARCHAR(255), -- pl. "Munkahely", "Otthon"
    route_data JSONB, -- Az optimalizálási beállítások és az útvonal adatai
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Preferences table (felhasználói beállítások)
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_optimization VARCHAR(50) DEFAULT 'fastest', -- fastest, least_transfers, earliest_departure
    avoid_transfers BOOLEAN DEFAULT FALSE,
    max_walking_distance INTEGER DEFAULT 500, -- méterben
    max_transit_time INTEGER DEFAULT 120, -- percben
    notifications_enabled BOOLEAN DEFAULT TRUE,
    theme VARCHAR(20) DEFAULT 'light', -- light, dark
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time vehicle positions table (valós idejű járatpozíciók)
CREATE TABLE IF NOT EXISTS vehicle_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID REFERENCES trips(id),
    vehicle_id VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    bearing DECIMAL(5, 2),
    speed INTEGER, -- km/h
    current_stop_sequence INTEGER,
    timestamp TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Alerts table (szervizfigyelmeztetések)
CREATE TABLE IF NOT EXISTS service_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gtfs_alert_id VARCHAR(255) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    affected_routes TEXT[], -- JSON array of route IDs
    affected_stops TEXT[], -- JSON array of stop IDs
    alert_type VARCHAR(50), -- delay, closure, modification, etc.
    severity VARCHAR(20), -- low, medium, high, critical
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log table (GDPR nyomköveteéshez)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL, -- login, logout, route_search, data_deletion, etc.
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stops_location ON stops USING GIST (
    ll_to_earth(latitude, longitude)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_saved_routes_user ON saved_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_trip ON stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_stop_times_stop ON stop_times(stop_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_trip ON vehicle_positions(trip_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_positions_timestamp ON vehicle_positions(timestamp);
CREATE INDEX IF NOT EXISTS idx_service_alerts_time ON service_alerts(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_saved_routes_updated_at
    BEFORE UPDATE ON saved_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_alerts_updated_at
    BEFORE UPDATE ON service_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
