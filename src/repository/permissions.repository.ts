import { pgPoolQuery } from '../database';
import { logger } from '../utils/logger';
import { ErrorCode, Permission, ModuleName, DatabaseRow } from '../types';

interface PermissionRow extends DatabaseRow {
  module: string;
  action: string;
}

export class PermissionsRepository {
  
  async grantPermission<M extends ModuleName>(
    apiKey: string, 
    module: M, 
    action: string
  ): Promise<void> {
    const query = `
      INSERT INTO permissions (api_key, module, action)
      VALUES ($1, $2, $3)
      ON CONFLICT (api_key, module, action) DO NOTHING
    `;
    
    try {
      await pgPoolQuery(query, [apiKey, module, action]);
      logger.info('Permission granted', { apiKey, module, action });
    } catch (error) {
      logger.error('Failed to grant permission', { apiKey, module, action, error });
      throw error;
    }
  }

  async revokePermission<M extends ModuleName>(
    apiKey: string, 
    module: M, 
    action: string
  ): Promise<void> {
    const query = `
      DELETE FROM permissions 
      WHERE api_key = $1 AND module = $2 AND action = $3
    `;
    
    try {
      const result = await pgPoolQuery(query, [apiKey, module, action]);
      if (result.rowCount === 0) {
        throw {
          code: ErrorCode.PERMISSION_NOT_FOUND,
          message: 'Permission not found'
        };
      }
      logger.info('Permission revoked', { apiKey, module, action });
    } catch (error) {
      logger.error('Failed to revoke permission', { apiKey, module, action, error });
      throw error;
    }
  }

  async checkPermission<M extends ModuleName>(
    apiKey: string, 
    module: M, 
    action: string
  ): Promise<boolean> {
    const query = `
      SELECT 1 FROM permissions 
      WHERE api_key = $1 AND module = $2 AND action = $3
      LIMIT 1
    `;
    
    try {
      const result = await pgPoolQuery(query, [apiKey, module, action]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error('Failed to check permission', { apiKey, module, action, error });
      throw error;
    }
  }

  async listPermissions(apiKey: string): Promise<Permission[]> {
    const query = `
      SELECT module, action 
      FROM permissions 
      WHERE api_key = $1
      ORDER BY module, action
    `;
    
    try {
      const result = await pgPoolQuery<PermissionRow>(query, [apiKey]);
      return result.rows.map((row) => ({
        module: row.module as ModuleName,
        action: row.action
      })) as Permission[];
    } catch (error) {
      logger.error('Failed to list permissions', { apiKey, error });
      throw error;
    }
  }
}