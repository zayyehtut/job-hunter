import React from "react"
import type { JobData } from "~/types"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Target } from "lucide-react"

interface SummarySectionProps {
  job: JobData
}

export function SummarySection({ job }: SummarySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Core Objective
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed">
            {job.aiData?.coreObjective || "No AI summary available for this job."}
          </p>
        </div>

        {job.aiData?.experienceRequirements && (
          <div>
            <h4 className="font-medium text-foreground mb-2">Experience Requirements</h4>
            <p className="text-sm text-foreground">
              {job.aiData.experienceRequirements.rawText || "Experience requirements not specified."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


