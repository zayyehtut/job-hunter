import type { PlasmoMessaging } from "@plasmohq/messaging"
import { JobProcessor } from "~/services/job-processor"
import type { JobData } from "~/types"

export type RequestBody = {}

export type ResponseBody = {
  success: boolean
  jobs?: JobData[]
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    const jobs = await JobProcessor.getSavedJobs()
    res.send({
      success: true,
      jobs
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

export default handler
