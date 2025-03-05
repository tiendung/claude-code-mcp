import Dockerode from 'dockerode';
import path from 'node:path';
import fs from 'node:fs';
import { exec, ExecOptions } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';
import os from 'node:os';
import { 
  ContainerNotFoundError, 
  ContainerCreationError, 
  TemplateNotFoundError,
  ContainerOperationError,
  DockerConnectionError,
  ImageBuildError
} from '../common/errors.js';
import { Logger } from '../common/logger.js';
import { 
  CreateServerInput, 
  ListServersInput, 
  GetServerLogsInput, 
  ServerOperationInput,
  ContainerInfo,
  RunCodeInput,
  RunCodeResponse,
  CreateEnvironmentInput,
  ExecuteInEnvironmentInput,
  CreateFileInput,
  CopyFileInput,
  EnvironmentFileOperationInput,
  InstallPackageInput,
  BuildImageInput,
  BuildImageResponse,
  RegisterTemplateInput,
  RegisterTemplateResponse
} from '../types/schemas.js';

// Initialize Docker client
const docker = new Dockerode({
  socketPath: process.env.DOCKER_HOST || '/var/run/docker.sock'
});

// Get path to templates directory
const templatesPath = process.env.MCP_SERVERS_PATH || path.resolve(process.cwd(), 'templates');

// Log the templates path for debugging
Logger.info(`Using templates path: ${templatesPath}`);

// Define prefix for container names - can be configured via environment variable
const CONTAINER_NAME_PREFIX = process.env.CONTAINER_PREFIX || 'dev-';

// Generate full container name
function getContainerName(serverName: string): string {
  return `${CONTAINER_NAME_PREFIX}${serverName}`;
}

// Get all available server templates
export async function getAvailableServerTemplates(): Promise<Array<{
  type: string;
  image: string;
  description: string;
}>> {
  try {
    // Check if templates directory exists
    if (!fs.existsSync(templatesPath)) {
      Logger.error(`Templates directory not found: ${templatesPath}`);
      return [
        {
          type: 'error',
          image: 'none',
          description: `Templates directory not found: ${templatesPath}`
        }
      ];
    }
    
    // Get all template files
    const templateFiles = fs.readdirSync(templatesPath)
      .filter(file => file.endsWith('.json'));
    
    Logger.info(`Found ${templateFiles.length} template files in ${templatesPath}`);
    
    if (templateFiles.length === 0) {
      return [
        {
          type: 'info',
          image: 'none',
          description: `No templates found in ${templatesPath}`
        }
      ];
    }
    
    // Parse each template
    return templateFiles.map(file => {
      const templatePath = path.join(templatesPath, file);
      const templateType = file.replace('.json', '');
      
      try {
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        const template = JSON.parse(templateContent);
        
        Logger.debug(`Parsed template ${templateType}: ${templateContent.substring(0, 100)}...`);
        
        return {
          type: templateType,
          image: template.image,
          description: template.config?.labels?.['mcp.description'] || `MCP server: ${templateType}`
        };
      } catch (error) {
        Logger.error(`Error parsing template ${templateType}:`, error);
        return {
          type: templateType,
          image: 'unknown',
          description: 'Error reading template'
        };
      }
    });
  } catch (error) {
    Logger.error('Error reading template directory:', error);
    return [
      {
        type: 'error',
        image: 'none',
        description: `Error: ${error instanceof Error ? error.message : String(error)}`
      }
    ];
  }
}

// Get server template info
async function getServerTemplate(serverType: string): Promise<{
  image: string;
  config: Record<string, any>;
  build?: {
    context: string;
    dockerfile?: string;
    type?: string;
    options?: {
      nodeVersion?: string;
      buildCommand?: string;
      requiredEnvVars?: string[];
      [key: string]: any;
    };
  };
}> {
  try {
    // Check if template exists
    const templatePath = path.join(templatesPath, `${serverType}.json`);
    
    if (!fs.existsSync(templatePath)) {
      throw new TemplateNotFoundError(serverType);
    }
    
    // Read and parse template file
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = JSON.parse(templateContent);
    
    return {
      image: template.image,
      config: template.config || {},
      build: template.build
    };
  } catch (error) {
    if (error instanceof TemplateNotFoundError) {
      throw error;
    }
    
    Logger.error(`Error getting server template ${serverType}:`, error);
    throw new TemplateNotFoundError(serverType);
  }
}

// Find container by name
async function findContainer(serverName: string): Promise<Dockerode.Container | null> {
  try {
    const containerName = getContainerName(serverName);
    const containers = await docker.listContainers({ all: true });
    
    const container = containers.find(c => 
      c.Names.some(name => name === `/${containerName}` || name === containerName)
    );
    
    if (!container) {
      return null;
    }
    
    return docker.getContainer(container.Id);
  } catch (error) {
    Logger.error(`Error finding container for ${serverName}:`, error);
    if (error instanceof Error) {
      throw new DockerConnectionError(error.message);
    }
    throw new DockerConnectionError('Unknown error');
  }
}

// Format container info for response
function formatContainerInfo(container: Dockerode.ContainerInfo): ContainerInfo {
  return {
    id: container.Id,
    name: container.Names[0].replace(/^\//, ''),
    status: container.State as ContainerInfo['status'],
    image: container.Image,
    created: new Date(container.Created * 1000).toISOString(),
    ports: (container.Ports || []).map(port => ({
      privatePort: port.PrivatePort,
      publicPort: port.PublicPort,
      type: port.Type
    })),
    labels: container.Labels || {}
  };
}

// Create a new server container
export async function createServer(input: CreateServerInput): Promise<{ id: string; name: string; status: string }> {
  const { server_type, server_name, env_vars, volumes, code, code_filename } = input;
  const containerName = getContainerName(server_name);
  
  try {
    // Check if container already exists
    const existingContainer = await findContainer(server_name);
    if (existingContainer) {
      throw new ContainerCreationError(server_name, 'Container already exists');
    }
    
    // Get server template
    const template = await getServerTemplate(server_type);
    const { image, config } = template;
    
    // Check if image exists, try building it, or pull it
    try {
      await docker.getImage(image).inspect();
      Logger.debug(`Image ${image} found locally`);
    } catch (error) {
      Logger.info(`Image ${image} not found locally`);
      
      // Check if the template has build instructions
      const buildConfig = template.build || (config && config.build);
      if (buildConfig) {
        Logger.info(`Template has build instructions, attempting to build image ${image}...`);
        
        try {
          const buildResult = await buildImage({ template_name: server_type });
          
          if (!buildResult.success) {
            Logger.warn(`Failed to build image: ${buildResult.message}, will try to pull instead`);
            throw new Error('Build failed, fallback to pull');
          }
          
          Logger.info(`Successfully built image ${image}`);
        } catch (buildError) {
          // If build fails, try to pull the image from registry
          Logger.info(`Falling back to pulling image ${image}...`);
          const stream = await docker.pull(image);
          await new Promise((resolve, reject) => {
            docker.modem.followProgress(stream, (err: Error | null) => {
              if (err) reject(err);
              else resolve(null);
            });
          });
        }
      } else {
        // No build instructions, just pull the image
        Logger.info(`No build instructions found, pulling image ${image}...`);
        
        const stream = await docker.pull(image);
        await new Promise((resolve, reject) => {
          docker.modem.followProgress(stream, (err: Error | null) => {
            if (err) reject(err);
            else resolve(null);
          });
        });
      }
    }
    
    // Prepare environment variables
    const environment: string[] = [];
    if (env_vars) {
      Object.entries(env_vars).forEach(([key, value]) => {
        environment.push(`${key}=${value}`);
      });
    }
    
    // Prepare volumes
    const binds: string[] = [];
    if (volumes) {
      volumes.forEach(volume => {
        binds.push(`${volume.host_path}:${volume.container_path}`);
      });
    }
    
    // Create container config
    const containerConfig: Dockerode.ContainerCreateOptions = {
      name: containerName,
      Image: image,
      Env: environment,
      HostConfig: {
        Binds: binds,
        // Add resource constraints
        Memory: config.memory || 512 * 1024 * 1024, // 512MB default
        MemorySwap: config.memorySwap || -1, // Unlimited swap
        NanoCpus: config.cpus ? config.cpus * 1000000000 : undefined, // CPUs in nano units
        // Add logging configuration
        LogConfig: {
          Type: 'json-file',
          Config: {
            'max-size': '10m',
            'max-file': '3'
          }
        }
      },
      // Add labels for identification
      Labels: {
        'dev.type': server_type,
        'dev.name': server_name,
        'dev.managed': 'true'
      }
    };
    
    // Handle code execution for python-runner
    if (server_type === 'python-runner' && code) {
      // Set up for running the provided code
      const filename = code_filename || 'script.py';
      const scriptContent = code;
      
      // Create a command to write and execute the file
      containerConfig.Cmd = [
        "sh", "-c", 
        `echo '${scriptContent.replace(/'/g, "'\\''")}' > /tmp/${filename} && python /tmp/${filename}`
      ];
      
      Logger.debug(`Running Python code: ${scriptContent.substring(0, 100)}...`);
    } 
    // Add command if specified in the template
    else if (config.command && Array.isArray(config.command)) {
      containerConfig.Cmd = config.command;
    }
    
    const container = await docker.createContainer(containerConfig);
    
    // Start container
    await container.start();
    
    return {
      id: container.id,
      name: containerName,
      status: "running"
    };
  } catch (error) {
    Logger.error(`Error creating container for ${server_name}:`, error);
    
    if (error instanceof TemplateNotFoundError || 
        error instanceof ContainerCreationError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ContainerCreationError(server_name, error.message);
    }
    
    throw new ContainerCreationError(server_name, 'Unknown error');
  }
}

// List server containers
export async function listServers(input: ListServersInput): Promise<ContainerInfo[]> {
  const { status, server_type } = input;
  
  try {
    // Determine filters
    const filters: Record<string, string[]> = {
      label: ['dev.managed=true']
    };
    
    if (status === 'running') {
      filters['status'] = ['running'];
    } else if (status === 'stopped') {
      filters['status'] = ['created', 'exited', 'paused'];
    }
    
    if (server_type) {
      filters['label'].push(`dev.type=${server_type}`);
    }
    
    // Get containers
    const containers = await docker.listContainers({
      all: status === 'all',
      filters: filters
    });
    
    // Format response
    return containers.map(formatContainerInfo);
  } catch (error) {
    Logger.error('Error listing containers:', error);
    
    if (error instanceof Error) {
      throw new DockerConnectionError(error.message);
    }
    
    throw new DockerConnectionError('Unknown error');
  }
}

// Get logs from a server container
export async function getServerLogs(input: GetServerLogsInput): Promise<{ logs: string }> {
  const { server_name, lines, since } = input;
  
  try {
    // Find container
    const container = await findContainer(server_name);
    if (!container) {
      throw new ContainerNotFoundError(server_name);
    }
    
    // Get logs using Docker exec instead to avoid type issues
    return new Promise((resolve, reject) => {
      const cmd = [`docker`, `logs`, `--tail`, `${lines || 100}`];
      
      if (since) {
        cmd.push('--since', since);
      }
      
      cmd.push(getContainerName(server_name));
      
      exec(cmd.join(' '), (error, stdout, stderr) => {
        if (error) {
          reject(new ContainerOperationError(server_name, 'get logs', error.message));
          return;
        }
        
        const logs = stdout + stderr;
        resolve({ logs });
      });
    });
  } catch (error) {
    Logger.error(`Error getting logs for ${server_name}:`, error);
    
    if (error instanceof ContainerNotFoundError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ContainerOperationError(server_name, 'get logs', error.message);
    }
    
    throw new ContainerOperationError(server_name, 'get logs', 'Unknown error');
  }
}

// Stop a server container
export async function stopServer(input: ServerOperationInput): Promise<{ name: string; status: string }> {
  const { server_name } = input;
  
  try {
    // Find container
    const container = await findContainer(server_name);
    if (!container) {
      throw new ContainerNotFoundError(server_name);
    }
    
    // Stop container
    await container.stop();
    
    return {
      name: getContainerName(server_name),
      status: 'stopped'
    };
  } catch (error) {
    Logger.error(`Error stopping container ${server_name}:`, error);
    
    if (error instanceof ContainerNotFoundError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ContainerOperationError(server_name, 'stop', error.message);
    }
    
    throw new ContainerOperationError(server_name, 'stop', 'Unknown error');
  }
}

// Start a server container
export async function startServer(input: ServerOperationInput): Promise<{ name: string; status: string }> {
  const { server_name } = input;
  
  try {
    // Find container
    const container = await findContainer(server_name);
    if (!container) {
      throw new ContainerNotFoundError(server_name);
    }
    
    // Start container
    await container.start();
    
    return {
      name: getContainerName(server_name),
      status: 'running'
    };
  } catch (error) {
    Logger.error(`Error starting container ${server_name}:`, error);
    
    if (error instanceof ContainerNotFoundError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ContainerOperationError(server_name, 'start', error.message);
    }
    
    throw new ContainerOperationError(server_name, 'start', 'Unknown error');
  }
}

// Restart a server container
export async function restartServer(input: ServerOperationInput): Promise<{ name: string; status: string }> {
  const { server_name } = input;
  
  try {
    // Find container
    const container = await findContainer(server_name);
    if (!container) {
      throw new ContainerNotFoundError(server_name);
    }
    
    // Restart container
    await container.restart();
    
    return {
      name: getContainerName(server_name),
      status: 'running'
    };
  } catch (error) {
    Logger.error(`Error restarting container ${server_name}:`, error);
    
    if (error instanceof ContainerNotFoundError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ContainerOperationError(server_name, 'restart', error.message);
    }
    
    throw new ContainerOperationError(server_name, 'restart', 'Unknown error');
  }
}

// Promise-based exec function
function execPromise(cmd: string, options: ExecOptions = {}): Promise<{ stdout: string, stderr: string }> {
  return new Promise((resolve, reject) => {
    const defaultOptions: ExecOptions = { 
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large build outputs
    };
    
    exec(cmd, { ...defaultOptions, ...options }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// ===== New Functions for Enhanced Docker MCP =====

// Get language image based on specified language
function getLanguageImage(language: string): string {
  // Map languages to their Docker images
  const languageImages: Record<string, string> = {
    'python': 'python:3.11-slim',
    'python3.10': 'python:3.10-slim',
    'python3.11': 'python:3.11-slim',
    'python3.12': 'python:3.12-slim',
    'node': 'node:20-slim',
    'javascript': 'node:20-slim',
    'typescript': 'node:20-slim',
    'ruby': 'ruby:3.2-slim',
    'go': 'golang:1.21-alpine',
    'rust': 'rust:1.70-slim',
    'java': 'openjdk:17-slim',
    'bash': 'bash:5.2',
    'shell': 'bash:5.2',
    'php': 'php:8.2-cli',
  };

  const image = languageImages[language.toLowerCase()];
  if (!image) {
    throw new Error(`Unsupported language: ${language}`);
  }

  return image;
}

// Generate a unique container name for ephemeral executions
function generateEphemeralContainerName(): string {
  const uniqueId = crypto.randomBytes(6).toString('hex');
  return `${CONTAINER_NAME_PREFIX}ephemeral-${uniqueId}`;
}

// Handle installation of dependencies based on language
function getDependencyInstallCommands(language: string, dependencies: string[]): string {
  if (!dependencies || dependencies.length === 0) {
    return '';
  }

  const escapedDeps = dependencies.map(dep => dep.replace(/'/g, "\\'")).join(' ');
  
  switch (language.toLowerCase()) {
    case 'python':
    case 'python3.10':
    case 'python3.11':
    case 'python3.12':
      return `pip install --no-cache-dir ${escapedDeps} && `;
    
    case 'node':
    case 'javascript':
    case 'typescript':
      return `npm install --no-save ${escapedDeps} && `;
    
    case 'ruby':
      return `gem install ${escapedDeps} && `;
    
    case 'go':
      return `go get ${escapedDeps} && `;
    
    case 'rust':
      return `cargo install ${escapedDeps} && `;
    
    case 'php':
      return `composer require ${escapedDeps} && `;
    
    default:
      return '';
  }
}

// Run code in an ephemeral container
export async function runCode(input: RunCodeInput): Promise<RunCodeResponse> {
  const { language, code, timeout = 30000, dependencies = [], env_vars = {} } = input;
  const containerName = generateEphemeralContainerName();
  const startTime = Date.now();
  
  try {
    // Get appropriate image for the language
    const image = getLanguageImage(language);
    
    // Check if image exists or pull it
    try {
      await docker.getImage(image).inspect();
      Logger.debug(`Image ${image} found locally`);
    } catch (error) {
      Logger.info(`Image ${image} not found locally, pulling...`);
      
      // Pull image
      const stream = await docker.pull(image);
      await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err: Error | null) => {
          if (err) reject(err);
          else resolve(null);
        });
      });
    }
    
    // Prepare environment variables
    const environment: string[] = [];
    Object.entries(env_vars).forEach(([key, value]) => {
      environment.push(`${key}=${value}`);
    });
    
    // Add special env vars for better output
    switch (language.toLowerCase()) {
      case 'python':
      case 'python3.10':
      case 'python3.11':
      case 'python3.12':
        environment.push('PYTHONUNBUFFERED=1');
        break;
      case 'node':
      case 'javascript':
      case 'typescript':
        environment.push('NODE_ENV=development');
        break;
    }
    
    // Prepare the command to execute
    let command: string[];
    let dependencyInstall = getDependencyInstallCommands(language, dependencies);
    
    switch (language.toLowerCase()) {
      case 'python':
      case 'python3.10':
      case 'python3.11':
      case 'python3.12':
        command = [
          'sh', '-c', 
          `${dependencyInstall}echo '${code.replace(/'/g, "'\\''")}' > /tmp/script.py && python /tmp/script.py`
        ];
        break;
      
      case 'node':
      case 'javascript':
        command = [
          'sh', '-c', 
          `${dependencyInstall}echo '${code.replace(/'/g, "'\\''")}' > /tmp/script.js && node /tmp/script.js`
        ];
        break;
      
      case 'typescript':
        command = [
          'sh', '-c', 
          `${dependencyInstall}npm install -g typescript && echo '${code.replace(/'/g, "'\\''")}' > /tmp/script.ts && tsc /tmp/script.ts && node /tmp/script.js`
        ];
        break;
      
      case 'ruby':
        command = [
          'sh', '-c', 
          `${dependencyInstall}echo '${code.replace(/'/g, "'\\''")}' > /tmp/script.rb && ruby /tmp/script.rb`
        ];
        break;
      
      case 'bash':
      case 'shell':
        command = [
          'sh', '-c', 
          `echo '${code.replace(/'/g, "'\\''")}' > /tmp/script.sh && chmod +x /tmp/script.sh && bash /tmp/script.sh`
        ];
        break;
      
      default:
        throw new Error(`Execution for language ${language} not implemented yet`);
    }
    
    // Create container config
    const containerConfig: Dockerode.ContainerCreateOptions = {
      name: containerName,
      Image: image,
      Cmd: command,
      Env: environment,
      HostConfig: {
        // Set resource limits for security
        Memory: 512 * 1024 * 1024, // 512MB
        MemorySwap: 768 * 1024 * 1024, // 768MB
        NanoCpus: 1 * 1000000000, // 1 CPU
        PidsLimit: 100, // Limit processes
        // Allow network access by default (as requested)
        // NetworkMode: 'bridge', // Default Docker network with internet access
        AutoRemove: true, // Auto remove container when done
      },
      // Add labels for identification
      Labels: {
        'dev.type': 'ephemeral',
        'dev.language': language,
        'dev.managed': 'true',
        'dev.ephemeral': 'true'
      }
    };
    
    Logger.debug(`Creating ephemeral container for ${language} execution`);
    
    // Create and start container
    const container = await docker.createContainer(containerConfig);
    await container.start();
    
    // Set up timeout handler
    const timeoutPromise = new Promise<RunCodeResponse>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Code execution timed out after ${timeout}ms`));
      }, timeout);
    });
    
    // Set up execution promise
    const executionPromise = new Promise<RunCodeResponse>(async (resolve) => {
      // Wait for container to finish
      const stream = await container.attach({stream: true, stdout: true, stderr: true});
      let output = '';
      
      stream.on('data', (chunk) => {
        output += chunk.toString();
      });
      
      // Wait for container to exit
      const result = await container.wait();
      const exitCode = result.StatusCode;
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      resolve({
        output: output.trim(),
        exit_code: exitCode,
        duration_ms: duration,
        success: exitCode === 0
      });
    });
    
    // Race between timeout and execution
    return Promise.race([executionPromise, timeoutPromise]);
    
  } catch (error) {
    Logger.error(`Error executing code in ephemeral container:`, error);
    
    // Cleanup container if it exists
    try {
      const container = docker.getContainer(containerName);
      await container.remove({ force: true });
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    return {
      output: error instanceof Error ? error.message : String(error),
      exit_code: 1,
      duration_ms: duration,
      success: false
    };
  }
}

// Build a Docker image from a template
// Register a new Docker template
export async function registerTemplate(input: RegisterTemplateInput): Promise<RegisterTemplateResponse> {
  const { name, image, description, config = {}, build } = input;
  
  try {
    Logger.info(`Registering new template: ${name}`);
    
    // Create template object
    const template = {
      image,
      config: {
        ...(config || {}),
        labels: {
          'mcp.description': description,
          ...(config?.labels || {})
        }
      },
      build
    };
    
    // Validate template fields
    if (!name || name.trim() === '') {
      throw new Error('Template name cannot be empty');
    }
    
    if (!image || image.trim() === '') {
      throw new Error('Template image cannot be empty');
    }
    
    // Check if template already exists
    const templatePath = path.join(templatesPath, `${name}.json`);
    const templateExists = fs.existsSync(templatePath);
    
    if (templateExists) {
      Logger.warn(`Template ${name} already exists, overwriting`);
    } else {
      Logger.info(`Creating new template: ${name}`);
    }
    
    // Ensure templates directory exists
    if (!fs.existsSync(templatesPath)) {
      Logger.info(`Creating templates directory: ${templatesPath}`);
      fs.mkdirSync(templatesPath, { recursive: true });
    }
    
    // Write template file
    fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
    
    return {
      success: true,
      message: templateExists 
        ? `Template ${name} updated successfully` 
        : `Template ${name} created successfully`,
      template_name: name
    };
  } catch (error) {
    Logger.error(`Error registering template ${name}:`, error);
    
    return {
      success: false,
      message: `Failed to register template ${name}: ${error instanceof Error ? error.message : String(error)}`,
      template_name: name
    };
  }
}

export async function buildImage(input: BuildImageInput): Promise<BuildImageResponse> {
  const { template_name, force = false } = input;
  const startTime = Date.now();
  
  try {
    // Get template
    const templatePath = path.join(templatesPath, `${template_name}.json`);
    
    if (!fs.existsSync(templatePath)) {
      throw new TemplateNotFoundError(template_name);
    }
    
    // Read and parse template file
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const template = JSON.parse(templateContent);
    
    const imageName = template.image;
    
    // Check if image already exists (unless force rebuild)
    if (!force) {
      try {
        await docker.getImage(imageName).inspect();
        Logger.info(`Image ${imageName} already exists, skipping build. Use force=true to rebuild.`);
        return {
          success: true,
          message: `Image ${imageName} already exists`,
          image_name: imageName
        };
      } catch (err) {
        // Image doesn't exist, continue with build
        Logger.debug(`Image ${imageName} not found, proceeding with build`);
      }
    }
    
    // For MCP servers, we'll use a different approach - build them on the host
    // and then create a Docker image with just the built files
    
    // First, determine the server path
    let serverPath;
    if (template.server_path && template.server_path.startsWith('/')) {
      // Absolute path
      serverPath = template.server_path;
    } else if (template.build && template.build.context && template.build.context.startsWith('/')) {
      // Absolute path from build context
      serverPath = template.build.context;
    } else {
      throw new ImageBuildError(template_name, "Server path is not specified or invalid");
    }
    
    Logger.debug(`Using server path: ${serverPath}`);
    
    // Ensure server directory exists
    if (!fs.existsSync(serverPath)) {
      throw new ImageBuildError(template_name, `Server directory not found: ${serverPath}`);
    }
    
    // Check if it has a dist directory already
    const distPath = path.join(serverPath, 'dist');
    
    // If not, we need to build it
    if (!fs.existsSync(distPath) || force) {
      // Build the server first if needed
      if (fs.existsSync(path.join(serverPath, 'package.json'))) {
        // It's a Node.js project
        Logger.info(`Building Node.js MCP server at ${serverPath}`);
        
        // Run npm build
        try {
          await execPromise('npm run build', { cwd: serverPath });
          Logger.info(`Successfully built server at ${serverPath}`);
        } catch (buildError) {
          throw new ImageBuildError(template_name, `Failed to build server: ${buildError instanceof Error ? buildError.message : String(buildError)}`);
        }
        
        // Ensure dist directory exists after build
        if (!fs.existsSync(distPath)) {
          throw new ImageBuildError(template_name, `Build completed but dist directory not found at ${distPath}`);
        }
      } else if (fs.existsSync(path.join(serverPath, 'pyproject.toml'))) {
        // It's a Python project
        Logger.info(`Building Python MCP server at ${serverPath}`);
        
        // Python projects typically don't need a build step, they run directly from source
        Logger.info(`Python server at ${serverPath} doesn't need building`);
      } else {
        throw new ImageBuildError(template_name, `Unsupported server type at ${serverPath}`);
      }
    } else {
      Logger.info(`Server at ${serverPath} already has dist directory, skipping build`);
    }
    
    // Now create a Docker image using a pre-built MCP server runner
    const runnerDockerfilePath = path.join(templatesPath, 'mcp-runner.dockerfile');
    
    // Check if runner Dockerfile exists
    if (!fs.existsSync(runnerDockerfilePath)) {
      throw new ImageBuildError(template_name, `Runner Dockerfile not found at ${runnerDockerfilePath}`);
    }
    
    // Build command
    const buildCmd = `docker build -t ${imageName} -f ${runnerDockerfilePath} --build-arg SERVER_NAME=${template_name} ${serverPath}`;
    
    // Execute build
    Logger.info(`Building image ${imageName} from server ${serverPath}`);
    Logger.debug(`Build command: ${buildCmd}`);
    
    const { stdout, stderr } = await execPromise(buildCmd);
    
    const duration = Date.now() - startTime;
    Logger.info(`Built image ${imageName} in ${duration}ms`);
    
    if (stderr && !stderr.includes('Successfully')) {
      Logger.warn(`Build warnings for ${imageName}:`, stderr);
    }
    
    // Verify image was created
    try {
      await docker.getImage(imageName).inspect();
    } catch (err) {
      throw new ImageBuildError(template_name, `Build completed but image ${imageName} not found`);
    }
    
    return {
      success: true,
      message: `Successfully built image ${imageName} in ${duration}ms`,
      logs: stdout + stderr,
      image_name: imageName
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    Logger.error(`Error building image for template ${template_name}:`, error);
    
    if (error instanceof TemplateNotFoundError || error instanceof ImageBuildError) {
      return {
        success: false,
        message: error.message,
        logs: error instanceof ImageBuildError ? error.message : undefined
      };
    }
    
    return {
      success: false,
      message: `Failed to build image for template ${template_name}: ${error instanceof Error ? error.message : String(error)}`,
      logs: error instanceof Error ? error.stack : undefined
    };
  }
}