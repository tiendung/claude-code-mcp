import { 
  Server, 
  StdioServerTransport,
  Request,
  Tool, 
  RequestType
} from '@modelcontextprotocol/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { 
  CreateAgentSchema, 
  GetAgentSchema, 
  ListAgentsSchema, 
  RunAgentSchema 
} from './common/types';
import { 
  createAgent, 
  getAgent, 
  listAgents, 
  runAgent 
} from './operations/agents';
import { VERSION } from './common/version';
import { AgentError } from './common/errors';

// Create server instance
const server = new Server({
  name: 'agent',
  version: VERSION,
  transport: new StdioServerTransport(),
});

// Register tools
const tools: Tool[] = [
  {
    name: 'create_agent',
    description: 'Create a new agent with instructions',
    inputSchema: zodToJsonSchema(CreateAgentSchema),
  },
  {
    name: 'run_agent',
    description: 'Run an existing agent with optional additional instructions',
    inputSchema: zodToJsonSchema(RunAgentSchema),
  },
  {
    name: 'get_agent',
    description: 'Get the status and result of an agent',
    inputSchema: zodToJsonSchema(GetAgentSchema),
  },
  {
    name: 'list_agents',
    description: 'List all agents with optional filtering',
    inputSchema: zodToJsonSchema(ListAgentsSchema),
  },
];

// Register all tools with the server
for (const tool of tools) {
  server.registerTool(tool);
}

// Handle requests
server.handleRequest(async (request: Request) => {
  try {
    switch (request.type) {
      case RequestType.ListTools:
        return { tools };
      
      case RequestType.CallTool:
        switch (request.tool) {
          case 'create_agent':
            return await createAgent(request.input);
          
          case 'run_agent':
            return await runAgent(request.input);
          
          case 'get_agent':
            return await getAgent(request.input);
          
          case 'list_agents':
            return await listAgents(request.input);
          
          default:
            throw new Error(`Unknown tool: ${request.tool}`);
        }
      
      default:
        throw new Error(`Unknown request type: ${request.type}`);
    }
  } catch (error) {
    console.error('Error handling request:', error);
    
    if (error instanceof AgentError) {
      return { error: { message: error.message, name: error.name } };
    }
    
    return { error: { message: 'Internal server error', name: 'InternalServerError' } };
  }
});

// Start server
server.start();