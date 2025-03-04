#!/bin/bash

# Run the test client for the Research Papers MCP Server
cd "$(dirname "$0")/.."

# Make sure the project is built
echo "Building project..."
npm run build

# Run the test client
echo "Starting test client..."
node --loader ts-node/esm testing/test_client.ts