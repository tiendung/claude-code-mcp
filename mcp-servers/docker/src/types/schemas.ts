import { z } from 'zod';

// Schema for volume mount
export const VolumeMountSchema = z.object({
  host_path: z.string(),
  container_path: z.string()
});

// Schema for port mapping
export const PortMappingSchema = z.object({
  host: z.number(),
  container: z.number(),
  protocol: z.enum(['tcp', 'udp']).optional().default('tcp')
});

// Schema for server creation (legacy)
export const CreateServerSchema = z.object({
  server_type: z.string(),
  server_name: z.string(),
  env_vars: z.record(z.string()).optional(),
  volumes: z.array(VolumeMountSchema).optional(),
  code: z.string().optional(),
  code_filename: z.string().optional()
});

export type CreateServerInput = z.infer<typeof CreateServerSchema>;

// Schema for creating environments (new)
export const CreateEnvironmentSchema = z.object({
  name: z.string(),
  template: z.string(),
  env_vars: z.record(z.string()).optional(),
  volumes: z.array(VolumeMountSchema).optional(),
  port_mappings: z.array(PortMappingSchema).optional(),
  persistent: z.boolean().optional().default(true)
});

export type CreateEnvironmentInput = z.infer<typeof CreateEnvironmentSchema>;

// Schema for running code in an ephemeral container
export const RunCodeSchema = z.object({
  language: z.string(),
  code: z.string(),
  timeout: z.number().optional().default(30000),
  dependencies: z.array(z.string()).optional(),
  env_vars: z.record(z.string()).optional()
});

export type RunCodeInput = z.infer<typeof RunCodeSchema>;

// Schema for executing code in an existing environment
export const ExecuteInEnvironmentSchema = z.object({
  environment_name: z.string(),
  code: z.string(),
  file_path: z.string().optional(),
  timeout: z.number().optional().default(30000)
});

export type ExecuteInEnvironmentInput = z.infer<typeof ExecuteInEnvironmentSchema>;

// Schema for file operations in environments
export const EnvironmentFileOperationSchema = z.object({
  environment_name: z.string(),
  path: z.string()
});

export type EnvironmentFileOperationInput = z.infer<typeof EnvironmentFileOperationSchema>;

// Schema for creating a file in an environment
export const CreateFileSchema = z.object({
  environment_name: z.string(),
  path: z.string(),
  content: z.string()
});

export type CreateFileInput = z.infer<typeof CreateFileSchema>;

// Schema for copying files to/from environments
export const CopyFileSchema = z.object({
  environment_name: z.string(),
  source: z.string(),
  destination: z.string(),
  direction: z.enum(['to_container', 'from_container'])
});

export type CopyFileInput = z.infer<typeof CopyFileSchema>;

// Schema for installing packages in an environment
export const InstallPackageSchema = z.object({
  environment_name: z.string(),
  package_name: z.string(),
  version: z.string().optional().default('latest')
});

export type InstallPackageInput = z.infer<typeof InstallPackageSchema>;

// Schema for listing servers/environments
export const ListServersSchema = z.object({
  status: z.enum(['running', 'stopped', 'all']).optional().default('all'),
  server_type: z.string().optional()
});

export type ListServersInput = z.infer<typeof ListServersSchema>;

// Schema for getting server logs
export const GetServerLogsSchema = z.object({
  server_name: z.string(),
  lines: z.number().optional().default(100),
  since: z.string().optional(),
  follow: z.boolean().optional().default(false)
});

export type GetServerLogsInput = z.infer<typeof GetServerLogsSchema>;

// Schema for server operations (stop, start, restart)
export const ServerOperationSchema = z.object({
  server_name: z.string()
});

export type ServerOperationInput = z.infer<typeof ServerOperationSchema>;

// Types for Docker container information
export type ContainerStatus = 'running' | 'created' | 'exited' | 'paused' | 'restarting' | 'removing' | 'dead';

export type ContainerInfo = {
  id: string;
  name: string;
  status: ContainerStatus;
  image: string;
  created: string;
  ports: Array<{
    privatePort: number;
    publicPort?: number;
    type: string;
  }>;
  labels: Record<string, string>;
};

// Type for run code response
export type RunCodeResponse = {
  output: string;
  exit_code: number;
  duration_ms: number;
  success: boolean;
};

// Schema for building Docker images
export const BuildImageSchema = z.object({
  template_name: z.string(),
  force: z.boolean().optional()
});

export type BuildImageInput = z.infer<typeof BuildImageSchema>;

export type BuildImageResponse = {
  success: boolean;
  message: string;
  logs?: string;
  image_name?: string;
};

// Schema for registering new Docker templates
export const RegisterTemplateSchema = z.object({
  name: z.string(),
  image: z.string(),
  description: z.string(),
  config: z.record(z.any()).optional(),
  build: z.object({
    context: z.string().optional(),
    dockerfile: z.string().optional(),
    options: z.record(z.any()).optional()
  }).optional()
});

export type RegisterTemplateInput = z.infer<typeof RegisterTemplateSchema>;

export type RegisterTemplateResponse = {
  success: boolean;
  message: string;
  template_name: string;
};