'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'
import { Task } from '@/lib/types'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks')
        const data = await res.json()
        setAllTasks(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    }
    fetchTasks()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = allTasks.filter(task => 
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query) ||
      task.project?.name?.toLowerCase().includes(query)
    )
    setResults(filtered.slice(0, 10)) // Limit to 10 results
  }, [searchQuery, allTasks])

  const handleClose = () => {
    setIsOpen(false)
    setSearchQuery('')
    setResults([])
  }

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const statusColors = {
    backlog: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    todo: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    done: 'bg-green-500/20 text-green-400 border-green-500/30',
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={handleClose}>
      <div className="container mx-auto px-4 pt-20" onClick={(e) => e.stopPropagation()}>
        <Card className="max-w-2xl mx-auto">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search tasks by title, description, or project..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={handleClose}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {searchQuery && (
              <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2">
                {results.length > 0 ? (
                  results.map((task) => (
                    <a
                      key={task.id}
                      href={`/kanban#${task.id}`}
                      className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                      onClick={() => handleClose()}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium line-clamp-1">{task.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="outline" className={cn('status-badge text-xs font-mono', statusColors[task.status])}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {task.project && (
                          <Badge variant="outline" className="text-xs">
                            {task.project.icon} {task.project.name}
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
                          {task.priority}
                        </Badge>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No tasks found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}

            {!searchQuery && (
              <div className="mt-4 text-center py-8 text-sm text-muted-foreground">
                <p>Start typing to search tasks...</p>
                <p className="text-xs mt-2">
                  Press <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> to close
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
