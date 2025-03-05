# MCP Agent Tool Design

## Overview

The MCP Agent tool is designed to allow Claude to create and manage sub-agents for testing purposes. This capability enables Claude to test other MCP servers without manual intervention, making development and testing more efficient.

## Current Implementation

We've created a prototype MCP server in the `playground/agent-mcp/` directory with the following features:

1. **Agent Management**:
   - Create agents with custom instructions
   - Run agents to execute those instructions
   - Get agent status and results
   - List available agents with filtering

2. **In-Memory Storage**:
   - Agents are stored in memory for now
   - State transitions (idle → running → completed)
   - Results capture

3. **Simulated Execution**:
   - Currently using timeouts to simulate execution
   - Will be replaced with actual Claude API integration

4. **Test Client**:
   - Simple test client to verify server functionality
   - Communicates via stdin/stdout JSON protocol
   - Runs through all operations to ensure they work

## Architecture

- **TypeScript Implementation**:
  - Uses MCP SDK (version 1.0.1)
  - Zod for schema validation
  - StdioServerTransport for communication

- **Modular Design**:
  - Core agent operations in `operations/agents.ts`
  - Schemas and types in `common/types.ts`
  - Error handling in `common/errors.ts`
  - Server entry point in `index.ts`

- **Error Handling**:
  - Custom error classes
  - Proper error propagation
  - Clear error messages

## Next Steps

1. **Enhance Agent Execution**:
   - Replace simulated execution with actual Claude API calls
   - Enable agents to execute specific instructions
   - Set up proper result parsing and reporting

2. **MCP Server Testing**:
   - Add capabilities to test other MCP servers
   - Create test case definitions
   - Enable reporting of test results

3. **Persistence**:
   - Add filesystem-based persistence for agents
   - Enable long-running tests

4. **Integration**:
   - Move from playground to mcp-servers when fully tested
   - Update documentation for production use

5. **Advanced Features**:
   - Agent-to-agent communication
   - Test suites for comprehensive server testing
   - Visualization of test results

## Usage Examples

```typescript
// Create an agent
const agent = await mcp__agent__create_agent({
  instructions: "Test the brave-search MCP server by performing a search for 'Claude AI'"
});

// Run the agent
await mcp__agent__run_agent({
  agentId: agent.id
});

// Get results after some time
const result = await mcp__agent__get_agent({
  agentId: agent.id
});

// List all completed agents
const completedAgents = await mcp__agent__list_agents({
  status: "completed"
});
```

## Benefits

- Enables self-testing capabilities for Claude
- Reduces manual testing requirements
- Provides a framework for automated MCP server validation
- Creates a foundation for more complex multi-agent systems
- Serves as a demonstration of Claude's ability to develop and test its own tools