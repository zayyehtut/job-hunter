import React from "react"
import type { JobData } from "~/types"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { FileText } from "lucide-react"

interface RawMarkdownSectionProps {
  job: JobData
}

export function RawMarkdownSection({ job }: RawMarkdownSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Original Cleaned Markdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {job.metadata?.rawMarkdown ? (
          <pre className="block w-full max-w-full whitespace-pre-wrap break-words break-all overflow-x-hidden overflow-y-visible [overflow-wrap:anywhere] text-sm text-foreground bg-muted/50 p-3 rounded-md border border-border">
            {job.metadata.rawMarkdown}
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">No raw Markdown stored for this job.</p>
        )}
      </CardContent>
    </Card>
  )
}


