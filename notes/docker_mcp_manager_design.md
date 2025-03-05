# Docker MCP Manager Design Document

## Overview

The Docker MCP Manager is a system designed to facilitate the creation, management, and testing of Model Context Protocol (MCP) servers in isolated Docker containers. This approach solves the challenges encountered when testing MCP servers directly and provides a clean architecture for running and monitoring background processes.

## Motivation

Our efforts to test the Agent MCP server revealed several limitations with direct testing approaches:

1. The MCP SDK's stdio transport has unique handling that makes direct testing difficult
2. Standard Node.js process communication methods are incompatible with how MCP servers process requests
3. Simple subprocess management techniques are insufficient for reliable testing
4. A proper isolated environment is needed for effective MCP server testing

## Architecture

### High-Level System Architecture

```
┌───────────────────────────────────────────────┐
│                                               │
│            Docker MCP Manager Server          │
│                                               │
│   ┌───────────────┐      ┌────────────────┐   │
│   │  Server       │      │  Server        │   │
│   │  Registry     │      │  Controller    │   │
│   └───────────────┘      └────────────────┘   │
│                                               │
│   ┌───────────────┐      ┌────────────────┐   │
│   │  Log          │      │  Resource      │   │
│   │  Manager      │      │  Monitor       │   │
│   └───────────────┘      └────────────────┘   │
│                                               │
└───────────────────────────────────────────────┘
        │                    │
        ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Container 1  │    │  Container 2  │    │  Container 3  │
│  MCP Server A │    │  MCP Server B │    │  Agent Server │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Core Components

1. **Server Registry**
   - Maintains metadata about available MCP servers
   - Tracks image names, ports, environment variables
   - Stores configuration templates for each server type
   - Implements versioning for different server implementations

2. **Server Controller**
   - Creates and manages Docker containers
   - Handles start/stop/restart operations
   - Implements health checks
   - Manages network configuration and service discovery
   - Controls container lifecycle and cleanup

3. **Log Manager**
   - Captures and aggregates logs from all MCP containers
   - Provides search, filtering, and real-time streaming
   - Retains history for debugging
   - Formats logs for analysis

4. **Resource Monitor**
   - Tracks resource usage (CPU, memory, network)
   - Implements resource limits and alerts
   - Provides performance metrics
   - Identifies potential issues with container performance

## Implementation Details

### Docker Integration

The Docker MCP Manager will use the Docker API to manage containers, networks, and volumes. Key aspects include:

1. **Container Creation**
   - Based on server templates
   - Proper environment variable injection
   - Volume mounting for persistent data
   - Network configuration for inter-server communication

2. **Container Management**
   - Lifecycle operations (start, stop, restart, remove)
   - Health checks
   - Status monitoring
   - Resource constraints

3. **Network Management**
   - Creation of dedicated bridge networks for MCP servers
   - DNS setup for service discovery
   - Port mapping for external access
   - Network isolation

### MCP Server Integration

Each MCP server will be packaged as a Docker image following consistent patterns:

1. **Image Structure**
   - Multi-stage builds with builder and release stages
   - Minimal base images (Alpine/slim variants)
   - Proper dependency management
   - Optimized layer caching

2. **Configuration**
   - Environment variable-based configuration
   - Volume mounting for data persistence
   - Proper signal handling
   - Graceful shutdown

3. **Logging**
   - Structured logging to stdout/stderr
   - Log level configuration
   - Context-aware log entries

## API Design

The Docker MCP Manager will expose a consistent API for managing MCP servers:

### Server Management

```json
{
  "name": "docker_create_server",
  "arguments": {
    "server_type": "agent-mcp",
    "server_name": "test-agent-server",
    "env_vars": {
      "LOG_LEVEL": "DEBUG",
      "ANTHROPIC_API_KEY": "key_goes_here"
    },
    "volumes": [
      {
        "host_path": "/path/to/data",
        "container_path": "/app/data"
      }
    ]
  }
}
```

### Status Operations

```json
{
  "name": "docker_list_servers",
  "arguments": {
    "status": "running",
    "server_type": "agent-mcp"
  }
}
```

```json
{
  "name": "docker_get_server_status",
  "arguments": {
    "server_name": "test-agent-server"
  }
}
```

### Log Operations

```json
{
  "name": "docker_get_logs",
  "arguments": {
    "server_name": "test-agent-server",
    "lines": 50,
    "since": "2h",
    "follow": false
  }
}
```

### Lifecycle Operations

```json
{
  "name": "docker_stop_server",
  "arguments": {
    "server_name": "test-agent-server"
  }
}
```

```json
{
  "name": "docker_restart_server",
  "arguments": {
    "server_name": "test-agent-server"
  }
}
```

## Implementation Plan

### Phase 1: Core Container Management

- Basic Docker container operations (create, list, start, stop)
- Simple environment variable configuration
- Log streaming
- Dockerfile templates for MCP servers

### Phase 2: MCP Server Integration

- Server templates and configuration
- Service discovery for inter-server communication
- Health monitoring
- Resource limits and alerts

### Phase 3: Testing Framework

- Automated test sequences
- Result collection and reporting
- Performance benchmarking
- Regression testing

## Security Considerations

1. **Container Isolation**
   - Proper resource limits
   - Network isolation
   - Non-root users in containers
   - Read-only file systems where possible

2. **Credential Management**
   - Secure handling of API keys
   - Environment variable security
   - No hard-coded secrets

3. **Access Control**
   - Authentication for the Docker MCP Manager API
   - Authorization for different operations
   - Audit logging

## Testing Strategy

1. **Unit Testing**
   - Test each component in isolation
   - Mock Docker API responses
   - Test error handling

2. **Integration Testing**
   - Test container creation and management
   - Verify network communication
   - Test resource monitoring

3. **End-to-End Testing**
   - Test full workflows
   - Verify MCP server functionality
   - Benchmark performance

## Future Enhancements

1. **GUI Dashboard**
   - Visual container management
   - Real-time log viewing
   - Resource usage graphs

2. **Auto-scaling**
   - Dynamic creation of servers based on load
   - Resource-based scaling
   - High availability configurations

3. **Test Scenario Builder**
   - Visual test scenario creation
   - Parameterized test sequences
   - Automated test execution

4. **Distributed Testing**
   - Run tests across multiple hosts
   - Aggregate results
   - Performance benchmarking at scale