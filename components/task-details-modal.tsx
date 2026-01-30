'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Task, Project } from '@/lib/types'
import { Clock, Calendar, Trash2, Archive, Copy, Edit2, Save, X, Lock, ListChecks, Plus, Repeat, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface TaskDetailsModalProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: () => void
  onTaskDeleted: (taskId: string) => void
}

export function TaskDetailsModal({ task, open, onOpenChange, onTaskUpdated, onTaskDeleted }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<Partial<Task>>({})
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')
  const [showAddDependency, setShowAddDependency] = useState(false)
  const [selectedDependency, setSelectedDependency] = useState('')

  useEffect(() => {
    if (open) {
      fetchProjects()
      fetchAllTasks()
    }
  }, [open])

  useEffect(() => {
    if (task) {
      setFormData(task)
      setIsEditing(false)
    }
  }, [task])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchAllTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setAllTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleAddDependency = async () => {
    if (!selectedDependency) return
    try {
      await fetch('/api/tasks/dependencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: task?.id,
          depends_on_task_id: selectedDependency,
        }),
      })
      setShowAddDependency(false)
      setSelectedDependency('')
      onTaskUpdated()
    } catch (error) {
      console.error('Error adding dependency:', error)
    }
  }

  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      await fetch(`/api/tasks/dependencies?task_id=${task?.id}&depends_on_task_id=${dependencyId}`, {
        method: 'DELETE',
      })
      onTaskUpdated()
    } catch (error) {
      console.error('Error removing dependency:', error)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSubtaskTitle,
          project_id: task?.project_id,
          parent_task_id: task?.id,
          status: 'todo',
        }),
      })
      setNewSubtaskTitle('')
      onTaskUpdated()
    } catch (error) {
      console.error('Error adding subtask:', error)
    }
  }

  const handleToggleSubtask = async (subtaskId: string, currentStatus: string) => {
    try {
      await fetch(`/api/tasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'done' ? 'todo' : 'done',
        }),
      })
      onTaskUpdated()
    } catch (error) {
      console.error('Error toggling subtask:', error)
    }
  }

  const handleAcknowledgeBriefing = async () => {
    try {
      await fetch(`/api/tasks/${task?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needs_ai_briefing: false }),
      })
      onTaskUpdated()
    } catch (error) {
      console.error('Error acknowledging briefing:', error)
    }
  }

  if (!task) return null

  const handleSave = async () => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          priority: formData.priority,
          project_id: formData.project_id,
          start_date: formData.start_date,
          estimated_hours: formData.estimated_hours,
          due_date: formData.due_date,
        }),
      })
      setIsEditing(false)
      onTaskUpdated()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
      })
      onOpenChange(false)
      onTaskDeleted(task.id)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleArchive = async () => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: true }),
      })
      onOpenChange(false)
      onTaskUpdated()
    } catch (error) {
      console.error('Error archiving task:', error)
    }
  }

  const handleDuplicate = async () => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${task.title} (Copy)`,
          description: task.description,
          status: 'backlog',
          priority: task.priority,
          project_id: task.project_id,
          start_date: task.start_date,
          due_date: task.due_date,
          estimated_hours: task.estimated_hours,
        }),
      })
      onTaskUpdated()
    } catch (error) {
      console.error('Error duplicating task:', error)
    }
  }

  // Plane-inspired colors
  const priorityColors = {
    low: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    high: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  }

  const statusColors = {
    backlog: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    todo: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'in-progress': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    review: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    done: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto transition-all duration-200"
        aria-labelledby="task-details-title"
      >
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle id="task-details-title" className="flex-1">
              {isEditing ? (
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-lg font-semibold"
                />
              ) : (
                task.title
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backlog">Backlog</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Badge variant="outline" className={cn('status-badge text-sm font-mono', statusColors[task.status])}>
                  {task.status}
                </Badge>
                <Badge variant="outline" className={cn('text-sm', priorityColors[task.priority])}>
                  {task.priority} priority
                </Badge>
                {task.project && (
                  <Badge
                    variant="outline"
                    className="text-sm"
                    style={{
                      borderColor: task.project.color + '40',
                      backgroundColor: task.project.color + '10',
                      color: task.project.color,
                    }}
                  >
                    {task.project.icon} {task.project.name}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            {isEditing ? (
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                placeholder="Add a description... (Markdown supported)"
              />
            ) : task.description ? (
              <div className="prose prose-sm prose-invert max-w-none bg-muted/30 p-4 rounded-lg">
                <ReactMarkdown>{task.description}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description</p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              {isEditing ? (
                <Select 
                  value={formData.project_id} 
                  onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.icon} {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm">
                  {task.project ? (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor: task.project.color + '40',
                        backgroundColor: task.project.color + '10',
                        color: task.project.color,
                      }}
                    >
                      {task.project.icon} {task.project.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No project</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Estimated Hours</Label>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={formData.estimated_hours || ''}
                  onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || null })}
                  placeholder="0"
                />
              ) : (
                <div className="text-sm flex items-center gap-1">
                  {task.estimated_hours ? (
                    <>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {task.estimated_hours}h
                    </>
                  ) : (
                    <span className="text-muted-foreground">Not estimated</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.start_date ? format(new Date(formData.start_date), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value || null })}
                />
              ) : (
                <div className="text-sm flex items-center gap-1">
                  {task.start_date ? (
                    <>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(task.start_date), 'MMM dd, yyyy')}
                    </>
                  ) : (
                    <span className="text-muted-foreground">No start date</span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Due Date</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formData.due_date ? format(new Date(formData.due_date), 'yyyy-MM-dd') : ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value || null })}
                />
              ) : (
                <div className="text-sm flex items-center gap-1">
                  {task.due_date ? (
                    <>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(task.due_date), 'MMM dd, yyyy')}
                    </>
                  ) : (
                    <span className="text-muted-foreground">No due date</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Briefing Warning */}
          {task.needs_ai_briefing && (
            <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-400">Needs AI Review</h4>
                  <p className="text-xs text-yellow-300/80 mt-1">
                    This recurring task needs to be acknowledged by your AI assistant.
                  </p>
                </div>
                <Button size="sm" onClick={handleAcknowledgeBriefing} variant="outline">
                  Acknowledge
                </Button>
              </div>
            </div>
          )}

          {/* Recurring Task Info */}
          {task.is_recurring && task.recurring_template && (
            <div className="border border-purple-500/30 bg-purple-500/10 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Repeat className="h-4 w-4 text-purple-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-purple-400">Recurring Task</h4>
                  <p className="text-xs text-purple-300/80 mt-1">
                    Generated from template: {task.recurring_template.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dependencies Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Dependencies
              </Label>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddDependency(!showAddDependency)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>

            {showAddDependency && (
              <div className="flex gap-2">
                <Select value={selectedDependency} onValueChange={setSelectedDependency}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allTasks
                      .filter((t) => t.id !== task.id && !task.dependencies?.some((d: any) => d.depends_on_task_id === t.id))
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleAddDependency}>Add</Button>
              </div>
            )}

            {task.dependencies && task.dependencies.length > 0 ? (
              <div className="space-y-2">
                {task.dependencies.map((dep: any) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded border"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          dep.depends_on_task.status === 'done'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        )}
                      >
                        {dep.depends_on_task.status}
                      </Badge>
                      <span className="text-sm">{dep.depends_on_task.title}</span>
                    </div>
                    {!isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveDependency(dep.depends_on_task_id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No dependencies</p>
            )}

            {task.blocking_tasks && task.blocking_tasks.length > 0 && (
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground">This task blocks:</Label>
                <div className="space-y-1 mt-2">
                  {task.blocking_tasks.map((bt: any) => (
                    <div key={bt.id} className="text-sm text-muted-foreground">
                      • {bt.task.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Subtasks
                {task.subtasks && task.subtasks.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {task.subtasks.filter((st: any) => st.status === 'done').length}/{task.subtasks.length}
                  </Badge>
                )}
              </Label>
            </div>

            {!isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubtask()
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddSubtask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {task.subtasks && task.subtasks.length > 0 ? (
              <div className="space-y-2">
                {task.subtasks.map((subtask: any) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded border"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.status === 'done'}
                      onChange={() => handleToggleSubtask(subtask.id, subtask.status)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span
                      className={cn(
                        'text-sm flex-1',
                        subtask.status === 'done' && 'line-through text-muted-foreground'
                      )}
                    >
                      {subtask.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {subtask.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No subtasks</p>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Created</span>
              <span>{format(new Date(task.created_at), 'MMM dd, yyyy HH:mm')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last updated</span>
              <span>{format(new Date(task.updated_at), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="border-t pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button size="sm" variant="outline" onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
