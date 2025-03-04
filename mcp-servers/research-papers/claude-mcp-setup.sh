#!/bin/bash
# Setup script for the Research Papers MCP server with Claude Code

# Set directory paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_NAME="research-papers"

# Build the project
echo "Building Research Papers MCP server..."
cd "$SCRIPT_DIR"
npm install
npm run build

# Register with Claude
echo "Registering Research Papers MCP server with Claude Code..."
claude mcp add "$SERVER_NAME" -- node "$SCRIPT_DIR/dist/index.js"

echo "Research Papers MCP server has been registered as '$SERVER_NAME'"
echo "You can now interact with it in Claude Code!"
echo ""
echo "Try these sample commands in your Claude session:"
echo "- Search and import papers: search for research papers about 'large language models'"
echo "- List papers: show me all the papers you've imported"
echo "- Get paper details: what's the abstract of that first paper?"
echo "- Add tags: tag that paper as 'important' and 'llm'"
echo "- Collections: create a collection called 'LLM Papers'"