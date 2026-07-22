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
import { scoreHistory, courseStats, courses } from "../data"

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

export default function Progress() {
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
            value: "14",
            icon: Flame,
            color: "#FCD34D",
            sub: "Personal best: 21",
          },
          {
            label: "Quizzes taken",
            value: "247",
            icon: Brain,
            color: "#A78BFA",
            sub: "34 this month",
          },
          {
            label: "Avg score",
            value: "84%",
            icon: Target,
            color: "#4ADE80",
            sub: "+6% vs last month",
          },
          {
            label: "Mastered",
            value: "1",
            icon: TrendingUp,
            color: "#00D9FF",
            sub: "3 in progress",
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
              domain={[50, 100]}
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

      {/* Two-col lower section */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Bar chart */}
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

        {/* Course breakdown */}
        <div
          className="p-6 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <h2 className="font-bold text-white mb-5">Course Breakdown</h2>
          <div className="space-y-5">
            {courses.map((c) => (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{c.emoji}</span>
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
                        {c.totalQuestions} questions
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
        </div>
      </div>

      {/* Weekly activity grid */}
      <div
        className="mt-5 p-6 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <h2 className="font-bold text-white mb-5">Weekly Activity</h2>
        <div className="overflow-x-auto pb-2 -mx-2 px-2">
          <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 52 }, (_, week) =>
            Array.from({ length: 7 }, (_, day) => {
              const activity = Math.random()
              const opacity =
                activity > 0.7
                  ? 0.9
                  : activity > 0.5
                  ? 0.55
                  : activity > 0.3
                  ? 0.28
                  : 0.07
              return (
                <div
                  key={`${week}-${day}`}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: `rgba(124,92,255,${opacity})`,
                  }}
                  title={`${activity > 0.3 ? Math.round(activity * 12) : 0} quizzes`}
                />
              )
            })
          )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Less
          </span>
          {[0.07, 0.28, 0.55, 0.9].map((o) => (
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
    </div>
  )
}
