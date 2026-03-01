import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PostgrestError } from '@supabase/supabase-js'

type TaskRow = {
  id: string
  [key: string]: unknown
}

type MicroStepRow = {
  task_id: string
  step_order?: number | null
  [key: string]: unknown
}

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (tasksError) {
    return NextResponse.json({ error: tasksError.message }, { status: 500 })
  }

  const typedTasks = (tasks || []) as TaskRow[]
  if (typedTasks.length === 0) {
    return NextResponse.json([])
  }

  const taskIds = typedTasks.map((task) => task.id)
  const { data: microSteps, error: microStepsError } = await supabase
    .from('subtasks')
    .select('*')
    .in('task_id', taskIds)
    .order('step_order', { ascending: true })

  if (microStepsError) {
    return NextResponse.json({ error: microStepsError.message }, { status: 500 })
  }

  const grouped = new Map<string, MicroStepRow[]>()
  for (const step of (microSteps || []) as MicroStepRow[]) {
    const existing = grouped.get(step.task_id)
    if (existing) {
      existing.push(step)
    } else {
      grouped.set(step.task_id, [step])
    }
  }

  const response = typedTasks.map((task) => ({
    ...task,
    micro_steps: grouped.get(task.id) || [],
  }))

  return NextResponse.json(response)
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const title =
    typeof body?.title === 'string' ? body.title.trim() : ''
  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }

  const payloads = [
    {
      user_id: user.id,
      title,
      priority: body.priority || 'medium',
      energy_level: body.energy_level || 'medium',
      deadline: body.deadline || null,
      is_complete: false,
    },
    {
      user_id: user.id,
      title,
      priority: body.priority || 'medium',
      energy_level: body.energy_level || 'medium',
    },
    {
      user_id: user.id,
      title,
    },
  ]

  let data: TaskRow | null = null
  let lastError: PostgrestError | null = null
  for (const payload of payloads) {
    const result = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single()

    if (!result.error) {
      data = result.data as TaskRow
      break
    }
    lastError = result.error

    const message = result.error.message.toLowerCase()
    const canRetryWithSmallerPayload =
      message.includes('column') ||
      message.includes('null value') ||
      message.includes('violates not-null constraint')

    if (!canRetryWithSmallerPayload) {
      break
    }
  }

  if (!data) {
    const msg = lastError?.message || 'Failed to create task'
    if (msg.toLowerCase().includes('tasks_user_id_key')) {
      return NextResponse.json(
        {
          error:
            'DB constraint tasks_user_id_key is forcing one task per user. Drop that unique constraint on tasks.user_id and retry.',
        },
        { status: 409 }
      )
    }
    if (msg.toLowerCase().includes('row-level security')) {
      return NextResponse.json(
        { error: 'RLS blocked insert on tasks. Add an INSERT policy for authenticated users on tasks.' },
        { status: 403 }
      )
    }
    if (msg.toLowerCase().includes('unauthorized')) {
      return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json({ ...data, micro_steps: [] }, { status: 201 })
}
