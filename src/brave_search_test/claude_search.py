#!/usr/bin/env python3
"""
Use the Brave Search MCP server with the Anthropic API to answer questions.
This demonstrates how to integrate the MCP server with Claude.
"""
import os
import subprocess
import sys
import anthropic
import time
from typing import Dict, Any, List, Optional

def ensure_brave_search_server() -> subprocess.Popen:
    """Start the Brave Search server if not already running."""
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
            subprocess.run(
                ["npm", "install"],
                cwd=server_path,
                check=True,
                capture_output=True,
                text=True,
            )
            subprocess.run(
                ["npm", "run", "build"],
                cwd=server_path,
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            print(f"Error building server: {e.stderr}")
            sys.exit(1)
    
    print("Starting Brave Search server...")
    server_process = subprocess.Popen(
        ["node", f"{server_path}/dist/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=os.environ,
    )
    
    # Give the server a moment to start
    time.sleep(0.5)
    
    if server_process.poll() is not None:
        stderr = server_process.stderr.read()
        print(f"Error starting server: {stderr}")
        sys.exit(1)
    
    print("Brave Search server started")
    return server_process


def brave_search_query(client: anthropic.Client, query: str, 
                       search_type: str = "web") -> str:
    """
    Use the Anthropic API to make a Brave Search query via MCP.
    
    Args:
        client: Anthropic API client
        query: Search query
        search_type: "web" or "local"
    
    Returns:
        Response from Claude
    """
    # Determine which tool to use
    tool_name = "brave_web_search" if search_type == "web" else "brave_local_search"
    
    system_prompt = f"""
    You are an AI assistant that helps users find information online.
    You can use the Brave Search API to search for information.
    
    When answering the user's question, always:
    1. Search for relevant information using the {tool_name} tool
    2. Cite your sources by including links from the search results
    3. Be concise and to the point in your responses
    """
    
    # Configure the message with tool use
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1000,
        system=system_prompt,
        messages=[
            {"role": "user", "content": f"Use the Brave Search API to answer: {query}"}
        ],
        tools=[
            {
                "name": tool_name,
                "description": "Search the web using Brave Search API",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query"
                        },
                        "count": {
                            "type": "number",
                            "description": "Number of results (1-20)",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }
            }
        ]
    )
    
    return message.content[0].text


def main():
    """
    Main function to run the Brave Search integration with Claude.
    """
    # Check for ANTHROPIC_API_KEY
    if "ANTHROPIC_API_KEY" not in os.environ:
        print("Error: ANTHROPIC_API_KEY environment variable is required")
        sys.exit(1)
    
    # Start the Brave Search server
    server_process = ensure_brave_search_server()
    
    try:
        # Initialize the Anthropic client
        client = anthropic.Client()
        
        # Parse arguments
        import argparse
        parser = argparse.ArgumentParser(description="Use Brave Search with Claude")
        parser.add_argument("query", help="Search query or question")
        parser.add_argument("--type", choices=["web", "local"], default="web", 
                           help="Search type (web or local)")
        
        args = parser.parse_args()
        
        # Run the query
        result = brave_search_query(client, args.query, args.type)
        
        # Print the result
        print(f"\nClaude's response to: '{args.query}'\n")
        print(result)
    
    finally:
        # Stop the server
        print("Stopping Brave Search server...")
        server_process.terminate()
        server_process.wait(timeout=1)


if __name__ == "__main__":
    main()