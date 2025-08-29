import type { PlasmoMessaging } from "@plasmohq/messaging"
import { JobProcessor } from "~/services/job-processor"

export type RequestBody = {
  url: string
  content: string
}

export type ResponseBody = {
  success: boolean
  jobId?: string
  jobTitle?: string
  companyName?: string
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    if (!req.body) {
      res.send({
        success: false,
        error: 'Request body is required'
      })
      return
    }
    
    const result = await JobProcessor.processJob(req.body)
    res.send(result)
  } catch (error) {
    console.error('Job processing error:', error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

export default handler
