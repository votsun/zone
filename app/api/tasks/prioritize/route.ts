import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini/client'
import { buildPriorityPrompt } from '@/lib/gemini/prompts'

type PriorityInputStep = {
  estimated_minutes?: number | null
}

type PriorityInputTask = {
  id: string
  title: string
  deadline?: string | null
  micro_steps?: PriorityInputStep[]
}

type ModelPriority = {
  priority: 'high' | 'medium' | 'low'
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tasks } = (await request.json()) as { tasks?: PriorityInputTask[] }

  if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json(
      { error: 'tasks array is required and must not be empty' },
      { status: 400 }
    )
  }

  try {
    // Calculate estimated total minutes per task from their micro_steps
    const taskSummaries = tasks.map((t) => {
      const totalMinutes = t.micro_steps
        ? t.micro_steps.reduce(
            (sum, step) => sum + (step.estimated_minutes || 0),
            0
          )
        : null

      return {
        title: t.title,
        deadline: t.deadline || null,
        estimated_total_minutes: totalMinutes,
      }
    })

    const prompt = buildPriorityPrompt(taskSummaries)
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    const text = response.text ?? ''

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as unknown
    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        { error: 'AI response format invalid' },
        { status: 500 }
      )
    }
    const priorities = parsed as ModelPriority[]

    const updates = await Promise.all(
      tasks.map((task, index) =>
        supabase
          .from('tasks')
          .update({ priority: priorities[index]?.priority || 'medium' })
          .eq('id', task.id)
          .eq('user_id', user.id)
      )
    )

    const failed = updates.find((u) => u.error)
    if (failed) {
      return NextResponse.json(
        { error: 'Failed to update some priorities' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, priorities })
  } catch {
    return NextResponse.json(
      { error: 'Failed to prioritize tasks. AI response could not be parsed.' },
      { status: 500 }
    )
  }
}
