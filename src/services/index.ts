/**
 * Services index - exports all service instances
 */

// State management
export { stateService } from './state-service'
export type { UserPreferences, AppState, ScanResult, StateService } from '~/types/state'

// Selection management removed

// Content extraction (existing)
export { ContentExtractor } from './content-extractor'
