# MCP Tools

This package provides tools for managing MCP (Model Context Protocol) servers for Claude Code.

## Features

- MCP server management (start, stop, status)
- Configuration management
- Environment variable management
- Support for multiple server deployment methods (Docker, NPX, Node.js)
- Command-line interface

## Installation

No installation is required. The tools can be run directly from the source directory.

## Usage

### CLI

The package provides a command-line interface for managing MCP servers:

```bash
# Show help
./cli.py help

# Show server status
./cli.py status

# Build a server
./cli.py build brave-search

# Enable a server
./cli.py enable brave-search --method docker

# Set environment variables
./cli.py setenv BRAVE_API_KEY your_api_key_here

# Start a server
./cli.py start brave-search

# Stop a server
./cli.py stop brave-search

# Stop all servers
./cli.py stopall
```

### Python API

The package also provides a Python API for managing MCP servers:

```python
from mcp_tools import MCPServerManager

# Initialize the manager
manager = MCPServerManager()

# Set environment variables
manager.set_env_var("BRAVE_API_KEY", "your_api_key_here")

# Enable a server
manager.enable_server("brave-search", method="docker")

# Start a server
manager.start_server("brave-search")

# Check server status
status = manager.get_server_status()
print(status)

# Stop a server
manager.stop_server("brave-search")
```

### Setup Script

The package includes a setup script for quickly setting up all required MCP servers:

```bash
# Set up all servers (Docker required)
./setup.py --build

# Set up specific servers
./setup.py --servers brave-search github --build

# Set up with NPX instead of Docker
./setup.py --method npx

# Set up with environment variables
./setup.py --brave-api-key your_api_key_here
```

## Requirements

- Python 3.10+
- Docker (for Docker deployment method)
- Node.js (for NPX and Node.js deployment methods)

## License

MIT