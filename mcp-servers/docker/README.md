# Docker MCP Server

This MCP server provides tools for executing code in Docker containers and managing development environments. It supports both ephemeral code execution and persistent development environments.

## Features

- Run code snippets in ephemeral containers with various languages (with internet access)
- Create and manage persistent development environments
- Register custom Docker templates via tool calls
- Build Docker images from templates
- Support for both Node.js and Python MCP servers
- Resource management and isolation

## Tools

This MCP server provides the following tools:

### Code Execution

- `docker_run_code`: Run code in an ephemeral container
  - Supports Python, Node.js, TypeScript, Ruby, and more
  - Quick results with minimal setup
  - Package installation via dependencies parameter
  - Network access enabled by default for downloading dependencies

### Template Management

- `docker_register_template`: Register a new Docker template for creating servers
- `docker_list_templates`: List available Docker templates
- `docker_build_image`: Build a Docker image from a template

### Environment Management

- `docker_create_server`: Create a new Docker container from a template
- `docker_list_servers`: List managed Docker containers
- `docker_get_logs`: Get logs from a Docker container
- `docker_stop_server`: Stop a managed Docker container
- `docker_start_server`: Start a stopped Docker container
- `docker_restart_server`: Restart a Docker container

## Examples

### Run Python Code with Internet Access

```javascript
{
  "name": "docker_run_code",
  "arguments": {
    "language": "python",
    "code": "import requests\nresponse = requests.get('https://httpbin.org/get')\nprint(response.json())",
    "dependencies": ["requests"]
  }
}
```

### Register a Custom Template

```javascript
{
  "name": "docker_register_template",
  "arguments": {
    "name": "custom-python",
    "image": "python:3.12-slim",
    "description": "Custom Python 3.12 environment with network access",
    "config": {
      "labels": {
        "custom": "true"
      }
    }
  }
}
```

### Create a Development Environment

```javascript
{
  "name": "docker_create_server",
  "arguments": {
    "server_type": "python-data-science",
    "server_name": "my-data-project",
    "env_vars": {
      "DEBUG": "true"
    }
  }
}
```

### Build an MCP Server Image

```javascript
{
  "name": "docker_build_image",
  "arguments": {
    "template_name": "brave-search",
    "force": true
  }
}
```

## Server Templates

Templates are defined in the `templates/` directory as JSON files. Each template specifies:

- Base image or build instructions
- Resource limits
- Environment variables
- Labels and metadata

### Built-in Template Types

- **Node.js MCP Servers**: Automatically builds using multi-stage Docker builds
- **Python MCP Servers**: Builds Python servers with proper dependencies
- **Custom Images**: Can use specific Dockerfiles

### Creating Custom Templates

You can create custom templates in two ways:

1. **Via Tool Call**: Use the `docker_register_template` tool to register new templates:

```javascript
{
  "name": "docker_register_template",
  "arguments": {
    "name": "data-analysis",
    "image": "python:3.11-slim",
    "description": "Data analysis environment with Python 3.11",
    "config": {
      "labels": {
        "purpose": "data-analysis"
      },
      "command": ["python", "-m", "http.server", "8080"]
    }
  }
}
```

2. **Via JSON File**: Create a JSON file in the `templates/` directory:

```json
{
  "image": "python:3.11-slim",
  "config": {
    "labels": {
      "mcp.description": "Data analysis environment with Python 3.11"
    },
    "command": ["python", "-m", "http.server", "8080"]
  }
}
```

## Security

The server implements several security measures:

- Container isolation
- Resource limits
- Proper timeout handling
- Non-root users in containers where possible (when specified in templates)
