import React from "react"
import type { JobData } from "~/types"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Calendar } from "lucide-react"

interface ApplicationSectionProps {
  job: JobData
}

export function ApplicationSection({ job }: ApplicationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Application Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Application Status</label>
            <div className="mt-1">
              <Badge 
                variant={job.status === 'Applied' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {job.status}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Saved Date</label>
            <div className="mt-1 text-sm text-foreground">
              {new Date(job.savedDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {job.aiData?.applicationLogistics && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Application Instructions</label>
            <div className="mt-1 text-sm text-foreground bg-muted/50 p-3 rounded-md">
              {job.aiData.applicationLogistics.instructions || "No specific instructions provided."}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


