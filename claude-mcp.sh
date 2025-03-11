export CLAUDE_FILESYSTEM_PATH="$HOME/codi/claude-code-mcp"
export MCP_REPO_PATH="$HOME/codi/claude-code-mcp" # clone of https://github.com/modelcontextprotocol/servers
export MCP_LOCAL_PATH="$HOME/codi/claude-code-mcp"

export CLAUDE_MEMORY_PATH="$MCP_REPO_PATH/data/memory/memory.json"
export CLAUDE_SQLITE_PATH="$MCP_REPO_PATH/data/sqlite/test.db"

# First remove any existing servers with the same names
claude mcp remove brave-search
claude mcp remove github
claude mcp remove memory
claude mcp remove filesystem
claude mcp remove fetch
claude mcp remove e2b
claude mcp remove linear  # removed
claude mcp remove slack   # removed
claude mcp remove sqlite
claude mcp remove research-papers
claude mcp remove docker  # removed
claude mcp remove mcp-test

# installable js/ts servers
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem $CLAUDE_FILESYSTEM_PATH
claude mcp add memory -e MEMORY_FILE_PATH=$CLAUDE_MEMORY_PATH -- npx -y @modelcontextprotocol/server-memory
claude mcp add brave-search -e BRAVE_API_KEY=$BRAVE_API_KEY -- npx -y @modelcontextprotocol/server-brave-search
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN -- npx -y @modelcontextprotocol/server-github
# claude mcp add linear -e LINEAR_API_KEY=$LINEAR_API_KEY -- npx -y @ibraheem4/linear-mcp
# claude mcp add e2b -e E2B_API_KEY=$E2B_API_KEY -- npx -y @e2b/mcp-server 
# claude mcp add slack -e SLACK_BOT_TOKEN=$SLACK_CLAUDE_BOT_TOKEN SLACK_TEAM_ID=$SLACK_TEAM_ID -- npx -y @modelcontextprotocol/server-slack 

# installable python servers
claude mcp add fetch uvx mcp-server-fetch

# local js/ts servers

# local python servers
# claude mcp add sqlite -- uv --directory "${MCP_REPO_PATH}/src/sqlite" run mcp-server-sqlite --db-path $CLAUDE_SQLITE_PATH
# claude
