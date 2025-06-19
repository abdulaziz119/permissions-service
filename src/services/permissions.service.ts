import { PermissionsRepository } from '../repository/permissions.repository';
import { CacheService } from './cache.service';
import { logger } from '../utils/logger';
import {
  ErrorCode, 
  GrantRequest, 
  RevokeRequest, 
  CheckRequest, 
  ListRequest,
  SuccessResponse,
  CheckResponse,
  ListResponse,
  ModuleName
} from '../types';

export class PermissionsService {
  private repository: PermissionsRepository;
  private cacheService: CacheService;

  constructor() {
    this.repository = new PermissionsRepository();
    this.cacheService = new CacheService();
  }

  async initialize(): Promise<void> {
    await this.cacheService.connect();
    logger.info('Permissions service initialized');
  }

  async grant<M extends ModuleName>(request: GrantRequest<M>): Promise<SuccessResponse> {
    try {
      this.validateRequest(request, ['apiKey', 'module', 'action']);
      
      const { apiKey, module, action } = request;
      
      // Grant permission in database
      await this.repository.grantPermission(apiKey, module, action);
      
      // Update cache
      await this.updateCache(apiKey);
      
      logger.info('Permission granted successfully', { apiKey, module, action });
      return { status: 'ok' };
    } catch (error) {
      logger.error('Failed to grant permission', { request, error });
      throw error;
    }
  }

  async revoke<M extends ModuleName>(request: RevokeRequest<M>): Promise<SuccessResponse> {
    try {
      this.validateRequest(request, ['apiKey', 'module', 'action']);
      
      const { apiKey, module, action } = request;
      
      // Revoke permission from database
      await this.repository.revokePermission(apiKey, module, action);
      
      // Update cache
      await this.updateCache(apiKey);
      
      logger.info('Permission revoked successfully', { apiKey, module, action });
      return { status: 'ok' };
    } catch (error) {
      logger.error('Failed to revoke permission', { request, error });
      throw error;
    }
  }

  async check<M extends ModuleName>(request: CheckRequest<M>): Promise<CheckResponse> {
    try {
      this.validateRequest(request, ['apiKey', 'module', 'action']);
      
      const { apiKey, module, action } = request;
      
      // Try to get from cache first
      const cachedPermissions = await this.cacheService.getPermissions(apiKey);
      
      if (cachedPermissions !== null) {
        const allowed = cachedPermissions.some(p => p.module === module && p.action === action);
        logger.info('Permission check from cache', { apiKey, module, action, allowed });
        return { allowed };
      }
      
      // Cache miss, check database and update cache
      const allowed = await this.repository.checkPermission(apiKey, module, action);
      await this.updateCache(apiKey);
      
      logger.info('Permission check from database', { apiKey, module, action, allowed });
      return { allowed };
    } catch (error) {
      logger.error('Failed to check permission', { request, error });
      throw error;
    }
  }

  async list(request: ListRequest): Promise<ListResponse> {
    try {
      this.validateRequest(request, ['apiKey']);
      
      const { apiKey } = request;
      
      // Try to get from cache first
      const cachedPermissions = await this.cacheService.getPermissions(apiKey);
      
      if (cachedPermissions !== null) {
        logger.info('Permissions list from cache', { apiKey, count: cachedPermissions.length });
        return { permissions: cachedPermissions };
      }
      
      // Cache miss, get from database and update cache
      const permissions = await this.repository.listPermissions(apiKey);
      await this.cacheService.setPermissions(apiKey, permissions);
      
      logger.info('Permissions list from database', { apiKey, count: permissions.length });
      return { permissions };
    } catch (error) {
      logger.error('Failed to list permissions', { request, error });
      throw error;
    }
  }

  private async updateCache(apiKey: string): Promise<void> {
    try {
      const permissions = await this.repository.listPermissions(apiKey);
      await this.cacheService.setPermissions(apiKey, permissions);
      logger.info('Cache updated', { apiKey, count: permissions.length });
    } catch (error) {
      logger.error('Failed to update cache', { apiKey, error });
      // Don't throw here, cache update failure shouldn't break the main operation
    }
  }

  private validateRequest(request: unknown, requiredFields: string[]): void {
    const req = request as Record<string, unknown>;
    for (const field of requiredFields) {
      if (!req[field] || typeof req[field] !== 'string' || (req[field] as string).trim() === '') {
        throw {
          code: ErrorCode.INVALID_PAYLOAD,
          message: `Missing or invalid field: ${field}`
        };
      }
    }
  }

  async close(): Promise<void> {
    await this.cacheService.close();
    logger.info('Permissions service closed');
  }
}
