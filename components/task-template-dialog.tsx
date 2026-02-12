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

interface TaskTemplate {
  id?: string
  name: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  estimated_hours?: number
  project_id?: string
}

interface TaskTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: TaskTemplate
  onSave: (template: TaskTemplate) => void
}

export function TaskTemplateDialog({ open, onOpenChange, template, onSave }: TaskTemplateDialogProps) {
  const { selectedProjectId } = useProject()
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState<TaskTemplate>({
    name: '',
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: undefined,
    project_id: selectedProjectId !== 'all' ? selectedProjectId : undefined,
  })

  useEffect(() => {
    if (open) {
      fetchProjects()
      if (template) {
        setFormData(template)
      } else {
        setFormData({
          name: '',
          title: '',
          description: '',
          priority: 'medium',
          estimated_hours: undefined,
          project_id: selectedProjectId !== 'all' ? selectedProjectId : undefined,
        })
      }
    }
  }, [open, template, selectedProjectId])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Template' : 'Create Task Template'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name *</Label>
            <Input
              id="template-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Bug Fix"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-title">Task Title *</Label>
            <Input
              id="template-title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
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
            <div className="space-y-2">
              <Label htmlFor="template-hours">Estimated Hours</Label>
              <Input
                id="template-hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours || ''}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
          {selectedProjectId === 'all' && (
            <div className="space-y-2">
              <Label htmlFor="template-project">Project</Label>
              <Select value={formData.project_id || ''} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {template ? 'Update' : 'Create'} Template
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
