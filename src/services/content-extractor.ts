import DOMPurify from 'dompurify'
import TurndownService from 'turndown'
import { gfm, tables, strikethrough } from 'turndown-plugin-gfm'

/**
 * Content extraction service that provides clean, sanitized content
 * for AI processing using DOMPurify for security
 */
export class ContentExtractor {
  // Selected-element path removed (custom selector feature postponed)

  /**
   * Extract clean, sanitized content from the current page using fallback method
   * This is the backup method when custom selector is not used
   */
  static async extractJobContent(): Promise<{
    content: string
    title: string
    wordCount: number
  }> {
    console.log('🚀 ContentExtractor: Starting content extraction')
    
    try {
      // 1) Clone and prune the body (do not mutate live DOM)
      const prunedHtml = this.getPrunedBodyHtml()

      // 2) Sanitize with allowlist (structure preserved, unsafe removed)
      const sanitizedHtml = this.sanitizeHtmlAllowlist(prunedHtml)

      // 3) Convert to Markdown
      const markdown = this.convertHtmlToMarkdown(sanitizedHtml)

      // 4) Validate length on Markdown
      const MIN_CHARS = 100
      if (!markdown || markdown.trim().length < MIN_CHARS) {
        throw new Error('Insufficient content found on this page')
      }

      console.log('📊 ContentExtractor: Extraction OK. Words:', markdown.split(/\s+/).length, 'Title:', document.title)

      return {
        content: markdown,
        title: document.title || 'Job Posting',
        wordCount: markdown.split(/\s+/).length
      }
      
    } catch (error) {
      console.error('❌ ContentExtractor: Content extraction failed:', error)
      throw error
    }
  }

  // Clone and prune the body to reduce chrome/noise without mutating live DOM
  private static getPrunedBodyHtml(): string {
    const clone = document.body.cloneNode(true) as HTMLElement
    const pruneSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.ad', '.ads', '.advertisement', '.sidebar', '.navigation',
      '.menu', '.breadcrumb', '.pagination', '.social-share',
      '.comments', '.related', '.recommended', '.newsletter',
      'form', 'input', 'select', 'textarea', 'button', 'label'
    ]
    clone.querySelectorAll(pruneSelectors.join(',')).forEach(el => el.remove())
    return clone.innerHTML
  }

  // Sanitize while preserving structure needed by Markdown conversion
  private static sanitizeHtmlAllowlist(html: string): string {
    console.log('🧹 ContentExtractor: Starting DOMPurify sanitization')
    const allowedTags = [
      'h1','h2','h3','h4','h5','h6',
      'p','div','section','article','header','footer','aside','main',
      'ul','ol','li','dl','dt','dd',
      'strong','b','em','i','u','s','mark','small','sub','sup',
      'br','hr','code','pre','blockquote',
      'table','thead','tbody','tfoot','tr','th','td','caption'
    ]
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: ['href','colspan','rowspan','class','title'],
      FORBID_TAGS: ['script','style','link','meta','noscript','iframe','object','embed','applet','form','input','select','textarea','button','label','video','audio','source','track','canvas','svg','dialog','marquee','map','area'],
      FORBID_ATTR: ['style','onerror','onload','onclick','onmouseover','onfocus','onblur'],
      ALLOW_DATA_ATTR: false
    }) as string

    // Remove anchors but keep their text (no inline links as requested)
    const container = document.createElement('div')
    container.innerHTML = sanitized
    container.querySelectorAll('a').forEach(a => {
      const text = a.textContent || ''
      a.replaceWith(document.createTextNode(text))
    })
    // Ensure images are removed
    container.querySelectorAll('img').forEach(img => img.remove())
    return container.innerHTML
  }

  // Convert sanitized HTML to Markdown (GFM tables/strikethrough enabled)
  private static convertHtmlToMarkdown(html: string): string {
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })
    td.use(gfm)
    td.use([tables, strikethrough])
    return td.turndown(html)
  }

  // Note: legacy helpers removed (cleanContentForAI, extractTextFromElement, cleanText,
  // decodeHtmlEntities, isJobRelatedContent) since the current extraction pipeline
  // uses prune → sanitize → markdown. Reintroduce only if needed.
}
