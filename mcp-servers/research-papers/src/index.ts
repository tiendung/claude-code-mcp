#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { paperService } from "./services/paperService.js";
import { PaperEntity, Collection, PaperFilter, ReadStatus } from "./types/paper.js";

// Create the server instance
const server = new Server(
  {
    name: "research-papers-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools we provide
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // ===== Paper Import & Retrieval =====
      {
        name: "import_paper_by_id",
        description: "Import a paper from Semantic Scholar by ID (DOI, arXiv ID, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper to import" },
          },
          required: ["paperId"],
        },
      },
      {
        name: "search_and_import_papers",
        description: "Search for papers on Semantic Scholar and import matching papers",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            limit: { type: "number", description: "Maximum number of results" },
          },
          required: ["query"],
        },
      },
      {
        name: "get_paper",
        description: "Get a paper by ID",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper to retrieve" },
          },
          required: ["paperId"],
        },
      },
      {
        name: "list_papers",
        description: "List all papers with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            title: { type: "string", description: "Filter by title (partial match)" },
            authors: { 
              type: "array", 
              items: { type: "string" },
              description: "Filter by authors (array of author names)" 
            },
            year: { 
              type: "object", 
              properties: {
                from: { type: "number", description: "Start year" },
                to: { type: "number", description: "End year" },
              },
              description: "Filter by year range" 
            },
            venue: { type: "string", description: "Filter by venue/journal/conference" },
            tags: { 
              type: "array", 
              items: { type: "string" },
              description: "Filter by tags (must have all specified tags)" 
            },
            categories: { 
              type: "array", 
              items: { type: "string" },
              description: "Filter by categories (must have at least one)" 
            },
            readStatus: { 
              type: "string", 
              enum: ["unread", "reading", "read"],
              description: "Filter by read status" 
            },
            importance: { 
              type: "object", 
              properties: {
                min: { type: "number", description: "Minimum importance (1-5)" },
                max: { type: "number", description: "Maximum importance (1-5)" },
              },
              description: "Filter by importance level range" 
            },
          },
        },
      },
      
      // ===== Paper Management =====
      {
        name: "add_paper_tags",
        description: "Add tags to a paper",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper" },
            tags: { 
              type: "array", 
              items: { type: "string" },
              description: "Tags to add" 
            },
          },
          required: ["paperId", "tags"],
        },
      },
      {
        name: "remove_paper_tags",
        description: "Remove tags from a paper",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper" },
            tags: { 
              type: "array", 
              items: { type: "string" },
              description: "Tags to remove" 
            },
          },
          required: ["paperId", "tags"],
        },
      },
      {
        name: "update_read_status",
        description: "Update the read status of a paper",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper" },
            readStatus: { 
              type: "string", 
              enum: ["unread", "reading", "read"],
              description: "The new read status" 
            },
          },
          required: ["paperId", "readStatus"],
        },
      },
      {
        name: "add_paper_note",
        description: "Add a note to a paper",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper" },
            note: { type: "string", description: "The note to add" },
          },
          required: ["paperId", "note"],
        },
      },
      {
        name: "set_paper_importance",
        description: "Set the importance level of a paper",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper" },
            importance: { 
              type: "number", 
              minimum: 1,
              maximum: 5,
              description: "The importance level (1-5)" 
            },
          },
          required: ["paperId", "importance"],
        },
      },
      
      // ===== Collection Management =====
      {
        name: "create_collection",
        description: "Create a new collection",
        inputSchema: {
          type: "object",
          properties: {
            name: { type: "string", description: "Collection name" },
            description: { type: "string", description: "Collection description" },
            paperIds: { 
              type: "array", 
              items: { type: "string" },
              description: "Initial paper IDs to include" 
            },
            tags: { 
              type: "array", 
              items: { type: "string" },
              description: "Collection tags" 
            },
          },
          required: ["name", "description"],
        },
      },
      {
        name: "add_papers_to_collection",
        description: "Add papers to a collection",
        inputSchema: {
          type: "object",
          properties: {
            collectionId: { type: "string", description: "The ID of the collection" },
            paperIds: { 
              type: "array", 
              items: { type: "string" },
              description: "Paper IDs to add" 
            },
          },
          required: ["collectionId", "paperIds"],
        },
      },
      {
        name: "remove_papers_from_collection",
        description: "Remove papers from a collection",
        inputSchema: {
          type: "object",
          properties: {
            collectionId: { type: "string", description: "The ID of the collection" },
            paperIds: { 
              type: "array", 
              items: { type: "string" },
              description: "Paper IDs to remove" 
            },
          },
          required: ["collectionId", "paperIds"],
        },
      },
      {
        name: "get_collection_papers",
        description: "Get all papers in a collection",
        inputSchema: {
          type: "object",
          properties: {
            collectionId: { type: "string", description: "The ID of the collection" },
          },
          required: ["collectionId"],
        },
      },
      
      // ===== Citation Management =====
      {
        name: "get_paper_citation_info",
        description: "Get citation information for a paper",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper" },
          },
          required: ["paperId"],
        },
      },
      {
        name: "import_paper_citations",
        description: "Import citations for a paper from Semantic Scholar",
        inputSchema: {
          type: "object",
          properties: {
            paperId: { type: "string", description: "The ID of the paper" },
          },
          required: ["paperId"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  try {
    switch (name) {
      // ===== Paper Import & Retrieval =====
      case "import_paper_by_id": {
        const paperId = args.paperId as string;
        const paper = await paperService.importPaperById(paperId);
        return { content: [{ type: "text", text: JSON.stringify(paper, null, 2) }] };
      }
      
      case "search_and_import_papers": {
        const query = args.query as string;
        const limit = typeof args.limit === 'number' ? args.limit : 5;
        const papers = await paperService.searchAndImportPapers(query, limit);
        return { content: [{ type: "text", text: JSON.stringify(papers, null, 2) }] };
      }
      
      case "get_paper": {
        const paperId = args.paperId as string;
        const paper = await paperService.getPaper(paperId);
        if (!paper) {
          return { content: [{ type: "text", text: `Paper with ID ${paperId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(paper, null, 2) }] };
      }
      
      case "list_papers": {
        // Construct filter from args
        const filter: PaperFilter = {};
        
        if (args.title) filter.title = args.title as string;
        if (args.authors && Array.isArray(args.authors)) filter.authors = args.authors as string[];
        if (args.year) filter.year = args.year;
        if (args.venue) filter.venue = args.venue as string;
        if (args.tags && Array.isArray(args.tags)) filter.tags = args.tags as string[];
        if (args.categories && Array.isArray(args.categories)) filter.categories = args.categories as string[];
        if (args.readStatus) filter.readStatus = args.readStatus as ReadStatus;
        if (args.importance) filter.importance = args.importance;
        
        const papers = await paperService.listPapers(filter);
        return { content: [{ type: "text", text: JSON.stringify(papers, null, 2) }] };
      }
      
      // ===== Paper Management =====
      case "add_paper_tags": {
        const paperId = args.paperId as string;
        const tags = Array.isArray(args.tags) ? args.tags as string[] : [];
        const paper = await paperService.addPaperTags(paperId, tags);
        if (!paper) {
          return { content: [{ type: "text", text: `Paper with ID ${paperId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(paper, null, 2) }] };
      }
      
      case "remove_paper_tags": {
        const paperId = args.paperId as string;
        const tags = Array.isArray(args.tags) ? args.tags as string[] : [];
        const paper = await paperService.removePaperTags(paperId, tags);
        if (!paper) {
          return { content: [{ type: "text", text: `Paper with ID ${paperId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(paper, null, 2) }] };
      }
      
      case "update_read_status": {
        const paperId = args.paperId as string;
        const readStatus = args.readStatus as ReadStatus;
        const paper = await paperService.updateReadStatus(paperId, readStatus);
        if (!paper) {
          return { content: [{ type: "text", text: `Paper with ID ${paperId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(paper, null, 2) }] };
      }
      
      case "add_paper_note": {
        const paperId = args.paperId as string;
        const note = args.note as string;
        const paper = await paperService.addPaperNote(paperId, note);
        if (!paper) {
          return { content: [{ type: "text", text: `Paper with ID ${paperId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(paper, null, 2) }] };
      }
      
      case "set_paper_importance": {
        const paperId = args.paperId as string;
        const importance = typeof args.importance === 'number' ? args.importance : 3;
        const paper = await paperService.setPaperImportance(paperId, importance);
        if (!paper) {
          return { content: [{ type: "text", text: `Paper with ID ${paperId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(paper, null, 2) }] };
      }
      
      // ===== Collection Management =====
      case "create_collection": {
        const name = args.name as string; 
        const description = args.description as string;
        const paperIds = Array.isArray(args.paperIds) ? args.paperIds as string[] : [];
        const tags = Array.isArray(args.tags) ? args.tags as string[] : [];
        
        const collection = await paperService.createCollection(
          name, 
          description, 
          paperIds, 
          tags
        );
        return { content: [{ type: "text", text: JSON.stringify(collection, null, 2) }] };
      }
      
      case "add_papers_to_collection": {
        const collectionId = args.collectionId as string;
        const paperIds = Array.isArray(args.paperIds) ? args.paperIds as string[] : [];
        const collection = await paperService.addPapersToCollection(collectionId, paperIds);
        if (!collection) {
          return { content: [{ type: "text", text: `Collection with ID ${collectionId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(collection, null, 2) }] };
      }
      
      case "remove_papers_from_collection": {
        const collectionId = args.collectionId as string;
        const paperIds = Array.isArray(args.paperIds) ? args.paperIds as string[] : [];
        const collection = await paperService.removePapersFromCollection(collectionId, paperIds);
        if (!collection) {
          return { content: [{ type: "text", text: `Collection with ID ${collectionId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(collection, null, 2) }] };
      }
      
      case "get_collection_papers": {
        const collectionId = args.collectionId as string;
        const papers = await paperService.getCollectionPapers(collectionId);
        if (!papers) {
          return { content: [{ type: "text", text: `Collection with ID ${collectionId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(papers, null, 2) }] };
      }
      
      // ===== Citation Management =====
      case "get_paper_citation_info": {
        const paperId = args.paperId as string;
        const info = await paperService.getPaperCitationInfo(paperId);
        if (!info) {
          return { content: [{ type: "text", text: `Paper with ID ${paperId} not found.` }] };
        }
        return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
      }
      
      case "import_paper_citations": {
        const paperId = args.paperId as string;
        const count = await paperService.importPaperCitations(paperId);
        return { 
          content: [{ 
            type: "text", 
            text: `Successfully imported ${count} citations for paper ${paperId}.` 
          }] 
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return { 
      content: [{ 
        type: "text", 
        text: `Error executing tool ${name}: ${(error as Error).message}` 
      }] 
    };
  }
});

async function main() {
  console.error("Starting Research Papers MCP Server...");
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Research Papers MCP Server connected and running");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});