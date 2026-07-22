import { useState, useEffect } from "react"
import { ChevronLeft, RotateCcw, BookOpen, Loader2 } from "lucide-react"
import { supabase } from "../lib/supabase/client"

type Rating = "again" | "hard" | "good" | "easy"

interface Course {
  id: string
  titre: string
  flashcard_count: number
}

interface Flashcard {
  id: string
  recto: string
  verso: string
}

const ratings: {
  r: Rating
  label: string
  color: string
  bg: string
  border: string
  sub: string
}[] = [
  { r: "again", label: "Again", color: "#F87171", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.22)", sub: "< 1m" },
  { r: "hard", label: "Hard", color: "#FCD34D", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.22)", sub: "5m" },
  { r: "good", label: "Good", color: "#4ADE80", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.22)", sub: "1d" },
  { r: "easy", label: "Easy", color: "#00D9FF", bg: "rgba(0,217,255,0.08)", border: "rgba(0,217,255,0.2)", sub: "4d" },
]

export default function Flashcards({ onBack }: { onBack: () => void }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCards, setLoadingCards] = useState(false)

  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [history, setHistory] = useState<Rating[]>([])

  useEffect(() => {
    async function fetchCourses() {
      const { data } = await supabase
        .from("courses")
        .select("id, titre")
        .order("created_at", { ascending: false })

      if (!data) {
        setLoading(false)
        return
      }

      const coursesWithCount = await Promise.all(
        data.map(async (c) => {
          const { count } = await supabase
            .from("flashcards")
            .select("id", { count: "exact", head: true })
            .eq("course_id", c.id)
          return { ...c, flashcard_count: count ?? 0 }
        })
      )

      setCourses(coursesWithCount)
      setLoading(false)
    }
    fetchCourses()
  }, [])

  const startReview = async (course: Course) => {
    setSelectedCourse(course)
    setLoadingCards(true)

    const { data } = await supabase
      .from("flashcards")
      .select("id, recto, verso")
      .eq("course_id", course.id)
      .order("created_at", { ascending: true })

    setCards(data ?? [])
    setLoadingCards(false)
    setCurrent(0)
    setFlipped(false)
    setDone(false)
    setHistory([])
  }

  const card = cards[current]
  const total = cards.length

  const handleRate = (r: Rating) => {
    const next = [...history, r]
    setHistory(next)
    if (current + 1 >= total) {
      setDone(true)
    } else {
      setCurrent((c) => c + 1)
      setFlipped(false)
    }
  }

  const reset = () => {
    setCurrent(0)
    setFlipped(false)
    setDone(false)
    setHistory([])
  }

  // Loading
  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={24} className="animate-spin mx-auto mb-3" style={{ color: "#7C5CFF" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading courses...</p>
        </div>
      </div>
    )
  }

  // No courses
  if (courses.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.38)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
        >
          <ChevronLeft size={15} />
          Back
        </button>
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: "rgba(124,92,255,0.05)",
            border: "1px dashed rgba(124,92,255,0.25)",
          }}
        >
          <BookOpen size={36} className="mx-auto mb-3" style={{ color: "rgba(124,92,255,0.5)" }} />
          <p className="font-bold text-sm text-white mb-1">No courses yet</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Upload a course first, then generate flashcards from it.
          </p>
        </div>
      </div>
    )
  }

  // Course selection
  if (!selectedCourse) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.38)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
        >
          <ChevronLeft size={15} />
          Back
        </button>

        <h1 className="text-xl font-bold text-white mb-1">Select a course</h1>
        <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.38)" }}>
          Choose which flashcards to review
        </p>

        <div className="space-y-3">
          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => startReview(course)}
              className="w-full p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                e.currentTarget.style.borderColor = "rgba(124,92,255,0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white">{course.titre}</span>
                <span
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{
                    background: course.flashcard_count > 0 ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                    color: course.flashcard_count > 0 ? "#4ADE80" : "#FCD34D",
                    border: `1px solid ${course.flashcard_count > 0 ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
                  }}
                >
                  {course.flashcard_count} cards
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Loading cards
  if (loadingCards) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 size={24} className="animate-spin mx-auto mb-3" style={{ color: "#7C5CFF" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Loading flashcards...</p>
        </div>
      </div>
    )
  }

  // No cards
  if (cards.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-1.5 text-sm mb-6 transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.38)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
        >
          <ChevronLeft size={15} />
          Back to courses
        </button>
        <div
          className="p-8 rounded-2xl text-center"
          style={{
            background: "rgba(245,158,11,0.05)",
            border: "1px dashed rgba(245,158,11,0.25)",
          }}
        >
          <BookOpen size={20} className="mx-auto mb-3" style={{ color: "rgba(245,158,11,0.5)" }} />
          <p className="font-bold text-sm text-white mb-1">No flashcards yet</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
            Generate flashcards from the Dashboard first.
          </p>
        </div>
      </div>
    )
  }

  // Done
  if (done) {
    const counts = { again: 0, hard: 0, good: 0, easy: 0 } as Record<Rating, number>
    history.forEach((r) => counts[r]++)

    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto flex flex-col items-center text-center pt-16">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-3xl font-black text-white mb-2">Deck complete!</h2>
        <p className="mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          You reviewed all {total} cards
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full max-w-xs mb-10">
          {ratings.map(({ r, label, color, bg, border }) => (
            <div
              key={r}
              className="p-3 rounded-xl text-center"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <p className="text-xl font-black" style={{ color }}>{counts[r]}</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "#7C5CFF" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#8B6BFF")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#7C5CFF")}
          >
            <RotateCcw size={14} />
            Review again
          </button>
          <button
            onClick={() => setSelectedCourse(null)}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.6)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)"
              e.currentTarget.style.color = "rgba(255,255,255,0.9)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "rgba(255,255,255,0.6)"
            }}
          >
            Choose another course
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto">
      <button
        onClick={() => setSelectedCourse(null)}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors duration-150"
        style={{ color: "rgba(255,255,255,0.38)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
      >
        <ChevronLeft size={15} />
        Back
      </button>

      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] font-semibold tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>
          {selectedCourse?.titre?.toUpperCase()} · FLASHCARDS
        </p>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
          {current + 1} / {total}
        </span>
      </div>

      <div
        className="h-1.5 rounded-full overflow-hidden mb-8"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${(current / total) * 100}%`,
            background: "linear-gradient(90deg, #7C5CFF, #A78BFA)",
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="cursor-pointer mb-5 select-none w-full rounded-2xl p-8 sm:p-10 text-center transition-all duration-300"
        style={{
          background: flipped ? "rgba(124,92,255,0.06)" : "rgba(255,255,255,0.035)",
          border: `1px solid ${flipped ? "rgba(124,92,255,0.22)" : "rgba(255,255,255,0.09)"}`,
          minHeight: "270px",
        }}
        onClick={() => setFlipped((f) => !f)}
      >
        {flipped ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[11px] font-semibold tracking-widest mb-5" style={{ color: "rgba(167,139,250,0.6)" }}>
              ANSWER
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
              {card.verso}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[11px] font-semibold tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.28)" }}>
              QUESTION
            </p>
            <p className="text-xl md:text-2xl font-bold text-white leading-snug">
              {card.recto}
            </p>
            <p className="text-xs mt-8" style={{ color: "rgba(255,255,255,0.22)" }}>
              Tap to reveal answer
            </p>
          </div>
        )}
      </div>

      <p className="text-center text-xs mb-5" style={{ color: "rgba(255,255,255,0.28)" }}>
        {flipped ? "How well did you know this?" : "Tap the card to reveal the answer"}
      </p>

      {/* Rating buttons */}
      <div
        className="grid grid-cols-4 gap-2 transition-all duration-300"
        style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? "auto" : "none" }}
      >
        {ratings.map(({ r, label, color, bg, border, sub }) => (
          <button
            key={r}
            onClick={() => handleRate(r)}
            className="flex flex-col items-center gap-0.5 py-3 sm:py-4 rounded-xl transition-all duration-150 active:scale-95 min-h-[60px]"
            style={{ background: bg, border: `1px solid ${border}` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
            }}
          >
            <span className="text-sm font-bold" style={{ color }}>{label}</span>
            <span className="text-[11px]" style={{ color: color + "90" }}>{sub}</span>
          </button>
        ))}
      </div>

      {!flipped && current > 0 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => {
              setCurrent((c) => c - 1)
              setFlipped(false)
            }}
            className="flex items-center gap-1 text-xs transition-colors duration-150"
            style={{ color: "rgba(255,255,255,0.25)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
          >
            <ChevronLeft size={13} />
            Previous card
          </button>
        </div>
      )}
    </div>
  )
}
