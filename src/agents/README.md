# Agent-Based AI Processing System

This directory contains the agent-based AI processing system that provides a modular, extensible approach to AI-powered data processing.

## 🏗️ Architecture Overview

The agent-based system allows you to easily add new AI processing capabilities without modifying the core API client. Each agent is self-contained with its own:

- **Input validation**
- **Request creation**
- **Response processing**
- **Configuration**

## 📁 File Structure

```
src/agents/
├── index.ts                    # Agent registry and utilities
├── job-extraction-agent.ts     # Job data extraction agent
├── content-summary-agent.ts    # Content summarization agent
└── README.md                   # This documentation
```

## 🎯 Available Agents

### 1. Job Extraction Agent (`job-extraction`)
- **Purpose**: Extracts structured job data from HTML content
- **Input**: `{ content: string, url: string }`
- **Output**: `JobAIData` object with structured job information

### 2. Content Summary Agent (`content-summary`)
- **Purpose**: Summarizes long content into concise summaries
- **Input**: `{ content: string, maxLength?: number, focus?: string }`
- **Output**: `{ summary: string, keyPoints: string[], wordCount: number }`

## 🚀 Usage Examples

### Using the Job Extraction Agent

```typescript
import { GeminiAPIClient } from "~/services/gemini-api"

// Method 1: Using the new agent-based system
const result = await GeminiAPIClient.executeAgent('job-extraction', {
  content: htmlContent,
  url: jobUrl
}, apiKey)

if (result.success) {
  const jobData = result.data
  console.log(`Processed in ${result.executionTime}ms`)
} else {
  console.error('Processing failed:', result.error)
}

// Method 2: Using the legacy method (still supported)
const jobData = await GeminiAPIClient.processJobData({
  content: htmlContent,
  url: jobUrl
}, apiKey)
```

### Using the Content Summary Agent

```typescript
import { GeminiAPIClient } from "~/services/gemini-api"

const result = await GeminiAPIClient.executeAgent('content-summary', {
  content: longArticle,
  maxLength: 200,
  focus: 'technical requirements'
}, apiKey)

if (result.success) {
  const summary = result.data
  console.log('Summary:', summary.summary)
  console.log('Key points:', summary.keyPoints)
}
```

## 🔧 Adding New Agents

To add a new agent, follow these steps:

### 1. Create the Agent File

```typescript
// src/agents/my-new-agent.ts
import type { BaseAgent } from "~/types/agents"
import type { GeminiRequest, GeminiResponse } from "~/types"

export interface MyAgentInput {
  // Define your input interface
}

export interface MyAgentOutput {
  // Define your output interface
}

export const myNewAgent: BaseAgent<MyAgentInput, MyAgentOutput> = {
  name: "My New Agent",
  description: "Description of what this agent does",
  model: "gemini-2.5-flash",
  config: {
    temperature: 0.5,
    responseMimeType: 'application/json',
    responseSchema: {
      // Define your JSON schema
    }
  },
  systemInstruction: `Your system instruction here`,

  validateInput(input: MyAgentInput): boolean {
    // Validate your input
    return true
  },

  createRequest(input: MyAgentInput): GeminiRequest {
    // Create the Gemini request
    return {
      contents: [{
        role: 'user',
        parts: [{ text: input.someField }]
      }],
      systemInstruction: {
        parts: [{ text: this.systemInstruction }]
      },
      generationConfig: this.config
    }
  },

  processResponse(response: GeminiResponse): MyAgentOutput {
    // Process the AI response
    const data = JSON.parse(response.candidates[0].content.parts[0].text)
    return {
      // Transform to your output format
    }
  }
}
```

### 2. Register the Agent

```typescript
// src/agents/index.ts
import { myNewAgent } from "./my-new-agent"

export const agentRegistry: AgentRegistry = {
  'job-extraction': jobExtractionAgent,
  'content-summary': contentSummaryAgent,
  'my-new-agent': myNewAgent  // Add your new agent
}

export { myNewAgent }
```

### 3. Use the Agent

```typescript
const result = await GeminiAPIClient.executeAgent('my-new-agent', input, apiKey)
```

## 🎨 Agent Configuration

Each agent can be configured with:

- **Model**: Which Gemini model to use
- **Temperature**: Controls randomness (0.0 = deterministic, 1.0 = very random)
- **Response Schema**: JSON schema for structured output
- **Max Tokens**: Maximum response length
- **System Instruction**: Instructions for the AI model

## 🔍 Error Handling

The agent system provides comprehensive error handling:

- **Input validation** before processing
- **Response validation** after processing
- **Execution timing** for performance monitoring
- **Detailed error messages** for debugging

## 📊 Performance Monitoring

Each agent execution returns timing information:

```typescript
const result = await GeminiAPIClient.executeAgent('job-extraction', input, apiKey)
console.log(`Agent: ${result.agentName}`)
console.log(`Execution time: ${result.executionTime}ms`)
console.log(`Success: ${result.success}`)
```

## 🔄 Backward Compatibility

The existing `processJobData` method is still supported and will continue to work. It now internally uses the agent-based system, ensuring no breaking changes to existing code.

## 🚀 Future Extensions

This agent-based system makes it easy to add new capabilities:

- **Resume Analysis Agent**: Analyze and score resumes
- **Company Research Agent**: Extract company information
- **Salary Analysis Agent**: Analyze compensation data
- **Skills Matching Agent**: Match job requirements to candidate skills
- **Interview Question Generator**: Generate relevant interview questions

Each new agent can be added without modifying existing code, making the system highly extensible and maintainable.
