import type { GeminiRequest, JobAIData } from "./index"

/**
 * Base interface for all AI agents
 */
export interface BaseAgent<TInput, TOutput> {
  name: string
  description: string
  model: string
  config: {
    temperature: number
    responseMimeType: string
    responseSchema: any
    maxOutputTokens?: number
  }
  systemInstruction: string
  
  /**
   * Creates a Gemini request for the given input
   */
  createRequest(input: TInput): GeminiRequest
  
  /**
   * Processes the AI response into the expected output format
   */
  processResponse(response: any): TOutput
  
  /**
   * Validates the input before processing
   */
  validateInput(input: TInput): boolean
}

/**
 * Job extraction agent interface
 */
export interface JobExtractionAgent extends BaseAgent<JobExtractionInput, JobAIData> {
  type: 'job-extraction'
}

/**
 * Input for job extraction
 */
export interface JobExtractionInput {
  content: string
  url: string
}

/**
 * Agent registry for managing different agents
 */
export interface AgentRegistry {
  [key: string]: BaseAgent<any, any>
}

/**
 * Agent execution result
 */
export interface AgentExecutionResult<T> {
  success: boolean
  data?: T
  error?: string
  agentName: string
  executionTime: number
}
