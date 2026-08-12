export function computeStreak(
  quizRows: { last_reviewed: string }[],
  flashRows: { last_reviewed: string }[]
): number {
  const days = new Set<string>()
  for (const r of quizRows) {
    days.add(new Date(r.last_reviewed).toISOString().slice(0, 10))
  }
  for (const r of flashRows) {
    days.add(new Date(r.last_reviewed).toISOString().slice(0, 10))
  }
  if (!days.size) return 0

  let streak = 0
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (days.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}