export enum ErrorCode {
  API_KEY_NOT_FOUND = 'api_key_not_found',
  DB_ERROR = 'db_error',
  CACHE_ERROR = 'cache_error',
  INVALID_PAYLOAD = 'invalid_payload',
  PERMISSION_ALREADY_EXISTS = 'permission_already_exists',
  PERMISSION_NOT_FOUND = 'permission_not_found',
  NATS_ERROR = 'nats_error',
  VALIDATION_ERROR = 'validation_error',
  INTERNAL_ERROR = 'internal_error'
}

export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export interface SuccessResponse {
  status: 'ok';
}

export interface CheckResponse {
  allowed: boolean;
}

export interface Permission {
  module: string;
  action: string;
}

export interface ListResponse {
  permissions: Permission[];
}

export interface GrantRequest {
  apiKey: string;
  module: string;
  action: string;
}

export interface RevokeRequest {
  apiKey: string;
  module: string;
  action: string;
}

export interface CheckRequest {
  apiKey: string;
  module: string;
  action: string;
}

export interface ListRequest {
  apiKey: string;
}
