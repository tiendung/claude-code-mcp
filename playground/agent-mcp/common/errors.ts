// Define custom error classes for the agent MCP server
export class AgentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentError';
  }
}

export class AgentNotFoundError extends AgentError {
  constructor(agentId: string) {
    super(`Agent with ID ${agentId} not found`);
    this.name = 'AgentNotFoundError';
  }
}

export class AgentAlreadyExistsError extends AgentError {
  constructor(name: string) {
    super(`Agent with name ${name} already exists`);
    this.name = 'AgentAlreadyExistsError';
  }
}

export class AgentExecutionError extends AgentError {
  constructor(agentId: string, message: string) {
    super(`Error executing agent ${agentId}: ${message}`);
    this.name = 'AgentExecutionError';
  }
}

export class InvalidAgentStateError extends AgentError {
  constructor(agentId: string, currentState: string, expectedState: string) {
    super(`Agent ${agentId} is in state ${currentState}, expected ${expectedState}`);
    this.name = 'InvalidAgentStateError';
  }
}