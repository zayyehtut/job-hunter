# Codebase Documentation

This document provides comprehensive documentation for the Job Hunter AI Chrome extension codebase, including architecture patterns, development guidelines, and technical details.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [Core Patterns](#core-patterns)
4. [Component Architecture](#component-architecture)
5. [State Management](#state-management)
6. [Data Flow](#data-flow)
7. [Type System](#type-system)
8. [Development Guidelines](#development-guidelines)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)

## 🏗️ Architecture Overview

The codebase follows a modular, component-based architecture with clear separation of concerns:

### Core Principles
- **Single Responsibility Principle**: Each component/module has one clear purpose
- **Composition over Inheritance**: Components are built by composing smaller, focused pieces
- **Custom Hooks**: Reusable logic is extracted into custom hooks
- **Type Safety**: Comprehensive TypeScript types throughout
- **Service Layer**: Business logic is separated from UI components

### Architecture Layers
1. **UI Layer**: React components and views
2. **Hook Layer**: Custom hooks for state and logic
3. **Service Layer**: Business logic and external API interactions
4. **Type Layer**: TypeScript type definitions
5. **Utility Layer**: Helper functions and utilities

## 📁 Directory Structure

```
src/
├── background/           # Background service worker
│   ├── index.ts         # Main background script
│   └── messages/        # Message handlers for inter-component communication
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn/ui base components
│   ├── job-detail/      # Job detail modal and its subcomponents
│   ├── dashboard/       # Dashboard-specific components
│   ├── popup/           # Popup-specific components
│   └── layout/          # Layout and structural components
├── hooks/               # Custom React hooks
│   ├── useTheme.ts      # Theme management hook
│   ├── useJobs.ts       # Job data management hook
│   └── useSettings.ts   # Settings management hook
├── views/               # Main view components (page-level)
│   ├── DashboardView.tsx    # Dashboard interface
│   ├── JobsListView.tsx     # Jobs list interface
│   └── SettingsView.tsx     # Settings interface
├── services/            # Business logic services
│   ├── gemini-api.ts    # Gemini AI API client
│   ├── storage.ts       # Chrome storage management
│   ├── job-processor.ts # Job processing orchestration
│   ├── content-extractor.ts # Content extraction logic
│   └── state-service.ts # State management service
├── types/               # TypeScript type definitions
│   ├── index.ts         # Main type definitions
│   ├── state.ts         # State-related types
│   └── ambient/         # Ambient type declarations for external libraries
├── utils/               # Utility functions
├── config/              # Configuration constants
├── lib/                 # Library utilities (cn function, etc.)
├── content.ts           # Content script for page scanning
├── popup.tsx            # Extension popup UI
├── options.tsx          # Main dashboard/options page
└── style.css            # Global styles
```

## 🔧 Core Patterns

### 1. Custom Hook Pattern

Custom hooks encapsulate reusable logic and state management:

```typescript
// Example: useTheme hook
export function useThemeSync() {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || "system"
  })

  const applyTheme = (currentTheme: Theme) => {
    // Theme application logic
  }

  useEffect(() => {
    applyTheme(theme)
    // Event listeners and cleanup
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return { theme, setTheme }
}
```

### 2. Service Layer Pattern

Services handle business logic and external API interactions:

```typescript
// Example: Gemini API service
export class GeminiApiService {
  private apiKey: string
  private modelName: string

  constructor(apiKey: string, modelName: string = "gemini-2.5-flash") {
    this.apiKey = apiKey
    this.modelName = modelName
  }

  async processJobContent(content: string): Promise<JobData> {
    // API interaction logic
  }
}
```

### 3. Component Composition Pattern

Components are built by composing smaller, focused pieces:

```typescript
// Example: JobDetailModal composition
export function JobDetailModal({ job, ...props }: JobDetailModalProps) {
  return (
    <Modal {...props}>
      <ModalHeader>
        <JobTitle job={job} />
        <JobMeta job={job} />
      </ModalHeader>
      <ModalContent>
        <Tabs>
          <TabPanel value="summary">
            <SummarySection job={job} />
          </TabPanel>
          <TabPanel value="skills">
            <SkillsSection job={job} />
          </TabPanel>
          {/* More tab panels */}
        </Tabs>
      </ModalContent>
    </Modal>
  )
}
```

## 🎨 Component Architecture

### Component Hierarchy

```
Options (Main Container)
├── DashboardView
│   ├── StatsCards
│   ├── RecentJobs
│   └── QuickActions
├── JobsListView
│   ├── SearchAndFilter
│   ├── JobsTable
│   └── BulkActions
├── SettingsView
│   ├── ApiSettings
│   ├── DataManagement
│   └── TestConnection
└── JobDetailModal
    ├── SummarySection
    ├── SkillsSection
    ├── QualificationsSection
    ├── ApplicationSection
    ├── SourceInfoSection
    └── RawMarkdownSection
```

### Component Guidelines

1. **Props Interface**: Always define explicit props interfaces
2. **Default Props**: Use default parameters for optional props
3. **Children**: Use React.ReactNode for flexible children
4. **Event Handlers**: Use consistent naming (handleEventName)
5. **Accessibility**: Include ARIA attributes and keyboard navigation

### Example Component Structure

```typescript
interface ComponentProps {
  data: SomeType
  onAction?: (data: SomeType) => void
  children?: React.ReactNode
  className?: string
}

export function Component({ 
  data, 
  onAction, 
  children, 
  className 
}: ComponentProps) {
  const handleClick = () => {
    onAction?.(data)
  }

  return (
    <div className={cn("base-styles", className)}>
      <h2>{data.title}</h2>
      <p>{data.description}</p>
      {children}
      <button onClick={handleClick}>
        Action
      </button>
    </div>
  )
}
```

## 🔄 State Management

### State Architecture

The application uses a combination of:
- **Local Component State**: For UI-specific state
- **Custom Hooks**: For reusable state logic
- **Chrome Storage**: For persistent data
- **Background Service**: For cross-component communication

### State Flow

```
User Action → Component → Hook → Service → Background → Storage
     ↓
UI Update ← Component ← Hook ← Service ← Background ← Storage
```

### State Guidelines

1. **Local State**: Use for UI-specific state (modals, forms, etc.)
2. **Hook State**: Use for reusable logic (theme, jobs, settings)
3. **Persistent State**: Use Chrome storage for data that needs to persist
4. **Shared State**: Use background service for cross-component communication

### Example State Management

```typescript
// Local component state
const [isOpen, setIsOpen] = useState(false)
const [formData, setFormData] = useState({})

// Custom hook state
const { theme, setTheme } = useThemeSync()
const { jobs, deleteJob } = useJobs()

// Persistent state
const { settings, saveSettings } = useSettings()
```

## 📊 Data Flow

### Data Flow Patterns

1. **Unidirectional Flow**: Data flows down, events flow up
2. **Service Layer**: All external interactions go through services
3. **Type Safety**: All data is typed with TypeScript
4. **Error Handling**: Comprehensive error handling at each layer

### Data Flow Example

```typescript
// 1. User clicks scan button
const handleScan = async () => {
  setIsScanning(true)
  
  try {
    // 2. Content script extracts data
    const content = await extractContent()
    
    // 3. Background service processes with AI
    const jobData = await processJobContent(content)
    
    // 4. Save to storage
    await saveJob(jobData)
    
    // 5. Update UI
    setJobs(prev => [...prev, jobData])
  } catch (error) {
    // 6. Handle errors
    setError(error.message)
  } finally {
    setIsScanning(false)
  }
}
```

## 🏷️ Type System

### Type Organization

1. **Core Types**: Main business logic types
2. **State Types**: State management types
3. **API Types**: External API interaction types
4. **Ambient Types**: Third-party library types

### Type Guidelines

1. **Explicit Types**: Always define explicit types for functions and components
2. **Union Types**: Use union types for finite sets of values
3. **Generic Types**: Use generics for reusable components
4. **Type Guards**: Use type guards for runtime type checking

### Example Type Definitions

```typescript
// Core business types
export interface JobData {
  id: string
  aiData: {
    jobTitle: string
    companyName: string
    location: Location
    compensation?: Compensation
    // ... other fields
  }
  status: JobStatus
  savedDate: string
  sourceURL: string
  applyLink?: string
  metadata?: JobMetadata
}

// Union types
export type JobStatus = "Saved" | "Applied" | "Rejected" | "Interview"
export type Theme = "light" | "dark" | "system"

// Generic types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Type guards
export function isJobData(obj: any): obj is JobData {
  return obj && typeof obj.id === 'string' && obj.aiData
}
```

## 🛠️ Development Guidelines

### Code Style

1. **Naming Conventions**:
   - Components: PascalCase (e.g., `JobDetailModal`)
   - Hooks: camelCase with "use" prefix (e.g., `useJobs`)
   - Services: PascalCase with "Service" suffix (e.g., `GeminiApiService`)
   - Types: PascalCase (e.g., `JobData`)
   - Constants: UPPER_SNAKE_CASE (e.g., `MAX_JOBS`)

2. **File Organization**:
   - One component per file
   - Related components in subdirectories
   - Index files for clean imports

3. **Import Order**:
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

### Error Handling

1. **Try-Catch Blocks**: Wrap async operations in try-catch
2. **User Feedback**: Provide clear error messages to users
3. **Graceful Degradation**: Handle errors gracefully without breaking the UI
4. **Logging**: Log errors for debugging

```typescript
const handleOperation = async () => {
  try {
    setIsLoading(true)
    const result = await someAsyncOperation()
    setData(result)
  } catch (error) {
    console.error('Operation failed:', error)
    setError(error.message || 'Operation failed')
  } finally {
    setIsLoading(false)
  }
}
```

### Performance Considerations

1. **Memoization**: Use React.memo for expensive components
2. **Callback Optimization**: Use useCallback for event handlers
3. **Dependency Arrays**: Properly manage useEffect dependencies
4. **Lazy Loading**: Lazy load components when appropriate

```typescript
// Memoized component
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* expensive rendering */}</div>
})

// Optimized callback
const handleClick = useCallback((id: string) => {
  // handle click
}, [dependencies])

// Proper dependencies
useEffect(() => {
  // effect logic
}, [dependency1, dependency2])
```

## 🧪 Testing Strategy

### Testing Levels

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test component interactions
3. **E2E Tests**: Test complete user workflows

### Testing Guidelines

1. **Test Structure**: Use describe/it blocks for clear organization
2. **Mocking**: Mock external dependencies and APIs
3. **Assertions**: Use clear, descriptive assertions
4. **Coverage**: Aim for high test coverage

### Example Test

```typescript
describe('useJobs hook', () => {
  it('should load jobs on mount', async () => {
    const mockJobs = [mockJob1, mockJob2]
    jest.spyOn(jobService, 'getJobs').mockResolvedValue(mockJobs)
    
    const { result } = renderHook(() => useJobs())
    
    await waitFor(() => {
      expect(result.current.jobs).toEqual(mockJobs)
    })
  })
})
```

## 🚀 Performance Considerations

### Optimization Strategies

1. **Bundle Size**: Use code splitting and tree shaking
2. **Rendering**: Minimize unnecessary re-renders
3. **Memory**: Proper cleanup of event listeners and subscriptions
4. **Network**: Optimize API calls and caching

### Performance Monitoring

1. **Bundle Analysis**: Monitor bundle size with webpack-bundle-analyzer
2. **Runtime Performance**: Use React DevTools Profiler
3. **Memory Leaks**: Monitor memory usage in development
4. **User Metrics**: Track real-world performance metrics

### Best Practices

1. **Avoid Inline Objects**: Don't create objects in render
2. **Use Keys**: Always provide keys for list items
3. **Debounce Input**: Debounce search and filter inputs
4. **Virtual Scrolling**: Use virtual scrolling for large lists

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Plasmo Framework](https://www.plasmo.com/)
- [Chrome Extension Development](https://developer.chrome.com/docs/extensions/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui](https://ui.shadcn.com/)

---

This documentation should be updated as the codebase evolves. For questions or suggestions, please create an issue or pull request.
