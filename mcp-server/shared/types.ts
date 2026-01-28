// Shared types between UI and MCP server
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface Project {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string
  archived: boolean
  created_at: string
  updated_at: string
  tasks?: Task[]
  _count?: {
    tasks: number
  }
}

export interface TaskDependency {
  id: string
  task_id: string
  depends_on_task_id: string
  task?: Task
  depends_on_task?: Task
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  project_id: string
  project?: Project
  start_date: string | null
  due_date: string | null
  estimated_hours: number | null
  archived: boolean
  created_at: string
  updated_at: string
  
  // Dependencies
  dependencies?: TaskDependency[]
  blocking_tasks?: TaskDependency[]
  
  // Recurring tasks
  is_recurring: boolean
  recurring_template_id: string | null
  recurring_template?: RecurringTaskTemplate
  recurrence_instance_date: string | null
  needs_ai_briefing: boolean
  
  // Subtasks
  parent_task_id: string | null
  parent_task?: Task
  subtasks?: Task[]
  _count?: {
    subtasks?: number
  }
}

export interface RecurringTaskTemplate {
  id: string
  title: string
  description: string | null
  project_id: string
  priority: TaskPriority
  estimated_hours: number | null
  recurrence_pattern: RecurrencePattern
  recurrence_config: RecurrenceConfig
  active: boolean
  last_generated_at: string | null
  next_generation_at: string
  created_at: string
  updated_at: string
  tasks?: Task[]
}

export interface RecurrenceConfig {
  day_of_week?: number // 0-6 (Sunday-Saturday)
  day_of_month?: number // 1-31
  time?: string // "HH:MM" format
}

export interface ApiKey {
  id: string
  key_hash: string
  name: string
  last_used_at: string | null
  created_at: string
}

// Input types for MCP operations
export interface CreateTaskInput {
  title: string
  description?: string
  project_id: string
  priority?: TaskPriority
  status?: TaskStatus
  start_date?: string
  due_date?: string
  estimated_hours?: number
  parent_task_id?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  project_id?: string
  priority?: TaskPriority
  status?: TaskStatus
  start_date?: string
  due_date?: string
  estimated_hours?: number
  archived?: boolean
  parent_task_id?: string
  needs_ai_briefing?: boolean
}

export interface CreateRecurringTemplateInput {
  title: string
  description?: string
  project_id: string
  priority?: TaskPriority
  estimated_hours?: number
  recurrence_pattern: RecurrencePattern
  recurrence_config: RecurrenceConfig
  active?: boolean
}

export interface UpdateRecurringTemplateInput {
  title?: string
  description?: string
  project_id?: string
  priority?: TaskPriority
  estimated_hours?: number
  recurrence_pattern?: RecurrencePattern
  recurrence_config?: RecurrenceConfig
  active?: boolean
}

export interface CreateProjectInput {
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  color?: string
  icon?: string
  archived?: boolean
}
