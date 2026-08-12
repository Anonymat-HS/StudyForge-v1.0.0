import { supabase } from "@/lib/supabase/client"
import { retryQuery } from "./retry"
import type { FlashcardReviewCard } from "@/lib/types"

export type FlashcardRating = "again" | "hard" | "good" | "easy"

export type FlashcardLevel = "nouveau" | "difficile" | "bien" | "facile"

export async function fetchFlashcardCountsByCourses(
  courseIds: string[]
): Promise<Record<string, number>> {
  const rows = await retryQuery<{ course_id: string }>(
    supabase.from("flashcards").select("course_id").in("course_id", courseIds)
  )
  const counts: Record<string, number> = {}
  for (const r of rows ?? []) counts[r.course_id] = (counts[r.course_id] ?? 0) + 1
  return counts
}

export async function fetchCardsForCourse(
  courseId: string
): Promise<FlashcardReviewCard[]> {
  const data = await retryQuery<FlashcardReviewCard>(
    supabase
      .from("flashcards")
      .select("id, recto, verso")
      .eq("course_id", courseId)
      .order("created_at", { ascending: true })
  )
  return data ?? []
}

export async function fetchFlashcardIdsByCourseIds(
  courseIds: string[]
): Promise<{ id: string; course_id: string }[]> {
  const data = await retryQuery<{ id: string; course_id: string }>(
    supabase.from("flashcards").select("id, course_id").in("course_id", courseIds)
  )
  return data ?? []
}

const ratingToLevel: Record<FlashcardRating, FlashcardLevel> = {
  again: "nouveau",
  hard: "difficile",
  good: "bien",
  easy: "facile",
}

export async function recordFlashcardRating(
  userId: string,
  flashcardId: string,
  rating: FlashcardRating
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("flashcard_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("flashcard_id", flashcardId)
      .maybeSingle()

    const payload = {
      niveau: ratingToLevel[rating],
      last_reviewed: new Date().toISOString(),
    }

    if (existing) {
      await supabase
        .from("flashcard_progress")
        .update(payload)
        .eq("id", existing.id)
    } else {
      await supabase
        .from("flashcard_progress")
        .insert({ user_id: userId, flashcard_id: flashcardId, ...payload })
    }
  } catch {
    // Non-blocking: the review session continues even if logging fails
  }
}