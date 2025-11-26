import { Pool, PoolClient } from 'pg';
import config from './index';

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const getConnection = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const startTransaction = async (): Promise<PoolClient> => {
  const client = await pool.connect();
  await client.query('BEGIN');
  return client;
};

export default pool;
