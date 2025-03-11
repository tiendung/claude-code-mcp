# Claude Code with MCP Servers

## Project Overview

This project enables Claude to use Model Context Protocol (MCP) servers for enhanced capabilities, including web search, GitHub integration, file operations, database access, and communication tools.

## Key Concepts

- **MCP (Model Context Protocol)**: A standardized way for LLMs to interact with external tools and services
- **Reference MCP Servers**: Located at `$HOME/dev/mcp-servers-repo` (a clone of [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers))
- **Local MCP Servers**: Our own implementations located at `$HOME/dev/claude-code/mcp-servers/`

The reference servers should be treated as read-only. Our local servers will be our own implementations, some based on reference servers but with extensions and improvements.

## Directory Structure

- `docs/` - Reference documentation
- `mcp-servers/` - Our local MCP server implementations
- `archive/` - Storage for deprecated code components
- `data/` - Storage for server data (SQLite DB, memory files, etc.)
- `scripts/` - Utility scripts for setup and testing
- `src/` - Python modules and utilities

## MCP Server Configuration

Configuration is handled by the `claude-mcp` script at the project root. This script:

1. Sets up environment variables for server paths
2. Registers servers with Claude using the `claude mcp add` command
3. Uses both package-based servers (from npm/pypi) and local implementations

```bash
# Script path
/Users/williambrown/dev/claude-code/claude-mcp

# List all registered servers
claude mcp list
```

## Available MCP Servers

| Server | Purpose | Source |
|--------|---------|--------|
| brave-search | Web search capabilities | npm package |
| github | GitHub repository operations | npm package |
| filesystem | Local file system operations | npm package |
| fetch | Web page fetching | PyPI package |
| memory | Knowledge graph for persistent memory | npm package |
| sqlite | Database operations | Local implementation |
| e2b | Code execution sandbox | npm package |

## Required Environment Variables

- `BRAVE_API_KEY` - For brave-search server
- `GITHUB_TOKEN` - For GitHub operations
- `E2B_API_KEY` - For code execution sandbox
- `ALLOWED_PATHS` - For filesystem access control (defaults to project root)

## Development Approach

We're taking a two-pronged approach to MCP servers:

1. **Using Existing Servers**: Leveraging established MCP servers via npm/PyPI packages for standard functionality
2. **Building Custom Servers**: Developing our own implementations for extended functionality and experimentation

All legacy or unmaintained code is moved to the `archive/` directory to keep the main codebase clean and focused.

## Development Guidelines

### Package Management
- Use `uv` for Python package management (NEVER pip)
- Installation: `uv add package`
- Running tools: `uv run tool`
- TypeScript: Use npm for package management

### Code Quality
- Type hints required for all Python and TypeScript code
- Public APIs must have docstrings
- Functions must be focused and small
- Line length: 88 chars maximum
- Follow PEP standards for Python
- Follow existing patterns for TypeScript

### Testing
- Framework: `uv run pytest`
- Async testing: use anyio, not asyncio
- Coverage: test edge cases and errors
- New features require tests
- Bug fixes require regression tests

### Coding Principles
- Use clean, modular abstractions
- Avoid code duplication
- Ensure backward compatibility
- Document all extensions and differences from reference implementations
- Strive for minimal clean code that's easily maintained

### Git Workflow
- Develop in separate branches, merge to main quickly
- For user-reported fixes: `git commit --trailer "Reported-by:<user>"`
- For GitHub issues: `git commit --trailer "Github-Issue:#<number>"`
- NEVER mention co-authored-by or tools used to create commits/PRs

## MCP Server Development Guidelines

When developing our own local MCP servers:

1. **Reference Implementation First**:
   - Study the original server in `MCP_REPO_PATH`
   - Understand its API, behavior, and implementation details
   - Document the key functions and features

2. **Implementation Strategy**:
   - Start by mimicking the reference server exactly
   - Once basic functionality is working, add extensions
   - Ensure backward compatibility

3. **Code Quality**:
   - Use proper typing (TypeScript/Python type hints)
   - Add comprehensive documentation
   - Implement proper error handling
   - Follow consistent naming conventions
   - Write tests for all functionality

For detailed information about project standards, code style, and specific server implementations, refer to `CLAUDE.md`.
