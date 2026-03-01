'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VisualTimerProps {
  minutes: number
  title?: string
  onComplete?: () => void
  expanded?: boolean
  autoStart?: boolean
}

export function VisualTimer({
  minutes,
  title = 'Focus Session',
  onComplete,
  expanded = false,
  autoStart = false,
}: VisualTimerProps) {
  const initialTotalSeconds = minutes * 60
  const [totalSeconds, setTotalSeconds] = useState(initialTotalSeconds)
  const [secondsLeft, setSecondsLeft] = useState(initialTotalSeconds)
  const [isActive, setIsActive] = useState(autoStart)
  const [sessionStart] = useState(() => new Date())

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
  const adjustByFiveMinutes = (deltaMinutes: number) => {
    const deltaSeconds = deltaMinutes * 60
    const elapsed = totalSeconds - secondsLeft
    const nextTotal = Math.max(elapsed + 60, totalSeconds + deltaSeconds)
    const nextRemaining = nextTotal - elapsed

    setTotalSeconds(nextTotal)
    setSecondsLeft(nextRemaining)
  }

  const elapsedSeconds = totalSeconds - secondsLeft
  const progress = totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0
  const progressPercentage = Math.round(progress * 100)

  const ring = useMemo(() => {
    const size = expanded ? 320 : 230
    const stroke = expanded ? 16 : 12
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference * (1 - progress)

    return { size, stroke, radius, circumference, dashOffset }
  }, [expanded, progress])

  const formattedTimer = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(
    secondsLeft % 60
  ).padStart(2, '0')}`

  const formatClock = (date: Date) =>
    date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  const sessionEnd = useMemo(
    () => new Date(sessionStart.getTime() + totalSeconds * 1000),
    [sessionStart, totalSeconds]
  )

  return (
    <div
      className={cn(
        'w-full rounded-3xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm transition-all duration-500 ease-out',
        expanded
          ? 'min-h-[68vh] md:p-8 lg:p-10'
          : 'space-y-4'
      )}
    >
      <div className="flex h-full flex-col items-center justify-between gap-6">
        <div className="text-center">
          <h3 className={cn('font-semibold text-slate-900', expanded ? 'text-4xl' : 'text-2xl')}>
            {title}
          </h3>
          <p className={cn('mt-1 text-slate-500', expanded ? 'text-base' : 'text-sm')}>
            {formatClock(sessionStart)} - {formatClock(sessionEnd)}
          </p>
        </div>

        <div className="relative">
          <svg
            width={ring.size}
            height={ring.size}
            viewBox={`0 0 ${ring.size} ${ring.size}`}
            className="drop-shadow-sm transition-all duration-500"
            role="img"
            aria-label={`Session progress ${progressPercentage}%`}
          >
            <circle
              cx={ring.size / 2}
              cy={ring.size / 2}
              r={ring.radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={ring.stroke}
            />
            <circle
              cx={ring.size / 2}
              cy={ring.size / 2}
              r={ring.radius}
              fill="none"
              stroke="#3F2B56"
              strokeWidth={ring.stroke}
              strokeLinecap="round"
              strokeDasharray={ring.circumference}
              strokeDashoffset={ring.dashOffset}
              transform={`rotate(-90 ${ring.size / 2} ${ring.size / 2})`}
              className="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-full bg-[#FFD7BF]/90 text-slate-800 shadow-inner',
                expanded ? 'h-48 w-48' : 'h-36 w-36'
              )}
            >
              <div className={cn('font-semibold', expanded ? 'text-5xl' : 'text-3xl')}>
                {formattedTimer}
              </div>
              <div className={cn('mt-1 font-medium text-slate-600', expanded ? 'text-sm' : 'text-xs')}>
                {Math.ceil(secondsLeft / 60)} mins left
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                {progressPercentage}% done
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => adjustByFiveMinutes(-5)}
            className="h-11 rounded-full px-4 text-base"
            disabled={secondsLeft <= 5 * 60}
            aria-label="Subtract five minutes"
          >
            <Minus className="h-4 w-4" />
            5m
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={toggleTimer}
            className="h-11 rounded-full px-6 text-base"
            aria-label={isActive ? 'Pause timer' : 'Resume timer'}
          >
            {isActive ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            )}
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => adjustByFiveMinutes(5)}
            className="h-11 rounded-full px-4 text-base"
            aria-label="Add five minutes"
          >
            <Plus className="h-4 w-4" />
            5m
          </Button>
        </div>
      </div>
    </div>
  )
}
