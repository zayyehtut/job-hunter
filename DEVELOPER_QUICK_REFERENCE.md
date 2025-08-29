# Developer Quick Reference

A quick reference guide for developers working on the Job Hunter AI Chrome extension.

## 🚀 Quick Start

### Development Commands
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm package      # Create distributable package
```

### Load Extension in Chrome
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `build/chrome-mv3-dev`

## 📁 File Structure Quick Reference

```
src/
├── background/           # Service worker & message handlers
├── components/          # UI components
│   ├── ui/              # Shadcn/ui base components
│   ├── job-detail/      # Job detail modal components
│   ├── dashboard/       # Dashboard components
│   ├── popup/           # Popup components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
├── views/               # Main view components
├── services/            # Business logic services
├── types/               # TypeScript types
├── utils/               # Utility functions
├── config/              # Configuration
├── lib/                 # Library utilities
├── content.ts           # Content script
├── popup.tsx            # Popup UI
├── options.tsx          # Main dashboard
└── style.css            # Global styles
```

## 🎯 Common Patterns

### Adding a New Component
```typescript
// src/components/MyComponent.tsx
import React from "react"
import { cn } from "~/lib/utils"

interface MyComponentProps {
  title: string
  onAction?: () => void
  className?: string
}

export function MyComponent({ title, onAction, className }: MyComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  )
}
```

### Adding a New Hook
```typescript
// src/hooks/useMyHook.ts
import { useState, useEffect } from "react"

export function useMyHook() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    // Hook logic
  }, [])
  
  return { data, setData }
}
```

### Adding a New Service
```typescript
// src/services/my-service.ts
export class MyService {
  async doSomething(): Promise<Result> {
    // Service logic
  }
}

export const myService = new MyService()
```

### Adding New Types
```typescript
// src/types/index.ts
export interface MyType {
  id: string
  name: string
  data?: any
}

export type MyStatus = "active" | "inactive"
```

## 🔧 Common Tasks

### Adding a New View
1. Create `src/views/NewView.tsx`
2. Add to `options.tsx` routing logic
3. Update navigation if needed

### Adding a New Message Handler
1. Create `src/background/messages/newMessage.ts`
2. Add handler in `src/background/index.ts`
3. Use `sendToBackground` in components

### Adding a New UI Component
1. Create component in appropriate `src/components/` subdirectory
2. Export from index file if needed
3. Import and use in views

### Adding New Settings
1. Update `ExtensionSettings` type in `src/types/index.ts`
2. Add to `useSettings` hook
3. Add UI in `SettingsView.tsx`

## 🎨 Styling Guidelines

### Using Tailwind CSS
```typescript
// Use cn utility for conditional classes
import { cn } from "~/lib/utils"

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>
```

### Using Shadcn/ui Components
```typescript
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default" size="sm">
      Action
    </Button>
  </CardContent>
</Card>
```

## 🔄 State Management

### Local Component State
```typescript
const [isOpen, setIsOpen] = useState(false)
const [data, setData] = useState<DataType>(initialValue)
```

### Custom Hook State
```typescript
const { theme, setTheme } = useThemeSync()
const { jobs, deleteJob } = useJobs()
const { settings, saveSettings } = useSettings()
```

### Persistent State (Chrome Storage)
```typescript
// Save to storage
await chrome.storage.local.set({ key: value })

// Load from storage
const result = await chrome.storage.local.get(['key'])
const value = result.key
```

## 📡 API Communication

### Background Message
```typescript
import { sendToBackground } from "@plasmohq/messaging"

const response = await sendToBackground({
  name: 'messageName',
  body: { data: 'value' }
})
```

### Content Script Communication
```typescript
// From popup/options to content script
await chrome.tabs.sendMessage(tabId, { action: 'scan' })

// From content script to background
await chrome.runtime.sendMessage({ action: 'process' })
```

## 🏷️ TypeScript Tips

### Type Guards
```typescript
function isJobData(obj: any): obj is JobData {
  return obj && typeof obj.id === 'string' && obj.aiData
}
```

### Generic Types
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### Union Types
```typescript
type JobStatus = "Saved" | "Applied" | "Rejected" | "Interview"
```

## 🐛 Debugging

### Console Logging
```typescript
console.log('Debug info:', data)
console.error('Error occurred:', error)
```

### Chrome DevTools
- Popup: Right-click extension icon → Inspect popup
- Options: Open options page → F12
- Background: Go to `chrome://extensions/` → Inspect views

### Common Issues
1. **Import errors**: Check file paths and exports
2. **Type errors**: Ensure types are properly defined
3. **Storage issues**: Check Chrome storage permissions
4. **API errors**: Verify API key and network connectivity

## 📝 Code Style

### Naming Conventions
- Components: `PascalCase` (e.g., `JobDetailModal`)
- Hooks: `camelCase` with "use" prefix (e.g., `useJobs`)
- Services: `PascalCase` with "Service" suffix (e.g., `GeminiApiService`)
- Types: `PascalCase` (e.g., `JobData`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_JOBS`)

### Import Order
```typescript
// React imports
import React, { useState, useEffect } from "react"

// Third-party libraries
import { sendToBackground } from "@plasmohq/messaging"

// Internal components
import { Button } from "~/components/ui/button"

// Internal hooks
import { useJobs } from "~/hooks/useJobs"

// Internal services
import { jobService } from "~/services"

// Types
import type { JobData } from "~/types"

// Styles
import "~style.css"
```

## 🚀 Performance Tips

### Optimization
```typescript
// Memoize expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* rendering */}</div>
})

// Optimize callbacks
const handleClick = useCallback((id: string) => {
  // handle click
}, [dependencies])

// Proper dependencies
useEffect(() => {
  // effect logic
}, [dependency1, dependency2])
```

### Bundle Size
- Use dynamic imports for large components
- Avoid unnecessary dependencies
- Use tree shaking effectively

## 🔗 Useful Links

- [Plasmo Documentation](https://www.plasmo.com/)
- [Chrome Extension APIs](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)

## 📞 Getting Help

1. Check the [CODEBASE.md](./CODEBASE.md) for detailed documentation
2. Review existing code for patterns and examples
3. Create an issue for bugs or feature requests
4. Ask questions in the project discussions

---

**Happy coding! 🚀**
