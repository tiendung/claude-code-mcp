"""
MCP Server Manager - Launch and manage MCP servers for Claude Code.
"""
import os
import subprocess
import json
import logging
from pathlib import Path
import signal
import time
from typing import Dict, List, Optional, Any, Tuple, Set

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("mcp_server_manager")

class MCPServerManager:
    """Manages the lifecycle of MCP servers."""
    
    def __init__(
        self,
        config_path: Optional[str] = None,
        env_file_path: Optional[str] = None,
    ):
        """
        Initialize the MCP Server Manager.
        
        Args:
            config_path: Path to configuration file (default: ~/.mcp/config.json)
            env_file_path: Path to environment variables file (default: ~/.mcp/env.json)
        """
        self.config_path = config_path or os.path.expanduser("~/.mcp/config.json")
        self.env_file_path = env_file_path or os.path.expanduser("~/.mcp/env.json")
        self.config: Dict[str, Any] = {}
        self.env_vars: Dict[str, str] = {}
        self.processes: Dict[str, subprocess.Popen] = {}
        self.required_env_vars: Dict[str, Set[str]] = {
            "brave-search": {"BRAVE_API_KEY"},
            "github": {"GITHUB_TOKEN"},
            "filesystem": {"ALLOWED_PATHS"},
            "fetch": set(),
            "memory": set(),
            "slack": {"SLACK_BOT_TOKEN", "SLACK_APP_TOKEN"},
            "task-manager": set(),
        }
        
        # Ensure config directories exist
        os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
        
        # Load configuration
        self._load_config()
        self._load_env_vars()
    
    def _load_config(self) -> None:
        """Load the configuration file."""
        try:
            if os.path.exists(self.config_path):
                with open(self.config_path, "r") as f:
                    self.config = json.load(f)
                logger.info(f"Loaded configuration from {self.config_path}")
            else:
                self.config = {
                    "servers": {
                        "brave-search": {"enabled": False, "method": "docker"},
                        "filesystem": {"enabled": False, "method": "docker"},
                        "github": {"enabled": False, "method": "docker"},
                        "fetch": {"enabled": False, "method": "docker"},
                        "memory": {"enabled": False, "method": "docker"},
                        "slack": {"enabled": False, "method": "docker"},
                        "task-manager": {"enabled": False, "method": "node"},
                    }
                }
                self._save_config()
                logger.info(f"Created default configuration at {self.config_path}")
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
            raise
    
    def _save_config(self) -> None:
        """Save the configuration file."""
        try:
            with open(self.config_path, "w") as f:
                json.dump(self.config, f, indent=2)
            logger.info(f"Saved configuration to {self.config_path}")
        except Exception as e:
            logger.error(f"Error saving configuration: {e}")
            raise
    
    def _load_env_vars(self) -> None:
        """Load environment variables from file."""
        try:
            if os.path.exists(self.env_file_path):
                with open(self.env_file_path, "r") as f:
                    self.env_vars = json.load(f)
                logger.info(f"Loaded environment variables from {self.env_file_path}")
            else:
                self.env_vars = {}
                logger.info("No environment variables file found")
        except Exception as e:
            logger.error(f"Error loading environment variables: {e}")
            raise
    
    def _save_env_vars(self) -> None:
        """Save environment variables to file."""
        try:
            with open(self.env_file_path, "w") as f:
                json.dump(self.env_vars, f, indent=2)
            logger.info(f"Saved environment variables to {self.env_file_path}")
        except Exception as e:
            logger.error(f"Error saving environment variables: {e}")
            raise
    
    def set_env_var(self, name: str, value: str) -> None:
        """
        Set an environment variable.
        
        Args:
            name: Name of the environment variable
            value: Value of the environment variable
        """
        self.env_vars[name] = value
        self._save_env_vars()
    
    def check_env_vars(self, server_name: str) -> Tuple[bool, List[str]]:
        """
        Check if all required environment variables are set for a server.
        
        Args:
            server_name: Name of the server
            
        Returns:
            Tuple of (all_vars_present, missing_vars)
        """
        if server_name not in self.required_env_vars:
            logger.warning(f"Unknown server: {server_name}")
            return False, [f"Unknown server: {server_name}"]
        
        required_vars = self.required_env_vars[server_name]
        missing_vars = [var for var in required_vars if var not in self.env_vars]
        
        return len(missing_vars) == 0, missing_vars
    
    def enable_server(self, server_name: str, method: str = "docker") -> bool:
        """
        Enable a server in the configuration.
        
        Args:
            server_name: Name of the server
            method: Installation method (docker, npx, node)
            
        Returns:
            Success status
        """
        if server_name not in self.required_env_vars:
            logger.warning(f"Unknown server: {server_name}")
            return False
        
        if server_name not in self.config["servers"]:
            self.config["servers"][server_name] = {}
        
        self.config["servers"][server_name]["enabled"] = True
        self.config["servers"][server_name]["method"] = method
        self._save_config()
        
        return True
    
    def disable_server(self, server_name: str) -> bool:
        """
        Disable a server in the configuration.
        
        Args:
            server_name: Name of the server
            
        Returns:
            Success status
        """
        if server_name not in self.config.get("servers", {}):
            logger.warning(f"Server not found in configuration: {server_name}")
            return False
        
        self.config["servers"][server_name]["enabled"] = False
        self._save_config()
        
        # Stop the server if it's running
        if server_name in self.processes:
            self.stop_server(server_name)
        
        return True
    
    def start_server(self, server_name: str, detach: bool = False) -> bool:
        """
        Start a server.
        
        Args:
            server_name: Name of the server
            detach: If True, don't stop the server when the manager is destroyed
            
        Returns:
            Success status
        """
        if server_name in self.processes:
            logger.warning(f"Server already running: {server_name}")
            return True
        
        if server_name not in self.config.get("servers", {}):
            logger.error(f"Server not found in configuration: {server_name}")
            return False
        
        if not self.config["servers"][server_name].get("enabled", False):
            logger.error(f"Server is disabled: {server_name}")
            return False
        
        # Check environment variables
        env_vars_ok, missing_vars = self.check_env_vars(server_name)
        if not env_vars_ok:
            logger.error(f"Missing environment variables for {server_name}: {', '.join(missing_vars)}")
            return False
        
        # Get server settings
        method = self.config["servers"][server_name].get("method", "docker")
        
        # Prepare environment variables
        env = os.environ.copy()
        for key, value in self.env_vars.items():
            env[key] = value
        
        # Start server based on method
        try:
            if method == "docker":
                cmd = self._get_docker_command(server_name)
            elif method == "npx":
                cmd = self._get_npx_command(server_name)
            elif method == "node":
                cmd = self._get_node_command(server_name)
            else:
                logger.error(f"Unknown method: {method}")
                return False
            
            logger.info(f"Starting {server_name} server with command: {' '.join(cmd)}")
            
            # For task-manager, we want to keep it running in the background
            if server_name == "task-manager" or detach:
                # Use nohup to keep process running after terminal closes
                # Redirect output to a log file
                cmd = ["nohup"] + cmd + ["&"]
                process = subprocess.Popen(
                    " ".join(cmd),
                    env=env,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )
                # Store None for process since it's detached
                self.processes[server_name] = None
                logger.info(f"Started {server_name} server in background mode")
                return True
            else:
                process = subprocess.Popen(
                    cmd,
                    env=env,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )
                
                self.processes[server_name] = process
                
                # Give the process a moment to crash if it's going to
                time.sleep(0.5)
                
                if process.poll() is not None:
                    stderr = process.stderr.read()
                    logger.error(f"Server {server_name} failed to start: {stderr}")
                    return False
                
                logger.info(f"Started {server_name} server with PID {process.pid}")
                return True
        
        except Exception as e:
            logger.error(f"Error starting {server_name} server: {e}")
            return False
    
    def _get_docker_command(self, server_name: str) -> List[str]:
        """Get the Docker command for a server."""
        cmd = ["docker", "run", "-i", "--rm"]
        
        # Add environment variables
        for var in self.required_env_vars.get(server_name, []):
            if var in self.env_vars:
                cmd.extend(["-e", var])
        
        # Special handling for filesystem server
        if server_name == "filesystem" and "ALLOWED_PATHS" in self.env_vars:
            allowed_paths = self.env_vars["ALLOWED_PATHS"].split(":")
            for path in allowed_paths:
                cmd.extend(["-v", f"{path}:{path}"])
        
        cmd.append(f"mcp/{server_name}")
        return cmd
    
    def _get_npx_command(self, server_name: str) -> List[str]:
        """Get the NPX command for a server."""
        return ["npx", "-y", f"@modelcontextprotocol/server-{server_name}"]
    
    def _get_node_command(self, server_name: str) -> List[str]:
        """Get the Node.js command for a server."""
        # Use the correct path to mcp-servers directly from project root
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        server_dir = f"{base_dir}/mcp-servers/{server_name}"
        
        # Print for debugging
        print(f"Server directory: {server_dir}")
        
        # For task-manager server, use the built dist/index.js
        if server_name == "task-manager":
            return ["node", f"{server_dir}/dist/index.js"]
        
        return ["node", f"{server_dir}/index.js"]
    
    def stop_server(self, server_name: str) -> bool:
        """
        Stop a server.
        
        Args:
            server_name: Name of the server
            
        Returns:
            Success status
        """
        if server_name not in self.processes:
            logger.warning(f"Server not running: {server_name}")
            return True
        
        process = self.processes[server_name]
        
        try:
            # For detached processes (especially task-manager)
            if process is None:
                # Try to find and kill the process by name
                if server_name == "task-manager":
                    logger.info(f"Stopping detached {server_name} server")
                    # Find Node.js processes running task-manager
                    find_cmd = ["pgrep", "-f", "node.*task-manager.*index.js"]
                    result = subprocess.run(find_cmd, capture_output=True, text=True)
                    
                    if result.returncode == 0 and result.stdout.strip():
                        # Kill all matching processes
                        pids = result.stdout.strip().split('\n')
                        for pid in pids:
                            try:
                                kill_cmd = ["kill", pid.strip()]
                                subprocess.run(kill_cmd, check=True)
                                logger.info(f"Killed process {pid.strip()}")
                            except subprocess.CalledProcessError:
                                logger.warning(f"Failed to kill process {pid.strip()}")
                                
                    else:
                        logger.warning(f"No matching processes found for {server_name}")
                    
                    del self.processes[server_name]
                    logger.info(f"Stopped {server_name} server")
                    return True
                else:
                    logger.warning(f"Cannot stop detached server: {server_name}")
                    return False
            
            logger.info(f"Stopping {server_name} server (PID {process.pid})")
            
            # First try a graceful termination
            process.terminate()
            
            # Wait for process to terminate
            for _ in range(10):
                if process.poll() is not None:
                    break
                time.sleep(0.1)
            
            # If it's still running, kill it
            if process.poll() is None:
                logger.warning(f"Process did not terminate gracefully, killing {server_name}")
                process.kill()
            
            del self.processes[server_name]
            logger.info(f"Stopped {server_name} server")
            return True
        
        except Exception as e:
            logger.error(f"Error stopping {server_name} server: {e}")
            return False
    
    def stop_all_servers(self) -> None:
        """Stop all running servers."""
        server_names = list(self.processes.keys())
        for server_name in server_names:
            self.stop_server(server_name)
    
    def get_server_status(self) -> Dict[str, str]:
        """
        Get the status of all servers.
        
        Returns:
            Dictionary of server names to status ("running", "stopped", "disabled")
        """
        status = {}
        
        for server_name in self.required_env_vars.keys():
            if server_name not in self.config.get("servers", {}):
                status[server_name] = "not_configured"
            elif not self.config["servers"][server_name].get("enabled", False):
                status[server_name] = "disabled"
            elif server_name in self.processes:
                process = self.processes[server_name]
                if process.poll() is None:
                    status[server_name] = "running"
                else:
                    status[server_name] = "crashed"
            else:
                status[server_name] = "stopped"
        
        return status
    
    def build_server(self, server_name: str) -> bool:
        """
        Build a server from source.
        
        Args:
            server_name: Name of the server
            
        Returns:
            Success status
        """
        server_dir = f"{os.path.dirname(os.path.dirname(os.path.abspath(__file__)))}/mcp-servers/{server_name}"
        
        if not os.path.exists(server_dir):
            logger.error(f"Server directory not found: {server_dir}")
            return False
        
        try:
            # Check for Dockerfile
            if os.path.exists(f"{server_dir}/Dockerfile"):
                logger.info(f"Building Docker image for {server_name}")
                
                cmd = ["docker", "build", "-t", f"mcp/{server_name}", server_dir]
                result = subprocess.run(cmd, check=True, capture_output=True, text=True)
                
                logger.info(f"Built Docker image for {server_name}")
                return True
            
            # Otherwise, build using npm
            elif os.path.exists(f"{server_dir}/package.json"):
                logger.info(f"Building npm package for {server_name}")
                
                # Install dependencies
                cmd = ["npm", "install"]
                result = subprocess.run(cmd, cwd=server_dir, check=True, capture_output=True, text=True)
                
                # Build package
                cmd = ["npm", "run", "build"]
                result = subprocess.run(cmd, cwd=server_dir, check=True, capture_output=True, text=True)
                
                logger.info(f"Built npm package for {server_name}")
                return True
            
            else:
                logger.error(f"No Dockerfile or package.json found for {server_name}")
                return False
        
        except subprocess.CalledProcessError as e:
            logger.error(f"Error building {server_name}: {e.stderr}")
            return False
        except Exception as e:
            logger.error(f"Error building {server_name}: {e}")
            return False
    
    def __del__(self):
        """Clean up when the object is destroyed."""
        self.stop_all_servers()


def main():
    """Command-line interface for MCP Server Manager."""
    import argparse
    
    parser = argparse.ArgumentParser(description="MCP Server Manager")
    subparsers = parser.add_subparsers(dest="command", help="Command to execute")
    
    # Status command
    subparsers.add_parser("status", help="Show status of all servers")
    
    # Set environment variable command
    set_env_parser = subparsers.add_parser("set-env", help="Set environment variable")
    set_env_parser.add_argument("name", help="Name of environment variable")
    set_env_parser.add_argument("value", help="Value of environment variable")
    
    # Enable server command
    enable_parser = subparsers.add_parser("enable", help="Enable server")
    enable_parser.add_argument("server", help="Name of server")
    enable_parser.add_argument("--method", choices=["docker", "npx", "node"], default="docker", help="Installation method")
    
    # Disable server command
    disable_parser = subparsers.add_parser("disable", help="Disable server")
    disable_parser.add_argument("server", help="Name of server")
    
    # Start server command
    start_parser = subparsers.add_parser("start", help="Start server")
    start_parser.add_argument("server", help="Name of server")
    
    # Stop server command
    stop_parser = subparsers.add_parser("stop", help="Stop server")
    stop_parser.add_argument("server", help="Name of server")
    
    # Stop all servers command
    subparsers.add_parser("stop-all", help="Stop all servers")
    
    # Build server command
    build_parser = subparsers.add_parser("build", help="Build server")
    build_parser.add_argument("server", help="Name of server")
    
    args = parser.parse_args()
    
    manager = MCPServerManager()
    
    if args.command == "status":
        status = manager.get_server_status()
        for server, status in status.items():
            print(f"{server}: {status}")
    
    elif args.command == "set-env":
        manager.set_env_var(args.name, args.value)
        print(f"Set environment variable {args.name}")
    
    elif args.command == "enable":
        success = manager.enable_server(args.server, args.method)
        if success:
            print(f"Enabled {args.server} server with method {args.method}")
        else:
            print(f"Failed to enable {args.server} server")
    
    elif args.command == "disable":
        success = manager.disable_server(args.server)
        if success:
            print(f"Disabled {args.server} server")
        else:
            print(f"Failed to disable {args.server} server")
    
    elif args.command == "start":
        success = manager.start_server(args.server)
        if success:
            print(f"Started {args.server} server")
        else:
            print(f"Failed to start {args.server} server")
    
    elif args.command == "stop":
        success = manager.stop_server(args.server)
        if success:
            print(f"Stopped {args.server} server")
        else:
            print(f"Failed to stop {args.server} server")
    
    elif args.command == "stop-all":
        manager.stop_all_servers()
        print("Stopped all servers")
    
    elif args.command == "build":
        success = manager.build_server(args.server)
        if success:
            print(f"Built {args.server} server")
        else:
            print(f"Failed to build {args.server} server")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()