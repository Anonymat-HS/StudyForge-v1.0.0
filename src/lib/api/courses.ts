import { supabase } from "@/lib/supabase/client"
import { retryQuery } from "./retry"
import type { Course } from "@/lib/types"

export async function fetchCourses(userId?: string): Promise<Course[]> {
  const base = supabase
    .from("courses")
    .select("id, titre, created_at")
    .order("created_at", { ascending: false })
  const query = userId ? base.eq("user_id", userId) : base
  const data = await retryQuery<Course>(query)
  return data ?? []
}

export async function fetchRecentCourses(limit = 5): Promise<Course[]> {
  const data = await retryQuery<Course>(
    supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
  )
  return data ?? []
}