# Claude Code Helper Guide

## Project Architecture Overview

This project aims to leverage the Model Context Protocol (MCP) to enhance Claude's capabilities through external tools and APIs.

Key concepts:
- We use MCP servers from two sources:
  1. **Reference servers** - Located at `$HOME/dev/mcp-servers-repo` (cloned from [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers))
  2. **Local servers** - Located at `$HOME/dev/claude-code/mcp-servers/` (our own implementations)

The reference MCP servers (from `MCP_REPO_PATH`) should be treated as read-only. Our local MCP servers (in `MCP_LOCAL_PATH`) will be our own implementations, some of which will be based on the reference servers but with extensions and improvements.

### Directory Structure
- `docs/` - Reference documentation
- `mcp-servers/` - Our local implementations of MCP servers
- `archive/` - Storage for deprecated or unused code components
- `data/` - Data storage for local servers (e.g., sqlite, memory)
- `scripts/` - Utility scripts for setup and testing
- `src/` - Source code for Python modules and utilities

## MCP Server Configuration

The primary configuration is handled by the `claude-mcp` script at the project root:

```bash
# Script path
/Users/williambrown/dev/claude-code/claude-mcp
```

Key environment variables:
- `CLAUDE_FILESYSTEM_PATH="$HOME/dev"` - Base path for filesystem access
- `MCP_REPO_PATH="$HOME/dev/mcp-servers-repo"` - Reference MCP servers (read-only)
- `MCP_LOCAL_PATH="$HOME/dev/claude-code/mcp-servers"` - Our local MCP server implementations
- `CLAUDE_MEMORY_PATH="$HOME/dev/claude-code/data/memory/memory.json"` - Memory file path
- `CLAUDE_SQLITE_PATH="$HOME/dev/claude-code/data/sqlite/test.db"` - SQLite database path

### MCP Server Registration
The script uses `claude mcp add` commands to register servers with Claude. It uses two types of servers:

1. **Package-based servers** (from npm/pypi):
   ```bash
   # Examples
   claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem $CLAUDE_FILESYSTEM_PATH
   claude mcp add fetch -- uvx mcp-server-fetch
   ```

2. **Local servers** (from our repository):
   ```bash
   # Example
   claude mcp add sqlite -- uv --directory "${MCP_REPO_PATH}/src/sqlite" run mcp-server-sqlite --db-path $CLAUDE_SQLITE_PATH
   ```

### Required Environment Variables
- `BRAVE_API_KEY` - For brave-search server
- `GITHUB_TOKEN` - For GitHub operations (formerly GITHUB_PERSONAL_ACCESS_TOKEN)
- `LINEAR_API_KEY` - For Linear issue tracking
- `SLACK_BOT_TOKEN` and `SLACK_TEAM_ID` - For Slack communication
- `E2B_API_KEY` - For code execution sandbox
- `ALLOWED_PATHS` - For filesystem access control (defaults to project root)

### Important MCP Servers
- **brave-search** - Web search capabilities
- **github** - GitHub repository operations
- **filesystem** - Local file system operations
- **fetch** - Web page fetching
- **memory** - Knowledge graph for persistent memory
- **sqlite** - Database operations
- **slack** - Slack communication
- **linear** - Linear issue tracking integration
- **e2b** - Code execution sandbox
- **research-papers** - Research paper management with Semantic Scholar integration

### MCP Server Usage Guidelines

When to use specific MCP servers:

- **brave-search**: Use for general web searches and finding current information.
  - Best for: Finding documentation, articles, tutorials, product information
  - Example: `mcp__brave-search__brave_web_search(query="python type hints tutorial")`

- **github**: Use for interacting with GitHub repositories.
  - Best for: Examining code, creating issues/PRs, searching repos, accessing GitHub content
  - Example: `mcp__github__search_repositories(query="semantic scholar api")`

- **filesystem**: Use for reading and manipulating local files.
  - Best for: Reading, writing, and exploring files in allowed directories
  - Example: `mcp__filesystem__read_file(path="/path/to/file")`

- **fetch**: Use for downloading web content directly.
  - Best for: Reading web articles, documentation, accessing external APIs
  - Example: `mcp__fetch__fetch(url="https://example.com/api/docs")`

- **memory**: Use for persistent knowledge storage across sessions.
  - Best for: Storing user preferences, frequently used commands, project context
  - Example: `mcp__memory__create_entities(...)`

- **sqlite**: Use for structured data storage and querying.
  - Best for: Storing tabular data, performing complex queries, data analysis
  - Example: `mcp__sqlite__read_query(query="SELECT * FROM table")`

- **research-papers**: Use for academic research and paper management.
  - Best for: Searching academic papers, organizing research, tracking citations
  - Available tools: paper search, collections, tagging, citation management
  - Example: Search for papers about machine learning, create collections, add notes

For optimal results:
1. Choose the most specific server for your task
2. Combine servers when needed (e.g., search with brave-search, then fetch details)
3. Use filesystem for local operations and fetch for remote content
4. Use github for repository-specific operations
5. Consider research-papers for academic literature search instead of generic web search

## Development Guidelines

### Package Management & Build
- Python package management: `uv add <package>` (NEVER pip)
- Running Python tools: `uv run <tool>`
- Upgrading packages: `uv add --dev package --upgrade-package package`
- TypeScript build: `npm run build`
- FORBIDDEN: `uv pip install`, `@latest` syntax

### Lint & Test Commands
- Format: `uv run ruff format .`
- Lint: `uv run ruff check .` (fix with `--fix`)
- Type check: `uv run pyright`
- Testing: `uv run pytest`
- Single test: `uv run pytest path/to/test.py::test_function`
- Async testing: use anyio, not asyncio

### Code Style Guidelines
- Type hints required for all code
- Public APIs must have docstrings
- Functions must be small and focused
- 88 character line length maximum
- Follow existing patterns exactly
- Use clean, modular abstractions and proper Python OOP principles
- Explicit None checks for Optional types
- Address problems generally, avoid code duplication
- Comments/names should never mention previous errors
- Names should "make sense" without change history context
- Strive for minimal clean code that's easily maintained and extended
- Regularly search codebase to identify areas where code can be consolidated
- New features require tests
- Bug fixes require regression tests
- Test edge cases and error paths
- Always carefully discuss design choices about major features before proceeding with implementation

### Error Resolution Priority
1. Formatting
2. Type errors
3. Linting

### Line Wrapping
- Strings: use parentheses
- Function calls: multi-line with proper indent
- Imports: split into multiple lines
- Follow Ruff I001 for import sorting

### Git Workflow
- Develop in separate branches, merge to main quickly
- For user-reported fixes: `git commit --trailer "Reported-by:<user>"`
- For GitHub issues: `git commit --trailer "Github-Issue:#<number>"`
- Always use `git add .` and rely on .gitignore to exclude files, rather than manually selecting files
- ALWAYS push to the private repository (`git push private main`) by default
- Only push to the public repository (`git push origin main`) when explicitly requested
- NEVER mention co-authored-by or tools used to create commits/PRs

### GitHub Commit Attribution
- Use git configuration to set Claude as the commit author:
  ```bash
  git config --local user.name "Claude"
  git config --local user.email "noreply@anthropic.com"
  ```
- This ensures commits appear as coming from Claude while using your PAT
- Add co-authored-by trailers in commit messages for proper attribution

### Pull Request Guidelines
- Create detailed messages focusing on high-level description of the problem and solution
- Don't go into code specifics unless it adds clarity
- Add required reviewers according to project guidelines
- NEVER mention tools used to create the PR

## MCP Server Development Guidelines

When developing our own local MCP servers:

1. **Reference Implementation First**:
   - Study the original server in `MCP_REPO_PATH`
   - Understand its API, behavior, and implementation details
   - Document the key functions and features

2. **Implementation Strategy**:
   - Start by mimicking the reference server exactly
   - Once basic functionality is working, add extensions
   - Ensure backward compatibility

3. **Code Quality**:
   - Use proper typing (TypeScript/Python type hints)
   - Add comprehensive documentation
   - Implement proper error handling
   - Follow consistent naming conventions
   - Write tests for all functionality

4. **Documentation**:
   - Update README.md for each server
   - Document extensions and differences from reference implementation
   - Provide usage examples

## Server-Specific Information

### TypeScript MCP Servers
- Follow consistent patterns from existing servers
- Use proper TypeScript type safety
- Create clear documentation in README.md
- Implement proper error handling
- Build with `npm run build`

### Python MCP Servers
- Follow PEP standards
- Implement proper type hints
- Use async patterns when appropriate
- Document with docstrings
- Package with `pyproject.toml` and uv

## API Usage Examples

### GitHub API Examples
- `github_create_issue(owner="user", repo="repo-name", title="Issue title")`
- `github_search_repositories(query="search terms")`
- `github_get_file_contents(owner="user", repo="repo", path="file.js")`
- `github_create_pull_request(owner="user", repo="repo", title="PR title", head="feature", base="main")`

### Linear API Examples
- `linear_create_issue(title="Task name", teamId="TEAM-123")`
- `linear_search_issues(query="keyword", status="In Progress")`
- `linear_update_issue(id="ABC-123", status="In Progress")`
- `linear_get_user_issues(limit=20)`
- `linear_add_comment(issueId="ABC-123", body="Working on this now")`

### Slack API Examples
- `slack_post_message(channel_id="C0123456789", text="Hello world!")`
- `slack_reply_to_thread(channel_id="C0123456789", thread_ts="1234567890.123456", text="Reply text")`
- `slack_add_reaction(channel_id="C0123456789", timestamp="1234567890.123456", reaction="thumbsup")`
- `slack_get_channel_history(channel_id="C0123456789", limit=10)`