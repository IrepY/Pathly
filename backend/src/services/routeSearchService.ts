import axios from 'axios';
import { query } from '../config/database';

/**
 * Route Search Service
 * Finds transit routes using multiple data sources:
 * - Local SQLite database (cached routes)
 * - Overpass API (OSM transit data)
 * - GTFS API (if available)
 */

interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

interface RouteOption {
  id?: string;
  name: string;
  type: 'metro' | 'tram' | 'bus' | 'rail';
  stops: Stop[];
  duration: number;
  transfers: number;
  distance: number;
  polyline?: string;
  notes?: string;
}

interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  arrivalTime?: string;
  departureTime?: string;
}

interface RouteSearchResult {
  success: boolean;
  routes: RouteOption[];
  fromLocation: Location;
  toLocation: Location;
  timestamp: string;
  dataSource: string;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get nearby stops from database
 */
export async function getNearbyStops(
  latitude: number,
  longitude: number,
  radiusKm: number = 1
): Promise<Stop[]> {
  try {
    const result = await query(
      `
      SELECT id, stop_id as id, name, latitude, longitude 
      FROM stops 
      WHERE (
        SELECT COUNT(*) FROM (
          SELECT 1 WHERE 
            SQRT(
              POW(latitude - ?, 2) + POW(longitude - ?, 2)
            ) <= ?
        )
      ) > 0
      LIMIT 20
      `,
      [latitude, longitude, radiusKm / 111] // Convert km to degrees approximately
    );

    const stops = Array.isArray(result) ? result : (result?.rows || []);
    return stops.map((stop: any) => ({
      id: stop.id || stop.stop_id,
      name: stop.name,
      latitude: stop.latitude,
      longitude: stop.longitude,
    }));
  } catch (error) {
    console.error('Error getting nearby stops:', error);
    return [];
  }
}

/**
 * Search local database for routes between two locations
 */
export async function searchLocalRoutes(
  origin: Location,
  destination: Location
): Promise<RouteOption[]> {
  try {
    // Get nearby stops for origin and destination
    const originStops = await getNearbyStops(origin.latitude, origin.longitude, 0.5);
    const destStops = await getNearbyStops(destination.latitude, destination.longitude, 0.5);

    if (originStops.length === 0 || destStops.length === 0) {
      console.log('No nearby stops found');
      return [];
    }

    const routes: RouteOption[] = [];

    // Try to find routes connecting stops
    for (const fromStop of originStops.slice(0, 3)) {
      for (const toStop of destStops.slice(0, 3)) {
        try {
          // Query trips and stop times for this connection
          const stopTimesResult = await query(
            `
            SELECT DISTINCT
              tr.id as route_id,
              tr.route_id,
              tr.route_short_name,
              tr.route_type,
              t.trip_id,
              s1.name as start_stop,
              s2.name as end_stop,
              st1.departure_time,
              st2.arrival_time,
              COUNT(DISTINCT st.id) as stops_count
            FROM trips t
            JOIN transit_routes tr ON t.route_id = tr.id
            JOIN stop_times st1 ON t.id = st1.trip_id AND st1.stop_id = ?
            JOIN stop_times st2 ON t.id = st2.trip_id AND st2.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
            JOIN stops s1 ON st1.stop_id = s1.id
            JOIN stops s2 ON st2.stop_id = s2.id
            JOIN stop_times st ON t.id = st.trip_id
            WHERE st1.stop_sequence < st2.stop_sequence
            GROUP BY t.id, tr.id
            LIMIT 5
            `,
            [fromStop.id, toStop.id]
          );

          const trips = Array.isArray(stopTimesResult)
            ? stopTimesResult
            : (stopTimesResult?.rows || []);

          for (const trip of trips) {
            const distance = calculateDistance(
              origin.latitude,
              origin.longitude,
              destination.latitude,
              destination.longitude
            );

            const route: RouteOption = {
              id: `${trip.route_id}_${trip.trip_id}`,
              name: trip.route_short_name || 'Route',
              type: getTransitType(trip.route_type),
              stops: [fromStop, toStop],
              duration: Math.round(distance / 30 * 60), // Approximate based on distance
              transfers: 0,
              distance: parseFloat(distance.toFixed(2)),
              notes: `${trip.start_stop} → ${trip.end_stop}`,
            };

            routes.push(route);
          }
        } catch (error) {
          console.error('Error processing route:', error);
        }
      }
    }

    return routes;
  } catch (error) {
    console.error('Error searching local routes:', error);
    return [];
  }
}

/**
 * Convert GTFS route type to display type
 */
function getTransitType(
  routeType: number
): 'metro' | 'tram' | 'bus' | 'rail' {
  const types: { [key: number]: 'metro' | 'tram' | 'bus' | 'rail' } = {
    0: 'rail', // Tram
    1: 'metro', // Metro
    2: 'rail', // Rail
    3: 'bus', // Bus
  };
  return types[routeType] || 'bus';
}

/**
 * Search using OpenRouteService (fallback)
 * Requires API key from https://openrouteservice.org/
 */
export async function searchPublicRoutes(
  origin: Location,
  destination: Location,
  routingProfile: string = 'transit'
): Promise<RouteOption[]> {
  try {
    const apiKey = process.env.OPENROUTE_SERVICE_KEY;
    if (!apiKey) {
      console.log('OpenRouteService API key not configured, using local data only');
      return [];
    }

    const response = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${routingProfile}`,
      {
        coordinates: [
          [origin.longitude, origin.latitude],
          [destination.longitude, destination.latitude],
        ],
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    const routes: RouteOption[] = [];

    if (response.data.routes) {
      for (const route of response.data.routes) {
        const summary = route.summary || {};
        routes.push({
          name: `${routingProfile} Route`,
          type: 'bus',
          stops: [
            { id: '0', name: origin.name || 'Origin', ...origin },
            { id: '1', name: destination.name || 'Destination', ...destination },
          ],
          duration: Math.round((summary.duration || 0) / 60),
          transfers: 0,
          distance: (summary.distance || 0) / 1000,
        });
      }
    }

    return routes;
  } catch (error) {
    console.error('Error searching public routes:', error);
    return [];
  }
}

/**
 * Main search function - combines local and public data
 */
export async function findRoutes(
  origin: Location,
  destination: Location,
  preferences?: {
    maxWalkingDistance?: number;
    preferredTypes?: string[];
    allowTransfers?: boolean;
  }
): Promise<RouteSearchResult> {
  console.log(`🔍 Searching routes from [${origin.latitude}, ${origin.longitude}] to [${destination.latitude}, ${destination.longitude}]`);

  try {
    // Search local database first
    let routes = await searchLocalRoutes(origin, destination);

    // If no local routes found, try public API
    if (routes.length === 0) {
      console.log('No local routes found, trying public APIs...');
      routes = await searchPublicRoutes(origin, destination);
    }

    // Filter by preferences
    if (preferences?.preferredTypes) {
      routes = routes.filter((route) => preferences.preferredTypes!.includes(route.type));
    }

    // Sort by duration
    routes.sort((a, b) => a.duration - b.duration);

    return {
      success: routes.length > 0,
      routes: routes.slice(0, 10), // Return top 10 routes
      fromLocation: origin,
      toLocation: destination,
      timestamp: new Date().toISOString(),
      dataSource: routes.length > 0 ? 'Local Database' : 'No routes found',
    };
  } catch (error) {
    console.error('Error finding routes:', error);
    return {
      success: false,
      routes: [],
      fromLocation: origin,
      toLocation: destination,
      timestamp: new Date().toISOString(),
      dataSource: 'Error',
    };
  }
}
