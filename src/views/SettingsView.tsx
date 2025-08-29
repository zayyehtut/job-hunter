import React from "react"
import type { ExtensionSettings } from "~/types"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { 
  Sparkles,
  Save,
  TestTube,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2
} from "lucide-react"
import { cn } from "~/lib/utils"

interface SettingsViewProps {
  settings: ExtensionSettings
  maxJobs: number
  isSaving: boolean
  testResult: { success: boolean; message: string } | null
  showApiKey: boolean
  setSettings: (s: ExtensionSettings) => void
  setMaxJobs: (n: number) => void
  setShowApiKey: (b: boolean) => void
  onTestConnection: () => void
  onSaveSettings: () => void
  onExportJobs: () => void
  onDeleteAllJobs: () => void
}

export function SettingsView({
  settings,
  maxJobs,
  isSaving,
  testResult,
  showApiKey,
  setSettings,
  setMaxJobs,
  setShowApiKey,
  onTestConnection,
  onSaveSettings,
  onExportJobs,
  onDeleteAllJobs
}: SettingsViewProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground leading-snug">Configure your AI assistant and manage your data</p>
      </div>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-foreground" />
            AI Configuration
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Configure your Gemini AI API settings for job extraction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Gemini API Key</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="Enter your Gemini API key"
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <span className="text-xs text-muted-foreground">Hide</span> : <span className="text-xs text-muted-foreground">Show</span>}
                </Button>
              </div>
              <Button onClick={onTestConnection} variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">
              Get your API key from the Google AI Studio dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">AI Model</label>
            <Select value={settings.modelName} onValueChange={(value) => setSettings({ ...settings, modelName: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Maximum Jobs to Store</label>
            <Input
              type="number"
              min="1"
              max="1000"
              value={maxJobs}
              onChange={(e) => setMaxJobs(parseInt(e.target.value) || 100)}
            />
          </div>

          <Separator className="bg-border" />

          <div className="flex justify-end">
            <Button onClick={onSaveSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {testResult && (
            <Alert className={cn(
              testResult.success ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"
            )}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive" />
              )}
              <AlertDescription className={cn(
                testResult.success ? "text-primary" : "text-destructive"
              )}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Irreversible actions that will permanently affect your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={onExportJobs} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export All Data (.json)
            </Button>
            <Button variant="destructive" onClick={onDeleteAllJobs} className="flex-1">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All Job Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


