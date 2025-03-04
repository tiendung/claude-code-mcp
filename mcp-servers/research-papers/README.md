# Research Papers MCP Server

An MCP server for managing and analyzing research papers with Semantic Scholar integration. This server enhances Claude Code with academic research capabilities.

## Features

- Import papers from Semantic Scholar by ID (DOI, arXiv)
- Search and import papers from Semantic Scholar
- Organize papers with collections and tagging
- Track reading status and importance of papers
- Manage citation information
- Add notes and annotations to papers

## Status

This is a custom-developed MCP server (not based on a reference implementation) that provides specialized functionality for academic research workflows. It's fully integrated with the Claude Code MCP infrastructure and available in all Claude Code sessions.

## Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## Claude Code Integration

This server is already registered with Claude Code as "research-papers" through the `claude-mcp-local` script. No additional setup is required.

You can interact with the server through Claude by asking questions like:

- "Search for research papers about large language models"
- "Show me all the papers you've imported"
- "What's the abstract of that first paper?"
- "Tag that paper as important and llm"
- "Create a collection called LLM Papers"

## Testing Without Claude

You can test the server without Claude using either:

### Custom Test Client

```bash
# Run the test client
npm run test-client
```

This provides a command-line interface for interacting with the server.

### MCP Inspector

```bash
# Run with the MCP Inspector (GUI)
npm run inspector
```

## Data Structure

The server organizes data into the following directories:

- `/data/papers/` - Paper metadata JSON files
- `/data/collections/` - Collection metadata
- `/data/citations/` - Citation relationships
- `/data/relations/` - Semantic relationships between papers

## Available MCP Tools

### Paper Import & Retrieval

- `import_paper_by_id` - Import a paper from Semantic Scholar by ID
- `search_and_import_papers` - Search for papers on Semantic Scholar and import matching papers
- `get_paper` - Get a paper by ID
- `list_papers` - List all papers with optional filtering

### Paper Management

- `add_paper_tags` - Add tags to a paper
- `remove_paper_tags` - Remove tags from a paper
- `update_read_status` - Update the read status of a paper
- `add_paper_note` - Add a note to a paper
- `set_paper_importance` - Set the importance level of a paper

### Collection Management

- `create_collection` - Create a new collection
- `add_papers_to_collection` - Add papers to a collection
- `remove_papers_from_collection` - Remove papers from a collection
- `get_collection_papers` - Get all papers in a collection

### Citation Management

- `get_paper_citation_info` - Get citation information for a paper
- `import_paper_citations` - Import citations for a paper from Semantic Scholar

## Development

```bash
# Run in development mode with auto-reload
npm run dev
```

## License

MIT