// Custom error classes for Docker MCP server

export class DockerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DockerError';
  }
}

export class ContainerNotFoundError extends DockerError {
  constructor(serverName: string) {
    super(`Container with name ${serverName} not found`);
    this.name = 'ContainerNotFoundError';
  }
}

export class ContainerCreationError extends DockerError {
  constructor(serverName: string, details: string) {
    super(`Failed to create container ${serverName}: ${details}`);
    this.name = 'ContainerCreationError';
  }
}

export class TemplateNotFoundError extends DockerError {
  constructor(serverType: string) {
    super(`Server template for type ${serverType} not found`);
    this.name = 'TemplateNotFoundError';
  }
}

export class ContainerOperationError extends DockerError {
  constructor(serverName: string, operation: string, details: string) {
    super(`Failed to ${operation} container ${serverName}: ${details}`);
    this.name = 'ContainerOperationError';
  }
}

export class DockerConnectionError extends DockerError {
  constructor(details: string) {
    super(`Failed to connect to Docker daemon: ${details}`);
    this.name = 'DockerConnectionError';
  }
}

export class ImageBuildError extends DockerError {
  constructor(templateName: string, details: string) {
    super(`Failed to build image for template '${templateName}': ${details}`);
    this.name = 'ImageBuildError';
  }
}