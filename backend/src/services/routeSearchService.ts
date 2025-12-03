import { query } from '../config/database';

interface Location {
  name: string;
}

interface Stop {
  id: number;
  name: string;
  arrivalTime?: string;
  departureTime?: string;
}

interface RouteOption {
  id?: string;
  name: string;
  type: 'metro' | 'tram' | 'bus' | 'rail';
  stops: Stop[];
  duration: number;
  transfers: number;
  notes?: string;
}

interface RouteSearchResult {
  success: boolean;
  routes: RouteOption[];
  fromLocation: Location;
  toLocation: Location;
  timestamp: string;
  dataSource: string;
}

export async function searchStopsByName(searchTerm: string): Promise<Stop[]> {
  try {
    const result = await query(
      `SELECT id, name
       FROM stops 
       WHERE LOWER(name) LIKE LOWER(?) 
       ORDER BY name ASC 
       LIMIT 10`,
      [`%${searchTerm}%`]
    );

    const stops = Array.isArray(result) ? result : (result?.rows || []);
    
    return stops.map((stop: any) => ({
      id: stop.id,
      name: stop.name,
    }));
  } catch (error) {
    console.error('Error searching stops:', error);
    return [];
  }
}

async function getStopByName(stopName: string): Promise<Stop | null> {
  try {
    const result = await query(
      `SELECT id, name 
       FROM stops 
       WHERE LOWER(name) = LOWER(?) 
       LIMIT 1`,
      [stopName]
    );

    const stops = Array.isArray(result) ? result : (result?.rows || []);
    
    if (stops.length === 0) return null;
    return {
      id: stops[0].id,
      name: stops[0].name,
    };
  } catch (error) {
    console.error('Error getting stop:', error);
    return null;
  }
}

async function getConnectedStops(stopId: number, maxTransfers: number = 3): Promise<Map<number, { distance: number; path: number[]; routeName: string; routeType: string }>> {
  const connected = new Map<number, { distance: number; path: number[]; routeName: string; routeType: string }>();
  const visited = new Set<number>();
  const queue: Array<{ stopId: number; distance: number; path: number[]; transfers: number; routeName: string; routeType: string }> = [
    { stopId, distance: 0, path: [stopId], transfers: 0, routeName: '', routeType: '' }
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (visited.has(current.stopId)) continue;
    visited.add(current.stopId);

    if (current.distance > 0) {
      connected.set(current.stopId, {
        distance: current.distance,
        path: current.path,
        routeName: current.routeName,
        routeType: current.routeType,
      });
    }

    if (current.transfers >= maxTransfers) continue;

    // Get all routes that serve this stop
    try {
      const routesResult = await query(
        `SELECT DISTINCT
          st1.stop_id,
          st2.stop_id as next_stop_id,
          tr.route_short_name,
          tr.route_type,
          ABS(st2.stop_sequence - st1.stop_sequence) as distance
        FROM stop_times st1
        JOIN stop_times st2 ON st1.trip_id = st2.trip_id AND st2.stop_sequence > st1.stop_sequence
        JOIN trips t ON st1.trip_id = t.id
        JOIN transit_routes tr ON t.route_id = tr.id
        WHERE st1.stop_id = ?
        GROUP BY st2.stop_id
        ORDER BY distance ASC
        LIMIT 20`,
        [current.stopId]
      );

      const nextStops = Array.isArray(routesResult) ? routesResult : (routesResult?.rows || []);

      for (const stop of nextStops) {
        if (!visited.has(stop.next_stop_id)) {
          queue.push({
            stopId: stop.next_stop_id,
            distance: current.distance + (stop.distance || 1),
            path: [...current.path, stop.next_stop_id],
            transfers: current.transfers + 1,
            routeName: stop.route_short_name || 'Route',
            routeType: getTransitType(stop.route_type),
          });
        }
      }
    } catch (error) {
      console.error('Error getting connected stops:', error);
    }
  }

  return connected;
}

/**
 * Get stops along a path
 */
async function getPathStops(stopIds: number[]): Promise<Stop[]> {
  if (stopIds.length === 0) return [];

  try {
    const placeholders = stopIds.map(() => '?').join(',');
    const result = await query(
      `SELECT id, name FROM stops WHERE id IN (${placeholders}) ORDER BY id`,
      stopIds
    );

    const stops = Array.isArray(result) ? result : (result?.rows || []);
    
    return stops.map((stop: any) => ({
      id: stop.id,
      name: stop.name,
    }));
  } catch (error) {
    console.error('Error getting path stops:', error);
    return [];
  }
}

/**
 * Find a path between two stops using simple route enumeration
 */
async function findTransferPath(
  originName: string,
  destName: string,
  maxTransfers: number
): Promise<{ stops: Stop[]; duration: number; transfers: number; routeName: string } | null> {
  try {
    // Get origin and destination IDs
    const originResult = await query(
      `SELECT id FROM stops WHERE LOWER(name) = LOWER(?) LIMIT 1`,
      [originName]
    );
    const originData = Array.isArray(originResult) ? originResult : (originResult?.rows || []);
    if (originData.length === 0) return null;
    const originId = originData[0].id;

    const destResult = await query(
      `SELECT id FROM stops WHERE LOWER(name) = LOWER(?) LIMIT 1`,
      [destName]
    );
    const destData = Array.isArray(destResult) ? destResult : (destResult?.rows || []);
    if (destData.length === 0) return null;
    const destId = destData[0].id;

    console.log(`[TRANSFER] Finding path from stop ${originId} to ${destId}, max ${maxTransfers} transfers`);

    // Try to find a path: start -> intermediate stops -> destination
    // Strategy: find all 1-transfer, 2-transfer, 3-transfer routes

    // 1. Direct connection (0 transfers)
    let routeResult = await query(
      `SELECT COUNT(*) as count FROM stop_times st1
       JOIN stop_times st2 ON st1.trip_id = st2.trip_id
       WHERE st1.stop_id = ? AND st2.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
       LIMIT 1`,
      [originId, destId]
    );
    let routeData = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);
    if (routeData[0]?.count > 0) {
      console.log(`[TRANSFER] Found direct connection!`);
      return null; // This should be handled by direct route search
    }

    // 2. One transfer: origin -> hub1 -> destination
    if (maxTransfers >= 1) {
      routeResult = await query(
        `SELECT DISTINCT st2.stop_id as hub1
         FROM stop_times st1
         JOIN stop_times st2 ON st1.trip_id = st2.trip_id
         WHERE st1.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
         LIMIT 30`,
        [originId]
      );
      const hubs1 = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);
      console.log(`[TRANSFER] Found ${hubs1.length} possible hub stops from origin`);

      for (const hub of hubs1) {
        const hubId = hub.stop_id;
        const foundDest = await query(
          `SELECT COUNT(*) as count FROM stop_times st1
           JOIN stop_times st2 ON st1.trip_id = st2.trip_id
           WHERE st1.stop_id = ? AND st2.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
           LIMIT 1`,
          [hubId, destId]
        );
        const destCheck = Array.isArray(foundDest) ? foundDest : (foundDest?.rows || []);
        if (destCheck[0]?.count > 0) {
          console.log(`[TRANSFER] ✓ Found 1-transfer route: origin -> hub(${hubId}) -> destination`);
          return {
            stops: [
              { id: originId, name: originName },
              { id: hubId, name: `Transfer ${hubId}` },
              { id: destId, name: destName },
            ],
            duration: 30,
            transfers: 1,
            routeName: 'Connection via transfer',
          };
        }
      }
    }

    // 3. Two transfers: origin -> hub1 -> hub2 -> destination
    if (maxTransfers >= 2) {
      routeResult = await query(
        `SELECT DISTINCT st2.stop_id as hub1
         FROM stop_times st1
         JOIN stop_times st2 ON st1.trip_id = st2.trip_id
         WHERE st1.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
         LIMIT 20`,
        [originId]
      );
      const hubs1 = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);

      for (const hub1 of hubs1) {
        const hub1Id = hub1.stop_id;

        routeResult = await query(
          `SELECT DISTINCT st2.stop_id as hub2
           FROM stop_times st1
           JOIN stop_times st2 ON st1.trip_id = st2.trip_id
           WHERE st1.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
           LIMIT 20`,
          [hub1Id]
        );
        const hubs2 = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);

        for (const hub2 of hubs2) {
          const hub2Id = hub2.stop_id;

          const foundDest = await query(
            `SELECT COUNT(*) as count FROM stop_times st1
             JOIN stop_times st2 ON st1.trip_id = st2.trip_id
             WHERE st1.stop_id = ? AND st2.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
             LIMIT 1`,
            [hub2Id, destId]
          );
          const destCheck = Array.isArray(foundDest) ? foundDest : (foundDest?.rows || []);
          if (destCheck[0]?.count > 0) {
            console.log(`[TRANSFER] ✓ Found 2-transfer route`);
            return {
              stops: [
                { id: originId, name: originName },
                { id: hub1Id, name: `Transfer` },
                { id: hub2Id, name: `Transfer` },
                { id: destId, name: destName },
              ],
              duration: 45,
              transfers: 2,
              routeName: 'Connection via 2 transfers',
            };
          }
        }
      }
    }

    // 4. Three transfers
    if (maxTransfers >= 3) {
      routeResult = await query(
        `SELECT DISTINCT st2.stop_id as hub1
         FROM stop_times st1
         JOIN stop_times st2 ON st1.trip_id = st2.trip_id
         WHERE st1.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
         LIMIT 15`,
        [originId]
      );
      const hubs1 = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);

      for (const hub1 of hubs1) {
        const hub1Id = hub1.stop_id;

        routeResult = await query(
          `SELECT DISTINCT st2.stop_id as hub2
           FROM stop_times st1
           JOIN stop_times st2 ON st1.trip_id = st2.trip_id
           WHERE st1.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
           LIMIT 15`,
          [hub1Id]
        );
        const hubs2 = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);

        for (const hub2 of hubs2) {
          const hub2Id = hub2.stop_id;

          routeResult = await query(
            `SELECT DISTINCT st2.stop_id as hub3
             FROM stop_times st1
             JOIN stop_times st2 ON st1.trip_id = st2.trip_id
             WHERE st1.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
             LIMIT 15`,
            [hub2Id]
          );
          const hubs3 = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);

          for (const hub3 of hubs3) {
            const hub3Id = hub3.stop_id;

            const foundDest = await query(
              `SELECT COUNT(*) as count FROM stop_times st1
               JOIN stop_times st2 ON st1.trip_id = st2.trip_id
               WHERE st1.stop_id = ? AND st2.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
               LIMIT 1`,
              [hub3Id, destId]
            );
            const destCheck = Array.isArray(foundDest) ? foundDest : (foundDest?.rows || []);
            if (destCheck[0]?.count > 0) {
              console.log(`[TRANSFER] ✓ Found 3-transfer route`);
              return {
                stops: [
                  { id: originId, name: originName },
                  { id: hub1Id, name: `Transfer` },
                  { id: hub2Id, name: `Transfer` },
                  { id: hub3Id, name: `Transfer` },
                  { id: destId, name: destName },
                ],
                duration: 60,
                transfers: 3,
                routeName: 'Connection via 3 transfers',
              };
            }
          }
        }
      }
    }

    console.log(`[TRANSFER] ✗ No path found`);
    return null;
  } catch (error) {
    console.error('Error finding transfer path:', error);
    return null;
  }
}

export async function searchRoutesByStopNames(
  originName: string,
  destinationName: string,
  maxTransfers: number = 3
): Promise<RouteOption[]> {
  try {
    console.log(`🔍 Searching routes from "${originName}" to "${destinationName}"`);

    const originStop = await getStopByName(originName);
    const destStop = await getStopByName(destinationName);

    if (!originStop) {
      console.log(`❌ A(z) "${originName}" megálló nem található`);
      return [];
    }

    if (!destStop) {
      console.log(`❌ A(z) "${destinationName}" megálló nem található`);
      return [];
    }

    console.log(`✓ Found origin: ${originStop.name} (ID: ${originStop.id})`);
    console.log(`✓ Found destination: ${destStop.name} (ID: ${destStop.id})`);

    const routes: RouteOption[] = [];

    try {
      const directResult = await query(
        `SELECT DISTINCT
          tr.id as route_id,
          tr.route_short_name,
          tr.route_type,
          t.id as trip_id,
          st1.departure_time,
          st2.arrival_time,
          st1.stop_sequence as origin_sequence,
          st2.stop_sequence as dest_sequence
        FROM trips t
        JOIN transit_routes tr ON t.route_id = tr.id
        JOIN stop_times st1 ON t.id = st1.trip_id AND st1.stop_id = ?
        JOIN stop_times st2 ON t.id = st2.trip_id AND st2.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
        WHERE st1.stop_sequence < st2.stop_sequence
        ORDER BY (st2.stop_sequence - st1.stop_sequence) ASC
        LIMIT 10`,
        [originStop.id, destStop.id]
      );

      const trips = Array.isArray(directResult) ? directResult : (directResult?.rows || []);

      console.log(`✓ Found ${trips.length} direct route options`);

      for (const trip of trips) {
        const parseTimeToSeconds = (timeStr: string): number => {
          if (!timeStr) return 0;
          const [hours, minutes, seconds] = timeStr.split(':').map(Number);
          return hours * 3600 + minutes * 60 + (seconds || 0);
        };

        const depTimeSeconds = parseTimeToSeconds(trip.departure_time);
        const arrTimeSeconds = parseTimeToSeconds(trip.arrival_time);
        const durationSeconds = arrTimeSeconds - depTimeSeconds;
        const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));

        const stopDifference = trip.dest_sequence - trip.origin_sequence;
        const distance = Math.max(0.5, stopDifference * 1.2);

        const route: RouteOption = {
          id: `${trip.route_id}_${trip.trip_id}`,
          name: trip.route_short_name || 'Útvonal',
          type: getTransitType(trip.route_type),
          stops: [originStop, destStop],
          duration: durationMinutes,
          distance: distance,
          transfers: 0,
          notes: `${originStop.name} → ${destStop.name}`,
        };

        routes.push(route);
      }
    } catch (error) {
      console.error('Error querying direct routes:', error);
    }

    if (routes.length === 0 && maxTransfers > 0) {
      console.log(`📡 Searching for routes with transfers using BFS (max ${maxTransfers} transfers)`);
      
      try {
        const transferPath = await findTransferPath(originStop.name, destStop.name, maxTransfers);

        if (transferPath) {
          console.log(`✓ Found route with ${transferPath.transfers} transfers via BFS`);

          const route: RouteOption = {
            id: `transfer_${originStop.id}_${destStop.id}`,
            name: transferPath.routeName,
            type: 'metro',
            stops: transferPath.stops,
            duration: transferPath.duration,
            transfers: transferPath.transfers,
            notes: `${originStop.name} → ${transferPath.stops.length > 2 ? `${transferPath.stops.length - 2} transfer(s)` : 'direct'} → ${destStop.name}`,
          };
          routes.push(route);
        }
      } catch (error) {
        console.error('Error searching routes with transfers:', error);
      }
    }

    return routes;
  } catch (error) {
    console.error('Error searching routes by stop names:', error);
    return [];
  }
}

function getTransitType(routeType: number): 'metro' | 'tram' | 'bus' | 'rail' {
  const types: { [key: number]: 'metro' | 'tram' | 'bus' | 'rail' } = {
    0: 'tram',
    1: 'metro',
    2: 'rail',
    3: 'bus',
  };
  return types[routeType] || 'bus';
}

export async function findRoutes(
  originName: string,
  destinationName: string,
  preferences?: {
    preferredTypes?: string[];
    allowTransfers?: boolean;
    maxTransfers?: number;
  }
): Promise<RouteSearchResult> {
  console.log(`🔍 Finding routes from "${originName}" to "${destinationName}"`);

  try {
    const maxTransfers = preferences?.maxTransfers ?? (preferences?.allowTransfers ? 3 : 0);
    const routes = await searchRoutesByStopNames(originName, destinationName, maxTransfers);

    console.log(`Got ${routes.length} routes from search`);

    let filtered = routes;
    if (preferences?.preferredTypes && preferences.preferredTypes.length > 0) {
      filtered = routes.filter((route) => preferences.preferredTypes!.includes(route.type));
      console.log(`Filtered to ${filtered.length} routes by type`);
    }

    // Sort by duration
    filtered.sort((a, b) => a.duration - b.duration);

    return {
      success: filtered.length > 0,
      routes: filtered.slice(0, 10),
      fromLocation: { name: originName },
      toLocation: { name: destinationName },
      timestamp: new Date().toISOString(),
      dataSource: 'Local SQLite Database',
    };
  } catch (error) {
    console.error('Error finding routes:', error);
    return {
      success: false,
      routes: [],
      fromLocation: { name: originName },
      toLocation: { name: destinationName },
      timestamp: new Date().toISOString(),
      dataSource: 'Error: ' + (error instanceof Error ? error.message : 'Unknown'),
    };
  }
}
