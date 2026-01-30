'use client'

import { useDroppable } from '@dnd-kit/core'
import { Task } from '@/lib/types'
import { TaskCard } from './task-card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { Archive } from 'lucide-react'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onDeleteTask: (taskId: string) => void
  onTaskClick?: (task: Task) => void
  accentColor?: 'gray' | 'blue' | 'purple' | 'orange' | 'green'
  selectedTaskIds?: Set<string>
  onTaskSelect?: (taskId: string, selected: boolean) => void
  showArchivedToggle?: boolean
  showArchived?: boolean
  onToggleArchived?: (show: boolean) => void
  onArchiveTask?: (taskId: string) => void
  onUnarchiveTask?: (taskId: string) => void
  onBulkArchive?: () => void
}

// Minimalist charcoal status colors
const accentColorClasses = {
  gray: {
    border: 'border-border',
    bg: 'bg-muted/20',
    badge: 'bg-muted text-muted-foreground border-border',
    header: 'text-muted-foreground'
  },
  blue: {
    border: 'border-border',
    bg: 'bg-muted/20',
    badge: 'bg-muted text-muted-foreground border-border',
    header: 'text-muted-foreground'
  },
  purple: {
    border: 'border-border',
    bg: 'bg-muted/20',
    badge: 'bg-muted text-muted-foreground border-border',
    header: 'text-muted-foreground'
  },
  orange: {
    border: 'border-border',
    bg: 'bg-muted/20',
    badge: 'bg-muted text-muted-foreground border-border',
    header: 'text-muted-foreground'
  },
  green: {
    border: 'border-border',
    bg: 'bg-muted/20',
    badge: 'bg-muted text-muted-foreground border-border',
    header: 'text-muted-foreground'
  },
}

export function KanbanColumn({ 
  id, 
  title, 
  tasks, 
  onDeleteTask, 
  onTaskClick, 
  accentColor = 'gray', 
  selectedTaskIds, 
  onTaskSelect,
  showArchivedToggle = false,
  showArchived = false,
  onToggleArchived,
  onArchiveTask,
  onUnarchiveTask,
  onBulkArchive
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const colors = accentColorClasses[accentColor]
  const nonArchivedDoneTasks = id === 'done' ? tasks.filter(t => !t.archived) : []
  const hasNonArchivedDoneTasks = nonArchivedDoneTasks.length > 0

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 md:gap-4 p-3 md:p-4 border min-h-[400px] md:min-h-[500px] transition-all duration-200 w-full",
        "bg-card",
        isOver ? `${colors.border} ${colors.bg} border-2` : "border-border"
      )}
    >
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center gap-2 flex-1">
          <h2 className={cn("column-header text-xs font-medium tracking-wider uppercase", colors.header)}>
            {title}
          </h2>
          {showArchivedToggle && onToggleArchived && (
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => onToggleArchived(e.target.checked)}
                className="h-3 w-3 border-border text-primary focus:ring-primary cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <span>Show archived</span>
            </label>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showArchivedToggle && onBulkArchive && hasNonArchivedDoneTasks && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onBulkArchive()
              }}
              title="Archive all non-archived Done tasks"
            >
              <Archive className="h-3 w-3 mr-1" />
              Archive All
            </Button>
          )}
          <Badge variant="secondary" className={cn("text-xs font-mono h-5 min-w-[24px] justify-center", colors.badge)}>
            {tasks.length}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12 md:py-16 text-xs text-muted-foreground/40 font-light transition-opacity duration-200">
            {id === 'backlog' && 'No tasks in backlog'}
            {id === 'todo' && 'No tasks to do'}
            {id === 'in-progress' && 'Nothing in progress'}
            {id === 'review' && 'Nothing to review'}
            {id === 'done' && 'No completed tasks'}
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDelete={onDeleteTask} 
              onClick={onTaskClick}
              isSelected={selectedTaskIds?.has(task.id) || false}
              onSelect={onTaskSelect}
              showArchiveButton={id === 'done'}
              onArchive={onArchiveTask}
              onUnarchive={onUnarchiveTask}
            />
          ))
        )}
      </div>
    </div>
  )
}
