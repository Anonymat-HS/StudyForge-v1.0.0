import { useState, useEffect, useRef } from "react"
import { Camera, Flame, Brain, Target, TrendingUp, BookOpen, Upload, ArrowLeft } from "lucide-react"
import { supabase } from "../lib/supabase/client"
import { useAuth } from "../lib/supabase/auth"
import type { Screen } from "../App"

interface CourseRow {
  id: string
  titre: string
  created_at: string
}

interface UserProgressRow {
  correct: boolean | null
  last_reviewed: string
}

interface FlashcardProgressRow {
  niveau: string
  last_reviewed: string
}

interface CourseStat {
  id: string
  title: string
  color: string
  quizCount: number
  correctCount: number
  progress: number
}

const courseColors = ["#7C5CFF", "#00D9FF", "#F59E0B", "#22C55E", "#EC4899", "#F97316"]

function computeStreak(quizRows: UserProgressRow[], flashRows: FlashcardProgressRow[]): number {
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (name[0] ?? "?").toUpperCase()
}

function getAvatarColor(name: string): string {
  const colors = [
    "linear-gradient(135deg, #7C5CFF, #6D4FEA)",
    "linear-gradient(135deg, #8B5CF6, #7C3AED)",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export default function Profile({ onBack }: { onBack: () => void }) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const [loading, setLoading] = useState(true)
  const [courseCount, setCourseCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [flashcardCount, setFlashcardCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [avgScore, setAvgScore] = useState(0)
  const [courseStats, setCourseStats] = useState<CourseStat[]>([])

  const name = user?.user_metadata?.full_name ?? user?.email ?? ""
  const email = user?.email ?? ""
  const createdAt = user?.created_at ?? ""
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const initials = getInitials(name)
  const bgGradient = getAvatarColor(name)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const [coursesRes, progressRes, flashcardProgressRes] = await Promise.all([
        supabase.from("courses").select("id, titre, created_at").eq("user_id", user!.id),
        supabase.from("user_progress").select("correct, last_reviewed").eq("user_id", user!.id),
        supabase.from("flashcard_progress").select("niveau, last_reviewed").eq("user_id", user!.id),
      ])

      const coursesList = (coursesRes.data ?? []) as CourseRow[]
      const progressRows = (progressRes.data ?? []) as UserProgressRow[]
      const flashProgRows = (flashcardProgressRes.data ?? []) as FlashcardProgressRow[]

      setCourseCount(coursesList.length)
      setQuizCount(progressRows.length)
      setFlashcardCount(flashProgRows.length)
      setStreak(computeStreak(progressRows, flashProgRows))

      const answered = progressRows.filter((r) => r.correct !== null)
      const correct = answered.filter((r) => r.correct).length
      setAvgScore(answered.length ? Math.round((correct / answered.length) * 100) : 0)

      // Per-course breakdown
      const courseIds = coursesList.map((c) => c.id)
      let allQuizzes: { id: string; course_id: string }[] = []
      if (courseIds.length) {
        const { data } = await supabase
          .from("quizzes")
          .select("id, course_id")
          .in("course_id", courseIds)
        allQuizzes = (data ?? []) as { id: string; course_id: string }[]
      }

      const quizByCourse: Record<string, { id: string }[]> = {}
      for (const q of allQuizzes) {
        if (!quizByCourse[q.course_id]) quizByCourse[q.course_id] = []
        quizByCourse[q.course_id].push(q)
      }

      const allQuizIds = new Set(allQuizzes.map((q) => q.id))
      const lastCorrect: Record<string, boolean> = {}
      for (const p of progressRows) {
        if (p.correct !== null) {
          lastCorrect[p.quiz_id] = p.correct
        }
      }

      setCourseStats(
        coursesList.map((c, i) => {
          const cQuizzes = (quizByCourse[c.id] || []).filter((q) => allQuizIds.has(q.id))
          const correctCount = cQuizzes.filter((q) => lastCorrect[q.id] === true).length
          return {
            id: c.id,
            title: c.titre,
            color: courseColors[i % courseColors.length],
            quizCount: cQuizzes.length,
            correctCount,
            progress: cQuizzes.length ? Math.round((correctCount / cQuizzes.length) * 100) : 0,
          }
        })
      )

      setLoading(false)
    }
    fetchData()
  }, [user])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)

    try {
      const ext = file.name.split(".").pop()
      const filePath = `${user.id}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      const avatarUrl = publicUrlData.publicUrl

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      })
      if (updateError) throw updateError

      window.location.reload()
    } catch {
      // Fallback: store as data URL directly in metadata
      try {
        const reader = new FileReader()
        reader.onloadend = async () => {
          await supabase.auth.updateUser({
            data: { avatar_url: reader.result as string },
          })
          window.location.reload()
        }
        reader.readAsDataURL(file)
      } catch {
        // Silent failure
      }
    } finally {
      setUploading(false)
    }
  }

  const createdDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto flex items-center justify-center" style={{ minHeight: "60vh" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: "#7C5CFF", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>Loading profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.9)" }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)" }}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-black text-white">Profile</h1>
      </div>

      {/* Profile card */}
      <div
        className="p-6 rounded-2xl mb-6 flex items-center gap-5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="relative shrink-0">
          <div
            className="w-16 h-16 rounded-full overflow-hidden cursor-pointer ring-2 ring-violet-500/20 hover:ring-violet-500/40 transition-all"
            style={{ background: avatarUrl ? "none" : bgGradient }}
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-lg font-bold text-white">
                {initials}
              </span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-bg transition-colors"
            style={{
              background: "#7C5CFF",
              borderColor: "#0F0F12",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#8B6BFF" }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#7C5CFF" }}
          >
            {uploading ? (
              <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: "white", borderTopColor: "transparent" }} />
            ) : (
              <Camera size={11} className="text-white" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{name}</h2>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{email}</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
            Member since {createdDate}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Courses", value: String(courseCount), icon: BookOpen, color: "#7C5CFF" },
          { label: "Quizzes taken", value: String(quizCount), icon: Brain, color: "#A78BFA" },
          { label: "Flashcards reviewed", value: String(flashcardCount), icon: TrendingUp, color: "#00D9FF" },
          { label: "Day streak", value: String(streak), icon: Flame, color: "#FCD34D" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={13} style={{ color }} />
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>
                {label}
              </p>
            </div>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            {label === "Avg score" && (
              <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                Across all courses
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Avg score card */}
      <div
        className="p-6 rounded-2xl mb-6"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-1.5 mb-0.5">
          <Target size={14} style={{ color: "#4ADE80" }} />
          <h2 className="font-bold text-white">Average Score</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.38)" }}>
          Across all quiz attempts
        </p>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-black" style={{ color: "#4ADE80" }}>
            {avgScore}%
          </span>
          <span className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.3)" }}>
            {quizCount > 0 ? `based on ${quizCount} question${quizCount !== 1 ? "s" : ""}` : "No data yet"}
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden mt-3"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${avgScore}%`,
              background: "linear-gradient(90deg, #22C55E88, #22C55E)",
            }}
          />
        </div>
      </div>

      {/* Per-course progress */}
      <div
        className="p-6 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <h2 className="font-bold text-white mb-4">Course Progress</h2>
        {courseStats.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            <Upload size={14} className="inline mr-1" />
            Upload your first course to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {courseStats.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-white truncate max-w-[70%]" title={c.title}>
                    {c.title}
                  </span>
                  <span className="text-sm font-bold shrink-0 ml-2" style={{ color: c.color }}>
                    {c.progress}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${c.progress}%`,
                      background: `linear-gradient(90deg, ${c.color}88, ${c.color})`,
                    }}
                  />
                </div>
                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {c.correctCount}/{c.quizCount} correct
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}