import { z } from 'zod';

// Define types for agent management
export const AgentSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['idle', 'running', 'completed', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
  instructions: z.string(),
  result: z.string().optional(),
  error: z.string().optional(),
});

export type Agent = z.infer<typeof AgentSchema>;

// Create agent input schema
export const CreateAgentSchema = z.object({
  name: z.string().optional(),
  instructions: z.string(),
});

export type CreateAgentInput = z.infer<typeof CreateAgentSchema>;

// Agent run instructions schema
export const RunAgentSchema = z.object({
  agentId: z.string(),
  additionalInstructions: z.string().optional(),
});

export type RunAgentInput = z.infer<typeof RunAgentSchema>;

// Get agent result schema
export const GetAgentSchema = z.object({
  agentId: z.string(),
});

export type GetAgentInput = z.infer<typeof GetAgentSchema>;

// List agents schema
export const ListAgentsSchema = z.object({
  status: z.enum(['idle', 'running', 'completed', 'failed']).optional(),
  limit: z.number().optional(),
});

export type ListAgentsInput = z.infer<typeof ListAgentsSchema>;