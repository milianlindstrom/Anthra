'use client'

import { useEffect, useState, useMemo } from 'react'
import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Archive, RotateCcw, Trash2, Search, X, Rocket } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { RestoreConfirmationDialog } from '@/components/restore-confirmation-dialog'
import { useProject } from '@/contexts/project-context'

export default function ArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [restoreTask, setRestoreTask] = useState<Task | null>(null)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
  const { selectedProjectId } = useProject()

  const fetchArchivedTasks = async () => {
    try {
      // Fetch only archived tasks with search support
      const url = new URL('/api/tasks', window.location.origin)
      url.searchParams.set('archived', 'true')
      if (searchQuery) {
        url.searchParams.set('search', searchQuery)
      }
      if (selectedProjectId && selectedProjectId !== 'all') {
        url.searchParams.set('project_id', selectedProjectId)
      }
      
      const res = await fetch(url.toString())
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

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(Array.isArray(data) ? data.map((p: any) => ({ id: p.id, name: p.name })) : [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  useEffect(() => {
    fetchArchivedTasks()
    fetchProjects()
  }, [searchQuery, selectedProjectId])

  const handleRestoreClick = (task: Task) => {
    setRestoreTask(task)
    setShowRestoreDialog(true)
  }

  const handleRestore = async () => {
    if (!restoreTask) return
    
    try {
      await fetch(`/api/tasks/${restoreTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false, status: 'backlog' }),
      })
      setShowRestoreDialog(false)
      setRestoreTask(null)
      fetchArchivedTasks()
    } catch (error) {
      console.error('Error restoring task:', error)
    }
  }

  const handleReactivate = async (task: Task) => {
    if (!confirm(`Reactivate "${task.title}" and add it to the current sprint/backlog?`)) return
    
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          archived: false, 
          status: 'todo' // Add to To Do instead of backlog for reactivation
        }),
      })
      fetchArchivedTasks()
    } catch (error) {
      console.error('Error reactivating task:', error)
    }
  }

  // Filter tasks by project and date
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    if (projectFilter !== 'all') {
      filtered = filtered.filter(t => t.project_id === projectFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      filtered = filtered.filter(t => {
        if (!t.updated_at) return false
        const archivedDate = new Date(t.updated_at)
        const daysDiff = Math.floor((now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (dateFilter) {
          case 'today':
            return daysDiff === 0
          case 'week':
            return daysDiff <= 7
          case 'month':
            return daysDiff <= 30
          default:
            return true
        }
      })
    }

    return filtered
  }, [tasks, projectFilter, dateFilter])

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
          {filteredTasks.length} Archived Tasks
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archived tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No Archived Tasks Found"
          description={searchQuery || projectFilter !== 'all' || dateFilter !== 'all'
            ? "No tasks match your current filters. Try adjusting your search or filters."
            : "Tasks in Done status for 7+ days will be automatically archived here."}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const sprintInfo = (task as any).sprint_tasks?.[0]?.sprint
            return (
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
                        onClick={() => handleRestoreClick(task)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReactivate(task)}
                      >
                        Reactivate
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
                    {sprintInfo && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <Rocket className="h-3 w-3" />
                        Part of {sprintInfo.name}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Archived {format(new Date(task.updated_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <RestoreConfirmationDialog
        open={showRestoreDialog}
        onOpenChange={setShowRestoreDialog}
        onConfirm={handleRestore}
        taskTitle={restoreTask?.title || ''}
      />
    </div>
  )
}
