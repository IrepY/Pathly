import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

// SQLite database configuration
const DB_PATH = path.join(__dirname, '../../data/pathly.db');
const DATA_DIR = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Create SQLite database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ SQLite database connected at:', DB_PATH);
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisified database functions
const dbRun = promisify(db.run.bind(db));
const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

/**
 * Initialize database schema if not exists
 */
async function initializeDatabase() {
  try {
    // Load schema
    const schemaPath = path.join(__dirname, '../../../database/init.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Split statements by semicolon, handling comments and multi-line statements
    let statements = schema
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => {
        // Remove empty statements and pure comment lines
        if (stmt.length === 0 || stmt.startsWith('--')) return false;
        // Keep CREATE, INSERT, CREATE TRIGGER, etc.
        return /^(CREATE|INSERT|UPDATE|DELETE|PRAGMA)/.test(stmt.toUpperCase());
      });

    for (const statement of statements) {
      try {
        await new Promise<void>((resolve, reject) => {
          db.run(statement, (err: Error | null) => {
            if (err) {
              if (err.message.includes('already exists')) {
                resolve(); // Silently ignore table exists errors
              } else {
                console.error('SQL Error:', err.message, 'Statement:', statement.substring(0, 50));
                resolve(); // Continue anyway
              }
            } else resolve();
          });
        });
      } catch (error) {
        console.log('Statement execution note:', (error as Error).message);
      }
    }

    console.log('✅ Database schema initialized');

    // Load seed data
    await loadSeedData();
  } catch (error) {
    console.error('⚠️ Database initialization error:', error);
  }
}

/**
 * Load seed data if needed
 */
async function loadSeedData() {
  try {
    // Check if data already exists
    const stopCount = await new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM stops', (err: Error | null, row: any) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      });
    });

    // If stops table is empty, load seed data
    if (stopCount === 0) {
      console.log('📊 Loading seed data...');
      const seedPath = path.join(__dirname, '../../../database/seed.sql');
      const seedData = fs.readFileSync(seedPath, 'utf-8');

      let seedStatements = seedData
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => {
          if (stmt.length === 0 || stmt.startsWith('--')) return false;
          return /^(INSERT|UPDATE|DELETE)/.test(stmt.toUpperCase());
        });

      for (const statement of seedStatements) {
        try {
          await new Promise<void>((resolve, reject) => {
            db.run(statement, (err: Error | null) => {
              if (err) {
                console.error('Seed SQL Error:', err.message);
                resolve(); // Continue anyway
              } else resolve();
            });
          });
        } catch (error) {
          console.log('Seed statement note:', (error as Error).message);
        }
      }

      console.log('✅ Seed data loaded successfully');
    } else {
      console.log('✅ Database already has data, skipping seed');
    }
  } catch (error) {
    console.error('⚠️ Seed data loading error:', error);
  }
}

/**
 * Execute a query with parameters
 */
export const query = async (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) reject(err);
        else resolve({ rows });
      });
    } else {
      db.run(sql, params, function (err: Error | null) {
        if (err) reject(err);
        else
          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
      });
    }
  });
};

/**
 * Get single row
 */
export const getRow = async (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: any) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

/**
 * Start a transaction
 */
export const startTransaction = async (): Promise<any> => {
  return query('BEGIN TRANSACTION');
};

/**
 * Commit a transaction
 */
export const commitTransaction = async (): Promise<any> => {
  return query('COMMIT');
};

/**
 * Rollback a transaction
 */
export const rollbackTransaction = async (): Promise<any> => {
  return query('ROLLBACK');
};

export default db;
