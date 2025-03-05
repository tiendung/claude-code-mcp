# Testing the Docker MCP Server

This guide outlines the steps to test the Docker MCP server for managing MCP servers in containers.

## Prerequisites

1. Docker installed and running
2. Node.js v16 or higher
3. npm v7 or higher
4. Access to required Docker APIs

## Setup

1. Install dependencies:

```bash
cd mcp-servers/docker
npm install
```

2. Build the server:

```bash
npm run build
```

3. Build MCP server template images:

```bash
node scripts/build-templates.js
```

## Manual Testing

### 1. Start the Docker MCP Server

```bash
# From the mcp-servers/docker directory
node dist/index.js
```

### 2. Testing with curl

Open a new terminal and use curl to send commands:

#### List Available Tools

```bash
echo '{"method":"tools/list"}' | curl -X POST -H "Content-Type: application/json" --data-binary @- http://localhost:8080
```

#### Create a Server Container

```bash
echo '{"method":"tools/call","params":{"name":"docker_create_server","arguments":{"server_type":"agent-mcp","server_name":"test-agent-server","env_vars":{"LOG_LEVEL":"DEBUG","ANTHROPIC_API_KEY":"test_key"}}}}' | curl -X POST -H "Content-Type: application/json" --data-binary @- http://localhost:8080
```

#### List Servers

```bash
echo '{"method":"tools/call","params":{"name":"docker_list_servers","arguments":{"status":"all"}}}' | curl -X POST -H "Content-Type: application/json" --data-binary @- http://localhost:8080
```

#### Get Server Logs

```bash
echo '{"method":"tools/call","params":{"name":"docker_get_logs","arguments":{"server_name":"test-agent-server","lines":50}}}' | curl -X POST -H "Content-Type: application/json" --data-binary @- http://localhost:8080
```

#### Stop a Server

```bash
echo '{"method":"tools/call","params":{"name":"docker_stop_server","arguments":{"server_name":"test-agent-server"}}}' | curl -X POST -H "Content-Type: application/json" --data-binary @- http://localhost:8080
```

## Automated Testing

Run the automated test script:

```bash
# From the mcp-servers/docker directory
node test/test-docker-mcp.js
```

This script tests:
1. Listing tools
2. Creating a server container
3. Listing servers

## Claude Testing

When testing with Claude:

1. Register the Docker MCP server with Claude:

```bash
claude mcp add docker -- node ~/dev/claude-code/mcp-servers/docker/dist/index.js
```

2. Use it via Claude API calls:

```
mcp__docker__create_server({
  server_type: "agent-mcp",
  server_name: "claude-test-agent",
  env_vars: {
    LOG_LEVEL: "DEBUG",
    ANTHROPIC_API_KEY: "test_key"
  }
})
```

## Testing Inter-MCP Communication

To test how Docker MCP can help with testing other MCP servers:

1. Create an Agent MCP server container:

```
mcp__docker__create_server({
  server_type: "agent-mcp",
  server_name: "test-agent"
})
```

2. Create a Brave Search MCP server container:

```
mcp__docker__create_server({
  server_type: "brave-search",
  server_name: "test-brave-search",
  env_vars: {
    BRAVE_API_KEY: "your_api_key"
  }
})
```

3. Get logs to verify proper functioning:

```
mcp__docker__get_logs({
  server_name: "test-agent",
  lines: 50
})
```

## Cleanup

To stop and remove test containers:

```bash
docker stop mcp-test-agent-server
docker rm mcp-test-agent-server
```

Or using the Docker MCP server:

```
mcp__docker__stop_server({
  server_name: "test-agent-server"
})
```

## Troubleshooting

- If Docker connection fails, ensure Docker is running and the socket is accessible
- Check for proper permissions to access the Docker socket
- Verify that template images are built before testing
- Check logs for detailed error messages