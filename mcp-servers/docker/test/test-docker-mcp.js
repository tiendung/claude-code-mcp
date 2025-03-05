#!/usr/bin/env node

/**
 * Test script for Docker MCP server
 * 
 * This script simulates MCP request/response communication with the Docker MCP server
 * to test container management functionality.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';

// Configuration
const SERVER_PATH = '../dist/index.js';

// Create test output directory
const TEST_DIR = path.resolve(process.cwd(), 'test-output');
if (!fs.existsSync(TEST_DIR)) {
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

const LOG_FILE = path.join(TEST_DIR, 'test.log');
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'w' });

// Logging with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

// Test runner
async function runTests() {
  log('Starting Docker MCP server tests...');
  
  // Start the server
  const server = spawn('node', [SERVER_PATH], {
    env: {
      ...process.env,
      MCP_SERVERS_PATH: path.resolve(process.cwd(), '../templates'),
      LOG_LEVEL: 'DEBUG'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Handle server logs
  server.stderr.on('data', (data) => {
    log(`Server log: ${data.toString().trim()}`);
  });
  
  // Set up interface to read stdout
  const rl = createInterface({
    input: server.stdout,
    terminal: false
  });
  
  // Track response count
  let responseCount = 0;
  let lastResponse = null;
  
  // Handle server responses
  rl.on('line', (line) => {
    log(`Response: ${line}`);
    
    try {
      const response = JSON.parse(line);
      lastResponse = response;
      responseCount++;
      
      // Process response based on the test phase
      processResponse(response, responseCount);
    } catch (error) {
      log(`Error parsing response: ${error.message}`);
    }
  });
  
  // Function to process a response
  function processResponse(response, count) {
    switch (count) {
      case 1: // List tools response
        if (response.tools && Array.isArray(response.tools)) {
          log('✓ Successfully listed tools');
          
          // Start the next test
          setTimeout(() => {
            sendCreateServerRequest(server);
          }, 1000);
        } else {
          log('✗ Failed to list tools');
          exitTest(1);
        }
        break;
        
      case 2: // Create server response
        if (response.content && response.content[0]?.text) {
          const result = JSON.parse(response.content[0].text);
          if (result.id && result.name) {
            log(`✓ Successfully created server: ${result.name}`);
            
            // Start the next test
            setTimeout(() => {
              sendListServersRequest(server);
            }, 1000);
          } else {
            log('✗ Failed to create server');
            exitTest(1);
          }
        } else if (response.error) {
          log(`✗ Error creating server: ${response.error.message}`);
          
          // Still continue with listing servers
          setTimeout(() => {
            sendListServersRequest(server);
          }, 1000);
        } else {
          log('✗ Invalid response format');
          exitTest(1);
        }
        break;
        
      case 3: // List servers response
        if (response.content && response.content[0]?.text) {
          const result = JSON.parse(response.content[0].text);
          if (Array.isArray(result)) {
            log(`✓ Successfully listed servers: ${result.length} found`);
            
            // Complete the test
            setTimeout(() => {
              log('All tests completed successfully');
              exitTest(0);
            }, 1000);
          } else {
            log('✗ Invalid server list format');
            exitTest(1);
          }
        } else if (response.error) {
          log(`✗ Error listing servers: ${response.error.message}`);
          exitTest(1);
        } else {
          log('✗ Invalid response format');
          exitTest(1);
        }
        break;
    }
  }
  
  // Function to cleanly exit the test
  function exitTest(code) {
    server.kill();
    setTimeout(() => {
      logStream.end(() => {
        process.exit(code);
      });
    }, 500);
  }
  
  // Set a timeout for the entire test
  setTimeout(() => {
    log('Test timeout reached');
    exitTest(1);
  }, 30000);
  
  // Start with listing tools
  setTimeout(() => {
    sendListToolsRequest(server);
  }, 1000);
  
  // Handle server exit
  server.on('exit', (code) => {
    log(`Server exited with code ${code}`);
    if (responseCount < 3) {
      log('Not all tests completed before server exit');
      process.exit(1);
    }
  });
}

// Request sender functions
function sendListToolsRequest(server) {
  log('Sending tools/list request...');
  server.stdin.write(JSON.stringify({
    method: 'tools/list'
  }) + '\n');
}

function sendCreateServerRequest(server) {
  log('Sending docker_create_server request...');
  server.stdin.write(JSON.stringify({
    method: 'tools/call',
    params: {
      name: 'docker_create_server',
      arguments: {
        server_type: 'agent-mcp',
        server_name: 'test-agent-server',
        env_vars: {
          LOG_LEVEL: 'DEBUG',
          ANTHROPIC_API_KEY: 'test_key'
        }
      }
    }
  }) + '\n');
}

function sendListServersRequest(server) {
  log('Sending docker_list_servers request...');
  server.stdin.write(JSON.stringify({
    method: 'tools/call',
    params: {
      name: 'docker_list_servers',
      arguments: {
        status: 'all'
      }
    }
  }) + '\n');
}

// Run the tests
runTests().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});