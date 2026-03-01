'use client'

import { useCallback, useEffect, useState } from 'react'
import { CreateTaskInput, Task, UpdateTaskInput } from '@/types/task'

interface UseTasksResult {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createTask: (input: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
}

async function readError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    return data.error || 'Request failed'
  } catch {
    return 'Request failed'
  }
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const response = await fetch('/api/tasks', { method: 'GET' })
      if (!response.ok) {
        throw new Error(await readError(response))
      }
      const data = (await response.json()) as Task[]
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createTask = useCallback(async (input: CreateTaskInput) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        throw new Error(await readError(response))
      }
      const created = (await response.json()) as Task
      setError(null)
      setTasks((prev) => [created, ...prev])
      return created
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task'
      setError(message)
      throw err
    }
  }, [])

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput) => {
    let previousTask: Task | undefined
    setTasks((prev) => {
      previousTask = prev.find((task) => task.id === id)
      if (!previousTask) return prev

      return prev.map((task) =>
        task.id === id
          ? {
              ...task,
              ...input,
            }
          : task
      )
    })

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        throw new Error(await readError(response))
      }
      const updated = (await response.json()) as Task
      setError(null)
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id
            ? {
                ...task,
                ...updated,
                micro_steps: updated.micro_steps ?? task.micro_steps,
              }
            : task
        )
      )
      return updated
    } catch (err) {
      if (previousTask) {
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? previousTask! : task))
        )
      }
      const message = err instanceof Error ? err.message : 'Failed to update task'
      setError(message)
      throw err
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    let previousTasks: Task[] | null = null
    setTasks((prev) => {
      previousTasks = prev
      return prev.filter((task) => task.id !== id)
    })

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await readError(response))
      }
      setError(null)
    } catch (err) {
      if (previousTasks) {
        setTasks(previousTasks)
      }
      const message = err instanceof Error ? err.message : 'Failed to delete task'
      setError(message)
      throw err
    }
  }, [])

  return {
    tasks,
    isLoading,
    error,
    refresh,
    createTask,
    updateTask,
    deleteTask,
  }
}
