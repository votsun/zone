'use client'

import React from 'react'
import { MicroStep } from '@/types/task'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, SkipForward } from 'lucide-react'

interface MicroStepCardProps {
  step: MicroStep
  stepNumber: number
  totalSteps: number
  onComplete: (stepId: string) => void
  onSkip: (stepId: string) => void
  isCompleting?: boolean
  isSkipping?: boolean
}

export function MicroStepCard({
  step,
  stepNumber,
  totalSteps,
  onComplete,
  onSkip,
  isCompleting = false,
  isSkipping = false,
}: MicroStepCardProps) {
  return (
    <Card className="shadow-lg border-2 border-primary/10 w-full animate-in slide-in-from-right-4 duration-300">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary/70">
          Step {stepNumber} of {totalSteps}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <h2 className="text-2xl font-semibold leading-tight">
          {step.description}
        </h2>
        
        {/* Visual Anchor for estimated time */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
          ⏱️ ~{step.estimated_minutes} min block
        </div>
      </CardContent>
      <CardFooter className="flex w-full gap-2">
        <Button 
          size="lg" 
          className="h-14 min-w-0 flex-1 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]" 
          onClick={() => onComplete(step.id)}
          disabled={isCompleting || isSkipping}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          {isCompleting ? 'Saving...' : "Done, what's next?"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 shrink-0 px-4"
          onClick={() => onSkip(step.id)}
          disabled={isCompleting || isSkipping}
        >
          <SkipForward className="mr-2 h-5 w-5" />
          {isSkipping ? 'Skipping...' : 'Skip'}
        </Button>
      </CardFooter>
    </Card>
  )
}
