import { useState } from "react"
import { ChevronLeft, CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react"
import { quizQuestions } from "../data"

export default function Quiz({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = quizQuestions[current]
  const total = quizQuestions.length

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === q.correct) setScore((s) => s + 1)
  }

  const handleNext = () => {
    if (current + 1 >= total) {
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setSelected(null)
    }
  }

  const reset = () => {
    setCurrent(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    const pct = Math.round((score / total) * 100)
    const grade =
      pct >= 80
        ? { label: "Excellent!", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" }
        : pct >= 60
        ? { label: "Good effort!", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" }
        : { label: "Keep going!", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" }

    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto flex flex-col items-center text-center pt-16">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: grade.bg, border: `1px solid ${grade.border}` }}
        >
          <span className="text-4xl font-black" style={{ color: grade.color }}>
            {pct}%
          </span>
        </div>
        <h2 className="text-3xl font-black text-white mb-2">{grade.label}</h2>
        <p className="mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
          {score} correct out of {total} questions
        </p>
        <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.28)" }}>
          Introduction to Algorithms · Quiz complete
        </p>

        {/* Score breakdown */}
        <div className="flex gap-3 sm:gap-4 mb-10">
          <div
            className="px-5 py-3 rounded-xl text-center"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <p className="text-xl font-black" style={{ color: "#4ADE80" }}>
              {score}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              Correct
            </p>
          </div>
          <div
            className="px-5 py-3 rounded-xl text-center"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <p className="text-xl font-black" style={{ color: "#F87171" }}>
              {total - score}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              Incorrect
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "#7C5CFF" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#8B6BFF")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#7C5CFF")
            }
          >
            <RotateCcw size={14} />
            Retry quiz
          </button>
          <button
            onClick={onBack}
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
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors duration-150"
        style={{ color: "rgba(255,255,255,0.38)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.38)")
        }
      >
        <ChevronLeft size={15} />
        Exit quiz
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p
            className="text-[11px] font-semibold tracking-wider"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            INTRODUCTION TO ALGORITHMS
          </p>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            Question {current + 1} of {total}
          </p>
        </div>
        <div
          className="px-3 py-1 rounded-lg text-sm font-bold"
          style={{
            background: "rgba(124,92,255,0.12)",
            border: "1px solid rgba(124,92,255,0.2)",
            color: "#C4B5FD",
          }}
        >
          {score} / {current} correct
        </div>
      </div>

      {/* Progress bar */}
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

      {/* Question */}
      <h2 className="text-xl md:text-2xl font-bold leading-snug text-white mb-7">
        {q.question}
      </h2>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {q.options.map((opt, idx) => {
          const isSelected = selected === idx
          const isCorrect = idx === q.correct
          const revealed = selected !== null

          let bg = "rgba(255,255,255,0.03)"
          let border = "rgba(255,255,255,0.09)"
          let color = "rgba(255,255,255,0.75)"

          if (revealed) {
            if (isCorrect) {
              bg = "rgba(34,197,94,0.1)"
              border = "rgba(34,197,94,0.4)"
              color = "#86EFAC"
            } else if (isSelected) {
              bg = "rgba(239,68,68,0.1)"
              border = "rgba(239,68,68,0.4)"
              color = "#FCA5A5"
            } else {
              bg = "transparent"
              border = "rgba(255,255,255,0.05)"
              color = "rgba(255,255,255,0.28)"
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-all duration-200"
              style={{
                background: bg,
                border: `1px solid ${border}`,
                color,
                cursor: revealed ? "default" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!revealed) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"
                }
              }}
              onMouseLeave={(e) => {
                if (!revealed) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"
                }
              }}
            >
              <span
                className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
                style={{
                  border: `1px solid currentColor`,
                  opacity: revealed && !isCorrect && !isSelected ? 0.4 : 1,
                }}
              >
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="font-medium flex-1">{opt}</span>
              {revealed && isCorrect && (
                <CheckCircle size={17} className="shrink-0" style={{ color: "#4ADE80" }} />
              )}
              {revealed && isSelected && !isCorrect && (
                <XCircle size={17} className="shrink-0" style={{ color: "#F87171" }} />
              )}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {selected !== null && (
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            className="text-[11px] font-semibold mb-1.5 tracking-wider"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            EXPLANATION
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            {q.explanation}
          </p>
        </div>
      )}

      {/* Next button */}
      {selected !== null && (
        <button
          onClick={handleNext}
          className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all duration-200"
          style={{ background: "#7C5CFF" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#8B6BFF"
            e.currentTarget.style.boxShadow = "0 0 24px rgba(124,92,255,0.35)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#7C5CFF"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {current + 1 >= total ? "See results" : "Next question"}
          <ArrowRight
            size={17}
            className="group-hover:translate-x-0.5 transition-transform"
          />
        </button>
      )}
    </div>
  )
}
