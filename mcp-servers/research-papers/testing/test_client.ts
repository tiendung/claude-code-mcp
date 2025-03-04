/**
 * Test client for the Research Papers MCP Server
 * This simple CLI tool allows testing functionality without needing to register with Claude
 */

import { spawn, ChildProcess } from 'child_process';
import { createInterface } from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

// Define the directory where the MCP server is located
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, '..', 'dist', 'index.js');

// Available commands
const COMMANDS = {
  IMPORT_PAPER: 'import_paper',
  SEARCH_PAPERS: 'search_papers',
  LIST_PAPERS: 'list_papers',
  GET_PAPER: 'get_paper',
  ADD_TAGS: 'add_tags',
  REMOVE_TAGS: 'remove_tags',
  UPDATE_STATUS: 'update_status',
  ADD_NOTE: 'add_note',
  SET_IMPORTANCE: 'set_importance',
  CREATE_COLLECTION: 'create_collection',
  LIST_COLLECTIONS: 'list_collections',
  GET_CITATIONS: 'get_citations',
  IMPORT_CITATIONS: 'import_citations',
  HELP: 'help',
  EXIT: 'exit',
};

// Command help text
const HELP_TEXT = `
Available commands:
  ${COMMANDS.IMPORT_PAPER} <paperId> - Import a paper by DOI, arXiv ID, etc.
  ${COMMANDS.SEARCH_PAPERS} <query> [limit] - Search for papers and import them
  ${COMMANDS.LIST_PAPERS} - List all papers in the repository
  ${COMMANDS.GET_PAPER} <paperId> - Get details for a specific paper
  ${COMMANDS.ADD_TAGS} <paperId> <tag1,tag2,...> - Add tags to a paper
  ${COMMANDS.REMOVE_TAGS} <paperId> <tag1,tag2,...> - Remove tags from a paper
  ${COMMANDS.UPDATE_STATUS} <paperId> <unread|reading|read> - Update read status
  ${COMMANDS.ADD_NOTE} <paperId> "<note text>" - Add a note to a paper
  ${COMMANDS.SET_IMPORTANCE} <paperId> <1-5> - Set paper importance
  ${COMMANDS.CREATE_COLLECTION} <name> "<description>" - Create a collection
  ${COMMANDS.LIST_COLLECTIONS} - List all collections
  ${COMMANDS.GET_CITATIONS} <paperId> - Get citation info for a paper
  ${COMMANDS.IMPORT_CITATIONS} <paperId> - Import paper's citations
  ${COMMANDS.HELP} - Show this help text
  ${COMMANDS.EXIT} - Exit the application
`;

// MCP Message types and format
interface MCPMessage {
  jsonrpc: '2.0';
  id?: number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

class MCPTestClient {
  private serverProcess: ChildProcess | null = null;
  private readline: any;
  private nextId = 1;
  private waitingForResponse: Map<number, (result: any) => void> = new Map();

  /**
   * Start the MCP server and set up the command interface
   */
  async start() {
    try {
      // Start the server process
      this.serverProcess = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Create readline interface
      this.readline = createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'research-papers> '
      });

      // Set up server output handling
      if (this.serverProcess.stdout) {
        this.serverProcess.stdout.on('data', (data) => {
          const lines = data.toString().split('\n').filter(Boolean);
          
          for (const line of lines) {
            try {
              const message = JSON.parse(line) as MCPMessage;
              if (message.id && this.waitingForResponse.has(message.id)) {
                const callback = this.waitingForResponse.get(message.id);
                if (callback) {
                  callback(message.result || message.error);
                }
                this.waitingForResponse.delete(message.id);
              } else if (message.method) {
                console.log(`[Server Notification] ${message.method}`);
              }
            } catch (err) {
              console.error('Failed to parse server output:', line);
            }
          }
        });
      }

      // Handle server errors
      if (this.serverProcess.stderr) {
        this.serverProcess.stderr.on('data', (data) => {
          console.error(`[Server Error]: ${data.toString()}`);
        });
      }

      // Initialize the server by requesting tool list
      await this.listTools();
      
      console.log('Research Papers MCP Test Client');
      console.log('Type "help" for available commands');
      
      // Start the command prompt
      this.readline.prompt();
      this.readline.on('line', async (line: string) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          await this.handleCommand(trimmedLine);
        }
        this.readline.prompt();
      });

      // Handle exit
      this.readline.on('close', () => {
        console.log('Exiting...');
        this.stop();
      });
    } catch (error) {
      console.error('Failed to start MCP test client:', error);
      this.stop();
    }
  }

  /**
   * Clean up resources and exit
   */
  stop() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
    if (this.readline) {
      this.readline.close();
    }
    process.exit(0);
  }

  /**
   * Send a JSON-RPC message to the server and await response
   */
  async sendMessage(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.serverProcess || !this.serverProcess.stdin) {
        reject(new Error('Server process not available'));
        return;
      }

      const id = this.nextId++;
      const message: MCPMessage = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      // Set up waiting for response
      this.waitingForResponse.set(id, resolve);

      // Send the message to the server
      this.serverProcess.stdin.write(JSON.stringify(message) + '\n');
    });
  }

  /**
   * Get the list of available tools from the server
   */
  async listTools(): Promise<string[]> {
    try {
      const result = await this.sendMessage('mcp/list_tools');
      return result.tools.map((tool: any) => tool.name);
    } catch (error) {
      console.error('Failed to list tools:', error);
      return [];
    }
  }

  /**
   * Call a specific tool with arguments
   */
  async callTool(name: string, args: any): Promise<any> {
    try {
      const result = await this.sendMessage('mcp/call_tool', {
        name,
        arguments: args
      });
      
      if (result.content && result.content.length > 0) {
        return JSON.parse(result.content[0].text);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to call tool ${name}:`, error);
      throw error;
    }
  }

  /**
   * Parse and handle command line input
   */
  async handleCommand(input: string): Promise<void> {
    const parts = input.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g) || [];
    const args = parts.map(part => part.startsWith('"') && part.endsWith('"') 
      ? part.substring(1, part.length - 1) 
      : part
    );
    
    const command = args[0]?.toLowerCase();
    
    try {
      switch (command) {
        case COMMANDS.IMPORT_PAPER:
          if (!args[1]) {
            console.log('Usage: import_paper <paperId>');
            return;
          }
          const paper = await this.callTool('import_paper_by_id', { paperId: args[1] });
          console.log(JSON.stringify(paper, null, 2));
          break;
          
        case COMMANDS.SEARCH_PAPERS:
          if (!args[1]) {
            console.log('Usage: search_papers <query> [limit]');
            return;
          }
          const limit = args[2] ? parseInt(args[2], 10) : 5;
          const papers = await this.callTool('search_and_import_papers', { 
            query: args[1],
            limit 
          });
          console.log(`Found ${papers.length} papers:`);
          for (const p of papers) {
            console.log(`- ${p.id}: ${p.title} (${p.year || 'unknown year'})`);
          }
          break;
          
        case COMMANDS.LIST_PAPERS:
          const allPapers = await this.callTool('list_papers', {});
          console.log(`Total papers: ${allPapers.length}`);
          for (const p of allPapers) {
            console.log(`- ${p.id}: ${p.title} (${p.year || 'unknown year'})`);
          }
          break;
          
        case COMMANDS.GET_PAPER:
          if (!args[1]) {
            console.log('Usage: get_paper <paperId>');
            return;
          }
          const paperDetails = await this.callTool('get_paper', { paperId: args[1] });
          console.log(JSON.stringify(paperDetails, null, 2));
          break;
          
        case COMMANDS.ADD_TAGS:
          if (!args[1] || !args[2]) {
            console.log('Usage: add_tags <paperId> <tag1,tag2,...>');
            return;
          }
          const tags = args[2].split(',').map(t => t.trim());
          const paperWithTags = await this.callTool('add_paper_tags', { 
            paperId: args[1],
            tags
          });
          console.log(`Added tags to paper: ${paperWithTags.title}`);
          console.log(`Tags: ${paperWithTags.tags.join(', ')}`);
          break;
          
        case COMMANDS.REMOVE_TAGS:
          if (!args[1] || !args[2]) {
            console.log('Usage: remove_tags <paperId> <tag1,tag2,...>');
            return;
          }
          const tagsToRemove = args[2].split(',').map(t => t.trim());
          const paperAfterRemove = await this.callTool('remove_paper_tags', { 
            paperId: args[1],
            tags: tagsToRemove
          });
          console.log(`Removed tags from paper: ${paperAfterRemove.title}`);
          console.log(`Remaining tags: ${paperAfterRemove.tags.join(', ')}`);
          break;
          
        case COMMANDS.UPDATE_STATUS:
          if (!args[1] || !args[2]) {
            console.log('Usage: update_status <paperId> <unread|reading|read>');
            return;
          }
          const readStatus = args[2];
          if (!['unread', 'reading', 'read'].includes(readStatus)) {
            console.log('Status must be one of: unread, reading, read');
            return;
          }
          const updatedPaper = await this.callTool('update_read_status', { 
            paperId: args[1],
            readStatus
          });
          console.log(`Updated status of "${updatedPaper.title}" to ${readStatus}`);
          break;
          
        case COMMANDS.ADD_NOTE:
          if (!args[1] || !args[2]) {
            console.log('Usage: add_note <paperId> "<note text>"');
            return;
          }
          const paperWithNote = await this.callTool('add_paper_note', { 
            paperId: args[1],
            note: args[2]
          });
          console.log(`Added note to paper: ${paperWithNote.title}`);
          console.log(`Notes: ${paperWithNote.notes.length}`);
          break;
          
        case COMMANDS.SET_IMPORTANCE:
          if (!args[1] || !args[2]) {
            console.log('Usage: set_importance <paperId> <1-5>');
            return;
          }
          const importance = parseInt(args[2], 10);
          if (importance < 1 || importance > 5) {
            console.log('Importance must be between 1 and 5');
            return;
          }
          const importantPaper = await this.callTool('set_paper_importance', { 
            paperId: args[1],
            importance
          });
          console.log(`Set importance of "${importantPaper.title}" to ${importance}`);
          break;
          
        case COMMANDS.CREATE_COLLECTION:
          if (!args[1] || !args[2]) {
            console.log('Usage: create_collection <name> "<description>"');
            return;
          }
          const collection = await this.callTool('create_collection', { 
            name: args[1],
            description: args[2]
          });
          console.log(`Created collection: ${collection.name} (${collection.id})`);
          console.log(`Description: ${collection.description}`);
          break;
          
        case COMMANDS.LIST_COLLECTIONS:
          const collections = await this.callTool('list_collections', {});
          console.log(`Total collections: ${collections.length}`);
          for (const c of collections) {
            console.log(`- ${c.id}: ${c.name} (${c.papers.length} papers)`);
          }
          break;
          
        case COMMANDS.GET_CITATIONS:
          if (!args[1]) {
            console.log('Usage: get_citations <paperId>');
            return;
          }
          const citationInfo = await this.callTool('get_paper_citation_info', { 
            paperId: args[1]
          });
          console.log(`Citation information for: ${citationInfo.paper.title}`);
          console.log(`Citations: ${citationInfo.citations.length}`);
          console.log(`References: ${citationInfo.references.length}`);
          break;
          
        case COMMANDS.IMPORT_CITATIONS:
          if (!args[1]) {
            console.log('Usage: import_citations <paperId>');
            return;
          }
          const importResult = await this.callTool('import_paper_citations', { 
            paperId: args[1]
          });
          console.log(importResult);
          break;
          
        case COMMANDS.HELP:
          console.log(HELP_TEXT);
          break;
          
        case COMMANDS.EXIT:
          console.log('Exiting...');
          this.stop();
          break;
          
        default:
          console.log(`Unknown command: ${command}`);
          console.log('Type "help" for available commands');
      }
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }
}

// Create and start the client
const client = new MCPTestClient();
client.start().catch(error => {
  console.error('Failed to start client:', error);
  process.exit(1);
});