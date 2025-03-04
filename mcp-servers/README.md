# Claude Code MCP Servers

This directory contains local implementations of Model Context Protocol (MCP) servers for the Claude Code project. These servers extend the functionality of Claude by providing access to external tools and APIs.

## Overview

The servers in this directory are based on reference implementations from the [MCP servers repository](https://github.com/modelcontextprotocol/servers), with enhancements and adaptations for the Claude Code project.

## Server List

1. **brave-search** - Web and local search capabilities using the Brave Search API
2. **github** - GitHub repository operations
3. **memory** - Knowledge graph for persistent memory
4. **fetch** - Web page fetching
5. **e2b** - Code execution sandbox
6. **linear** - Linear issue tracking integration
7. **filesystem** - Local file system operations
8. **sqlite** - Database operations
9. **slack** - Slack communication

## Development Setup

All servers share a common configuration and build system:

```bash
# Install dependencies for all servers
npm install

# Build all servers
npm run build

# Clean build artifacts
npm run clean
```

## Server Structure

Each server follows a similar structure:

```
server-name/
├── dist/           # Compiled JavaScript (generated)
├── index.ts        # Main server implementation
├── package.json    # Dependencies and build scripts
├── README.md       # Server-specific documentation
└── tsconfig.json   # TypeScript configuration
```

## Configuration

Most servers require API keys or other configuration parameters, which can be set as environment variables. Refer to each server's README for specific requirements.

## Integration with Claude Code

These servers are integrated with Claude Code through the `claude-mcp` script in the project root. The script handles:

1. Environment variable setup
2. Server registration
3. Server startup and shutdown

## Testing

Each server has its own testing scripts in the `src` directory. To test a server:

1. Ensure the server is built: `npm run build`
2. Run the specific test script for the server

## License

All servers are licensed under the MIT License, as are the reference implementations they're based on.