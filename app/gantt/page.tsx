'use client'

import { useEffect, useState } from 'react'
import { Task as GanttTask, ViewMode, Gantt } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { Task } from '@/lib/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addDays, format } from 'date-fns'

export default function GanttPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [projects, setProjects] = useState<string[]>([])
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([])

  const fetchTasks = async () => {
    try {
      const url = selectedProject !== 'all' 
        ? `/api/tasks?project=${selectedProject}`
        : '/api/tasks'
      const res = await fetch(url)
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
  }, [selectedProject])

  useEffect(() => {
    // Extract unique projects
    const uniqueProjects = Array.from(
      new Set(tasks.filter(t => t.project).map(t => t.project as string))
    )
    setProjects(uniqueProjects)
  }, [tasks])

  useEffect(() => {
    // Convert tasks to Gantt format
    const convertedTasks: GanttTask[] = tasks
      .filter(task => task.estimated_hours && task.estimated_hours > 0)
      .map((task) => {
        const start = task.due_date ? new Date(task.due_date) : new Date()
        const estimatedDays = Math.ceil((task.estimated_hours || 1) / 8)
        const end = addDays(start, Math.max(estimatedDays, 1))

        const priorityColors = {
          low: '#3b82f6',
          medium: '#eab308',
          high: '#ef4444',
        }

        return {
          start,
          end,
          name: task.title,
          id: task.id,
          type: 'task' as const,
          progress: task.status === 'done' ? 100 : task.status === 'in-progress' ? 50 : 0,
          project: task.project || 'No Project',
          styles: {
            backgroundColor: priorityColors[task.priority],
            backgroundSelectedColor: priorityColors[task.priority],
            progressColor: priorityColors[task.priority],
            progressSelectedColor: priorityColors[task.priority],
          },
        }
      })
      .sort((a, b) => {
        // Sort by project, then by start date
        if (a.project !== b.project) {
          return a.project.localeCompare(b.project)
        }
        return a.start.getTime() - b.start.getTime()
      })

    setGanttTasks(convertedTasks)
  }, [tasks])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gantt Timeline</h1>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {ganttTasks.length > 0 ? (
        <div className="bg-card rounded-lg border p-4 overflow-auto">
          <Gantt
            tasks={ganttTasks}
            viewMode={ViewMode.Week}
            listCellWidth="200px"
            columnWidth={60}
            barBackgroundColor="#1e293b"
            barBackgroundSelectedColor="#0f172a"
            todayColor="rgba(59, 130, 246, 0.2)"
            fontSize="14"
            locale="en-US"
          />
        </div>
      ) : (
        <div className="bg-card rounded-lg border p-12 text-center">
          <p className="text-muted-foreground">
            No tasks with estimated hours and due dates found.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Add estimated hours and due dates to tasks to see them in the Gantt view.
          </p>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Priority Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-sm">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm">Low Priority</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Progress Legend</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="text-sm">0% - To Do</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">50% - In Progress</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">100% - Done</div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-2">Statistics</h3>
          <div className="space-y-2">
            <div className="text-sm">
              Total Tasks: <span className="font-semibold">{ganttTasks.length}</span>
            </div>
            <div className="text-sm">
              Total Hours: <span className="font-semibold">
                {tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
