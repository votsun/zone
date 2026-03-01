'use client'

import React from 'react'
import { Task, MicroStep } from '@/types/task'
import { MicroStepCard } from '../tasks/MicroStepCard'
import { VisualTimer } from './VisualTimer'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

interface FocusBlockProps {
  task: Task
  currentStep: MicroStep
  stepNumber: number
  totalSteps: number
  onCompleteStep: (id: string) => void
  onExitFocus: () => void
}

export function FocusBlock({ 
  task, 
  currentStep, 
  stepNumber, 
  totalSteps, 
  onCompleteStep,
  onExitFocus 
}: FocusBlockProps) {
  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto py-10 px-4 animate-in fade-in duration-500">
      {/* Top Header - Easy Exit */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExitFocus} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
          Focusing on: {task.title}
        </div>
      </div>

      {/* The ONE thing - MicroStepCard */}
      <div className="space-y-4">
        <MicroStepCard 
          step={currentStep} 
          stepNumber={stepNumber} 
          totalSteps={totalSteps} 
          onComplete={onCompleteStep} 
        />
      </div>

      {/* The Time Anchor - VisualTimer */}
      <VisualTimer 
        minutes={currentStep.estimated_minutes} 
        onComplete={() => onCompleteStep(currentStep.id)}
      />

      <p className="text-center text-sm text-muted-foreground italic">
        &quot;Just focus on this one piece. You&apos;ve got this.&quot;
      </p>
    </div>
  )
}
