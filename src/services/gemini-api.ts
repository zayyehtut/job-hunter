import type { JobAIData, GeminiRequest, GeminiResponse } from "~/types"
import type { BaseAgent, AgentExecutionResult } from "~/types/agents"
import { CONFIG } from "~/config/constants"
import { getAgent } from "~/agents"

/**
 * Gemini API client for AI processing
 * Now supports agent-based architecture for extensibility
 */
export class GeminiAPIClient {
  /**
   * Execute an agent with the given input
   */
  static async executeAgent<TInput, TOutput>(
    agentName: string,
    input: TInput,
    apiKey: string
  ): Promise<AgentExecutionResult<TOutput>> {
    const startTime = Date.now()
    
    try {
      // Get the agent
      const agent = getAgent(agentName) as BaseAgent<TInput, TOutput>
      
      // Validate input
      if (!agent.validateInput(input)) {
        throw new Error(`Invalid input for agent '${agentName}'`)
      }

      // Create request using the agent
      const requestBody = agent.createRequest(input)

      // Make API call
      const response = await this.makeAPICall(apiKey, agent.model, requestBody)
      
      // Process response using the agent
      const result = await response.json()
      const data = agent.processResponse(result)
      
      return {
        success: true,
        data,
        agentName,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      console.error(`Agent execution error (${agentName}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        agentName,
        executionTime: Date.now() - startTime
      }
    }
  }

  /**
   * Process job data using the job extraction agent
   * @deprecated Use executeAgent('job-extraction', input, apiKey) instead
   */
  static async processJobData(
    jobData: { content: string; url: string },
    apiKey: string,
    modelName: string = CONFIG.DEFAULT_MODEL_NAME
  ): Promise<JobAIData> {
    const result = await this.executeAgent('job-extraction', jobData, apiKey)
    
    if (!result.success) {
      throw new Error(result.error || 'Job processing failed')
    }
    
    return result.data as JobAIData
  }

  /**
   * Make the actual API call to Gemini
   */
  private static async makeAPICall(
    apiKey: string, 
    modelName: string, 
    requestBody: GeminiRequest
  ): Promise<Response> {
    const url = `${CONFIG.GEMINI_API_BASE_URL}/${modelName}:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response
  }

  /**
   * Test API connection with a simple request
   */
  static async testConnection(
    apiKey: string,
    modelName: string = CONFIG.DEFAULT_MODEL_NAME
  ): Promise<boolean> {
    try {
      const testRequestBody: GeminiRequest = {
        contents: [{
          role: 'user',
          parts: [{
            text: 'Hello, please respond with "API connection successful"'
          }]
        }],
        systemInstruction: {
          parts: [{
            text: 'You are a helpful assistant. Respond with a simple JSON object containing a message field.'
          }]
        },
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'A simple response message'
              }
            },
            required: ['message']
          },
          maxOutputTokens: 50
        }
      }

      const response = await this.makeAPICall(apiKey, modelName, testRequestBody)
      const result: GeminiResponse = await response.json()

      return !!(result.candidates && result.candidates[0])
    } catch (error) {
      console.error('API connection test failed:', error)
      return false
    }
  }
}
