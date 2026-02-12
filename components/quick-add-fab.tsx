'use client'

import { useState, useEffect } from 'react'
import { Plus, Zap } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Label } from './ui/label'
import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'
import { useProject } from '@/contexts/project-context'

interface QuickAddFabProps {
  onTaskCreated: () => void
}

export function QuickAddFab({ onTaskCreated }: QuickAddFabProps) {
  const { selectedProjectId } = useProject()
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    priority: 'medium',
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Cmd/Ctrl+N for quick add (standard "new" shortcut)
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      fetchProjects()
      // Use selected project from context if available
      if (selectedProjectId !== 'all') {
        setFormData(prev => ({ ...prev, project_id: selectedProjectId }))
      }
    }
  }, [open, selectedProjectId])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
      
      // Use selected project from context, or first project if none selected
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

    if (!formData.title.trim() || !formData.project_id) return

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          status: 'backlog',
          priority: formData.priority,
          project_id: formData.project_id,
        }),
      })

      // Reset form but keep the selected project
      const projectToUse = selectedProjectId !== 'all' ? selectedProjectId : (projects.length > 0 ? projects[0].id : '')
      setFormData({
        title: '',
        project_id: projectToUse,
        priority: 'medium',
      })
      setOpen(false)
      onTaskCreated()
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50",
          "h-14 w-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-refined-lg hover:shadow-refined-xl",
          "transition-spring",
          "hover:scale-110 active:scale-95",
          "flex items-center justify-center",
          "group"
        )}
        aria-label="Quick add task (Ctrl/Cmd + K)"
      >
        <Zap className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Add Task
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add to Backlog • Press Esc to close
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quick-title">Task Title *</Label>
              <Input
                id="quick-title"
                required
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className={cn("grid gap-4", selectedProjectId !== 'all' ? "grid-cols-1" : "grid-cols-2")}>
              {selectedProjectId === 'all' && (
                <div className="space-y-2">
                  <Label htmlFor="quick-project">Project *</Label>
                  <Select 
                    value={formData.project_id} 
                    onValueChange={(value) => setFormData({ ...formData, project_id: value })}
                  >
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

              <div className="space-y-2">
                <Label htmlFor="quick-priority">Priority</Label>
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

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Add to Backlog
              </Button>
            </div>
          </form>

          <div className="border-t pt-3 mt-2">
            <p className="text-xs text-muted-foreground text-center">
              Tip: Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/Cmd + K</kbd> anytime to quick add
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
