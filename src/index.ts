import { NatsRpcServer } from './services/nats-rpc.server';
import { initializeDatabase } from './database';
import { logger } from './utils/logger';

class Application {
  private natsRpcServer: NatsRpcServer;

  constructor() {
    this.natsRpcServer = new NatsRpcServer();
  }

  async start(): Promise<void> {
    try {
      logger.info('Starting Permissions Service...');

      // Initialize database
      await initializeDatabase();
      
      // Start NATS RPC server
      await this.natsRpcServer.start();

      logger.info('Permissions Service started successfully');

      // Handle graceful shutdown
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());
    } catch (error) {
      logger.error('Failed to start application', { error });
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down Permissions Service...');
    
    try {
      await this.natsRpcServer.stop();
      logger.info('Permissions Service stopped successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  }
}

// Start the application
const app = new Application();
app.start().catch((error) => {
  logger.error('Failed to start application', { error });
  process.exit(1);
});
