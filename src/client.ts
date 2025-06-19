import { connect, NatsConnection, StringCodec } from 'nats';
import { 
  GrantRequest, 
  RevokeRequest, 
  CheckRequest, 
  ListRequest,
  SuccessResponse,
  CheckResponse,
  ListResponse,
  ErrorResponse,
  ModuleName,
  MODULES
} from './types';

export * from './types';

export class PermissionsClient {
  private natsConnection: NatsConnection;
  private codec = StringCodec();

  constructor(natsConnection: NatsConnection) {
    this.natsConnection = natsConnection;
  }

  static async create(natsUrl: string = 'nats://localhost:4222'): Promise<PermissionsClient> {
    const connection = await connect({ servers: natsUrl });
    return new PermissionsClient(connection);
  }

  // Strongly typed grant method that enforces module-action relationship
  async grant<M extends ModuleName>(request: GrantRequest<M>): Promise<SuccessResponse> {
    const response = await this.natsConnection.request(
      'permissions.grant',
      this.codec.encode(JSON.stringify(request)),
      { timeout: 5000 }
    );

    const result = JSON.parse(this.codec.decode(response.data));
    
    if (result.error) {
      throw result as ErrorResponse;
    }
    
    return result as SuccessResponse;
  }

  // Strongly typed revoke method
  async revoke<M extends ModuleName>(request: RevokeRequest<M>): Promise<SuccessResponse> {
    const response = await this.natsConnection.request(
      'permissions.revoke',
      this.codec.encode(JSON.stringify(request)),
      { timeout: 5000 }
    );

    const result = JSON.parse(this.codec.decode(response.data));
    
    if (result.error) {
      throw result as ErrorResponse;
    }
    
    return result as SuccessResponse;
  }

  // Strongly typed check method
  async check<M extends ModuleName>(request: CheckRequest<M>): Promise<CheckResponse> {
    const response = await this.natsConnection.request(
      'permissions.check',
      this.codec.encode(JSON.stringify(request)),
      { timeout: 5000 }
    );

    const result = JSON.parse(this.codec.decode(response.data));
    
    if (result.error) {
      throw result as ErrorResponse;
    }
    
    return result as CheckResponse;
  }

  async list(request: ListRequest): Promise<ListResponse> {
    const response = await this.natsConnection.request(
      'permissions.list',
      this.codec.encode(JSON.stringify(request)),
      { timeout: 5000 }
    );

    const result = JSON.parse(this.codec.decode(response.data));
    
    if (result.error) {
      throw result as ErrorResponse;
    }
    
    return result as ListResponse;
  }

  async close(): Promise<void> {
    await this.natsConnection.close();
  }
}

// Helper functions
export const createPermissionsClient = PermissionsClient.create;

export const isErrorResponse = (response: unknown): response is ErrorResponse => {
  return Boolean(
    response && 
    typeof response === 'object' && 
    'error' in response && 
    response.error &&
    typeof response.error === 'object' &&
    'code' in response.error && 
    'message' in response.error
  );
};

// Export module constants for easy usage
export { MODULES };
