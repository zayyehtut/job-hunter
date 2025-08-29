import React, { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ScrollArea } from "~/components/ui/scroll-area"
import { 
  MapPin,
  DollarSign,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  X,
  User,
  Building2,
  GraduationCap
} from "lucide-react"
import type { JobData } from "~/types"
import { Separator } from "~/components/ui/separator"
import { SummarySection } from "~/components/job-detail/SummarySection"
import { SkillsSection } from "~/components/job-detail/SkillsSection"
import { QualificationsSection } from "~/components/job-detail/QualificationsSection"
import { ApplicationSection } from "~/components/job-detail/ApplicationSection"
import { SourceInfoSection } from "~/components/job-detail/SourceInfoSection"
import { RawMarkdownSection } from "~/components/job-detail/RawMarkdownSection"

interface JobDetailModalProps {
  job: JobData
  children?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (jobId: string, newStatus: JobData['status']) => void
}

export function JobDetailModal({ job, children, open, onOpenChange, onStatusChange }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState("summary")

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false)
    }
  }

  const formatSalary = (compensation?: JobData['aiData']['compensation']) => {
    if (!compensation) return "Not specified"
    const { minSalary, maxSalary, currency, period } = compensation
    if (minSalary && maxSalary) {
      return `${currency} ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()} ${period}`
    } else if (minSalary) {
      return `${currency} ${minSalary.toLocaleString()} ${period}`
    }
    return "Not specified"
  }

  const handleStatusChange = (newStatus: JobData['status']) => {
    if (onStatusChange) {
      onStatusChange(job.id, newStatus)
    }
  }

  const handleApplyClick = () => {
    window.open(job.applyLink || job.sourceURL, '_blank')
  }

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-detail-title"
      aria-describedby="job-detail-description"
    >
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] p-4">
        <Card className="h-[95vh] flex flex-col shadow-2xl border-border">
          <CardHeader className="flex-shrink-0 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <CardTitle id="job-detail-title" className="text-xl font-semibold text-foreground">
                  {job.aiData?.jobTitle || 'Untitled Job'}
                </CardTitle>
                <p id="job-detail-description" className="text-sm text-muted-foreground">
                  Detailed information about {job.aiData?.jobTitle || 'this job'} position at {job.aiData?.companyName || 'this company'}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{job.aiData?.companyName || 'Unknown Company'}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <MapPin className="h-4 w-4" />
                  <span>{job.aiData?.location?.rawText || 'Location not specified'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 p-0"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <div className="flex items-center gap-4 p-4 bg-muted/50 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date(job.savedDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatSalary(job.aiData?.compensation)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {job.sourceURL ? (
                  <a 
                    href={job.sourceURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View Original
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  "No URL available"
                )}
              </span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0 border-b border-border rounded-none">
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                AI Summary
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Skills & Qualifications
              </TabsTrigger>
              <TabsTrigger value="application" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Application & Source
              </TabsTrigger>
              <TabsTrigger value="raw" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Raw Markdown
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <TabsContent value="summary" className="space-y-4">
                    <SummarySection job={job} />
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4">
                    <SkillsSection job={job} />
                    <QualificationsSection job={job} />
                  </TabsContent>

                  <TabsContent value="application" className="space-y-4">
                    <ApplicationSection job={job} />
                    <SourceInfoSection job={job} />
                  </TabsContent>

                  <TabsContent value="raw" className="space-y-4 overflow-x-hidden">
                    <RawMarkdownSection job={job} />
                  </TabsContent>
                </div>
              </ScrollArea>
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}


