#!/usr/bin/env python3
"""Test the Brave Search MCP server directly."""
import json
import os
import subprocess
import sys
from typing import Dict, Any, Optional

def run_brave_server_query(query: str, count: int = 10, tool: str = "brave_web_search") -> str:
    """
    Run a query against the Brave Search MCP server.
    
    Args:
        query: Search query
        count: Number of results
        tool: Tool to use (brave_web_search or brave_local_search)
    
    Returns:
        Response from the server
    """
    # Check if BRAVE_API_KEY is set
    if "BRAVE_API_KEY" not in os.environ:
        print("Error: BRAVE_API_KEY environment variable is required")
        sys.exit(1)
    
    # Start the server process
    server_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../mcp-servers/brave-search"))
    
    if not os.path.exists(f"{server_path}/dist/index.js"):
        print(f"Error: {server_path}/dist/index.js not found")
        print("Building the server...")
        
        try:
            # Run the build script
            build_script = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../scripts/build_brave_search.sh"))
            subprocess.run(build_script, check=True)
        except subprocess.CalledProcessError as e:
            print(f"Error building server: {e}")
            sys.exit(1)
    
    server_process = subprocess.Popen(
        ["node", f"{server_path}/dist/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=os.environ,
    )
    
    try:
        # Send ListTools request
        list_tools_request = {
            "jsonrpc": "2.0",
            "id": "1",
            "method": "mcp.listTools",
            "params": {}
        }
        
        server_process.stdin.write(json.dumps(list_tools_request) + "\n")
        server_process.stdin.flush()
        
        # Read ListTools response
        list_tools_response = json.loads(server_process.stdout.readline())
        print("Available tools:")
        for tool in list_tools_response.get("result", {}).get("tools", []):
            print(f"- {tool['name']}: {tool['description'][:50]}...")
        
        # Send CallTool request
        if tool == "brave_web_search":
            args = {"query": query, "count": count}
        else:  # brave_local_search
            args = {"query": query, "count": count}
        
        call_tool_request = {
            "jsonrpc": "2.0",
            "id": "2",
            "method": "mcp.callTool",
            "params": {
                "name": tool,
                "arguments": args
            }
        }
        
        server_process.stdin.write(json.dumps(call_tool_request) + "\n")
        server_process.stdin.flush()
        
        # Read CallTool response
        call_tool_response = json.loads(server_process.stdout.readline())
        
        if "error" in call_tool_response:
            return f"Error: {call_tool_response['error']['message']}"
        
        content = call_tool_response.get("result", {}).get("content", [])
        text_content = "\n".join([c.get("text", "") for c in content if c.get("type") == "text"])
        
        return text_content
    
    finally:
        # Terminate the server process
        server_process.terminate()
        server_process.wait(timeout=1)
        
        # Print any error output from the server
        stderr = server_process.stderr.read()
        if stderr:
            print("Server error output:", stderr, file=sys.stderr)


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test the Brave Search MCP server")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--count", type=int, default=5, help="Number of results")
    parser.add_argument("--tool", choices=["brave_web_search", "brave_local_search"], 
                       default="brave_web_search", help="Tool to use")
    
    args = parser.parse_args()
    
    result = run_brave_server_query(args.query, args.count, args.tool)
    print("\nSearch Results:")
    print(result)