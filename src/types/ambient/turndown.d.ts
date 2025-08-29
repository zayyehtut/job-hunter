declare module 'turndown' {
  export interface TurndownOptions {
    headingStyle?: string
    codeBlockStyle?: string
    [key: string]: any
  }

  export default class TurndownService {
    constructor(options?: TurndownOptions)
    use(plugin: any): void
    turndown(html: string): string
  }
}


