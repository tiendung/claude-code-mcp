# Testing Guide for Research Papers MCP Server

This guide outlines the approaches for testing the Research Papers MCP server during development.

## Testing Options

We have several options to test the Research Papers MCP server:

1. **MCP Inspector**: For visual testing of tools and interactive debugging
2. **Custom Test Client**: For CLI-based testing and development
3. **Unit Tests**: For testing individual components
4. **Integration with Claude**: For end-to-end testing

## Setup

### Custom Test Client

We've implemented a simple test client that allows testing of the MCP server without integration with Claude. This client:

- Starts the MCP server process
- Communicates with it via standard I/O
- Provides a command-line interface for calling tools
- Shows the raw results

To use it:

```bash
cd playground/research-papers-mcp
npm install
npm run test-client
```

The client provides commands for all major functionality:

```
Available commands:
  import_paper <paperId> - Import a paper by DOI, arXiv ID, etc.
  search_papers <query> [limit] - Search for papers and import them
  list_papers - List all papers in the repository
  get_paper <paperId> - Get details for a specific paper
  add_tags <paperId> <tag1,tag2,...> - Add tags to a paper
  remove_tags <paperId> <tag1,tag2,...> - Remove tags from a paper
  update_status <paperId> <unread|reading|read> - Update read status
  add_note <paperId> "<note text>" - Add a note to a paper
  set_importance <paperId> <1-5> - Set paper importance
  create_collection <name> "<description>" - Create a collection
  list_collections - List all collections
  get_citations <paperId> - Get citation info for a paper
  import_citations <paperId> - Import paper's citations
  help - Show this help text
  exit - Exit the application
```

### MCP Inspector

The MCP Inspector provides a visual interface for testing the server. To use it:

```bash
cd playground/research-papers-mcp
npm install
npm run inspector
```

The Inspector provides:
- A graphical interface to test tools
- JSON schema validation for inputs
- Detailed response visualization
- Log monitoring

## Testing Workflow

A recommended testing workflow:

1. **Initial Development**:
   - Implement core functionality in TypeScript
   - Use unit tests for business logic validation

2. **Interactive Testing**:
   - Use the custom test client for CLI testing
   - For visual testing, use the MCP Inspector
   - Validate input/output formats

3. **Integration Testing**:
   - Once functionality is working properly, test with Claude
   - Register the server with Claude for end-to-end testing

## Example Testing Session

Here's an example testing session using the custom test client:

```
$ npm run test-client

research-papers> search_papers "artificial intelligence" 3
Found 3 papers:
- 649def34f8be52c8b66281af98ae884c09aef38b: General AI Challenge: Round 2 (2022)
- 6d202fcd557a9bc95ec10dd034d98f0c24a30da0: GPT-4 Technical Report (2023)
- 2b4885b82a096f4dfb2fce2c8c2f9b879c56b6ad: What Would a Hybrid Computational-Neural AI System for Artificial General Intelligence Need to Know About Ethics? (2023)

research-papers> get_paper 6d202fcd557a9bc95ec10dd034d98f0c24a30da0
{
  "id": "6d202fcd557a9bc95ec10dd034d98f0c24a30da0",
  "title": "GPT-4 Technical Report",
  "authors": [
    {
      "name": "OpenAI"
    }
  ],
  "abstract": "We report the development...",
  ...
}

research-papers> add_tags 6d202fcd557a9bc95ec10dd034d98f0c24a30da0 gpt,llm,important
Added tags to paper: GPT-4 Technical Report
Tags: gpt, llm, important

research-papers> update_status 6d202fcd557a9bc95ec10dd034d98f0c24a30da0 reading
Updated status of "GPT-4 Technical Report" to reading

research-papers> create_collection "AI Papers" "Important papers on artificial intelligence"
Created collection: AI Papers (78dea35a-b9d9-40e2-bd9e-5d38f847a9e9)
Description: Important papers on artificial intelligence
```

## Next Steps

As development progresses, we can enhance the testing infrastructure with:

1. **Automated Tests**: Create Jest tests for core functionality
2. **Mocking**: Mock the Semantic Scholar API for deterministic testing 
3. **Benchmarking**: Add performance tests for large datasets
4. **CI Integration**: Add testing to the CI pipeline