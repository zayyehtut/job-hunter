import { Storage } from "@plasmohq/storage"
import type { JobData, ExtensionSettings } from "~/types"
import { CONFIG } from "~/config/constants"
import { removeDuplicateJobs } from "~/utils"

/**
 * Storage service for Job Hunter AI extension
 */
export class StorageService {
  private static storage = new Storage({ area: "local" })

  // Job storage methods
  static async getSavedJobs(): Promise<JobData[]> {
    try {
      const jobs = await this.storage.get<JobData[]>("savedJobs")
      return jobs || []
    } catch (error) {
      console.error('Error getting saved jobs:', error)
      return []
    }
  }

  static async saveJob(jobData: JobData): Promise<void> {
    try {
      const savedJobs = await this.getSavedJobs()

      // Check for duplicates based on URL and job title
      const isDuplicate = savedJobs.some(existingJob => {
        return existingJob.sourceURL === jobData.sourceURL &&
          existingJob.aiData?.jobTitle === jobData.aiData?.jobTitle
      })

      if (isDuplicate) {
        console.log('Duplicate job detected, not saving:', jobData.sourceURL)
        throw new Error('This job has already been saved')
      }

      // Add new job to the beginning of the array
      savedJobs.unshift(jobData)

      // Keep only the last MAX_SAVED_JOBS to prevent storage bloat
      if (savedJobs.length > CONFIG.MAX_SAVED_JOBS) {
        savedJobs.splice(CONFIG.MAX_SAVED_JOBS)
      }

      // Save back to storage
      await this.storage.set("savedJobs", savedJobs)
      console.log('Job saved successfully:', jobData.id)
    } catch (error) {
      console.error('Error saving job:', error)
      throw error
    }
  }

  static async deleteJob(jobId: string): Promise<boolean> {
    try {
      const savedJobs = await this.getSavedJobs()
      const initialLength = savedJobs.length
      const filteredJobs = savedJobs.filter(job => job.id !== jobId)

      if (filteredJobs.length === initialLength) {
        return false // Job not found
      }

      await this.storage.set("savedJobs", filteredJobs)
      console.log('Job deleted successfully:', jobId)
      return true
    } catch (error) {
      console.error('Error deleting job:', error)
      throw new Error('Failed to delete job from storage')
    }
  }

  static async updateJobStatus(jobId: string, status: JobData["status"]): Promise<boolean> {
    try {
      const savedJobs = await this.getSavedJobs()
      const jobIndex = savedJobs.findIndex(job => job.id === jobId)
      
      if (jobIndex === -1) {
        return false // Job not found
      }

      savedJobs[jobIndex].status = status
      savedJobs[jobIndex].updatedDate = new Date().toISOString()

      await this.storage.set("savedJobs", savedJobs)
      console.log('Job status updated successfully:', jobId, status)
      return true
    } catch (error) {
      console.error('Error updating job status:', error)
      throw new Error('Failed to update job status')
    }
  }

  static async cleanupDuplicates(): Promise<{ removed: number; remaining: number }> {
    try {
      const savedJobs = await this.getSavedJobs()
      const initialCount = savedJobs.length

      // Remove duplicates
      const uniqueJobs = removeDuplicateJobs(savedJobs)

      // Save cleaned jobs back to storage
      await this.storage.set("savedJobs", uniqueJobs)

      const removedCount = initialCount - uniqueJobs.length
      console.log(`Cleaned up ${removedCount} duplicate jobs`)

      return {
        removed: removedCount,
        remaining: uniqueJobs.length
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error)
      throw new Error('Failed to cleanup duplicate jobs')
    }
  }

  // Settings storage methods
  static async getSettings(): Promise<ExtensionSettings> {
    try {
      const apiKey = await this.storage.get<string>("apiKey") || ""
      const modelName = await this.storage.get<string>("modelName") || CONFIG.DEFAULT_MODEL_NAME
      const maxJobs = await this.storage.get<number>("maxJobs") || 100
      
      return { apiKey, modelName, maxJobs }
    } catch (error) {
      console.error('Error getting settings:', error)
      return { apiKey: "", modelName: CONFIG.DEFAULT_MODEL_NAME, maxJobs: 100 }
    }
  }

  static async saveSettings(settings: ExtensionSettings): Promise<void> {
    try {
      await this.storage.set("apiKey", settings.apiKey)
      await this.storage.set("modelName", settings.modelName)
      if (settings.maxJobs !== undefined) {
        await this.storage.set("maxJobs", settings.maxJobs)
      }
      console.log('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      throw new Error('Failed to save settings')
    }
  }

  // Statistics methods
  static async getStorageStats(): Promise<{ totalJobs: number; storageUsed: number }> {
    try {
      const savedJobs = await this.getSavedJobs()

      // Estimate storage usage (rough calculation)
      const storageUsed = JSON.stringify(savedJobs).length

      return {
        totalJobs: savedJobs.length,
        storageUsed: storageUsed
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      throw new Error('Failed to get storage statistics')
    }
  }

  // Watch for storage changes
  static watchJobs(callback: (jobs: JobData[]) => void): void {
    this.storage.watch({
      "savedJobs": (change) => {
        if (change.newValue) {
          callback(change.newValue as JobData[])
        }
      }
    })
  }

  static watchSettings(callback: (settings: ExtensionSettings) => void): void {
    this.storage.watch({
      "apiKey": async () => {
        const settings = await this.getSettings()
        callback(settings)
      },
      "modelName": async () => {
        const settings = await this.getSettings()
        callback(settings)
      }
    })
  }
}
