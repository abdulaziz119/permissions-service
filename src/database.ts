import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  max: 9999,
  idleTimeoutMillis: 30000
});

export const pgPoolQuery = (sql: string, params?: any) => {
  return pool.query(sql, params);
};