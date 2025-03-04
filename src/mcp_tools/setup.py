#!/usr/bin/env python3
"""
Setup script for the MCP servers.
This script builds and configures all required MCP servers.
"""
import os
import subprocess
import sys
import argparse
from typing import List, Dict, Any, Optional
import json

# Add parent directory to path to import server_manager
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mcp_tools import MCPServerManager


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Setup MCP servers for Claude Code")
    
    parser.add_argument(
        "--servers", 
        nargs="+", 
        default=["brave-search", "filesystem", "github", "memory", "fetch"],
        help="MCP servers to set up"
    )
    
    parser.add_argument(
        "--method", 
        choices=["docker", "npx", "node"], 
        default="docker",
        help="Installation method"
    )
    
    parser.add_argument(
        "--build", 
        action="store_true",
        help="Build Docker images"
    )
    
    parser.add_argument(
        "--env-file",
        help="Path to environment variables file (JSON format)"
    )
    
    parser.add_argument(
        "--brave-api-key",
        help="Brave Search API key"
    )
    
    parser.add_argument(
        "--github-token",
        help="GitHub personal access token"
    )
    
    parser.add_argument(
        "--allowed-paths",
        help="Colon-separated list of paths allowed for filesystem server"
    )
    
    return parser.parse_args()


def load_env_file(file_path: str) -> Dict[str, str]:
    """Load environment variables from a JSON file."""
    if not os.path.exists(file_path):
        print(f"Environment file {file_path} not found")
        return {}
    
    try:
        with open(file_path, "r") as f:
            env_vars = json.load(f)
        
        if not isinstance(env_vars, dict):
            print(f"Invalid environment file format: {file_path}")
            return {}
        
        # Convert all values to strings
        return {k: str(v) for k, v in env_vars.items()}
    
    except Exception as e:
        print(f"Error loading environment file: {e}")
        return {}


def main() -> int:
    """Main entry point."""
    args = parse_args()
    
    manager = MCPServerManager()
    
    # Load environment variables from file if provided
    if args.env_file:
        env_vars = load_env_file(args.env_file)
        for name, value in env_vars.items():
            manager.set_env_var(name, value)
            print(f"Set environment variable {name} from file")
    
    # Set environment variables from command line arguments
    if args.brave_api_key:
        manager.set_env_var("BRAVE_API_KEY", args.brave_api_key)
        print("Set BRAVE_API_KEY from command line")
    
    if args.github_token:
        manager.set_env_var("GITHUB_TOKEN", args.github_token)
        print("Set GITHUB_TOKEN from command line")
    
    if args.allowed_paths:
        manager.set_env_var("ALLOWED_PATHS", args.allowed_paths)
        print("Set ALLOWED_PATHS from command line")
    
    # Process each server
    success = True
    for server in args.servers:
        print(f"\n=== Setting up {server} server ===")
        
        # Build Docker image if requested
        if args.build and args.method == "docker":
            print(f"Building {server} server...")
            if not manager.build_server(server):
                print(f"Failed to build {server} server")
                success = False
                continue
        
        # Enable server
        print(f"Enabling {server} server...")
        if not manager.enable_server(server, args.method):
            print(f"Failed to enable {server} server")
            success = False
            continue
        
        # Check environment variables
        env_vars_ok, missing_vars = manager.check_env_vars(server)
        if not env_vars_ok:
            print(f"Warning: Missing environment variables for {server}: {', '.join(missing_vars)}")
            print("You can set them using the setenv command or by re-running with appropriate options")
    
    # Display final status
    print("\n=== Server Status ===")
    status = manager.get_server_status()
    
    # Determine max length for server name
    max_len = max([len(server) for server in status.keys()], default=0)
    
    # Print status in a nice format
    for server, server_status in status.items():
        print(f"{server:<{max_len+2}} {server_status}")
    
    print("\nSetup complete!")
    print("To start a server: mcp-manager start <server>")
    print("To check status: mcp-manager status")
    print("To set environment variables: mcp-manager setenv <name> <value>")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())