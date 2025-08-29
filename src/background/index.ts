export {}

console.log('Job Hunter AI background service worker loaded')

// Service worker lifecycle events
self.addEventListener('install', (event) => {
  console.log('Service worker installing...')
  // Type assertion for service worker context
  ;(self as any).skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service worker activating...')
  // Type assertion for service worker context
  ;(event as any).waitUntil((self as any).clients.claim())
})

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup detected')
})

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason)

  if (details.reason === 'install') {
    console.log('First time installation - setting up defaults')
  } else if (details.reason === 'update') {
    console.log('Extension updated from version:', details.previousVersion)
  }
})

// Error handling for unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection in service worker:', event.reason)
})
