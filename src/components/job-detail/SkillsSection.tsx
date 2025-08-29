import React from "react"
import type { JobData } from "~/types"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Settings, User, Globe, Target } from "lucide-react"

interface SkillsSectionProps {
  job: JobData
}

const SkillsList = ({ skills, title, icon }: { skills: string[]; title: string; icon: React.ReactNode }) => {
  if (!skills || skills.length === 0) return null
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="font-semibold text-foreground">{title}</h4>
        <Badge variant="outline" className="text-xs">{skills.length}</Badge>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function SkillsSection({ job }: SkillsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="h-5 w-5 text-primary" />
          Required Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        {job.aiData?.keySkillsAndTools?.hardSkills && job.aiData.keySkillsAndTools.hardSkills.length > 0 ? (
          <div className="space-y-4">
            <SkillsList skills={job.aiData.keySkillsAndTools.hardSkills} title="Hard Skills & Tools" icon={<Settings className="h-4 w-4 text-primary" />} />
            <SkillsList skills={job.aiData.keySkillsAndTools.softSkills || []} title="Soft Skills" icon={<User className="h-4 w-4 text-secondary" />} />
            <SkillsList skills={job.aiData.keySkillsAndTools.toolsAndSoftware || []} title="Tools & Software" icon={<Globe className="h-4 w-4 text-accent" />} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No specific skills listed for this position.</p>
        )}
      </CardContent>
    </Card>
  )
}


