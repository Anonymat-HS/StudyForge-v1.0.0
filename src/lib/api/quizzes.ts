import { supabase } from "@/lib/supabase/client"
import { retryQuery } from "./retry"
import type { QuizQuestion } from "@/lib/types"

export interface QuizCountRow {
  course_id: string
  quiz_id: string
  correct: boolean | null
  tentatives: number
  last_reviewed: string
}

export async function fetchQuizCountsByCourses(
  courseIds: string[]
): Promise<Record<string, number>> {
  const rows = await retryQuery<{ course_id: string }>(
    supabase.from("quizzes").select("course_id").in("course_id", courseIds)
  )
  const counts: Record<string, number> = {}
  for (const r of rows ?? []) counts[r.course_id] = (counts[r.course_id] ?? 0) + 1
  return counts
}

export async function fetchQuestionsForCourse(
  courseId: string
): Promise<QuizQuestion[]> {
  const data = await retryQuery<QuizQuestion>(
    supabase
      .from("quizzes")
      .select("id, question, options, bonne_reponse, explication")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true })
  )
  return data ?? []
}

export async function fetchQuizIdsByCourseIds(
  courseIds: string[]
): Promise<{ id: string; course_id: string }[]> {
  const data = await retryQuery<{ id: string; course_id: string }>(
    supabase.from("quizzes").select("id, course_id").in("course_id", courseIds)
  )
  return data ?? []
}

export async function recordQuizAnswer(
  userId: string,
  quizId: string,
  correct: boolean
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("user_progress")
      .select("id, tentatives")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .maybeSingle()

    const payload = {
      correct,
      tentatives: (existing?.tentatives ?? 0) + 1,
      last_reviewed: new Date().toISOString(),
    }

    if (existing) {
      await supabase.from("user_progress").update(payload).eq("id", existing.id)
    } else {
      await supabase
        .from("user_progress")
        .insert({ user_id: userId, quiz_id: quizId, ...payload })
    }
  } catch {
    // Non-blocking: the quiz session continues even if logging fails
  }
}