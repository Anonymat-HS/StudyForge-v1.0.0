import { Upload, Brain, CreditCard, Clock, Flame, ArrowRight, Quote, BookOpen } from "lucide-react"
import { getRandomQuote } from "../data/quotes"
import type { Screen } from "../App"
import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase/client"
import { useAuth } from "../lib/supabase/auth"

interface CourseWithStats {
  id: string
  titre: string
  created_at: string
  quiz_count: number
  flashcard_count: number
}

export default function Dashboard({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void
}) {
  const { user } = useAuth()
  const [quote] = useState(() => getRandomQuote())
  const [courses, setCourses] = useState<CourseWithStats[]>([])
  const [loading, setLoading] = useState(true)

  const displayName = user?.email?.split("@")[0] ?? "there"

  useEffect(() => {
    async function fetchCourses() {
      const { data: coursesData, error } = await supabase
        .from("courses")
        .select("id, titre, created_at")
        .order("created_at", { ascending: false })

      if (error || !coursesData) {
        setLoading(false)
        return
      }

      const coursesWithStats = await Promise.all(
        coursesData.map(async (course) => {
          const [quizzes, flashcards] = await Promise.all([
            supabase
              .from("quizzes")
              .select("id", { count: "exact", head: true })
              .eq("course_id", course.id),
            supabase
              .from("flashcards")
              .select("id", { count: "exact", head: true })
              .eq("course_id", course.id),
          ])
          return {
            ...course,
            quiz_count: quizzes.count ?? 0,
            flashcard_count: flashcards.count ?? 0,
          }
        })
      )

      setCourses(coursesWithStats)
      setLoading(false)
    }

    fetchCourses()
  }, [])

  const totalQuizzes = courses.reduce((s, c) => s + c.quiz_count, 0)
  const totalFlashcards = courses.reduce((s, c) => s + c.flashcard_count, 0)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  })()

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "#7C5CFF", borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            {greeting}, {displayName} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
            {today}
          </p>
        </div>
        {totalQuizzes > 0 && (
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold"
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.22)",
              color: "#FCD34D",
            }}
          >
            <Flame size={15} />
            {courses.length} course{courses.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Courses", value: courses.length.toString(), color: "#7C5CFF" },
          { label: "Quiz questions", value: totalQuizzes.toString(), color: "#00D9FF" },
          { label: "Flashcards", value: totalFlashcards.toString(), color: "#F59E0B" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {label}
            </p>
            <p className="text-2xl font-black" style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        <button
          onClick={() => onNavigate("upload")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{ background: "#7C5CFF" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#8B6BFF"
            e.currentTarget.style.boxShadow = "0 0 20px rgba(124,92,255,0.35)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#7C5CFF"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <Upload size={15} />
          Upload new course
        </button>
        {courses.length > 0 && [
          { screen: "quiz" as Screen, icon: Brain, label: "Start a quiz" },
          { screen: "flashcards" as Screen, icon: CreditCard, label: "Review flashcards" },
        ].map(({ screen, icon: Icon, label }) => (
          <button
            key={screen}
            onClick={() => onNavigate(screen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)"
              e.currentTarget.style.color = "rgba(255,255,255,0.9)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "rgba(255,255,255,0.6)"
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {courses.length === 0 ? (
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: "rgba(124,92,255,0.05)",
            border: "1px dashed rgba(124,92,255,0.25)",
          }}
        >
          <BookOpen size={36} className="mx-auto mb-3" style={{ color: "rgba(124,92,255,0.5)" }} />
          <p className="font-bold text-sm text-white mb-1">No courses yet</p>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Upload your first course to start generating quizzes and flashcards.
          </p>
          <button
            onClick={() => onNavigate("upload")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#7C5CFF" }}
          >
            <Upload size={14} />
            Upload a course
          </button>
        </div>
      ) : (
        <>
          {/* Recent courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">Recent Courses</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group p-5 rounded-2xl cursor-pointer transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
                  }}
                  onClick={() => onNavigate("quiz")}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl text-lg flex items-center justify-center shrink-0"
                        style={{
                          background: "rgba(124,92,255,0.1)",
                          border: "1px solid rgba(124,92,255,0.2)",
                        }}
                      >
                        📄
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight text-white">
                          {course.titre}
                        </h3>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "rgba(255,255,255,0.38)" }}
                        >
                          {new Date(course.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs shrink-0"
                      style={{ color: "rgba(255,255,255,0.28)" }}
                    >
                      <Clock size={10} />
                      {new Date(course.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-4 text-xs"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  >
                    <span>{course.quiz_count} questions</span>
                    <span>·</span>
                    <span>{course.flashcard_count} flashcards</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue studying banner */}
          <div
            className="mt-6 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3 sm:gap-4"
            style={{
              background: "rgba(124,92,255,0.07)",
              border: "1px solid rgba(124,92,255,0.18)",
            }}
          >
            <div className="min-w-0">
              <p className="font-bold text-sm">Continue where you left off</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                {courses[0]?.titre ?? "No courses yet"}
              </p>
            </div>
            <button
              onClick={() => onNavigate("quiz")}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: "rgba(124,92,255,0.2)",
                border: "1px solid rgba(124,92,255,0.3)",
                color: "#C4B5FD",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(124,92,255,0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(124,92,255,0.2)"
              }}
            >
              Resume
              <ArrowRight size={13} />
            </button>
          </div>
        </>
      )}

      {/* Daily quote */}
      <div
        className="mt-6 p-5 rounded-2xl"
        style={{
          background: "rgba(0,217,255,0.04)",
          border: "1px solid rgba(0,217,255,0.12)",
        }}
      >
        <div className="flex items-start gap-3">
          <Quote size={16} className="shrink-0 mt-0.5" style={{ color: "#00D9FF" }} />
          <div>
            <p className="text-sm italic" style={{ color: "rgba(255,255,255,0.7)" }}>
              "{quote.text}"
            </p>
            <p className="text-xs mt-2 font-medium" style={{ color: "rgba(0,217,255,0.6)" }}>
              — {quote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
