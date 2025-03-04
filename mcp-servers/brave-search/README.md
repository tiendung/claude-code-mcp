# Brave Search MCP Server (Claude Code Implementation)

An MCP server implementation that integrates the Brave Search API, providing both web and local search capabilities. This is a local implementation for the Claude Code project, based on the reference implementation from the MCP servers repository.

## Features

- **Web Search**: General queries, news, articles, with pagination and freshness controls
- **Local Search**: Find businesses, restaurants, and services with detailed information
- **Flexible Filtering**: Control result types, safety levels, and content freshness
- **Smart Fallbacks**: Local search automatically falls back to web when no results are found

## Tools

- **brave_web_search**
  - Execute web searches with pagination and filtering
  - Inputs:
    - `query` (string): Search terms
    - `count` (number, optional): Results per page (max 20)
    - `offset` (number, optional): Pagination offset (max 9)

- **brave_local_search**
  - Search for local businesses and services
  - Inputs:
    - `query` (string): Local search terms
    - `count` (number, optional): Number of results (max 20)
  - Automatically falls back to web search if no local results found

## Configuration

### Getting an API Key
1. Sign up for a [Brave Search API account](https://brave.com/search/api/)
2. Choose a plan (Free tier available with 2,000 queries/month)
3. Generate your API key [from the developer dashboard](https://api.search.brave.com/app/keys)

### Usage with Claude Code
The server is automatically configured by the Claude Code `claude-mcp` script. Ensure your BRAVE_API_KEY is properly set:

```bash
export BRAVE_API_KEY=your-api-key
```

## Local Development

```bash 
# Install dependencies
npm install

# Build the server
npm run build

# Run the server
node dist/index.js
```

Alternatively, use the build script:

```bash
# From the project root
./scripts/build_brave_search.sh
```

## Testing

You can test the server using the test script:

```bash
# From the project root
python src/brave_search_test/server_test.py "your search query" --tool brave_web_search
```

## Docker Support

Docker build:

```bash
docker build -t mcp/brave-search:latest .
```

## Implementation Notes

This is a local implementation for the Claude Code project, with the following enhancements:
- Updated path configuration to work in our local directory structure
- Added improved build and test scripts
- Enhanced documentation

## API Limitations

- The Brave Search API has a rate limit of 15000 requests per month, and 1 request per second.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
