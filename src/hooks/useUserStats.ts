import { useEffect, useMemo, useState } from "react"
import {
  fetchCourses,
  fetchUserProgress,
  fetchFlashcardProgress,
  fetchQuizIdsByCourseIds,
  fetchFlashcardIdsByCourseIds,
} from "@/lib/api"
import { computeStreak } from "@/lib/utils/stats"
import type { Course, UserProgress, FlashcardProgress } from "@/lib/types"

export interface CourseStat {
  id: string
  title: string
  color: string
  quizCount: number
  flashcardCount: number
  correctCount: number
  progress: number
}

const courseColors = ["#7C5CFF", "#00D9FF", "#F59E0B", "#22C55E", "#EC4899", "#F97316"]

export function useUserStats(userId?: string) {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [progressRows, setProgressRows] = useState<UserProgress[]>([])
  const [flashRows, setFlashRows] = useState<FlashcardProgress[]>([])
  const [quizIds, setQuizIds] = useState<{ id: string; course_id: string }[]>([])
  const [flashIds, setFlashIds] = useState<{ id: string; course_id: string }[]>([])

  useEffect(() => {
    if (!userId) return
    const uid = userId
    let ignore = false

    async function load() {
      const [coursesData, progressData, flashData] = await Promise.all([
        fetchCourses(uid),
        fetchUserProgress(uid),
        fetchFlashcardProgress(uid),
      ])

      const courseIds = coursesData.map((c) => c.id)
      let quizIdData: { id: string; course_id: string }[] = []
      let flashIdData: { id: string; course_id: string }[] = []
      if (courseIds.length) {
        ;[quizIdData, flashIdData] = await Promise.all([
          fetchQuizIdsByCourseIds(courseIds),
          fetchFlashcardIdsByCourseIds(courseIds),
        ])
      }

      if (ignore) return
      setCourses(coursesData)
      setProgressRows(progressData)
      setFlashRows(flashData)
      setQuizIds(quizIdData)
      setFlashIds(flashIdData)
      setLoading(false)
    }

    load()
    return () => {
      ignore = true
    }
  }, [userId])

  return useMemo(() => {
    const answered = progressRows.filter((r) => r.correct !== null)
    const answeredCount = answered.length
    const correctCount = answered.filter((r) => r.correct).length

    const quizByCourse: Record<string, { id: string }[]> = {}
    for (const q of quizIds) {
      if (!quizByCourse[q.course_id]) quizByCourse[q.course_id] = []
      quizByCourse[q.course_id].push(q)
    }
    const flashByCourse: Record<string, { id: string }[]> = {}
    for (const f of flashIds) {
      if (!flashByCourse[f.course_id]) flashByCourse[f.course_id] = []
      flashByCourse[f.course_id].push(f)
    }

    const lastCorrect: Record<string, boolean> = {}
    for (const p of progressRows) {
      if (p.correct !== null) lastCorrect[p.quiz_id] = p.correct
    }

    const breakdown: CourseStat[] = courses.map((c, i) => {
      const cQuizzes = quizByCourse[c.id] || []
      const correct = cQuizzes.filter((q) => lastCorrect[q.id] === true).length
      return {
        id: c.id,
        title: c.titre,
        color: courseColors[i % courseColors.length],
        quizCount: cQuizzes.length,
        flashcardCount: (flashByCourse[c.id] || []).length,
        correctCount: correct,
        progress: cQuizzes.length ? Math.round((correct / cQuizzes.length) * 100) : 0,
      }
    })

    return {
      loading,
      courses,
      progressRows,
      flashRows,
      breakdown,
      answeredCount,
      correctCount,
      flashcardsReviewed: flashRows.length,
      avgScore: answeredCount
        ? Math.round((correctCount / answeredCount) * 100)
        : 0,
      streak: computeStreak(progressRows, flashRows),
    }
  }, [loading, courses, progressRows, flashRows, quizIds, flashIds])
}