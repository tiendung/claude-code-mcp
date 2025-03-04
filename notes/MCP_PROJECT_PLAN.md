# MCP Servers Project Plan

## Overview

This project aims to create localized, enhanced versions of the Model Context Protocol (MCP) servers, building on the reference implementations from the `mcp-servers-repo`. We'll focus on extending functionality while maintaining compatibility with the original APIs.

## Project Goals

1. **Copy and Enhance Reference Servers**: Create local versions of key MCP servers with improved functionality.
2. **Ensure Compatibility**: Maintain backward compatibility with reference implementations.
3. **Comprehensive Documentation**: Document all extensions and improvements.
4. **Test Coverage**: Implement robust testing for all servers.
5. **Task Management**: Use Linear for project tracking and task management.

## Priority MCP Servers

1. **brave-search** *(First priority)* ✅
2. **github** ✅
3. **memory** ✅
4. **fetch** ✅
5. **e2b** ✅
6. **linear** ✅
7. **filesystem** ✅
8. **sqlite** ✅
9. **slack** ✅
10. **research-papers** ✅ *(New: Research paper management with Semantic Scholar)*

## Implementation Approach

For each server, we will:

1. **Study Reference Implementation**: Understand the API, behavior, and implementation details.
2. **Basic Implementation**: Copy and adapt the reference server to work in our local environment.
3. **Extension**: Add improvements and additional features.
4. **Testing**: Create comprehensive tests.
5. **Documentation**: Update README and other documentation.

## Path Considerations

- We need to be careful with path dependencies in the tsconfig.json files.
- Reference servers are nested in `mcp-servers-repo/src/` but our implementations will be directly in `mcp-servers/`.

## Project Phases

### Phase 1: Setup and Initial Implementation ✅

1. **Project Structure**: ✅ Set up the local directory structure for servers.
2. **brave-search Implementation**: ✅ Created local copy of the brave-search server.
3. **Testing Infrastructure**: ✅ Established basic testing patterns and tools.

### Phase 2: Core Servers Implementation ✅

1. **github Server**: ✅ Copied and adapted the GitHub integration.
2. **memory Server**: ✅ Implemented the knowledge graph server.
3. **fetch Server**: ✅ Adapted the web page fetching server.

### Phase 3: Extended Servers Implementation ✅

1. **e2b Server**: ✅ Integrated the code execution sandbox.
2. **linear Server**: ✅ Implemented the Linear issue tracking integration.
3. **filesystem Server**: ✅ Implemented local file system operations.
4. **sqlite Server**: ✅ Implemented the database operations capability.
5. **slack Server**: ✅ Implemented the Slack communication server.

### Phase 4: New Server Development ✅

1. **Research Papers Server**: ✅ Developed a research papers management system with Semantic Scholar integration.
2. **Integration**: ✅ Successfully integrated with existing MCP infrastructure.
3. **Documentation**: ✅ Added detailed usage guidelines to CLAUDE.md.
4. **Data Persistence**: ✅ Implemented robust storage for paper metadata and relationships.

### Phase 5: Enhancement and Documentation 🔄

1. **Integration Testing**: Ensure all servers work together seamlessly.
2. **Comprehensive Documentation**: Complete all documentation.
3. **Performance Optimization**: Review and optimize performance.
4. **Feature Enhancements**: Add new capabilities to servers beyond the reference implementations.

## Current Status

All ten MCP servers have been successfully implemented and are working correctly:
1. Nine servers based on reference implementations (brave-search, github, memory, fetch, e2b, linear, filesystem, sqlite, slack)
2. One custom-developed server (research-papers) for academic research management

The `claude-mcp-local` script manages all servers and ensures they work together seamlessly. Documentation has been expanded in CLAUDE.md with detailed usage guidelines for each server.

### Research Papers MCP Server

The Research Papers MCP server provides:
- Paper search and import from Semantic Scholar
- Paper organization with collections and tagging
- Citation tracking and management
- Reading status and importance tracking
- Notes and annotations for papers
- Persistent storage of paper metadata and relationships

Next steps include:
1. Adding comprehensive tests for all servers
2. Enhancing documentation further
3. Adding new features to extend functionality beyond the reference implementations
4. Optimizing performance
5. Expanding the Research Papers server with additional academic APIs
6. Implementing vector embeddings for semantic search of papers