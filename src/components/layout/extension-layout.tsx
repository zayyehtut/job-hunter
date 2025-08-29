import React from "react"
import { cn } from "~/lib/utils"

interface ExtensionLayoutProps {
  children: React.ReactNode
  className?: string
}

export function ExtensionLayout({ children, className }: ExtensionLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background font-sans antialiased",
      className
    )}>
      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}

export function ExtensionContainer({ children, className }: ExtensionLayoutProps) {
  return (
    <div className={cn(
      "container mx-auto px-4 py-6",
      className
    )}>
      {children}
    </div>
  )
}

export function ExtensionHeader({ children, className }: ExtensionLayoutProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container flex h-14 items-center">
        {children}
      </div>
    </header>
  )
}

export function ExtensionContent({ children, className }: ExtensionLayoutProps) {
  return (
    <main className={cn(
      "flex-1 space-y-4 p-4 pt-6",
      className
    )}>
      {children}
    </main>
  )
}
