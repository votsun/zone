'use client'

import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { CheckCircle2 } from 'lucide-react'

interface MicroRewardProps {
  type: 'step' | 'task'
}

export function MicroReward({ type }: MicroRewardProps) {
  useEffect(() => {
    if (type === 'task') {
      // Big celebration for finishing the whole thing
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const interval: ReturnType<typeof setInterval> = setInterval(function() {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) return clearInterval(interval)

        const particleCount = 50 * (timeLeft / duration)
        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } })
      }, 250)
    } else {
      // Mini burst for just one subtask
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#3b82f6'] // Match your theme colors
      })
    }
  }, [type])

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in zoom-in duration-500">
      <div className="relative">
        <CheckCircle2 className="h-20 w-20 text-green-500" />
        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
      </div>
      <h3 className="text-2xl font-bold text-center">
        {type === 'task' ? 'Incredible Job!' : 'Step Completed!'}
      </h3>
      <p className="text-muted-foreground">You&apos;re building momentum.</p>
    </div>
  )
}
