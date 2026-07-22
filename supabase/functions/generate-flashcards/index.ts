import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { courseId, numberOfCards = 15 } = await req.json()

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

    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    const groqKey = Deno.env.get("GROQ_API_KEY")
    if (!groqKey) throw new Error("GROQ_API_KEY not set")

    const prompt = `Tu es un générateur de flashcards de révision. À partir du texte de cours suivant, génère ${numberOfCards} flashcards (recto = question/concept court, verso = réponse/définition claire).

Règles :
- Recto court et précis (une question ou un terme clé)
- Verso concis mais complet (pas de blabla)
- Réponds UNIQUEMENT en JSON valide, sans texte avant/après, format :
[
  { "recto": "...", "verso": "..." }
]

Texte du cours :
${course.texte_extrait}`

    const llmRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    })

    if (!llmRes.ok) {
      const err = await llmRes.text()
      throw new Error(`Groq API error: ${llmRes.status} - ${err}`)
    }

    const llmData = await llmRes.json()
    const content: string = llmData.choices?.[0]?.message?.content ?? ""

    const match = content.match(/\[[\s\S]*\]/)
    if (!match) throw new Error("LLM response is not a valid JSON array")

    const flashcards = JSON.parse(match[0])

    const { error: insertError } = await supabase
      .from("flashcards")
      .insert(
        flashcards.map((fc: { recto: string; verso: string }) => ({
          course_id: courseId,
          user_id: user.id,
          recto: fc.recto,
          verso: fc.verso,
        }))
      )

    if (insertError) throw new Error(insertError.message)

    return new Response(
      JSON.stringify({ flashcards }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
