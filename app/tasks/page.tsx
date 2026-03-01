'use client'

import { useState } from 'react'
import { TaskInput } from '@/components/tasks/TaskInput'
import { TaskCard } from '@/components/tasks/TaskCard'
import { useTasks } from '@/hooks/useTasks'
import { CreateTaskInput } from '@/types/task'

export default function TasksPage() {
  const { tasks, isLoading, error, createTask } = useTasks()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTask = async (payload: CreateTaskInput) => {
    setIsCreating(true)
    try {
      await createTask({
        title: payload.title,
        category: payload.category || 'neutral',
        priority: payload.priority || 'medium',
        energy_level: payload.energy_level || 'medium',
        deadline: payload.deadline || null,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <TaskInput onSubmit={handleCreateTask} isLoading={isCreating} />

      <section className="max-w-2xl mx-auto space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!isLoading && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks yet. Add your first task above.</p>
        )}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </section>
    </main>
  )
}
