'use client'

import React, { useState } from 'react'
import { Task, MicroStep } from '@/types/task' // Adjust path to where your types are stored
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ChevronRight, Trophy } from 'lucide-react'

interface TaskBreakdownProps {
  task: Task
  onCompleteStep: (stepId: string) => void
  onCompleteTask: (taskId: string) => void
}

export function TaskBreakdown({ task, onCompleteStep, onCompleteTask }: TaskBreakdownProps) {
  // Find the first incomplete step to start, or default to 0
  const initialStep = task.micro_steps?.findIndex(step => !step.is_complete) ?? 0
  const [currentIndex, setCurrentIndex] = useState(initialStep === -1 ? 0 : initialStep)

  if (!task.micro_steps || task.micro_steps.length === 0) {
    return <div>No micro-steps generated yet.</div>
  }

  const steps = task.micro_steps
  const currentStep = steps[currentIndex]
  const completedCount = steps.filter(s => s.is_complete).length
  const totalSteps = steps.length
  const progressPercentage = Math.round((completedCount / totalSteps) * 100)

  // Check if all steps are done
  const isAllComplete = completedCount === totalSteps

  const handleCompleteCurrent = () => {
    // 1. Trigger the callback to update your DB
    onCompleteStep(currentStep.id)
    
    // 2. Move to the next step if available
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // If it was the last step, complete the whole task
      onCompleteTask(task.id)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Visual Time Anchor / Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Task Progress</span>
          <span>{progressPercentage}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      {isAllComplete ? (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20 text-center animate-in fade-in zoom-in duration-300">
          <CardContent className="pt-6 space-y-4 flex flex-col items-center">
            <Trophy className="w-16 h-16 text-yellow-500" />
            <h3 className="text-xl font-bold">You did it!</h3>
            <p className="text-muted-foreground">Task "{task.title}" is complete.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary/70">
              Step {currentIndex + 1} of {totalSteps}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-semibold leading-tight">
              {currentStep.description}
            </h2>
            
            {/* Visual Time Indicator for the specific block */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              ⏱️ ~{currentStep.estimated_minutes} min block
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              size="lg" 
              className="w-full text-lg h-14" 
              onClick={handleCompleteCurrent}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Done, what's next?
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}'use client'

import React, { useState } from 'react'
import { Task, MicroStep } from '@/types/task' // Adjust path to where your types are stored
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, ChevronRight, Trophy } from 'lucide-react'

interface TaskBreakdownProps {
  task: Task
  onCompleteStep: (stepId: string) => void
  onCompleteTask: (taskId: string) => void
}

export function TaskBreakdown({ task, onCompleteStep, onCompleteTask }: TaskBreakdownProps) {
  // Find the first incomplete step to start, or default to 0
  const initialStep = task.micro_steps?.findIndex(step => !step.is_complete) ?? 0
  const [currentIndex, setCurrentIndex] = useState(initialStep === -1 ? 0 : initialStep)

  if (!task.micro_steps || task.micro_steps.length === 0) {
    return <div>No micro-steps generated yet.</div>
  }

  const steps = task.micro_steps
  const currentStep = steps[currentIndex]
  const completedCount = steps.filter(s => s.is_complete).length
  const totalSteps = steps.length
  const progressPercentage = Math.round((completedCount / totalSteps) * 100)

  // Check if all steps are done
  const isAllComplete = completedCount === totalSteps

  const handleCompleteCurrent = () => {
    // 1. Trigger the callback to update your DB
    onCompleteStep(currentStep.id)
    
    // 2. Move to the next step if available
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // If it was the last step, complete the whole task
      onCompleteTask(task.id)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Visual Time Anchor / Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Task Progress</span>
          <span>{progressPercentage}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
      </div>

      {isAllComplete ? (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950/20 text-center animate-in fade-in zoom-in duration-300">
          <CardContent className="pt-6 space-y-4 flex flex-col items-center">
            <Trophy className="w-16 h-16 text-yellow-500" />
            <h3 className="text-xl font-bold">You did it!</h3>
            <p className="text-muted-foreground">Task "{task.title}" is complete.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary/70">
              Step {currentIndex + 1} of {totalSteps}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-semibold leading-tight">
              {currentStep.description}
            </h2>
            
            {/* Visual Time Indicator for the specific block */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              ⏱️ ~{currentStep.estimated_minutes} min block
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              size="lg" 
              className="w-full text-lg h-14" 
              onClick={handleCompleteCurrent}
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Done, what's next?
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}