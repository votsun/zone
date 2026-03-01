import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
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

  const body = (await request.json()) as { is_complete?: boolean }
  if (typeof body.is_complete !== 'boolean') {
    return NextResponse.json({ error: 'is_complete boolean is required' }, { status: 400 })
  }

  const { data: subtask, error: subtaskError } = await supabase
    .from('subtasks')
    .select('id, task_id')
    .eq('id', id)
    .single()

  if (subtaskError || !subtask) {
    return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', subtask.task_id)
    .eq('user_id', user.id)
    .single()

  if (taskError || !task) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('subtasks')
    .update({ is_complete: body.is_complete })
    .eq('id', id)
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

  const { data: subtask, error: subtaskError } = await supabase
    .from('subtasks')
    .select('id, task_id')
    .eq('id', id)
    .single()

  if (subtaskError || !subtask) {
    return NextResponse.json({ error: 'Subtask not found' }, { status: 404 })
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', subtask.task_id)
    .eq('user_id', user.id)
    .single()

  if (taskError || !task) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
