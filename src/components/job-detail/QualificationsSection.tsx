import React from "react"
import type { JobData } from "~/types"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { CheckCircle, Star, GraduationCap } from "lucide-react"

interface QualificationsSectionProps {
  job: JobData
}

export function QualificationsSection({ job }: QualificationsSectionProps) {
  const qualifications = job.aiData?.qualifications || []
  const mustHave = qualifications.filter((q: any) => q.type === 'Must-have')
  const preferred = qualifications.filter((q: any) => q.type === 'Preferred')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5 text-primary" />
          Qualifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {qualifications.length > 0 ? (
          <div className="space-y-6">
            {mustHave.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-destructive" />
                  <h4 className="font-semibold text-foreground">Must-Have Qualifications</h4>
                  <Badge variant="destructive" className="text-xs">{mustHave.length}</Badge>
                </div>
                <div className="space-y-2">
                  {mustHave.map((qual: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-destructive rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground leading-snug">{qual.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preferred.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-foreground">Preferred Qualifications</h4>
                  <Badge variant="outline" className="text-xs">{preferred.length}</Badge>
                </div>
                <div className="space-y-2">
                  {preferred.map((qual: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground leading-snug">{qual.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No qualifications specified.</p>
        )}
      </CardContent>
    </Card>
  )
}


