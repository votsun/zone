import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { genAI } from '@/lib/gemini/client'
import { buildPriorityPrompt } from '@/lib/gemini/prompts'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tasks } = await request.json()

  const taskTitles = tasks.map((t: any) => t.title)

  const prompt = buildPriorityPrompt(taskTitles)
  const response = await genAI.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  })
  const text = response.text ?? ''
  const priorities = JSON.parse(text)

  const updates = await Promise.all(
    tasks.map((task: any, index: number) =>
      supabase
        .from('tasks')
        .update({ priority: priorities[index].priority })
        .eq('id', task.id)
        .eq('user_id', user.id)
    )
  )

  const hasError = updates.find(u => u.error)
  if (hasError) return NextResponse.json({ error: 'Failed to update priorities' }, { status: 500 })

  return NextResponse.json({ success: true, priorities })
}