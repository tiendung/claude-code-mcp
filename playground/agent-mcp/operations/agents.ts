import { v4 as uuidv4 } from 'uuid';
import { CreateAgentSchema, GetAgentSchema, ListAgentsSchema, RunAgentSchema, Agent } from '../common/types';
import { AgentNotFoundError, InvalidAgentStateError } from '../common/errors';

// In-memory storage for agents
const agents: Map<string, Agent> = new Map();

// Create a new agent
export async function createAgent(input: unknown): Promise<Agent> {
  const { name, instructions } = CreateAgentSchema.parse(input);
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  const agent: Agent = {
    id,
    name: name || `agent-${id.substring(0, 8)}`,
    status: 'idle',
    created_at: now,
    updated_at: now,
    instructions,
  };
  
  agents.set(id, agent);
  return agent;
}

// Run an agent with instructions
export async function runAgent(input: unknown): Promise<Agent> {
  const { agentId, additionalInstructions } = RunAgentSchema.parse(input);
  
  const agent = agents.get(agentId);
  if (!agent) {
    throw new AgentNotFoundError(agentId);
  }
  
  if (agent.status !== 'idle') {
    throw new InvalidAgentStateError(agentId, agent.status, 'idle');
  }
  
  // Update agent status
  const updatedAgent: Agent = {
    ...agent,
    status: 'running',
    updated_at: new Date().toISOString(),
  };
  agents.set(agentId, updatedAgent);
  
  // Simulate agent execution (would be replaced with actual implementation)
  setTimeout(() => {
    // Simulate agent execution completing after random time
    const finalAgent: Agent = {
      ...updatedAgent,
      status: 'completed',
      updated_at: new Date().toISOString(),
      result: `Executed agent with instructions: ${agent.instructions}${
        additionalInstructions ? ` and additional instructions: ${additionalInstructions}` : ''
      }`,
    };
    agents.set(agentId, finalAgent);
  }, Math.random() * 2000 + 1000);
  
  return updatedAgent;
}

// Get agent status and result
export async function getAgent(input: unknown): Promise<Agent> {
  const { agentId } = GetAgentSchema.parse(input);
  
  const agent = agents.get(agentId);
  if (!agent) {
    throw new AgentNotFoundError(agentId);
  }
  
  return agent;
}

// List all agents with optional filtering
export async function listAgents(input: unknown): Promise<Agent[]> {
  const { status, limit } = ListAgentsSchema.parse(input);
  
  let results = Array.from(agents.values());
  
  // Filter by status if provided
  if (status) {
    results = results.filter(agent => agent.status === status);
  }
  
  // Sort by creation time (newest first)
  results.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  
  // Apply limit if provided
  if (limit !== undefined && limit > 0) {
    results = results.slice(0, limit);
  }
  
  return results;
}