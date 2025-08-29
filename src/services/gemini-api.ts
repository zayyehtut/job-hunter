import type { JobAIData, GeminiRequest, GeminiResponse } from "~/types"
import { CONFIG, SYSTEM_INSTRUCTION, JOB_ANALYSIS_SCHEMA } from "~/config/constants"
import { validateAIResponse } from "~/utils"

/**
 * Gemini API client for job analysis
 */
export class GeminiAPIClient {
  /**
   * Process job data using Gemini AI
   */
  static async processJobData(
    jobData: { content: string; url: string },
    apiKey: string,
    modelName: string = CONFIG.DEFAULT_MODEL_NAME
  ): Promise<JobAIData> {
    try {
      // Validate inputs
      if (!apiKey) {
        throw new Error('API Key is required')
      }
      
      if (!jobData.content || !jobData.url) {
        throw new Error('Job content and URL are required')
      }

      // Prepare the API request
      const requestBody: GeminiRequest = {
        contents: [{
          role: 'user',
          parts: [{
            text: jobData.content
          }]
        }],
        systemInstruction: {
          parts: [{
            text: SYSTEM_INSTRUCTION
          }]
        },
        generationConfig: {
          ...CONFIG.GENERATION_CONFIG,
          responseSchema: JOB_ANALYSIS_SCHEMA
        }
      }

      // Make API call
      const response = await this.makeAPICall(apiKey, modelName, requestBody)
      
      // Process and validate response
      const aiData = await this.processAPIResponse(response)
      
      return aiData
    } catch (error) {
      console.error('Gemini API processing error:', error)
      throw error
    }
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
   * Process and validate the API response
   */
  private static async processAPIResponse(response: Response): Promise<JobAIData> {
    const result: GeminiResponse = await response.json()

    // Validate response structure
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API')
    }

    const aiResponseText = result.candidates[0].content.parts[0].text

    // Parse JSON response
    let aiData: JobAIData
    try {
      aiData = JSON.parse(aiResponseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('AI Response:', aiResponseText)
      throw new Error('Failed to parse AI response as JSON')
    }

    // Basic validation of required fields
    validateAIResponse(aiData)

    return aiData
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
