'use client'

import { useEffect, useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Task, TaskStatus, Project } from '@/lib/types'
import { KanbanColumn } from '@/components/kanban-column'
import { TaskCard } from '@/components/task-card'
import { Button } from '@/components/ui/button'
import { useProject } from '@/contexts/project-context'
import { Badge } from '@/components/ui/badge'
import { Plus, X, CheckSquare, Square, Inbox, Layers, Filter } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { KanbanColumnSkeleton } from '@/components/loading-skeleton'
import { NewTaskDialog } from '@/components/new-task-dialog'
import { QuickAddFab } from '@/components/quick-add-fab'
import { TaskDetailsModal } from '@/components/task-details-modal'
import { Confetti } from '@/components/confetti'
import { isToday, isTomorrow, differenceInDays, isBefore } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const { selectedProjectId } = useProject()
  const router = useRouter()

  // Redirect if no project selected
  useEffect(() => {
    if (!selectedProjectId || selectedProjectId === 'all') {
      router.push('/projects')
    }
  }, [selectedProjectId, router])
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number | null>(null)
  const [showArchivedInDone, setShowArchivedInDone] = useState(false)
  const [swimlaneMode, setSwimlaneMode] = useState<'none' | 'priority' | 'project'>('none')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const fetchTasks = useCallback(async () => {
    if (!selectedProjectId || selectedProjectId === 'all') return
    
    setLoading(true)
    try {
      // Fetch non-archived tasks for the selected project, and also fetch archived tasks when toggle is on
      const [normalRes, archivedRes] = await Promise.all([
        fetch(`/api/tasks?project_id=${selectedProjectId}`), // Non-archived tasks
        showArchivedInDone ? fetch(`/api/tasks?project_id=${selectedProjectId}&archived=true`) : Promise.resolve(null)
      ])
      const normalData = await normalRes.json()
      let archivedData: Task[] = []
      if (archivedRes) {
        archivedData = await archivedRes.json()
      }
      
      // Combine non-archived and archived tasks
      const allTasksData = Array.isArray(normalData) ? normalData : []
      const archivedTasksData = Array.isArray(archivedData) ? archivedData : []
      setAllTasks([...allTasksData, ...archivedTasksData])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [showArchivedInDone, selectedProjectId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Keyboard shortcuts (j/k navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault()
        const allTaskCards = tasks.flatMap(colTasks => colTasks)
        if (allTaskCards.length === 0) return

        let newIndex = focusedTaskIndex ?? -1
        if (e.key === 'j') {
          newIndex = newIndex < allTaskCards.length - 1 ? newIndex + 1 : 0
        } else {
          newIndex = newIndex > 0 ? newIndex - 1 : allTaskCards.length - 1
        }

        setFocusedTaskIndex(newIndex)
        const task = allTaskCards[newIndex]
        if (task) {
          setSelectedTask(task)
          setIsDetailsOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tasks, focusedTaskIndex])

  useEffect(() => {
    // Filter tasks when filter selection changes (project is already filtered in fetchTasks)
    let filtered = allTasks.filter(t => t.project_id === selectedProjectId)

    // Apply quick filter
    const today = new Date()
    switch (activeFilter) {
      case 'high-priority':
        filtered = filtered.filter(t => t.priority === 'high')
        break
      case 'due-today':
        filtered = filtered.filter(t => t.due_date && isToday(new Date(t.due_date)))
        break
      case 'due-this-week':
        filtered = filtered.filter(t => {
          if (!t.due_date) return false
          const dueDate = new Date(t.due_date)
          const days = differenceInDays(dueDate, today)
          return days >= 0 && days <= 7
        })
        break
      case 'overdue':
        filtered = filtered.filter(t => {
          if (!t.due_date || t.status === 'done') return false
          return isBefore(new Date(t.due_date), today) && !isToday(new Date(t.due_date))
        })
        break
      case 'no-due-date':
        filtered = filtered.filter(t => !t.due_date && t.status !== 'done')
        break
      default:
        // 'all' - no additional filtering
        break
    }

    setTasks(filtered)
  }, [selectedProjectId, activeFilter, allTasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as TaskStatus

    const task = allTasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    // Trigger confetti if completing a task
    if (newStatus === 'done' && task.status !== 'done') {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 100)
    }

    // Optimistic update BEFORE API call (Phase 4: optimistic updates)
    const previousAllTasks = [...allTasks]
    const previousTasks = [...tasks]
    
    setAllTasks(allTasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ))
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    // Update on server
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        // Revert on error
        setAllTasks(previousAllTasks)
        setTasks(previousTasks)
        // Show error message
        if (errorData.error) {
          alert(errorData.error)
        }
        return
      }
    } catch (error) {
      console.error('Error updating task:', error)
      // Revert on error
      setAllTasks(previousAllTasks)
      setTasks(previousTasks)
      alert('Failed to update task. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev)
      if (selected) {
        newSet.add(taskId)
      } else {
        newSet.delete(taskId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedTaskIds.size === tasks.length) {
      setSelectedTaskIds(new Set())
    } else {
      setSelectedTaskIds(new Set(tasks.map(t => t.id)))
    }
  }

  const handleBulkStatusUpdate = async (newStatus: TaskStatus) => {
    if (selectedTaskIds.size === 0) return

    const taskIdsArray = Array.from(selectedTaskIds)
    const previousAllTasks = [...allTasks]
    const previousTasks = [...tasks]

    // Optimistic update
    setAllTasks(allTasks.map(t => 
      selectedTaskIds.has(t.id) ? { ...t, status: newStatus } : t
    ))
    setTasks(tasks.map(t => 
      selectedTaskIds.has(t.id) ? { ...t, status: newStatus } : t
    ))

    // Trigger confetti if completing tasks
    if (newStatus === 'done') {
      const completingCount = taskIdsArray.filter(id => {
        const task = allTasks.find(t => t.id === id)
        return task && task.status !== 'done'
      }).length
      if (completingCount > 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 100)
      }
    }

    // Update on server
    try {
      const updatePromises = taskIdsArray.map(taskId =>
        fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        })
      )

      await Promise.all(updatePromises)
      setSelectedTaskIds(new Set())
      fetchTasks() // Refresh to get latest state
    } catch (error) {
      console.error('Error updating tasks:', error)
      // Revert on error
      setAllTasks(previousAllTasks)
      setTasks(previousTasks)
    }
  }

  const handleArchiveTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      })
      fetchTasks()
    } catch (error) {
      console.error('Error archiving task:', error)
    }
  }

  const handleUnarchiveTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: false }),
      })
      fetchTasks()
    } catch (error) {
      console.error('Error unarchiving task:', error)
    }
  }

  const backlogTasks = tasks.filter(t => t.status === 'backlog' && !t.archived)
  const todoTasks = tasks.filter(t => t.status === 'todo' && !t.archived)
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress' && !t.archived)
  const reviewTasks = tasks.filter(t => t.status === 'review' && !t.archived)
  const doneTasks = tasks.filter(t => {
    if (t.status !== 'done') return false
    // Show archived tasks in Done column only if toggle is enabled
    if (t.archived) return showArchivedInDone
    return true
  })

  const handleBulkArchiveDone = async () => {
    const doneTaskIds = doneTasks.filter(t => !t.archived).map(t => t.id)
    if (doneTaskIds.length === 0) return

    try {
      const updatePromises = doneTaskIds.map(taskId =>
        fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archived: true }),
        })
      )
      await Promise.all(updatePromises)
      fetchTasks()
    } catch (error) {
      console.error('Error bulk archiving tasks:', error)
    }
  }

  const quickFilters = [
    { id: 'all', label: 'All Tasks', count: allTasks.length },
    { id: 'high-priority', label: 'High Priority', count: allTasks.filter(t => t.priority === 'high').length },
    { id: 'due-today', label: 'Due Today', count: allTasks.filter(t => t.due_date && isToday(new Date(t.due_date))).length },
    { id: 'due-this-week', label: 'Due This Week', count: allTasks.filter(t => {
      if (!t.due_date) return false
      const days = differenceInDays(new Date(t.due_date), new Date())
      return days >= 0 && days <= 7
    }).length },
    { id: 'overdue', label: 'Overdue', count: allTasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false
      return isBefore(new Date(t.due_date), new Date()) && !isToday(new Date(t.due_date))
    }).length },
    { id: 'no-due-date', label: 'No Due Date', count: allTasks.filter(t => !t.due_date && t.status !== 'done').length },
  ]

  return (
    <div className="w-full max-w-[2400px] mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <h1 className="text-xl font-medium tracking-tight text-foreground">KANBAN</h1>
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Button
              variant={swimlaneMode === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSwimlaneMode(swimlaneMode === 'priority' ? 'none' : 'priority')}
            >
              <Layers className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Priority</span>
            </Button>
            <Button
              variant={swimlaneMode === 'project' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSwimlaneMode(swimlaneMode === 'project' ? 'none' : 'project')}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Project</span>
            </Button>
          </div>
          <Button onClick={() => setIsNewTaskOpen(true)} size="sm" className="md:size-default">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedTaskIds.size > 0 && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTaskIds(new Set())}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Move to:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('backlog')}
            >
              Backlog
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('todo')}
            >
              To Do
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('in-progress')}
            >
              In Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('review')}
            >
              Review
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkStatusUpdate('done')}
              className=""
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 md:mb-8 pb-4 md:pb-6 border-b overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        {quickFilters.map(filter => (
          <Badge
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent transition-colors px-3 py-1.5"
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
            {filter.count > 0 && (
              <span className="ml-1.5 font-semibold">({filter.count})</span>
            )}
          </Badge>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={handleSelectAll}
        >
          {selectedTaskIds.size === tasks.length && tasks.length > 0 ? (
            <>
              <Square className="h-3 w-3 mr-1" />
              Deselect All
            </>
          ) : (
            <>
              <CheckSquare className="h-3 w-3 mr-1" />
              Select All
            </>
          )}
        </Button>
        {activeFilter !== 'all' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7"
            onClick={() => {
              setActiveFilter('all')
            }}
          >
            <X className="h-3 w-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {loading ? (
        <div className={cn(
          "grid gap-4 md:gap-6 max-w-[2400px] mx-auto",
          swimlaneMode === 'none' 
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
            : "grid-cols-1 lg:grid-cols-5"
        )}>
          {[...Array(5)].map((_, i) => (
            <KanbanColumnSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No Tasks Found"
          description={activeFilter !== 'all' 
            ? `No tasks match your current filter. Try adjusting your filters or create a new task.`
            : "Get started by creating your first task. Click 'New Task' to begin."}
          action={{
            label: 'Create Task',
            onClick: () => setIsNewTaskOpen(true)
          }}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={cn(
            "grid gap-4 md:gap-6 max-w-[2400px] mx-auto",
            swimlaneMode === 'none' 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              : "grid-cols-1 lg:grid-cols-5"
          )}>
          {swimlaneMode === 'priority' ? (
            // Priority swimlanes
            ['high', 'medium', 'low'].map(priority => (
              <div key={priority} className="space-y-2">
                <div className="text-xs font-medium uppercase text-muted-foreground px-2">
                  {priority} Priority
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                  <KanbanColumn
                    id="backlog"
                    title="Backlog"
                    tasks={backlogTasks.filter(t => t.priority === priority)}
                    onDeleteTask={handleDeleteTask}
                    onTaskClick={handleTaskClick}
                    accentColor="gray"
                    selectedTaskIds={selectedTaskIds}
                    onTaskSelect={handleTaskSelect}
                  />
                  <KanbanColumn
                    id="todo"
                    title="To Do"
                    tasks={todoTasks.filter(t => t.priority === priority)}
                    onDeleteTask={handleDeleteTask}
                    onTaskClick={handleTaskClick}
                    accentColor="blue"
                    selectedTaskIds={selectedTaskIds}
                    onTaskSelect={handleTaskSelect}
                  />
                  <KanbanColumn
                    id="in-progress"
                    title="In Progress"
                    tasks={inProgressTasks.filter(t => t.priority === priority)}
                    onDeleteTask={handleDeleteTask}
                    onTaskClick={handleTaskClick}
                    accentColor="purple"
                    selectedTaskIds={selectedTaskIds}
                    onTaskSelect={handleTaskSelect}
                  />
                  <KanbanColumn
                    id="review"
                    title="Review"
                    tasks={reviewTasks.filter(t => t.priority === priority)}
                    onDeleteTask={handleDeleteTask}
                    onTaskClick={handleTaskClick}
                    accentColor="orange"
                    selectedTaskIds={selectedTaskIds}
                    onTaskSelect={handleTaskSelect}
                  />
                  <KanbanColumn
                    id="done"
                    title="Done"
                    tasks={doneTasks.filter(t => t.priority === priority)}
                    onDeleteTask={handleDeleteTask}
                    onTaskClick={handleTaskClick}
                    accentColor="green"
                    selectedTaskIds={selectedTaskIds}
                    onTaskSelect={handleTaskSelect}
                    showArchivedToggle={priority === 'high'}
                    showArchived={showArchivedInDone}
                    onToggleArchived={setShowArchivedInDone}
                    onArchiveTask={handleArchiveTask}
                    onUnarchiveTask={handleUnarchiveTask}
                    onBulkArchive={handleBulkArchiveDone}
                  />
                </div>
              </div>
            ))
          ) : swimlaneMode === 'project' ? (
            // Project swimlanes - group by project
            (() => {
              const projects = Array.from(new Set(tasks.map(t => t.project_id)))
              return projects.map(projectId => {
                const project = tasks.find(t => t.project_id === projectId)?.project
                return (
                  <div key={projectId} className="space-y-2">
                    <div className="text-xs font-medium uppercase text-muted-foreground px-2 flex items-center gap-2">
                      {project?.icon} {project?.name || 'Unknown Project'}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                      <KanbanColumn
                        id="backlog"
                        title="Backlog"
                        tasks={backlogTasks.filter(t => t.project_id === projectId)}
                        onDeleteTask={handleDeleteTask}
                        onTaskClick={handleTaskClick}
                        accentColor="gray"
                        selectedTaskIds={selectedTaskIds}
                        onTaskSelect={handleTaskSelect}
                      />
                      <KanbanColumn
                        id="todo"
                        title="To Do"
                        tasks={todoTasks.filter(t => t.project_id === projectId)}
                        onDeleteTask={handleDeleteTask}
                        onTaskClick={handleTaskClick}
                        accentColor="blue"
                        selectedTaskIds={selectedTaskIds}
                        onTaskSelect={handleTaskSelect}
                      />
                      <KanbanColumn
                        id="in-progress"
                        title="In Progress"
                        tasks={inProgressTasks.filter(t => t.project_id === projectId)}
                        onDeleteTask={handleDeleteTask}
                        onTaskClick={handleTaskClick}
                        accentColor="purple"
                        selectedTaskIds={selectedTaskIds}
                        onTaskSelect={handleTaskSelect}
                      />
                      <KanbanColumn
                        id="review"
                        title="Review"
                        tasks={reviewTasks.filter(t => t.project_id === projectId)}
                        onDeleteTask={handleDeleteTask}
                        onTaskClick={handleTaskClick}
                        accentColor="orange"
                        selectedTaskIds={selectedTaskIds}
                        onTaskSelect={handleTaskSelect}
                      />
                      <KanbanColumn
                        id="done"
                        title="Done"
                        tasks={doneTasks.filter(t => t.project_id === projectId)}
                        onDeleteTask={handleDeleteTask}
                        onTaskClick={handleTaskClick}
                        accentColor="green"
                        selectedTaskIds={selectedTaskIds}
                        onTaskSelect={handleTaskSelect}
                        showArchivedToggle={projectId === projects[0]}
                        showArchived={showArchivedInDone}
                        onToggleArchived={setShowArchivedInDone}
                        onArchiveTask={handleArchiveTask}
                        onUnarchiveTask={handleUnarchiveTask}
                        onBulkArchive={handleBulkArchiveDone}
                      />
                    </div>
                  </div>
                )
              })
            })()
          ) : (
            // Normal view (no swimlanes)
            <>
              <KanbanColumn
                id="backlog"
                title="Backlog"
                tasks={backlogTasks}
                onDeleteTask={handleDeleteTask}
                onTaskClick={handleTaskClick}
                accentColor="gray"
                selectedTaskIds={selectedTaskIds}
                onTaskSelect={handleTaskSelect}
              />
              <KanbanColumn
                id="todo"
                title="To Do"
                tasks={todoTasks}
                onDeleteTask={handleDeleteTask}
                onTaskClick={handleTaskClick}
                accentColor="blue"
                selectedTaskIds={selectedTaskIds}
                onTaskSelect={handleTaskSelect}
              />
              <KanbanColumn
                id="in-progress"
                title="In Progress"
                tasks={inProgressTasks}
                onDeleteTask={handleDeleteTask}
                onTaskClick={handleTaskClick}
                accentColor="purple"
                selectedTaskIds={selectedTaskIds}
                onTaskSelect={handleTaskSelect}
              />
              <KanbanColumn
                id="review"
                title="Review"
                tasks={reviewTasks}
                onDeleteTask={handleDeleteTask}
                onTaskClick={handleTaskClick}
                accentColor="orange"
                selectedTaskIds={selectedTaskIds}
                onTaskSelect={handleTaskSelect}
              />
              <KanbanColumn
                id="done"
                title="Done"
                tasks={doneTasks}
                onDeleteTask={handleDeleteTask}
                onTaskClick={handleTaskClick}
                accentColor="green"
                selectedTaskIds={selectedTaskIds}
                onTaskSelect={handleTaskSelect}
                showArchivedToggle={true}
                showArchived={showArchivedInDone}
                onToggleArchived={setShowArchivedInDone}
                onArchiveTask={handleArchiveTask}
                onUnarchiveTask={handleUnarchiveTask}
                onBulkArchive={handleBulkArchiveDone}
              />
            </>
          )}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
      )}

      <NewTaskDialog
        open={isNewTaskOpen}
        onOpenChange={setIsNewTaskOpen}
        onTaskCreated={fetchTasks}
      />
      
      <TaskDetailsModal
        task={selectedTask}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onTaskUpdated={fetchTasks}
        onTaskDeleted={handleDeleteTask}
      />
      
      <QuickAddFab onTaskCreated={fetchTasks} />
      
      <Confetti trigger={showConfetti} />
    </div>
  )
}
