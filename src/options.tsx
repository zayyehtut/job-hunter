import React, { useState, useEffect } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import type { ExtensionSettings, JobData, JobStats } from "~/types"
import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { JobDetailModal } from "~/components/job-detail/JobDetailModal"
import { DashboardView } from "~/views/DashboardView"
import { useThemeSync } from "~/hooks/useTheme"
import { JobsListView } from "~/views/JobsListView"
import { SettingsView } from "~/views/SettingsView"
import { 
  Settings,
  Sun,
  Moon,
  ArrowLeft,
  Sparkles
} from "lucide-react"
import "~style.css"

// Types
type Job = JobData

export default function Options() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [jobs, setJobs] = useState<Job[]>([])
  const [settings, setSettings] = useState<ExtensionSettings>({
    apiKey: "",
    modelName: "gemini-2.5-flash"
  })
  const [maxJobs, setMaxJobs] = useState(100)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const { theme, setTheme } = useThemeSync()
  const [showApiKey, setShowApiKey] = useState(false)

  // Type guard function to ensure proper status typing
  const validateJobStatus = (status: string): "Saved" | "Applied" | "Rejected" | "Interview" => {
    const validStatuses = ["Saved", "Applied", "Rejected", "Interview"] as const
    return validStatuses.includes(status as any) ? status as any : "Saved"
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load jobs
      const jobsResponse = await sendToBackground({ name: 'getJobs' as const, body: {} })
      if (jobsResponse && jobsResponse.jobs) {
        // Transform jobs to ensure proper typing, especially for status field
        const typedJobs = jobsResponse.jobs.map((job: any) => ({
          ...job,
          status: validateJobStatus(job.status)
        })) as JobData[]
        ;(setJobs as any)(typedJobs)
      }

      // Load settings
      const settingsResponse = await sendToBackground({ name: 'getSettings' as const, body: {} })
      if (settingsResponse && settingsResponse.settings) {
        setSettings(settingsResponse.settings)
        setMaxJobs(settingsResponse.settings.maxJobs || 100)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme)
  }

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)
      setTestResult(null)

      const updatedSettings = {
        ...settings,
        maxJobs
      }

      const response = await sendToBackground({
        name: 'saveSettings' as const,
        body: updatedSettings
      })

      if (response.success) {
        setTestResult({
          success: true,
          message: 'Settings saved successfully!'
        })
      } else {
        setTestResult({
          success: false,
          message: response.error || 'Failed to save settings'
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setTestResult({
        success: false,
        message: 'Failed to save settings'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    try {
      setTestResult(null)
      const response = await sendToBackground({
        name: 'testApi' as const,
        body: { apiKey: settings.apiKey }
      })

      if (response.success) {
        setTestResult({
          success: true,
          message: 'API connection test successful!'
        })
      } else {
        setTestResult({
          success: false,
          message: response.error || 'API connection test failed'
        })
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setTestResult({
        success: false,
        message: 'Failed to test API connection'
      })
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await sendToBackground({
        name: 'deleteJob' as const,
        body: { jobId }
      })

      if (response.success) {
        setJobs(jobs.filter(job => job.id !== jobId))
      }
    } catch (error) {
      console.error('Error deleting job:', error)
    }
  }

  const handleExportJobs = async () => {
    try {
      // Export jobs directly from state
      const dataStr = JSON.stringify(jobs, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `job-hunter-export-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting jobs:', error)
    }
  }

  const handleDeleteAllJobs = async () => {
    if (confirm('Are you sure you want to delete all job data? This action cannot be undone.')) {
      try {
        // Delete all jobs one by one
        for (const job of jobs) {
          await sendToBackground({
            name: 'deleteJob' as const,
            body: { jobId: job.id }
          })
        }
        setJobs([])
      } catch (error) {
        console.error('Error deleting all jobs:', error)
      }
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === "" || 
      (job.aiData?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       job.aiData?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       job.aiData?.location?.rawText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       job.aiData?.coreObjective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (job.aiData?.keySkillsAndTools?.hardSkills?.join(' ') || '').toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate job statistics
  const jobStats: JobStats = {
    total: jobs.length,
    companies: new Set(jobs.map(job => job.aiData.companyName)).size,
    remote: jobs.filter(job => job.aiData.workModel === "Remote").length,
    thisWeek: jobs.filter(job => {
      const jobDate = new Date(job.savedDate)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return jobDate >= weekAgo
    }).length,
    byStatus: jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byCompany: jobs.reduce((acc, job) => {
      acc[job.aiData.companyName] = (acc[job.aiData.companyName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }

  const recentJobs = jobs
    .sort((a, b) => new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime())
    .slice(0, 5)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Saved': return 'bg-primary'
      case 'Applied': return 'bg-secondary'
      case 'Interview': return 'bg-accent'
      case 'Rejected': return 'bg-destructive'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Job Hunter AI</h1>
              <p className="text-muted-foreground">Your AI-powered job search command center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => handleThemeChange(checked ? "dark" : "light")}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab(activeTab === "dashboard" ? "settings" : "dashboard")}
            >
              {activeTab === "dashboard" ? (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </>
              )}
            </Button>
          </div>
        </div>

        {activeTab === "dashboard" ? (
          <DashboardView
            jobStats={jobStats}
            recentJobs={recentJobs}
            onBrowseJobs={() => setActiveTab("jobs")}
            onExportData={handleExportJobs}
            onOpenSettings={() => setActiveTab("settings")}
            onSelectJob={(job) => setSelectedJob(job)}
            getStatusColor={getStatusColor}
          />
        ) : activeTab === "settings" ? (
          <SettingsView
            settings={settings}
            maxJobs={maxJobs}
            isSaving={isSaving}
            testResult={testResult}
            showApiKey={showApiKey}
            setSettings={setSettings}
            setMaxJobs={setMaxJobs}
            setShowApiKey={setShowApiKey}
            onTestConnection={handleTestConnection}
            onSaveSettings={handleSaveSettings}
            onExportJobs={handleExportJobs}
            onDeleteAllJobs={handleDeleteAllJobs}
          />
        ) : (
          <JobsListView
            isLoading={isLoading}
            filteredJobs={filteredJobs as any}
            jobs={jobs as any}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            setSearchTerm={setSearchTerm}
            setStatusFilter={setStatusFilter}
            onExportJobs={handleExportJobs}
            onSelectJob={(job) => setSelectedJob(job)}
            onDeleteJob={handleDeleteJob}
          />
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal 
          key={selectedJob.id}
          job={selectedJob} 
          open={!!selectedJob}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedJob(null)
            }
          }}
          onStatusChange={async (jobId, newStatus) => {
            try {
              const response = await sendToBackground({
                name: 'updateJobStatus' as const,
                body: { jobId, status: newStatus }
              })
              
              if (response.success) {
                // Update the job in the local state
                setJobs(jobs.map(job => 
                  job.id === jobId ? { ...job, status: newStatus } : job
                ))
                // Update the selected job
                setSelectedJob({ ...selectedJob, status: newStatus })
              }
            } catch (error) {
              console.error('Error updating job status:', error)
            }
          }}
        />
      )}
    </div>
  )
}
