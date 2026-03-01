import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type TaskRow = {
  id: string
  [key: string]: unknown
}

type MicroStepRow = {
  task_id: string
  step_order?: number | null
  [key: string]: unknown
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (taskError) {
    const message = taskError.message.toLowerCase()
    if (message.includes('0 rows') || message.includes('no rows')) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ error: taskError.message }, { status: 500 })
  }

  const { data: microSteps, error: microStepsError } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', id)
    .order('step_order', { ascending: true })

  if (microStepsError) {
    return NextResponse.json({ error: microStepsError.message }, { status: 500 })
  }

  const response = {
    ...(task as TaskRow),
    micro_steps: (microSteps || []) as MicroStepRow[],
  }

  return NextResponse.json(response)
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const allowedFields = [
    'title',
    'priority',
    'energy_level',
    'deadline',
    'is_complete',
  ]

  const sanitized: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      // Normalize blank deadlines to null
      if (key === 'deadline' && !body[key]) {
        sanitized[key] = null
      } else {
        sanitized[key] = body[key]
      }
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(sanitized)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
