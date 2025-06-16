import { connect, NatsConnection, StringCodec } from 'nats';
import { PermissionsService } from '../services/permissions.service';
import { logger } from '../utils/logger';
import { ErrorCode, ErrorResponse } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

export class NatsRpcServer {
  private natsConnection: NatsConnection | null = null;
  private permissionsService: PermissionsService;
  private codec = StringCodec();

  constructor() {
    this.permissionsService = new PermissionsService();
  }

  async start(): Promise<void> {
    try {
      // Connect to NATS
      this.natsConnection = await connect({
        servers: process.env.NATS_URL || 'nats://localhost:4222'
      });

      // Initialize permissions service
      await this.permissionsService.initialize();

      // Subscribe to RPC subjects
      this.setupSubscriptions();

      logger.info('NATS RPC server started successfully');
    } catch (error) {
      logger.error('Failed to start NATS RPC server', { error });
      throw error;
    }
  }

  private setupSubscriptions(): void {
    if (!this.natsConnection) return;

    // permissions.grant
    this.natsConnection.subscribe('permissions.grant', {
      callback: async (err, msg) => {
        if (err) {
          logger.error('Error in permissions.grant subscription', { error: err });
          return;
        }

        try {
          const request = JSON.parse(this.codec.decode(msg.data));
          logger.info('Received grant request', { request });
          
          const response = await this.permissionsService.grant(request);
          msg.respond(this.codec.encode(JSON.stringify(response)));
        } catch (error) {
          const errorResponse = this.createErrorResponse(error);
          msg.respond(this.codec.encode(JSON.stringify(errorResponse)));
        }
      }
    });

    // permissions.revoke
    this.natsConnection.subscribe('permissions.revoke', {
      callback: async (err, msg) => {
        if (err) {
          logger.error('Error in permissions.revoke subscription', { error: err });
          return;
        }

        try {
          const request = JSON.parse(this.codec.decode(msg.data));
          logger.info('Received revoke request', { request });
          
          const response = await this.permissionsService.revoke(request);
          msg.respond(this.codec.encode(JSON.stringify(response)));
        } catch (error) {
          const errorResponse = this.createErrorResponse(error);
          msg.respond(this.codec.encode(JSON.stringify(errorResponse)));
        }
      }
    });

    // permissions.check
    this.natsConnection.subscribe('permissions.check', {
      callback: async (err, msg) => {
        if (err) {
          logger.error('Error in permissions.check subscription', { error: err });
          return;
        }

        try {
          const request = JSON.parse(this.codec.decode(msg.data));
          logger.info('Received check request', { request });
          
          const response = await this.permissionsService.check(request);
          msg.respond(this.codec.encode(JSON.stringify(response)));
        } catch (error) {
          const errorResponse = this.createErrorResponse(error);
          msg.respond(this.codec.encode(JSON.stringify(errorResponse)));
        }
      }
    });

    // permissions.list
    this.natsConnection.subscribe('permissions.list', {
      callback: async (err, msg) => {
        if (err) {
          logger.error('Error in permissions.list subscription', { error: err });
          return;
        }

        try {
          const request = JSON.parse(this.codec.decode(msg.data));
          logger.info('Received list request', { request });
          
          const response = await this.permissionsService.list(request);
          msg.respond(this.codec.encode(JSON.stringify(response)));
        } catch (error) {
          const errorResponse = this.createErrorResponse(error);
          msg.respond(this.codec.encode(JSON.stringify(errorResponse)));
        }
      }
    });

    logger.info('RPC subscriptions set up successfully');
  }

  private createErrorResponse(error: any): ErrorResponse {
    if (error && error.code && error.message) {
      return {
        error: {
          code: error.code,
          message: error.message
        }
      };
    }

    logger.error('Unexpected error', { error });
    return {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error'
      }
    };
  }

  async stop(): Promise<void> {
    if (this.natsConnection) {
      await this.permissionsService.close();
      await this.natsConnection.close();
      this.natsConnection = null;
      logger.info('NATS RPC server stopped');
    }
  }
}
