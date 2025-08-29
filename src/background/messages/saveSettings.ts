import type { PlasmoMessaging } from "@plasmohq/messaging"
import { StorageService } from "~/services/storage"
import type { ExtensionSettings } from "~/types"

export type RequestBody = ExtensionSettings

export type ResponseBody = {
  success: boolean
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
        error: 'Settings are required'
      })
      return
    }
    
    await StorageService.saveSettings(req.body)
    res.send({
      success: true
    })
  } catch (error) {
    console.error('Save settings error:', error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

export default handler
