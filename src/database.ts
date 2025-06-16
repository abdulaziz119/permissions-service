import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { logger } from './utils/logger';
import { ErrorCode } from './types';

dotenv.config();

const pool = new Pool({
  database: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const pgPoolQuery = async (sql: string, params?: any[]): Promise<any> => {
  try {
    const result = await pool.query(sql, params);
    return result;
  } catch (error) {
    logger.error('Database query error', { sql, params, error });
    throw {
      code: ErrorCode.DB_ERROR,
      message: 'Database operation failed'
    };
  }
};

// Initialize database tables
export const initializeDatabase = async (): Promise<void> => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        module VARCHAR(255) NOT NULL,
        action VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(api_key, module, action)
      );
      CREATE INDEX IF NOT EXISTS idx_permissions_api_key ON permissions(api_key);
    `;
    
    await pgPoolQuery(createTableQuery);
    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database', { error });
    throw error;
  }
};

export { pool };