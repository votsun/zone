import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini/client'
import { buildDecomposePrompt } from '@/lib/gemini/prompts'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId, taskTitle } = await request.json()

  const prompt = buildDecomposePrompt(taskTitle)
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  })
  const text = response.text ?? ''
  const microSteps = JSON.parse(text)

  const stepsWithTaskId = microSteps.map((step: any) => ({
    ...step,
    task_id: taskId,
  }))

  const { data, error } = await supabase
    .from('micro_steps')
    .insert(stepsWithTaskId)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}