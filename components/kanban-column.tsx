'use client'

import { useDroppable } from '@dnd-kit/core'
import { Task } from '@/lib/types'
import { TaskCard } from './task-card'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onDeleteTask: (taskId: string) => void
  onTaskClick?: (task: Task) => void
  accentColor?: 'gray' | 'blue' | 'purple' | 'orange' | 'green'
  selectedTaskIds?: Set<string>
  onTaskSelect?: (taskId: string, selected: boolean) => void
}

// Plane-inspired status colors
const accentColorClasses = {
  gray: {
    border: 'border-slate-500/40',
    bg: 'bg-slate-500/5',
    badge: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    header: 'text-slate-400'
  },
  blue: {
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/5',
    badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    header: 'text-blue-400'
  },
  purple: {
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/5',
    badge: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    header: 'text-purple-400'
  },
  orange: {
    border: 'border-orange-500/40',
    bg: 'bg-orange-500/5',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    header: 'text-orange-400'
  },
  green: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/5',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    header: 'text-emerald-400'
  },
}

export function KanbanColumn({ id, title, tasks, onDeleteTask, onTaskClick, accentColor = 'gray', selectedTaskIds, onTaskSelect }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const colors = accentColorClasses[accentColor]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 p-3 rounded-lg border min-h-[500px] transition-all",
        "bg-muted/30",
        isOver ? `${colors.border} ${colors.bg} border-2` : "border-border/50"
      )}
    >
      <div className="flex items-center justify-between px-1 py-2">
        <h2 className={cn("text-sm font-semibold tracking-tight uppercase", colors.header)}>
          {title}
        </h2>
        <Badge variant="secondary" className={cn("text-xs font-semibold h-5 min-w-[24px] justify-center", colors.badge)}>
          {tasks.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground/60">
            {id === 'backlog' && '💭 Brain dump your ideas'}
            {id === 'todo' && '📋 Ready to start'}
            {id === 'in-progress' && '🚀 Get to work'}
            {id === 'review' && '✨ Keep shipping'}
            {id === 'done' && '💪 Complete tasks'}
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
            />
          ))
        )}
      </div>
    </div>
  )
}
