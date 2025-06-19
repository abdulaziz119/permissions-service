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

// Module definitions with their allowed actions
export const MODULES = {
  TRADES: 'trades',
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  REPORTS: 'reports'
} as const;

export const ACTIONS = {
  TRADES: ['create', 'create_manual'] as const,
  INVENTORY: ['create', 'read', 'update', 'delete'] as const,
  ORDERS: ['create', 'read', 'update', 'cancel'] as const,
  REPORTS: ['read', 'export'] as const
} as const;

// Type definitions for modules and actions
export type ModuleName = typeof MODULES[keyof typeof MODULES];
export type TradesActions = typeof ACTIONS.TRADES[number];
export type InventoryActions = typeof ACTIONS.INVENTORY[number];
export type OrdersActions = typeof ACTIONS.ORDERS[number];
export type ReportsActions = typeof ACTIONS.REPORTS[number];

// Union type for all possible actions
export type ActionName = TradesActions | InventoryActions | OrdersActions | ReportsActions;

// Conditional type that maps modules to their allowed actions
export type ModuleActionMap = {
  [MODULES.TRADES]: TradesActions;
  [MODULES.INVENTORY]: InventoryActions;
  [MODULES.ORDERS]: OrdersActions;
  [MODULES.REPORTS]: ReportsActions;
};

// Generic permission type that enforces module-action relationship
export interface Permission<M extends ModuleName = ModuleName> {
  module: M;
  action: M extends keyof ModuleActionMap ? ModuleActionMap[M] : never;
}

// Response interfaces
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

export interface ListResponse<M extends ModuleName = ModuleName> {
  permissions: Permission<M>[];
}

// Request interfaces with proper typing
export interface GrantRequest<M extends ModuleName = ModuleName> {
  apiKey: string;
  module: M;
  action: M extends keyof ModuleActionMap ? ModuleActionMap[M] : never;
}

export interface RevokeRequest<M extends ModuleName = ModuleName> {
  apiKey: string;
  module: M;
  action: M extends keyof ModuleActionMap ? ModuleActionMap[M] : never;
}

export interface CheckRequest<M extends ModuleName = ModuleName> {
  apiKey: string;
  module: M;
  action: M extends keyof ModuleActionMap ? ModuleActionMap[M] : never;
}

export interface ListRequest {
  apiKey: string;
}

// Helper type for database row mapping
export interface DatabaseRow {
  [key: string]: unknown;
}

// Generic database result type
export interface QueryResult<T = DatabaseRow> {
  rows: T[];
  rowCount: number;
}
