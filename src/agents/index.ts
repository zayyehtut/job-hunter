import { jobExtractionAgent } from "./job-extraction-agent"
import { contentSummaryAgent } from "./content-summary-agent"
import type { AgentRegistry } from "~/types/agents"

/**
 * Registry of all available AI agents
 */
export const agentRegistry: AgentRegistry = {
  'job-extraction': jobExtractionAgent,
  'content-summary': contentSummaryAgent
}

/**
 * Get an agent by name
 */
export function getAgent(name: string) {
  const agent = agentRegistry[name]
  if (!agent) {
    throw new Error(`Agent '${name}' not found. Available agents: ${Object.keys(agentRegistry).join(', ')}`)
  }
  return agent
}

/**
 * List all available agents
 */
export function listAgents() {
  return Object.keys(agentRegistry).map(agentName => ({
    name: agentName,
    description: agentRegistry[agentName].description,
    model: agentRegistry[agentName].model
  }))
}

// Export individual agents
export { jobExtractionAgent, contentSummaryAgent }
