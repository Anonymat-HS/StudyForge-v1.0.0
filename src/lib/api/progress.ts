import { supabase } from "@/lib/supabase/client"
import { retryQuery } from "./retry"
import type { UserProgress, FlashcardProgress } from "@/lib/types"

export async function fetchUserProgress(userId: string): Promise<UserProgress[]> {
  const data = await retryQuery<UserProgress>(
    supabase
      .from("user_progress")
      .select("id, quiz_id, correct, tentatives, last_reviewed")
      .eq("user_id", userId)
  )
  return data ?? []
}

export async function fetchFlashcardProgress(
  userId: string
): Promise<FlashcardProgress[]> {
  const data = await retryQuery<FlashcardProgress>(
    supabase
      .from("flashcard_progress")
      .select("id, flashcard_id, niveau, last_reviewed, next_review")
      .eq("user_id", userId)
  )
  return data ?? []
}