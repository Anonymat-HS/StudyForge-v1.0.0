import { useState, useRef, useCallback } from "react"
import {
  Upload as UploadIcon,
  FileText,
  Sparkles,
  CheckCircle,
  ChevronLeft,
} from "lucide-react"

type UploadState = "idle" | "dragover" | "processing" | "done"

export default function Upload({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [filename, setFilename] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const startProcessing = useCallback((name: string) => {
    setFilename(name)
    setState("processing")
    setProgress(0)

    let p = 0
    const interval = setInterval(() => {
      p += Math.random() * 14 + 3
      if (p >= 100) {
        p = 100
        clearInterval(interval)
        setTimeout(() => setState("done"), 300)
      }
      setProgress(Math.min(p, 100))
    }, 380)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) startProcessing(file.name)
    },
    [startProcessing]
  )

  const processingSteps = [
    { label: "Parsing document structure", threshold: 18 },
    { label: "Extracting key concepts and terms", threshold: 42 },
    { label: "Generating quiz questions", threshold: 66 },
    { label: "Creating flashcard deck", threshold: 88 },
  ]

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
        Back to Dashboard
      </button>

      <h1 className="text-2xl md:text-3xl font-black text-white mb-1.5">
        Upload Course Material
      </h1>
      <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.38)" }}>
        Our AI generates quizzes and flashcards automatically from your notes
      </p>

      {(state === "idle" || state === "dragover") && (
        <>
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setState("dragover")
            }}
            onDragLeave={() => setState("idle")}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-2xl p-8 sm:p-14 text-center transition-all duration-200"
            style={{
              border: `2px dashed ${state === "dragover" ? "rgba(124,92,255,0.6)" : "rgba(255,255,255,0.12)"}`,
              background:
                state === "dragover"
                  ? "rgba(124,92,255,0.08)"
                  : "rgba(255,255,255,0.02)",
            }}
            onMouseEnter={(e) => {
              if (state === "idle") {
                e.currentTarget.style.borderColor = "rgba(124,92,255,0.4)"
                e.currentTarget.style.background = "rgba(124,92,255,0.04)"
              }
            }}
            onMouseLeave={(e) => {
              if (state === "idle") {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
                e.currentTarget.style.background = "rgba(255,255,255,0.02)"
              }
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(124,92,255,0.12)",
                  border: "1px solid rgba(124,92,255,0.22)",
                }}
              >
                <UploadIcon size={26} style={{ color: "#A78BFA" }} />
              </div>
              <div>
                <p className="font-bold text-lg text-white">
                  {state === "dragover"
                    ? "Drop it here!"
                    : "Drop your file here"}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  or{" "}
                  <span style={{ color: "#A78BFA" }}>click to browse</span>{" "}
                  your files
                </p>
              </div>
              <div className="flex gap-2 mt-1">
                {["PDF", "DOCX", "TXT", "MD"].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-1 text-xs rounded-lg font-mono"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {fmt}
                  </span>
                ))}
              </div>
              <p
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.22)" }}
              >
                Max 50 MB
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) startProcessing(f.name)
              }}
            />
          </div>

          {/* Recent uploads */}
          <div className="mt-8">
            <p
              className="text-xs font-semibold mb-3 tracking-wider"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              RECENT UPLOADS
            </p>
            {[
              {
                name: "Algorithms_Lecture_Notes_Ch1-4.pdf",
                size: "2.4 MB",
                questions: 42,
                cards: 65,
              },
              {
                name: "OrganicChem_Chapter3-6.pdf",
                size: "5.1 MB",
                questions: 89,
                cards: 120,
              },
            ].map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-150 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.7)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <FileText
                  size={15}
                  className="shrink-0"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {file.size} · {file.questions} questions · {file.cards}{" "}
                    flashcards
                  </p>
                </div>
                <span
                  className="text-xs font-semibold shrink-0"
                  style={{ color: "#4ADE80" }}
                >
                  Processed
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {state === "processing" && (
        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(124,92,255,0.06)",
            border: "1px solid rgba(124,92,255,0.2)",
          }}
        >
          <div className="flex items-center gap-3 mb-7">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(124,92,255,0.18)",
                border: "1px solid rgba(124,92,255,0.3)",
              }}
            >
              <Sparkles size={17} style={{ color: "#A78BFA" }} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white">
                AI is analysing your material…
              </p>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {filename}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "rgba(255,255,255,0.4)" }}>
                Processing
              </span>
              <span className="font-bold" style={{ color: "#C4B5FD" }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #7C5CFF, #00D9FF)",
                  transition: "width 0.35s ease-out",
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {processingSteps.map(({ label, threshold }) => {
              const done = progress >= threshold
              return (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background: done
                        ? "#22C55E"
                        : "transparent",
                      border: done
                        ? "1px solid #22C55E"
                        : "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {done && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4L3.5 6L6.5 2"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm transition-colors duration-300"
                    style={{
                      color: done
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(255,255,255,0.28)",
                    }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {state === "done" && (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.2)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "rgba(34,197,94,0.14)",
              border: "1px solid rgba(34,197,94,0.28)",
            }}
          >
            <CheckCircle size={26} style={{ color: "#4ADE80" }} />
          </div>
          <h3 className="text-xl font-black text-white mb-1.5">
            Study materials ready!
          </h3>
          <p
            className="text-sm mb-7 truncate max-w-xs mx-auto"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {filename}
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-[240px] mx-auto mb-7">
            <div
              className="p-4 rounded-xl text-center"
              style={{
                background: "rgba(124,92,255,0.1)",
                border: "1px solid rgba(124,92,255,0.2)",
              }}
            >
              <p className="text-2xl font-black" style={{ color: "#A78BFA" }}>
                42
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Quiz questions
              </p>
            </div>
            <div
              className="p-4 rounded-xl text-center"
              style={{
                background: "rgba(0,217,255,0.08)",
                border: "1px solid rgba(0,217,255,0.18)",
              }}
            >
              <p className="text-2xl font-black" style={{ color: "#00D9FF" }}>
                65
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Flashcards
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: "#7C5CFF" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#8B6BFF")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#7C5CFF")
              }
            >
              Start quiz
            </button>
            <button
              onClick={() => {
                setState("idle")
                setProgress(0)
                setFilename("")
              }}
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
              Upload another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
