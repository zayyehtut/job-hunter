/**
 * State management types for the extension
 */

export interface SelectionState {
  // Kept for backward compatibility with persisted data, but not used
  isEnabled: boolean
  selectedElement: {
    selector: string
    content: string
    tagName: string
    className: string
    id: string
  } | null
  selections?: Array<{
    selector: string
    content: string
    previewWords: number
  }>
  acceptedSelectors?: string[]
  rejectedSelectors?: string[]
  selectedContent: string | null
  selectedAt: Date | null
}

export interface UserPreferences {
  // Custom selector removed; keep fields optional for upgrade safety
  customSelectorEnabled?: boolean
  lastUsedMode?: 'custom' | 'automatic'
  onboardingCompleted: boolean
}

export interface AppState {
  selection: SelectionState
  preferences: UserPreferences
  isScanning: boolean
  lastScanResult: ScanResult | null
}

export interface ScanResult {
  success: boolean
  content?: string
  wordCount?: number
  title?: string
  error?: string
  timestamp: Date
}

export interface StateService {
  // Selection state management
  getSelectionState(): Promise<SelectionState>
  setSelectionState(state: Partial<SelectionState>): Promise<void>
  clearSelection(): Promise<void>
  
  // User preferences
  getPreferences(): Promise<UserPreferences>
  setPreferences(prefs: Partial<UserPreferences>): Promise<void>
  
  // App state
  getAppState(): Promise<AppState>
  setAppState(state: Partial<AppState>): Promise<void>
  
  // Scan results
  saveScanResult(result: ScanResult): Promise<void>
  getLastScanResult(): Promise<ScanResult | null>
}
