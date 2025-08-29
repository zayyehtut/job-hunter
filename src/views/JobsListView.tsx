import React from "react"
import type { JobData } from "~/types"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Badge } from "~/components/ui/badge"
import { 
  Filter,
  Search,
  Download,
  Database,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Eye,
  Trash2
} from "lucide-react"

interface JobsListViewProps {
  isLoading: boolean
  filteredJobs: JobData[]
  jobs: JobData[]
  searchTerm: string
  statusFilter: string
  setSearchTerm: (v: string) => void
  setStatusFilter: (v: string) => void
  onExportJobs: () => void
  onSelectJob: (job: JobData) => void
  onDeleteJob: (jobId: string) => void
}

export function JobsListView({
  isLoading,
  filteredJobs,
  jobs,
  searchTerm,
  statusFilter,
  setSearchTerm,
  setStatusFilter,
  onExportJobs,
  onSelectJob,
  onDeleteJob
}: JobsListViewProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-foreground" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search jobs, companies, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Saved">Saved</SelectItem>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interview">Interview</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground">Job Listings</CardTitle>
            <Button onClick={onExportJobs} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No jobs found</h3>
              <p className="text-muted-foreground leading-snug">
                {jobs.length === 0 ? "Start by scanning some job pages!" : "Try adjusting your search or filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors" onClick={() => onSelectJob(job)}>
                            {job.aiData?.jobTitle || 'Untitled Job'}
                          </h3>
                          <Badge variant={job.status === "Saved" ? "default" : 
                                             job.status === "Applied" ? "secondary" :
                                             job.status === "Interview" ? "outline" : "destructive"}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{job.aiData?.companyName || 'Unknown Company'}</span>
                          </div>
                          {job.aiData?.location?.rawText && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.aiData.location.rawText}</span>
                            </div>
                          )}
                          {job.savedDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(job.savedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        {job.aiData?.coreObjective && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                            {job.aiData.coreObjective}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onSelectJob(job)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(job.sourceURL, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Original
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


