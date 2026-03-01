import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini/client'
import { buildDecomposePrompt } from '@/lib/gemini/prompts'

type GeneratedStep = {
  description: string
  estimated_minutes: number
  step_order: number
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { taskId, taskTitle, energyLevel } = await request.json()

  if (!taskId || !taskTitle) {
    return NextResponse.json(
      { error: 'taskId and taskTitle are required' },
      { status: 400 }
    )
  }

  try {
    const prompt = buildDecomposePrompt(taskTitle, energyLevel)
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    const text = response.text ?? ''

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as unknown
    const microSteps = Array.isArray(parsed) ? (parsed as GeneratedStep[]) : []
    const normalizedSteps =
      microSteps.length > 0
        ? microSteps
        : [
            {
              description: `Open materials for: ${taskTitle}`,
              estimated_minutes: 5,
              step_order: 1,
            },
            {
              description: `Work on the first small part of: ${taskTitle}`,
              estimated_minutes: 15,
              step_order: 2,
            },
            {
              description: `Review and mark progress for: ${taskTitle}`,
              estimated_minutes: 5,
              step_order: 3,
            },
          ]

    const stepsToInsert = normalizedSteps.map((step) => ({
      task_id: taskId,
      description: step.description,
      estimated_minutes: step.estimated_minutes,
      step_order: step.step_order,
      is_complete: false,
    }))

    const { data, error } = await supabase
      .from('subtasks')
      .insert(stepsToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to decompose task. ${message}` },
      { status: 500 }
    )
  }
}
