import type { JobExtractionAgent, JobExtractionInput } from "~/types/agents"
import type { GeminiRequest, JobAIData, GeminiResponse } from "~/types"
import { CONFIG, SYSTEM_INSTRUCTION, JOB_ANALYSIS_SCHEMA } from "~/config/constants"
import { validateAIResponse } from "~/utils"

/**
 * Job Extraction Agent
 * Extracts structured job data from HTML content using Gemini AI
 */
export const jobExtractionAgent: JobExtractionAgent = {
  name: "Job Extraction Agent",
  description: "Extracts structured job data from HTML content using AI analysis",
  type: 'job-extraction',
  model: CONFIG.DEFAULT_MODEL_NAME,
  config: {
    temperature: CONFIG.GENERATION_CONFIG.temperature,
    responseMimeType: CONFIG.GENERATION_CONFIG.responseMimeType,
    responseSchema: JOB_ANALYSIS_SCHEMA,
    maxOutputTokens: 4000
  },
  systemInstruction: SYSTEM_INSTRUCTION,

  /**
   * Validates input before processing
   */
  validateInput(input: JobExtractionInput): boolean {
    return !!(input.content && input.url && input.content.trim().length > 0)
  },

  /**
   * Creates a Gemini request for job extraction
   */
  createRequest(input: JobExtractionInput): GeminiRequest {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input: content and URL are required')
    }

    return {
      contents: [{
        role: 'user',
        parts: [{
          text: input.content
        }]
      }],
      systemInstruction: {
        parts: [{
          text: this.systemInstruction
        }]
      },
      generationConfig: {
        ...this.config,
        thinkingConfig: CONFIG.GENERATION_CONFIG.thinkingConfig
      }
    }
  },

  /**
   * Processes the AI response into JobAIData format
   */
  processResponse(response: GeminiResponse): JobAIData {
    // Validate response structure
    if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API')
    }

    const aiResponseText = response.candidates[0].content.parts[0].text

    // Parse JSON response
    let aiData: JobAIData
    try {
      aiData = JSON.parse(aiResponseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('AI Response:', aiResponseText)
      throw new Error('Failed to parse AI response as JSON')
    }

    // Validate the parsed data using our existing validation utility
    validateAIResponse(aiData)

    return aiData
  }
}
