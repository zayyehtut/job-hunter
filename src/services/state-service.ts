import type { SelectionState, UserPreferences, AppState, ScanResult, StateService } from '~/types/state'

/**
 * State management service for the extension
 * Handles persistence and retrieval of all application state
 */
export class ExtensionStateService implements StateService {
  private static instance: ExtensionStateService
  private cache: Map<string, any> = new Map()

  private constructor() {}

  static getInstance(): ExtensionStateService {
    if (!ExtensionStateService.instance) {
      ExtensionStateService.instance = new ExtensionStateService()
    }
    return ExtensionStateService.instance
  }

  // Selection state management
  async getSelectionState(): Promise<SelectionState> {
    const cached = this.cache.get('selectionState')
    if (cached) return cached

    const result = await chrome.storage.local.get('selectionState')
    const defaultState: SelectionState = {
      isEnabled: false,
      selectedElement: null,
      selectedContent: null,
      selectedAt: null
    }
    
    const state = result.selectionState || defaultState
    this.cache.set('selectionState', state)
    return state
  }

  async setSelectionState(state: Partial<SelectionState>): Promise<void> {
    const currentState = await this.getSelectionState()
    const newState = { ...currentState, ...state }
    
    await chrome.storage.local.set({ selectionState: newState })
    this.cache.set('selectionState', newState)
  }

  async clearSelection(): Promise<void> {
    const defaultState: SelectionState = {
      isEnabled: false,
      selectedElement: null,
      selectedContent: null,
      selectedAt: null
    }
    
    await this.setSelectionState(defaultState)
  }

  // User preferences
  async getPreferences(): Promise<UserPreferences> {
    const cached = this.cache.get('preferences')
    if (cached) return cached

    const result = await chrome.storage.local.get('preferences')
    const defaultPreferences: UserPreferences = {
      onboardingCompleted: false
    }
    
    const prefs = result.preferences || defaultPreferences
    this.cache.set('preferences', prefs)
    return prefs
  }

  async setPreferences(prefs: Partial<UserPreferences>): Promise<void> {
    const currentPrefs = await this.getPreferences()
    // ignore any selector-related fields
    const { customSelectorEnabled, lastUsedMode, ...rest } = prefs as any
    const newPrefs = { ...currentPrefs, ...rest }
    
    await chrome.storage.local.set({ preferences: newPrefs })
    this.cache.set('preferences', newPrefs)
  }

  // App state
  async getAppState(): Promise<AppState> {
    const cached = this.cache.get('appState')
    if (cached) return cached

    const [selectionState, preferences, lastScanResult] = await Promise.all([
      this.getSelectionState(),
      this.getPreferences(),
      this.getLastScanResult()
    ])

    const defaultAppState: AppState = {
      selection: selectionState,
      preferences,
      isScanning: false,
      lastScanResult
    }
    
    this.cache.set('appState', defaultAppState)
    return defaultAppState
  }

  async setAppState(state: Partial<AppState>): Promise<void> {
    const currentState = await this.getAppState()
    const newState = { ...currentState, ...state }
    
    await chrome.storage.local.set({ appState: newState })
    this.cache.set('appState', newState)
  }

  // Scan results
  async saveScanResult(result: ScanResult): Promise<void> {
    const scanResult = {
      ...result,
      timestamp: new Date()
    }
    
    await chrome.storage.local.set({ lastScanResult: scanResult })
    this.cache.set('lastScanResult', scanResult)
  }

  async getLastScanResult(): Promise<ScanResult | null> {
    const cached = this.cache.get('lastScanResult')
    if (cached) return cached

    const result = await chrome.storage.local.get('lastScanResult')
    const scanResult = result.lastScanResult || null
    
    if (scanResult) {
      this.cache.set('lastScanResult', scanResult)
    }
    
    return scanResult
  }

  // Utility methods
  async clearCache(): Promise<void> {
    this.cache.clear()
  }

  async resetAllState(): Promise<void> {
    await chrome.storage.local.clear()
    this.cache.clear()
  }
}

// Export singleton instance
export const stateService = ExtensionStateService.getInstance()
