import { Router } from 'express';
import { query } from '../config/database';

const router = Router();

// Debug endpoint - check database contents
router.get('/stops', async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) as count FROM stops');
    const stops = Array.isArray(result) ? result : (result?.rows || []);
    
    const stopList = await query('SELECT id, name, latitude, longitude FROM stops LIMIT 10');
    const stopData = Array.isArray(stopList) ? stopList : (stopList?.rows || []);
    
    res.json({
      stopCount: stops[0]?.count || 0,
      samples: stopData,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/routes', async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) as count FROM transit_routes');
    const routes = Array.isArray(result) ? result : (result?.rows || []);
    
    const routeList = await query('SELECT id, route_short_name, route_type FROM transit_routes LIMIT 10');
    const routeData = Array.isArray(routeList) ? routeList : (routeList?.rows || []);
    
    res.json({
      routeCount: routes[0]?.count || 0,
      samples: routeData,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/trips', async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) as count FROM trips');
    const trips = Array.isArray(result) ? result : (result?.rows || []);
    
    const tripList = await query('SELECT id, trip_id, route_id FROM trips LIMIT 10');
    const tripData = Array.isArray(tripList) ? tripList : (tripList?.rows || []);
    
    res.json({
      tripCount: trips[0]?.count || 0,
      samples: tripData,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/stop-times', async (req, res) => {
  try {
    const result = await query('SELECT COUNT(*) as count FROM stop_times');
    const stopTimes = Array.isArray(result) ? result : (result?.rows || []);
    
    const stopTimeList = await query('SELECT trip_id, stop_id, arrival_time, departure_time, stop_sequence FROM stop_times LIMIT 10');
    const stopTimeData = Array.isArray(stopTimeList) ? stopTimeList : (stopTimeList?.rows || []);
    
    res.json({
      stopTimeCount: stopTimes[0]?.count || 0,
      samples: stopTimeData,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Test direct route query
router.get('/test-route-query', async (req, res) => {
  try {
    // Check if M1_godoll1 exists
    const m1Result = await query('SELECT id, trip_id FROM trips WHERE trip_id = ?', ['M1_godoll1']);
    const m1Data = Array.isArray(m1Result) ? m1Result : (m1Result?.rows || []);
    
    // Get stop IDs for Keleti pályaudvar and Deák Ferenc tér (reversed)
    const originResult = await query('SELECT id FROM stops WHERE name = ? LIMIT 1', ['Keleti pályaudvar']);
    const destResult = await query('SELECT id FROM stops WHERE name = ? LIMIT 1', ['Deák Ferenc tér']);
    
    const originStops = Array.isArray(originResult) ? originResult : (originResult?.rows || []);
    const destStops = Array.isArray(destResult) ? destResult : (destResult?.rows || []);
    
    if (originStops.length === 0 || destStops.length === 0) {
      return res.json({ error: 'Stops not found', originFound: originStops.length > 0, destFound: destStops.length > 0 });
    }
    
    const originId = originStops[0].id;
    const destId = destStops[0].id;
    
    // First, check if there are stop_times for these stops
    const st1Result = await query('SELECT id, trip_id, stop_sequence FROM stop_times WHERE stop_id = ? LIMIT 10', [originId]);
    const st1Data = Array.isArray(st1Result) ? st1Result : (st1Result?.rows || []);
    
    const st2Result = await query('SELECT id, trip_id, stop_sequence FROM stop_times WHERE stop_id = ? LIMIT 10', [destId]);
    const st2Data = Array.isArray(st2Result) ? st2Result : (st2Result?.rows || []);
    
    // Run the direct route query
    const routeResult = await query(
      `SELECT DISTINCT
        tr.id as route_id,
        tr.route_short_name,
        tr.route_type,
        t.id as trip_id,
        t.trip_id as trip_name,
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
      [originId, destId]
    );
    
    const routes = Array.isArray(routeResult) ? routeResult : (routeResult?.rows || []);
    
    res.json({
      m1GodollExists: m1Data.length > 0,
      m1Data,
      originId,
      destId,
      st1Count: st1Data.length,
      st1Samples: st1Data,
      st2Count: st2Data.length,
      st2Samples: st2Data,
      routesFound: routes.length,
      routes,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Debug endpoint - trace the search function
router.get('/trace-search', async (req, res) => {
  try {
    const { searchRoutesByStopNames } = await import('../services/routeSearchService');
    
    console.log('🔍 DEBUG: Calling searchRoutesByStopNames...');
    const routes = await searchRoutesByStopNames('Keleti pályaudvar', 'Deák Ferenc tér', 3);
    console.log('✓ DEBUG: searchRoutesByStopNames returned', routes.length, 'routes');
    
    res.json({
      routesFound: routes.length,
      routes,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message, stack: (error as Error).stack });
  }
});

// Debug endpoint - trace findRoutes function
router.get('/trace-find-routes', async (req, res) => {
  try {
    const { findRoutes } = await import('../services/routeSearchService');
    
    console.log('🔍 DEBUG: Calling findRoutes...');
    const result = await findRoutes('Keleti pályaudvar', 'Deák Ferenc tér', {
      preferredTypes: ['metro', 'tram', 'bus'],
      allowTransfers: true,
      maxTransfers: 3,
    });
    console.log('✓ DEBUG: findRoutes returned', result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message, stack: (error as Error).stack });
  }
});

// Test POST endpoint that mimics the search API
router.post('/test-search', async (req, res) => {
  try {
    const { originName, destinationName, maxTransfers = 3, preferredTypes } = req.body;
    
    console.log('🔍 /test-search called');
    console.log('  originName:', originName);
    console.log('  destinationName:', destinationName);
    
    // Test database connection directly
    const testQuery = await query('SELECT COUNT(*) as count FROM stops');
    const testCount = Array.isArray(testQuery) ? testQuery : (testQuery?.rows || []);
    console.log('✓ Database test count:', testCount[0]?.count);
    
    // Try to find the stop directly
    const stopResult = await query('SELECT * FROM stops WHERE name = ? LIMIT 1', [originName]);
    const stops = Array.isArray(stopResult) ? stopResult : (stopResult?.rows || []);
    console.log('✓ Direct query for origin found:', stops.length, 'stops');
    
    const { findRoutes } = await import('../services/routeSearchService');
    
    const result = await findRoutes(
      originName.trim(),
      destinationName.trim(),
      {
        preferredTypes: preferredTypes || ['metro', 'tram', 'bus'],
        allowTransfers: maxTransfers > 0,
        maxTransfers: maxTransfers,
      }
    );

    console.log('✓ /test-search result:', result);

    res.json({
      success: result.success,
      routes: result.routes,
      count: result.routes.length,
      debug: {
        stopFound: stops.length,
        stopDetails: stops[0] || null,
        queryResult: result,
      },
      fromLocation: result.fromLocation,
      toLocation: result.toLocation,
      dataSource: result.dataSource,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: (error as Error).message, stack: (error as Error).stack });
  }
});

// Debug endpoint - test transfer routes
router.get('/test-transfers', async (req, res) => {
  try {
    // Get trip 2 details (Keleti -> Nyugati)
    const trip2 = await query(
      `SELECT st.stop_id, s.name, st.stop_sequence FROM stop_times st
       JOIN stops s ON st.stop_id = s.id
       WHERE st.trip_id = 2
       ORDER BY st.stop_sequence`
    );
    const trip2Stops = Array.isArray(trip2) ? trip2 : (trip2?.rows || []);

    // Get trip 4 details (Blaha -> Közétető)
    const trip4 = await query(
      `SELECT st.stop_id, s.name, st.stop_sequence FROM stop_times st
       JOIN stops s ON st.stop_id = s.id
       WHERE st.trip_id = 4
       ORDER BY st.stop_sequence`
    );
    const trip4Stops = Array.isArray(trip4) ? trip4 : (trip4?.rows || []);

    res.json({
      trip2: trip2Stops,
      trip4: trip4Stops,
      commonStops: trip2Stops
        .filter((s: any) => trip4Stops.some((t: any) => t.stop_id === s.stop_id))
        .map((s: any) => ({ id: s.stop_id, name: s.name })),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;

// Helper endpoint to manually insert missing M1_godoll1 trip and its stop_times
router.post('/fix-m1-godoll1', async (req, res) => {
  try {
    // First, insert the M1_godoll1 trip
    await query(
      'INSERT OR IGNORE INTO trips (trip_id, route_id, service_id, trip_headsign, direction_id, wheelchair_accessible) VALUES (?, ?, ?, ?, ?, ?)',
      ['M1_godoll1', 1, 'weekday', 'Gödöllő', 0, 1]
    );
    
    // Get the trip ID
    const tripResult = await query('SELECT id FROM trips WHERE trip_id = ?', ['M1_godoll1']);
    const trips = Array.isArray(tripResult) ? tripResult : (tripResult?.rows || []);
    
    if (trips.length === 0) {
      return res.status(400).json({ error: 'Failed to insert M1_godoll1 trip' });
    }
    
    const tripId = trips[0].id;
    
    // Get stop IDs
    const stops = [
      { stop_id: 'M1_Vorosmarty', seq: 1 },
      { stop_id: 'M1_NyugPaly', seq: 2 },
      { stop_id: 'M1_Deakferen', seq: 3 },
      { stop_id: 'M1_Astoria', seq: 4 },
      { stop_id: 'M1_BlahL', seq: 5 },
      { stop_id: 'M1_KelPaly', seq: 6 },
      { stop_id: 'M1_Godollo', seq: 7 },
    ];
    
    const stopIds: { [key: string]: number } = {};
    for (const stop of stops) {
      const stopResult = await query('SELECT id FROM stops WHERE stop_id = ?', [stop.stop_id]);
      const stopData = Array.isArray(stopResult) ? stopResult : (stopResult?.rows || []);
      if (stopData.length > 0) {
        stopIds[stop.stop_id] = stopData[0].id;
      }
    }
    
    // Insert stop_times
    const stopTimes = [
      { stop_id: 'M1_Vorosmarty', seq: 1, arr: '07:00:00', dep: '07:00:00' },
      { stop_id: 'M1_NyugPaly', seq: 2, arr: '07:05:00', dep: '07:05:00' },
      { stop_id: 'M1_Deakferen', seq: 3, arr: '07:10:00', dep: '07:10:00' },
      { stop_id: 'M1_Astoria', seq: 4, arr: '07:15:00', dep: '07:15:00' },
      { stop_id: 'M1_BlahL', seq: 5, arr: '07:20:00', dep: '07:20:00' },
      { stop_id: 'M1_KelPaly', seq: 6, arr: '07:25:00', dep: '07:25:00' },
      { stop_id: 'M1_Godollo', seq: 7, arr: '07:35:00', dep: '07:35:00' },
    ];
    
    for (const st of stopTimes) {
      if (stopIds[st.stop_id]) {
        await query(
          'INSERT OR IGNORE INTO stop_times (trip_id, arrival_time, departure_time, stop_id, stop_sequence) VALUES (?, ?, ?, ?, ?)',
          [tripId, st.arr, st.dep, stopIds[st.stop_id], st.seq]
        );
      }
    }
    
    res.json({ success: true, message: 'M1_godoll1 trip and stop_times inserted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/bfs-debug/:originName/:destName', async (req, res) => {
  try {
    const { originName, destName } = req.params;
    
    // Get all stops
    const allStopsResult = await query('SELECT id, name FROM stops ORDER BY name');
    const allStops = Array.isArray(allStopsResult) ? allStopsResult : (allStopsResult?.rows || []);
    
    console.log(`[DEBUG] Total stops in DB: ${allStops.length}`);
    
    // Create map
    const stopNameToIds = new Map<string, number[]>();
    for (const stop of allStops) {
      if (!stopNameToIds.has(stop.name)) {
        stopNameToIds.set(stop.name, []);
      }
      stopNameToIds.get(stop.name)!.push(stop.id);
    }
    
    const originIds = stopNameToIds.get(originName) || [];
    const destIds = stopNameToIds.get(destName) || [];
    
    console.log(`[DEBUG] Origin "${originName}" IDs: ${originIds.join(', ')}`);
    console.log(`[DEBUG] Destination "${destName}" IDs: ${destIds.join(', ')}`);
    
    // Check stop_times for origin
    const originStopTimesResult = await query(
      `SELECT st.id, st.trip_id, st.stop_id, st.stop_sequence, t.route_id, tr.route_short_name
       FROM stop_times st
       JOIN trips t ON st.trip_id = t.id
       JOIN transit_routes tr ON t.route_id = tr.id
       WHERE st.stop_id IN (${originIds.join(',')})
       LIMIT 20`,
      []
    );
    const originStopTimes = Array.isArray(originStopTimesResult) ? originStopTimesResult : (originStopTimesResult?.rows || []);
    console.log(`[DEBUG] Origin stop_times entries: ${originStopTimes.length}`);
    
    // For each origin stop, check what's reachable
    const reachableStops = [];
    for (const originId of originIds) {
      const nextResult = await query(
        `SELECT DISTINCT s2.id, s2.name, tr.route_short_name
         FROM stop_times st1
         JOIN stop_times st2 ON st1.trip_id = st2.trip_id
         JOIN stops s2 ON st2.stop_id = s2.id
         JOIN trips t ON st1.trip_id = t.id
         JOIN transit_routes tr ON t.route_id = tr.id
         WHERE st1.stop_id = ? AND st2.stop_sequence > st1.stop_sequence
         LIMIT 20`,
        [originId]
      );
      const nextStops = Array.isArray(nextResult) ? nextResult : (nextResult?.rows || []);
      console.log(`[DEBUG] From stop ID ${originId}: ${nextStops.length} reachable stops`);
      reachableStops.push({ originId, reachable: nextStops });
    }
    
    res.json({
      originName,
      destName,
      originIds,
      destIds,
      originStopTimesCount: originStopTimes.length,
      originStopTimesSample: originStopTimes.slice(0, 5),
      reachableByOriginId: reachableStops,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/full-db-info', async (req, res) => {
  try {
    // Get all stops
    const stopsResult = await query('SELECT id, name FROM stops ORDER BY id');
    const stops = Array.isArray(stopsResult) ? stopsResult : (stopsResult?.rows || []);

    // Get all trips
    const tripsResult = await query('SELECT id, trip_id, route_id FROM trips ORDER BY id');
    const trips = Array.isArray(tripsResult) ? tripsResult : (tripsResult?.rows || []);

    // Get all stop_times
    const stopTimesResult = await query(
      `SELECT st.id, st.trip_id, st.stop_id, st.stop_sequence, s.name
       FROM stop_times st
       JOIN stops s ON st.stop_id = s.id
       ORDER BY st.trip_id, st.stop_sequence`
    );
    const stopTimes = Array.isArray(stopTimesResult) ? stopTimesResult : (stopTimesResult?.rows || []);

    // Group stop_times by trip
    const stopTimesByTrip: { [key: number]: any[] } = {};
    for (const st of stopTimes) {
      if (!stopTimesByTrip[st.trip_id]) {
        stopTimesByTrip[st.trip_id] = [];
      }
      stopTimesByTrip[st.trip_id].push(st);
    }

    res.json({
      stopCount: stops.length,
      stops: stops,
      tripCount: trips.length,
      trips: trips,
      stopTimesCount: stopTimes.length,
      stopTimesByTrip: stopTimesByTrip,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
