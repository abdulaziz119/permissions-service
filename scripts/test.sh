#!/bin/bash

# Test permissions.grant
echo "Testing permissions.grant..."
nats req permissions.grant '{"apiKey": "test-key-1", "module": "trades", "action": "create"}'

echo -e "\n"

# Test permissions.grant (duplicate)
echo "Testing permissions.grant (duplicate)..."
nats req permissions.grant '{"apiKey": "test-key-1", "module": "trades", "action": "create"}'

echo -e "\n"

# Test permissions.grant (another permission)
echo "Testing permissions.grant (another permission)..."
nats req permissions.grant '{"apiKey": "test-key-1", "module": "trades", "action": "create_manual"}'

echo -e "\n"

# Test permissions.list
echo "Testing permissions.list..."
nats req permissions.list '{"apiKey": "test-key-1"}'

echo -e "\n"

# Test permissions.check (existing permission)
echo "Testing permissions.check (existing permission)..."
nats req permissions.check '{"apiKey": "test-key-1", "module": "trades", "action": "create"}'

echo -e "\n"

# Test permissions.check (non-existing permission)
echo "Testing permissions.check (non-existing permission)..."
nats req permissions.check '{"apiKey": "test-key-1", "module": "trades", "action": "delete"}'

echo -e "\n"

# Test permissions.revoke
echo "Testing permissions.revoke..."
nats req permissions.revoke '{"apiKey": "test-key-1", "module": "trades", "action": "create"}'

echo -e "\n"

# Test permissions.list (after revoke)
echo "Testing permissions.list (after revoke)..."
nats req permissions.list '{"apiKey": "test-key-1"}'

echo -e "\n"

# Test permissions.revoke (non-existing permission)
echo "Testing permissions.revoke (non-existing permission)..."
nats req permissions.revoke '{"apiKey": "test-key-1", "module": "trades", "action": "delete"}'

echo -e "\n"

# Test invalid payload
echo "Testing invalid payload..."
nats req permissions.grant '{"apiKey": "", "module": "trades", "action": "create"}'

echo -e "\nTests completed!"
