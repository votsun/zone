'use client'

import React from 'react'
import { MicroStep } from '@/types/task'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface MicroStepCardProps {
  step: MicroStep
  stepNumber: number
  totalSteps: number
  onComplete: (stepId: string) => void
}

export function MicroStepCard({ step, stepNumber, totalSteps, onComplete }: MicroStepCardProps) {
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
      <CardFooter>
        <Button 
          size="lg" 
          className="w-full text-lg h-14 transition-all hover:scale-[1.02] active:scale-[0.98]" 
          onClick={() => onComplete(step.id)}
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Done, what's next?
        </Button>
      </CardFooter>
    </Card>
  )
}