export function buildDecomposePrompt(
  taskTitle: string,
  energyLevel: string = 'medium',
  taskDescription?: string
): string {
  const descriptionBlock = taskDescription
    ? `\nAdditional context from the user:\n${taskDescription}\n`
    : ''

  return `
You are an ADHD productivity assistant for an app called Zone.

Break down the following task into small, actionable micro-steps.

Task: "${taskTitle}"
User's current energy level: ${energyLevel}
${descriptionBlock}

ADHD focus block durations (use these to estimate time per step):
- Low energy: 5–10 minutes per step (task initiation, easy wins)
- Medium energy: 10–15 minutes per step (average sustained effort)
- High energy: 20–30 minutes per step (already engaged, deeper work)

Rules:
- Return ONLY a valid JSON array, no markdown, no backticks, no extra text
- Based on the energy time limits, create steps
- Steps must start with a verb and be hyper-specific
  (NOT "do research" → instead "open Google Scholar and search for 3 sources about X")
- The first step should be the easiest possible action to start (task initiation is the hardest part for ADHD)
- Return estimated time based on step
- Generate as many or as few steps as the task genuinely needs — do not pad or limit artificially

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

export function buildPriorityPrompt(
  tasks: {
    title: string
    deadline: string | null
    estimated_total_minutes: number | null
  }[]
): string {
  return `
You are an ADHD productivity assistant for an app called Zone.

Given these tasks, assign a priority and suggest an ordering.

Tasks: ${JSON.stringify(tasks)}

Ranking criteria (in order of importance):
1. DEADLINE — tasks with closer deadlines rank higher. Tasks with no deadline rank lowest.
2. ESTIMATED TIME — among tasks with similar deadlines, shorter tasks rank higher (quick wins build momentum for ADHD brains).

Rules:
- Return ONLY a valid JSON array, no markdown, no backticks, no extra text
- Priority must be "high", "medium", or "low"
- "high" = due soon or overdue
- "medium" = due within a few days or moderate length with no deadline
- "low" = no deadline and/or long task with no urgency
- Start the order with a quick win when possible (ADHD needs early momentum)

Format:
[
  {
    "title": "task title here",
    "priority": "high",
    "suggested_order": 1
  }
]
`
}
