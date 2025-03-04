#!/usr/bin/env python3
"""CLI for MCP Server Manager."""
import argparse
import os
import sys
import subprocess
from typing import List, Optional
import json

# Add parent directory to path to import server_manager
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from mcp_tools import MCPServerManager


def format_command(command: List[str]) -> str:
    """Format a command for display."""
    # Escape special characters
    escaped = []
    for part in command:
        if " " in part or ";" in part or "&" in part or "|" in part or ">" in part or "<" in part:
            escaped.append(f"'{part}'")
        else:
            escaped.append(part)
    
    return " ".join(escaped)


def build_command() -> int:
    """Build a server."""
    parser = argparse.ArgumentParser(description="Build an MCP server")
    parser.add_argument("server", help="Name of the server to build")
    args = parser.parse_args(sys.argv[2:])
    
    manager = MCPServerManager()
    success = manager.build_server(args.server)
    
    if success:
        print(f"Built {args.server} server successfully")
        return 0
    else:
        print(f"Failed to build {args.server} server")
        return 1


def start_command() -> int:
    """Start a server."""
    parser = argparse.ArgumentParser(description="Start an MCP server")
    parser.add_argument("server", help="Name of the server to start")
    parser.add_argument("--detach", "-d", action="store_true", help="Run in background mode")
    parser.add_argument("--persistent", "-p", action="store_true", help="Don't stop when script exits")
    args = parser.parse_args(sys.argv[2:])
    
    # Create manager without auto-cleanup (don't stop servers on exit)
    manager = MCPServerManager()
    
    # For task-manager, we always want to detach
    detach = args.detach or args.server == "task-manager"
    
    # Start the server
    success = manager.start_server(args.server, detach=detach)
    
    if success:
        if detach:
            # For persistent servers, we don't want the manager to stop them when the script exits
            if args.persistent or args.server == "task-manager":
                # Clear the process list so __del__ doesn't stop servers
                manager.processes = {}
            
            print(f"Started {args.server} server in background mode")
        else:
            print(f"Started {args.server} server")
        return 0
    else:
        print(f"Failed to start {args.server} server")
        return 1


def stop_command() -> int:
    """Stop a server."""
    parser = argparse.ArgumentParser(description="Stop an MCP server")
    parser.add_argument("server", help="Name of the server to stop")
    args = parser.parse_args(sys.argv[2:])
    
    manager = MCPServerManager()
    success = manager.stop_server(args.server)
    
    if success:
        print(f"Stopped {args.server} server")
        return 0
    else:
        print(f"Failed to stop {args.server} server")
        return 1


def stopall_command() -> int:
    """Stop all servers."""
    manager = MCPServerManager()
    manager.stop_all_servers()
    print("Stopped all servers")
    return 0


def status_command() -> int:
    """Show server status."""
    manager = MCPServerManager()
    status = manager.get_server_status()
    
    # Determine max length for server name
    max_len = max([len(server) for server in status.keys()], default=0)
    
    # Print status in a nice format
    print(f"{'Server':<{max_len+2}} Status")
    print(f"{'-'*max_len} ------")
    
    for server, server_status in status.items():
        print(f"{server:<{max_len+2}} {server_status}")
    
    return 0


def enable_command() -> int:
    """Enable a server."""
    parser = argparse.ArgumentParser(description="Enable an MCP server")
    parser.add_argument("server", help="Name of the server to enable")
    parser.add_argument("--method", choices=["docker", "npx", "node"], default="docker", help="Installation method")
    args = parser.parse_args(sys.argv[2:])
    
    manager = MCPServerManager()
    success = manager.enable_server(args.server, args.method)
    
    if success:
        print(f"Enabled {args.server} server with method {args.method}")
        return 0
    else:
        print(f"Failed to enable {args.server} server")
        return 1


def disable_command() -> int:
    """Disable a server."""
    parser = argparse.ArgumentParser(description="Disable an MCP server")
    parser.add_argument("server", help="Name of the server to disable")
    args = parser.parse_args(sys.argv[2:])
    
    manager = MCPServerManager()
    success = manager.disable_server(args.server)
    
    if success:
        print(f"Disabled {args.server} server")
        return 0
    else:
        print(f"Failed to disable {args.server} server")
        return 1


def setenv_command() -> int:
    """Set an environment variable."""
    parser = argparse.ArgumentParser(description="Set an environment variable")
    parser.add_argument("name", help="Name of the environment variable")
    parser.add_argument("value", help="Value of the environment variable")
    args = parser.parse_args(sys.argv[2:])
    
    manager = MCPServerManager()
    manager.set_env_var(args.name, args.value)
    
    print(f"Set environment variable {args.name}")
    return 0


def getenv_command() -> int:
    """Get an environment variable."""
    parser = argparse.ArgumentParser(description="Get an environment variable")
    parser.add_argument("name", help="Name of the environment variable")
    args = parser.parse_args(sys.argv[2:])
    
    manager = MCPServerManager()
    
    if args.name in manager.env_vars:
        print(manager.env_vars[args.name])
        return 0
    else:
        print(f"Environment variable {args.name} not set")
        return 1


def setup_command() -> int:
    """Setup a server with all required components."""
    parser = argparse.ArgumentParser(description="Setup an MCP server")
    parser.add_argument("server", help="Name of the server to setup")
    parser.add_argument("--method", choices=["docker", "npx", "node"], default="docker", help="Installation method")
    parser.add_argument("--env", action="append", help="Environment variables in NAME=VALUE format")
    parser.add_argument("--build", action="store_true", help="Build the server")
    args = parser.parse_args(sys.argv[2:])
    
    manager = MCPServerManager()
    
    # Set environment variables
    if args.env:
        for env_var in args.env:
            if "=" in env_var:
                name, value = env_var.split("=", 1)
                manager.set_env_var(name, value)
                print(f"Set environment variable {name}")
            else:
                print(f"Invalid environment variable format: {env_var}")
                return 1
    
    # Build server if requested
    if args.build:
        print(f"Building {args.server} server...")
        success = manager.build_server(args.server)
        if not success:
            print(f"Failed to build {args.server} server")
            return 1
    
    # Enable server
    print(f"Enabling {args.server} server...")
    success = manager.enable_server(args.server, args.method)
    if not success:
        print(f"Failed to enable {args.server} server")
        return 1
    
    # Get server settings
    env_vars_ok, missing_vars = manager.check_env_vars(args.server)
    if not env_vars_ok:
        print(f"Warning: Missing environment variables for {args.server}: {', '.join(missing_vars)}")
        print("You can set them using the setenv command")
    
    print(f"Setup complete for {args.server} server")
    print(f"To start the server, run: mcp-manager start {args.server}")
    return 0


def help_command() -> int:
    """Show help."""
    commands = {
        "build": "Build an MCP server",
        "start": "Start an MCP server",
        "stop": "Stop an MCP server",
        "stopall": "Stop all MCP servers",
        "status": "Show status of MCP servers",
        "enable": "Enable an MCP server",
        "disable": "Disable an MCP server",
        "setenv": "Set an environment variable",
        "getenv": "Get an environment variable",
        "setup": "Setup an MCP server with all required components",
        "help": "Show this help",
    }
    
    print("MCP Server Manager")
    print("Usage: mcp-manager COMMAND [ARGS]")
    print()
    print("Commands:")
    
    # Determine max length for command name
    max_len = max([len(command) for command in commands.keys()])
    
    for command, description in commands.items():
        print(f"  {command:<{max_len+2}} {description}")
    
    return 0


def main() -> int:
    """Main entry point."""
    if len(sys.argv) < 2:
        print("No command specified")
        print("Use 'mcp-manager help' to see available commands")
        return 1
    
    command = sys.argv[1]
    
    command_handlers = {
        "build": build_command,
        "start": start_command,
        "stop": stop_command,
        "stopall": stopall_command,
        "status": status_command,
        "enable": enable_command,
        "disable": disable_command,
        "setenv": setenv_command,
        "getenv": getenv_command,
        "setup": setup_command,
        "help": help_command,
    }
    
    if command in command_handlers:
        return command_handlers[command]()
    else:
        print(f"Unknown command: {command}")
        print("Use 'mcp-manager help' to see available commands")
        return 1


if __name__ == "__main__":
    sys.exit(main())