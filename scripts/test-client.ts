import { PermissionsClient, ErrorCode, MODULES } from '../src/client';

async function testPermissionsService() {
  let client: PermissionsClient | null = null;
  
  try {
    console.log('🚀 Starting Typed Permissions Service Test...\n');
    
    // Create client
    console.log('📡 Connecting to NATS...');
    client = await PermissionsClient.create('nats://localhost:4222');
    console.log('✅ Connected to NATS\n');
    
    const testApiKey = 'test-key-' + Date.now();
    
    // Test 1: Grant permission for TRADES module with correct action
    console.log('🔐 Test 1: Grant TRADES.create permission (valid)');
    await client.grant({
      apiKey: testApiKey,
      module: MODULES.TRADES,
      action: 'create' // This is valid for TRADES module
    });
    console.log('✅ Permission granted successfully\n');
    
    // Test 2: Grant another valid permission for TRADES
    console.log('🔐 Test 2: Grant TRADES.create_manual permission (valid)');
    await client.grant({
      apiKey: testApiKey,
      module: MODULES.TRADES,
      action: 'create_manual' // This is also valid for TRADES
    });
    console.log('✅ Permission granted successfully\n');
    
    // Test 3: Grant permission for INVENTORY module
    console.log('🔐 Test 3: Grant INVENTORY.read permission (valid)');
    await client.grant({
      apiKey: testApiKey,
      module: MODULES.INVENTORY,
      action: 'read' // Valid for INVENTORY module
    });
    console.log('✅ Permission granted successfully\n');
    
    // Test 4: Try to grant invalid action for TRADES module
    console.log('⚠️  Test 4: Try to grant TRADES.read permission (should cause TypeScript error)');
    console.log('📝 Note: This would cause TypeScript compile error if uncommented:');
    console.log('   // client.grant({ apiKey: testApiKey, module: MODULES.TRADES, action: "read" });');
    console.log('   // Error: Argument of type \'"read"\' is not assignable to parameter...\n');
    
    // Test 5: List permissions
    console.log('📋 Test 5: List all permissions');
    const listResult = await client.list({ apiKey: testApiKey });
    console.log('✅ Permissions:', JSON.stringify(listResult.permissions, null, 2));
    console.log('');
    
    // Test 6: Check existing permission
    console.log('🔍 Test 6: Check TRADES.create permission');
    const checkResult1 = await client.check({
      apiKey: testApiKey,
      module: MODULES.TRADES,
      action: 'create'
    });
    console.log('✅ Permission check result:', checkResult1.allowed);
    console.log('');
    
    // Test 7: Check non-existing permission (but valid combination)
    console.log('🔍 Test 7: Check INVENTORY.delete permission (not granted)');
    const checkResult2 = await client.check({
      apiKey: testApiKey,
      module: MODULES.INVENTORY,
      action: 'delete' // Valid action for INVENTORY but not granted
    });
    console.log('✅ Permission check result:', checkResult2.allowed);
    console.log('');
    
    // Test 8: Revoke permission
    console.log('❌ Test 8: Revoke TRADES.create permission');
    await client.revoke({
      apiKey: testApiKey,
      module: MODULES.TRADES,
      action: 'create'
    });
    console.log('✅ Permission revoked successfully\n');
    
    // Test 9: List permissions after revoke
    console.log('📋 Test 9: List permissions after revoke');
    const listResult2 = await client.list({ apiKey: testApiKey });
    console.log('✅ Remaining permissions:', JSON.stringify(listResult2.permissions, null, 2));
    console.log('');
    
    // Test 10: Error handling - invalid payload
    console.log('⚠️  Test 10: Error handling - invalid payload');
    try {
      await client.grant({
        apiKey: '', // Invalid empty API key
        module: MODULES.TRADES,
        action: 'create'
      });
    } catch (error: unknown) {
      const err = error as { error?: { code: string; message: string } };
      console.log('✅ Caught expected error:', err.error?.code, '-', err.error?.message);
    }
    console.log('');
    
    // Test 11: Error handling - revoke non-existing permission
    console.log('⚠️  Test 11: Error handling - revoke non-existing permission');
    try {
      await client.revoke({
        apiKey: testApiKey,
        module: MODULES.INVENTORY,
        action: 'delete' // Valid but not granted
      });
    } catch (error: unknown) {
      const err = error as { error?: { code: string; message: string } };
      console.log('✅ Caught expected error:', err.error?.code, '-', err.error?.message);
    }
    console.log('');
    
    console.log('🎯 TypeScript Validation Examples:');
    console.log('✅ Valid combinations that TypeScript allows:');
    console.log('   - TRADES: create, create_manual');
    console.log('   - INVENTORY: create, read, update, delete');
    console.log('   - ORDERS: create, read, update, cancel');
    console.log('   - REPORTS: read, export');
    console.log('');
    console.log('❌ Invalid combinations TypeScript prevents:');
    console.log('   - TRADES: read, update, delete (compile error)');
    console.log('   - INVENTORY: create_manual, cancel (compile error)');
    console.log('   - etc...');
    console.log('');
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

// Run tests
testPermissionsService().catch(console.error);
