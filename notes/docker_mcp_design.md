# Docker MCP Tool Design Document

## 1. Purpose and Goals

The Docker MCP tool should enable Claude to easily run code in isolated containers, supporting:

1. Quick, ephemeral code execution for testing and prototyping
2. Running code that requires specific dependencies or environments
3. Testing MCP servers in isolated environments
4. Providing persistent development environments for longer tasks
5. Running potentially unsafe code with proper isolation

## 2. Core Features

### 2.1 Code Execution Models

1. **Quick Execution (Ephemeral)**
   - Execute code snippets in pre-configured environments
   - No persistent storage between runs
   - Automatically clean up after execution
   - Focus on quick results with minimal setup

2. **Development Environment (Persistent)**
   - Longer-lived containers for complex tasks
   - Persist files between sessions
   - Install custom packages/dependencies
   - Support for multiple connected sessions

3. **MCP Server Testing**
   - Test MCP servers in isolated environments
   - Easy configuration of required environment variables
   - Connection to host MCP via network or volume mounts

### 2.2 Language Support

Support multiple languages through specialized templates:
- Python (3.x versions)
- Node.js/TypeScript
- Ruby
- Go
- Rust
- Java/Kotlin
- C/C++
- Shell scripting

### 2.3 Container Management

- Create containers from templates or custom images
- Start/stop/restart/remove containers
- List running containers with status and resource usage
- Get container logs with filtering options
- Execute commands in running containers
- Port forwarding for accessing services (like web servers)

### 2.4 File Management

- Mount host directories for persistent storage
- Copy files to/from containers
- Create/edit files directly in containers
- Support for multi-file projects

### 2.5 Package Management

- Install packages inside containers
- Create requirements files for dependencies
- Support language-specific package managers (pip, npm, cargo, etc.)
- Cache common dependencies for faster startup

## 3. API Design

### 3.1 Core Operations

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `run_code` | Run code snippet in an ephemeral container | `language`, `code`, `timeout`, `dependencies` |
| `create_environment` | Create persistent dev environment | `name`, `template`, `volumes`, `env_vars`, `port_mappings` |
| `execute_in_environment` | Run code in existing environment | `environment_name`, `code`, `file_path` |
| `list_environments` | List available environments | `status` |
| `get_environment_logs` | Get logs from environment | `environment_name`, `lines`, `since` |
| `install_package` | Install package in environment | `environment_name`, `package_name`, `version` |
| `copy_file` | Copy file to/from environment | `environment_name`, `source`, `destination`, `direction` |
| `list_files` | List files in environment directory | `environment_name`, `path` |
| `create_file` | Create file in environment | `environment_name`, `path`, `content` |
| `read_file` | Read file from environment | `environment_name`, `path` |
| `template_list` | List available environment templates | - |

### 3.2 Example Usage Patterns

#### Basic Code Execution
```
docker_run_code(
  language="python",
  code="import numpy as np\nprint(np.random.rand(5,5))",
  dependencies=["numpy"]
)
```

#### Creating a Development Environment
```
docker_create_environment(
  name="python-dev",
  template="python-3.11",
  volumes=[{"host_path": "/tmp/project", "container_path": "/workspace"}],
  env_vars={"DEBUG": "true"},
  port_mappings=[{"host": 8080, "container": 5000}]
)
```

#### Installing Packages
```
docker_install_package(
  environment_name="python-dev",
  package_name="numpy",
  version="latest"
)
```

#### Complete Data Analysis Workflow
```
# Step 1: Create environment
docker_create_environment(
  name="data-analysis",
  template="python-3.11-data-science",
  volumes=[{"host_path": "/tmp/project", "container_path": "/workspace"}]
)

# Step 2: Create main script
docker_create_file(
  environment_name="data-analysis",
  path="/workspace/analysis.py",
  content="import pandas as pd\nimport matplotlib.pyplot as plt\n\n# Load data\ndf = pd.read_csv('data.csv')\n\n# Analyze\nprint(df.describe())\n\n# Plot\nplt.figure(figsize=(10,6))\ndf.plot()\nplt.savefig('output.png')"
)

# Step 3: Upload data
docker_copy_file(
  environment_name="data-analysis",
  source="/local/path/data.csv",
  destination="/workspace/data.csv",
  direction="to_container"
)

# Step 4: Run analysis
docker_execute_in_environment(
  environment_name="data-analysis",
  code="python /workspace/analysis.py"
)

# Step 5: Get results
docker_copy_file(
  environment_name="data-analysis",
  source="/workspace/output.png",
  destination="/local/path/output.png",
  direction="from_container"
)
```

#### Web Server Testing
```
# Create nginx server with custom config
docker_create_environment(
  name="web-test",
  template="nginx",
  port_mappings=[{"host": 8080, "container": 80}]
)

# Add test page
docker_create_file(
  environment_name="web-test",
  path="/usr/share/nginx/html/index.html",
  content="<html><body><h1>Test Page</h1></body></html>"
)

# Get URL to access
docker_get_environment_info(
  environment_name="web-test"
)
```

## 4. Implementation Plan

### 4.1 Phase 1: Core Code Execution

1. Implement `run_code` for ephemeral containers
2. Support Python, Node.js, and shell scripting
3. Implement result handling with timeout support
4. Add basic dependency installation

### 4.2 Phase 2: Persistent Environments

1. Implement environment creation/management
2. Add volume mounting for persistent storage
3. Support package installation
4. Add file operations (copy, create, read, list)

### 4.3 Phase 3: Advanced Features

1. Add port mapping for web services
2. Implement multi-file project support
3. Add more language templates
4. Support for custom images
5. Resource monitoring and constraints

## 5. Security Considerations

1. Isolate containers from host system
2. Set resource limits (CPU, memory, network, disk)
3. Apply proper user permissions inside containers
4. Sanitize inputs to prevent command injection
5. Implement timeout for all operations
6. Network restrictions for containers
7. Regular cleanup of unused containers and volumes

## 6. Templates and Configuration

Templates should include:
- Base image
- Default environment variables
- Resource constraints
- Pre-installed packages
- Default command
- Port configurations

Each template should be well-documented with:
- Supported language versions
- Available packages
- Usage examples
- Resource requirements

## 7. Success Metrics

Successful implementation will:
1. Reduce time to execute code snippets
2. Support a wide range of programming languages
3. Enable complex multi-file development projects
4. Provide proper isolation for running untrusted code
5. Maintain good performance and resource usage
6. Offer intuitive API that Claude can easily use