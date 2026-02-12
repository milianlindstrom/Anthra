'use client'

import { useEffect, useState, useMemo } from 'react'
import { Task } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { format, isAfter, isBefore, subDays, startOfWeek, endOfWeek, differenceInDays } from 'date-fns'
import { AlertTriangle, CheckCircle2, Clock, Package, TrendingUp, AlertCircle, Download, FileJson, FileSpreadsheet, Archive } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useProject } from '@/contexts/project-context'

export default function AnalyticsPage() {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const { selectedProjectId } = useProject()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [archiving, setArchiving] = useState(false)

  // Redirect if no project selected
  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === 'all') {
      router.push('/projects')
    }
  }, [selectedProjectId, router])

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProjectId || selectedProjectId === 'all') return
      
      try {
        const res = await fetch(`/api/tasks?project_id=${selectedProjectId}&archived=false`)
        const data = await res.json()
        setAllTasks(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching tasks:', error)
        setAllTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [selectedProjectId])

  const tasks = useMemo(() => {
    return allTasks.filter(t => t.project_id === selectedProjectId)
  }, [allTasks, selectedProjectId])

  const handleArchiveOldTasks = async () => {
    setArchiving(true)
    try {
      const res = await fetch('/api/tasks/archive-old', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        // Refresh tasks
        const tasksRes = await fetch('/api/tasks?archived=false')
        const tasksData = await tasksRes.json()
        setAllTasks(Array.isArray(tasksData) ? tasksData : [])
      }
    } catch (error) {
      console.error('Error archiving old tasks:', error)
      alert('Failed to archive old tasks')
    } finally {
      setArchiving(false)
    }
  }

  const exportAsJSON = () => {
    const filename = `anthra-${tasks[0]?.project?.name || 'project'}-${format(new Date(), 'yyyy-MM-dd')}.json`
    
    const dataStr = JSON.stringify(tasks, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportAsCSV = () => {
    const headers = ['Title', 'Description', 'Status', 'Priority', 'Project', 'Start Date', 'Due Date', 'Estimated Hours', 'Created', 'Updated']
    const rows = tasks.map(task => [
      task.title,
      task.description || '',
      task.status,
      task.priority,
      task.project?.name || '',
      task.start_date ? format(new Date(task.start_date), 'yyyy-MM-dd') : '',
      task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
      task.estimated_hours || '',
      format(new Date(task.created_at), 'yyyy-MM-dd'),
      format(new Date(task.updated_at), 'yyyy-MM-dd'),
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const filename = `anthra-${tasks[0]?.project?.name || 'project'}-${format(new Date(), 'yyyy-MM-dd')}.csv`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(6)].map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Analytics Dashboard</h1>
        <EmptyState
          icon={Package}
          title="No Data Yet"
          description="Complete some tasks to see insights and analytics."
        />
      </div>
    )
  }

  // Calculate metrics
  const statusCounts = {
    backlog: tasks.filter(t => t.status === 'backlog').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  const priorityCounts = {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  }

  const projectBreakdown = tasks.reduce((acc, task) => {
    const projectKey = task.project?.id || 'no-project'
    const projectName = task.project?.name || 'No Project'
    const projectIcon = task.project?.icon || ''
    const projectColor = task.project?.color || '#6b7280'
    
    if (!acc[projectKey]) {
      acc[projectKey] = { 
        name: projectName, 
        icon: projectIcon,
        color: projectColor,
        total: 0, 
        done: 0, 
        hours: 0 
      }
    }
    acc[projectKey].total++
    if (task.status === 'done') acc[projectKey].done++
    acc[projectKey].hours += task.estimated_hours || 0
    return acc
  }, {} as Record<string, { name: string; icon: string; color: string; total: number; done: number; hours: number }>)

  const totalHours = tasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
  const hoursBacklog = tasks.filter(t => t.status === 'backlog').reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
  const hoursInProgress = tasks.filter(t => t.status === 'in-progress').reduce((sum, t) => sum + (t.estimated_hours || 0), 0)
  const hoursDone = tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.estimated_hours || 0), 0)

  const today = new Date()
  const overdueTasks = tasks.filter(t => t.due_date && isBefore(new Date(t.due_date), today) && t.status !== 'done')
  const dueSoonTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    const dueDate = new Date(t.due_date)
    return isAfter(dueDate, today) && differenceInDays(dueDate, today) <= 7
  })
  const noDueDateTasks = tasks.filter(t => !t.due_date && t.status !== 'done')
  const noEstimateTasks = tasks.filter(t => !t.estimated_hours && t.status !== 'done')

  // New metrics for advanced features
  const recurringTasks = tasks.filter(t => t.is_recurring)
  const recurringCompletionRate = recurringTasks.length > 0
    ? Math.round((recurringTasks.filter(t => t.status === 'done').length / recurringTasks.length) * 100)
    : 0

  const tasksWithSubtasks = tasks.filter(t => t._count?.subtasks && t._count.subtasks > 0)
  const avgSubtasksPerTask = tasksWithSubtasks.length > 0
    ? (tasksWithSubtasks.reduce((sum, t) => sum + (t._count?.subtasks || 0), 0) / tasksWithSubtasks.length).toFixed(1)
    : 0

  const blockedTasks = tasks.filter(t =>
    t.dependencies?.some((dep: any) => dep.depends_on_task?.status !== 'done')
  )

  const tasksWithDependencies = tasks.filter(t => t.dependencies && t.dependencies.length > 0)
  const maxDependencyChainDepth = tasksWithDependencies.length > 0
    ? Math.max(...tasksWithDependencies.map(t => t.dependencies?.length || 0))
    : 0

  // Calculate velocity (tasks completed in last 4 weeks)
  const last4Weeks = Array.from({ length: 4 }, (_, i) => {
    const weekStart = startOfWeek(subDays(today, i * 7))
    const weekEnd = endOfWeek(weekStart)
    const completed = tasks.filter(t => {
      const updated = new Date(t.updated_at)
      return t.status === 'done' && isAfter(updated, weekStart) && isBefore(updated, weekEnd)
    }).length
    return {
      week: format(weekStart, 'MMM dd'),
      completed
    }
  }).reverse()

  const longestInProgress = tasks
    .filter(t => t.status === 'in-progress')
    .map(t => ({
      ...t,
      days: differenceInDays(today, new Date(t.updated_at))
    }))
    .sort((a, b) => b.days - a.days)
    .slice(0, 5)

  // Chart data - Plane-inspired colors
  const statusData = [
    { name: 'Backlog', count: statusCounts.backlog, fill: '#64748b' },  // slate-500
    { name: 'To Do', count: statusCounts.todo, fill: '#3b82f6' },       // blue-500
    { name: 'In Progress', count: statusCounts['in-progress'], fill: '#a855f7' }, // purple-500
    { name: 'Review', count: statusCounts.review, fill: '#f97316' },    // orange-500
    { name: 'Done', count: statusCounts.done, fill: '#10b981' },        // emerald-500
  ]

  const priorityData = [
    { name: 'High', count: priorityCounts.high, fill: '#f43f5e' },      // rose-500
    { name: 'Medium', count: priorityCounts.medium, fill: '#f59e0b' },  // amber-500
    { name: 'Low', count: priorityCounts.low, fill: '#0ea5e9' },        // sky-500
  ]

  const projectData = Object.entries(projectBreakdown).map(([key, data]) => ({
    project: data.name,
    icon: data.icon,
    color: data.color,
    total: data.total,
    done: data.done,
    completion: data.total > 0 ? Math.round((data.done / data.total) * 100) : 0,
    hours: data.hours,
  })).sort((a, b) => b.total - a.total)

  const hoursData = [
    { name: 'Backlog', hours: hoursBacklog, fill: '#6b7280' },
    { name: 'To Do', hours: statusCounts.todo > 0 ? (totalHours - hoursBacklog - hoursInProgress - hoursDone) / statusCounts.todo * statusCounts.todo : 0, fill: '#3b82f6' },
    { name: 'In Progress', hours: hoursInProgress, fill: '#a855f7' },
    { name: 'Done', hours: hoursDone, fill: '#22c55e' },
  ]

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Insights and metrics for this project
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              {tasks.length} Total Tasks
            </Badge>
            <Badge variant="outline" className="text-sm bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              {statusCounts.done} Completed
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleArchiveOldTasks} disabled={archiving}>
              <Archive className="h-4 w-4 mr-2" />
              {archiving ? 'Archiving...' : 'Archive Old'}
            </Button>
            <Button size="sm" variant="outline" onClick={exportAsJSON}>
              <FileJson className="h-4 w-4 mr-2" />
              JSON
            </Button>
            <Button size="sm" variant="outline" onClick={exportAsCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Grid Layout - 2 rows of 4 cards for symmetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Quick Stats - 4 cards in first row */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {tasks.length > 0 ? Math.round((statusCounts.done / tasks.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusCounts.done} of {tasks.length} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {statusCounts['in-progress']}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated effort
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blocked Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">
              {blockedTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Waiting on dependencies
            </p>
          </CardContent>
        </Card>

        {/* Advanced Metrics - 4 cards in second row */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recurring Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {recurringTasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {recurringCompletionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Subtasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {tasksWithSubtasks.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {avgSubtasksPerTask} per parent task
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dependencies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {tasksWithDependencies.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Max depth: {maxDependencyChainDepth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {last4Weeks[last4Weeks.length - 1]?.completed || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasks this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts - Full width on mobile, 2 cols on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Tasks across workflow stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Breakdown</CardTitle>
            <CardDescription>Task distribution by priority</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Velocity Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Velocity Trend
          </CardTitle>
          <CardDescription>Tasks completed per week (last 4 weeks)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last4Weeks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={3} dot={{ fill: '#22c55e', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Project Breakdown */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Project Breakdown</CardTitle>
          <CardDescription>Tasks and completion rate by project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projectData.map((project) => (
              <div key={project.project} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{project.icon}</span>
                    <span className="font-medium">{project.project}</span>
                    <Badge variant="outline" className="text-xs">{project.total} tasks</Badge>
                    {project.hours > 0 && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.hours.toFixed(1)}h
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold">{project.completion}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ 
                      width: `${project.completion}%`,
                      backgroundColor: project.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hours Distribution */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Time Distribution</CardTitle>
          <CardDescription>Estimated hours by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hoursData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Bar dataKey="hours" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Health Metrics - Full width on mobile, 2 cols on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overdue tasks</span>
              <Badge variant={overdueTasks.length > 0 ? "destructive" : "outline"}>
                {overdueTasks.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Due within 7 days</span>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                {dueSoonTasks.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">No due date</span>
              <Badge variant="outline">{noDueDateTasks.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">No estimate</span>
              <Badge variant="outline">{noEstimateTasks.length}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Longest In Progress
            </CardTitle>
            <CardDescription>Tasks stuck in development</CardDescription>
          </CardHeader>
          <CardContent>
            {longestInProgress.length > 0 ? (
              <div className="space-y-3">
                {longestInProgress.map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-2">
                    <span className="text-sm line-clamp-1 flex-1">{task.title}</span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {task.days}d
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks in progress</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      {dueSoonTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Upcoming Deadlines (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dueSoonTasks.slice(0, 10).map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm">{task.title}</span>
                    {task.project && (
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{
                          borderColor: task.project.color + '40',
                          backgroundColor: task.project.color + '10',
                          color: task.project.color,
                        }}
                      >
                        {task.project.icon} {task.project.name}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {task.due_date && format(new Date(task.due_date), 'MMM dd')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
