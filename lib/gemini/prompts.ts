export function buildDecomposePrompt(
  taskTitle: string,
  energyLevel: string = 'medium'
): string {
  return `
You are an ADHD productivity assistant for an app called Zone.

Break down the following task into small, actionable micro-steps.

Task: "${taskTitle}"
User's current energy level: ${energyLevel}

ADHD focus block durations (use these to estimate time per step):
- Low energy: 5–10 minutes per step (task initiation, easy wins)
- Medium energy: 10–15 minutes per step (average sustained effort)
- High energy: 20–30 minutes per step (already engaged, deeper work)

Rules:
- Return ONLY a valid JSON array, no markdown, no backticks, no extra text
- Each step description must start with a verb and be hyper-specific
  (NOT "do research" → instead "open Google Scholar and search for 3 sources about X")
- The first step should be the easiest possible action to start (task initiation is the hardest part for ADHD)
- Estimated minutes per step should match the energy level ranges above
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
  tasks: { title: string; category?: string; energy_level?: string }[]
): string {
  return `
You are an ADHD productivity assistant for an app called Zone.

Given these tasks, assign a priority and suggest an ordering that alternates
between boring and fun tasks to maintain engagement.

Tasks: ${JSON.stringify(tasks)}

Rules:
- Return ONLY a valid JSON array, no markdown, no backticks, no extra text
- Priority must be "high", "medium", or "low"
- ADHD brains do best starting with a quick win, then alternating boring/fun
- Consider deadline urgency and energy level when assigning priority

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