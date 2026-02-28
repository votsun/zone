import React from 'react'
import { Priority, EnergyLevel } from '@/types/task'
import { Badge } from '@/components/ui/badge'
import { Battery, AlertCircle } from 'lucide-react'

interface PriorityBadgeProps {
  type: 'priority' | 'energy'
  level: Priority | EnergyLevel
}

export function PriorityBadge({ type, level }: PriorityBadgeProps) {
  const isEnergy = type === 'energy'

  // Color mapping based on urgency/energy
  const colorMap = {
    low: isEnergy ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-800 border-slate-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: isEnergy ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200',
  }

  const Icon = isEnergy ? Battery : AlertCircle

  return (
    <Badge variant="outline" className={`capitalize gap-1 px-2 py-0.5 ${colorMap[level]}`}>
      <Icon className="w-3 h-3" />
      {level} {isEnergy ? 'Energy' : 'Priority'}
    </Badge>
  )
}