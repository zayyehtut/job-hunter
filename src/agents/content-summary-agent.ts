import type { BaseAgent } from "~/types/agents"
import type { GeminiRequest, GeminiResponse } from "~/types"
import { CONFIG } from "~/config/constants"

/**
 * Input for content summarization
 */
export interface ContentSummaryInput {
  content: string
  maxLength?: number
  focus?: string
}

/**
 * Output for content summarization
 */
export interface ContentSummaryOutput {
  summary: string
  keyPoints: string[]
  wordCount: number
  originalLength: number
}

/**
 * Content Summary Agent
 * Summarizes long content into concise summaries
 */
export const contentSummaryAgent: BaseAgent<ContentSummaryInput, ContentSummaryOutput> = {
  name: "Content Summary Agent",
  description: "Summarizes long content into concise, structured summaries",
  model: CONFIG.DEFAULT_MODEL_NAME,
  config: {
    temperature: 0.3,
    responseMimeType: 'application/json',
    responseSchema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'A concise summary of the content'
        },
        keyPoints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key points extracted from the content'
        },
        wordCount: {
          type: 'number',
          description: 'Number of words in the summary'
        }
      },
      required: ['summary', 'keyPoints', 'wordCount']
    },
    maxOutputTokens: 1000
  },
  systemInstruction: `You are an expert content summarizer. Your task is to create concise, accurate summaries of provided content.

## Instructions:
1. Create a clear, concise summary that captures the main points
2. Extract 3-5 key points that are most important
3. Maintain accuracy and avoid adding information not in the original
4. Use professional, clear language
5. Respect any specified focus areas or length limits

## Output Format:
- summary: A concise paragraph summarizing the content
- keyPoints: Array of 3-5 most important points
- wordCount: Number of words in the summary`,

  /**
   * Validates input before processing
   */
  validateInput(input: ContentSummaryInput): boolean {
    return !!(input.content && input.content.trim().length > 0)
  },

  /**
   * Creates a Gemini request for content summarization
   */
  createRequest(input: ContentSummaryInput): GeminiRequest {
    if (!this.validateInput(input)) {
      throw new Error('Invalid input: content is required')
    }

    const focusInstruction = input.focus ? `\n\nFocus on: ${input.focus}` : ''
    const lengthInstruction = input.maxLength ? `\n\nKeep summary under ${input.maxLength} words.` : ''

    return {
      contents: [{
        role: 'user',
        parts: [{
          text: `Please summarize the following content:${focusInstruction}${lengthInstruction}\n\n${input.content}`
        }]
      }],
      systemInstruction: {
        parts: [{
          text: this.systemInstruction
        }]
      },
      generationConfig: {
        ...this.config
      }
    }
  },

  /**
   * Processes the AI response into ContentSummaryOutput format
   */
  processResponse(response: GeminiResponse): ContentSummaryOutput {
    // Validate response structure
    if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API')
    }

    const aiResponseText = response.candidates[0].content.parts[0].text

    // Parse JSON response
    let summaryData: any
    try {
      summaryData = JSON.parse(aiResponseText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('AI Response:', aiResponseText)
      throw new Error('Failed to parse AI response as JSON')
    }

    // Validate required fields
    if (!summaryData.summary || !summaryData.keyPoints || typeof summaryData.wordCount !== 'number') {
      throw new Error('Invalid summary data structure')
    }

    return {
      summary: summaryData.summary,
      keyPoints: summaryData.keyPoints,
      wordCount: summaryData.wordCount,
      originalLength: 0 // This would be calculated from input if needed
    }
  }
}
