import type { PlasmoMessaging } from "@plasmohq/messaging"
import { StorageService } from "~/services/storage"
import type { ExtensionSettings } from "~/types"

export type RequestBody = {}

export type ResponseBody = {
  success: boolean
  settings?: ExtensionSettings
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  try {
    const settings = await StorageService.getSettings()
    res.send({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Get settings error:', error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    })
  }
}

export default handler
