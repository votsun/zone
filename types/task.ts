export type Priority = 'high' | 'medium' | 'low'

export type EnergyLevel = 'low' | 'medium' | 'high'

export type TaskCategory = 'fun' | 'boring' | 'neutral'

export interface MicroStep {
  id: string
  task_id: string
  description: string
  estimated_minutes: number
  is_complete: boolean
  step_order: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  category: TaskCategory
  priority: Priority
  energy_level: EnergyLevel
  deadline?: string | null
  is_complete: boolean
  created_at: string
  micro_steps?: MicroStep[]
}

export interface CreateTaskInput {
  title: string
  category?: TaskCategory
  priority?: Priority
  energy_level?: EnergyLevel
  deadline?: string | null
}

export interface UpdateTaskInput {
  title?: string
  category?: TaskCategory
  priority?: Priority
  energy_level?: EnergyLevel
  deadline?: string | null
  is_complete?: boolean
}