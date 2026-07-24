import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

function truncateText(text: string, maxWords = 6000): string {
  const words = text.trim().split(/\s+/)
  if (words.length <= maxWords) return text
  const half = Math.floor(maxWords / 2)
  const firstPart = words.slice(0, half).join(" ")
  const lastPart = words.slice(-half).join(" ")
  const omitted = words.length - maxWords
  return `${firstPart}\n\n[... ${omitted} words truncated — keeping essential introduction and conclusion ...]\n\n${lastPart}`
}

async function callGroqWithRetry(prompt: string): Promise<string> {
  const groqKey = Deno.env.get("GROQ_API_KEY")
  if (!groqKey) throw new Error("GROQ_API_KEY not set")

  const MAX_ATTEMPTS = 3
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return data.choices?.[0]?.message?.content ?? ""
    }

    const errBody = await res.text()

    if (res.status === 429 && attempt < MAX_ATTEMPTS - 1) {
      const match = errBody.match(/try again in ([\d.]+)s/)
      const waitSec = match ? Math.ceil(parseFloat(match[1])) + 1 : 30
      await new Promise((r) => setTimeout(r, waitSec * 1000))
      continue
    }

    throw new Error(`Groq API error: ${res.status} - ${errBody}`)
  }

  throw new Error("Groq API error: max retries exceeded")
}

function buildPrompt(texte: string, n: number): string {
  const truncated = truncateText(texte)
  return `Tu es un générateur de quiz pédagogique. À partir du texte de cours suivant, génère ${n} questions à choix multiples (QCM).

Règles :
- Chaque question doit tester la compréhension, pas juste la mémorisation pure
- 4 options par question, une seule correcte
- Ajoute une courte explication (1-2 phrases) justifiant la bonne réponse
- Réponds UNIQUEMENT en JSON valide, sans texte avant/après, format :
[
  {
    "question": "...",
    "options": ["...", "...", "...", "..."],
    "bonne_reponse": "...",
    "explication": "..."
  }
]

Texte du cours :
${truncated}`
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get("Authorization")!
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { courseId, numberOfQuestions = 10 } = await req.json()

    if (!courseId) {
      return new Response(
        JSON.stringify({ error: "Missing courseId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("texte_extrait")
      .eq("id", courseId)
      .eq("user_id", user.id)
      .single()

    if (courseError || !course) {
      return new Response(
        JSON.stringify({ error: "Course not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const prompt = buildPrompt(course.texte_extrait, numberOfQuestions)
    const content = await callGroqWithRetry(prompt)

    const match = content.match(/\[[\s\S]*\]/)
    if (!match) throw new Error("LLM response is not a valid JSON array")

    const quizItems: Array<{
      question: string
      options: string[]
      bonne_reponse: string
      explication: string
    }> = JSON.parse(match[0])

    const rows = quizItems.map((q) => ({
      course_id: courseId,
      question: q.question,
      options: q.options,
      bonne_reponse: q.bonne_reponse,
      explication: q.explication,
    }))

    const { error: insertError } = await supabase.from("quizzes").insert(rows)
    if (insertError) throw new Error(insertError.message)

    return new Response(
      JSON.stringify({ quiz: quizItems }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    const message = (err as Error).message
    const isRateLimit = message.includes("429") || message.includes("rate limit")
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: isRateLimit ? 429 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})