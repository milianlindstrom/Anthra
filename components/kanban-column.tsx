'use client'

import { useDroppable } from '@dnd-kit/core'
import { Task } from '@/lib/types'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  onDeleteTask: (taskId: string) => void
}

export function KanbanColumn({ id, title, tasks, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-4 p-4 rounded-lg border-2 border-dashed min-h-[500px] transition-colors",
        isOver ? "border-primary bg-accent/50" : "border-border"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  )
}
