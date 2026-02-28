export type Priority = 'high' | 'medium' | 'low'
export type EnergyLevel = 'low' | 'medium' | 'high'


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
  priority: Priority
  energy_required: EnergyLevel
  is_complete: boolean
  created_at: string
  micro_steps?: MicroStep[]  // optional — only present when fetched with join
  deadline?: string | null
}

export interface CreateTaskInput {
  title: string
  priority?: Priority
  energy_required?: EnergyLevel
}

export interface UpdateTaskInput {
  title?: string
  priority?: Priority
  energy_required?: EnergyLevel
  is_complete?: boolean
}

export interface Task {
  id: string
  user_id: string
  title: string
  priority: Priority
  energy_required: EnergyLevel
  deadline?: string | null   // ← add this line
  is_complete: boolean
  created_at: string
  micro_steps?: MicroStep[]
}

export interface CreateTaskInput {
  title: string
  priority?: Priority
  energy_required?: EnergyLevel
  deadline?: string | null   // ← add this line
}