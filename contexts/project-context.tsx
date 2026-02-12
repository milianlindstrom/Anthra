'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const STORAGE_KEY = 'anthra-selected-project-id'

interface ProjectContextType {
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [selectedProjectId, setSelectedProjectIdState] = useState<string>('')

  useEffect(() => {
    // Load persisted project selection on mount
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setSelectedProjectIdState(saved)
    }
  }, [])

  const setSelectedProjectId = (id: string) => {
    setSelectedProjectIdState(id)
    // Persist to localStorage (only if not empty)
    if (id && id !== 'all') {
      localStorage.setItem(STORAGE_KEY, id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
