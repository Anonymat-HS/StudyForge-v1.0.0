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

    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
    const groqKey = Deno.env.get("GROQ_API_KEY")
    if (!groqKey) throw new Error("GROQ_API_KEY not set")

    const prompt = `Tu es un générateur de quiz pédagogique. À partir du texte de cours suivant, génère ${numberOfQuestions} questions à choix multiples (QCM).

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

    const quizItems = JSON.parse(match[0])

    const { error: insertError } = await supabase
      .from("quizzes")
      .insert({
        course_id: courseId,
        user_id: user.id,
        questions: quizItems,
      })

    if (insertError) throw new Error(insertError.message)

    return new Response(
      JSON.stringify({ quiz: quizItems }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
