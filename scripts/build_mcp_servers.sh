#!/bin/bash
# Script to build all local MCP servers

set -e  # Exit on error

MCP_LOCAL_PATH="$HOME/dev/claude-code/mcp-servers"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Building all MCP servers in: $MCP_LOCAL_PATH"

# Check if the directory exists
if [ ! -d "$MCP_LOCAL_PATH" ]; then
  echo "Error: MCP servers directory not found at $MCP_LOCAL_PATH"
  exit 1
fi

# Build TypeScript/JavaScript servers
echo "Building TypeScript/JavaScript servers..."

# Install dependencies in the root directory first
echo "Installing root dependencies..."
cd "$MCP_LOCAL_PATH"
npm install

# Build all TypeScript servers with available package.json files
for server_dir in $(find "$MCP_LOCAL_PATH" -maxdepth 1 -type d -not -path "$MCP_LOCAL_PATH"); do
  if [ -f "$server_dir/package.json" ]; then
    server_name=$(basename "$server_dir")
    echo "Building $server_name server..."
    
    cd "$server_dir"
    npm install
    npm run build
    
    echo "$server_name server built successfully!"
  fi
done

# Build Python servers
echo "Building Python servers..."
# For Python, we'd typically install dependencies
# This section will be expanded as we implement Python servers

echo "All MCP servers built successfully!"