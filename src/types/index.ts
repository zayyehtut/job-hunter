// Core job data types
export interface JobLocation {
  city?: string
  state?: string
  country?: string
  rawText: string
}

export interface JobCompensation {
  minSalary?: number
  maxSalary?: number
  currency?: string
  period?: string
  notes?: string
}

export interface JobSkills {
  hardSkills: string[]
  softSkills: string[]
  toolsAndSoftware: string[]
}

export interface JobQualification {
  detail: string
  type: "Must-have" | "Preferred"
}

export interface JobExperience {
  minYears?: number
  maxYears?: number
  rawText: string
}

export interface JobCulture {
  tone?: string
  keyAdjectives?: string[]
}

export interface JobApplication {
  instructions?: string
  closingDate?: string
}

export interface JobAIData {
  jobTitle: string
  companyName: string
  location: JobLocation
  workModel: "On-site" | "Hybrid" | "Remote"
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Temporary"
  compensation?: JobCompensation
  coreObjective: string
  keySkillsAndTools: JobSkills
  experienceRequirements: JobExperience
  qualifications: JobQualification[]
  companyCulture?: JobCulture
  applicationLogistics?: JobApplication
}

export interface JobData {
  id: string
  savedDate: string
  updatedDate: string
  sourceURL: string
  applyLink: string
  status: "Saved" | "Applied" | "Rejected" | "Interview"
  aiData: JobAIData
  metadata: {
    processedAt: string
    contentLength: number
    userAgent?: string
    rawMarkdown?: string
  }
}

// Settings types
export interface ExtensionSettings {
  apiKey: string
  modelName: string
  maxJobs?: number
}

// API types
export interface GeminiRequest {
  contents: Array<{
    role: string
    parts: Array<{
      text: string
    }>
  }>
  systemInstruction: {
    parts: Array<{
      text: string
    }>
  }
  generationConfig: {
    temperature: number
    thinkingConfig?: {
      thinkingBudget: number
    }
    responseMimeType: string
    responseSchema: any
    maxOutputTokens?: number
  }
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

// Plasmo Messaging Types
export type MessageNames = 
  | "processJob"
  | "getJobs" 
  | "deleteJob"
  | "updateJobStatus"
  | "testApi"
  | "saveSettings"
  | "getSettings"

// Message types
export interface ProcessJobMessage {
  name: "processJob"
  body: {
    url: string
    content: string
  }
}

export interface ProcessJobResponse {
  success: boolean
  jobId?: string
  jobTitle?: string
  companyName?: string
  error?: string
}

export interface GetJobsMessage {
  name: "getJobs"
  body: {}
}

export interface GetJobsResponse {
  success: boolean
  jobs?: JobData[]
  error?: string
}

export interface DeleteJobMessage {
  name: "deleteJob"
  body: {
    jobId: string
  }
}

export interface DeleteJobResponse {
  success: boolean
  deleted?: boolean
  error?: string
}

export interface UpdateJobStatusMessage {
  name: "updateJobStatus"
  body: {
    jobId: string
    status: JobData["status"]
  }
}

export interface UpdateJobStatusResponse {
  success: boolean
  updated?: boolean
  error?: string
}

export interface TestApiMessage {
  name: "testApi"
  body: {
    apiKey: string
    modelName?: string
  }
}

export interface TestApiResponse {
  success: boolean
  connected?: boolean
  error?: string
}

export interface SaveSettingsMessage {
  name: "saveSettings"
  body: ExtensionSettings
}

export interface SaveSettingsResponse {
  success: boolean
  error?: string
}

export interface GetSettingsMessage {
  name: "getSettings"
  body: {}
}

export interface GetSettingsResponse {
  success: boolean
  settings?: ExtensionSettings
  error?: string
}

// Statistics types
export interface JobStats {
  total: number
  companies: number
  remote: number
  thisWeek: number
  byStatus: Record<string, number>
  byCompany: Record<string, number>
}

// UI types
export interface JobTableRow {
  job: JobData
  index: number
}

export interface JobModalProps {
  job: JobData
  onClose: () => void
}
