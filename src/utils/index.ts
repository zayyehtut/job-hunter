import type { JobData, JobAIData, JobCompensation, JobStats } from "~/types"

/**
 * Generate a unique ID for jobs
 */
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  if (!text) return ''
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Sanitize filename for downloads
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'file'
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

/**
 * Format salary for display (compact)
 */
export function formatSalary(compensation?: JobCompensation): string {
  if (!compensation) return 'N/A'

  let salaryText = ''
  if (compensation.minSalary || compensation.maxSalary) {
    if (compensation.minSalary && compensation.maxSalary) {
      salaryText = `${compensation.minSalary.toLocaleString()}-${compensation.maxSalary.toLocaleString()}`
    } else if (compensation.minSalary) {
      salaryText = `${compensation.minSalary.toLocaleString()}+`
    } else if (compensation.maxSalary) {
      salaryText = `Up to ${compensation.maxSalary.toLocaleString()}`
    }

    if (compensation.currency && compensation.currency !== 'AUD') {
      salaryText += ` ${compensation.currency}`
    }
  } else if (compensation.notes) {
    salaryText = compensation.notes
  } else {
    return 'N/A'
  }

  return truncateText(salaryText, 15)
}

/**
 * Format salary for detailed view
 */
export function formatSalaryDetailed(compensation?: JobCompensation): string {
  if (!compensation) return 'N/A'

  const parts: string[] = []

  if (compensation.minSalary || compensation.maxSalary) {
    if (compensation.minSalary && compensation.maxSalary) {
      parts.push(`${compensation.minSalary.toLocaleString()} - ${compensation.maxSalary.toLocaleString()}`)
    } else if (compensation.minSalary) {
      parts.push(`${compensation.minSalary.toLocaleString()}+`)
    } else if (compensation.maxSalary) {
      parts.push(`Up to ${compensation.maxSalary.toLocaleString()}`)
    }

    if (compensation.currency) {
      parts.push(compensation.currency)
    }

    if (compensation.period) {
      parts.push(`per ${compensation.period}`)
    }
  }

  if (compensation.notes) {
    parts.push(compensation.notes)
  }

  return parts.length > 0 ? parts.join(' ') : 'N/A'
}

/**
 * Generate job statistics from saved jobs
 */
export function generateJobStats(savedJobs: JobData[]): JobStats {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const companies = new Set<string>()
  let remoteCount = 0
  let thisWeekCount = 0
  const byStatus: Record<string, number> = {}
  const byCompany: Record<string, number> = {}

  savedJobs.forEach(job => {
    const aiData = job.aiData

    // Count unique companies
    if (aiData.companyName) {
      const companyKey = aiData.companyName.toLowerCase()
      companies.add(companyKey)
      byCompany[companyKey] = (byCompany[companyKey] || 0) + 1
    }

    // Count remote jobs
    if (aiData.workModel && aiData.workModel.toLowerCase() === 'remote') {
      remoteCount++
    }

    // Count jobs from this week
    if (job.savedDate && new Date(job.savedDate) > oneWeekAgo) {
      thisWeekCount++
    }

    // Count by status
    const status = job.status || 'Saved'
    byStatus[status] = (byStatus[status] || 0) + 1
  })

  return {
    total: savedJobs.length,
    companies: companies.size,
    remote: remoteCount,
    thisWeek: thisWeekCount,
    byStatus,
    byCompany
  }
}

/**
 * Remove duplicate jobs based on URL and job title
 */
export function removeDuplicateJobs(jobs: JobData[]): JobData[] {
  const seen = new Set<string>()
  const uniqueJobs: JobData[] = []

  for (const job of jobs) {
    // Create a unique key based on ID (primary) or URL + title (fallback)
    const uniqueKey = job.id || `${job.sourceURL}_${job.aiData?.jobTitle || ''}`
    
    if (!seen.has(uniqueKey)) {
      seen.add(uniqueKey)
      uniqueJobs.push(job)
    }
  }

  return uniqueJobs
}

/**
 * Create a standardized job object
 */
export function createJobObject(
  url: string, 
  content: string, 
  aiData: JobAIData, 
  userAgent?: string
): JobData {
  return {
    id: generateUniqueId(),
    savedDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    sourceURL: url,
    applyLink: url, // Default to source URL
    status: 'Saved',
    aiData,
    metadata: {
      processedAt: new Date().toISOString(),
      contentLength: content.length,
      userAgent: userAgent || 'Unknown',
      rawMarkdown: content
    }
  }
}

/**
 * Generate text content for job download
 */
export function generateJobTextContent(job: JobData): string {
  const aiData = job.aiData
  const location = aiData.location?.rawText || aiData.location?.city || 'N/A'
  const compensation = aiData.compensation ?
    `${aiData.compensation.minSalary || ''}${aiData.compensation.maxSalary ? '-' + aiData.compensation.maxSalary : ''} ${aiData.compensation.currency || ''} ${aiData.compensation.period || ''} ${aiData.compensation.notes || ''}`.trim() : 'N/A'

  return `Job Title: ${aiData.jobTitle || 'N/A'}
Company: ${aiData.companyName || 'N/A'}
Location: ${location}
Work Model: ${aiData.workModel || 'N/A'}
Job Type: ${aiData.jobType || 'N/A'}
Compensation: ${compensation}
Saved Date: ${formatDate(job.savedDate)}
Source URL: ${job.sourceURL || 'N/A'}

Core Objective:
${aiData.coreObjective || 'N/A'}

Experience Requirements:
${aiData.experienceRequirements?.rawText || 'N/A'}

Hard Skills:
${aiData.keySkillsAndTools?.hardSkills?.join(', ') || 'N/A'}

Soft Skills:
${aiData.keySkillsAndTools?.softSkills?.join(', ') || 'N/A'}

Tools & Software:
${aiData.keySkillsAndTools?.toolsAndSoftware?.join(', ') || 'N/A'}

Qualifications:
${aiData.qualifications?.map(q => `- ${q.detail} (${q.type})`).join('\n') || 'N/A'}

Company Culture:
Tone: ${aiData.companyCulture?.tone || 'N/A'}
Key Adjectives: ${aiData.companyCulture?.keyAdjectives?.join(', ') || 'N/A'}

Application Instructions:
${aiData.applicationLogistics?.instructions || 'N/A'}
Closing Date: ${aiData.applicationLogistics?.closingDate || 'N/A'}
`
}

/**
 * Validate AI response has required fields
 */
export function validateAIResponse(aiData: JobAIData): void {
  const requiredFields = ['jobTitle', 'companyName', 'location', 'workModel', 'jobType']
  
  for (const field of requiredFields) {
    if (!aiData[field as keyof JobAIData]) {
      console.warn(`Missing required field: ${field}`)
    }
  }

  // Validate location has rawText
  if (aiData.location && !aiData.location.rawText) {
    console.warn('Location missing rawText field')
  }

  // Validate skills structure
  if (aiData.keySkillsAndTools) {
    const skillCategories = ['hardSkills', 'softSkills', 'toolsAndSoftware']
    for (const category of skillCategories) {
      if (!Array.isArray(aiData.keySkillsAndTools[category as keyof typeof aiData.keySkillsAndTools])) {
        console.warn(`Skills category ${category} is not an array`)
      }
    }
  }
}
