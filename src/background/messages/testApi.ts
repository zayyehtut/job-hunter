import type { PlasmoMessaging } from "@plasmohq/messaging"
import { JobProcessor } from "~/services/job-processor"

export type RequestBody = {
  apiKey: string
  modelName?: string
}

export type ResponseBody = {
  success: boolean
  connected?: boolean
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    if (!req.body?.apiKey) {
      res.send({
        success: false,
        error: 'API key is required'
      })
      return
    }
    
    const connected = await JobProcessor.testApiConnection(req.body.apiKey, req.body.modelName)
    res.send({
      success: true,
      connected
    })
  } catch (error) {
    console.error('Test API error:', error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

export default handler
