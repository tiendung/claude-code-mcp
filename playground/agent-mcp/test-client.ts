import { EventEmitter } from 'events';
import { createInterface } from 'readline';
import { spawn } from 'child_process';

// Configuration
const MCP_SERVER_PATH = './dist/index.js';

// Set up communication
interface McpRequest {
  type: 'listTools' | 'callTool';
  tool?: string;
  input?: unknown;
}

interface McpResponse {
  error?: {
    message: string;
    name: string;
  };
  [key: string]: unknown;
}

class McpClient extends EventEmitter {
  private serverProcess: ReturnType<typeof spawn>;
  private responseQueue: ((response: McpResponse) => void)[] = [];
  private readyPromise: Promise<void>;

  constructor(serverPath: string) {
    super();
    
    // Start server process
    this.serverProcess = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Handle server output
    const rl = createInterface({
      input: this.serverProcess.stdout,
      terminal: false
    });
    
    rl.on('line', (line) => {
      try {
        const response = JSON.parse(line) as McpResponse;
        const callback = this.responseQueue.shift();
        if (callback) {
          callback(response);
        }
      } catch (error) {
        console.error('Error parsing server response:', error);
      }
    });
    
    // Handle server errors
    this.serverProcess.stderr.on('data', (data) => {
      console.error(`Server error: ${data.toString()}`);
    });
    
    // Initialize the ready promise
    this.readyPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, 500); // Give server time to start
    });
  }
  
  private async sendRequest(request: McpRequest): Promise<McpResponse> {
    await this.readyPromise;
    
    return new Promise<McpResponse>((resolve) => {
      this.responseQueue.push(resolve);
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }
  
  async listTools(): Promise<McpResponse> {
    return this.sendRequest({ type: 'listTools' });
  }
  
  async callTool(tool: string, input: unknown): Promise<McpResponse> {
    return this.sendRequest({ 
      type: 'callTool', 
      tool, 
      input 
    });
  }
  
  close(): void {
    this.serverProcess.kill();
  }
}

// Main test function
async function runTests(): Promise<void> {
  console.log('Starting MCP Agent server tests...');
  
  const client = new McpClient(MCP_SERVER_PATH);
  
  try {
    // Test 1: List tools
    console.log('\n--- Test 1: List Tools ---');
    const toolsResponse = await client.listTools();
    console.log('Available tools:', JSON.stringify(toolsResponse, null, 2));
    
    // Test 2: Create an agent
    console.log('\n--- Test 2: Create Agent ---');
    const createResponse = await client.callTool('create_agent', {
      name: 'test-agent',
      instructions: 'Test the agent MCP server by executing a series of commands.'
    });
    console.log('Created agent:', JSON.stringify(createResponse, null, 2));
    
    if (!createResponse.id) {
      throw new Error('Failed to create agent');
    }
    
    const agentId = createResponse.id as string;
    
    // Test 3: Run the agent
    console.log('\n--- Test 3: Run Agent ---');
    const runResponse = await client.callTool('run_agent', {
      agentId,
      additionalInstructions: 'Also verify the results are correct.'
    });
    console.log('Agent execution started:', JSON.stringify(runResponse, null, 2));
    
    // Test 4: Get agent status
    console.log('\n--- Test 4: Get Agent Status ---');
    
    // Wait a moment for agent execution to potentially complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const getResponse = await client.callTool('get_agent', {
      agentId
    });
    console.log('Agent status:', JSON.stringify(getResponse, null, 2));
    
    // Test 5: List agents
    console.log('\n--- Test 5: List Agents ---');
    const listResponse = await client.callTool('list_agents', {});
    console.log('All agents:', JSON.stringify(listResponse, null, 2));
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    client.close();
  }
}

// Run the tests
runTests().catch(console.error);