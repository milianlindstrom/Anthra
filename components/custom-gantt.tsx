'use client'

import { useState } from 'react'
import { Task } from '@/lib/types'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { format, differenceInDays, startOfWeek, endOfWeek, eachWeekOfInterval, addDays, isSameWeek } from 'date-fns'
import { cn } from '@/lib/utils'

interface CustomGanttProps {
  tasks: Task[]
}

export function CustomGantt({ tasks: allTasks }: CustomGanttProps) {
  const [draggingTask, setDraggingTask] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState(0)
  // Filter tasks that have either (start_date AND due_date) OR (due_date AND estimated_hours)
  const tasks = allTasks.filter(t => {
    if (t.start_date && t.due_date) return true
    if (t.due_date && t.estimated_hours) return true
    return false
  })

  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground">
          No tasks with date ranges found.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Add start/due dates or due dates with estimated hours to see tasks in the Gantt view.
        </p>
      </Card>
    )
  }

  // Calculate date range using both start_date and due_date
  const allDates: Date[] = []
  tasks.forEach(t => {
    if (t.start_date) {
      allDates.push(new Date(t.start_date))
    }
    if (t.due_date) {
      allDates.push(new Date(t.due_date))
    }
  })
  
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  
  // Extend range by 1 week on each side
  const startDate = startOfWeek(addDays(minDate, -7))
  const endDate = endOfWeek(addDays(maxDate, 7))
  
  const weeks = eachWeekOfInterval({ start: startDate, end: endDate })
  const totalDays = differenceInDays(endDate, startDate)

  // Plane-inspired colors
  const priorityColors = {
    high: { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-100' },
    medium: { bg: 'bg-amber-500', border: 'border-amber-600', text: 'text-amber-100' },
    low: { bg: 'bg-sky-500', border: 'border-sky-600', text: 'text-sky-100' },
  }

  const statusProgress = {
    backlog: 0,
    todo: 25,
    'in-progress': 50,
    review: 75,
    done: 100,
  }

  return (
    <Card className="bg-[#0f1419] border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 font-semibold text-gray-300">Task</div>
          <div className="col-span-9">
            <div className="flex">
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className="flex-1 text-center text-sm font-medium text-gray-400 border-l border-gray-800 px-2 py-1"
                >
                  <div>{format(week, 'MMM dd')}</div>
                  <div className="text-xs text-gray-500">W{format(week, 'w')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="divide-y divide-gray-800">
        {tasks.map((task) => {
          // Use actual start_date if available, otherwise calculate from due_date and estimated_hours
          let taskStart: Date
          let taskEnd: Date
          
          if (task.start_date && task.due_date) {
            taskStart = new Date(task.start_date)
            taskEnd = new Date(task.due_date)
          } else if (task.due_date && task.estimated_hours) {
            taskEnd = new Date(task.due_date)
            const estimatedDays = Math.ceil(task.estimated_hours / 8)
            taskStart = addDays(taskEnd, -estimatedDays)
          } else {
            // Shouldn't happen due to filter, but fallback
            return null
          }
          
          // Calculate position
          const daysFromStart = differenceInDays(taskStart, startDate)
          const taskDuration = differenceInDays(taskEnd, taskStart) || 1
          const leftPercent = (daysFromStart / totalDays) * 100
          const widthPercent = (taskDuration / totalDays) * 100

          const colors = priorityColors[task.priority]
          const progress = statusProgress[task.status]

          return (
            <div key={task.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-slate-900/30 transition-colors">
              {/* Task Info */}
              <div className="col-span-3 space-y-1">
                <div className="text-sm font-medium line-clamp-1">
                  {task.title}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
                  {task.estimated_hours && (
                    <span className="text-xs text-muted-foreground">
                      {task.estimated_hours}h
                    </span>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="col-span-9 relative">
                {/* Week grid */}
                <div className="absolute inset-0 flex">
                  {weeks.map((week, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 border-l border-gray-800",
                        isSameWeek(new Date(), week) && "bg-blue-500/5"
                      )}
                    />
                  ))}
                </div>

                {/* Task bar */}
                <div className="relative h-10 flex items-center">
                  <div
                    className={cn(
                      "absolute h-8 rounded-md border-2 overflow-hidden cursor-move",
                      colors.bg,
                      colors.border,
                      "shadow-lg transition-all hover:shadow-xl hover:scale-105",
                      draggingTask === task.id && "opacity-50 z-20"
                    )}
                    style={{
                      left: `${Math.max(0, leftPercent + (draggingTask === task.id ? dragOffset : 0))}%`,
                      width: `${Math.min(widthPercent, 100 - leftPercent)}%`,
                    }}
                    draggable
                    onDragStart={(e) => {
                      setDraggingTask(task.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDrag={(e) => {
                      if (!e.clientX) return
                      const rect = e.currentTarget.parentElement?.getBoundingClientRect()
                      if (!rect) return
                      const x = e.clientX - rect.left
                      const daysOffset = Math.round((x / rect.width) * totalDays) - daysFromStart
                      setDragOffset((daysOffset / totalDays) * 100)
                    }}
                    onDragEnd={async (e) => {
                      if (draggingTask === task.id && dragOffset !== 0) {
                        const daysOffset = Math.round((dragOffset / 100) * totalDays)
                        const newStartDate = addDays(taskStart, daysOffset)
                        const newDueDate = addDays(taskEnd, daysOffset)
                        
                        try {
                          await fetch(`/api/tasks/${task.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              start_date: format(newStartDate, 'yyyy-MM-dd'),
                              due_date: format(newDueDate, 'yyyy-MM-dd'),
                            }),
                          })
                          // Trigger refresh via custom event
                          window.dispatchEvent(new CustomEvent('taskUpdated'))
                        } catch (error) {
                          console.error('Error updating task dates:', error)
                        }
                      }
                      setDraggingTask(null)
                      setDragOffset(0)
                    }}
                  >
                    {/* Progress overlay */}
                    <div
                      className="absolute inset-0 bg-white/20 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    
                    {/* Task label */}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center px-2",
                      colors.text,
                      "text-xs font-semibold truncate"
                    )}>
                      {task.title}
                    </div>
                  </div>

                  {/* Today marker */}
                  {(() => {
                    const today = new Date()
                    const daysToToday = differenceInDays(today, startDate)
                    const todayPercent = (daysToToday / totalDays) * 100
                    
                    if (todayPercent >= 0 && todayPercent <= 100) {
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10"
                          style={{ left: `${todayPercent}%` }}
                        >
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
