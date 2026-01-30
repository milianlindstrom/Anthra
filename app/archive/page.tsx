'use client'

import { useEffect, useState } from 'react'
import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Archive, RotateCcw, Trash2 } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function ArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchArchivedTasks = async () => {
    try {
      // Fetch only archived tasks
      const res = await fetch('/api/tasks?archived=true')
      const data = await res.json()
      // Filter to ensure only archived tasks are shown (defensive)
      const archivedTasks = Array.isArray(data) ? data.filter((t: Task) => t.archived) : []
      setTasks(archivedTasks)
    } catch (error) {
      console.error('Error fetching archived tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArchivedTasks()
  }, [])

  const handleRestore = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      })
      fetchArchivedTasks()
    } catch (error) {
      console.error('Error restoring task:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task?')) return
    
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      fetchArchivedTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Archive</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-lg h-24"></div>
          ))}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Archive</h1>
        <EmptyState
          icon={Archive}
          title="No Archived Tasks"
          description="Tasks in Done status for 7+ days will be automatically archived here."
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Archive</h1>
        <Badge variant="outline" className="text-sm">
          {tasks.length} Archived Tasks
        </Badge>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(task.id)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                {task.project && (
                  <Badge variant="outline" className="text-xs">
                    {task.project.icon} {task.project.name}
                  </Badge>
                )}
                <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
                  {task.priority}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Archived {format(new Date(task.updated_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
