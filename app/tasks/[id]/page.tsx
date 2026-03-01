'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Task } from '@/types/task'
import { TaskBreakdown } from '@/components/tasks/TaskBreakdown'
import { FocusBlock } from '@/components/focus/FocusBlock'
import { MicroReward } from '@/components/focus/MicroReward'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type ViewState = 'breakdown' | 'focus' | 'reward'

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const taskIdParam = params.id
  const taskId = Array.isArray(taskIdParam) ? taskIdParam[0] : taskIdParam

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [viewState, setViewState] = useState<ViewState>('breakdown')
  const [rewardType, setRewardType] = useState<'step' | 'task'>('step')
  const [isCompletingStep, setIsCompletingStep] = useState(false)
  const [isCompletingTask, setIsCompletingTask] = useState(false)
  const [isSkippingStep, setIsSkippingStep] = useState(false)
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(true)

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setLoadError('Missing task id in URL')
      setTask(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setLoadError(null)

    const response = await fetch(`/api/tasks/${taskId}`)
    if (!response.ok) {
      try {
        const body = (await response.json()) as { error?: string }
        setLoadError(body.error || `Request failed (${response.status})`)
      } catch {
        setLoadError(`Request failed (${response.status})`)
      }
      setTask(null)
      setLoading(false)
      return
    }

    const data = (await response.json()) as Task
    setTask(data)
    setLoading(false)
  }, [taskId])

  const generateSubtasks = useCallback(async () => {
    if (!taskId || !task) return
    setGenerateError(null)
    setIsGenerating(true)

    try {
      const response = await fetch('/api/tasks/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          energyLevel: task.energy_level || 'medium',
        }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || `Failed to generate steps (${response.status})`)
      }

      await fetchTask()
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : 'Failed to generate subtasks.'
      )
    } finally {
      setIsGenerating(false)
    }
  }, [taskId, task, fetchTask])

  useEffect(() => {
    void fetchTask()
  }, [fetchTask])

  useEffect(() => {
    if (!task || isGenerating || generateError || !autoGenerateEnabled) return
    const hasSteps = (task.micro_steps?.length || 0) > 0
    if (!hasSteps) {
      void generateSubtasks()
    }
  }, [task, isGenerating, generateError, generateSubtasks, autoGenerateEnabled])

  const handleCompleteStep = async (stepId: string) => {
    if (!task || isCompletingStep || isCompletingTask || isSkippingStep) return

    const previousTask = task
    const alreadyComplete = task.micro_steps?.find((step) => step.id === stepId)?.is_complete
    if (alreadyComplete) return

    setGenerateError(null)
    setIsCompletingStep(true)
    setTask((current) => {
      if (!current?.micro_steps) return current
      return {
        ...current,
        micro_steps: current.micro_steps.map((step) =>
          step.id === stepId ? { ...step, is_complete: true } : step
        ),
      }
    })
    setRewardType('step')
    setViewState('reward')

    const response = await fetch(`/api/subtasks/${stepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_complete: true }),
    })
    if (!response.ok) {
      setTask(previousTask)
      setGenerateError('Failed to mark step complete.')
      setViewState('breakdown')
      setIsCompletingStep(false)
      return
    }

    // After reward show, go back to breakdown
    setTimeout(() => {
      setViewState('breakdown')
    }, 2000)
    setIsCompletingStep(false)
  }

  const handleSkipStep = async (stepId: string) => {
    if (!task || isCompletingStep || isCompletingTask || isSkippingStep) return

    const wasAutoGenerateEnabled = autoGenerateEnabled
    const stepExists = task.micro_steps?.some((step) => step.id === stepId)
    if (!stepExists) return

    setGenerateError(null)
    setIsSkippingStep(true)
    setAutoGenerateEnabled(false)
    setTask((current) => {
      if (!current?.micro_steps) return current
      return {
        ...current,
        micro_steps: current.micro_steps.filter((step) => step.id !== stepId),
      }
    })
    setIsSkippingStep(false)

    try {
      const response = await fetch(`/api/subtasks/${stepId}`, {
        method: 'DELETE',
      })

      if (response.ok) return

      setAutoGenerateEnabled(wasAutoGenerateEnabled)
      setGenerateError('Failed to skip step.')
      await fetchTask()
    } catch {
      setAutoGenerateEnabled(wasAutoGenerateEnabled)
      setGenerateError('Failed to skip step.')
      await fetchTask()
    }
  }

  const handleCompleteTask = async (completedTaskId: string) => {
    if (!task || isCompletingTask || isCompletingStep || isSkippingStep) return

    const previousTask = task
    setGenerateError(null)
    setIsCompletingTask(true)
    setTask((current) => (current ? { ...current, is_complete: true } : current))
    setRewardType('task')
    setViewState('reward')

    const response = await fetch(`/api/tasks/${completedTaskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_complete: true }),
    })
    if (!response.ok) {
      setTask(previousTask)
      setGenerateError('Failed to mark task complete.')
      setViewState('breakdown')
      setIsCompletingTask(false)
      return
    }

    // After big celebration, go back to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 4000)
    setIsCompletingTask(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground animate-pulse">Loading your task...</p>
      </div>
    )
  }

  // Not found state
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">{loadError || 'Task not found.'}</p>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    )
  }

  const currentStep = task.micro_steps?.find(s => !s.is_complete)
  const stepIndex = task.micro_steps?.findIndex(s => !s.is_complete) ?? 0
  const totalSteps = task.micro_steps?.length ?? 0

  return (
    <div className="min-h-screen bg-background">

      {/* Reward View */}
      {viewState === 'reward' && (
        <div className="flex items-center justify-center min-h-screen">
          <MicroReward type={rewardType} />
        </div>
      )}

      {/* Breakdown View — List of steps + progress */}
      {viewState === 'breakdown' && (
        <div className="p-4 space-y-4 max-w-md mx-auto">
          <div className="flex items-center gap-2 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          <div className="space-y-1 px-1">
            <h1 className="text-2xl font-bold">{task.title}</h1>
          </div>

          <TaskBreakdown
            task={task}
            onCompleteStep={handleCompleteStep}
            onSkipStep={handleSkipStep}
            onCompleteTask={handleCompleteTask}
            isCompleting={isCompletingStep || isCompletingTask}
            isSkipping={isSkippingStep}
          />

          {(!task.micro_steps || task.micro_steps.length === 0) && (
            <div className="space-y-3">
              {isGenerating && (
                <p className="text-sm text-muted-foreground">Generating subtasks...</p>
              )}
              {generateError && (
                <p className="text-sm text-red-500">{generateError}</p>
              )}
              {!isGenerating && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setAutoGenerateEnabled(true)
                    void generateSubtasks()
                  }}
                >
                  Generate Subtasks
                </Button>
              )}
            </div>
          )}

          {/* Start Focus Mode Button — only shows if there's an incomplete step */}
          {currentStep && (
            <Button
              size="lg"
              className="w-full h-14 text-lg mt-4"
              onClick={() => setViewState('focus')}
            >
              ▶ Start Focus Mode
            </Button>
          )}
        </div>
      )}

      {/* Focus View — Timer + current step */}
      {viewState === 'focus' && currentStep && (
        <FocusBlock
          task={task}
          currentStep={currentStep}
          stepNumber={stepIndex + 1}
          totalSteps={totalSteps}
          onCompleteStep={handleCompleteStep}
          onSkipStep={handleSkipStep}
          onExitFocus={() => setViewState('breakdown')}
          isCompleting={isCompletingStep || isCompletingTask}
          isSkipping={isSkippingStep}
        />
      )}
    </div>
  )
}
