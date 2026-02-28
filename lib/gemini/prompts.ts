// TASK DECOMPOSER
export function buildDecomposePrompt(taskTitle: string): string {
  return `
You are an ADHD productivity assistant. Break down the following task into small, 
actionable micro-steps that feel easy to start.

Task: "${taskTitle}"

Rules:
- Return ONLY a valid JSON array, no extra text
- Each step should take 5-15 minutes max
- Use simple, clear language
- Maximum 6 steps

Format:
[
  {
    "description": "step description here",
    "estimated_minutes": 10,
    "step_order": 1
  }
]
`
}

// PRIORITY ENGINE
export function buildPriorityPrompt(taskTitles: string[]): string {
  return `
You are an ADHD productivity assistant. Assign a priority level to each task below 
based on urgency and cognitive load.

Tasks: ${JSON.stringify(taskTitles)}

Rules:
- Return ONLY a valid JSON array, no extra text
- Priority must be "high", "medium", or "low"
- Consider that ADHD brains do best starting with quick wins

Format:
[
  {
    "title": "task title here",
    "priority": "high"
  }
]
`
}

// NOTE ORGANIZER
export function buildNotePrompt(rawNote: string): string {
  return `
You are an ADHD productivity assistant. Organize the following brain dump note 
into a clean structured format.

Note: "${rawNote}"

Rules:
- Return ONLY a valid JSON object, no extra text
- Keep language simple and concise

Format:
{
  "summary": "one sentence summary",
  "action_items": ["action 1", "action 2"],
  "key_points": ["point 1", "point 2"],
  "tags": ["tag1", "tag2"]
}
`
}