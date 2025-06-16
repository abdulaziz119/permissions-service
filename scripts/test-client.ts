import { PermissionsClient, ErrorCode } from '../src/client';

async function testPermissionsService() {
  let client: PermissionsClient | null = null;
  
  try {
    console.log('🚀 Starting Permissions Service Test...\n');
    
    // Create client
    console.log('📡 Connecting to NATS...');
    client = await PermissionsClient.create('nats://localhost:4222');
    console.log('✅ Connected to NATS\n');
    
    const testApiKey = 'test-key-' + Date.now();
    
    // Test 1: Grant permission
    console.log('🔐 Test 1: Grant permission');
    await client.grant({
      apiKey: testApiKey,
      module: 'trades',
      action: 'create'
    });
    console.log('✅ Permission granted successfully\n');
    
    // Test 2: Grant another permission
    console.log('🔐 Test 2: Grant another permission');
    await client.grant({
      apiKey: testApiKey,
      module: 'trades',
      action: 'create_manual'
    });
    console.log('✅ Second permission granted successfully\n');
    
    // Test 3: List permissions
    console.log('📋 Test 3: List permissions');
    const listResult = await client.list({ apiKey: testApiKey });
    console.log('✅ Permissions:', JSON.stringify(listResult.permissions, null, 2));
    console.log('');
    
    // Test 4: Check existing permission
    console.log('🔍 Test 4: Check existing permission');
    const checkResult1 = await client.check({
      apiKey: testApiKey,
      module: 'trades',
      action: 'create'
    });
    console.log('✅ Permission check result:', checkResult1.allowed);
    console.log('');
    
    // Test 5: Check non-existing permission
    console.log('🔍 Test 5: Check non-existing permission');
    const checkResult2 = await client.check({
      apiKey: testApiKey,
      module: 'trades',
      action: 'delete'
    });
    console.log('✅ Permission check result:', checkResult2.allowed);
    console.log('');
    
    // Test 6: Revoke permission
    console.log('❌ Test 6: Revoke permission');
    await client.revoke({
      apiKey: testApiKey,
      module: 'trades',
      action: 'create'
    });
    console.log('✅ Permission revoked successfully\n');
    
    // Test 7: List permissions after revoke
    console.log('📋 Test 7: List permissions after revoke');
    const listResult2 = await client.list({ apiKey: testApiKey });
    console.log('✅ Remaining permissions:', JSON.stringify(listResult2.permissions, null, 2));
    console.log('');
    
    // Test 8: Error handling - invalid payload
    console.log('⚠️  Test 8: Error handling - invalid payload');
    try {
      await client.grant({
        apiKey: '', // Invalid empty API key
        module: 'trades',
        action: 'create'
      });
    } catch (error: any) {
      console.log('✅ Caught expected error:', error.error?.code, '-', error.error?.message);
    }
    console.log('');
    
    // Test 9: Error handling - revoke non-existing permission
    console.log('⚠️  Test 9: Error handling - revoke non-existing permission');
    try {
      await client.revoke({
        apiKey: testApiKey,
        module: 'trades',
        action: 'delete' // Non-existing permission
      });
    } catch (error: any) {
      console.log('✅ Caught expected error:', error.error?.code, '-', error.error?.message);
    }
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
