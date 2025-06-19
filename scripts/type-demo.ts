// This file demonstrates TypeScript compilation errors
// when using invalid module-action combinations

import { PermissionsClient, MODULES } from '../src/client';

async function demonstrateTypeErrors() {
  const client = await PermissionsClient.create();
  
  // ❌ This should cause TypeScript compilation error:
  // await client.grant({
  //   apiKey: 'test',
  //   module: MODULES.TRADES,
  //   action: 'read' // Error: 'read' is not assignable to TRADES actions
  // });
  
  // ❌ This should also cause compilation error:
  // await client.grant({
  //   apiKey: 'test', 
  //   module: MODULES.INVENTORY,
  //   action: 'create_manual' // Error: 'create_manual' is not available for INVENTORY
  // });
  
  // ✅ These are valid:
  await client.grant({
    apiKey: 'test',
    module: MODULES.TRADES,
    action: 'create' // ✅ Valid for TRADES
  });
  
  await client.grant({
    apiKey: 'test',
    module: MODULES.INVENTORY, 
    action: 'read' // ✅ Valid for INVENTORY
  });
}

export { demonstrateTypeErrors };
