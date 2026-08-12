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
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase/client"
import { useAuth } from "../lib/supabase/auth"
import { computeStreak } from "../lib/progress"

interface CourseRow {
  id: string
  titre: string
  created_at: string
}

interface QuizRow {
  id: string
  course_id: string
}

interface FlashcardRow {
  id: string
  course_id: string
}

interface UserProgressRow {
  id: string
  quiz_id: string
  correct: boolean | null
  last_reviewed: string
}

interface FlashcardProgressRow {
  id: string
  flashcard_id: string
  niveau: string
  last_reviewed: string
}

interface CourseStat {
  id: string
  title: string
  color: string
  quizCount: number
  flashcardCount: number
  correctCount: number
  progress: number
}

const courseColors = ["#7C5CFF", "#00D9FF", "#F59E0B", "#22C55E", "#EC4899", "#F97316"]

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

function computeScoreHistory(progressRows: UserProgressRow[]) {
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

function computeWeeklyActivity(progressRows: UserProgressRow[]) {
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
  const [loading, setLoading] = useState(true)
  const [quizzesTaken, setQuizzesTaken] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [flashcardsReviewed, setFlashcardsReviewed] = useState(0)
  const [scoreHistory, setScoreHistory] = useState<{ date: string; score: number }[]>([])
  const [courseStats, setCourseStats] = useState<{ name: string; score: number }[]>([])
  const [courseBreakdown, setCourseBreakdown] = useState<CourseStat[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<{ weeks: number[][]; days: Record<string, number> }>({ weeks: [], days: {} })

  useEffect(() => {
    if (!user) return
    async function fetch() {
      const [coursesRes, progressRes, flashcardProgressRes] = await Promise.all([
        supabase.from("courses").select("id, titre, created_at").eq("user_id", user!.id),
        supabase.from("user_progress").select("id, quiz_id, correct, last_reviewed").eq("user_id", user!.id),
        supabase.from("flashcard_progress").select("id, flashcard_id, niveau, last_reviewed").eq("user_id", user!.id),
      ])

      const coursesList = (coursesRes.data || []) as CourseRow[]
      const progressRows = (progressRes.data || []) as UserProgressRow[]
      const flashcardProgRows = (flashcardProgressRes.data || []) as FlashcardProgressRow[]

      const courseIds = coursesList.map((c) => c.id)
      let allQuizzes: QuizRow[] = []
      let allFlashcards: FlashcardRow[] = []
      if (courseIds.length) {
        const [quizzesRes, flashcardsRes] = await Promise.all([
          supabase.from("quizzes").select("id, course_id").in("course_id", courseIds),
          supabase.from("flashcards").select("id, course_id").in("course_id", courseIds),
        ])
        allQuizzes = (quizzesRes.data || []) as QuizRow[]
        allFlashcards = (flashcardsRes.data || []) as FlashcardRow[]
      }

      // Stats (filter out null correct)
      const answered = progressRows.filter((r) => r.correct !== null)
      const totalTaken = answered.length
      const totalCorrect = answered.filter((r) => r.correct).length
      setQuizzesTaken(totalTaken)
      setAvgScore(totalTaken ? Math.round((totalCorrect / totalTaken) * 100) : 0)
      setStreak(computeStreak(progressRows, flashcardProgRows))

      // Flashcards reviewed
      setFlashcardsReviewed(flashcardProgRows.length)

      // Score history
      setScoreHistory(computeScoreHistory(progressRows))

      // Course breakdown
      const quizByCourse: Record<string, QuizRow[]> = {}
      const flashByCourse: Record<string, FlashcardRow[]> = {}
      for (const q of allQuizzes) {
        if (!quizByCourse[q.course_id]) quizByCourse[q.course_id] = []
        quizByCourse[q.course_id].push(q)
      }
      for (const f of allFlashcards) {
        if (!flashByCourse[f.course_id]) flashByCourse[f.course_id] = []
        flashByCourse[f.course_id].push(f)
      }

      const progressByQuiz: Record<string, boolean> = {}
      for (const p of progressRows) {
        if (p.correct !== null) {
          progressByQuiz[p.quiz_id] = p.correct
        }
      }

      const breakdown: CourseStat[] = coursesList.map((c, i) => {
        const cQuizzes = quizByCourse[c.id] || []
        const cFlashcards = flashByCourse[c.id] || []
        const correct = cQuizzes.filter((q) => progressByQuiz[q.id] === true).length
        const total = cQuizzes.length
        return {
          id: c.id,
          title: c.titre,
          color: courseColors[i % courseColors.length],
          quizCount: total,
          flashcardCount: cFlashcards.length,
          correctCount: correct,
          progress: total ? Math.round((correct / total) * 100) : 0,
        }
      })
      setCourseBreakdown(breakdown)

      setCourseStats(
        breakdown
          .filter((c) => c.quizCount > 0)
          .map((c) => ({ name: c.title.length > 12 ? c.title.slice(0, 12) + "…" : c.title, score: c.progress }))
      )

      setWeeklyActivity(computeWeeklyActivity(progressRows))

      setLoading(false)
    }
    fetch()
  }, [user])

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
          {courseBreakdown.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              No courses yet. Upload material to get started.
            </p>
          ) : (
            <div className="space-y-5">
              {courseBreakdown.map((c) => (
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