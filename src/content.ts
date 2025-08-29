import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import type { RequestBody, ResponseBody } from "~background/messages/processJob"
import { ContentExtractor, stateService } from "~/services"

// Content script configuration
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

// Main scanning function
async function scanCurrentPage(): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current URL
    const currentURL = window.location.href
    console.log('🌐 Content Script: Starting scan for URL:', currentURL)
    
    // Preferences/selection are no longer used; keep minimal state for scan result persistence
    await stateService.getPreferences()
    
    // Extract and clean HTML content
    // Extract and clean HTML content (automatic only)
    let extractedData = await ContentExtractor.extractJobContent()
    
    if (!extractedData.content || extractedData.content.trim().length < 100) {
      throw new Error('Not enough content found on this page')
    }
    
    console.log('📊 Content Script: Extraction completed. Words:', extractedData.wordCount, 'Title:', extractedData.title)
    
    // Send to background service worker for AI processing
    console.log('🚀 Content Script: Sending content to AI service...')
    const response = await sendToBackground<RequestBody, ResponseBody>({
      name: 'processJob',
      body: {
        url: currentURL,
        content: extractedData.content
      }
    })
    
    if (!response || !response.success) {
      throw new Error(response?.error || 'Failed to process job data')
    }
    
    // Save scan result to state
    await stateService.saveScanResult({
      success: true,
      content: extractedData.content,
      wordCount: extractedData.wordCount,
      title: extractedData.title,
      timestamp: new Date()
    })
    
    console.log('✅ Content Script: AI processing completed successfully!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ Content Script: scanCurrentPage error:', error)
    
    // Save error result to state
    await stateService.saveScanResult({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date()
    })
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Only handle messages in the top frame to avoid duplicate scans from iframes
  if (window !== window.top) {
    return false
  }
  console.log('📨 Content Script: Received message:', request)
  
  if (request.action === 'scanPage') {
    // Handle the scan request asynchronously
    ;(async () => {
      try {
        console.log('🚀 Content Script: Starting page scan with DOMPurify...')
        
        // Add a small delay to ensure the page is fully loaded
        setTimeout(async () => {
          try {
            const result = await scanCurrentPage()
            console.log('🎉 Content Script: Scan completed:', result)
            sendResponse(result)
          } catch (error) {
            console.error('❌ Content Script: Scan error:', error)
            sendResponse({ 
              success: false, 
              error: error instanceof Error ? error.message : 'Unknown error occurred'
            })
          }
        }, 100)
        
      } catch (error) {
        console.error('❌ Content Script: Error in message handler:', error)
        sendResponse({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })
      }
    })()
    
    // Return true to indicate we'll send response asynchronously
    return true
  }
  
  // Handle other message types
  return false
})

console.log('🎯 Content Script: Job Scanner loaded with Custom Selector + DOMPurify on:', window.location.href)
console.log('🎯 Content Script: Job Scanner loaded with DOMPurify on:', window.location.href)
