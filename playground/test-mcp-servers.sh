#!/bin/bash

# Script to test the claude-chat and docker MCP servers using the MCP Test Client

set -e

echo "=== Testing MCP Servers with MCP Test Client ==="
echo

# Ensure required environment variables
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: ANTHROPIC_API_KEY environment variable is required for Claude Chat MCP testing"
  exit 1
fi

# Create necessary directories
mkdir -p logs

# Build claude-chat-mcp if needed
echo "Building Claude Chat MCP server..."
cd playground/claude-chat-mcp
npm run build
cd ../..

# Create a JSON input file for testing
cat > test_config.json << EOF
{
  "claude_chat": {
    "name": "claude-chat",
    "source_path": "/Users/williambrown/dev/claude-code/playground/claude-chat-mcp",
    "env_vars": {
      "ANTHROPIC_API_KEY": "$ANTHROPIC_API_KEY"
    }
  },
  "docker": {
    "name": "docker",
    "source_path": "/Users/williambrown/dev/claude-code/mcp-servers/docker"
  }
}
EOF

# Deploy Claude Chat MCP server with Node.js
echo "Deploying Claude Chat MCP server using MCP Test Client..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_deploy_server \
  --name "claude-chat-test" \
  --source_path "/Users/williambrown/dev/claude-code/playground/claude-chat-mcp" \
  --env_vars "{\"ANTHROPIC_API_KEY\": \"$ANTHROPIC_API_KEY\"}"
cd -

# Run tests for Claude Chat MCP
echo "Running tests for Claude Chat MCP server..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_run_tests \
  --server_name "claude-chat-test" \
  --test_suite "claude-chat-test-suite"
cd -

# Get logs from Claude Chat MCP
echo "Getting logs from Claude Chat MCP server..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_get_logs \
  --server_name "claude-chat-test" \
  --lines 100 > ../../logs/claude-chat-mcp.log
cd -

# Stop Claude Chat MCP server
echo "Stopping Claude Chat MCP server..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_stop_server \
  --server_name "claude-chat-test"
cd -

# Deploy Docker MCP server
echo "Deploying Docker MCP server using MCP Test Client..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_deploy_server \
  --name "docker-test" \
  --source_path "/Users/williambrown/dev/claude-code/mcp-servers/docker" \
  --env_vars "{\"MCP_SERVERS_PATH\": \"/Users/williambrown/dev/claude-code/mcp-servers/docker/templates\", \"CONTAINER_PREFIX\": \"dev-\"}"
cd -

# Run tests for Docker MCP
echo "Running tests for Docker MCP server..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_run_tests \
  --server_name "docker-test" \
  --test_suite "docker-production-test"
cd -

# Get logs from Docker MCP
echo "Getting logs from Docker MCP server..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_get_logs \
  --server_name "docker-test" \
  --lines 100 > ../../logs/docker-mcp.log
cd -

# Stop Docker MCP server
echo "Stopping Docker MCP server..."
cd /Users/williambrown/dev/claude-code/mcp-servers/mcp-test-client
node dist/index.js mcp_test_stop_server \
  --server_name "docker-test"
cd -

echo
echo "=== Testing complete! ==="
echo "Logs are available in the logs directory:"
echo "  - logs/claude-chat-mcp.log"
echo "  - logs/docker-mcp.log"