import type { PlasmoMessaging } from "@plasmohq/messaging"
import { JobProcessor } from "~/services/job-processor"
import type { JobData } from "~/types"

export type RequestBody = {
  jobId: string
  status: JobData["status"]
}

export type ResponseBody = {
  success: boolean
  updated?: boolean
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    if (!req.body?.jobId || !req.body?.status) {
      res.send({
        success: false,
        error: 'Job ID and status are required'
      })
      return
    }
    
    const updated = await JobProcessor.updateJobStatus(req.body.jobId, req.body.status)
    res.send({
      success: true,
      updated
    })
  } catch (error) {
    console.error('Update job status error:', error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

export default handler
