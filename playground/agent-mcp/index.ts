#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { 
  CreateAgentSchema, 
  GetAgentSchema, 
  ListAgentsSchema, 
  RunAgentSchema 
} from './common/types.js';
import { 
  createAgent, 
  getAgent, 
  listAgents, 
  runAgent 
} from './operations/agents.js';
import { VERSION } from './common/version.js';
import { AgentError } from './common/errors.js';

// Simple logger with different log levels
const Logger = {
  LEVELS: {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
  },
  
  // Default log level
  level: 1, // INFO
  
  // Initialize with environment variable if available
  init() {
    const envLevel = process.env.LOG_LEVEL;
    if (envLevel) {
      const upperEnvLevel = envLevel.toUpperCase();
      if (upperEnvLevel === 'DEBUG' || upperEnvLevel === 'INFO' || 
          upperEnvLevel === 'WARN' || upperEnvLevel === 'ERROR') {
        this.level = this.LEVELS[upperEnvLevel];
      }
    }
  },
  
  // Log methods for different levels
  debug(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.DEBUG) {
      console.error(`[DEBUG] ${message}`, ...args);
    }
  },
  
  info(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.INFO) {
      console.error(`[INFO] ${message}`, ...args);
    }
  },
  
  warn(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.WARN) {
      console.error(`[WARN] ${message}`, ...args);
    }
  },
  
  error(message: string, ...args: any[]) {
    if (this.level <= this.LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
};

// Initialize logger
Logger.init();

// Create the server instance
const server = new Server(
  {
    name: 'agent',
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  Logger.debug('Handling list tools request');
  
  return {
    tools: [
      {
        name: 'create_agent',
        description: 'Create a new agent with instructions',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            instructions: { type: 'string' }
          },
          required: ['instructions']
        }
      },
      {
        name: 'run_agent',
        description: 'Run an existing agent with optional additional instructions',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' },
            additionalInstructions: { type: 'string' }
          },
          required: ['agentId']
        }
      },
      {
        name: 'get_agent',
        description: 'Get the status and result of an agent',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' }
          },
          required: ['agentId']
        }
      },
      {
        name: 'list_agents',
        description: 'List all agents with optional filtering',
        inputSchema: {
          type: 'object',
          properties: {
            status: { 
              type: 'string',
              enum: ['idle', 'running', 'completed', 'failed']
            },
            limit: { type: 'number' }
          }
        }
      }
    ]
  };
});

// Handle tool call requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  Logger.debug(`Handling tool call: ${name}`, args);

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  try {
    let result;
    
    switch (name) {
      case 'create_agent':
        result = await createAgent(args);
        break;
      
      case 'run_agent':
        result = await runAgent(args);
        break;
      
      case 'get_agent':
        result = await getAgent(args);
        break;
      
      case 'list_agents':
        result = await listAgents(args);
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    // Return response in the expected content format
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    Logger.error(`Error executing tool ${name}:`, error);
    
    if (error instanceof AgentError) {
      return { 
        error: { 
          message: error.message, 
          name: error.name 
        } 
      };
    }
    
    return { 
      error: { 
        message: 'Internal server error', 
        name: 'InternalServerError' 
      } 
    };
  }
});

// Start the server
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    Logger.info('Agent MCP Server running on stdio');
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  Logger.error('Fatal error in main():', error);
  process.exit(1);
});