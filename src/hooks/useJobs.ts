import { useCallback, useMemo, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import type { JobData } from "~/types"

export function useJobs() {
  const [jobs, setJobs] = useState<JobData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loadJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const resp = await sendToBackground({ name: 'getJobs' as const, body: {} })
      if (resp && resp.jobs) {
        setJobs(resp.jobs)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteJob = useCallback(async (jobId: string) => {
    const resp = await sendToBackground({ name: 'deleteJob' as const, body: { jobId } })
    if (resp?.success) {
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
    }
  }, [])

  const exportJobs = useCallback((sourceJobs?: JobData[]) => {
    const dataStr = JSON.stringify(sourceJobs ?? jobs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `job-hunter-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }, [jobs])

  const getFilteredJobs = useCallback((searchTerm: string, statusFilter: string) => {
    return jobs.filter(job => {
      const matchesSearch = searchTerm === "" ||
        (job.aiData?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         job.aiData?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         job.aiData?.location?.rawText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         job.aiData?.coreObjective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (job.aiData?.keySkillsAndTools?.hardSkills?.join(' ') || '').toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === "all" || job.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [jobs])

  const jobStats = useMemo(() => {
    const companies = new Set(jobs.map(job => job.aiData.companyName))
    const remote = jobs.filter(job => job.aiData.workModel === "Remote").length
    const thisWeek = jobs.filter(job => {
      const jobDate = new Date(job.savedDate)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return jobDate >= weekAgo
    }).length
    const byStatus = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const byCompany = jobs.reduce((acc, job) => {
      acc[job.aiData.companyName] = (acc[job.aiData.companyName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total: jobs.length, companies: companies.size, remote, thisWeek, byStatus, byCompany }
  }, [jobs])

  return { jobs, setJobs, isLoading, loadJobs, deleteJob, exportJobs, getFilteredJobs, jobStats }
}


