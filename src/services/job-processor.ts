import { GeminiAPIClient } from "./gemini-api"
import { StorageService } from "./storage"
import type { JobData, JobAIData } from "~/types"
import { createJobObject } from "~/utils"

/**
 * Job processing orchestrator
 */
export class JobProcessor {
  /**
   * Process a job posting with AI analysis
   */
  static async processJob(jobData: { content: string; url: string }): Promise<{
    success: boolean
    jobId?: string
    jobTitle?: string
    companyName?: string
    error?: string
  }> {
    try {
      // Validate input
      if (!jobData || !jobData.content || !jobData.url) {
        throw new Error('Invalid job data: content and URL are required')
      }

      // Get API settings
      const settings = await StorageService.getSettings()
      
      if (!settings.apiKey) {
        throw new Error('API Key not set. Please configure it in the dashboard settings.')
      }

      // Process with AI
      console.log('Processing job with AI:', jobData.url)
      const aiData: JobAIData = await GeminiAPIClient.processJobData(
        jobData, 
        settings.apiKey, 
        settings.modelName
      )

      // Create job object
      const processedJob = createJobObject(jobData.url, jobData.content, aiData)

      // Save to storage
      await StorageService.saveJob(processedJob)

      console.log('Job processed and saved successfully:', processedJob.id)
      
      return { 
        success: true, 
        jobId: processedJob.id,
        jobTitle: aiData.jobTitle,
        companyName: aiData.companyName
      }

    } catch (error) {
      console.error('Job processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get processing statistics
   */
  static async getProcessingStats(): Promise<{
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    byStatus: Record<string, number>
    byCompany: Record<string, number>
  }> {
    try {
      const savedJobs = await StorageService.getSavedJobs()
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      const stats = {
        total: savedJobs.length,
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byStatus: {} as Record<string, number>,
        byCompany: {} as Record<string, number>
      }

      savedJobs.forEach(job => {
        const savedDate = new Date(job.savedDate)
        
        // Count by time period
        if (savedDate >= today) stats.today++
        if (savedDate >= thisWeek) stats.thisWeek++
        if (savedDate >= thisMonth) stats.thisMonth++
        
        // Count by status
        const status = job.status || 'Saved'
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
        
        // Count by company
        const company = job.aiData?.companyName || 'Unknown'
        stats.byCompany[company] = (stats.byCompany[company] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error getting processing stats:', error)
      throw error
    }
  }

  /**
   * Test API connection
   */
  static async testApiConnection(apiKey: string, modelName?: string): Promise<boolean> {
    try {
      return await GeminiAPIClient.testConnection(apiKey, modelName)
    } catch (error) {
      console.error('API connection test error:', error)
      return false
    }
  }

  /**
   * Get all saved jobs
   */
  static async getSavedJobs(): Promise<JobData[]> {
    try {
      return await StorageService.getSavedJobs()
    } catch (error) {
      console.error('Error getting saved jobs:', error)
      return []
    }
  }

  /**
   * Delete a job
   */
  static async deleteJob(jobId: string): Promise<boolean> {
    try {
      return await StorageService.deleteJob(jobId)
    } catch (error) {
      console.error('Error deleting job:', error)
      throw error
    }
  }

  /**
   * Update job status
   */
  static async updateJobStatus(jobId: string, status: JobData["status"]): Promise<boolean> {
    try {
      return await StorageService.updateJobStatus(jobId, status)
    } catch (error) {
      console.error('Error updating job status:', error)
      throw error
    }
  }

  /**
   * Clean up duplicate jobs
   */
  static async cleanupDuplicates(): Promise<{ removed: number; remaining: number }> {
    try {
      return await StorageService.cleanupDuplicates()
    } catch (error) {
      console.error('Error cleaning up duplicates:', error)
      throw error
    }
  }
}
