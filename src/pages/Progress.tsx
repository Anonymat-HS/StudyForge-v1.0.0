import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Flame, Target, Brain, TrendingUp } from "lucide-react"
import { useMemo } from "react"
import { useAuth } from "@/lib/supabase/auth"
import { useUserStats } from "@/hooks/useUserStats"
import type { UserProgress } from "@/lib/types"

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs"
        style={{
          background: "#1C1C24",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
        <p className="font-bold mt-0.5" style={{ color: "#A78BFA" }}>
          {payload[0].value}%
        </p>
      </div>
    )
  }
  return null
}

const BarTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs"
        style={{
          background: "#1C1C24",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      >
        <p style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
        <p className="font-bold mt-0.5" style={{ color: "#00D9FF" }}>
          {payload[0].value}%
        </p>
      </div>
    )
  }
  return null
}

function computeScoreHistory(progressRows: UserProgress[]) {
  const answered = progressRows.filter((r) => r.correct !== null)
  const byDate: Record<string, { correct: number; total: number }> = {}
  for (const row of answered) {
    const day = new Date(row.last_reviewed).toISOString().slice(0, 10)
    if (!byDate[day]) byDate[day] = { correct: 0, total: 0 }
    byDate[day].total++
    if (row.correct) byDate[day].correct++
  }
  const entries = Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
  return entries.map(([date, { correct, total }]) => ({
    date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: Math.round((correct / total) * 100),
  }))
}

function computeWeeklyActivity(progressRows: UserProgress[]) {
  const days: Record<string, number> = {}
  for (const row of progressRows) {
    const day = new Date(row.last_reviewed).toISOString().slice(0, 10)
    days[day] = (days[day] || 0) + 1
  }
  const today = new Date()
  const weeks: number[][] = []
  for (let w = 51; w >= 0; w--) {
    const weekDays: number[] = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (w * 7 + (6 - d)))
      const key = date.toISOString().slice(0, 10)
      weekDays.push(days[key] || 0)
    }
    weeks.push(weekDays)
  }
  return { weeks, days }
}

export default function Progress() {
  const { user } = useAuth()
  const {
    loading,
    progressRows,
    breakdown,
    answeredCount: quizzesTaken,
    avgScore,
    streak,
    flashcardsReviewed,
  } = useUserStats(user?.id)

  const scoreHistory = useMemo(() => computeScoreHistory(progressRows), [progressRows])
  const weeklyActivity = useMemo(() => computeWeeklyActivity(progressRows), [progressRows])
  const courseStats = useMemo(
    () =>
      breakdown
        .filter((c) => c.quizCount > 0)
        .map((c) => ({
          name: c.title.length > 12 ? c.title.slice(0, 12) + "…" : c.title,
          score: c.progress,
        })),
    [breakdown]
  )

  const hasData = quizzesTaken > 0 || flashcardsReviewed > 0

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "#7C5CFF", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>Loading progress…</p>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1.5">Progress</h1>
        <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.38)" }}>
          Your learning journey at a glance
        </p>
        <div
          className="p-10 rounded-2xl text-center"
          style={{
            background: "rgba(124,92,255,0.05)",
            border: "1px dashed rgba(124,92,255,0.25)",
          }}
        >
          <Brain size={40} className="mx-auto mb-3" style={{ color: "rgba(124,92,255,0.4)" }} />
          <p className="font-bold text-sm text-white mb-1">No progress yet</p>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Complete your first quiz to see your progress here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-black text-white mb-1.5">
        Progress
      </h1>
      <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.38)" }}>
        Your learning journey at a glance
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Day Streak",
            value: String(streak),
            icon: Flame,
            color: "#FCD34D",
            sub: streak > 0 ? "Keep going!" : "Start studying today",
          },
          {
            label: "Quizzes taken",
            value: String(quizzesTaken),
            icon: Brain,
            color: "#A78BFA",
            sub: quizzesTaken > 0 ? `${quizzesTaken} total` : "Take your first quiz",
          },
          {
            label: "Avg score",
            value: quizzesTaken ? `${avgScore}%` : "—",
            icon: Target,
            color: "#4ADE80",
            sub: quizzesTaken > 0 ? "Across all courses" : "No data yet",
          },
          {
            label: "Flashcards reviewed",
            value: String(flashcardsReviewed),
            icon: TrendingUp,
            color: "#00D9FF",
            sub: flashcardsReviewed > 0 ? `${flashcardsReviewed} total` : "Review your first flashcard",
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div
            key={label}
            className="p-3 sm:p-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={13} style={{ color }} />
              <p
                className="text-[11px] font-semibold tracking-wider"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {label.toUpperCase()}
              </p>
            </div>
            <p className="text-2xl font-black" style={{ color }}>
              {value}
            </p>
            <p
              className="text-[11px] mt-1"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Area chart */}
      {scoreHistory.length > 0 && (
        <div
          className="p-6 rounded-2xl mb-5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="font-bold text-white mb-0.5">Quiz Scores Over Time</h2>
          <p
            className="text-xs mb-6"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Rolling average across all courses
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={scoreHistory}
              margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C5CFF" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#7C5CFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#7C5CFF"
                strokeWidth={2}
                fill="url(#scoreGrad)"
                dot={{ fill: "#7C5CFF", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#A78BFA", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Two-col lower section */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Bar chart */}
        {courseStats.length > 0 && (
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <h2 className="font-bold text-white mb-0.5">Score by Course</h2>
            <p
              className="text-xs mb-6"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              Average quiz score per subject
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={courseStats}
                margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="score" fill="#00D9FF" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Course breakdown */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="font-bold text-white mb-5">Course Breakdown</h2>
          {breakdown.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              No courses yet. Upload material to get started.
            </p>
          ) : (
            <div className="space-y-5">
              {breakdown.map((c) => (
                <div key={c.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div>
                        <span
                          className="text-sm font-medium text-white"
                          title={c.title}
                        >
                          {c.title.length > 22
                            ? c.title.slice(0, 22) + "…"
                            : c.title}
                        </span>
                        <p
                          className="text-[11px]"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          {c.quizCount} quizzes · {c.flashcardCount} flashcards
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold shrink-0"
                      style={{ color: c.color }}
                    >
                      {c.progress}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.progress}%`,
                        background: `linear-gradient(90deg, ${c.color}88, ${c.color})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly activity grid */}
      {weeklyActivity.weeks.length > 0 && (
        <div
          className="mt-5 p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="font-bold text-white mb-5">Weekly Activity</h2>
          <div className="overflow-x-auto pb-2 -mx-2 px-2">
            <div className="flex gap-1">
              {weeklyActivity.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((count, di) => {
                    const opacity =
                      count >= 8 ? 0.9 :
                      count >= 5 ? 0.65 :
                      count >= 2 ? 0.4 :
                      count >= 1 ? 0.22 :
                      0.07
                    return (
                      <div
                        key={di}
                        className="w-3 h-3 rounded-sm"
                        style={{ background: `rgba(124,92,255,${opacity})` }}
                        title={`${count} quiz ${count !== 1 ? "s" : ""}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Less
            </span>
            {[0.07, 0.22, 0.4, 0.9].map((o) => (
              <div
                key={o}
                className="w-3 h-3 rounded-sm"
                style={{ background: `rgba(124,92,255,${o})` }}
              />
            ))}
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              More
            </span>
          </div>
        </div>
      )}
    </div>
  )
}