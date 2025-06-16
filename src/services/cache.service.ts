import { connect, NatsConnection, KvEntry, KV } from 'nats';
import { logger } from '../utils/logger';
import { ErrorCode, Permission } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class CacheService {
  private natsConnection: NatsConnection | null = null;
  private kv: KV | null = null;
  private readonly bucketName = 'permissions_cache';

  async connect(): Promise<void> {
    try {
      this.natsConnection = await connect({
        servers: process.env.NATS_URL || 'nats://localhost:4222'
      });
      
      const js = this.natsConnection.jetstream();
      this.kv = await js.views.kv(this.bucketName, { history: 1 });
      
      logger.info('Connected to NATS KV store');
    } catch (error) {
      logger.error('Failed to connect to NATS KV store', { error });
      throw {
        code: ErrorCode.CACHE_ERROR,
        message: 'Failed to connect to cache'
      };
    }
  }

  async setPermissions(apiKey: string, permissions: Permission[]): Promise<void> {
    if (!this.kv) {
      throw {
        code: ErrorCode.CACHE_ERROR,
        message: 'Cache not initialized'
      };
    }

    try {
      const data = JSON.stringify(permissions);
      await this.kv.put(apiKey, data);
      logger.info('Permissions cached', { apiKey, count: permissions.length });
    } catch (error) {
      logger.error('Failed to cache permissions', { apiKey, error });
      throw {
        code: ErrorCode.CACHE_ERROR,
        message: 'Failed to cache permissions'
      };
    }
  }

  async getPermissions(apiKey: string): Promise<Permission[] | null> {
    if (!this.kv) {
      throw {
        code: ErrorCode.CACHE_ERROR,
        message: 'Cache not initialized'
      };
    }

    try {
      const entry: KvEntry | null = await this.kv.get(apiKey);
      if (!entry) {
        return null;
      }

      const data = new TextDecoder().decode(entry.value);
      const permissions: Permission[] = JSON.parse(data);
      logger.info('Permissions retrieved from cache', { apiKey, count: permissions.length });
      return permissions;
    } catch (error) {
      logger.error('Failed to get permissions from cache', { apiKey, error });
      return null; // Return null on cache miss or error
    }
  }

  async deletePermissions(apiKey: string): Promise<void> {
    if (!this.kv) {
      throw {
        code: ErrorCode.CACHE_ERROR,
        message: 'Cache not initialized'
      };
    }

    try {
      await this.kv.delete(apiKey);
      logger.info('Permissions removed from cache', { apiKey });
    } catch (error) {
      logger.error('Failed to delete permissions from cache', { apiKey, error });
      // Don't throw here, cache deletion is not critical
    }
  }

  async close(): Promise<void> {
    if (this.natsConnection) {
      await this.natsConnection.close();
      this.natsConnection = null;
      this.kv = null;
      logger.info('NATS connection closed');
    }
  }
}
