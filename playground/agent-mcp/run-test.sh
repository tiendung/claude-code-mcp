#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Run the test client
echo "Running tests..."
npx ts-node test-client.ts