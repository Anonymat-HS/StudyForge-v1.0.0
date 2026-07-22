import { useState } from "react"
import { Menu } from "lucide-react"
import { AuthProvider, useAuth } from "./lib/supabase/auth"
import Landing from "./screens/Landing"
import Login from "./screens/Login"
import Signup from "./screens/Signup"
import CompleteProfile from "./screens/CompleteProfile"
import Dashboard from "./screens/Dashboard"
import Upload from "./screens/Upload"
import Quiz from "./screens/Quiz"
import Flashcards from "./screens/Flashcards"
import Progress from "./screens/Progress"
import Sidebar from "./components/Sidebar"

export type Screen =
  | "landing"
  | "dashboard"
  | "upload"
  | "quiz"
  | "flashcards"
  | "progress"

function AppContent() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState<Screen>("landing")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authView, setAuthView] = useState<"login" | "signup">("login")

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0F0F12" }}
      >
        <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background: "#7C5CFF" }} />
      </div>
    )
  }

  if (screen === "landing") {
    return <Landing onEnter={() => setScreen("dashboard")} />
  }

  if (!user) {
    if (authView === "signup") {
      return <Signup onSwitchToLogin={() => setAuthView("login")} />
    }
    return <Login onSwitchToSignup={() => setAuthView("signup")} />
  }

  // Check if profile is complete (has full_name in metadata)
  const hasFullName = user.user_metadata?.full_name?.trim()
  if (!hasFullName) {
    return <CompleteProfile onComplete={() => {}} />
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0F0F12", color: "#EEEEF5" }}
    >
      <Sidebar
        screen={screen}
        onNavigate={setScreen}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="transition-colors duration-150"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.9)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
            }
          >
            <Menu size={20} />
          </button>
          <span className="font-black text-base">StudyForge</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {screen === "dashboard" && (
            <Dashboard onNavigate={setScreen} />
          )}
          {screen === "upload" && (
            <Upload onBack={() => setScreen("dashboard")} />
          )}
          {screen === "quiz" && (
            <Quiz onBack={() => setScreen("dashboard")} />
          )}
          {screen === "flashcards" && (
            <Flashcards onBack={() => setScreen("dashboard")} />
          )}
          {screen === "progress" && <Progress />}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
