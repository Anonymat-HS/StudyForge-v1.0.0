export interface QueryLike {
  then(onfulfilled: (value: { data: unknown; error: unknown }) => unknown): unknown
}

export async function retryQuery<T>(
  query: QueryLike,
  attempts = 3
): Promise<T[] | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const res = (await query.then((v) => v)) as { data: T[] | null; error: unknown }
    if (!res.error) return res.data
    if (attempt < attempts - 1) {
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)))
    }
  }
  return null
}