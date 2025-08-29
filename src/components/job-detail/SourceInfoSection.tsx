import React from "react"
import type { JobData } from "~/types"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Globe, ExternalLink } from "lucide-react"

interface SourceInfoSectionProps {
  job: JobData
}

export function SourceInfoSection({ job }: SourceInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Source Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Content Length</label>
            <div className="mt-1 text-sm text-foreground font-mono">
              {job.metadata?.contentLength || 0} characters
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Processed At</label>
            <div className="mt-1 text-sm text-foreground">
              {job.metadata?.processedAt ? new Date(job.metadata.processedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>

        {job.sourceURL && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">Original Job Posting</label>
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(job.sourceURL, '_blank')}
                className="w-full justify-start"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Original Source
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


