import type { PlasmoMessaging } from "@plasmohq/messaging"
import { JobProcessor } from "~/services/job-processor"

export type RequestBody = {
  jobId: string
}

export type ResponseBody = {
  success: boolean
  deleted?: boolean
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    if (!req.body?.jobId) {
      res.send({
        success: false,
        error: 'Job ID is required'
      })
      return
    }
    
    const deleted = await JobProcessor.deleteJob(req.body.jobId)
    res.send({
      success: true,
      deleted
    })
  } catch (error) {
    console.error('Delete job error:', error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

export default handler
