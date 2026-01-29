'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  Calendar, 
  BarChart3, 
  FolderOpen, 
  Archive, 
  Settings,
  Repeat,
  ChevronRight,
  Check
} from 'lucide-react'
import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useProject } from '@/contexts/project-context'

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ className, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const { selectedProjectId, setSelectedProjectId } = useProject()
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const navigation = [
    { name: 'Kanban', href: '/kanban', icon: LayoutDashboard },
    { name: 'Gantt', href: '/gantt', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Recurring', href: '/recurring', icon: Repeat },
    { name: 'Archive', href: '/archive', icon: Archive },
  ]

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
    // Navigate to kanban when project changes
    if (pathname !== '/kanban' && pathname !== '/projects') {
      router.push('/kanban')
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <div className={cn(
        "flex flex-col h-screen bg-background border-r transition-transform fixed md:relative z-50 md:z-auto",
        isOpen === false && onClose ? "-translate-x-full md:translate-x-0" : "translate-x-0",
        className
      )}>
      {/* Logo/Header */}
      <div className="p-6 border-b">
        <Link href="/kanban" className="flex items-center gap-3">
          <img 
            src="/ulriklogo.svg" 
            alt="Ulrik" 
            className="h-8 w-8"
          />
          <div className="text-xl font-medium tracking-tight">ULRIK</div>
        </Link>
      </div>

      {/* Projects Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Projects Header */}
          <button
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className="flex items-center justify-between w-full text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Projects</span>
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform",
                isProjectsOpen && "rotate-90"
              )}
            />
          </button>

          {/* Projects List */}
          {isProjectsOpen && (
            <div className="space-y-1">
              {/* All Projects Option */}
              <button
                onClick={() => handleProjectSelect('all')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                  selectedProjectId === 'all'
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <FolderOpen className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left">All Projects</span>
                {selectedProjectId === 'all' && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>

              {/* Individual Projects */}
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                    selectedProjectId === project.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex-1 text-left truncate">{project.name}</span>
                  {project._count?.tasks !== undefined && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      {project._count.tasks}
                    </span>
                  )}
                  {selectedProjectId === project.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </button>
              ))}

              {/* Manage Projects Link */}
              <Link
                href="/projects"
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mt-3"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Projects</span>
              </Link>
            </div>
          )}

          {/* Project Views - Only show when a project is selected */}
          {selectedProjectId !== 'all' && selectedProject && (
            <div className="pt-4 border-t">
              <div className="mb-2 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span className="truncate">{selectedProject.name}</span>
                </div>
              </div>
              <div className="space-y-1 pl-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2  text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* All Projects Views - Show when "All Projects" is selected */}
          {selectedProjectId === 'all' && (
            <div className="pt-4 border-t">
              <div className="mb-2 px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FolderOpen className="h-4 w-4" />
                  <span>All Projects</span>
                </div>
              </div>
              <div className="space-y-1 pl-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2  text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer/Shortcuts */}
      <div className="p-6 border-t space-y-2 text-xs text-muted-foreground/60">
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted text-xs">Ctrl/⌘ F</kbd>
          <span>Search</span>
        </div>
        <div className="flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-muted text-xs">Ctrl/⌘ K</kbd>
          <span>Quick Add</span>
        </div>
      </div>
    </div>
    </>
  )
}
