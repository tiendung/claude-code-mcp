import { v4 as uuidv4 } from 'uuid';
import { CreateAgentSchema, GetAgentSchema, ListAgentsSchema, RunAgentSchema, Agent } from '../common/types.js';
import { AgentNotFoundError, InvalidAgentStateError, AgentExecutionError } from '../common/errors.js';
import https from 'https';

// In-memory storage for agents
const agents: Map<string, Agent> = new Map();

// Function to call the Claude API
async function executeAgentWithClaudeAPI(agent: Agent, additionalInstructions?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Ensure API key is set
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return reject(new AgentExecutionError(agent.id, 'ANTHROPIC_API_KEY environment variable is not set'));
    }
    
    // Prepare full instructions
    const fullInstructions = additionalInstructions 
      ? `${agent.instructions}\n\nAdditional instructions: ${additionalInstructions}`
      : agent.instructions;
    
    // Special handling for test mode (dummy API key)
    if (apiKey === 'dummy_key_for_testing') {
      console.error(`[DEBUG] Test mode detected, simulating API response for agent ${agent.id}`);
      setTimeout(() => {
        resolve(`This is a simulated response from Claude API in test mode. Agent ID: ${agent.id}. Instructions: ${fullInstructions.substring(0, 50)}...`);
      }, 500); // Simulate API delay
      return;
    }
    
    // Prepare request data
    const data = JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: fullInstructions
        }
      ]
    });
    
    // Prepare request options
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseBody);
            const result = parsed.content && parsed.content[0] && parsed.content[0].text
              ? parsed.content[0].text
              : JSON.stringify(parsed);
            resolve(result);
          } catch (error: any) {
            reject(new AgentExecutionError(agent.id, `Failed to parse Claude API response: ${error.message}`));
          }
        } else {
          reject(new AgentExecutionError(agent.id, `Claude API request failed with status ${res.statusCode}: ${responseBody}`));
        }
      });
    });
    
    req.on('error', (error: any) => {
      reject(new AgentExecutionError(agent.id, `Claude API request error: ${error.message}`));
    });
    
    req.write(data);
    req.end();
  });
}

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
  
  // Execute agent using Claude API
  executeAgentWithClaudeAPI(agent, additionalInstructions).then(result => {
    // Update agent with result from Claude
    const finalAgent: Agent = {
      ...updatedAgent,
      status: 'completed',
      updated_at: new Date().toISOString(),
      result,
    };
    agents.set(agentId, finalAgent);
    console.error(`[INFO] Agent ${agentId} completed successfully`);
  }).catch(error => {
    // Handle errors
    const failedAgent: Agent = {
      ...updatedAgent,
      status: 'failed',
      updated_at: new Date().toISOString(),
      error: error.message,
    };
    agents.set(agentId, failedAgent);
    console.error(`[ERROR] Agent ${agentId} failed:`, error.message);
  });
  
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