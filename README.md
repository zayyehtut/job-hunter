# Job Hunter AI - Plasmo Edition

A modern, polished Chrome extension built with Plasmo framework that scans job postings and extracts structured data using AI, with a comprehensive dashboard for managing saved jobs.

## 🚀 Features

### 🔍 Smart Job Scanning
- One-click scanning of job postings from any website
- AI-powered extraction of structured job data using Google's Gemini API
- Automatic categorization of skills, requirements, and company culture
- Intelligent content extraction optimized for job pages
- Real-time processing status with detailed feedback

### 📊 Modern Dashboard & Management
- Clean, responsive React-based dashboard with modular architecture
- Real-time job statistics and analytics
- Advanced search and filtering capabilities
- Comprehensive job detail modal with tabbed interface
- Job status management (Saved, Applied, Rejected, Interview)
- Bulk operations (export, delete all)

### 🎨 Enhanced User Experience
- Dark/Light theme support with system preference detection
- Responsive design optimized for all screen sizes
- Intuitive navigation between dashboard, jobs list, and settings
- Real-time status updates and error handling
- Accessibility features and keyboard navigation

### ⚙️ Advanced Settings & Configuration
- Secure API key management through dashboard settings
- Configurable Gemini model selection
- API connection testing with detailed feedback
- Settings stored locally in browser with Plasmo Storage API
- Data export and management tools

### 🛠️ Technical Excellence
- Built with Plasmo framework for optimal performance
- TypeScript for type safety and better development experience
- Modern React with custom hooks for state management
- Modular architecture following SRP principles
- Hot reload and live development experience
- Comprehensive error handling and logging

## 🏗️ Architecture

### Modular Design
```
src/
├── background/           # Background service worker
│   ├── index.ts         # Main background script
│   └── messages/        # Message handlers
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   ├── job-detail/      # Job detail modal components
│   ├── dashboard/       # Dashboard-specific components
│   ├── popup/           # Popup-specific components
│   └── layout/          # Layout components
├── hooks/               # Custom React hooks
│   ├── useTheme.ts      # Theme management
│   ├── useJobs.ts       # Job data management
│   └── useSettings.ts   # Settings management
├── views/               # Main view components
│   ├── DashboardView.tsx    # Dashboard interface
│   ├── JobsListView.tsx     # Jobs list interface
│   └── SettingsView.tsx     # Settings interface
├── services/            # Business logic services
│   ├── gemini-api.ts    # Gemini AI API client
│   ├── storage.ts       # Storage management
│   ├── job-processor.ts # Job processing orchestration
│   ├── content-extractor.ts # Content extraction logic
│   └── state-service.ts # State management service
├── types/               # TypeScript type definitions
│   ├── index.ts         # Main type definitions
│   ├── state.ts         # State-related types
│   └── ambient/         # Ambient type declarations
├── utils/               # Utility functions
├── config/              # Configuration constants
├── lib/                 # Library utilities
├── content.ts           # Content script for page scanning
├── popup.tsx            # Extension popup UI
├── options.tsx          # Main dashboard/options page
└── style.css            # Global styles
```

### Key Components

#### 🎯 Core Views
1. **DashboardView** (`views/DashboardView.tsx`)
   - Overview statistics and recent activity
   - Quick actions and navigation
   - Job analytics and insights

2. **JobsListView** (`views/JobsListView.tsx`)
   - Comprehensive job listing with search/filter
   - Bulk operations and individual job actions
   - Status management and sorting

3. **SettingsView** (`views/SettingsView.tsx`)
   - API configuration and testing
   - Data management and export
   - Extension preferences

#### 🔧 Custom Hooks
1. **useTheme** (`hooks/useTheme.ts`)
   - Theme state management (light/dark/system)
   - Automatic system preference detection
   - Persistent theme storage

2. **useJobs** (`hooks/useJobs.ts`)
   - Job data loading and filtering
   - Job operations (delete, export)
   - Real-time job statistics

3. **useSettings** (`hooks/useSettings.ts`)
   - Settings loading and saving
   - API connection testing
   - Configuration validation

#### 🎨 UI Components
1. **JobDetailModal** (`components/job-detail/JobDetailModal.tsx`)
   - Comprehensive job information display
   - Tabbed interface (Summary, Skills, Application, Raw)
   - Status management and external links

2. **Job Detail Sections**
   - `SummarySection.tsx` - Job overview and key details
   - `SkillsSection.tsx` - Required skills and tools
   - `QualificationsSection.tsx` - Education and experience requirements
   - `ApplicationSection.tsx` - Application process and requirements
   - `SourceInfoSection.tsx` - Source URL and metadata
   - `RawMarkdownSection.tsx` - Original extracted content

#### 🔌 Services
1. **Background Service Worker** (`background/index.ts`)
   - Handles all extension operations
   - Manages messaging between components
   - Processes job data with AI

2. **Content Script** (`content.ts`)
   - Extracts job content from web pages
   - Intelligent content filtering and cleaning
   - Communicates with background worker

3. **AI Integration** (`services/gemini-api.ts`)
   - Gemini API client implementation
   - Structured job data extraction
   - Error handling and retry logic

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/pnpm
- Chrome browser
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd job-hunter-ai-plasmo
   pnpm install
   ```

2. **Start Development Server**
   ```bash
   pnpm dev
   ```

3. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `build/chrome-mv3-dev` directory

4. **Configure Settings**
   - Click the extension icon in your browser toolbar
   - Click "Open Dashboard"
   - Go to the "Settings" tab
   - Enter your Gemini API key
   - Click "Test API" to verify connection
   - Click "Save Settings"

## 📖 Usage

### Scanning Jobs
1. Navigate to any job posting page
2. Click the extension icon in your browser toolbar
3. Click "Scan this Page"
4. Wait for AI processing (usually 5-10 seconds)
5. Job will be automatically saved to your dashboard

### Managing Jobs
1. Open the dashboard from the popup
2. View all saved jobs in the table
3. Use search and filters to find specific jobs
4. Click "View" to see detailed job information in modal
5. Use "Download" to save job data as text file
6. Use "Delete" to remove unwanted jobs
7. Monitor statistics in the dashboard header

### Job Details Modal
- **Summary Tab**: Overview of job title, company, location, salary
- **Skills Tab**: Required skills, tools, and qualifications
- **Application Tab**: Application process and requirements
- **Raw Tab**: Original extracted markdown content

### Settings
- **API Key**: Your Gemini API key for AI processing
- **Model Name**: Gemini model to use (default: gemini-2.5-flash)
- **Test API**: Verify your API connection
- **Save Settings**: Persist your configuration
- **Export Data**: Download all job data as JSON
- **Delete All**: Remove all saved jobs (with confirmation)

## 🛠️ Development

### Available Scripts
```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm package      # Create distributable package
```

### Development Features
- **Hot Reload**: Changes reflect immediately in the extension
- **TypeScript**: Full type safety and IntelliSense support
- **React DevTools**: Available in popup and options pages
- **Error Handling**: Comprehensive error handling and logging
- **Modular Architecture**: Easy to extend and maintain

### Code Organization Principles
- **Separation of Concerns**: Each component has a single responsibility
- **Custom Hooks**: Reusable logic extracted into hooks
- **Type Safety**: Comprehensive TypeScript types
- **Component Composition**: Small, focused components
- **Service Layer**: Business logic separated from UI

### Adding New Features
1. **New Views**: Add to `src/views/` directory
2. **New Components**: Add to appropriate `src/components/` subdirectory
3. **New Hooks**: Add to `src/hooks/` directory
4. **New Services**: Add to `src/services/` directory
5. **New Types**: Add to `src/types/` directory

## 🔧 Configuration

### Environment Variables
The extension uses Plasmo's environment variable system. Create a `.env` file for development:

```env
PLASMO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### Manifest Configuration
The extension manifest is automatically generated by Plasmo based on `package.json`:

```json
{
  "manifest": {
    "host_permissions": [
      "https://generativelanguage.googleapis.com/*"
    ],
    "permissions": [
      "storage",
      "activeTab",
      "scripting"
    ]
  }
}
```

## 🎯 Key Improvements Over Original

### Technical Improvements
- **Modular Architecture**: Clean separation of concerns with views, hooks, and services
- **Custom Hooks**: Reusable logic for theme, jobs, and settings management
- **Component Composition**: Small, focused components for better maintainability
- **Type Safety**: Comprehensive TypeScript types throughout the codebase
- **Error Handling**: Robust error handling with user-friendly messages

### User Experience Improvements
- **Modern UI**: Clean, responsive design with Tailwind CSS and Shadcn/ui
- **Theme Support**: Dark/light theme with system preference detection
- **Real-time Feedback**: Live status updates during scanning and operations
- **Advanced Search**: Powerful search and filtering capabilities
- **Comprehensive Job Details**: Tabbed modal with detailed job information
- **Bulk Operations**: Export and delete all functionality

### Performance Improvements
- **Optimized Content Extraction**: Better job content detection and cleaning
- **Efficient State Management**: Custom hooks for optimized re-renders
- **Reduced Bundle Size**: Modular architecture reduces unnecessary code
- **Faster Development**: Hot reload and modern tooling
- **Memory Management**: Proper cleanup and resource management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the modular architecture patterns
4. Add appropriate TypeScript types
5. Test your changes thoroughly
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow the existing modular architecture
- Use TypeScript for all new code
- Create custom hooks for reusable logic
- Add appropriate error handling
- Update documentation for new features
- Test across different job posting sites

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Plasmo Framework](https://www.plasmo.com/) for the excellent extension development experience
- [Google Gemini AI](https://ai.google.dev/) for the powerful AI capabilities
- [React](https://reactjs.org/) for the modern UI framework
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling
- [Shadcn/ui](https://ui.shadcn.com/) for the component library
- [Lucide React](https://lucide.dev/) for the icon library

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/job-hunter-ai/issues) page
2. Create a new issue with detailed information
3. Include browser version, extension version, and steps to reproduce
4. Provide console logs if available

---

**Built with ❤️ using Plasmo Framework**
