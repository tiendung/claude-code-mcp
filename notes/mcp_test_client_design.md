# MCP Test Client Design Document

## 1. Purpose and Goals

The MCP Test Client serves as a development and testing tool for Model Context Protocol (MCP) servers. Its primary goals are to:

1. Provide a persistent testing environment for MCP server prototypes
2. Simplify the development workflow from prototyping to production
3. Enable thorough testing of MCP servers before formal registration
4. Support an iterative development process with rapid feedback

This approach eliminates the need to restart Claude sessions during development and provides a standardized testing methodology.

### 1.1 Dual Client-Server Architecture

The MCP Test Client has a unique dual role in the MCP ecosystem:

1. **Server Role**: It functions as an MCP server from Claude's perspective
   - Registers with Claude via `claude mcp add`
   - Exposes tools for server deployment, testing, and management
   - Communicates with Claude via the MCP protocol (JSON-RPC over stdio)

2. **Client Role**: It acts as an MCP client to the servers under test
   - Connects to other MCP servers being developed and tested
   - Sends tool calls to these servers
   - Processes and validates responses

This dual architecture allows it to serve as middleware between Claude and servers under development:

```
┌─────────────┐          ┌─────────────────┐          ┌────────────────┐
│             │  Tools   │                 │  Client   │                │
│   Claude    │────────>│  MCP Test Client │────────>│  Server Under  │
│             │          │                 │          │     Test       │
└─────────────┘          └─────────────────┘          └────────────────┘
  Makes tool                Processes tool               Receives tool
   requests                requests and acts             calls from the
                           as client to other           MCP Test Client
                           servers
```

This architecture enables Claude to interact with servers under development without direct registration, allowing for testing and validation before formal integration.

## 2. Workflow Overview

```
┌─────────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│ 1. Develop Server   │────>│ 2. Deploy to Test  │────>│ 3. Test & Validate │
│    in playground/   │     │    Environment     │     │                   │
└─────────────────────┘     └────────────────────┘     └───────────────────┘
                                                              │
                                                              v
┌─────────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│ 6. Register with    │<────│ 5. Final Testing   │<────│ 4. Move to        │
│    claude-mcp-local │     │    in mcp-servers/ │     │    mcp-servers/   │
└─────────────────────┘     └────────────────────┘     └───────────────────┘
```

## 3. Test Client Architecture

### 3.1 Components

1. **MCP Test Client Server**
   - Implements the MCP client protocol
   - Provides both CLI and MCP tool interfaces
   - Manages persistent server containers
   - Handles test execution and reporting

2. **Server Container Manager**
   - Creates and manages Docker containers for MCP servers
   - Handles volume mounting for code changes
   - Manages environment variables and networking
   - Monitors server health and logs

3. **Test Suite Runner**
   - Executes predefined test scenarios
   - Validates server responses
   - Generates test reports
   - Supports both automated and interactive testing

### 3.2 Execution Flow

```
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│                │     │                │     │                │
│  MCP Test     │────>│  Container     │────>│  MCP Server    │
│  Client       │     │  Manager       │     │  Container     │
│                │     │                │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
       △                                              │
       │                                              │
       │            ┌────────────────┐                │
       │            │                │                │
       └────────────│   Test Report  │<───────────────┘
                    │   Generation   │
                    │                │
                    └────────────────┘
```

## 4. Core Features

### 4.1 Server Deployment

```bash
# Deploy server prototype to test environment
mcp_test_deploy_server({
  name: "my-server",
  source_path: "/Users/williambrown/dev/claude-code/playground/my-server",
  env_vars: {
    "API_KEY": "${API_KEY}"
  },
  persistent: true  # Keep running after tests
})
```

### 4.2 Test Execution

```bash
# Run tests against deployed server
mcp_test_run_tests({
  server_name: "my-server",
  test_suite: "basic",  # Predefined test suite
  interactive: false    # Run non-interactively
})

# Or run a specific test
mcp_test_call_tool({
  server_name: "my-server",
  tool_name: "send_message",
  arguments: {
    "prompt": "Hello world"
  }
})
```

### 4.3 Server Management

```bash
# List running test servers
mcp_test_list_servers()

# View server logs
mcp_test_get_logs({
  server_name: "my-server",
  lines: 100
})

# Stop a test server
mcp_test_stop_server({
  server_name: "my-server"
})
```

### 4.4 Migration Support

```bash
# Validate server readiness for migration
mcp_test_validate_server({
  server_name: "my-server"
})

# Migrate server to mcp-servers/
mcp_test_migrate_server({
  server_name: "my-server",
  destination: "mcp-servers/my-server"
})
```

## 5. Implementation Details

### 5.1 Test Client Server

The test client will be implemented as an MCP server itself with tools for:

1. **Server Deployment**: Deploy a server prototype to a container
2. **Test Execution**: Run tests against deployed servers
3. **Server Management**: List, monitor, and manage test servers
4. **Interactive Testing**: Test servers via tool calls or CLI

### 5.2 Container Management

Container management will leverage Docker to:

1. Build container images from server code
2. Mount source directories for live code updates
3. Configure environment variables securely
4. Create network connections for client-server communication
5. Collect and stream logs for debugging

### 5.3 Test Framework

The test framework will provide:

1. **Standard Test Suites**: Predefined test scenarios for common server types
2. **Custom Test Definitions**: JSON/YAML format for defining test cases
3. **Validation Rules**: Expected response formats and validation logic
4. **Interactive Mode**: Manual testing through CLI or tool calls
5. **Reporting**: Detailed test results with pass/fail indicators

### 5.4 Server Templates

Standard templates for common server types:

1. **TypeScript MCP Server**: For Node.js-based servers
2. **Python MCP Server**: For Python-based servers
3. **Custom Templates**: Support for user-defined templates

## 6. Usage Examples

### 6.1 Complete Development Workflow

```bash
# 1. Create a new server from template in playground/
mcp_test_create_server({
  name: "my-api-server",
  template: "typescript",
  destination: "playground/my-api-server"
})

# 2. Deploy to test environment (after development)
mcp_test_deploy_server({
  name: "my-api-server",
  source_path: "playground/my-api-server",
  env_vars: {
    "API_KEY": "${API_KEY}"
  }
})

# 3. Run tests against deployed server
mcp_test_run_tests({
  server_name: "my-api-server",
  test_suite: "basic"
})

# 4. Fix issues and update code (source is volume-mounted)
# ... (make code changes) ...

# 5. Re-run tests to verify fixes
mcp_test_run_tests({
  server_name: "my-api-server",
  test_suite: "basic"
})

# 6. Validate server for migration
mcp_test_validate_server({
  server_name: "my-api-server"
})

# 7. Migrate to mcp-servers/
mcp_test_migrate_server({
  server_name: "my-api-server",
  destination: "mcp-servers/my-api-server"
})

# 8. Final testing in production location
mcp_test_deploy_server({
  name: "my-api-server-prod",
  source_path: "mcp-servers/my-api-server"
})

mcp_test_run_tests({
  server_name: "my-api-server-prod",
  test_suite: "complete"
})

# 9. Registration command to add to claude-mcp-local
mcp_test_generate_registration({
  server_name: "my-api-server-prod"
})
```

### 6.2 Using for Claude Chat MCP Server

```bash
# Deploy the claude-chat-mcp server for testing
mcp_test_deploy_server({
  name: "claude-chat",
  source_path: "playground/claude-chat-mcp",
  env_vars: {
    "ANTHROPIC_API_KEY": "${ANTHROPIC_API_KEY}"
  }
})

# Run predefined tests for chat servers
mcp_test_run_tests({
  server_name: "claude-chat",
  test_suite: "chat-server"
})

# Run a specific test interactively
mcp_test_call_tool({
  server_name: "claude-chat",
  tool_name: "claude_send_message",
  arguments: {
    "prompt": "Tell me a fun fact about AI development"
  }
})
```

## 7. Implementation Plan

### 7.1 Phase 1: Core Testing Infrastructure

1. Implement basic MCP test client server
2. Create container management functionality
3. Develop simple test execution framework
4. Build CLI interface for testing

### 7.2 Phase 2: Enhanced Features

1. Add support for persistent test environments
2. Implement comprehensive test suites
3. Develop migration tooling
4. Add interactive testing capabilities

### 7.3 Phase 3: Integration and Documentation

1. Integrate with existing MCP servers
2. Create documentation and examples
3. Build server templates
4. Implement registration helpers

## 8. Benefits and Success Metrics

### 8.1 Benefits

1. **Faster Development**: Rapid iteration on server code
2. **Improved Quality**: Thorough testing before production
3. **Standardized Process**: Consistent development workflow
4. **Better Documentation**: Executable test cases as documentation
5. **Reduced Session Restarts**: No need to restart Claude for testing

### 8.2 Success Metrics

1. **Development Time**: Reduction in time from concept to production
2. **Test Coverage**: Percentage of server functionality covered by tests
3. **Bug Reduction**: Fewer issues found after formal registration
4. **Developer Experience**: Ease of use and workflow efficiency

## 9. Security Considerations

1. **API Key Management**: Secure handling of sensitive environment variables
2. **Isolation**: Container isolation for testing environments
3. **Resource Limits**: Prevention of resource exhaustion
4. **Access Control**: Restrictions on test client operations
5. **Cleanup**: Proper container and resource cleanup