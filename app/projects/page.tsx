'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Archive, ArchiveRestore, FolderOpen } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'

const COLORS = [
  '#1e40af', '#1e3a8a', '#1e293b', '#0f172a', // Dark blues/grays - construction/control panel
  '#ea580c', '#f97316', '#fb923c', '#fdba74', // Safety orange spectrum
  '#06b6d4', '#0891b2', '#0e7490', '#1e40af', // Steel blues
  '#f59e0b', '#d97706', '#b45309', '#92400e', // Caution yellows
]

const ICONS = [
  '📁', '🏗️', '🔧', '📊', '⚙️', '🔩', '📐', '📏',
  '🚧', '🚦', '🚨', '🔆', '💡', '🎯', '🚀', '✨',
  '🔄', '🔗', '📋', '🗂️', '🗃️', '🗄️', '📂', '🗁️',
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: COLORS[0],
    icon: ICONS[0],
  })

  useEffect(() => {
    fetchProjects()
  }, [showArchived])

  const fetchProjects = async () => {
    try {
      // Fetch both active and archived projects, then filter client-side
      const [activeRes, archivedRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/projects?archived=true')
      ])
      const activeData = await activeRes.json()
      const archivedData = await archivedRes.json()
      const allProjects = [
        ...(Array.isArray(activeData) ? activeData : []),
        ...(Array.isArray(archivedData) ? archivedData : [])
      ]
      setProjects(allProjects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setFormData({
        name: project.name,
        description: project.description || '',
        color: project.color,
        icon: project.icon,
      })
    } else {
      setEditingProject(null)
      setFormData({
        name: '',
        description: '',
        color: COLORS[0],
        icon: ICONS[0],
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProject) {
        // Update existing project
        await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        // Create new project
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      setIsDialogOpen(false)
      fetchProjects()
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const handleArchive = async (project: Project) => {
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !project.archived }),
      })
      fetchProjects()
    } catch (error) {
      console.error('Error archiving project:', error)
    }
  }

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This will also delete all associated tasks. This cannot be undone.`)) {
      return
    }

    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const activeProjects = projects.filter(p => !p.archived)
  const archivedProjects = projects.filter(p => p.archived)
  const displayProjects = showArchived ? archivedProjects : activeProjects

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and their tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? (
              <>
                <FolderOpen className="h-4 w-4 mr-2" />
                Show Active
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Show Archived
              </>
            )}
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {displayProjects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={showArchived ? 'No Archived Projects' : 'No Projects Yet'}
          description={showArchived
            ? 'Archive projects to organize completed work'
            : 'Create your first project to get started'}
          action={!showArchived ? {
            label: 'Create Project',
            onClick: () => handleOpenDialog()
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayProjects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg border-l-4",
                project.archived && "opacity-60"
              )}
              style={{
                borderLeftColor: project.color,
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{project.icon}</span>
                    <div>
                      <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
                      {project.description && (
                        <CardDescription className="line-clamp-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {project._count?.tasks || 0} task{project._count?.tasks !== 1 ? 's' : ''}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(project)}
                      title="Edit project"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleArchive(project)}
                      title={project.archived ? 'Restore project' : 'Archive project'}
                    >
                      {project.archived ? (
                        <ArchiveRestore className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project)}
                      className="hover:text-destructive"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My Awesome Project"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this project about?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={cn(
                      "text-2xl p-2 rounded-md hover:bg-accent transition-colors",
                      formData.icon === icon && "bg-accent ring-2 ring-primary"
                    )}
                    onClick={() => setFormData({ ...formData, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "h-10 rounded-md transition-all hover:scale-110",
                      formData.color === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
