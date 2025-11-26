-- Pathly - Minta adatok (Budapest közlekedés)

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(1, 'BUD_DEAK', 'Deák Ferenc tér', 47.5296, 19.0405, 1, 1);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(2, 'BUD_ASTORIA', 'Astoria', 47.4990, 19.0595, 1, 1);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(3, 'BUD_BLAHA', 'Blaha Lujza tér', 47.4916, 19.0681, 1, 1);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(4, 'BUD_KELETI', 'Keleti pályaudvar', 47.5027, 19.0408, 1, 1);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(5, 'BUD_NYUGATI', 'Nyugati pályaudvar', 47.5107, 19.0351, 1, 1);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(6, 'BUD_KOZTL', 'Közlekedési tájékoztatási központ', 47.4974, 19.0382, 1, 1);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(7, 'BUD_VILLAMOSMUZEUM', 'Villamos Múzeum', 47.5241, 19.0342, 1, 0);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(8, 'BUD_PARIZS', 'Párizsi udvar', 47.5062, 19.0405, 1, 1);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(9, 'BUD_REPUBLICA', 'Républica tér', 47.5142, 19.0285, 1, 0);

INSERT OR IGNORE INTO stops (id, stop_id, name, latitude, longitude, location_type, wheelchair_boarding) VALUES
(10, 'BUD_KOSSUTH', 'Kossuth Lajos tér', 47.5074, 19.0393, 1, 1);

INSERT OR IGNORE INTO transit_routes (id, route_id, route_short_name, route_long_name, route_type) VALUES
(1, 'M1', 'M1', 'Metro - Vörösvonal', 1);

INSERT OR IGNORE INTO transit_routes (id, route_id, route_short_name, route_long_name, route_type) VALUES
(2, 'M2', 'M2', 'Metro - Kékvonal', 1);

INSERT OR IGNORE INTO transit_routes (id, route_id, route_short_name, route_long_name, route_type) VALUES
(3, 'M3', 'M3', 'Metro - Zöldvonal', 1);

INSERT OR IGNORE INTO trips (id, trip_id, route_id, service_id, trip_headsign, direction_id) VALUES
(1, 'M1_001', 1, 'weekday', 'Felsőörs', 0);

INSERT OR IGNORE INTO trips (id, trip_id, route_id, service_id, trip_headsign, direction_id) VALUES
(2, 'M1_002', 1, 'weekday', 'Kolosváry', 1);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(1, '08:00:00', '08:00:00', 5, 1);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(1, '08:03:00', '08:03:00', 6, 2);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(1, '08:06:00', '08:06:00', 3, 3);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(1, '08:09:00', '08:09:00', 4, 4);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(1, '08:12:00', '08:12:00', 1, 5);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(2, '08:15:00', '08:15:00', 1, 1);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(2, '08:18:00', '08:18:00', 4, 2);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(2, '08:21:00', '08:21:00', 3, 3);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(2, '08:24:00', '08:24:00', 6, 4);

INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES
(2, '08:27:00', '08:27:00', 5, 5);
