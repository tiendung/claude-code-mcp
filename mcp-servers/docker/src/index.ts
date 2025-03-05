#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { 
  createServer, 
  listServers, 
  getServerLogs, 
  stopServer,
  startServer,
  restartServer,
  getAvailableServerTemplates,
  runCode,
  buildImage,
  registerTemplate
} from './operations/docker.js';

import { 
  CreateServerSchema, 
  ListServersSchema, 
  GetServerLogsSchema, 
  ServerOperationSchema,
  RunCodeSchema,
  BuildImageSchema,
  RegisterTemplateSchema
} from './types/schemas.js';

import { VERSION } from './common/version.js';
import { DockerError } from './common/errors.js';
import { Logger } from './common/logger.js';

// Initialize logger
Logger.init();

// Create MCP server instance
const server = new Server(
  {
    name: 'docker',
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
      // New tools for code execution and image building
      {
        name: 'docker_build_image',
        description: 'Build a Docker image from a template',
        inputSchema: {
          type: 'object',
          properties: {
            template_name: { 
              type: 'string',
              description: 'Name of the template to build'
            },
            force: { 
              type: 'boolean',
              description: 'Force rebuild even if image exists'
            }
          },
          required: ['template_name']
        }
      },
      {
        name: 'docker_run_code',
        description: 'Run code in an ephemeral container with specified language and dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            language: { 
              type: 'string',
              description: 'Programming language to use (python, javascript, typescript, ruby, bash, etc.)'
            },
            code: { 
              type: 'string',
              description: 'Code to execute'
            },
            timeout: { 
              type: 'number',
              description: 'Maximum execution time in milliseconds (default: 30000)'
            },
            dependencies: { 
              type: 'array',
              items: { type: 'string' },
              description: 'List of dependencies to install before running the code'
            },
            env_vars: { 
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Environment variables to set in the container'
            }
          },
          required: ['language', 'code']
        }
      },
      
      // New template registration tool
      {
        name: 'docker_register_template',
        description: 'Register a new Docker template for creating servers',
        inputSchema: {
          type: 'object',
          properties: {
            name: { 
              type: 'string',
              description: 'Name for the template (used as server_type when creating servers)'
            },
            image: { 
              type: 'string',
              description: 'Docker image to use for this template (e.g., "python:3.11-slim")'
            },
            description: { 
              type: 'string',
              description: 'Description of the template'
            },
            config: { 
              type: 'object',
              description: 'Additional configuration for the template (optional)'
            },
            build: { 
              type: 'object',
              description: 'Build instructions for the template (optional)',
              properties: {
                context: { type: 'string' },
                dockerfile: { type: 'string' },
                options: { type: 'object' }
              }
            }
          },
          required: ['name', 'image', 'description']
        }
      },
      
      // Legacy tools
      {
        name: 'docker_list_templates',
        description: 'List available Docker environment templates',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'docker_create_server',
        description: 'Create a new Docker container from a template',
        inputSchema: {
          type: 'object',
          properties: {
            server_type: { type: 'string' },
            server_name: { type: 'string' },
            env_vars: { 
              type: 'object',
              additionalProperties: { type: 'string' }
            },
            volumes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  host_path: { type: 'string' },
                  container_path: { type: 'string' }
                }
              }
            },
            code: {
              type: 'string',
              description: 'Code to execute (for code runner templates)'
            },
            code_filename: {
              type: 'string',
              description: 'Filename for the code (default depends on template)'
            }
          },
          required: ['server_type', 'server_name']
        }
      },
      {
        name: 'docker_list_servers',
        description: 'List managed Docker containers and development environments',
        inputSchema: {
          type: 'object',
          properties: {
            status: { 
              type: 'string',
              enum: ['running', 'stopped', 'all']
            },
            server_type: { type: 'string' }
          }
        }
      },
      {
        name: 'docker_get_logs',
        description: 'Get logs from a Docker container',
        inputSchema: {
          type: 'object',
          properties: {
            server_name: { type: 'string' },
            lines: { type: 'number' },
            since: { type: 'string' },
            follow: { type: 'boolean' }
          },
          required: ['server_name']
        }
      },
      {
        name: 'docker_stop_server',
        description: 'Stop a managed Docker container',
        inputSchema: {
          type: 'object',
          properties: {
            server_name: { type: 'string' }
          },
          required: ['server_name']
        }
      },
      {
        name: 'docker_start_server',
        description: 'Start a stopped Docker container',
        inputSchema: {
          type: 'object',
          properties: {
            server_name: { type: 'string' }
          },
          required: ['server_name']
        }
      },
      {
        name: 'docker_restart_server',
        description: 'Restart a Docker container',
        inputSchema: {
          type: 'object',
          properties: {
            server_name: { type: 'string' }
          },
          required: ['server_name']
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
      // New tools
      case 'docker_build_image':
        result = await buildImage(BuildImageSchema.parse(args));
        break;
        
      case 'docker_run_code': {
        const codeResult = await runCode(RunCodeSchema.parse(args));
        result = codeResult;
        if (!result) {
          // Provide a default response if none is returned
          result = {
            output: "Code execution completed",
            exit_code: 0,
            duration_ms: 0,
            success: true
          };
        }
        break;
      }
      
      case 'docker_register_template': {
        result = await registerTemplate(RegisterTemplateSchema.parse(args));
        break;
      }
      
      // Legacy tools
      case 'docker_list_templates':
        result = await getAvailableServerTemplates();
        break;
        
      case 'docker_create_server': {
        const createResult = await createServer(CreateServerSchema.parse(args));
        // Ensure we're returning a properly formatted result
        result = createResult; 
        if (!result) {
          // If no result was returned, provide a default success message
          result = { 
            id: "unknown",
            name: args.server_name,
            status: "created" 
          };
        }
        break;
      }
      
      case 'docker_list_servers':
        result = await listServers(ListServersSchema.parse(args));
        break;
      
      case 'docker_get_logs':
        result = await getServerLogs(GetServerLogsSchema.parse(args));
        break;
      
      case 'docker_stop_server': {
        const stopResult = await stopServer(ServerOperationSchema.parse(args));
        result = stopResult;
        if (!result) {
          // Provide a default response if none is returned
          result = {
            name: args.server_name,
            status: "stopped"
          };
        }
        break;
      }
      
      case 'docker_start_server': {
        const startResult = await startServer(ServerOperationSchema.parse(args));
        result = startResult;
        if (!result) {
          // Provide a default response if none is returned
          result = {
            name: args.server_name,
            status: "running"
          };
        }
        break;
      }
      
      case 'docker_restart_server': {
        const restartResult = await restartServer(ServerOperationSchema.parse(args));
        result = restartResult;
        if (!result) {
          // Provide a default response if none is returned
          result = {
            name: args.server_name,
            status: "running"
          };
        }
        break;
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    // Return response in the expected MCP protocol format
    return {
      content: [
        {
          type: "text",
          text: result ? JSON.stringify(result, null, 2) : "Operation completed successfully"
        }
      ],
      isError: false
    };
  } catch (error) {
    Logger.error(`Error executing tool ${name}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof DockerError ? error.name : 'InternalServerError';
    
    // Log detailed error for debugging
    Logger.error(`Error details: ${errorMessage}`, error);
    
    // Always return a valid MCP response
    if (name === 'docker_create_server') {
      const args = request.params.arguments as any;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              id: "error",
              name: args.server_name || "unknown",
              status: "error",
              error: errorMessage
            })
          }
        ],
        isError: true
      };
    } else if (name === 'docker_stop_server' || name === 'docker_start_server' || name === 'docker_restart_server') {
      const args = request.params.arguments as any;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              name: args.server_name || "unknown",
              status: name.includes('stop') ? "stopped" : "running",
              error: errorMessage
            })
          }
        ],
        isError: true
      };
    } else {
      // Default error response
      return {
        content: [
          {
            type: "text",
            text: `Error: ${errorMessage}`
          }
        ],
        isError: true
      };
    }
  }
});

// Start the server
async function main() {
  try {
    Logger.info('Starting Docker MCP Server...');
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    Logger.info('Docker MCP Server running on stdio');
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  Logger.error('Fatal error in main():', error);
  process.exit(1);
});