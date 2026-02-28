export interface StructuredNote {
  summary: string
  action_items: string[]
  key_points: string[]
  tags: string[]
}

export interface Note {
  id: string
  user_id: string
  raw_content: string
  structured_content: StructuredNote | null  // null until AI processes it
  created_at: string
}

export interface CreateNoteInput {
  raw_content: string
}