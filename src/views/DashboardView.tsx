import React from "react"
import type { JobData, JobStats } from "~/types"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import {
  Database,
  Building,
  MapPin,
  PieChart,
  Activity,
  ChevronRight,
  Zap,
  Settings,
  Download
} from "lucide-react"

interface DashboardViewProps {
  jobStats: JobStats
  recentJobs: JobData[]
  onBrowseJobs: () => void
  onExportData: () => void
  onOpenSettings: () => void
  onSelectJob: (job: JobData) => void
  getStatusColor: (status: string) => string
}

export function DashboardView({
  jobStats,
  recentJobs,
  onBrowseJobs,
  onExportData,
  onOpenSettings,
  onSelectJob,
  getStatusColor
}: DashboardViewProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs Saved</p>
                <p className="text-3xl font-bold text-primary">{jobStats.total}</p>
              </div>
              <Database className="h-8 w-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Companies</p>
                <p className="text-3xl font-bold text-secondary">{jobStats.companies}</p>
              </div>
              <Building className="h-8 w-8 text-secondary/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remote Positions</p>
                <p className="text-3xl font-bold text-accent">{jobStats.remote}</p>
              </div>
              <MapPin className="h-8 w-8 text-accent/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-foreground" />
              Application Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(jobStats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", getStatusColor(status))} />
                    <span className="font-medium text-foreground">{status}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
              {Object.keys(jobStats.byStatus).length === 0 && (
                <p className="text-muted-foreground text-center py-4 leading-snug">
                  No jobs saved yet. Start scanning to see your funnel!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onSelectJob(job)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{job.aiData.jobTitle}</p>
                    <p className="text-sm text-muted-foreground truncate leading-snug">@{job.aiData.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === "Saved" ? "default" :
                                       job.status === "Applied" ? "secondary" :
                                       job.status === "Interview" ? "outline" : "destructive"}>
                      {job.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
              {recentJobs.length === 0 && (
                <p className="text-muted-foreground text-center py-4 leading-snug">
                  No recent activity. Start scanning jobs!
                </p>
              )}
              {recentJobs.length > 0 && (
                <Button variant="outline" className="w-full mt-4" onClick={onBrowseJobs}>
                  View All Jobs
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-foreground" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={onBrowseJobs} className="h-16">
              <Database className="h-5 w-5 mr-2" />
              Browse All Jobs
            </Button>
            <Button variant="outline" onClick={onExportData} className="h-16">
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" onClick={onOpenSettings} className="h-16">
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


