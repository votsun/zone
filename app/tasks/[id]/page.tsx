'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewState, setViewState] = useState<ViewState>('breakdown')
  const [rewardType, setRewardType] = useState<'step' | 'task'>('step')

  useEffect(() => {
    fetchTask()
  }, [params.id])

  const fetchTask = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, micro_steps(*)')
      .eq('id', params.id)
      .order('order_index', { referencedTable: 'micro_steps', ascending: true })
      .single()

    if (error) console.error(error)
    else setTask(data)
    setLoading(false)
  }

  const handleCompleteStep = async (stepId: string) => {
    await supabase
      .from('micro_steps')
      .update({ is_complete: true })
      .eq('id', stepId)

    setRewardType('step')
    setViewState('reward')

    // After reward show, refresh task and go back to breakdown
    setTimeout(async () => {
      await fetchTask()
      setViewState('breakdown')
    }, 2000)
  }

  const handleCompleteTask = async (taskId: string) => {
    await supabase
      .from('tasks')
      .update({ is_complete: true })
      .eq('id', taskId)

    setRewardType('task')
    setViewState('reward')

    // After big celebration, go back to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 4000)
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
        <p className="text-muted-foreground">Task not found.</p>
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
            {task.description && (
              <p className="text-muted-foreground text-sm">{task.description}</p>
            )}
          </div>

          <TaskBreakdown
            task={task}
            onCompleteStep={handleCompleteStep}
            onCompleteTask={handleCompleteTask}
          />

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
          onExitFocus={() => setViewState('breakdown')}
        />
      )}
    </div>
  )
}