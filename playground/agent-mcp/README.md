# MCP Agent Server

A Model Context Protocol (MCP) server for creating and managing sub-agents for testing and automation.

## Overview

This MCP server allows Claude to:
- Create sub-agents with specific instructions
- Run agents to execute those instructions
- Check agent execution status and results
- List and filter available agents

## Installation

```bash
# Install dependencies
npm install

# Build the server
npm run build
```

## Usage

The server provides the following operations:

### 1. Create an Agent

Create a new agent with specified instructions.

```typescript
mcp__agent__create_agent({
  name: "test-agent", // Optional, will be auto-generated if not provided
  instructions: "This is what the agent should do when executed"
})
```

### 2. Run an Agent

Execute an agent with its instructions and optional additional instructions.

```typescript
mcp__agent__run_agent({
  agentId: "agent-id",
  additionalInstructions: "Extra instructions for this run" // Optional
})
```

### 3. Get Agent Status

Check the status and result of an agent.

```typescript
mcp__agent__get_agent({
  agentId: "agent-id"
})
```

### 4. List Agents

List all agents with optional filtering by status and limit.

```typescript
mcp__agent__list_agents({
  status: "completed", // Optional, filter by status
  limit: 5 // Optional, limit number of results
})
```

## Implementation Details

- Agents are currently stored in-memory
- Agent execution is simulated with timeouts
- Future versions will implement actual agent capabilities

## Future Enhancements

- Persistent storage of agents
- Actual execution of agent instructions using Claude API
- Ability to pass results between agents
- Testing of other MCP servers
- Results reporting and visualization