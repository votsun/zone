'use client'

import React, { useState, useEffect } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface VisualTimerProps {
  minutes: number
  onComplete?: () => void
}

export function VisualTimer({ minutes, onComplete }: VisualTimerProps) {
  const totalSeconds = minutes * 60
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsActive(false)
          onComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, onComplete])

  const toggleTimer = () => setIsActive(!isActive)
  const resetTimer = () => {
    setIsActive(false)
    setSecondsLeft(totalSeconds)
  }

  // Calculate progress for the visual anchor
  const progressPercentage = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100)
  
  // Color-based urgency
  const getProgressColor = () => {
    if (progressPercentage < 50) return 'bg-green-500' // Plenty of time
    if (progressPercentage < 85) return 'bg-yellow-500' // Getting close
    return 'bg-red-500' // Final stretch
  }

  return (
    <div className="w-full space-y-4 p-4 rounded-xl bg-card border shadow-sm">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Focus Block</h3>
          <p className="text-2xl font-bold">
            {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:
            {String(secondsLeft % 60).padStart(2, '0')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={toggleTimer}>
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-1" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* The progress bar overrides the default color to show urgency */}
      <Progress 
        value={progressPercentage} 
        className="h-4" 
        indicatorColor={getProgressColor()}
      />
      
      <p className="text-xs text-center text-muted-foreground mt-2">
        {progressPercentage === 100 ? "Time's up! Great job." : "Keep going, you're doing great!"}
      </p>
    </div>
  )
}
