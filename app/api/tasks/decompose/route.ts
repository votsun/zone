import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getGeminiClient } from '@/lib/gemini/client'
import { buildDecomposePrompt } from '@/lib/gemini/prompts'

type GeneratedStep = {
  description: string
  estimated_minutes: number
  step_order: number
}

function getFallbackMinutes(energyLevel: string) {
  switch (energyLevel) {
    case 'low':
      return { setup: 2, work: 7, review: 3 }
    case 'high':
      return { setup: 2, work: 25, review: 4 }
    default:
      return { setup: 2, work: 12, review: 3 }
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { taskId, energyLevel, taskDescription } = await request.json()

  if (!taskId) {
    return NextResponse.json(
      { error: 'taskId is required' },
      { status: 400 }
    )
  }

  try {
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('id, title, energy_level, user_id')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const { data: existingSteps, error: existingError } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('step_order', { ascending: true })

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    if (existingSteps && existingSteps.length > 0) {
      return NextResponse.json(existingSteps, { status: 200 })
    }

    const taskTitle = String(task.title || 'Untitled task')
    const resolvedEnergyLevel = energyLevel || task.energy_level || 'medium'
    const prompt = buildDecomposePrompt(
      taskTitle,
      resolvedEnergyLevel,
      typeof taskDescription === 'string' ? taskDescription : undefined
    )
    const geminiClient = getGeminiClient()
    if (!geminiClient) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      )
    }

    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
    const text = response.text ?? ''

    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned) as unknown
    const microSteps = Array.isArray(parsed) ? (parsed as GeneratedStep[]) : []
    const fallbackMinutes = getFallbackMinutes(resolvedEnergyLevel)
    const normalizedSteps =
      microSteps.length > 0
        ? microSteps
        : [
            {
              description: `Open materials for: ${taskTitle}`,
              estimated_minutes: fallbackMinutes.setup,
              step_order: 1,
            },
            {
              description: `Work on the first small part of: ${taskTitle}`,
              estimated_minutes: fallbackMinutes.work,
              step_order: 2,
            },
            {
              description: `Review and mark progress for: ${taskTitle}`,
              estimated_minutes: fallbackMinutes.review,
              step_order: 3,
            },
          ]

    const stepsToInsert = normalizedSteps.map((step, index) => ({
      task_id: taskId,
      description: step.description,
      estimated_minutes: step.estimated_minutes,
      step_order: step.step_order || index + 1,
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
