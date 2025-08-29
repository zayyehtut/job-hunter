import { useCallback, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import type { ExtensionSettings } from "~/types"

export function useSettings() {
  const [settings, setSettings] = useState<ExtensionSettings>({ apiKey: "", modelName: "gemini-2.5-flash", maxJobs: 100 })
  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const loadSettings = useCallback(async () => {
    const resp = await sendToBackground({ name: 'getSettings' as const, body: {} })
    if (resp?.settings) setSettings(resp.settings)
    return resp?.settings
  }, [])

  const saveSettings = useCallback(async (next: ExtensionSettings) => {
    setIsSaving(true)
    setTestResult(null)
    try {
      const response = await sendToBackground({ name: 'saveSettings' as const, body: next })
      if (response.success) {
        setSettings(next)
        setTestResult({ success: true, message: 'Settings saved successfully!' })
      } else {
        setTestResult({ success: false, message: response.error || 'Failed to save settings' })
      }
    } finally {
      setIsSaving(false)
    }
  }, [])

  const testConnection = useCallback(async (apiKey: string) => {
    setTestResult(null)
    const response = await sendToBackground({ name: 'testApi' as const, body: { apiKey } })
    if (response.success) {
      setTestResult({ success: true, message: 'API connection test successful!' })
      return true
    } else {
      setTestResult({ success: false, message: response.error || 'API connection test failed' })
      return false
    }
  }, [])

  return { settings, setSettings, isSaving, testResult, loadSettings, saveSettings, testConnection }
}


