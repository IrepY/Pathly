import { query } from '../config/database';

interface Coordinate {
  lat: number;
  lon: number;
}

interface RouteOptions {
  departureTime: Date;
  arrivalTime?: Date;
  optimization: 'fastest' | 'least_transfers' | 'earliest_departure';
  maxTransfers: number;
}

interface TransitLeg {
  type: 'transit';
  routeId: string;
  routeName: string;
  departure: Date;
  arrival: Date;
  departureStop: string;
  arrivalStop: string;
  tripId: string;
}

interface WalkingLeg {
  type: 'walking';
  distance: number; // meters
  duration: number; // seconds
  from: string;
  to: string;
}

type RouteLeg = TransitLeg | WalkingLeg;

interface RouteOption {
  id: string;
  legs: RouteLeg[];
  totalDuration: number; // seconds
  totalDistance: number; // meters
  transfers: number;
  departureTime: Date;
  arrivalTime: Date;
  cost?: number;
}

// Haversine formula az két pont közötti távolság kiszámításához
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Legközelebbi megállók keresése
const findNearestStops = async (coord: Coordinate, limit: number = 5) => {
  const result = await query(
    `SELECT id, name, latitude, longitude,
            (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
            sin(radians(latitude)))) AS distance
     FROM stops
     ORDER BY distance
     LIMIT $3`,
    [coord.lat, coord.lon, limit]
  );

  return result.rows;
};

// Járatok keresése adott időpontban és állomások között
const findTransitConnections = async (
  fromStopId: string,
  toStopId: string,
  departureTime: Date,
  maxTransfers: number
) => {
  // Ez egy egyszerűsített implementáció. A valódi rendszerben egy komplex pathfinding algoritmus kellene
  const result = await query(
    `SELECT DISTINCT t.*, tr.route_short_name, tr.route_long_name
     FROM trips t
     JOIN transit_routes tr ON t.route_id = tr.id
     JOIN stop_times st1 ON t.id = st1.trip_id
     JOIN stop_times st2 ON t.id = st2.trip_id
     WHERE st1.stop_id = $1 
       AND st2.stop_id = $2
       AND st1.stop_sequence < st2.stop_sequence
       AND st1.departure_time >= TIME($3)
     LIMIT 10`,
    [fromStopId, toStopId, departureTime.toTimeString()]
  );

  return result.rows;
};

// Útvonal számítási motor
export const calculateRoutes = async (
  origin: Coordinate,
  destination: Coordinate,
  options: RouteOptions
): Promise<RouteOption[]> => {
  try {
    // 1. Legközelebbi megállók keresése
    const nearestOriginStops = await findNearestStops(origin, 3);
    const nearestDestinationStops = await findNearestStops(destination, 3);

    if (nearestOriginStops.length === 0 || nearestDestinationStops.length === 0) {
      return [];
    }

    // 2. Lehetséges útvonalak keresése
    const routes: RouteOption[] = [];

    for (const originStop of nearestOriginStops) {
      for (const destStop of nearestDestinationStops) {
        const connections = await findTransitConnections(
          originStop.id,
          destStop.id,
          options.departureTime,
          options.maxTransfers
        );

        // 3. Útvonallehetőségek létrehozása
        for (const connection of connections) {
          const legs: RouteLeg[] = [];

          // Séta az origótól az origó megállóig
          const walkingDistance1 = calculateDistance(
            origin.lat,
            origin.lon,
            originStop.latitude,
            originStop.longitude
          );
          const walkingDuration1 = Math.round(walkingDistance1 / 1.4); // 1.4 m/s = 5 km/h gyalogos sebesség

          legs.push({
            type: 'walking',
            distance: walkingDistance1,
            duration: walkingDuration1,
            from: 'Start',
            to: originStop.name,
          });

          // Tömegközlekedés
          legs.push({
            type: 'transit',
            routeId: connection.route_id,
            routeName: connection.route_short_name || connection.route_long_name,
            departure: new Date(),
            arrival: new Date(),
            departureStop: originStop.name,
            arrivalStop: destStop.name,
            tripId: connection.id,
          });

          // Séta a végső megállótól a célig
          const walkingDistance2 = calculateDistance(
            destStop.latitude,
            destStop.longitude,
            destination.lat,
            destination.lon
          );
          const walkingDuration2 = Math.round(walkingDistance2 / 1.4);

          legs.push({
            type: 'walking',
            distance: walkingDistance2,
            duration: walkingDuration2,
            from: destStop.name,
            to: 'Destination',
          });

          const totalDistance = walkingDistance1 + walkingDistance2;
          const totalDuration = walkingDuration1 + walkingDuration2 + 1200; // ~20 min tömegközlekedés

          routes.push({
            id: `route-${Math.random()}`,
            legs,
            totalDuration,
            totalDistance,
            transfers: 0,
            departureTime: options.departureTime,
            arrivalTime: new Date(options.departureTime.getTime() + totalDuration * 1000),
          });
        }
      }
    }

    // 4. Rendezés az optimization beállítás szerint
    if (options.optimization === 'fastest') {
      routes.sort((a, b) => a.totalDuration - b.totalDuration);
    } else if (options.optimization === 'least_transfers') {
      routes.sort((a, b) => a.transfers - b.transfers || a.totalDuration - b.totalDuration);
    }

    // Maximum 3 alternatív útvonal visszaadása (SRS-FUNC-012)
    return routes.slice(0, 3);
  } catch (error) {
    console.error('Route calculation error:', error);
    return [];
  }
};
