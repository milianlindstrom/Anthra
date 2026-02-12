'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Badge } from './ui/badge'
import { Keyboard } from 'lucide-react'

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts with ? key
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        // Only if not typing in input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return
        }
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open global search' },
    { keys: ['⌘', 'N'], description: 'Quick add task (modal)' },
    { keys: ['Q'], description: 'Quick add task (no modal, like Linear)' },
    { keys: ['J'], description: 'Navigate to next task (kanban)' },
    { keys: ['K'], description: 'Navigate to previous task (kanban)' },
    { keys: ['Esc'], description: 'Close modals/overlays' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {shortcuts.map((shortcut, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, j) => (
                    <Badge key={j} variant="outline" className="font-mono text-xs px-2 py-1">
                      {key}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
