'use client'

import React from 'react'
import { Task, MicroStep } from '@/types/task'
import { VisualTimer } from './VisualTimer'
import { Button } from '@/components/ui/button'
import { ChevronLeft, SkipForward } from 'lucide-react'

interface FocusBlockProps {
  task: Task
  currentStep: MicroStep
  stepNumber: number
  totalSteps: number
  onCompleteStep: (id: string) => void
  onSkipStep: (id: string) => void
  onExitFocus: () => void
  isCompleting?: boolean
  isSkipping?: boolean
}

export function FocusBlock({
  task,
  currentStep,
  stepNumber,
  totalSteps,
  onCompleteStep,
  onSkipStep,
  onExitFocus,
  isCompleting = false,
  isSkipping = false,
}: FocusBlockProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExitFocus} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <div className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Focusing on: {task.title}
        </div>
      </div>

      <div className="grid min-h-[76vh] w-full grid-cols-1 items-stretch gap-4 transition-all duration-500 ease-out lg:grid-cols-[minmax(420px,1.6fr)_minmax(320px,1fr)]">
        <div>
          <VisualTimer
            key={currentStep.id}
            minutes={currentStep.estimated_minutes}
            title={task.title}
            expanded
            autoStart
            onComplete={() => {
              if (!isCompleting) {
                onCompleteStep(currentStep.id)
              }
            }}
          />
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Subtask {stepNumber} of {totalSteps}
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900">
            {currentStep.description}
          </h2>
          <p className="mt-3 text-sm text-slate-500">~{currentStep.estimated_minutes} minute focus block</p>

          <div className="mt-6 flex w-full gap-2">
            <Button
              size="lg"
              className="h-12 min-w-0 flex-1 rounded-full text-base"
              onClick={() => onCompleteStep(currentStep.id)}
              disabled={isCompleting || isSkipping}
            >
              {isCompleting ? 'Saving...' : "Done, what's next?"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 shrink-0 rounded-full px-4"
              onClick={() => onSkipStep(currentStep.id)}
              disabled={isCompleting || isSkipping}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              {isSkipping ? 'Skipping...' : 'Skip'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
