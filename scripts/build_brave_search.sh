#!/bin/bash
# Build script for the brave-search MCP server

set -e  # Exit on error

# Get the server directory
SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../mcp-servers/brave-search" && pwd)"
echo "Building brave-search server in: $SERVER_DIR"

# Change to the server directory
cd "$SERVER_DIR"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the server
echo "Building server..."
npm run build

echo "Build complete!"