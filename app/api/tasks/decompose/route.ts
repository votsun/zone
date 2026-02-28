import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini/client'
import { buildDecomposePrompt } from '@/lib/gemini/prompts'

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
    const microSteps = JSON.parse(cleaned)

    const stepsToInsert = microSteps.map((step: any) => ({
      task_id: taskId,
      description: step.description,
      estimated_minutes: step.estimated_minutes,
      step_order: step.step_order,
      is_complete: false,
    }))

    const { data, error } = await supabase
      .from('micro_steps')
      .insert(stepsToInsert)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to decompose task. AI response could not be parsed.' },
      { status: 500 }
    )
  }
}