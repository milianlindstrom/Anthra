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
  ChevronLeft,
  Check,
  Home,
  Rocket,
  Grid3x3,
  FileText
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
  const [isCollapsed, setIsCollapsed] = useState(false)

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
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Kanban', href: '/kanban', icon: LayoutDashboard },
    { name: 'Sprints', href: '/sprints', icon: Rocket },
    { name: 'Backlog', href: '/backlog', icon: FolderOpen },
    { name: 'Gantt', href: '/gantt', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Recurring', href: '/recurring', icon: Repeat },
    { name: 'Cross-Project', href: '/cross-project', icon: Grid3x3 },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Archive', href: '/archive', icon: Archive },
  ]

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
    // Navigate to kanban when project changes (unless already on projects page)
    if (pathname !== '/projects') {
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
        "flex flex-col h-screen bg-background border-r border-border/80 transition-all duration-300 fixed md:relative z-50 md:z-auto shadow-refined",
        isOpen === false && onClose ? "-translate-x-full md:translate-x-0" : "translate-x-0",
        isCollapsed ? "w-16" : "w-64",
        className
      )}>
      {/* Logo/Header */}
      <div className="p-6 border-b border-border/80 flex items-center justify-between backdrop-blur-sm">
        <Link href="/projects" className={cn("flex items-center gap-3 group", isCollapsed && "justify-center w-full")}>
          <img 
            src="/ulriklogo.svg" 
            alt="Anthra" 
            className="h-8 w-8 shrink-0 dark:invert transition-transform group-hover:scale-105"
          />
          {!isCollapsed && <div className="text-xl font-semibold tracking-tight">ANTHRA</div>}
        </Link>
        {!onClose && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-smooth shrink-0 active:scale-95"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Projects Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Projects Header */}
          <button
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            className={cn(
              "flex items-center justify-between w-full text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Projects" : undefined}
          >
            {!isCollapsed && <span>Projects</span>}
            {!isCollapsed && (
              <ChevronRight 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isProjectsOpen && "rotate-90"
                )}
              />
            )}
            {isCollapsed && (
              <ChevronRight 
                className={cn(
                  "h-4 w-4 transition-transform",
                  isProjectsOpen && "rotate-90"
                )}
              />
            )}
          </button>

          {/* Projects List */}
          {isProjectsOpen && (
            <div className="space-y-1">
              {/* Individual Projects */}
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-smooth active:scale-[0.98] border",
                    isCollapsed && "justify-center",
                    selectedProjectId === project.id
                      ? "bg-primary text-primary-foreground border-primary/50 shadow-refined"
                      : "border-transparent hover:border-border/50 hover:bg-accent text-muted-foreground hover:text-foreground"
                  )}
                  title={isCollapsed ? project.name : undefined}
                >
                  {isCollapsed ? (
                    <span className="text-lg">{project.icon || '📁'}</span>
                  ) : (
                    <>
                      <span className="flex-1 text-left truncate">{project.name}</span>
                      {project._count?.tasks !== undefined && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {project._count.tasks}
                        </span>
                      )}
                      {selectedProjectId === project.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </>
                  )}
                </button>
              ))}

              {/* Manage Projects Link */}
              <Link
                href="/projects"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-smooth mt-3",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? "Manage Projects" : undefined}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>Manage Projects</span>}
              </Link>
            </div>
          )}

          {/* Project Views - Only show when a specific project is selected */}
          {selectedProjectId !== 'all' && selectedProject && (
            <div className="pt-4 border-t">
              {!isCollapsed && (
                <div className="mb-2 px-3 py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="truncate">{selectedProject.name}</span>
                  </div>
                </div>
              )}
              <div className={cn("space-y-1", !isCollapsed && "pl-4")}>
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-smooth border",
                        isCollapsed && "justify-center",
                        isActive
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "text-muted-foreground border-transparent hover:border-border/50 hover:bg-accent hover:text-foreground"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer/Shortcuts */}
      {!isCollapsed && (
        <div className="p-6 border-t space-y-2 text-xs text-muted-foreground/60">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/⌘ K</kbd>
            <span>Search</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl/⌘ N</kbd>
            <span>Quick Add</span>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
