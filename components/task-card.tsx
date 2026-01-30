'use client'

import { useDraggable } from '@dnd-kit/core'
import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Clock, Trash2, Calendar, AlertCircle, Lock, ListChecks, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { format, differenceInDays, isBefore, isToday, isTomorrow } from 'date-fns'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  onDelete?: (taskId: string) => void
  onClick?: (task: Task) => void
  isSelected?: boolean
  onSelect?: (taskId: string, selected: boolean) => void
}

export function TaskCard({ task, isDragging = false, onDelete, onClick, isSelected = false, onSelect }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  // Minimalist charcoal priority colors
  const priorityColors = {
    low: 'bg-muted text-muted-foreground border-border',
    medium: 'bg-muted text-foreground border-border',
    high: 'bg-primary/10 text-foreground border-primary/30',
  }

  // Subtle faded priority background tints
  const priorityBackgroundColors = {
    low: 'bg-blue-500/5 border-blue-500/10',
    medium: 'bg-yellow-500/5 border-yellow-500/10',
    high: 'bg-red-500/5 border-red-500/10',
  }

  // Calculate due date status
  const getDueDateInfo = () => {
    if (!task.due_date) return null
    
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const daysUntilDue = differenceInDays(dueDate, today)
    
    if (isBefore(dueDate, today) && !isToday(dueDate)) {
      return {
        text: 'Overdue',
        className: 'bg-red-500 text-white',
        icon: AlertCircle,
        showIcon: true
      }
    } else if (isToday(dueDate)) {
      return {
        text: 'Due today',
        className: 'bg-orange-500 text-white',
        icon: AlertCircle,
        showIcon: true
      }
    } else if (isTomorrow(dueDate)) {
      return {
        text: 'Due tomorrow',
        className: 'bg-orange-500/80 text-white',
        icon: Calendar,
        showIcon: false
      }
    } else if (daysUntilDue <= 3) {
      return {
        text: format(dueDate, 'MMM dd'),
        className: 'bg-yellow-500/30 text-yellow-300',
        icon: Calendar,
        showIcon: false
      }
    } else {
      return {
        text: format(dueDate, 'MMM dd'),
        className: 'text-muted-foreground',
        icon: Calendar,
        showIcon: false
      }
    }
  }

  const dueDateInfo = getDueDateInfo()

  // Check if task is blocked
  const isBlocked = task.dependencies?.some(
    (dep: any) => dep.depends_on_task.status !== 'done'
  )
  const blockedCount = task.dependencies?.filter(
    (dep: any) => dep.depends_on_task.status !== 'done'
  ).length || 0

  // Subtasks info
  const subtaskCount = task._count?.subtasks || task.subtasks?.length || 0
  const completedSubtasks = task.subtasks?.filter((st: any) => st.status === 'done').length || 0

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick?.(task)}
      className={cn(
        "group cursor-grab active:cursor-grabbing transition-all duration-200 ease-out",
        "hover:border-foreground/20 hover:shadow-lg",
        "bg-card border",
        isDragging && "opacity-50 scale-95",
        priorityBackgroundColors[task.priority]
      )}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(task)
        }
      }}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex items-start justify-between gap-2">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect(task.id, e.target.checked)
              }}
              onClick={(e) => e.stopPropagation()}
              className="mt-1 h-4 w-4 border-border text-primary focus:ring-primary cursor-pointer"
            />
          )}
          <CardTitle className="task-title text-sm font-medium line-clamp-2 flex-1 leading-tight">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            {task.estimated_hours && (
              <Badge variant="outline" className="time-estimate text-xs font-mono px-1.5 py-0.5 font-medium">
                {task.estimated_hours}h
              </Badge>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {task.description && (
          <p className="task-description text-xs text-muted-foreground line-clamp-2 leading-normal">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {task.project && (
            <Badge 
              variant="outline" 
              className="text-xs font-medium"
              style={{
                borderColor: task.project.color + '40',
                backgroundColor: task.project.color + '10',
                color: task.project.color,
              }}
            >
              {task.project.name}
            </Badge>
          )}
          <Badge variant="outline" className={cn('priority-badge text-xs font-mono px-1.5 py-0.5', priorityColors[task.priority])}>
            {task.priority.toUpperCase()}
          </Badge>
          {dueDateInfo && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5",
              dueDateInfo.className
            )}>
              {dueDateInfo.showIcon && <dueDateInfo.icon className="h-3 w-3" />}
              <Calendar className={cn("h-3 w-3", dueDateInfo.showIcon && "hidden")} />
              {dueDateInfo.text}
            </div>
          )}
          {isBlocked && (
            <Badge variant="outline" className="text-xs font-medium bg-orange-500/15 text-orange-400 border-orange-500/30">
              <Lock className="h-3 w-3 mr-1" />
              Blocked by {blockedCount}
            </Badge>
          )}
          {subtaskCount > 0 && (
            <Badge variant="outline" className="text-xs font-medium bg-blue-500/15 text-blue-400 border-blue-500/30">
              <ListChecks className="h-3 w-3 mr-1" />
              {completedSubtasks}/{subtaskCount}
            </Badge>
          )}
          {task.is_recurring && (
            <Badge variant="outline" className="text-xs font-medium bg-purple-500/15 text-purple-400 border-purple-500/30">
              <Repeat className="h-3 w-3 mr-1" />
              Recurring
            </Badge>
          )}
          {task.needs_ai_briefing && (
            <Badge variant="outline" className="text-xs font-medium bg-yellow-500/15 text-yellow-400 border-yellow-500/30">
              <AlertCircle className="h-3 w-3 mr-1" />
              Needs AI review
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
