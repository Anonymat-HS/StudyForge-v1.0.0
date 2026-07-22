import { Upload, Brain, CreditCard, Clock, Flame, ArrowRight, Quote } from "lucide-react"
import { courses } from "../data"
import { getRandomQuote } from "../data/quotes"
import type { Screen } from "../App"
import { useState } from "react"

export default function Dashboard({
  onNavigate,
}: {
  onNavigate: (s: Screen) => void
}) {
  const [quote] = useState(() => getRandomQuote())
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Good morning, Alex 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
            Tuesday, 22 July 2025
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.22)",
            color: "#FCD34D",
          }}
        >
          <Flame size={15} />
          14-day streak
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Courses", value: "4", sub: "2 in progress", color: "#7C5CFF" },
          { label: "Quizzes taken", value: "247", sub: "+12 this week", color: "#00D9FF" },
          { label: "Flashcards", value: "1,840", sub: "reviewed total", color: "#F59E0B" },
          { label: "Avg. score", value: "84%", sub: "+6% vs last month", color: "#22C55E" },
        ].map(({ label, value, sub, color }) => (
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
            <p
              className="text-[11px] mt-1"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              {sub}
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
        {[
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

      {/* Recent courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Recent Courses</h2>
          <button
            className="flex items-center gap-1 text-xs transition-colors duration-150"
            style={{ color: "#7C5CFF" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "#A78BFA")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "#7C5CFF")
            }
          >
            View all
            <ArrowRight size={12} />
          </button>
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
                      background: course.color + "1A",
                      border: `1px solid ${course.color}2E`,
                    }}
                  >
                    {course.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-white">
                      {course.title}
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                    >
                      {course.subject}
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 text-xs shrink-0"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  <Clock size={10} />
                  {course.lastStudied}
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "rgba(255,255,255,0.38)" }}>
                    Progress
                  </span>
                  <span className="font-semibold" style={{ color: course.color }}>
                    {course.progress}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${course.progress}%`,
                      background: `linear-gradient(90deg, ${course.color}88, ${course.color})`,
                      transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              </div>

              <div
                className="flex items-center gap-4 text-xs"
                style={{ color: "rgba(255,255,255,0.28)" }}
              >
                <span>{course.totalQuestions} questions</span>
                <span>·</span>
                <span>{course.flashcards} flashcards</span>
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
            Introduction to Algorithms · Chapter 4: Trees and Graphs
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
