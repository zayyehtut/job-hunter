import React, { useState, useEffect } from "react"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import "~style.css"
import {
  Settings,
  Zap,
  Database,
  CheckCircle,
  AlertCircle,
  Bot,
  Loader2,
  ArrowRight
} from "lucide-react"
import { sendToBackground } from "@plasmohq/messaging"
import type { RequestBody, ResponseBody } from "~background/messages/getSettings"
import { stateService } from "~/services"
import { useThemeSync } from "~/hooks/useTheme"
import type { UserPreferences, ScanResult } from "~/types/state"

export default function Popup() {
  const [isScanning, setIsScanning] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [jobCount, setJobCount] = useState(0)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; jobTitle?: string } | null>(null)
  // Custom selector removed
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null)
  useThemeSync()

  useEffect(() => {
    loadConfiguration()
    loadUserPreferences()
    
    const handleStorageChange = () => {
      loadConfiguration()
      loadUserPreferences()
    }
    chrome.storage.onChanged.addListener(handleStorageChange)
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  

  const loadUserPreferences = async () => {
    try {
      const preferences = await stateService.getPreferences()
      
      // Load last scan result for better UX
      const lastResult = await stateService.getLastScanResult()
      setLastScanResult(lastResult)
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }
  }

  const loadConfiguration = async () => {
    try {
      setIsLoadingConfig(true)
      const response = await sendToBackground<RequestBody, ResponseBody>({
        name: 'getSettings' as const,
        body: {}
      })

      if (response.success && response.settings) {
        const hasApiKey = response.settings.apiKey && response.settings.apiKey.trim().length > 0
        setIsConfigured(!!hasApiKey)

        // Get job count
        const jobsResponse = await sendToBackground({
          name: 'getJobs' as const,
          body: {}
        })

        if (jobsResponse.success) {
          setJobCount(jobsResponse.jobs.length)
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error)
      setIsConfigured(false)
    } finally {
      setIsLoadingConfig(false)
    }
  }

  // Custom selector toggle removed

  const handleScanClick = async () => {
    if (!isConfigured) {
      openDashboard()
      return
    }

    setIsScanning(true)
    setScanResult(null)

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab || !tab.id) {
        throw new Error('No active tab found.')
      }

      let response
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' })
      } catch (messageError) {
        // Fallback: inject content script if not already injected
        const manifest = chrome.runtime.getManifest()
        const contentScripts = manifest.content_scripts?.[0]?.js || []
        const contentScriptFile = contentScripts[0]

        if (contentScriptFile) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [contentScriptFile]
          })
          await new Promise(resolve => setTimeout(resolve, 200)) // Wait for script to load
          response = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' })
        } else {
          throw new Error('Content script not found')
        }
      }

      if (response && response.success) {
        setScanResult({
          success: true,
          message: 'Job data has been saved successfully!',
          jobTitle: response.jobTitle
        })

        // Refresh job count
        const jobsResponse = await sendToBackground({
          name: 'getJobs' as const,
          body: {}
        })

        if (jobsResponse.success) {
          setJobCount(jobsResponse.jobs.length)
        }
      } else {
        setScanResult({
          success: false,
          message: response?.error || 'Failed to scan job page'
        })
      }
    } catch (error) {
      console.error('Scan error:', error)
      setScanResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsScanning(false)
    }
  }

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') })
  }

  const resetScanResult = () => {
    setScanResult(null)
  }

  return (
    <div className="w-80 h-80 bg-background text-foreground">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">Job Hunter AI</h1>
              <div className="w-8 h-0.5 bg-primary mx-auto mt-1 rounded-full" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          {isLoadingConfig ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground leading-snug">Loading...</p>
            </div>
          ) : !isConfigured ? (
            // State 1: Setup Required
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground leading-snug">
                  Connect your Gemini API key to
                </p>
                <p className="text-sm text-muted-foreground leading-snug">
                  unlock AI-powered scanning.
                </p>
              </div>
              
              <Button 
                onClick={openDashboard}
                className="w-full"
                size="lg"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure API Key
              </Button>
            </div>
          ) : isScanning ? (
            // State 3: Scanning In Progress
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground leading-snug">
                  Analyzing page content using AI...
                </p>
                <p className="text-sm text-muted-foreground leading-snug">
                  This will only take a moment.
                </p>
              </div>
              
              <Button disabled className="w-full" size="lg">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning... Please Wait
              </Button>
            </div>
          ) : scanResult ? (
            // State 4: Scan Result
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <Alert className={cn(
                scanResult.success ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"
              )}>
                {scanResult.success ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertDescription className={cn(
                  scanResult.success ? "text-primary" : "text-destructive"
                )}>
                  {scanResult.message}
                  {scanResult.success && scanResult.jobTitle && (
                    <div className="mt-1 text-xs leading-snug">
                      Found: "{scanResult.jobTitle}"
                    </div>
                  )}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={resetScanResult}
                className="w-full"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Scan Another Page
              </Button>
            </div>
          ) : (
            // State 2: Ready to Scan
            <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground leading-snug">
                  Navigate to a job page and let the
                </p>
                <p className="text-sm text-muted-foreground leading-snug">
                  AI do the rest for you.
                </p>
              </div>
              
              {/* Custom Selector Toggle removed */}
              
              <Button 
                onClick={handleScanClick}
                className="w-full"
                size="lg"
              >
                <Zap className="h-4 w-4 mr-2" />
                Scan This Job Page
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground leading-snug">
              {jobCount} Jobs Saved
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={openDashboard}
            className="h-7 px-2"
          >
            Dashboard
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
