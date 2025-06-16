#!/bin/bash

echo "🚀 Starting Permissions Service Demo..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "📦 Starting PostgreSQL and NATS..."
docker-compose up -d postgres nats

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🏗️  Building the application..."
npm run build

echo "🚀 Starting the permissions service..."
npm start &
SERVICE_PID=$!

echo "⏳ Waiting for service to initialize..."
sleep 5

echo ""
echo "🧪 Running tests..."
npm run test:client

echo ""
echo "🛑 Stopping the service..."
kill $SERVICE_PID

echo "🧹 Cleaning up..."
docker-compose down

echo "✅ Demo completed!"
