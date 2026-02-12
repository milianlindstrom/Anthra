'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { Project } from '@/lib/types'
import { useProject } from '@/contexts/project-context'
import { FileText, Plus } from 'lucide-react'
import { TaskTemplateDialog } from './task-template-dialog'

interface NewTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: () => void
  defaultProjectId?: string
}

export function NewTaskDialog({ open, onOpenChange, onTaskCreated, defaultProjectId }: NewTaskDialogProps) {
  const { selectedProjectId } = useProject()
  const [projects, setProjects] = useState<Project[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'backlog',
    priority: 'medium',
    project_id: '',
    start_date: '',
    estimated_hours: '',
    due_date: '',
  })

  useEffect(() => {
    if (open) {
      fetchProjects()
      loadTemplates()
      // Use selected project from context, or defaultProjectId, or first project
      const projectToUse = selectedProjectId !== 'all' ? selectedProjectId : (defaultProjectId || '')
      if (projectToUse) {
        setFormData(prev => ({ ...prev, project_id: projectToUse }))
      }
    }
  }, [open, defaultProjectId, selectedProjectId])

  const loadTemplates = () => {
    try {
      const stored = localStorage.getItem('taskTemplates')
      if (stored) {
        setTemplates(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const saveTemplate = (template: any) => {
    try {
      const updated = [...templates, { ...template, id: Date.now().toString() }]
      localStorage.setItem('taskTemplates', JSON.stringify(updated))
      setTemplates(updated)
    } catch (error) {
      console.error('Error saving template:', error)
    }
  }

  const applyTemplate = (template: any) => {
    setFormData({
      title: template.title,
      description: template.description || '',
      status: 'backlog',
      priority: template.priority,
      project_id: template.project_id || formData.project_id,
      start_date: '',
      estimated_hours: template.estimated_hours?.toString() || '',
      due_date: '',
    })
  }

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
      
      // If no project selected and there are projects, use context or select the first one
      if (!formData.project_id && data.length > 0) {
        const projectToUse = selectedProjectId !== 'all' ? selectedProjectId : data[0].id
        setFormData(prev => ({ ...prev, project_id: projectToUse }))
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.project_id) {
      alert('Please select a project')
      return
    }

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
          start_date: formData.start_date || null,
          due_date: formData.due_date || null,
        }),
      })

      // Reset form but keep the selected project
      const projectToUse = selectedProjectId !== 'all' ? selectedProjectId : (defaultProjectId || '')
      setFormData({
        title: '',
        description: '',
        status: 'backlog',
        priority: 'medium',
        project_id: projectToUse,
        start_date: '',
        estimated_hours: '',
        due_date: '',
      })
      onOpenChange(false)
      onTaskCreated()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Create New Task</DialogTitle>
              <div className="flex items-center gap-2">
                {templates.length > 0 && (
                  <Select onValueChange={(value) => {
                    const template = templates.find(t => t.id === value)
                    if (template) applyTemplate(template)
                  }}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Use template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTemplateDialogOpen(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Template
                </Button>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProjectId === 'all' && (
            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select 
                value={formData.project_id} 
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_hours">Estimated Hours</Label>
            <Input
              id="estimated_hours"
              type="number"
              step="0.5"
              min="0"
              placeholder="e.g., 4.5"
              value={formData.estimated_hours}
              onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <TaskTemplateDialog
      open={isTemplateDialogOpen}
      onOpenChange={setIsTemplateDialogOpen}
      onSave={saveTemplate}
    />
    </>
  )
}
