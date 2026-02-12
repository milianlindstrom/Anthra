'use client'

import { useState, useEffect, useRef } from 'react'
import { useProject } from '@/contexts/project-context'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'

interface QuickAddInputProps {
  onTaskCreated?: () => void
}

export function QuickAddInput({ onTaskCreated }: QuickAddInputProps) {
  const { selectedProjectId } = useProject()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Allow Q key if we're already in the quick add input
        if (e.key === 'q' && e.target === inputRef.current) {
          return
        }
        return
      }

      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setTitle('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedProjectId || selectedProjectId === 'all') return

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          status: 'backlog',
          priority: 'medium',
          project_id: selectedProjectId,
        }),
      })

      setTitle('')
      setIsOpen(false)
      if (onTaskCreated) {
        onTaskCreated()
      } else {
        // Default: trigger a custom event that pages can listen to
        window.dispatchEvent(new CustomEvent('taskCreated'))
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <form onSubmit={handleSubmit} className="relative">
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            // Close on blur only if empty
            if (!title.trim()) {
              setIsOpen(false)
            }
          }}
          placeholder="Add task... (Press Esc to cancel)"
          className="w-full h-12 text-base shadow-lg border-2"
          autoFocus
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          Press Enter to save
        </div>
      </form>
    </div>
  )
}
