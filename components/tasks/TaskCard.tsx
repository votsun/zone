'use client'

import React from 'react'
import { Task } from '@/types/task'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PriorityBadge } from './PriorityBadge'
import { CheckCircle2, Circle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter()

  const stepsCount = task.micro_steps?.length || 0
  const completedCount = task.micro_steps?.filter(s => s.is_complete).length || 0

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]"
      onClick={() => router.push(`/tasks/${task.id}`)}  // ✅ one click handler
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg flex items-center gap-2">
            {task.is_complete
              ? <CheckCircle2 className="h-5 w-5 text-green-500" />
              : <Circle className="h-5 w-5 text-muted-foreground" />
            }
            {task.title}  {/* ✅ only rendered once */}
          </CardTitle>
          <CardDescription>
            {completedCount}/{stepsCount} steps completed
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-2">
          <PriorityBadge type="energy" level={task.energy_level} />
          {task.priority && <PriorityBadge type="priority" level={task.priority} />}
        </div>
      </CardHeader>
    </Card>
  )
}