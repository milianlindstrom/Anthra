'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Task } from '@/lib/types'
import { useProject } from '@/contexts/project-context'
import { CustomGantt } from '@/components/custom-gantt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function GanttPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const { selectedProjectId } = useProject()
  const router = useRouter()

  useEffect(() => {
    const handleTaskUpdate = () => {
      fetchTasks()
    }
    window.addEventListener('taskUpdated', handleTaskUpdate)
    return () => window.removeEventListener('taskUpdated', handleTaskUpdate)
  }, [])

  // Redirect if no project selected
  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === 'all') {
      router.push('/projects')
    }
  }, [selectedProjectId, router])

  const fetchTasks = async () => {
    if (!selectedProjectId || selectedProjectId === 'all') return
    
    try {
      const res = await fetch(`/api/tasks?project_id=${selectedProjectId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setTasks(data)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setTasks([])
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [selectedProjectId])

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.project_id === selectedProjectId)
  }, [tasks, selectedProjectId])

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Gantt Timeline</h1>
          <p className="text-sm text-muted-foreground">Visualize task schedules and dependencies</p>
        </div>
      </div>

      <CustomGantt tasks={filteredTasks} />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Priority Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-rose-500 border-2 border-rose-600"></div>
              <span className="text-sm">High Priority</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-amber-500 border-2 border-amber-600"></div>
              <span className="text-sm">Medium Priority</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-sky-500 border-2 border-sky-600"></div>
              <span className="text-sm">Low Priority</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Progress Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-3 bg-muted rounded-sm"></div>
              <span className="text-sm">Backlog (0%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-3 bg-muted rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 w-1/4 bg-foreground/40"></div>
              </div>
              <span className="text-sm">To Do (25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-3 bg-muted rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 w-1/2 bg-foreground/40"></div>
              </div>
              <span className="text-sm">In Progress (50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-3 bg-muted rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 w-3/4 bg-foreground/40"></div>
              </div>
              <span className="text-sm">Review (75%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-3 bg-muted rounded-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-foreground/40"></div>
              </div>
              <span className="text-sm">Done (100%)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tasks:</span>
              <span className="font-semibold">
                {filteredTasks.filter(t => (t.start_date && t.due_date) || (t.due_date && t.estimated_hours)).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Hours:</span>
              <span className="font-semibold">
                {filteredTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0).toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-semibold text-emerald-400">
                {filteredTasks.filter(t => t.status === 'done').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
