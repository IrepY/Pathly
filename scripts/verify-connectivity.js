#!/usr/bin/env node

/**
 * Connectivity Verification Script
 * Checks that every stop is reachable from every other stop
 */

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../backend/data/pathly.db');

async function checkConnectivity() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Database error:', err.message);
        reject(err);
        return;
      }

      // Get all stops
      db.all('SELECT id FROM stops', (err, stops) => {
        if (err) {
          console.error('❌ Error fetching stops:', err);
          reject(err);
          return;
        }

        console.log(`📊 Checking connectivity for ${stops.length} stops...`);

        // Build adjacency list from trips
        const adj = new Map();
        stops.forEach(row => adj.set(row.id, new Set()));

        db.all(
          `SELECT DISTINCT st1.stop_id, st2.stop_id
           FROM stop_times st1
           JOIN stop_times st2 ON st1.trip_id = st2.trip_id
           WHERE st1.stop_id != st2.stop_id`,
          (err, edges) => {
            if (err) {
              console.error('❌ Error fetching edges:', err);
              reject(err);
              return;
            }

            edges.forEach(edge => {
              adj.get(edge.stop_id)?.add(edge.stop_id_1);
              adj.get(edge.stop_id_1)?.add(edge.stop_id);
            });

            // BFS from each stop
            let fullyConnected = true;
            let disconnectedPairs = [];

            for (const startStop of stops) {
              const visited = new Set();
              const queue = [startStop.id];

              while (queue.length > 0) {
                const current = queue.shift();
                if (!visited.has(current)) {
                  visited.add(current);
                  const neighbors = adj.get(current) || new Set();
                  for (const neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                      queue.push(neighbor);
                    }
                  }
                }
              }

              if (visited.size !== stops.length) {
                fullyConnected = false;
                const unreachable = stops.filter(s => !visited.has(s.id));
                console.log(`⚠️  From stop ${startStop.id}: Cannot reach ${unreachable.length} stops`);
                unreachable.forEach(s => disconnectedPairs.push(`${startStop.id} → ${s.id}`));
              }
            }

            if (fullyConnected) {
              console.log('✅ SUCCESS: All stops are reachable from all other stops!');
              console.log('🎯 Network is fully connected with transfers support.');
            } else {
              console.log(`❌ FAILURE: Found ${disconnectedPairs.length} unreachable pairs`);
              console.log('First 10 disconnected pairs:', disconnectedPairs.slice(0, 10));
            }

            db.close();
            resolve({ success: fullyConnected, disconnected: disconnectedPairs.length });
          }
        );
      });
    });
  });
}

checkConnectivity()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
